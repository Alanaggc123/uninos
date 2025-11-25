"use client"

import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Heart, Users, MessageSquare, User, LogOut } from "lucide-react"
import Link from "next/link"

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/home" className="font-bold text-xl text-primary">
          UNINÓS
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/home">
            <Button
              variant={isActive("/home") ? "default" : "ghost"}
              size="sm"
              className={isActive("/home") ? "bg-primary text-primary-foreground" : ""}
            >
              <Heart className="w-4 h-4 mr-2" />
              Início
            </Button>
          </Link>

          <Link href="/friends">
            <Button
              variant={isActive("/friends") ? "default" : "ghost"}
              size="sm"
              className={isActive("/friends") ? "bg-primary text-primary-foreground" : ""}
            >
              <Users className="w-4 h-4 mr-2" />
              Amigos
            </Button>
          </Link>

          <Link href="/chat">
            <Button
              variant={isActive("/chat") ? "default" : "ghost"}
              size="sm"
              className={isActive("/chat") ? "bg-primary text-primary-foreground" : ""}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </Link>

          <Link href="/profile">
            <Button
              variant={isActive("/profile") ? "default" : "ghost"}
              size="sm"
              className={isActive("/profile") ? "bg-primary text-primary-foreground" : ""}
            >
              <User className="w-4 h-4 mr-2" />
              Perfil
            </Button>
          </Link>

          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </nav>
  )
}
