import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'

import { fipeService } from '../../services/fipe'

interface Props {
  inputClassName?: string
  wrapperClassName?: string
  size?: 'sm' | 'md'
  /** When provided, calls this instead of navigating */
  onSelect?: (brand: string) => void
  /** Shows a pre-filled value (for filter panels) */
  initialValue?: string
}

export function BrandSearchInput({
  inputClassName,
  wrapperClassName,
  size = 'sm',
  onSelect,
  initialValue = '',
}: Props) {
  const [query, setQuery] = useState(initialValue)
  const [brands, setBrands] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fipeService.getMarcas('carros')
      .then(marcas => setBrands(marcas.map(m => m.nome)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length > 0) {
      setSuggestions(
        brands.filter(b => b.toLowerCase().includes(val.toLowerCase())).slice(0, 8)
      )
      setOpen(true)
    } else {
      setSuggestions([])
      setOpen(false)
      if (onSelect) onSelect('')
    }
  }

  function handleSelect(brand: string) {
    setQuery(brand)
    setOpen(false)
    if (onSelect) {
      onSelect(brand)
    } else {
      navigate(`/anuncios?brand=${encodeURIComponent(brand)}`)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOpen(false)
    const val = query.trim()
    if (onSelect) {
      onSelect(val)
    } else {
      if (val) navigate(`/anuncios?brand=${encodeURIComponent(val)}`)
      else navigate('/anuncios')
    }
  }

  function handleClear() {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    if (onSelect) onSelect('')
  }

  const iconSize = size === 'md' ? 16 : 15

  return (
    <div ref={ref} className={`relative ${wrapperClassName ?? 'w-full'}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={iconSize}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Digite a Marca"
            autoComplete="off"
            className={inputClassName}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0c0e1a] border border-[#1e2040] rounded-xl shadow-2xl shadow-black/60 z-9999 overflow-y-auto max-h-72">
          {suggestions.map(brand => (
            <button
              key={brand}
              type="button"
              onClick={() => handleSelect(brand)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/4 hover:text-[#e8e8f4] transition-colors text-left"
            >
              <Search size={12} className="text-white/30 shrink-0" />
              {brand}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
