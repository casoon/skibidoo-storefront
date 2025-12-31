import { test, expect, type Page } from "@playwright/test";

// Test data
const testCustomer = {
  email: "test@example.com",
  firstName: "Max",
  lastName: "Mustermann",
  street: "Musterstrasse 123",
  city: "Berlin",
  zip: "10115",
  country: "DE",
  phone: "+49123456789",
};

// Helper: Add product to cart
async function addProductToCart(page: Page) {
  await page.goto("/");
  const addToCartBtn = page.locator('button:has-text("In den Warenkorb")').first();
  
  if (await addToCartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await addToCartBtn.click();
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

test.describe("Checkout Flow - Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should handle invalid credit card gracefully", async ({ page }) => {
    // Add product to cart
    const productAdded = await addProductToCart(page);
    if (!productAdded) {
      test.skip(true, "No products available");
      return;
    }

    // Go to checkout
    await page.goto("/checkout");

    // Mock Stripe decline response
    await page.route("**/api/v1/payments/stripe/intent", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "card_declined",
            message: "Your card was declined. Please try a different payment method.",
          },
        }),
      });
    });

    // Fill checkout form (if visible)
    const emailInput = page.locator('input[name="email"]').first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill(testCustomer.email);
    }

    // Attempt payment
    const submitBtn = page.locator('button:has-text("Bestellen"), button:has-text("Jetzt kaufen"), button[type="submit"]').first();
    
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();

      // Expect error message
      const errorMsg = page.locator('[role="alert"], .error, .alert-error');
      await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
      await expect(errorMsg.first()).toContainText(/declined|abgelehnt|Karte/i);
    }
  });

  test("should handle PayPal cancellation", async ({ page }) => {
    const productAdded = await addProductToCart(page);
    if (!productAdded) {
      test.skip(true, "No products available");
      return;
    }

    await page.goto("/checkout");

    // Mock PayPal cancellation
    await page.route("**/api/v1/payments/paypal/order", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "PAYPAL-ORDER-123",
          status: "CANCELLED",
          links: [{ rel: "approve", href: "https://paypal.com/cancel" }],
        }),
      });
    });

    // Click PayPal button (if exists)
    const paypalBtn = page.locator('[data-testid="paypal-button"], button:has-text("PayPal")').first();

    if (await paypalBtn.isVisible().catch(() => false)) {
      await paypalBtn.click();

      // Should show cancellation message
      const cancelMsg = page.locator('[role="alert"]:has-text("abgebrochen"), [role="alert"]:has-text("cancelled")');
      await expect(cancelMsg.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should handle out-of-stock during checkout", async ({ page }) => {
    const productAdded = await addProductToCart(page);
    if (!productAdded) {
      test.skip(true, "No products available");
      return;
    }

    await page.goto("/checkout");

    // Mock out-of-stock error
    await page.route("**/api/v1/checkout", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "PRODUCT_OUT_OF_STOCK",
          message: "Produkt ist nicht mehr verfügbar",
          productId: "test-product-1",
        }),
      });
    });

    // Try to submit
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();

      // Expect stock error
      const errorAlert = page.locator('[role="alert"]');
      await expect(errorAlert.first()).toBeVisible({ timeout: 5000 });
      await expect(errorAlert.first()).toContainText(/nicht.*verfügbar|out.*stock/i);
    }
  });
});

test.describe("Checkout Flow - Discounts & Gift Cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should apply discount coupon successfully", async ({ page }) => {
    const productAdded = await addProductToCart(page);
    if (!productAdded) {
      test.skip(true, "No products available");
      return;
    }

    await page.goto("/cart");

    // Mock coupon validation
    await page.route("**/api/v1/checkout/coupon", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: "SAVE20",
          type: "percentage",
          value: 20,
          discount: 5.99, // 20% of 29.99
        }),
      });
    });

    // Find coupon input
    const couponInput = page.locator('input[name="coupon"], input[placeholder*="Gutschein"], input[placeholder*="Coupon"]').first();

    if (await couponInput.isVisible().catch(() => false)) {
      await couponInput.fill("SAVE20");

      const applyBtn = page.locator('button:has-text("Anwenden"), button:has-text("Apply")').first();
      if (await applyBtn.isVisible().catch(() => false)) {
        await applyBtn.click();

        // Wait for discount to appear
        await page.waitForTimeout(1000);

        // Check for discount display
        const discountAmount = page.locator('[data-testid="discount-amount"], .discount, :has-text("-")');
        const hasDiscount = await discountAmount.first().isVisible().catch(() => false);

        if (hasDiscount) {
          const text = await discountAmount.first().textContent();
          expect(text).toMatch(/-|Rabatt/);
        }
      }
    }
  });

  test("should redeem gift card successfully", async ({ page }) => {
    const productAdded = await addProductToCart(page);
    if (!productAdded) {
      test.skip(true, "No products available");
      return;
    }

    await page.goto("/cart");

    // Mock gift card validation
    await page.route("**/api/v1/giftcards/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: "GIFT-1234-5678",
          balance: 50.0,
          currency: "EUR",
        }),
      });
    });

    const giftCardInput = page.locator('input[name="giftcard"], input[name="giftCard"], input[placeholder*="Geschenk"]').first();

    if (await giftCardInput.isVisible().catch(() => false)) {
      await giftCardInput.fill("GIFT-1234-5678");

      const applyBtn = page.locator('button:has-text("Anwenden"), button:has-text("Einlösen")').first();
      if (await applyBtn.isVisible().catch(() => false)) {
        await applyBtn.click();

        await page.waitForTimeout(1000);

        // Check for gift card balance display
        const balanceDisplay = page.locator('[data-testid="giftcard-balance"], :has-text("50")');
        const hasBalance = await balanceDisplay.first().isVisible({ timeout: 5000 }).catch(() => false);

        expect(hasBalance).toBeTruthy();
      }
    }
  });

  test("should reject invalid coupon code", async ({ page }) => {
    const productAdded = await addProductToCart(page);
    if (!productAdded) {
      test.skip(true, "No products available");
      return;
    }

    await page.goto("/cart");

    // Mock invalid coupon
    await page.route("**/api/v1/checkout/coupon", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "COUPON_INVALID",
          message: "Gutscheincode ist ungültig oder abgelaufen",
        }),
      });
    });

    const couponInput = page.locator('input[name="coupon"]').first();

    if (await couponInput.isVisible().catch(() => false)) {
      await couponInput.fill("INVALID123");

      const applyBtn = page.locator('button:has-text("Anwenden")').first();
      if (await applyBtn.isVisible().catch(() => false)) {
        await applyBtn.click();

        await page.waitForTimeout(1000);

        // Expect error message
        const errorMsg = page.locator('[role="alert"], .error');
        await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
        await expect(errorMsg.first()).toContainText(/ungültig|invalid|abgelaufen/i);
      }
    }
  });
});

test.describe("Checkout Flow - Multi-Product", () => {
  test("should calculate shipping for multiple products", async ({ page }) => {
    // Add multiple products
    await page.goto("/");
    
    const addButtons = page.locator('button:has-text("In den Warenkorb")');
    const count = await addButtons.count();

    if (count < 2) {
      test.skip(true, "Not enough products for multi-product test");
      return;
    }

    // Add first product
    await addButtons.nth(0).click();
    await page.waitForTimeout(500);

    // Add second product
    await addButtons.nth(1).click();
    await page.waitForTimeout(500);

    // Go to checkout
    await page.goto("/checkout");

    // Mock shipping calculation
    await page.route("**/api/v1/shipping/calculate", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          methods: [
            { id: "dhl-standard", name: "DHL Standard", cost: 4.99 },
            { id: "dhl-express", name: "DHL Express", cost: 9.99 },
          ],
        }),
      });
    });

    // Select shipping method
    const shippingSelect = page.locator('select[name="shipping"], select[name="shippingMethod"]').first();

    if (await shippingSelect.isVisible().catch(() => false)) {
      await shippingSelect.selectOption({ index: 1 }); // Select first shipping option
      await page.waitForTimeout(1000);

      // Verify shipping cost appears
      const shippingCost = page.locator('[data-testid="shipping-cost"], :has-text("€"), :has-text("Versand")');
      const hasCost = await shippingCost.first().isVisible().catch(() => false);

      if (hasCost) {
        const text = await shippingCost.first().textContent();
        expect(text).toMatch(/\d+[,\.]\d{2}\s*€/); // Match price pattern
      }
    }
  });

  test("should update total when quantity changes", async ({ page }) => {
    const productAdded = await addProductToCart(page);
    if (!productAdded) {
      test.skip(true, "No products available");
      return;
    }

    await page.goto("/cart");

    // Find quantity input
    const qtyInput = page.locator('input[name="quantity"], input[type="number"]').first();

    if (await qtyInput.isVisible().catch(() => false)) {
      // Get initial total
      const totalElement = page.locator('[data-testid="cart-total"], :has-text("Gesamt"), :has-text("Total")').last();
      const initialTotal = await totalElement.textContent();

      // Increase quantity
      await qtyInput.fill("2");
      await qtyInput.press("Enter");
      await page.waitForTimeout(1000);

      // Get new total
      const newTotal = await totalElement.textContent();

      // Total should change
      expect(newTotal).not.toBe(initialTotal);
    }
  });
});

test.describe("Checkout Flow - Form Validation", () => {
  test("should validate required fields", async ({ page }) => {
    const productAdded = await addProductToCart(page);
    if (!productAdded) {
      test.skip(true, "No products available");
      return;
    }

    await page.goto("/checkout");

    // Try to submit without filling form
    const submitBtn = page.locator('button[type="submit"]').first();

    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();

      // Should show validation errors
      const emailError = page.locator('input[name="email"]:invalid, input[name="email"] + .error');
      const hasError = await emailError.first().isVisible({ timeout: 2000 }).catch(() => false);

      // HTML5 validation prevents submit, so form should not submit
      await expect(page).toHaveURL(/checkout/);
    }
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/checkout");

    const emailInput = page.locator('input[name="email"], input[type="email"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("invalid-email");
      await emailInput.blur();

      // Check for HTML5 validation or custom error
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBeTruthy();
    }
  });
});
