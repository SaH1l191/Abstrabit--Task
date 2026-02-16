export interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  tags?: string[]
  user_id: string
  created_at: string
  updated_at: string
}
