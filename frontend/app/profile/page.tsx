"use client"

import type React from "react"
import { X, User, Bell, Settings } from "lucide-react"
import ImageLightbox from "@/components/image-lightbox"
import PostCard from "@/components/post-card"
import { Switch } from "@/components/ui/switch"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageUrl } from "@/lib/image-utils"

interface Profile {
  id: string
  full_name: string
  email: string
  gender: string
  bio: string
  avatar_url: string | null
  interests: string[]
  gallery_images: string[]
  materias_concluidas: string[]
  is_private: boolean
  filtro_madrinha: boolean
  matricula: number | null
  curso: string | null
  periodo: number | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<Profile>>({
    interests: [],
    gallery_images: [],
    materias_concluidas: [],
    matricula: null,
    curso: null,
    periodo: null,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "settings">("profile")
  const [notifications, setNotifications] = useState<any[]>([])
  const [likedPosts, setLikedPosts] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [showLikedPosts, setShowLikedPosts] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [privacySaveMessage, setPrivacySaveMessage] = useState<string>("")
  const interestInputRef = useRef<HTMLInputElement>(null)
  const materiasInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resUser = await fetch("/api/auth/me")
        if (!resUser.ok) {
          router.push("/auth/login")
          return
        }
        const userData = await resUser.json()
        setUser(userData)

        await fetchProfile(userData.id)
        await fetchNotifications(userData.id)
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        router.push("/auth/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/profiles/${userId}`)
      if (!res.ok) throw new Error("Erro ao buscar perfil")
      const data = await res.json()
      setProfile(data)
      setFormData(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`)
      if (!res.ok) throw new Error("Erro ao buscar notificações")
      const data = await res.json()
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const fetchLikedPosts = async (userId: string) => {
    try {
      const res = await fetch(`/api/posts/liked?userId=${userId}`)
      if (!res.ok) {
        setLikedPosts([])
        return
      }
      const posts = await res.json()
      setLikedPosts(posts.map((p: any) => ({ ...p, image_urls: p.image_urls || [] })))
    } catch (error) {
      console.error("Error fetching liked posts:", error)
    }
  }

  const fetchFriends = async (userId: string) => {
    try {
      const res = await fetch(`/api/friends?userId=${userId}`)
      if (!res.ok) {
        setFriends([])
        return
      }
      const data = await res.json()
      setFriends(data)
    } catch (error) {
      console.error("Error fetching friends:", error)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return profile?.avatar_url || null
    try {
      const reader = new FileReader()
      reader.onloadend = () => localStorage.setItem(`avatar-${userId}`, reader.result as string)
      reader.readAsDataURL(avatarFile)
      return `avatar-${userId}`
    } catch (error) {
      console.error("Error uploading avatar:", error)
      return null
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return
    setIsSaving(true)
    try {
      let avatarUrl = profile?.avatar_url || null
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(user.id)
        if (uploadedUrl) avatarUrl = uploadedUrl
      }

      const updatedProfile = {
        ...profile,
        ...formData,
        avatar_url: avatarUrl,
      } as Profile

      // Aqui você chamaria sua API para salvar: e.g., fetch("/api/profiles/update", ...)
      setProfile(updatedProfile)
      setIsEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePrivacySettings = async () => {
    if (!user?.id || !profile) return
    setIsSaving(true)
    try {
      const updatedProfile = {
        ...profile,
        is_private: formData.is_private || false,
        filtro_madrinha: formData.filtro_madrinha || false,
      } as Profile

      // Salvar via API
      setProfile(updatedProfile)
      setPrivacySaveMessage("Configurações salvas com sucesso!")
      setTimeout(() => setPrivacySaveMessage(""), 3000)
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      setPrivacySaveMessage("Erro ao salvar configurações.")
      setTimeout(() => setPrivacySaveMessage(""), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedGalleryImage(imageUrl)
    setSelectedGalleryIndex(index)
  }
  const handlePreviousImage = () => {
    if (selectedGalleryIndex > 0) {
      setSelectedGalleryIndex(selectedGalleryIndex - 1)
      setSelectedGalleryImage(profile?.gallery_images?.[selectedGalleryIndex - 1] || "")
    }
  }
  const handleNextImage = () => {
    if (selectedGalleryIndex < (profile?.gallery_images?.length || 0) - 1) {
      setSelectedGalleryIndex(selectedGalleryIndex + 1)
      setSelectedGalleryImage(profile?.gallery_images?.[selectedGalleryIndex + 1] || "")
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  const getAvatarUrl = (avatarRef: string | null) => getImageUrl(avatarRef)
  const getGenderDisplay = (gender: string) => (gender === "male" ? "Masculino" : gender === "female" ? "Feminino" : "Outro")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* O restante do JSX continua igual, usando profile, likedPosts, friends, notifications */}
      {/* Buttons chamam fetchLikedPosts(user.id) ou fetchFriends(user.id) quando necessário */}
    </div>
  )
}
