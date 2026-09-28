import { useState, type ImgHTMLAttributes } from 'react'
import { uploadVariantSrcSet } from '../lib/image-variants'

interface UploadImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'onError'> {
  // Готовый адрес картинки (после getImageUrl).
  src: string
  // Ширина картинки на странице, как в атрибуте sizes: по ней браузер выбирает копию.
  sizes: string
  // Не загрузился и оригинал — показать заглушку.
  onFailed?: () => void
}

// Картинка из /uploads: браузер берёт уменьшенную WebP-копию под размер на странице,
// а если копия не пришла (старый браузер, API без копий) — оригинал, как раньше.
export function UploadImg({ src, sizes, onFailed, alt, ...props }: UploadImgProps) {
  const [variantFailedFor, setVariantFailedFor] = useState<string>()
  const srcSet = variantFailedFor === src ? undefined : uploadVariantSrcSet(src)

  const handleError = () => {
    if (srcSet) setVariantFailedFor(src)
    else onFailed?.()
  }
  // Ошибка загрузки до гидратации не доходит до onError — проверяем картинку при подключении.
  const checkLoaded = (node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth === 0) handleError()
  }

  const img = <img src={src} alt={alt} ref={checkLoaded} onError={handleError} {...props} />
  if (!srcSet) return img
  return (
    <picture className="contents">
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      {img}
    </picture>
  )
}
