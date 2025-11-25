"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
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
  id: number;
  fullName: string;
  gender: string;
}

interface FriendRequest {
  id: number;
  requesterId: number;
  receiverId: number;
  status: string;
  fullName: string;
}

interface FriendshipStatus {
  [userId: number]: "friends" | "pending" | "none";
}

export default function FriendsPage() {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendshipStatuses, setFriendshipStatuses] = useState<FriendshipStatus>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Supondo que você tenha login com cookie/session
        const res = await fetch("http://localhost:3001/auth/me", { credentials: "include" });
        if (!res.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        fetchFriendRequests();
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        router.push("/auth/login");
      }
    };

    checkUser();
  }, [router]);

  const fetchFriendRequests = async () => {
    try {
      const res = await fetch("http://localhost:3001/friends/requests");
      const data = await res.json();
      setFriendRequests(data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/friends/search?q=${query}`);
      const data = await res.json();
      setSearchResults(data.users || []);
      setFriendshipStatuses(data.statuses || {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRequest = async (profile: Profile) => {
    setSelectedProfile(profile);
    setShowConfirmDialog(true);
  };

  const confirmSendRequest = async () => {
    if (!selectedProfile) return;
    try {
      const res = await fetch("http://localhost:3001/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedProfile.id }),
      });
      if (!res.ok) throw new Error("Erro ao enviar solicitação");

      setFriendshipStatuses({ ...friendshipStatuses, [selectedProfile.id]: "pending" });
      setShowConfirmDialog(false);
      setSelectedProfile(null);
      handleSearch(searchQuery);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar solicitação de amizade");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Amigos</h1>

        {/* Search Section */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Encontrar Amigos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Procure por amigos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-secondary"
                />
              </div>
            </div>
            {searchResults.length > 0 &&
              searchResults.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg mt-2">
                  <div>
                    <p className="font-semibold text-foreground">{profile.fullName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile.gender}</p>
                  </div>
                  <Button
                    onClick={() => handleSendRequest(profile)}
                    disabled={friendshipStatuses[profile.id] === "pending"}
                  >
                    {friendshipStatuses[profile.id] === "pending" ? "Solicitação Enviada" : "Adicionar Amigo"}
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Solicitações de Amizade ({friendRequests.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {friendRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <p className="font-semibold text-foreground">{req.fullName}</p>
                  <div className="flex gap-2">
                    <Button> Aceitar </Button>
                    <Button variant="outline"> Rejeitar </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar Solicitação de Amizade</AlertDialogTitle>
            <AlertDialogDescription>
              Você deseja enviar uma solicitação de amizade para {selectedProfile?.fullName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendRequest}>Enviar</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
