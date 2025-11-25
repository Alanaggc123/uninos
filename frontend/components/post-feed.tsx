"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import PostCard from "@/components/post-card"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Post {
  id: string
  user_id: string
  content: string
  image_urls: string[]
  created_at: string
  updated_at: string
  full_name: string
  avatar_url: string | null
  like_count: number
  comment_count: number
}

export default function PostFeed({ userId, refreshTrigger }: { userId: string; refreshTrigger?: number }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient()
      if (!supabase) return

      try {
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("id, user_id, content, image_urls, created_at, updated_at")
          .order("created_at", { ascending: false })

        if (postsError) throw postsError

        const enrichedPosts = await Promise.all(
          (postsData || []).map(async (post) => {
            const [profileRes, likesRes, commentsRes] = await Promise.all([
              supabase.from("profiles").select("full_name, avatar_url").eq("id", post.user_id).single(),
              supabase.from("likes").select("id", { count: "exact" }).eq("post_id", post.id),
              supabase.from("comments").select("id", { count: "exact" }).eq("post_id", post.id),
            ])

            return {
              ...post,
              full_name: profileRes.data?.full_name || "Usuário Desconhecido",
              avatar_url: profileRes.data?.avatar_url || null,
              like_count: likesRes.count || 0,
              comment_count: commentsRes.count || 0,
            }
          }),
        )

        setPosts(enrichedPosts)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()

    const supabase = createClient()
    if (!supabase) return

    const channel = supabase
      .channel("posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts()
      })
      .subscribe()

    setSubscription(channel)

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [refreshTrigger])

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando posts...</div>
  }

  if (posts.length === 0) {
    return <div className="text-center text-muted-foreground py-8">Nenhum post ainda. Seja o primeiro a postar!</div>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={userId} />
      ))}
    </div>
  )
}
