"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ImageIcon, X } from "lucide-react"

interface CreatePostProps {
  onPostCreated?: () => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreview = reader.result as string
        setImagePreviews((prev) => [...prev, newPreview])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const imageUrls: string[] = []

      // Save all images to localStorage with unique keys
      imageFiles.forEach((imageFile, idx) => {
        const imageKey = `post-image-${user.id}-${Date.now()}-${idx}`
        const reader = new FileReader()
        reader.onloadend = () => {
          localStorage.setItem(imageKey, reader.result as string)
        }
        reader.readAsDataURL(imageFile)
        imageUrls.push(imageKey)
      })

      // Wait a bit for all localStorage items to be set
      await new Promise((resolve) => setTimeout(resolve, 100))

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
        image_urls: imageUrls.length > 0 ? imageUrls : [],
      })

      if (error) throw error

      setContent("")
      setImageFiles([])
      setImagePreviews([])
      onPostCreated?.()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6 border-0 shadow-sm sticky top-20 z-40">
      <CardContent className="p-4">
        <form onSubmit={handlePost} className="space-y-3">
          <Textarea
            placeholder="O que está em sua mente?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="resize-none bg-secondary"
            rows={3}
          />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${idx + 1}`}
                    className="w-full rounded-lg max-h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-center flex-wrap">
            <label htmlFor="image-input" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("image-input")?.click()
                }}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Adicionar Imagens
              </Button>
            </label>
            <Input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              multiple
            />
            <div className="flex-1" />
            <Button
              type="submit"
              disabled={!content.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Postando..." : "Postar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
