import { useState } from 'react'
import { coverFrame, frameLayout, type ImageFrame } from '../imageFrame'

export interface ImageSize {
  width: number
  height: number
}

/**
 * Фото в рамке 4:3. Без кадра снимок заполняет рамку с обрезкой — как сейчас в карточке товара.
 * Рамку задаёт родитель: relative, aspect-[4/3], overflow-hidden.
 */
export function FramedImage({
  src,
  frame,
  alt,
  onSize,
}: {
  src: string
  frame?: ImageFrame
  alt: string
  onSize?: (size: ImageSize) => void
}) {
  const [size, setSize] = useState<ImageSize | null>(null)
  const layout = size ? frameLayout(size.width, size.height, frame ?? coverFrame(size.width, size.height)) : null

  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onLoad={(event) => {
        const next = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight }
        setSize(next)
        onSize?.(next)
      }}
      className="pointer-events-none absolute max-w-none select-none"
      style={
        layout
          ? {
              width: `${layout.width * 100}%`,
              height: `${layout.height * 100}%`,
              left: `${layout.left * 100}%`,
              top: `${layout.top * 100}%`,
            }
          : { visibility: 'hidden' }
      }
    />
  )
}
