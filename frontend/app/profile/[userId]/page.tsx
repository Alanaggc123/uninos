"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/post-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  gender: string;
  bio: string;
  avatar_url: string | null;
  interests: string[];
  gallery_images: string[];
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  full_name: string;
  avatar_url: string | null;
  like_count: number;
  comment_count: number;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBreakFriendshipDialog, setShowBreakFriendshipDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (userId === "liked-posts" || userId === "friends") {
        router.push("/profile");
        return;
      }

      try {
        // Pega usuário logado via backend
        const meRes = await fetch("http://localhost:3001/auth/me", { credentials: "include" });
        if (!meRes.ok) {
          router.push("/auth/login");
          return;
        }
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        // Pega dados do perfil
        const profileRes = await fetch(`http://localhost:3001/profiles/${userId}`);
        if (!profileRes.ok) throw new Error("Perfil não encontrado");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Pega posts do usuário
        const postsRes = await fetch(`http://localhost:3001/posts/user/${userId}`);
        const postsData = await postsRes.json();

        setPosts(postsData);

        // Verifica amizade
        if (meData.user && meData.user.id !== userId) {
          const friendshipRes = await fetch(
            `http://localhost:3001/friendships?user1=${meData.user.id}&user2=${userId}`
          );
          const friendshipData = await friendshipRes.json();
          if (friendshipData) {
            setFriendshipStatus(friendshipData.status);
            setIsFriend(friendshipData.status === "accepted");
            setFriendshipId(friendshipData.id);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, router]);

  const handleSendFriendRequest = async () => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/friendships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requester_id: currentUser.id, receiver_id: userId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao enviar solicitação de amizade");
      const data = await res.json();
      setFriendshipStatus("pending");
      setFriendshipId(data.id);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar solicitação de amizade");
    }
  };

  const handleBreakFriendship = async () => {
    if (!friendshipId || !currentUser) return;

    try {
      const res = await fetch(`http://localhost:3001/friendships/${friendshipId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao quebrar vínculo");
      setFriendshipStatus(null);
      setIsFriend(false);
      setFriendshipId(null);
      setShowBreakFriendshipDialog(false);
      alert("Vínculo quebrado com sucesso. As mensagens entre vocês não serão mais possíveis.");
    } catch (error) {
      console.error(error);
      alert("Erro ao quebrar vínculo");
    }
  };

  const getAvatarUrl = (avatarRef: string | null) => avatarRef || "/placeholder.svg";
  const getImageUrl = (imageRef: string) => imageRef || "/placeholder.svg";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Perfil não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={getAvatarUrl(profile.avatar_url)} alt={profile.full_name} />
                  <AvatarFallback>{profile.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{profile.full_name}</h1>
                  <p className="text-muted-foreground mb-2">{profile.email}</p>
                  {profile.bio && <p className="text-foreground mb-3">{profile.bio}</p>}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Interesses:</p>
                      <ul className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, idx) => (
                          <li key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {interest}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {currentUser && currentUser.id !== userId && (
                isFriend ? (
                  <Button
                    onClick={() => setShowBreakFriendshipDialog(true)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Quebrar Vínculo
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={friendshipStatus === "pending"}
                    className={friendshipStatus === "pending"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"}
                  >
                    {friendshipStatus === "pending" ? "Solicitação Enviada" : "Adicionar Amigo"}
                  </Button>
                )
              )}
            </div>

            {/* Gallery */}
            {profile.gallery_images && profile.gallery_images.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h2 className="text-lg font-semibold text-foreground mb-4">Galeria</h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {profile.gallery_images.map((image, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(image)}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Posts</h2>
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum post ainda</p>
          )}
        </div>
      </div>

      {/* AlertDialogs */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar Solicitação de Amizade</AlertDialogTitle>
            <AlertDialogDescription>
              Você deseja enviar uma solicitação de amizade para {profile.full_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendFriendRequest} className="bg-primary hover:bg-primary/90">
              Enviar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBreakFriendshipDialog} onOpenChange={setShowBreakFriendshipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quebrar Vínculo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja quebrar o vínculo com {profile.full_name}? Esta ação não pode ser desfeita e vocês
              não poderão mais trocar mensagens.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBreakFriendship}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Quebrar Vínculo
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
