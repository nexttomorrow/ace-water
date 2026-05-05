export type Profile = {
  id: string
  nickname: string | null
  role: 'user' | 'admin'
  created_at: string
}

export type Post = {
  id: number
  author_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export type PostWithAuthor = Post & {
  author: Pick<Profile, 'nickname'> | null
}

export type GalleryItem = {
  id: number
  title: string
  description: string | null
  image_path: string
  created_at: string
}

export type Category = {
  id: number
  parent_id: number | null
  name: string
  slug: string | null
  image_path: string | null
  display_type: 'tile' | 'link'
  href: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type CategoryWithChildren = Category & {
  children: Category[]
}

export type HeroSlide = {
  id: number
  eyebrow: string
  title: string
  image_path: string
  sort_order: number
  created_at: string
}

export const HERO_SLIDES_MAX = 6
