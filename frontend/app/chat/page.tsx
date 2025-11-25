"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, AlertCircle } from "lucide-react";

interface Friend {
  id: string;
  fullName: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Pega usuário logado do localStorage (apenas exemplo)
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return router.push("/auth/login");

    setUser(JSON.parse(storedUser));
    fetchFriends();
    setIsLoading(false);
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch("http://localhost:3001/friends?userId=" + user.id);
      const data = await res.json();
      setFriends(data || []);
    } catch (error) {
      console.error("Erro ao buscar amigos:", error);
    }
  };

  const fetchMessages = async (friendId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:3001/chat/messages?userId=${user.id}&friendId=${friendId}`);
      const data = await res.json();
      setMessages(data || []);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const handleSelectFriend = (friendId: string) => {
    setSelectedFriendId(friendId);
    fetchMessages(friendId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriendId || !user) return;

    try {
      const res = await fetch("http://localhost:3001/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedFriendId,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data]);
        setNewMessage("");
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Mensagens</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
          {/* Friends List */}
          <Card className="border-0 shadow-sm md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Amigos</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem amigos ainda</p>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend.id)}
                    className={`w-full p-2 rounded-lg text-left ${
                      selectedFriendId === friend.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    {friend.fullName}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Window */}
          {selectedFriendId ? (
            <Card className="border-0 shadow-sm md:col-span-3 flex flex-col">
              <CardHeader>
                <CardTitle>{friends.find((f) => f.id === selectedFriendId)?.fullName || "Chat"}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto mb-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === user.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t pt-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-secondary"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm md:col-span-3 flex items-center justify-center">
              <p className="text-muted-foreground">Selecione um amigo para começar a conversar</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
