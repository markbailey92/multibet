import { useEffect, useRef, useState } from 'react'
import {
  BOOKMAKERS,
  getBookmaker,
  readSelectedBookmakerId,
  writeSelectedBookmakerId,
  type Bookmaker,
} from '../lib/customers'

function BookmakerMark({
  bookmaker,
  size = 'md',
}: {
  bookmaker: Bookmaker
  size?: 'sm' | 'md'
}) {
  const [useFallback, setUseFallback] = useState(false)
  const dim = size === 'sm' ? 18 : 22

  if (useFallback) {
    return (
      <span
        className="bookmaker-mark bookmaker-mark-fallback"
        style={{
          width: dim,
          height: dim,
          backgroundColor: bookmaker.fallbackColor,
          fontSize: size === 'sm' ? 7 : 8,
        }}
        aria-hidden
      >
        {bookmaker.fallbackLabel}
      </span>
    )
  }

  return (
    <img
      className="bookmaker-mark"
      src={bookmaker.icon}
      alt=""
      width={dim}
      height={dim}
      onError={() => setUseFallback(true)}
    />
  )
}

export function AppHeader({
  showProduct = true,
}: {
  showProduct?: boolean
}) {
  const [bookmakerId, setBookmakerId] = useState(readSelectedBookmakerId)
  const [open, setOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const selected = getBookmaker(bookmakerId) ?? BOOKMAKERS[0]

  useEffect(() => {
    writeSelectedBookmakerId(bookmakerId)
  }, [bookmakerId])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="site-header-left">
        <img
          className="site-logo"
          src="/genius-sports-logo.png"
          alt="Genius Sports"
        />
        {showProduct && (
          <div className="site-product">
            <span className="site-product-name">MultiBet</span>
            <span className="site-product-sub">Templates</span>
          </div>
        )}
      </div>

      <div className="customer-picker" ref={pickerRef}>
        <span className="customer-picker-label" id="bookmaker-picker-label">
          Bookmaker
        </span>
        <button
          type="button"
          className={`customer-picker-trigger ${open ? 'is-open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby="bookmaker-picker-label"
          onClick={() => setOpen((current) => !current)}
        >
          {selected && <BookmakerMark bookmaker={selected} />}
          <span className="customer-picker-trigger-name">
            {selected?.name ?? 'Select'}
          </span>
        </button>

        {open && (
          <ul className="customer-picker-menu" role="listbox" aria-label="Bookmakers">
            {BOOKMAKERS.map((bookmaker) => {
              const isActive = bookmaker.id === bookmakerId
              return (
                <li key={bookmaker.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`customer-picker-option ${isActive ? 'is-selected' : ''}`}
                    onClick={() => {
                      setBookmakerId(bookmaker.id)
                      setOpen(false)
                    }}
                  >
                    <BookmakerMark bookmaker={bookmaker} size="sm" />
                    <span>{bookmaker.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </header>
  )
}
