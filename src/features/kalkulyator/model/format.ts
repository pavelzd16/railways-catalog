/** Число из поля ввода: принимает запятую и пробелы-разделители. NaN — если не число. */
export function chislo(value: string): number {
  const cleaned = value.replace(/\s/g, '').replace(',', '.')
  return cleaned === '' ? NaN : Number(cleaned)
}

export function fmt(value: number, digits = 3): string {
  return value.toLocaleString('ru-RU', { maximumFractionDigits: digits })
}
