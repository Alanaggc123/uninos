"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface Friend {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export default function FriendsListPage() {
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // Pega usuário logado via backend
        const meRes = await fetch("http://localhost:3001/auth/me", { credentials: "include" });
        if (!meRes.ok) {
          router.push("/auth/login");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // Pega lista de amigos do usuário logado
        const friendsRes = await fetch(`http://localhost:3001/friends/${meData.user.id}`, {
          credentials: "include",
        });
        if (!friendsRes.ok) throw new Error("Erro ao buscar amigos");
        const friendsData = await friendsRes.json();
        setFriends(friendsData);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="outline">Voltar ao Perfil</Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mt-4">Meus Amigos ({friends.length})</h1>
        </div>

        {friends.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Você ainda não tem amigos adicionados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <Card key={friend.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={friend.avatar_url || "/placeholder.svg"} alt={friend.full_name} />
                      <AvatarFallback>{friend.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{friend.full_name}</p>
                      <p className="text-xs text-muted-foreground">{friend.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
