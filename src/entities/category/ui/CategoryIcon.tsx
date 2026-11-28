import { FiPackage } from 'react-icons/fi'

// Tile order in /category-icons.png. The lower four rows are for dark surfaces.
const categoryIconSlugs = [
  'zheleznodorozhnye-relsy',
  'kranovye-relsy',
  'zhd-shpaly',
  'zhd-krepezh',
  'izolyatsiya-rels',
  'prokladki-amortizatsionnye-zhd-rels',
  'relsovoe-skreplenie-zhbr-ars',
  'stykovye-zhd-nakladki',
  'zhd-podkladki',
  'kreplenie-kranovyh-relsov',
  'tupikovye-upory',
  'bashmaki-tormoznye',
  'strelochnye-perevody',
  'mostovoe-polotno',
  'zheleznodorozhnye-pereezdy',
  'zvenya-relsoshpalnoj-reshetki',
  'putevoj-instrument',
  'zheleznodorozhnye-znaki',
  'starogodnye-materialy-vsp',
  'vagonnye-zapchasti',
]

const columns = 5
const rowsPerTheme = Math.ceil(categoryIconSlugs.length / columns)
const rows = rowsPerTheme * 2
const iconClassName = 'size-6 shrink-0'

export function CategoryIcon({ slug, dark = false }: { slug: string; dark?: boolean }) {
  const index = categoryIconSlugs.indexOf(slug)

  if (index === -1) {
    return <FiPackage aria-hidden="true" className={`${iconClassName} ${dark ? 'text-accent' : 'text-primary'}`} />
  }

  const column = index % columns
  const row = Math.floor(index / columns) + (dark ? rowsPerTheme : 0)

  return (
    <span
      aria-hidden="true"
      className={`${iconClassName} inline-block bg-no-repeat`}
      style={{
        backgroundImage: 'url(/category-icons.png)',
        backgroundSize: `${columns * 100}% ${rows * 100}%`,
        backgroundPosition: `${column * 100 / (columns - 1)}% ${row * 100 / (rows - 1)}%`,
      }}
    />
  )
}
