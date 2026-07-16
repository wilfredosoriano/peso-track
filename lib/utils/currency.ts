const formatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export function formatCurrency(value: number): string {
  return formatter.format(value);
}
