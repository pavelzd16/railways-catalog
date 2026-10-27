// Круглая оранжевая стрелка листалки — в шапке у краёв левой колонки и в окне чтения.
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export function FlipArrow({ direction, disabled, onClick, className = '' }: { direction: -1 | 1; disabled: boolean; onClick: () => void; className?: string }) {
  const Icon = direction < 0 ? FiChevronLeft : FiChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction < 0 ? 'Предыдущая страница' : 'Следующая страница'}
      className={`normativ-arrow ${className}`}
    >
      <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} aria-hidden="true" />
    </button>
  )
}
