// Уменьшенные WebP-копии картинок из /uploads отдаёт API: /uploads/w/<ширина>/<файл>.webp
// (railways-catalog-api, src/file/image-variants.ts). Ширины должны совпадать с его списком —
// на другие API ответит 404.
export const IMAGE_VARIANT_WIDTHS = [160, 320, 480, 640, 960, 1280] as const

const UPLOAD_URL = /^(.*)\/uploads\/([a-z0-9][a-z0-9._-]*\.(?:jpe?g|png|webp))$/i

// url — уже готовый адрес картинки (после getImageUrl): «/uploads/x.jpg» или
// «https://traer.ru/uploads/x.jpg». Для чужих адресов и форматов копий нет — undefined.
export function uploadVariantSrcSet(url: string): string | undefined {
  const match = UPLOAD_URL.exec(url)
  if (!match) return undefined
  const [, origin, name] = match
  return IMAGE_VARIANT_WIDTHS.map((width) => `${origin}/uploads/w/${width}/${name}.webp ${width}w`).join(', ')
}
