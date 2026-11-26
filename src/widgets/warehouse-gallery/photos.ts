export interface GalleryPhoto {
  /** Путь к фото в public/, например '/photos/photo_1.jpg' */
  src: string
  alt: string
}

// Расширение файлов: поменяйте, если фото не .jpg (например, 'webp').
const EXT = 'jpg'

/** Фото склада и отгрузок: public/photos/photo_1 … photo_9. */
export const GALLERY_PHOTOS: GalleryPhoto[] = Array.from({ length: 9 }, (_, i) => ({
  src: `/photo/photo_${i + 1}.${EXT}`,
  alt: `Склад и отгрузка ПроРельс, фото ${i + 1}`,
}))