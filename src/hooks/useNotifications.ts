import { useCallback, useEffect, useState } from 'react'

import { commentsService } from '../services/api'
import type { NotificationItem } from '../types/api'

export function useNotifications() {
  const [count, setCount] = useState(0)
  const [recent, setRecent] = useState<NotificationItem[]>([])
  const token = localStorage.getItem('token')

  const fetchCount = useCallback(() => {
    if (!token) return
    commentsService.getUnreadCount()
      .then(r => setCount(r.data.data.count))
      .catch(() => {})
  }, [token])

  const fetchRecent = useCallback(() => {
    if (!token) return
    commentsService.getNotifications({ page: 1, per_page: 5 })
      .then(r => setRecent(r.data.data.notifications))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [fetchCount])

  const markRead = useCallback(async () => {
    if (!token) return
    await commentsService.markAllRead()
    setCount(0)
  }, [token])

  return { count, recent, markRead, refresh: fetchCount, refreshRecent: fetchRecent }
}
