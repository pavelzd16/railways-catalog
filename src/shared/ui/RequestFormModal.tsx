// src/shared/ui/RequestFormModal.tsx
import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { FiUpload, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Dialog } from './Dialog'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { Button } from './Button'
import { FormField } from './FormField'
import { Checkbox } from './Checkbox'
import { PhoneInput } from './PhoneInput'
import type { CreateRequestDto } from '@/entities/request/model/types'
import { requestApi } from '@/entities/request/api/request.api'
import { FORM_GOAL, metrikaReachGoal } from '@/shared/analytics/metrika'
import { validateRequestContact } from '@/shared/lib/request-validation'

interface UploadedFile {
  name: string
  file: File
}

interface RequestFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  serviceId?: string
  productId?: string
  /** Короткая форма обратного звонка: без email и вложений */
  callback?: boolean
  /** Начальный текст комментария (форма берёт его при монтировании) */
  comment?: string
  productName?: string
  submitLabel?: string
  attachments?: boolean
}

export function RequestFormModal({
  open,
  onOpenChange,
  title = 'Отправить заявку',
  description = 'Получите консультацию или коммерческое предложение',
  serviceId,
  productId,
  callback = false,
  comment,
  productName,
  submitLabel,
  attachments = true,
}: RequestFormModalProps) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<ReturnType<typeof validateRequestContact>>({})
  const [submitError, setSubmitError] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(Boolean(comment))
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: comment ?? '',
    policyAccepted: false,
  })

  const [requestFile, setRequestFile] = useState<UploadedFile | null>(null)
  const [partnerMapFile, setPartnerMapFile] = useState<UploadedFile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'request' | 'partner',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadedFile: UploadedFile = {
      name: file.name,
      file,
    }

    if (type === 'request') {
      setRequestFile(uploadedFile)
    } else {
      setPartnerMapFile(uploadedFile)
    }

    e.target.value = ''
  }

  const removeFile = (type: 'request' | 'partner') => {
    if (type === 'request') {
      setRequestFile(null)
    } else {
      setPartnerMapFile(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      comment: '',
      policyAccepted: false,
    })
    setRequestFile(null)
    setPartnerMapFile(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validation = validateRequestContact(formData)
    setErrors(validation)
    if (Object.keys(validation).length) {
      if (validation.email) setDetailsOpen(true)
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const dto: CreateRequestDto = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        policyAccepted: formData.policyAccepted,
      }

      if (formData.email.trim()) {
        dto.email = formData.email.trim()
      }

      if (formData.comment.trim()) {
        dto.comment = formData.comment.trim()
      }

      if (serviceId) {
        dto.serviceId = serviceId
      }

      if (productId) {
        dto.productId = productId
      }

      await requestApi.create(dto, {
        requestFile: requestFile?.file,
        partnerMapFile: partnerMapFile?.file,
      })

      metrikaReachGoal(FORM_GOAL)
      toast.success('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время')
      resetForm()
      setErrors({})
      onOpenChange(false)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Ошибка при отправке заявки. Попробуйте позже'

      const errors = Array.isArray(message) ? message : [message]
      setSubmitError(errors.join('. '))
      errors.forEach((error: string) => {
        toast.error(error)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className="max-w-lg"
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
        {productName && <p className="rounded-lg bg-muted p-3 text-sm font-semibold">{productName}</p>}
        <p className="text-xs text-muted-foreground">* Обязательные поля</p>
        <FormField label="Имя или организация *" htmlFor={`${id}-name`} error={errors.name} messageId={`${id}-name-error`}>
          <Input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            maxLength={120}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            placeholder="Как к вам обращаться"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </FormField>

        <FormField label="Телефон *" htmlFor={`${id}-phone`} error={errors.phone} messageId={`${id}-phone-error`}>
          <PhoneInput
            id={`${id}-phone`}
            name="phone"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            required
            disabled={isSubmitting}
          />
        </FormField>

        <details open={detailsOpen} onToggle={event => setDetailsOpen(event.currentTarget.open)} className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-sm font-semibold text-primary">{callback ? 'Добавить комментарий' : attachments ? 'Добавить почту, комментарий или документы' : 'Добавить почту или комментарий'} <span className="font-normal text-muted-foreground">(необязательно)</span></summary>
          <div className="mt-4 space-y-4">
            {!callback && (
            <FormField label="Электронная почта" htmlFor={`${id}-email`} error={errors.email} messageId={`${id}-email-error`}>
              <Input
                id={`${id}-email`}
                name="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${id}-email-error` : undefined}
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
              />
            </FormField>
            )}

            <FormField label="Комментарий" htmlFor={`${id}-comment`}>
              <Textarea
                id={`${id}-comment`}
                name="comment"
                placeholder={
                  callback
                    ? 'Комментарий (удобное время для звонка)'
                    : 'Комментарий (адрес доставки)'
                }
                rows={3}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                disabled={isSubmitting}
              />
            </FormField>

            {!callback && attachments && (
            <div className="space-y-3">
              <label className="flex-1 block">
                <input
                  type="file"
                  className="peer sr-only"
                  onChange={(e) => handleFileChange(e, 'request')}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between px-4 py-2 rounded-lg border border-border bg-muted cursor-pointer hover:bg-muted/80 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                  <span className="text-sm font-medium">Прикрепить заявку</span>
                  <FiUpload className="w-4 h-4" />
                </div>
              </label>

              {requestFile && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 text-sm">
                  <span className="truncate">{requestFile.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('request')}
                    className="p-1 hover:bg-primary/20 rounded"
                    aria-label="Удалить файл"
                    disabled={isSubmitting}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              <label className="flex-1 block">
                <input
                  type="file"
                  className="peer sr-only"
                  onChange={(e) => handleFileChange(e, 'partner')}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between px-4 py-2 rounded-lg border border-border bg-muted cursor-pointer hover:bg-muted/80 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                  <span className="text-sm font-medium">Прикрепить карту партнёра</span>
                  <FiUpload className="w-4 h-4" />
                </div>
              </label>

              {partnerMapFile && (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 text-sm">
                  <span className="truncate">{partnerMapFile.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('partner')}
                    className="p-1 hover:bg-primary/20 rounded"
                    aria-label="Удалить файл"
                    disabled={isSubmitting}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            )}
          </div>
        </details>

        <div className="flex items-start gap-2">
          <Checkbox
            checked={formData.policyAccepted}
            onChange={(e) => setFormData({ ...formData, policyAccepted: e.target.checked })}
            id={`${id}-policy`}
            aria-invalid={Boolean(errors.policyAccepted)}
            aria-describedby={errors.policyAccepted ? `${id}-policy-error` : undefined}
            required
            disabled={isSubmitting}
          />
          <label
            htmlFor={`${id}-policy`}
            className="text-xs text-muted-foreground leading-tight cursor-pointer"
          >
            Я согласен с{' '}
            <a
              href="/privacy"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              политикой конфиденциальности
            </a>
          </label>
        </div>
        {errors.policyAccepted && <p id={`${id}-policy-error`} className="text-xs text-primary">{errors.policyAccepted}</p>}
        {Object.keys(errors).length > 0 && <p role="alert" className="text-sm text-primary">Проверьте отмеченные поля.</p>}
        {submitError && <p role="alert" className="text-sm text-primary">{submitError}</p>}

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Отправка...'
            : submitLabel ?? (callback
              ? 'Заказать звонок'
              : 'Отправить заявку')}
        </Button>
      </form>
    </Dialog>
  )
}
