import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verifique seu Email</CardTitle>
            <CardDescription>Enviamos um link de confirmação para você</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Por favor, verifique seu email e clique no link de confirmação para ativar sua conta. Depois você poderá
              fazer login com suas credenciais.
            </p>
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Voltar ao Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
