import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Car, Heart, LogOut, Menu, Plus, Search, User, X } from 'lucide-react'

import { useNotifications } from '../../hooks/useNotifications'
import { NotificationDropdown } from '../ui/NotificationDropdown'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const close = () => setMenuOpen(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const { count, recent, markRead, refreshRecent } = useNotifications()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/anuncios?q=${encodeURIComponent(query.trim())}`)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#00e5cc] to-[#7b5cf0] flex items-center justify-center">
              <Car size={16} className="text-[#07080e]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Auto<span className="text-[#00e5cc]">Fácil</span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Busque por marca, modelo..."
                className="w-full bg-[#0c0e1a] border border-[#1e2040] rounded-lg pl-9 pr-4 py-2 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#00e5cc55] transition-colors"
              />
            </div>
          </form>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/anuncios" className="px-3 py-2 text-sm text-white/60 hover:text-[#e8e8f4] transition-colors">
              Anúncios
            </Link>

            {token ? (
              <>
                <Link
                  to="/criar-anuncio"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[#00e5cc] text-[#07080e] hover:bg-[#00c8b4] transition-colors"
                >
                  <Plus size={15} />
                  Criar Anúncio
                </Link>
                <Link to="/favoritos" className="p-2 text-white/60 hover:text-[#e8e8f4] transition-colors">
                  <Heart size={18} />
                </Link>
                <Link to="/perfil" className="p-2 text-white/60 hover:text-[#e8e8f4] transition-colors">
                  <User size={18} />
                </Link>

                {/* Bell with dropdown */}
                <div ref={bellRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setBellOpen(v => !v)}
                    className="relative p-2 text-white/60 hover:text-[#e8e8f4] transition-colors"
                    title="Notificações"
                  >
                    <Bell size={18} />
                    {count > 0 && (
                      <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 rounded-full bg-[#00e5cc] text-[#07080e] text-[10px] font-bold flex items-center justify-center leading-none">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </button>
                  {bellOpen && (
                    <NotificationDropdown
                      count={count}
                      recent={recent}
                      onClose={() => setBellOpen(false)}
                      onMarkRead={markRead}
                      onRefreshRecent={refreshRecent}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-white/60 hover:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm text-white/60 hover:text-[#e8e8f4] transition-colors">
                  Entrar
                </Link>
                <Link to="/cadastro" className="px-4 py-2 text-sm font-medium rounded-lg bg-[#00e5cc] text-[#07080e] hover:bg-[#00c8b4] transition-colors">
                  Cadastrar
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 text-white/60 hover:text-[#e8e8f4] transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/5 px-4 pb-4 pt-2 space-y-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-[#0c0e1a] border border-[#1e2040] rounded-lg pl-9 pr-4 py-2 text-sm text-[#e8e8f4] placeholder-white/30"
              />
            </div>
          </form>
          <Link to="/anuncios" onClick={close} className="block py-2 text-sm text-white/60 hover:text-white">Anúncios</Link>
          {token ? (
            <>
              <Link to="/criar-anuncio" onClick={close} className="flex items-center gap-1.5 py-2 text-sm font-medium text-[#00e5cc]">
                <Plus size={14} />Criar Anúncio
              </Link>
              <Link to="/favoritos" onClick={close} className="block py-2 text-sm text-white/60 hover:text-white">Favoritos</Link>
              <Link to="/perfil" onClick={close} className="block py-2 text-sm text-white/60 hover:text-white">Perfil</Link>
              <Link
                to="/perfil?tab=notifications"
                onClick={() => { markRead(); close() }}
                className="flex items-center gap-2 py-2 text-sm text-white/60 hover:text-white"
              >
                <Bell size={14} />
                Notificações
                {count > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#00e5cc] text-[#07080e] text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </Link>
              <button type="button" onClick={handleLogout} className="block py-2 text-sm text-red-400">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close} className="block py-2 text-sm text-white/60 hover:text-white">Entrar</Link>
              <Link to="/cadastro" onClick={close} className="block py-2 text-sm text-[#00e5cc]">Cadastrar</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
