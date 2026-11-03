import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import {
  FIT_FRAME,
  MAX_ZOOM,
  MIN_ZOOM,
  clampFrame,
  coverFrame,
  type ImageDraft,
  type ImageFrame,
} from '../imageFrame'
import { FramedImage, type ImageSize } from './FramedImage'
import { useImageSrc } from './useImageSrc'

interface ImageFrameEditorProps {
  image: ImageDraft
  onApply: (frame: ImageFrame) => void
  onClose: () => void
}

/** Окно «Кадр фото»: масштаб ползунком или колёсиком, положение — перетаскиванием. */
export function ImageFrameEditor({ image, onApply, onClose }: ImageFrameEditorProps) {
  const src = useImageSrc(image)
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<ImageSize | null>(null)
  // Пока снимок не загрузился, кадр неизвестен: у нового фото по умолчанию «целиком»,
  // у загруженного — как его сейчас показывает сайт.
  const [frame, setFrame] = useState<ImageFrame | null>(image.frame ?? (image.file ? FIT_FRAME : null))
  const drag = useRef<{ pointerId: number; x: number; y: number; frame: ImageFrame } | null>(null)

  const update = (next: ImageFrame) => {
    if (size) setFrame(clampFrame(size.width, size.height, next))
  }

  const handleSize = (next: ImageSize) => {
    setSize(next)
    setFrame((current) => clampFrame(next.width, next.height, current ?? coverFrame(next.width, next.height)))
  }

  // Колёсико слушаем вручную: из обработчика React нельзя отменить прокрутку страницы.
  const wheelState = useRef({ size, frame })
  useEffect(() => {
    wheelState.current = { size, frame }
  })
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const handleWheel = (event: WheelEvent) => {
      const { size: current, frame: currentFrame } = wheelState.current
      if (!current || !currentFrame) return
      event.preventDefault()
      const zoom = currentFrame.zoom * Math.exp(-event.deltaY * 0.0015)
      setFrame(clampFrame(current.width, current.height, { ...currentFrame, zoom }))
    }
    box.addEventListener('wheel', handleWheel, { passive: false })
    return () => box.removeEventListener('wheel', handleWheel)
  }, [])

  const zoomPercent = Math.round((frame?.zoom ?? 1) * 100)

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title="Кадр фото"
      description="Так фото будет стоять в карточке товара. Двигайте фото мышью или пальцем, масштаб — ползунком или колёсиком."
      className="max-w-2xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="button"
            disabled={!frame || !size}
            onClick={() => {
              if (frame) onApply(frame)
            }}
          >
            Применить
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div
          ref={boxRef}
          className="relative aspect-[4/3] w-full cursor-grab touch-none overflow-hidden rounded-lg border border-border bg-white active:cursor-grabbing"
          onPointerDown={(event) => {
            if (!frame) return
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, frame }
          }}
          onPointerMove={(event) => {
            const start = drag.current
            const box = boxRef.current
            if (!start || start.pointerId !== event.pointerId || !box) return
            const rect = box.getBoundingClientRect()
            update({
              ...start.frame,
              x: start.frame.x + (event.clientX - start.x) / rect.width,
              y: start.frame.y + (event.clientY - start.y) / rect.height,
            })
          }}
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
        >
          <FramedImage src={src} frame={frame ?? undefined} alt="Кадр фото" onSize={handleSize} />
        </div>

        <label className="block">
          <span className="mb-1 flex justify-between text-sm font-medium text-foreground">
            <span>Масштаб</span>
            <span className="tabular-nums text-muted-foreground">{zoomPercent} %</span>
          </span>
          <input
            type="range"
            min={MIN_ZOOM * 100}
            max={MAX_ZOOM * 100}
            step={1}
            value={zoomPercent}
            disabled={!frame}
            onChange={(event) => {
              if (frame) update({ ...frame, zoom: Number(event.target.value) / 100 })
            }}
            className="w-full accent-primary"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            100 % — фото видно целиком, с белыми полями по краям. Больше — фото крупнее и обрезается рамкой.
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={!size} onClick={() => update(FIT_FRAME)}>
            Целиком
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!size}
            onClick={() => size && update(coverFrame(size.width, size.height))}
          >
            Заполнить рамку
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!frame}
            onClick={() => frame && update({ ...frame, x: 0, y: 0 })}
          >
            По центру
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
