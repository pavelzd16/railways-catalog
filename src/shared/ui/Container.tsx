import { cn } from '@/shared/lib/cn'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-[96rem]',
  full: 'max-w-full',
}

export function Container({ size = 'lg', className, ...props }: ContainerProps) {
  return (
    <div className={cn('mx-auto px-4', sizes[size], className)} {...props} />
  )
}
