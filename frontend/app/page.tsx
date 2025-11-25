import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Heart, Users, MessageSquare, Lock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">UNINÓS</h1>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
          Connect with Friends Like Never Before
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Share your moments, chat with friends, and stay connected. SocialHub makes social networking simple,
          beautiful, and fun.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              Already have an account? Log in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-foreground text-center mb-12">Amazing Features</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg p-6 border border-border text-center">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">Share Posts</h4>
            <p className="text-muted-foreground text-sm">Share your thoughts, photos, and moments with your friends</p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">Make Friends</h4>
            <p className="text-muted-foreground text-sm">Find and connect with people who share your interests</p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border text-center">
            <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">Real-time Chat</h4>
            <p className="text-muted-foreground text-sm">
              Chat instantly with your friends and keep conversations going
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border text-center">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">Private & Safe</h4>
            <p className="text-muted-foreground text-sm">Your data is protected with enterprise-grade security</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-primary/20 to-secondary border border-primary/50 rounded-lg p-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6">Join thousands of users who are already connecting on SocialHub</p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Account Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
