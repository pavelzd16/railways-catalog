import { FiShield } from 'react-icons/fi'
import { WARRANTY_SHORT } from '@/shared/lib/warranty'

export function WarrantyBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-bold text-success ${className}`}>
      <FiShield className="h-4 w-4 shrink-0" aria-hidden="true" />
      {WARRANTY_SHORT}
    </span>
  )
}