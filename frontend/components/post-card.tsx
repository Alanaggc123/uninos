"use client"

import type React from "react"
import { getImageUrl } from "@/lib/image-utils"
import ImageLightbox from "@/components/image-lightbox" // Import ImageLightbox component
import { Flag } from "lucide-react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, MoreVertical } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import Link from "next/link"

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

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
  full_name: string
  avatar_url: string | null
  profiles?: { full_name: string; avatar_url: string | null }
}

export default function PostCard({
  post,
  currentUserId,
  onPostDeleted,
}: { post: Post; currentUserId: string; onPostDeleted?: (postId: string) => void }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [commentCount, setCommentCount] = useState(post.comment_count)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [isReported, setIsReported] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")
  const [reportedComments, setReportedComments] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // Add image lightbox state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showCommentReportDialog, setShowCommentReportDialog] = useState(false) // New state for comment report dialog
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null) // State to track the comment ID being reported

  useEffect(() => {
    const checkIfLiked = async () => {
      const supabase = createClient()
      if (!supabase) return

      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUserId)
        .maybeSingle()
      setIsLiked(!!data)
    }

    checkIfLiked()
  }, [post.id, currentUserId])

  useEffect(() => {
    const checkIfReported = async () => {
      const supabase = createClient()
      if (!supabase) return

      const { data } = await supabase
        .from("reports")
        .select("id")
        .eq("post_id", post.id)
        .eq("user_id", currentUserId)
        .maybeSingle()
      setIsReported(!!data)
    }

    if (post.user_id !== currentUserId) {
      checkIfReported()
    }
  }, [post.id, currentUserId, post.user_id])

  const handleLike = async () => {
    const supabase = createClient()
    if (!supabase) return

    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)
        setLikeCount((prev) => prev - 1)
      } else {
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        })
        setLikeCount((prev) => prev + 1)

        if (post.user_id !== currentUserId) {
          await supabase.from("notifications").insert({
            user_id: post.user_id,
            type: "like",
            content: `curtiu sua publicação`,
            post_id: post.id,
            sender_id: currentUserId,
          })
        }
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleLoadComments = async () => {
    const supabase = createClient()
    if (!supabase) return

    try {
      const { data: commentsData } = await supabase
        .from("comments")
        .select("id, content, created_at, updated_at, user_id")
        .eq("post_id", post.id)
        .order("created_at", { ascending: false })

      const enrichedComments = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", comment.user_id)
            .single()

          return {
            ...comment,
            profiles: profileData,
          }
        }),
      )

      setComments(enrichedComments)

      // Load reported comments for current user
      const { data: reportedData } = await supabase
        .from("comment_reports")
        .select("comment_id")
        .eq("user_id", currentUserId)

      setReportedComments(reportedData?.map((r) => r.comment_id) || [])
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const supabase = createClient()
    if (!supabase) return

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment,
      })
      if (error) throw error

      if (post.user_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "comment",
          content: `comentou em sua publicação`,
          post_id: post.id,
          sender_id: currentUserId,
        })
      }

      setNewComment("")
      setCommentCount((prev) => prev + 1)
      handleLoadComments()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentContent.trim()) return

    const supabase = createClient()
    if (!supabase) return

    try {
      const { error } = await supabase
        .from("comments")
        .update({ content: editingCommentContent, updated_at: new Date().toISOString() })
        .eq("id", commentId)
        .eq("user_id", currentUserId)

      if (error) throw error
      setEditingCommentId(null)
      setEditingCommentContent("")
      handleLoadComments()
    } catch (error) {
      console.error("Error editing comment:", error)
    }
  }

  const handleReportComment = async () => {
    if (!reportingCommentId) return

    const supabase = createClient()
    if (!supabase) return

    try {
      await supabase.from("comment_reports").insert({
        comment_id: reportingCommentId,
        user_id: currentUserId,
        reason: reportReason,
      })
      setReportedComments([...reportedComments, reportingCommentId])
      setShowCommentReportDialog(false)
      setReportReason("")
      setReportingCommentId(null)
    } catch (error: any) {
      console.error("Error reporting comment:", error?.message || "Unknown error")
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) return

    const supabase = createClient()
    if (!supabase) return

    try {
      const { error } = await supabase.from("reports").insert({
        post_id: post.id,
        user_id: currentUserId,
        reason: reportReason,
      })
      if (!error) {
        setIsReported(true)
        setShowReportDialog(false)
        setReportReason("")
      }
    } catch (error) {
      console.error("Error reporting post:", error)
    }
  }

  const handleEditPost = async () => {
    const supabase = createClient()
    if (!supabase) return

    setIsEditing(true)
    try {
      const { error } = await supabase
        .from("posts")
        .update({ content: editContent, updated_at: new Date().toISOString() })
        .eq("id", post.id)
        .eq("user_id", currentUserId)

      if (error) throw error
      setShowEditDialog(false)
      // Update the post content in place
      post.content = editContent
      post.updated_at = new Date().toISOString()
    } catch (error) {
      console.error("Error editing post:", error)
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeletePost = async () => {
    const supabase = createClient()
    if (!supabase) return

    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id).eq("user_id", currentUserId)

      if (error) throw error
      setShowDeleteDialog(false)
      onPostDeleted?.(post.id)
    } catch (error) {
      console.error("Error deleting post:", error)
    }
  }

  const getAvatarUrl = (avatarRef: string | null) => {
    return getImageUrl(avatarRef)
  }

  const getEditIndicator = () => {
    if (post.updated_at === post.created_at) return null
    const editDate = new Date(post.updated_at)
    return editDate.toLocaleDateString("pt-BR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Link href={`/profile/${post.user_id}`}>
              <div className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {post.avatar_url ? (
                    <img
                      src={getAvatarUrl(post.avatar_url) || "/placeholder.svg"}
                      alt={post.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-primary">{post.full_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{post.full_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("pt-BR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {getEditIndicator() && <span className="italic"> (editado em {getEditIndicator()})</span>}
                  </p>
                </div>
              </div>
            </Link>

            {post.user_id === currentUserId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>Editar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              !isReported && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportDialog(true)}
                  className="text-destructive hover:text-destructive/80 font-semibold"
                  title="Denunciar post"
                  disabled={isReported}
                >
                  <Flag className={`w-4 h-4 ${isReported ? "opacity-50" : ""}`} />
                </Button>
              )
            )}
            {isReported && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground opacity-50 cursor-not-allowed"
                disabled
                title="Post já denunciado"
              >
                <Flag className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

          {post.image_urls && post.image_urls.length > 0 && (
            <div
              className={`grid ${post.image_urls.length === 1 ? "grid-cols-1" : post.image_urls.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-2`}
            >
              {post.image_urls.map((imageUrl, idx) => {
                const imageData = getAvatarUrl(imageUrl)
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(imageData)
                      setSelectedImageIndex(idx)
                    }}
                    className="relative group cursor-pointer"
                  >
                    <img
                      src={imageData || "/placeholder.svg?height=400&width=400"}
                      alt={`Post image ${idx + 1}`}
                      className="w-full rounded-lg max-h-96 object-cover group-hover:opacity-80 transition-opacity"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                      }}
                    />
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex gap-4 text-sm text-muted-foreground border-t pt-3">
            <button onClick={handleLike} className="flex items-center gap-1 hover:text-primary transition-colors">
              <Heart className={`w-4 h-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
              {likeCount}
            </button>
            <button
              onClick={() => {
                setShowComments(!showComments)
                if (!showComments) handleLoadComments()
              }}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {commentCount}
            </button>
          </div>

          {showComments && (
            <div className="space-y-4 mt-4">
              <form onSubmit={handleAddComment} className="space-y-2">
                <Textarea
                  placeholder="Escreva um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="text-sm resize-none bg-secondary"
                  rows={2}
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Comentar
                </Button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-2 bg-secondary rounded text-sm">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {comment.profiles?.avatar_url ? (
                          <img
                            src={getAvatarUrl(comment.profiles.avatar_url) || "/placeholder.svg"}
                            alt={comment.profiles?.full_name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-primary">
                            {comment.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-foreground">
                              {comment.profiles?.full_name || "Usuário"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                              })}{" "}
                              às{" "}
                              {new Date(comment.created_at).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {comment.updated_at && comment.updated_at !== comment.created_at && (
                                <span className="ml-1 italic">
                                  (editado em{" "}
                                  {new Date(comment.updated_at).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                  })}{" "}
                                  às{" "}
                                  {new Date(comment.updated_at).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  )
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {currentUserId === comment.user_id ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="text-xs h-auto p-0 px-1 text-muted-foreground hover:text-primary"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingCommentId(comment.id)
                                      setEditingCommentContent(comment.content)
                                    }}
                                  >
                                    Editar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  if (reportedComments.includes(comment.id)) {
                                    alert("Você já denunciou este comentário")
                                  } else {
                                    setReportingCommentId(comment.id)
                                    setShowCommentReportDialog(true)
                                  }
                                }}
                                disabled={reportedComments.includes(comment.id)}
                                className={`text-xs h-auto p-0 px-1 ${
                                  reportedComments.includes(comment.id)
                                    ? "text-muted-foreground opacity-50 cursor-not-allowed"
                                    : "text-destructive hover:text-destructive/80"
                                }`}
                                title={
                                  reportedComments.includes(comment.id)
                                    ? "Comentário já denunciado"
                                    : "Denunciar comentário"
                                }
                              >
                                <Flag className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="space-y-2 mt-2">
                            <Textarea
                              value={editingCommentContent}
                              onChange={(e) => setEditingCommentContent(e.target.value)}
                              className="text-sm resize-none bg-background"
                              rows={2}
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment.id)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCommentId(null)
                                  setEditingCommentContent("")
                                }}
                                className="text-xs"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-foreground mt-1">{comment.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Denunciar Post</AlertDialogTitle>
            <AlertDialogDescription>Por favor, indique o motivo da denúncia</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Textarea
                id="reason"
                placeholder="Conteúdo ofensivo, spam, etc..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="resize-none bg-secondary"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              disabled={!reportReason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Denunciar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar Post</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="resize-none bg-secondary"
              rows={4}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEditPost}
              disabled={isEditing || editContent === post.content}
              className="bg-primary hover:bg-primary/90"
            >
              {isEditing ? "Salvando..." : "Salvar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Post</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comment Report Dialog */}
      <AlertDialog open={showCommentReportDialog} onOpenChange={setShowCommentReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Denunciar Comentário</AlertDialogTitle>
            <AlertDialogDescription>Por favor, indique o motivo da denúncia</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="commentReason">Motivo</Label>
              <Textarea
                id="commentReason"
                placeholder="Conteúdo ofensivo, spam, etc..."
                className="resize-none bg-secondary"
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel
              onClick={() => {
                setReportReason("")
                setReportingCommentId(null)
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportComment}
              className="bg-destructive hover:bg-destructive/90"
              disabled={!reportReason.trim()}
            >
              Denunciar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox Component */}
      {selectedImage && (
        <ImageLightbox
          images={post.image_urls?.map((img) => getAvatarUrl(img) || "/placeholder.svg") || []}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  )
}
