import { describe, it, expect } from "vitest";
import { formatPrice, formatBasePrice, formatDeliveryTime } from "../format";

describe("formatPrice", () => {
  it("should format cents to EUR currency", () => {
    const result = formatPrice(1000);
    expect(result).toContain("10");
    expect(result).toContain("00");
    expect(result).toMatch(/€/);
  });

  it("should handle zero", () => {
    const result = formatPrice(0);
    expect(result).toContain("0");
    expect(result).toMatch(/€/);
  });

  it("should handle large amounts", () => {
    const result = formatPrice(100000);
    expect(result).toContain("1");
    expect(result).toContain("000");
    expect(result).toMatch(/€/);
  });

  it("should handle negative amounts", () => {
    const result = formatPrice(-500);
    expect(result).toContain("5");
  });

  it("should return a string", () => {
    expect(typeof formatPrice(1000)).toBe("string");
    expect(typeof formatPrice(0)).toBe("string");
    expect(typeof formatPrice(-100)).toBe("string");
  });
});

describe("formatBasePrice", () => {
  it("should format base price with g unit", () => {
    const result = formatBasePrice({
      quantity: 500,
      unit: "g",
      referenceQuantity: 1,
      pricePerUnit: 1990,
    });
    expect(result).toContain("19");
    expect(result).toContain("90");
    expect(result).toContain("g");
  });

  it("should format base price with liter unit", () => {
    const result = formatBasePrice({
      quantity: 1,
      unit: "l",
      referenceQuantity: 1,
      pricePerUnit: 299,
    });
    expect(result).toContain("2");
    expect(result).toContain("99");
    expect(result).toContain("l");
  });

  it("should format base price with piece unit", () => {
    const result = formatBasePrice({
      quantity: 10,
      unit: "piece",
      referenceQuantity: 1,
      pricePerUnit: 199,
    });
    expect(result).toContain("1");
    expect(result).toContain("99");
    expect(result).toMatch(/Stück|piece/i);
  });

  it("should handle unknown units", () => {
    const result = formatBasePrice({
      quantity: 1,
      unit: "custom",
      referenceQuantity: 100,
      pricePerUnit: 500,
    });
    expect(result).toContain("5");
    expect(result).toContain("00");
    expect(result).toContain("100");
    expect(result).toContain("custom");
  });

  it("should include reference quantity", () => {
    const result = formatBasePrice({
      quantity: 1,
      unit: "kg",
      referenceQuantity: 1,
      pricePerUnit: 999,
    });
    expect(result).toContain("1");
    expect(result).toContain("kg");
  });
});

describe("formatDeliveryTime", () => {
  it("should return the delivery time name", () => {
    const result = formatDeliveryTime({
      name: "2-3 Werktage",
      minDays: 2,
      maxDays: 3,
    });
    expect(result).toBe("2-3 Werktage");
  });

  it("should handle express delivery", () => {
    const result = formatDeliveryTime({
      name: "Expresslieferung",
      minDays: 1,
      maxDays: 1,
    });
    expect(result).toBe("Expresslieferung");
  });

  it("should return exact name provided", () => {
    const name = "Custom Delivery";
    const result = formatDeliveryTime({
      name,
      minDays: 5,
      maxDays: 7,
    });
    expect(result).toBe(name);
  });
});
