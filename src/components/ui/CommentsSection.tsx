import { useEffect, useRef, useState } from 'react'
import { CornerDownRight, Send, User } from 'lucide-react'
import { commentsService } from '../../services/api'
import type { Comment } from '../../types/api'

function getTokenInfo(): { id: string } | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return null }
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

interface ReplyBoxProps {
  listingId: string
  parentId: string
  onSubmit: (comment: Comment) => void
  onCancel: () => void
}

function ReplyBox({ listingId, parentId, onSubmit, onCancel }: ReplyBoxProps) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    try {
      const res = await commentsService.addComment(listingId, body.trim(), parentId)
      onSubmit(res.data.data)
      setBody('')
    } catch { /* silent */ } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 ml-8">
      <div className="flex gap-2">
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Escreva sua resposta..."
          className="flex-1 bg-[#07080e] border border-[#1e2040] rounded-lg px-3 py-2 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#00e5cc55] focus:outline-none"
        />
        <button type="submit" disabled={loading || !body.trim()} className="px-3 py-2 bg-[#00e5cc] text-[#07080e] rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#00c8b4] transition-colors">
          <Send size={14} />
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-2 border border-[#1e2040] text-white/60 rounded-lg text-sm hover:text-white transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}

interface CommentItemProps {
  comment: Comment
  listingId: string
  sellerId: string
  currentUserId: string | null
  isHighlighted: boolean
  onReplyAdded: (parentId: string, reply: Comment) => void
}

function CommentItem({ comment, listingId, sellerId, currentUserId, isHighlighted, onReplyAdded }: CommentItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [replyOpen, setReplyOpen] = useState(false)
  const isSeller = currentUserId === sellerId
  const isAuthorSeller = comment.author_id === sellerId

  useEffect(() => {
    if (isHighlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isHighlighted])

  return (
    <div
      id={`comment-${comment.id}`}
      ref={ref}
      className={`space-y-3 rounded-xl px-3 py-2 transition-colors duration-700 ${isHighlighted ? 'bg-[#00e5cc08] border border-[#00e5cc22]' : ''}`}
    >
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1e2040] flex items-center justify-center shrink-0">
          {comment.author.avatar_url ? (
            <img src={comment.author.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
          ) : (
            <User size={14} className="text-white/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#e8e8f4]">{comment.author.name}</span>
            {isAuthorSeller && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00e5cc15] text-[#00e5cc] border border-[#00e5cc30]">
                Vendedor
              </span>
            )}
            <span className="text-xs text-white/40">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-white/70 mt-1 leading-relaxed">{comment.body}</p>
          {currentUserId && isSeller && !replyOpen && (
            <button
              type="button"
              onClick={() => setReplyOpen(true)}
              className="flex items-center gap-1 mt-1.5 text-xs text-[#00e5cc] hover:text-[#00c8b4] transition-colors"
            >
              <CornerDownRight size={12} />
              Responder
            </button>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="ml-11 space-y-3 border-l border-[#1e2040] pl-4">
          {comment.replies.map(reply => (
            <div key={reply.id} id={`comment-${reply.id}`} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#1e2040] flex items-center justify-center shrink-0">
                {reply.author.avatar_url ? (
                  <img src={reply.author.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User size={12} className="text-white/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#e8e8f4]">{reply.author.name}</span>
                  {reply.author_id === sellerId && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00e5cc15] text-[#00e5cc] border border-[#00e5cc30]">
                      Vendedor
                    </span>
                  )}
                  <span className="text-xs text-white/40">{timeAgo(reply.created_at)}</span>
                </div>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">{reply.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {replyOpen && (
        <ReplyBox
          listingId={listingId}
          parentId={comment.id}
          onSubmit={reply => { onReplyAdded(comment.id, reply); setReplyOpen(false) }}
          onCancel={() => setReplyOpen(false)}
        />
      )}
    </div>
  )
}

interface CommentsSectionProps {
  listingId: string
  sellerId: string
}

export function CommentsSection({ listingId, sellerId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const currentUser = getTokenInfo()

  const highlightId = window.location.hash.replace('#comment-', '')

  useEffect(() => {
    commentsService.getComments(listingId)
      .then(r => setComments(r.data.data))
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }, [listingId])

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !currentUser) return
    setPosting(true)
    try {
      const res = await commentsService.addComment(listingId, body.trim())
      setComments(prev => [...prev, res.data.data])
      setBody('')
    } catch { /* silent */ } finally { setPosting(false) }
  }

  function handleReplyAdded(parentId: string, reply: Comment) {
    setComments(prev =>
      prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply as Comment & { replies: never[] }] } : c)
    )
  }

  return (
    <div className="mt-10">
      <h2 className="text-base font-semibold text-[#e8e8f4] mb-5">
        Perguntas e comentários
        {comments.length > 0 && <span className="ml-2 text-sm text-white/40 font-normal">({comments.length})</span>}
      </h2>

      {currentUser ? (
        <form onSubmit={handlePost} className="mb-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1e2040] flex items-center justify-center shrink-0">
              <User size={14} className="text-white/40" />
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Faça uma pergunta sobre o veículo..."
                className="flex-1 bg-[#07080e] border border-[#1e2040] rounded-xl px-4 py-2.5 text-sm text-[#e8e8f4] placeholder-white/30 focus:border-[#00e5cc55] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={posting || !body.trim()}
                className="px-4 py-2.5 bg-[#00e5cc] text-[#07080e] rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#00c8b4] transition-colors flex items-center gap-1.5"
              >
                <Send size={14} />
                Enviar
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-sm text-white/40 mb-6">
          <a href="/login" className="text-[#00e5cc] hover:underline">Faça login</a> para deixar um comentário.
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#1e2040] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#1e2040] rounded w-24" />
                <div className="h-3 bg-[#1e2040] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-8 border border-dashed border-[#1e2040] rounded-xl">
          Nenhum comentário ainda. Seja o primeiro a perguntar!
        </p>
      ) : (
        <div className="space-y-5 divide-y divide-[#1e2040]">
          {comments.map(comment => (
            <div key={comment.id} className="pt-5 first:pt-0">
              <CommentItem
                comment={comment}
                listingId={listingId}
                sellerId={sellerId}
                currentUserId={currentUser?.id ?? null}
                isHighlighted={comment.id === highlightId || comment.replies?.some(r => r.id === highlightId)}
                onReplyAdded={handleReplyAdded}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
