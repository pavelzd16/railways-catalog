import { useEffect, useState } from 'react'
import { getImageUrl } from '@/shared/lib'
import type { ImageDraft } from '../imageFrame'

/** Адрес для показа: у загруженного фото — сервер, у нового — временная ссылка на файл. */
export function useImageSrc(image: ImageDraft): string {
  const [preview, setPreview] = useState('')
  useEffect(() => {
    if (!image.file) return
    const url = URL.createObjectURL(image.file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image.file])
  return image.file ? preview : getImageUrl(image.url ?? '')
}
