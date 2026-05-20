import { Header } from "@/components/loja/Header";
import { Footer } from "@/components/loja/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart, formatBRL } from "@/store/cart";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Copy, MessageCircle, CheckCircle2 } from "lucide-react";

interface CheckoutResp {
  pedidoId: number;
  total: number;
  pixKey: string;
  pixCopiaCola: string;
  qrCodeImg: string;
  linkWhatsapp: string;
}

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: config } = useQuery<{ whatsapp: string }>({ queryKey: ["/api/config"] });

  const [form, setForm] = useState({
    clienteNome: "",
    clienteWhatsapp: "",
    clienteEmail: "",
    enderecoEntrega: "",
    observacoes: "",
  });

  const [resp, setResp] = useState<CheckoutResp | null>(null);

  const mut = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/pedidos", { ...form, itens: items });
      return (await r.json()) as CheckoutResp;
    },
    onSuccess: (data) => {
      setResp(data);
      clear();
      toast({ title: "Pedido criado", description: "Pague via Pix para confirmar." });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao criar pedido", description: err.message, variant: "destructive" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", variant: "destructive" });
      return;
    }
    if (!form.clienteNome || !form.clienteWhatsapp || !form.enderecoEntrega) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    mut.mutate();
  }

  function copiarPix() {
    if (!resp) return;
    navigator.clipboard.writeText(resp.pixCopiaCola);
    toast({ title: "Código Pix copiado" });
  }

  // Tela de pagamento (após criar pedido)
  if (resp) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:px-6">
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-secondary p-2">
                <CheckCircle2 className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                  Pedido criado · #{resp.pedidoId}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Total: <strong>{formatBRL(resp.total)}</strong>
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr] md:items-start">
              <div className="rounded-lg border border-border bg-white p-3 text-center">
                <img src={resp.qrCodeImg} alt="QR Code Pix" className="w-full" data-testid="img-qrcode" />
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider">Pague com Pix</h2>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                  <li>Abra o app do seu banco e escolha pagar com Pix</li>
                  <li>Escaneie o QR Code ou copie o código abaixo</li>
                  <li>Envie o comprovante pelo WhatsApp para confirmação</li>
                </ol>
                <div className="mt-3">
                  <div className="rounded-md border border-border bg-muted p-2 text-[11px] break-all font-mono">
                    {resp.pixCopiaCola}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copiarPix}
                    className="mt-2 gap-2"
                    data-testid="button-copiar-pix"
                  >
                    <Copy className="h-3 w-3" /> Copiar código Pix
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-secondary/60 p-4">
              <p className="text-sm">Após pagar, envie o comprovante via WhatsApp:</p>
              <a href={resp.linkWhatsapp} target="_blank" rel="noreferrer" className="block">
                <Button className="mt-2 w-full gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a]" data-testid="button-enviar-whatsapp">
                  <MessageCircle className="h-4 w-4" /> Enviar comprovante via WhatsApp
                </Button>
              </a>
            </div>

            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setLocation("/")}
              data-testid="button-voltar-home"
            >
              Voltar para a loja
            </Button>
          </div>
        </main>
        <Footer whatsapp={config?.whatsapp} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-6">
        <h1
          className="font-serif text-3xl font-semibold md:text-4xl"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          data-testid="text-page-title"
        >
          Finalizar pedido
        </h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            Seu carrinho está vazio.
            <Button className="mt-4" onClick={() => setLocation("/produtos")}>
              Explorar produtos
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="space-y-4 rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider">Seus dados</h2>
              <div>
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  value={form.clienteNome}
                  onChange={(e) => setForm({ ...form, clienteNome: e.target.value })}
                  required
                  data-testid="input-nome"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="wa">WhatsApp *</Label>
                  <Input
                    id="wa"
                    placeholder="(21) 99999-9999"
                    value={form.clienteWhatsapp}
                    onChange={(e) => setForm({ ...form, clienteWhatsapp: e.target.value })}
                    required
                    data-testid="input-whatsapp"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.clienteEmail}
                    onChange={(e) => setForm({ ...form, clienteEmail: e.target.value })}
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endereco">Endereço de entrega *</Label>
                <Textarea
                  id="endereco"
                  rows={3}
                  placeholder="Rua, número, bairro, cidade, CEP"
                  value={form.enderecoEntrega}
                  onChange={(e) => setForm({ ...form, enderecoEntrega: e.target.value })}
                  required
                  data-testid="input-endereco"
                />
              </div>
              <div>
                <Label htmlFor="obs">Observações (opcional)</Label>
                <Textarea
                  id="obs"
                  rows={2}
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  data-testid="input-observacoes"
                />
              </div>
            </div>

            <aside className="h-fit rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider">Resumo</h2>
              <div className="mt-3 space-y-2">
                {items.map((it) => (
                  <div key={`${it.produtoId}-${it.tamanho}-${it.cor}`} className="flex justify-between gap-2 text-sm">
                    <span className="line-clamp-1">
                      {it.qtd}× {it.nome}
                      {it.tamanho && ` (${it.tamanho})`}
                    </span>
                    <span className="shrink-0">{formatBRL(it.preco * it.qtd)}</span>
                  </div>
                ))}
                <div className="my-3 border-t border-border" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span data-testid="text-checkout-total">{formatBRL(total)}</span>
                </div>
              </div>
              <Button type="submit" className="mt-4 w-full" size="lg" disabled={mut.isPending} data-testid="button-gerar-pix">
                {mut.isPending ? "Gerando Pix..." : "Gerar pagamento Pix"}
              </Button>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Após pagar, envie o comprovante pelo WhatsApp.
              </p>
            </aside>
          </form>
        )}
      </main>
      <Footer whatsapp={config?.whatsapp} />
    </div>
  );
}
