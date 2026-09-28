import { useState, type ImgHTMLAttributes } from 'react'
import { MdNoPhotography } from 'react-icons/md'
import { cn } from '../lib'
import { UploadImg } from './UploadImg'

interface ProductImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'sizes'> {
  src: string | undefined
  // Ширина на странице для выбора WebP-копии, как атрибут sizes.
  sizes: string
  fallbackClassName?: string
  iconClassName?: string
}

export function ProductImage({
  src,
  alt,
  className,
  fallbackClassName,
  iconClassName,
  ...props
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string>()

  if (!src || failedSrc === src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          fallbackClassName,
        )}
      >
        <MdNoPhotography className={cn('h-8 w-8', iconClassName)} />
      </div>
    )
  }

  return (
    <UploadImg
      src={src}
      alt={alt}
      className={className}
      onFailed={() => setFailedSrc(src)}
      {...props}
    />
  )
}
