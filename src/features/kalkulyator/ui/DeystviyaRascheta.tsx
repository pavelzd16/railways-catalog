import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/shared/ui/Button'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'

/**
 * Две кнопки под расчётом на каждой вкладке: запросить цену (расчёт уходит
 * в комментарий заявки) и скопировать расчёт себе.
 */
export function DeystviyaRascheta({ tekst, chtoKopiruem = 'Расчёт' }: {
  tekst: string | null
  /** «Расчёт» или «Ведомость» — попадает в подписи кнопки и сообщения */
  chtoKopiruem?: string
}) {
  const [zayavka, setZayavka] = useState(false)
  if (!tekst) return null

  const kopirovat = async () => {
    try {
      await navigator.clipboard.writeText(tekst)
      toast.success(`${chtoKopiruem} скопирован${chtoKopiruem === 'Ведомость' ? 'а' : ''}`)
    } catch {
      toast.error('Не удалось скопировать — выделите текст вручную')
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setZayavka(true)}>Запросить цену по расчёту</Button>
        <Button variant="secondary" onClick={kopirovat}>
          Скопировать {chtoKopiruem.toLowerCase()}
        </Button>
      </div>

      {zayavka && (
        <RequestFormModal
          open
          onOpenChange={setZayavka}
          title="Запрос цены по расчёту"
          description={`${chtoKopiruem} уже в комментарии — добавьте адрес доставки и сроки`}
          comment={tekst}
        />
      )}
    </>
  )
}
