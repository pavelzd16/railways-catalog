import { LuLayers } from 'react-icons/lu'
import { cn } from '@/shared/lib/cn'

type Variant = 'chip' | 'inline'

const variants: Record<Variant, string> = {
  chip: 'gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[13px] font-medium text-primary',
  inline: 'gap-1 text-xs font-normal text-muted-foreground',
}

export interface PriceNoteProps {
  variant?: Variant
  className?: string
}

/** Приписка к цене: стоимость зависит от объёма партии. */
export function PriceNote({ variant = 'inline', className }: PriceNoteProps) {
  return (
    <span className={cn('flex w-fit items-center whitespace-nowrap', variants[variant], className)}>
      <LuLayers aria-hidden className={variant === 'chip' ? 'size-3.5' : 'size-3 shrink-0 opacity-70'} />
      Цена зависит от партии
    </span>
  )
}
