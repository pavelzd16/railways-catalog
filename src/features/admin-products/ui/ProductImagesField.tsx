import { useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiCrop, FiImage, FiPlus, FiX } from 'react-icons/fi'
import { cn } from '@/shared/lib'
import { FIT_FRAME, moveItem, type ImageDraft } from '../imageFrame'
import { FramedImage } from './FramedImage'
import { useImageSrc } from './useImageSrc'
import { ImageFrameEditor } from './ImageFrameEditor'

const MAX_IMAGES = 10
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ProductImagesFieldProps {
  value: ImageDraft[]
  onChange: (images: ImageDraft[]) => void
  disabled?: boolean
}

/** Фото товара одним списком: порядок перетаскиванием или стрелками, кадр — в отдельном окне. */
export function ProductImagesField({ value, onChange, disabled = false }: ProductImagesFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const editing = value.find((image) => image.id === editingId) ?? null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setError('')
    if (files.some((file) => !ACCEPTED_TYPES.includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError('Выберите JPG, PNG или WebP размером не более 5 МБ.')
    } else if (value.length + files.length > MAX_IMAGES) {
      setError(`Можно добавить ещё ${Math.max(0, MAX_IMAGES - value.length)} изображений. Всего у товара — не более ${MAX_IMAGES}.`)
    } else {
      onChange([...value, ...files.map((file) => ({ id: crypto.randomUUID(), file }))])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const move = (from: number, to: number) => onChange(moveItem(value, from, to))

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">Изображения</label>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        onChange={handleFileChange}
        disabled={disabled || value.length >= MAX_IMAGES}
        className="hidden"
      />

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((image, index) => (
          <li
            key={image.id}
            draggable={!disabled}
            onDragStart={(event) => {
              setDragIndex(index)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', String(index))
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              if (dropIndex !== index) setDropIndex(index)
            }}
            onDrop={(event) => {
              event.preventDefault()
              const from = dragIndex ?? Number(event.dataTransfer.getData('text/plain'))
              if (Number.isInteger(from)) move(from, index)
              setDragIndex(null)
              setDropIndex(null)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setDropIndex(null)
            }}
            className={cn(
              'overflow-hidden rounded-lg border-2 bg-background transition-colors',
              dragIndex === index ? 'opacity-50' : 'opacity-100',
              dropIndex === index && dragIndex !== index ? 'border-primary' : 'border-border',
              disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
            )}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-white">
              <ImageTile image={image} index={index} />
              <span
                className={cn(
                  'absolute left-1 top-1 rounded px-1.5 py-0.5 text-xs font-semibold',
                  index === 0 ? 'bg-primary text-primary-foreground' : 'bg-black/60 text-white',
                )}
              >
                {index === 0 ? 'Главное' : index + 1}
              </span>
              <button
                type="button"
                aria-label={`Удалить изображение ${index + 1}`}
                onClick={() => onChange(value.filter((item) => item.id !== image.id))}
                disabled={disabled}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed"
              >
                <FiX className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-1 border-t border-border p-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={disabled || index === 0}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                aria-label={`Поставить изображение ${index + 1} левее`}
                title="Левее"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setEditingId(image.id)}
                disabled={disabled}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                title="Масштаб и положение фото в рамке"
              >
                <FiCrop className="h-3.5 w-3.5" />
                Кадр
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={disabled || index === value.length - 1}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                aria-label={`Поставить изображение ${index + 1} правее`}
                title="Правее"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}

        {value.length < MAX_IMAGES && (
          <li>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiPlus className="h-8 w-8" />
              <span className="text-xs">Добавить</span>
            </button>
          </li>
        )}
      </ol>

      {value.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
          <FiImage className="h-8 w-8" />
          <span className="text-xs">Нет изображений</span>
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        {value.length} из {MAX_IMAGES}. JPG, PNG, WebP до 5 МБ. Порядок — перетаскиванием или стрелками,
        первое фото главное. Новое фото встаёт в рамку целиком; «Кадр» — свой масштаб и положение.
      </p>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}

      {editing && (
        <ImageFrameEditor
          image={editing}
          onClose={() => setEditingId(null)}
          onApply={(frame) => {
            onChange(value.map((image) => (image.id === editing.id ? { ...image, frame } : image)))
            setEditingId(null)
          }}
        />
      )}
    </div>
  )
}

function ImageTile({ image, index }: { image: ImageDraft; index: number }) {
  const src = useImageSrc(image)
  return (
    <FramedImage
      src={src}
      frame={image.frame ?? (image.file ? FIT_FRAME : undefined)}
      alt={image.file?.name ?? `Изображение ${index + 1}`}
    />
  )
}
