import { useId, useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { GALLERY_PHOTOS, type GalleryPhoto } from './photos'

const PAGE_PHOTO_COUNT = 12

/** Галерея склада и отгрузок. Без фотографий блок не показывается. */
export function WarehouseGallery({
  photos = GALLERY_PHOTOS,
  title = 'Фотографии наших отгрузок и склада',
}: {
  photos?: GalleryPhoto[]
  title?: string
}) {
  const titleId = useId()
  const [showRemaining, setShowRemaining] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)

  if (photos.length === 0) return null

  const pagePhotos = photos.slice(0, PAGE_PHOTO_COUNT)
  const remainingPhotos = photos.slice(PAGE_PHOTO_COUNT)

  return (
    <section className="mb-12" aria-labelledby={titleId}>
      <h2 id={titleId} className="mb-6 text-2xl font-bold text-foreground">
        {title}
      </h2>
      <PhotoGrid photos={pagePhotos} onSelect={setSelectedPhoto} />
      {remainingPhotos.length > 0 && (
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          aria-haspopup="dialog"
          onClick={() => setShowRemaining(true)}
        >
          Показать все
        </Button>
      )}
      <Dialog
        open={showRemaining}
        onOpenChange={setShowRemaining}
        title={title}
        className="sm:max-w-6xl"
      >
        <PhotoGrid photos={remainingPhotos} onSelect={setSelectedPhoto} />
      </Dialog>
      <Dialog
        open={selectedPhoto !== null}
        onOpenChange={(open) => { if (!open) setSelectedPhoto(null) }}
        title={selectedPhoto?.alt}
        className="sm:max-w-6xl"
      >
        {selectedPhoto && (
          <img
            src={selectedPhoto.src}
            alt={selectedPhoto.alt}
            className="mx-auto block max-h-[70dvh] max-w-full object-contain"
          />
        )}
      </Dialog>
    </section>
  )
}

function PhotoGrid({ photos, onSelect }: {
  photos: GalleryPhoto[]
  onSelect: (photo: GalleryPhoto) => void
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <li key={photo.src} className="aspect-[4/3]">
          <button
            type="button"
            aria-label={`Увеличить фото: ${photo.alt}`}
            aria-haspopup="dialog"
            onClick={() => onSelect(photo)}
            className="block h-full w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <img
              src={photo.thumbnail ?? photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
