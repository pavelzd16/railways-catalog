// Кадр фото товара. В карточке главное фото стоит в рамке 4:3 и обрезается по краям,
// поэтому вертикальный снимок выглядит сильно увеличенным. Здесь — как вписать снимок
// в рамку вручную и в каком порядке отправить фото на сервер.

export const FRAME_ASPECT = 4 / 3
export const FRAME_OUTPUT = { width: 1600, height: 1200 }
export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 4

/** zoom — масштаб от «вписать целиком» (1 — снимок виден весь); x, y — сдвиг центра снимка в долях рамки. */
export interface ImageFrame {
  zoom: number
  x: number
  y: number
}

export const FIT_FRAME: ImageFrame = { zoom: 1, x: 0, y: 0 }

/** Фото в форме товара: уже загруженное (url) или новое с компьютера (file). */
export interface ImageDraft {
  id: string
  url?: string
  file?: File
  /** Кадр, выставленный вручную. У загруженного фото без кадра сайт показывает его как раньше. */
  frame?: ImageFrame
}

/** Масштаб, при котором снимок заполняет рамку без полей, — так сайт показывает фото без кадра. */
export function coverZoom(width: number, height: number): number {
  const ratio = width / height
  return Math.max(ratio / FRAME_ASPECT, FRAME_ASPECT / ratio)
}

export function coverFrame(width: number, height: number): ImageFrame {
  return { zoom: coverZoom(width, height), x: 0, y: 0 }
}

/** Положение снимка в рамке, в долях её ширины и высоты. */
export function frameLayout(width: number, height: number, frame: ImageFrame) {
  const ratio = width / height
  const w = Math.min(1, ratio / FRAME_ASPECT) * frame.zoom
  const h = Math.min(1, FRAME_ASPECT / ratio) * frame.zoom
  return { width: w, height: h, left: 0.5 + frame.x - w / 2, top: 0.5 + frame.y - h / 2 }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Не даёт увести снимок за рамку: крупный снимок не открывает пустых полей,
 * мелкий не выходит за края.
 */
export function clampFrame(width: number, height: number, frame: ImageFrame): ImageFrame {
  const zoom = clamp(frame.zoom, MIN_ZOOM, MAX_ZOOM)
  const { width: w, height: h } = frameLayout(width, height, { zoom, x: 0, y: 0 })
  const maxX = Math.abs(w - 1) / 2
  const maxY = Math.abs(h - 1) / 2
  return { zoom, x: clamp(frame.x, -maxX, maxX), y: clamp(frame.y, -maxY, maxY) }
}

/** Снимок уже 4:3 и стоит целиком — перерисовывать незачем, уходит исходный файл. */
export function isOriginalFrame(width: number, height: number, frame: ImageFrame): boolean {
  return (
    Math.abs(width / height - FRAME_ASPECT) < 0.01 &&
    Math.abs(frame.zoom - 1) < 0.005 &&
    Math.abs(frame.x) < 0.001 &&
    Math.abs(frame.y) < 0.001
  )
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/** Новое фото и перекадрированное загруженное уходят на сервер файлом. */
export function needsUpload(image: ImageDraft): boolean {
  return Boolean(image.file || image.frame)
}

/** Загруженные фото, которые остаются как есть, — в порядке формы. */
export function retainedImages(images: ImageDraft[]): string[] {
  return images.filter((image) => !needsUpload(image) && image.url).map((image) => image.url as string)
}

/**
 * Сервер ставит новые файлы после оставленных фото. По его ответу собираем
 * порядок, который задан в форме, — если он другой, его отправляют вторым запросом.
 */
export function finalImageOrder(images: ImageDraft[], saved: string[], retainedCount: number): string[] {
  const uploaded = saved.slice(retainedCount)
  let next = 0
  return images.map((image) => (needsUpload(image) ? uploaded[next++] : (image.url as string)))
}
