import { supabase } from './supabaseClient'

export const BLOG_IMAGES_BUCKET = 'blog-images'

export async function uploadImage(args: {
  userId: string
  folder: 'posts' | 'comments'
  file: File
}) {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const ext = args.file.name.split('.').pop() || 'png'
  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`
  const path = `${args.userId}/${args.folder}/${fileName}`

  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, args.file, {
    cacheControl: '3600',
    upsert: false,
    contentType: args.file.type || undefined,
  })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path)
  return {
    path,
    publicUrl: data.publicUrl,
  }
}
