export const R65_OFFERS = [
  { slug: 'relsy-zheleznodorozhnye-r-65', categorySlug: 'zheleznodorozhnye-relsy', subcategorySlug: 'magistralnye-relsy', label: 'Новый', condition: 'new' },
  { slug: 'rels-r65-starogodnyj', categorySlug: 'starogodnye-materialy-vsp', subcategorySlug: 'starogodnye-relsy', label: 'Б/у (старогодный)', condition: 'used' },
] as const

/** Отдельные предложения уже существуют в каталоге; цена и остаток у каждого свои. */
export function isR65Offer(slug: string) {
  return R65_OFFERS.some(offer => offer.slug === slug)
}

/** Поле condition определяет состояние предложения, а не старый общий текст описания. */
export function normalizeR65Offer<T extends { slug: string; condition: string; description?: string; specs?: { label: string; value: string | number }[] }>(product: T): T {
  if (!isR65Offer(product.slug)) return product
  const condition = product.condition === 'used' ? 'б/у (старогодный)' : 'новый'
  return {
    ...product,
    description: product.description?.replace(/(состояние\s*[—–:-]\s*)новые,\s*б\/у/gi, `$1${condition}`),
    specs: product.specs?.map(spec => /^состояние$/i.test(spec.label.trim()) ? { ...spec, value: condition } : spec),
  }
}
