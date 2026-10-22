import { useEffect, useRef, useState } from 'react'
import { FiArrowUp, FiMessageSquare, FiX } from 'react-icons/fi'
import { useLocation } from 'react-router'
import { ChatThread } from './ChatThread'
import {
  useChatConnection,
  type Message,
} from './chat-client'
import { ChatSessionError, readChatSession, type ChatSession } from './chat-session'
import './chat.css'

const SESSION_KEY = 'prorels-chat-session-v1'
const QUICK_REPLIES = ['Купить рельсы', 'Купить ж/д крепёж', 'Получить КП']
/** Окно само открывается один раз на браузер, через 12 с после входа на сайт. */
const AUTO_OPEN_KEY = 'prorels-chat-auto-opened'
const AUTO_OPEN_DELAY = 12000

function markAutoOpened() {
  try {
    localStorage.setItem(AUTO_OPEN_KEY, '1')
  } catch {
    /* No storage. */
  }
}

/** 10 цифр номера после +7: «8 917…», «+7 917…» и «917…» дают одно и то же. */
function phoneDigits(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.length > 10 && /^[78]/.test(digits)) digits = digits.slice(1)
  return digits.slice(0, 10)
}
function formatPhone(digits: string) {
  const tail = [digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
    .filter(Boolean)
    .join('-')
  return [digits.slice(0, 3), tail].filter(Boolean).join(' ')
}
/** Пн–Пт 8:00–17:00 по Москве. */
function managersOnline() {
  const now = new Date()
  const moscow = new Date(
    now.getTime() + (now.getTimezoneOffset() + 180) * 60000,
  )
  const day = moscow.getDay()
  const hour = moscow.getHours()
  return day >= 1 && day <= 5 && hour >= 8 && hour < 17
}

export default function ChatWidget() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
      return stored?.token && stored?.conversation?.id ? stored : null
    } catch {
      return null
    }
  })
  const [step, setStep] = useState<'message' | 'intro'>('message')
  const [message, setMessage] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [unread, setUnread] = useState(0)
  const opener = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  const phoneInput = useRef<HTMLInputElement>(null)
  const autoOpened = useRef(false)
  const online = managersOnline()
  const {
    socket,
    error: connectionError,
    expired,
  } = useChatConnection(session?.token || null)
  useEffect(() => {
    if (!socket) return
    const receive = (message: Message) => {
      if (message.sender === 'MANAGER' && !open) setUnread((count) => count + 1)
    }
    socket.on('chat:message', receive)
    return () => {
      socket.off('chat:message', receive)
    }
  }, [socket, open])
  useEffect(() => {
    if (session) return
    try {
      // Без хранилища не открываем: иначе окно выскакивало бы на каждом заходе.
      if (localStorage.getItem(AUTO_OPEN_KEY)) return
    } catch {
      return
    }
    const timer = window.setTimeout(() => {
      try {
        // Посетитель уже открывал чат сам — повторно не навязываем.
        if (localStorage.getItem(AUTO_OPEN_KEY)) return
      } catch {
        return
      }
      markAutoOpened()
      autoOpened.current = true
      setOpen(true)
    }, AUTO_OPEN_DELAY)
    return () => window.clearTimeout(timer)
  }, [session])
  useEffect(() => {
    if (!open) return
    markAutoOpened()
    // Само открывшееся окно не забирает фокус у поля, где посетитель печатает.
    if (!autoOpened.current) panel.current?.focus()
    autoOpened.current = false
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        opener.current?.focus()
      }
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [open])
  const start = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const base = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${base}/chat/session`, {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Без имени',
          contact: [`+7 ${formatPhone(phone)}`, email.trim()]
            .filter(Boolean)
            .join(', '),
          policyAccepted: accepted,
          pageUrl: pathname,
        }),
      })
      const result = await readChatSession(response)
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(result))
      } catch {
        /* The current tab remains usable. */
      }
      setFirstMessage(message.trim())
      setMessage('')
      setSession(result)
    } catch (failure) {
      setError(
        failure instanceof ChatSessionError
          ? failure.message
          : 'Не удалось подключиться к чату. Проверьте соединение и попробуйте снова.',
      )
    } finally {
      setBusy(false)
    }
  }
  const toIntro = (text: string) => {
    if (!text.trim()) return
    setMessage(text.trim())
    setStep('intro')
    requestAnimationFrame(() => phoneInput.current?.focus())
  }
  const reset = () => {
    setSession(null)
    setStep('message')
    setFirstMessage('')
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* No storage. */
    }
  }
  if (pathname.startsWith('/admin')) return null
  return (
    <div className={`chat-widget${open ? ' is-open' : ''}`}>
      <button
        ref={opener}
        className="chat-launcher"
        aria-label={open ? 'Свернуть чат' : 'Написать менеджеру'}
        aria-expanded={open}
        aria-controls="prorels-chat"
        onClick={() => {
          setOpen((value) => !value)
          setUnread(0)
        }}
      >
        <FiMessageSquare aria-hidden="true" />
        <span>Поможем рассчитать стоимость!</span>
        {unread > 0 && <b className="chat-badge">{unread}</b>}
      </button>
      <section
        ref={panel}
        id="prorels-chat"
        className="chat-panel"
        role="dialog"
        aria-labelledby="prorels-chat-title"
        hidden={!open}
        tabIndex={-1}
      >
        <header className="chat-panel-header">
          <div>
            <h2 id="prorels-chat-title">
              {session && !expired
                ? 'На связи с вами'
                : step === 'intro'
                  ? 'Представьтесь и начните чат!'
                  : 'Напишите ваше сообщение'}
            </h2>
            <p>
              <span className={online ? 'chat-dot connected' : 'chat-dot'} />
              {online
                ? 'Менеджеры на связи'
                : 'Пн–Пт, 8:00–17:00 · ответим в рабочее время'}
            </p>
          </div>
          <button
            aria-label="Свернуть чат"
            className="chat-icon-button"
            onClick={() => {
              setOpen(false)
              opener.current?.focus()
            }}
          >
            <FiX />
          </button>
        </header>
        {expired ? (
          <div className="chat-start">
            <p role="alert">Сессия чата истекла. Начните новую переписку.</p>
            <button className="chat-primary" onClick={reset}>
              Начать новый чат
            </button>
          </div>
        ) : session ? (
          socket ? (
            <ChatThread
              key={session.conversation.id}
              socket={socket}
              conversationId={session.conversation.id}
              active={open}
              firstMessage={firstMessage}
            />
          ) : (
            <p className="chat-hint">Подключаем чат…</p>
          )
        ) : step === 'message' ? (
          <div className="chat-thread">
            <div className="chat-messages chat-quick">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  className="chat-quick-reply"
                  onClick={() => toIntro(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
            <form
              className="chat-compose"
              onSubmit={(event) => {
                event.preventDefault()
                toIntro(message)
              }}
            >
              <label className="sr-only" htmlFor="chat-first-message">
                Сообщение
              </label>
              <textarea
                id="chat-first-message"
                placeholder="Введите сообщение"
                maxLength={4000}
                rows={2}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault()
                    toIntro(message)
                  }
                }}
              />
              <button
                type="submit"
                className="chat-send"
                aria-label="Отправить сообщение"
                disabled={!message.trim()}
              >
                <FiArrowUp aria-hidden="true" />
              </button>
            </form>
          </div>
        ) : (
          <form
            className="chat-start"
            onSubmit={(event) => {
              event.preventDefault()
              void start()
            }}
          >
            <label>
              Ваше имя
              <input
                autoComplete="name"
                name="name"
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Как к вам обращаться"
              />
            </label>
            <label>
              Ваш e-mail
              <input
                type="email"
                autoComplete="email"
                name="email"
                maxLength={100}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="mail@company.ru"
              />
            </label>
            <label>
              Ваш телефон <span className="chat-required">*</span>
              <span className="chat-phone">
                <span aria-hidden="true">+7</span>
                <input
                  ref={phoneInput}
                  type="tel"
                  autoComplete="tel-national"
                  name="phone"
                  required
                  inputMode="tel"
                  value={formatPhone(phone)}
                  onChange={(event) =>
                    setPhone(phoneDigits(event.target.value))
                  }
                  placeholder="000 000-00-00"
                  aria-invalid={phone.length > 0 && phone.length < 10}
                />
              </span>
            </label>
            <label>
              Ваше сообщение <span className="chat-required">*</span>
              <textarea
                name="message"
                required
                maxLength={4000}
                rows={2}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>
            <label className="chat-consent">
              <input
                type="checkbox"
                required
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>
                Я даю{' '}
                <a href="/privacy#consent" target="_blank" rel="noreferrer">
                  согласие
                </a>{' '}
                на обработку персональных данных и ознакомлен с{' '}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  политикой конфиденциальности
                </a>
                .
              </span>
            </label>
            {error && (
              <p className="chat-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="chat-primary"
              type="submit"
              disabled={
                busy || !accepted || phone.length < 10 || !message.trim()
              }
            >
              {busy ? 'Подключаем…' : 'Начать диалог'}
            </button>
          </form>
        )}
        {connectionError && !expired && (
          <p className="chat-error" role="status">
            {connectionError}
          </p>
        )}
      </section>
    </div>
  )
}
