import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, setAdminToken } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/loja/Logo";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/admin/login", { email, senha });
      return (await r.json()) as { token: string; email: string };
    },
    onSuccess: (data) => {
      setAdminToken(data.token);
      toast({ title: "Bem-vinda de volta" });
      setLocation("/admin");
    },
    onError: (err: any) => {
      toast({ title: "Login falhou", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl md:p-8">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1
          className="text-center font-serif text-2xl font-semibold"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Painel administrativo
        </h1>
        <p className="text-center text-sm text-muted-foreground">Entre com suas credenciais</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-admin-email"
            />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              data-testid="input-admin-senha"
            />
          </div>
          <Button type="submit" className="w-full" disabled={mut.isPending} data-testid="button-admin-login">
            {mut.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
