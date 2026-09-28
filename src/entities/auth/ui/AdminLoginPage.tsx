import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { setToken } from '../model/auth.model'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'
import { authApi } from '../api/auth.api'
import { FiClock, FiAlertCircle } from 'react-icons/fi'
import { formatWait, getLoginError, readLoginCooldown, saveLoginCooldown, type LoginCooldown, type LoginError } from '../model/login-error'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    '/admin'

  const [cooldown, setCooldown] = useState<LoginCooldown | null>(readLoginCooldown)
  const [now, setNow] = useState(Date.now)
  const [formData, setFormData] = useState({
    username: cooldown?.username ?? '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const remaining = Math.max(0, Math.ceil(((cooldown?.until ?? 0) - now) / 1000))
  const isBlocked = remaining > 0 && cooldown?.username === formData.username.trim().toLowerCase()

  useEffect(() => {
    if (!cooldown) return
    const tick = () => {
      const current = Date.now()
      setNow(current)
      if (current >= cooldown.until) {
        setCooldown(null)
        saveLoginCooldown(null)
      }
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || isBlocked) return

    if (!formData.username.trim() || !formData.password) {
      setError({ message: 'Введите логин и пароль' })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await authApi.login({
        username: formData.username.trim(),
        password: formData.password,
      })

      setToken(response.token)
      saveLoginCooldown(null)
      navigate(from, { replace: true })
    } catch (err) {
      const failure = getLoginError(err)
      if (failure.retryAfter) {
        const value = { username: formData.username.trim().toLowerCase(), until: Date.now() + failure.retryAfter * 1000 }
        saveLoginCooldown(value)
        setNow(Date.now())
        setCooldown(value)
      } else setError(failure)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-gradient">
              <span className="text-2xl">🛤️</span>
            </div>
            <h1 className="text-2xl font-black">ИНВИА</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Панель управления
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Логин">
              <Input
                aria-label="Логин"
                autoComplete="username"
                maxLength={128}
                value={formData.username}
                onChange={(e) => {
                  setError(null)
                  setFormData({ ...formData, username: e.target.value })
                }}
                placeholder="Введите логин"
                disabled={isSubmitting}
                autoFocus
              />
            </FormField>

            <FormField label="Пароль">
              <Input
                aria-label="Пароль"
                autoComplete="current-password"
                maxLength={1024}
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Введите пароль"
                disabled={isSubmitting || isBlocked}
              />
            </FormField>

            {isBlocked && (
              <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
                <div className="flex items-start gap-3" role="alert">
                  <FiClock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Вход временно ограничен</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Слишком много неверных попыток. Подождите немного и попробуйте снова.</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-primary/15 pt-3 text-sm">
                  <span className="text-muted-foreground">Повторный вход через</span>
                  <span role="timer" aria-live="off" className="font-bold tabular-nums text-primary">{formatWait(remaining)}</span>
                </div>
              </div>
            )}
            {error && !isBlocked && (
              <div role="alert" className="flex items-start gap-3 rounded-lg bg-destructive/5 border border-destructive/20 p-4">
                <FiAlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-destructive">{error.message}</p>
                  {error.attemptsRemaining !== undefined && <p className="mt-1 text-sm text-muted-foreground">До временной блокировки осталось попыток: {error.attemptsRemaining}.</p>}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting || isBlocked}
            >
              {isSubmitting ? 'Вход...' : isBlocked ? 'Подождите окончания таймера' : 'Войти'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
