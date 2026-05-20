import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { Header } from "@/components/loja/Header";
import { Footer } from "@/components/loja/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCart, formatBRL } from "@/store/cart";
import type { ProdutoView } from "@shared/schema";
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck } from "lucide-react";

export default function ProdutoDetalhe() {
  const [, params] = useRoute("/produto/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  const { toast } = useToast();
  const { add } = useCart();

  const { data: produto, isLoading, isError } = useQuery<ProdutoView>({
    queryKey: ["/api/produtos", id],
    enabled: Number.isFinite(id),
  });
  const { data: config } = useQuery<{ whatsapp: string }>({ queryKey: ["/api/config"] });

  const [tamanho, setTamanho] = useState<string>("");
  const [cor, setCor] = useState<string>("");
  const [qtd, setQtd] = useState(1);

  function handleAdd() {
    if (!produto) return;
    if (produto.tamanhos.length > 0 && !tamanho) {
      toast({ title: "Selecione um tamanho", variant: "destructive" });
      return;
    }
    if (produto.cores.length > 0 && !cor) {
      toast({ title: "Selecione uma cor", variant: "destructive" });
      return;
    }
    add({
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      qtd,
      tamanho: tamanho || undefined,
      cor: cor || undefined,
      imagemUrl: produto.imagemUrl,
    });
    toast({ title: "Adicionado ao carrinho", description: produto.nome });
  }

  function handleComprarAgora() {
    handleAdd();
    setTimeout(() => setLocation("/checkout"), 200);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
        <button
          onClick={() => setLocation("/produtos")}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          data-testid="button-voltar"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para produtos
        </button>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-[3/4] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32" />
            </div>
          </div>
        ) : isError || !produto ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            Produto não encontrado.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <div className="overflow-hidden rounded-xl bg-muted">
              <img
                src={produto.imagemUrl}
                alt={produto.nome}
                className="aspect-[3/4] w-full object-cover"
                data-testid="img-product-detail"
              />
            </div>

            <div>
              <h1
                className="font-serif text-3xl font-semibold md:text-4xl"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                data-testid="text-product-name"
              >
                {produto.nome}
              </h1>
              <div className="mt-2 text-2xl font-semibold text-foreground" data-testid="text-product-price">
                {formatBRL(produto.preco)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Em até 3x sem juros · 5% off no Pix
              </p>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {produto.descricao}
              </p>

              {produto.tamanhos.length > 0 && (
                <div className="mt-6">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                    Tamanho
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {produto.tamanhos.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTamanho(t)}
                        className={`min-w-12 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          tamanho === t
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card hover:border-foreground/40"
                        }`}
                        data-testid={`button-tamanho-${t}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {produto.cores.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                    Cor
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {produto.cores.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCor(c)}
                        className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          cor === c
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card hover:border-foreground/40"
                        }`}
                        data-testid={`button-cor-${c}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-md border border-border">
                  <button
                    onClick={() => setQtd((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover-elevate"
                    data-testid="button-qtd-menos"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm" data-testid="text-qtd">{qtd}</span>
                  <button
                    onClick={() => setQtd((q) => q + 1)}
                    className="px-3 py-2 hover-elevate"
                    data-testid="button-qtd-mais"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleComprarAgora} size="lg" className="flex-1 gap-2" data-testid="button-comprar-agora">
                  <ShoppingBag className="h-4 w-4" /> Comprar agora
                </Button>
                <Button onClick={handleAdd} size="lg" variant="outline" className="flex-1" data-testid="button-add-cart">
                  Adicionar ao carrinho
                </Button>
              </div>

              <div className="mt-6 grid gap-3 rounded-lg border border-border bg-card p-4 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gold" /> Envio para todo o Brasil
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold" /> Pagamento seguro via Pix
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer whatsapp={config?.whatsapp} />
    </div>
  );
}
