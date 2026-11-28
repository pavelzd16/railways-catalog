import { useId, useRef, useState, type TouchEvent } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { GALLERY_PHOTOS, type GalleryPhoto } from './photos'

const PAGE_PHOTO_COUNT = 12
const SWIPE_THRESHOLD = 50
const ARROW_CLASS = 'absolute top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  if (photos.length === 0) return null

  const pagePhotos = photos.slice(0, PAGE_PHOTO_COUNT)
  const remainingPhotos = photos.slice(PAGE_PHOTO_COUNT)
  const selectedPhoto = selectedIndex === null ? undefined : photos[selectedIndex]
  const canNavigate = photos.length > 1
  const selectPhoto = (photo: GalleryPhoto) => setSelectedIndex(photos.indexOf(photo))

  function changePhoto(direction: -1 | 1) {
    setSelectedIndex((index) => index === null ? null : (index + direction + photos.length) % photos.length)
  }

  function handleSwipeEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current
    touchStart.current = null
    if (!canNavigate || !start || event.touches.length !== 0) return

    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      changePhoto(dx < 0 ? 1 : -1)
    }
  }

  return (
    <section className="mb-12" aria-labelledby={titleId}>
      <h2 id={titleId} className="mb-6 text-2xl font-bold text-foreground">
        {title}
      </h2>
      <PhotoGrid photos={pagePhotos} onSelect={selectPhoto} />
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
        <PhotoGrid photos={remainingPhotos} onSelect={selectPhoto} />
      </Dialog>
      <Dialog
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => {
          if (!open) {
            touchStart.current = null
            setSelectedIndex(null)
          }
        }}
        onKeyDown={(event) => {
          if (canNavigate && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault()
            changePhoto(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}
        title={selectedPhoto?.alt}
        className="sm:max-w-6xl"
      >
        {selectedPhoto && (
          <div
            className="relative grid min-h-11 touch-pan-y touch-pinch-zoom place-items-center sm:px-14"
            onTouchStart={(event) => {
              const touch = event.touches[0]
              touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null
            }}
            onTouchEnd={handleSwipeEnd}
            onTouchCancel={() => { touchStart.current = null }}
          >
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              className="block max-h-[70dvh] max-w-full object-contain"
            />
            {canNavigate && (
              <>
                <button
                  type="button"
                  aria-label="Предыдущее фото"
                  className={`${ARROW_CLASS} left-0`}
                  onClick={() => changePhoto(-1)}
                >
                  <FiChevronLeft aria-hidden="true" className="size-6" />
                </button>
                <button
                  type="button"
                  aria-label="Следующее фото"
                  className={`${ARROW_CLASS} right-0`}
                  onClick={() => changePhoto(1)}
                >
                  <FiChevronRight aria-hidden="true" className="size-6" />
                </button>
                <span className="sr-only" aria-live="polite">{selectedPhoto.alt}</span>
              </>
            )}
          </div>
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
