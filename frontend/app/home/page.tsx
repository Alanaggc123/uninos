"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/navigation";
import PostFeed from "@/components/post-feed";
import CreatePost from "@/components/create-post";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Verifica se o usuário está logado via backend (session/cookie)
        const res = await fetch("http://localhost:3001/auth/me", { credentials: "include" });
        if (!res.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Auth error:", err);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed - ocupa 2 colunas em telas grandes */}
          <div className="lg:col-span-2">
            <PostFeed userId={user?.id} refreshTrigger={refreshTrigger} />
          </div>

          {/* Criar post - sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <CreatePost
                onPostCreated={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
