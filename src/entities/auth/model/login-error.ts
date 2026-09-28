import { isAxiosError } from 'axios'

export type LoginError = { message: string; retryAfter?: number; attemptsRemaining?: number }
export type LoginCooldown = { username: string; until: number }
const COOLDOWN_KEY = 'invia-login-cooldown'

export function getLoginError(error: unknown, now = Date.now()): LoginError {
  if (!isAxiosError(error)) return { message: 'Не удалось войти. Попробуйте ещё раз.' }
  if (error.response?.status === 429) {
    const raw = error.response.data?.retryAfter ?? error.response.headers?.['retry-after']
    const seconds = Number(raw)
    const parsed = Number.isFinite(seconds) && seconds > 0
      ? seconds
      : Math.ceil((Date.parse(String(raw)) - now) / 1000)
    return {
      message: 'Слишком много неверных попыток',
      retryAfter: Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.ceil(parsed), 86400) : 900,
    }
  }
  if (error.response?.status === 401) {
    const remaining = error.response.data?.attemptsRemaining
    return {
      message: 'Неверный логин или пароль',
      attemptsRemaining: Number.isInteger(remaining) && remaining > 0 && remaining < 5 ? remaining : undefined,
    }
  }
  return { message: error.response ? 'Не удалось войти. Попробуйте немного позже.' : 'Нет связи с сервером. Проверьте подключение и попробуйте ещё раз.' }
}

export function readLoginCooldown(): LoginCooldown | null {
  if (typeof window === 'undefined') return null
  try {
    const value = JSON.parse(window.sessionStorage.getItem(COOLDOWN_KEY) ?? 'null')
    return typeof value?.username === 'string' && Number.isFinite(value.until) && value.until > Date.now() && value.until <= Date.now() + 86400_000 ? value : null
  } catch { return null }
}

export function saveLoginCooldown(value: LoginCooldown | null) {
  try {
    if (value) window.sessionStorage.setItem(COOLDOWN_KEY, JSON.stringify(value))
    else window.sessionStorage.removeItem(COOLDOWN_KEY)
  } catch { /* Ограничение всё равно проверяется сервером. */ }
}

export function formatWait(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
