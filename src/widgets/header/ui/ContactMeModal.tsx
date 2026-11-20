import { RequestFormModal } from '@/shared/ui/RequestFormModal'

export function ContactMeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <RequestFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Свяжитесь с нами!"
      description="Оставьте контакты — мы свяжемся с вами в рабочее время"
      submitLabel="Отправить"
      attachments={false}
    />
  )
}
