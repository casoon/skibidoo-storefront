export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatBasePrice(basePrice: {
  quantity: number;
  unit: string;
  referenceQuantity: number;
  pricePerUnit: number;
}): string {
  const unitLabels: Record<string, string> = {
    kg: "kg",
    g: "g",
    l: "l",
    ml: "ml",
    m: "m",
    cm: "cm",
    piece: "Stück",
  };
  const unit = unitLabels[basePrice.unit] || basePrice.unit;
  const price = formatPrice(basePrice.pricePerUnit);
  return `${price} / ${basePrice.referenceQuantity} ${unit}`;
}

export function formatDeliveryTime(deliveryTime: { name: string; minDays: number; maxDays: number }): string {
  return deliveryTime.name;
}
