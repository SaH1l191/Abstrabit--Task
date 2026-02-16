'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Bookmark } from '@/types/bookmark'
import { Trash2, ExternalLink, Tag } from 'lucide-react'

interface BookmarkListProps {
  refreshTrigger?: number
}

export function BookmarkList({ refreshTrigger }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchTerm])

  useEffect(() => {
    let mounted = true
    let channel: any = null
    
    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) return

        await fetchBookmarks()
        
        channel = supabase
          .channel(`bookmarks_${user.id}`)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'bookmarks'
            },
            (payload: any) => {
              if (mounted) {
                if (payload.eventType === 'INSERT') {
                  setBookmarks(prev => [payload.new as Bookmark, ...prev])
                } else if (payload.eventType === 'DELETE') {
                  setBookmarks(prev => prev.filter(b => b.id !== payload.old.id))
                } else if (payload.eventType === 'UPDATE') {
                  setBookmarks(prev => 
                    prev.map(b => b.id === payload.new.id ? payload.new as Bookmark : b)
                  )
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              setTimeout(() => {
                if (mounted) setupSubscription()
              }, 3000)
            }
          })
      } catch (error) {
        setTimeout(() => {
          if (mounted) setupSubscription()
        }, 3000)
      }
    }

    setupSubscription()

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [refreshTrigger])

  const fetchBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setLoading(true)
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      })

      const dataPromise = supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any

      if (error) throw error
      setBookmarks(data || [])
    } catch (error: any) {
      if (error?.message === 'Request timeout') {
        setTimeout(() => fetchBookmarks(), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    bookmark.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            {debouncedSearchTerm ? 'No bookmarks found matching your search.' : 'No bookmarks yet. Add your first bookmark above!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {bookmark.title}
                </h3>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Delete bookmark"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm mb-3 inline-flex items-center gap-1 break-all"
              >
                <ExternalLink className="h-3 w-3" />
                {bookmark.url}
              </a>

              {bookmark.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {bookmark.description}
                </p>
              )}

              {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400">
                Added {new Date(bookmark.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
