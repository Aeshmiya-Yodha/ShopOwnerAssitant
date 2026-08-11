import { useEffect, useRef, useState } from 'react'

import { sendChatMessage } from './api'

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

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"
        fill="currentColor"
      />
      <path
        d="M18.5 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  )
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
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 7h12M10 7V5h4v2m-7 0l1 12h8l1-12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="chat-icon-btn"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
            title="Close"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 7l10 10M17 7L7 17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
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
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 19V5M12 5l-6 6M12 5l6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  )
}
