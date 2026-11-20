const GROUPS = [
  { id: 'rails', name: 'Рельсы, шпалы и брус', slugs: ['zheleznodorozhnye-relsy', 'kranovye-relsy', 'zhd-shpaly'] },
  { id: 'fasteners', name: 'Крепёж и скрепления', slugs: ['zhd-krepezh', 'izolyatsiya-rels', 'prokladki-amortizatsionnye-zhd-rels', 'relsovoe-skreplenie-zhbr-ars', 'stykovye-zhd-nakladki', 'zhd-podkladki', 'kreplenie-kranovyh-relsov'] },
  { id: 'track', name: 'Переводы и обустройство пути', slugs: ['tupikovye-upory', 'bashmaki-tormoznye', 'strelochnye-perevody', 'mostovoe-polotno', 'zheleznodorozhnye-pereezdy', 'zvenya-relsoshpalnoj-reshetki'] },
  { id: 'tools', name: 'Инструмент и знаки', slugs: ['putevoj-instrument', 'zheleznodorozhnye-znaki'] },
  { id: 'used', name: 'Старогодные материалы', slugs: ['starogodnye-materialy-vsp'] },
  { id: 'other', name: 'Вагонные запчасти и прочее', slugs: ['vagonnye-zapchasti'] },
]

/** Только группировка навигации: исходный порядок и адрес каждого раздела сохранены. */
export function groupCategories<T extends { slug: string }>(categories: T[]) {
  return GROUPS.map(group => ({ ...group, categories: categories.filter(category =>
    group.id === 'other'
      ? !GROUPS.some(other => other.id !== 'other' && other.slugs.includes(category.slug))
      : group.slugs.includes(category.slug),
  ) })).filter(group => group.categories.length)
}
