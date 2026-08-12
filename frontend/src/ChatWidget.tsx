import { useEffect, useRef, useState } from 'react'

import { sendChatMessage } from './api'
import { CloseIcon, SendIcon, SparkIcon, TrashIcon } from './icons'

const SUGGESTIONS = [
  'What needs ordering today?',
  "What isn't selling?",
  'What expires this week?',
]

type ChatEntry = {
  role: 'user' | 'assistant'
  content: string
  at: Date
}

function clockTime(value: Date): string {
  return value.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<ChatEntry[]>([])
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [entries, thinking])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function resizeInput() {
    const field = inputRef.current
    if (!field) return
    field.style.height = 'auto'
    field.style.height = `${Math.min(field.scrollHeight, 120)}px`
  }

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || thinking) return

    setEntries((current) => [
      ...current,
      { role: 'user', content: trimmed, at: new Date() },
    ])
    setDraft('')
    setThinking(true)
    setError(null)

    if (inputRef.current) inputRef.current.style.height = 'auto'

    sendChatMessage({ conversation_id: conversationId, message: trimmed })
      .then((response) => {
        setConversationId(response.conversation_id)
        setEntries((current) => [
          ...current,
          { role: 'assistant', content: response.reply, at: new Date() },
        ])
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setThinking(false))
  }

  function clearChat() {
    setEntries([])
    setConversationId(null)
    setError(null)
    inputRef.current?.focus()
  }

  if (!open) {
    return (
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen(true)}
        aria-label="Open assistant"
      >
        <span className="chat-fab-glyph">
          <SparkIcon />
        </span>
        <span className="chat-fab-label">Ask assistant</span>
      </button>
    )
  }

  return (
    <section className="chat-panel" aria-label="Assistant">
      <header className="chat-head">
        <span className="chat-avatar chat-avatar-head">
          <SparkIcon />
        </span>
        <div className="chat-title">
          <strong>Assistant</strong>
          <span className="chat-sub">
            <i className="chat-dot" />
            Reads your live stock position
          </span>
        </div>
        <div className="chat-actions">
          {entries.length > 0 && (
            <button
              type="button"
              className="chat-icon-btn"
              onClick={clearChat}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <TrashIcon />
            </button>
          )}
          <button
            type="button"
            className="chat-icon-btn"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <div className="chat-body" ref={scrollRef}>
        {entries.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-glyph">
              <SparkIcon />
            </span>
            <p className="chat-empty-title">How can I help?</p>
            <p className="chat-empty-sub">
              I read the same numbers as your dashboard.
            </p>
            <div className="chat-chips">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="chat-chip"
                  onClick={() => send(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div key={index} className={`turn turn-${entry.role}`}>
              {entry.role === 'assistant' && (
                <span className="chat-avatar chat-avatar-msg">
                  <SparkIcon />
                </span>
              )}
              <div className="turn-body">
                <div className={`bubble bubble-${entry.role}`}>
                  {entry.content}
                </div>
                <time className="turn-time">{clockTime(entry.at)}</time>
              </div>
            </div>
          ))
        )}

        {thinking && (
          <div className="turn turn-assistant">
            <span className="chat-avatar chat-avatar-msg">
              <SparkIcon />
            </span>
            <div className="turn-body">
              <div className="bubble bubble-assistant bubble-thinking">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        {error && <div className="chat-error">{error}</div>}
      </div>

      <div className="chat-input">
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          placeholder="Ask about stock, sales or expiry"
          onChange={(event) => {
            setDraft(event.target.value)
            resizeInput()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              send(draft)
            }
          }}
          aria-label="Message"
        />
        <button
          type="button"
          className="chat-send"
          disabled={!draft.trim() || thinking}
          onClick={() => send(draft)}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
    </section>
  )
}
