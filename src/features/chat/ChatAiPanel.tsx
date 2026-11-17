import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { chatRequest, type ChatAiState } from './chat-client'

export function AiCountdown({ state }: { state: ChatAiState }) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const sendAt = state.draft?.sendAt
  useEffect(() => {
    if (!sendAt) return
    // Use server time and a monotonic local clock; the device clock may be wrong.
    const initial = Math.max(
      0,
      Date.parse(sendAt) - Date.parse(state.serverNow),
    )
    const started = performance.now()
    const tick = () =>
      setRemaining(
        Math.max(
          0,
          Math.ceil((initial - (performance.now() - started)) / 1000),
        ),
      )
    tick()
    const timer = window.setInterval(tick, 100)
    return () => window.clearInterval(timer)
  }, [sendAt, state.serverNow])
  return (
    <span className="chat-ai-countdown">
      {remaining === null
        ? 'ИИ · черновик'
        : remaining > 0
          ? `ИИ · отправка через ${remaining} с`
          : 'ИИ · отправляется…'}
    </span>
  )
}

export function ChatAiPanel({
  socket,
  conversationId,
  state,
  connected,
  closed,
}: {
  socket: Socket
  conversationId: string
  state?: ChatAiState
  connected: boolean
  closed: boolean
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!state) return null
  const draft = state.draft
  const pending = state.configured && state.enabled && draft?.status === 'PENDING'
  const generating =
    state.configured && state.enabled &&
    (draft?.status === 'GENERATING' || draft?.status === 'QUEUED')
  const change = async (enabled: boolean, cancel = false) => {
    setBusy(true)
    setError('')
    try {
      await chatRequest(socket, cancel ? 'chat:ai:cancel' : 'chat:ai:mode', {
        conversationId,
        ...(cancel ? { draftId: draft?.id } : { enabled }),
      })
    } catch (failure) {
      setError((failure as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="chat-ai-panel" aria-label="ИИ-консультант">
      <div className="chat-ai-toolbar">
        <strong>
          {!state.configured
            ? 'ИИ ещё не подключён'
            : !state.enabled
              ? 'Отвечает менеджер'
              : 'ИИ-консультант включён'}
        </strong>
        {state.configured && !closed && (
          <button
            disabled={!connected || busy}
            onClick={() => void change(!state.enabled, !!pending)}
          >
            {state.enabled
              ? pending
                ? 'Отменить ответ и взять чат'
                : 'Взять чат на себя'
              : 'Включить ИИ'}
          </button>
        )}
      </div>
      {!state.configured && (
        <p>
          Обычный чат работает. Для ИИ нужно подключить GigaChat на сервере.
        </p>
      )}
      {state.configured && state.enabled && !pending && (
        <p>Ручной ответ выключит ИИ в этой переписке.</p>
      )}
      {generating && (
        <p role="status">
          ИИ готовит черновик… После подготовки будет 7 секунд на отмену.
        </p>
      )}
      {pending && (
        <div className="chat-ai-preview">
          <AiCountdown key={draft.id} state={state} />
          <span className="chat-ai-private">
            Черновик · посетитель его ещё не видит
          </span>
          <p className="chat-ai-body">{draft.body}</p>
        </div>
      )}
      {state.enabled && draft?.status === 'FAILED' && (
        <p role="status">
          {draft.error}{' '}
          <button
            disabled={!connected || busy}
            onClick={() => void change(true)}
          >
            Повторить
          </button>
        </p>
      )}
      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
