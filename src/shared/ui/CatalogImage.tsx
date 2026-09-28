import { useState } from 'react'
import { FiPackage } from 'react-icons/fi'
import { getImageUrl } from '@/shared/lib/product-helpers'
import { UploadImg } from './UploadImg'

export function CatalogImage({
  src,
  alt,
  sizes,
  className = '',
}: {
  src?: string
  alt: string
  // Ширина на странице для выбора WebP-копии, как атрибут sizes.
  sizes: string
  className?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const url = src ? getImageUrl(src) : ''
  return url && failedSrc !== url ? (
    <UploadImg
      src={url}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      onFailed={() => setFailedSrc(url)}
      className={`h-full w-full object-contain ${className}`}
    />
  ) : (
    <div
      role="img"
      aria-label={`${alt}: фото отсутствует`}
      className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
    >
      <FiPackage className="h-10 w-10 stroke-1" aria-hidden="true" />
      <span className="text-xs">Фото отсутствует</span>
    </div>
  )
}
