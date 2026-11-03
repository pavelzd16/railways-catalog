import { getImageUrl } from '@/shared/lib'
import {
  FIT_FRAME,
  FRAME_OUTPUT,
  frameLayout,
  isOriginalFrame,
  needsUpload,
  type ImageDraft,
} from './imageFrame'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Не удалось открыть фото для кадрирования.'))
    image.src = src
  })
}

/** Рисует фото в рамке 4:3 на белом фоне — ровно так, как его покажет карточка товара. */
export async function renderFramedImage(image: ImageDraft): Promise<File> {
  if (!needsUpload(image)) throw new Error('Фото не меняли — загружать нечего.')
  const objectUrl = image.file ? URL.createObjectURL(image.file) : null
  try {
    const source = await loadImage(objectUrl ?? getImageUrl(image.url ?? ''))
    const frame = image.frame ?? FIT_FRAME
    const { naturalWidth: width, naturalHeight: height } = source
    if (image.file && isOriginalFrame(width, height, frame)) return image.file

    const canvas = document.createElement('canvas')
    canvas.width = FRAME_OUTPUT.width
    canvas.height = FRAME_OUTPUT.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Браузер не умеет перерисовывать фото.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.imageSmoothingQuality = 'high'
    const layout = frameLayout(width, height, frame)
    context.drawImage(
      source,
      layout.left * canvas.width,
      layout.top * canvas.height,
      layout.width * canvas.width,
      layout.height * canvas.height,
    )

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) throw new Error('Не удалось сохранить кадр фото.')
    const baseName = (image.file?.name ?? image.url?.split('/').pop() ?? 'foto').replace(/\.[^.]+$/, '')
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }
}
