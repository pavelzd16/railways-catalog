import { useId, useRef, useState, type FormEvent } from 'react'
import { FiMail, FiPaperclip, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'
import { Checkbox } from '@/shared/ui/Checkbox'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { requestApi } from '@/entities/request/api/request.api'
import type { CreateRequestDto } from '@/entities/request/model/types'
import { FORM_GOAL, metrikaReachGoal } from '@/shared/analytics/metrika'

const EMAIL = 'zakaz@prorelsa.ru'
const MAX_FILE_MB = 20
const FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip']
const ACCEPT = FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')
const CONTACT_METHODS = ['Звонок', 'WhatsApp', 'Telegram', 'MAX']

type Errors = Partial<Record<'phone' | 'email' | 'file' | 'policy', string>>

const fieldError = 'mt-1.5 text-sm text-destructive'

/**
 * Общая форма заявки внизу страниц: ТЗ или смета файлом, способ связи, адрес страницы.
 * Отправляется тем же requestApi, что «Заказать звонок» и расчёт доставки.
 */
export function LeadForm({ source = 'Блок заявки' }: { source?: string }) {
  const uid = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState(CONTACT_METHODS[0])
  const [file, setFile] = useState<File | null>(null)
  // Согласие не отмечено заранее (152-ФЗ)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pickFile = (picked: File | null) => {
    if (!picked) return setFile(null)
    const ext = picked.name.split('.').pop()?.toLowerCase() ?? ''
    if (!FILE_EXTENSIONS.includes(ext)) {
      setErrors((prev) => ({ ...prev, file: `Формат .${ext} не подходит. Загрузите ${FILE_EXTENSIONS.join(', ')}` }))
      if (fileInput.current) fileInput.current.value = ''
      return
    }
    if (picked.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: `Файл больше ${MAX_FILE_MB} МБ` }))
      if (fileInput.current) fileInput.current.value = ''
      return
    }
    setErrors((prev) => ({ ...prev, file: undefined }))
    setFile(picked)
  }

  const clearFile = () => {
    setFile(null)
    setErrors((prev) => ({ ...prev, file: undefined }))
    if (fileInput.current) fileInput.current.value = ''
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Введите номер телефона полностью'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Проверьте адрес почты'
    if (!policyAccepted) next.policy = 'Нужно согласие на обработку данных'
    if (errors.file) next.file = errors.file
    return next
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) return

    setIsSubmitting(true)
    try {
      const comment = [
        `Заявка с сайта (${source})`,
        `Удобный способ связи: ${method}`,
        email.trim() ? `Почта: ${email.trim()}` : '',
        `Страница: ${window.location.href}`,
      ]
        .filter(Boolean)
        .join('\n')

      const dto: CreateRequestDto = {
        name: name.trim() || 'Не указано',
        phone: phone.trim(),
        policyAccepted,
        comment,
      }
      await requestApi.create(dto, { requestFile: file, partnerMapFile: null })

      metrikaReachGoal(FORM_GOAL)
      toast.success('Заявка отправлена! Пришлём расчёт в течение рабочего дня')
      setName('')
      setPhone('')
      setEmail('')
      setMethod(CONTACT_METHODS[0])
      setPolicyAccepted(false)
      clearFile()
      setErrors({})
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Ошибка при отправке заявки. Попробуйте позже'
      ;(Array.isArray(message) ? message : [message]).forEach((text: string) => toast.error(text))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="lead-form" className="border-t border-border bg-white py-12 md:py-16" aria-labelledby={`${uid}-title`}>
      <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-14 xl:px-8">
        <div>
          <h2 id={`${uid}-title`} className="section-title mb-5">
            Оставьте заявку, и мы с вами свяжемся
          </h2>
          <p className="max-w-md text-muted-foreground">
            Приложите техническое задание, смету или спецификацию. Пришлём расчёт в течение рабочего дня.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">Или отправьте ТЗ письмом:</p>
          <a href={`mailto:${EMAIL}`} className="mt-1 inline-flex items-center gap-2 text-lg font-bold text-primary hover:underline">
            <FiMail aria-hidden="true" />
            {EMAIL}
          </a>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Имя">
              <Input size="lg" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" disabled={isSubmitting} />
            </FormField>
            <div>
              <FormField label="Телефон *">
                <PhoneInput value={phone} onChange={setPhone} disabled={isSubmitting} />
              </FormField>
              {errors.phone && <p className={fieldError} role="alert">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <FormField label="Почта">
              <Input size="lg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={isSubmitting} />
            </FormField>
            {errors.email && <p className={fieldError} role="alert">{errors.email}</p>}
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium">Загрузить ТЗ, смету или спецификацию</span>
            <input
              ref={fileInput}
              id={`${uid}-file`}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              disabled={isSubmitting}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={`${uid}-file`}
                className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 font-bold hover:border-accent focus-within:outline-2"
              >
                <FiPaperclip aria-hidden="true" />
                Выбрать файл
              </label>
              {file && (
                <span className="inline-flex min-w-0 items-center gap-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <button type="button" onClick={clearFile} aria-label="Убрать файл" className="shrink-0 rounded p-1 hover:bg-muted">
                    <FiX />
                  </button>
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {FILE_EXTENSIONS.join(', ')} — до {MAX_FILE_MB} МБ
            </p>
            {errors.file && <p className={fieldError} role="alert">{errors.file}</p>}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Удобный способ связи</legend>
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHODS.map((item) => (
                <label
                  key={item}
                  className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg border px-4 text-sm font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                    method === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-accent'
                  }`}
                >
                  <input type="radio" name={`${uid}-method`} value={item} checked={method === item} onChange={() => setMethod(item)} className="sr-only" disabled={isSubmitting} />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <div className="flex items-start gap-2">
              <Checkbox id={`${uid}-policy`} checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} disabled={isSubmitting} />
              <label htmlFor={`${uid}-policy`} className="cursor-pointer text-xs leading-tight text-muted-foreground">
                Я согласен на{' '}
                <a href="/privacy#consent" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  обработку персональных данных
                </a>{' '}
                и с{' '}
                <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  политикой конфиденциальности
                </a>
              </label>
            </div>
            {errors.policy && <p className={fieldError} role="alert">{errors.policy}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </Button>
        </form>
      </div>
    </section>
  )
}