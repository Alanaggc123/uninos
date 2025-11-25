"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import PostCard from "@/components/post-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface Post {
  id: string
  content: string
  image_urls: string[]
  created_at: string
  updated_at: string
  user_id: string
  full_name: string
  avatar_url: string | null
  like_count: number
  comment_count: number
}

export default function LikedPostsPage() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar usuário logado
        const resUser = await fetch("/api/auth/me")
        if (!resUser.ok) {
          router.push("/auth/login")
          return
        }
        const userData = await resUser.json()
        setUser(userData)

        // Buscar posts curtidos
        const resPosts = await fetch("/api/posts/liked")
        if (!resPosts.ok) {
          setPosts([])
          setIsLoading(false)
          return
        }
        const likedPosts: Post[] = await resPosts.json()
        // Garantir que image_urls sempre é array
        const sanitizedPosts = likedPosts.map(p => ({ ...p, image_urls: p.image_urls || [] }))
        setPosts(sanitizedPosts)
      } catch (error) {
        console.error("Erro ao buscar posts curtidos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground mt-4">Posts Curtidos</h1>
        </div>

        {posts.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Você ainda não curtiu nenhum post</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
