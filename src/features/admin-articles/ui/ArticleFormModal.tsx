import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { FiImage } from 'react-icons/fi'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import { Checkbox } from '@/shared/ui/Checkbox'
import { ImageUpload } from '@/shared/ui/ImageUpload'
import { slugify, sanitizeSlug, getImageUrl } from '@/shared/lib'
import { articleApi } from '@/entities/article/api/article.api'
import type { ArticleFull, ArticleListItem, CreateArticleDto, UpdateArticleDto } from '@/entities/article/model/types'
import { ARTICLE_CATEGORIES, ARTICLE_DESCRIPTION_HINT, articleSaveError, slugError } from '../model/constants'

interface ArticleFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Строка списка при правке; полный текст форма догружает сама. */
  article?: ArticleListItem | null
  onLoad: (id: string) => Promise<ArticleFull>
  onCreate: (dto: CreateArticleDto, cover: File | null) => Promise<ArticleListItem>
  onUpdate: (id: string, dto: UpdateArticleDto, cover: File | null) => Promise<ArticleListItem>
  /** Открыть предпросмотр сохранённой статьи. */
  onPreview: (id: string) => void
}

const CATEGORY_OPTIONS = ARTICLE_CATEGORIES.map((category) => ({ value: category, label: category }))

export function ArticleFormModal({ open, onOpenChange, article, onLoad, onCreate, onUpdate, onPreview }: ArticleFormModalProps) {
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [h1, setH1] = useState('')
  const [category, setCategory] = useState<string>(ARTICLE_CATEGORIES[0])
  const [body, setBody] = useState('')
  const [published, setPublished] = useState(false)
  const [cover, setCover] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bodyBox = useRef<HTMLDivElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setSlug('')
    setSlugTouched(false)
    setTitle('')
    setDescription('')
    setH1('')
    setCategory(ARTICLE_CATEGORIES[0])
    setBody('')
    setPublished(false)
    setCover(null)
    setCoverUrl(undefined)
    setError(null)
  }

  useEffect(() => {
    if (!open) return
    resetForm()
    if (!article) return
    let cancelled = false
    setIsLoading(true)
    onLoad(article.id)
      .then((full) => {
        if (cancelled) return
        setSlug(full.slug)
        setSlugTouched(true)
        setTitle(full.title)
        setDescription(full.description)
        setH1(full.h1)
        setCategory(full.category)
        setBody(full.body)
        setPublished(full.published)
        setCoverUrl(full.image ? getImageUrl(full.image) : undefined)
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить статью')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, article?.id])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value).replace(/-+/g, '-').replace(/^-|-$/g, ''))
  }

  const handleSlugChange = (value: string) => {
    setError(null)
    setSlug(sanitizeSlug(value))
    setSlugTouched(true)
  }

  // Проверка полей; возвращает текст первой ошибки
  const validate = (): string | null => {
    const bad = slugError(slug)
    if (bad) return bad
    if (!title.trim()) return 'Заполните заголовок страницы (title)'
    if (!description.trim()) return 'Заполните описание (description)'
    if (!h1.trim()) return 'Заполните заголовок статьи (H1)'
    if (!body.trim()) return 'Заполните текст статьи'
    return null
  }

  /** Сохраняет статью; при ошибке показывает её в форме и возвращает null. */
  const save = async (): Promise<ArticleListItem | null> => {
    const problem = validate()
    if (problem) {
      setError(problem)
      return null
    }
    setIsSubmitting(true)
    setError(null)
    const dto: CreateArticleDto = {
      slug,
      title: title.trim(),
      description: description.trim(),
      h1: h1.trim(),
      category,
      body,
      published,
    }
    try {
      return article ? await onUpdate(article.id, dto, cover) : await onCreate(dto, cover)
    } catch (err) {
      setError(articleSaveError(err, article ? 'Не удалось сохранить статью' : 'Не удалось создать статью'))
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (await save()) {
      resetForm()
      onOpenChange(false)
    }
  }

  const handlePreview = async () => {
    const saved = await save()
    if (saved) {
      resetForm()
      onOpenChange(false)
      onPreview(saved.id)
    }
  }

  // Загружает картинку и вставляет <figure> в позицию курсора
  const handleImagePicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setIsUploading(true)
    try {
      const { path } = await articleApi.uploadImage(file)
      const figure = `<figure><img src="${path}" alt=""><figcaption></figcaption></figure>`
      const textarea = bodyBox.current?.querySelector('textarea')
      const start = textarea?.selectionStart ?? body.length
      const end = textarea?.selectionEnd ?? body.length
      const insert = `${start > 0 && body[start - 1] !== '\n' ? '\n' : ''}${figure}\n`
      setBody(body.slice(0, start) + insert + body.slice(end))
      toast.success('Картинка вставлена в текст — впишите описание в alt и figcaption')
    } catch {
      toast.error('Не удалось загрузить картинку')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const busy = isSubmitting || isLoading
  const label = 'mb-2 block text-sm font-medium text-foreground'

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      className="max-w-3xl"
      title={article ? 'Редактировать статью' : 'Добавить статью'}
      description="Заполните поля статьи. Опубликованные статьи видны на сайте в разделе «Статьи»."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Адрес статьи *</label>
          <Input value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="relsy-r65-r50" disabled={busy} />
          <p className="mt-1 text-xs text-muted-foreground">
            Только латинские буквы, цифры и дефисы. Статья будет по адресу /stati/{slug || 'адрес'}.
          </p>
        </div>

        <div>
          <label className={label}>Заголовок страницы (title) *</label>
          <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Как выбрать рельсы | ПроРельс" disabled={busy} />
        </div>

        <div>
          <label className={label}>Описание (description) *</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Короткое описание для поиска и шапки статьи"
            disabled={busy}
          />
          <p className={`mt-1 text-xs ${description.length > ARTICLE_DESCRIPTION_HINT ? 'text-red-500' : 'text-muted-foreground'}`}>
            {description.length} символов (для поиска лучше до {ARTICLE_DESCRIPTION_HINT})
          </p>
        </div>

        <div>
          <label className={label}>Заголовок статьи (H1) *</label>
          <Input value={h1} onChange={(e) => setH1(e.target.value)} placeholder="Как выбрать рельсы" disabled={busy} />
        </div>

        <div>
          <label className={label}>Рубрика *</label>
          <Select options={CATEGORY_OPTIONS} value={category} onChange={(e) => setCategory(e.target.value)} disabled={busy} />
        </div>

        <ImageUpload label="Обложка" value={cover} onChange={setCover} existingUrl={coverUrl} disabled={busy} />

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium text-foreground">Текст статьи *</label>
            <input ref={imageInput} type="file" accept="image/*" className="hidden" onChange={handleImagePicked} />
            <Button type="button" size="sm" variant="secondary" onClick={() => imageInput.current?.click()} disabled={busy || isUploading}>
              <FiImage className="h-4 w-4" />
              {isUploading ? 'Загрузка...' : 'Вставить картинку в текст'}
            </Button>
          </div>
          <div ref={bodyBox}>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              spellCheck={false}
              className="min-h-[28rem] font-mono text-[13px] leading-relaxed"
              disabled={busy}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Текст — HTML. Карточки товаров: <code>[[CARD TM-0001]]</code> (артикулы можно через пробел); ссылка на услугу:{' '}
            <code>[[SERVICE адрес-услуги]]</code>. Метку пишите отдельной строкой.
          </p>
        </div>

        <Checkbox label="Опубликовано" checked={published} onChange={(e) => setPublished(e.target.checked)} disabled={busy} />

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="button" variant="outline" onClick={handlePreview} disabled={busy}>
            Посмотреть, как будет
          </Button>
          <Button type="submit" disabled={busy}>
            {isSubmitting ? 'Сохранение...' : article ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
