import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, MessageCircle } from 'lucide-react'

import type { NotificationItem } from '../../types/api'

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`
  return new Date(date).toLocaleDateString('pt-BR')
}

interface Props {
  count: number
  recent: NotificationItem[]
  onClose: () => void
  onMarkRead: () => void
  onRefreshRecent: () => void
}

export function NotificationDropdown({ count, recent, onClose, onMarkRead, onRefreshRecent }: Props) {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onRefreshRecent()
  }, [onRefreshRecent])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  function handleGoToNotif(notif: NotificationItem) {
    onMarkRead()
    onClose()
    navigate(`/anuncios/${notif.listing_id}#comment-${notif.id}`)
  }


  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 bg-[#0c0e1a] border border-[#1e2040] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2040]">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-[#00e5cc]" />
          <span className="text-sm font-semibold text-[#e8e8f4]">Notificações</span>
          {count > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#00e5cc] text-[#07080e] text-[10px] font-bold">
              {count}
            </span>
          )}
        </div>
        {count > 0 && (
          <button
            type="button"
            onClick={onMarkRead}
            className="text-[10px] text-white/40 hover:text-[#00e5cc] transition-colors"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell size={28} className="text-white/10 mb-2" />
            <p className="text-sm text-white/40">Nenhuma notificação</p>
          </div>
        ) : (
          recent.map(notif => (
            <button
              key={notif.id}
              type="button"
              onClick={() => handleGoToNotif(notif)}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left border-b border-[#1e2040]/60 last:border-0 ${
                !notif.is_read ? 'bg-[#00e5cc06]' : ''
              }`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#1e2040] flex items-center justify-center shrink-0 mt-0.5">
                {notif.author.avatar_url ? (
                  <img src={notif.author.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-xs font-bold text-white/50">
                    {notif.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-[#e8e8f4] truncate">{notif.author.name}</span>
                  <span className="text-[10px] text-white/40 shrink-0">{timeAgo(notif.created_at)}</span>
                </div>
                <p className="text-[11px] text-white/40 truncate">
                  {notif.notification_type === 'reply'
                    ? 'Respondeu seu comentário'
                    : notif.listing_title}
                </p>
                {notif.notification_type === 'reply' && notif.parent_body && (
                  <p className="text-[11px] text-white/30 truncate italic mt-0.5">"{notif.parent_body}"</p>
                )}
                <p className="text-xs text-white/60 mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
              </div>

              {!notif.is_read && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#00e5cc] shrink-0 mt-2" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e2040] px-4 py-2.5">
        <Link
          to="/perfil?tab=notifications"
          onClick={() => { onMarkRead(); onClose() }}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-[#00e5cc] hover:text-[#00c8b4] transition-colors py-1"
        >
          <MessageCircle size={12} />
          Ver todas as notificações
        </Link>
      </div>
    </div>
  )
}
