import { GALLERY_PHOTOS, type GalleryPhoto } from "./photos"

/** Галерея склада и отгрузок. Без фотографий блок не показывается. */
export function WarehouseGallery({
  photos = GALLERY_PHOTOS,
  title = 'Фотографии наших отгрузок и склада',
}: {
  photos?: GalleryPhoto[]
  title?: string
}) {
  if (photos.length === 0) return null
  return (
    <section className="mb-12" aria-labelledby="gallery-title">
      <h2 id="gallery-title" className="mb-6 text-2xl font-bold text-foreground">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <li key={photo.src} className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </li>
        ))}
      </ul>
    </section>
  )
}