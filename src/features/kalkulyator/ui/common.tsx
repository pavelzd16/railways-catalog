import type { ReactNode } from 'react'
import type { Istochnik } from '../model/dannye.ts'

export function Pole({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function Ssylka({ istochnik }: { istochnik: Istochnik }) {
  return (
    <span className="text-xs text-muted-foreground">
      {istochnik.doc}, {istochnik.mesto}
    </span>
  )
}

export function Itog({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</div>
    </div>
  )
}
