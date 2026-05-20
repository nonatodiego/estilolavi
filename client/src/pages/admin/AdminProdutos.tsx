import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { formatBRL } from "@/store/cart";
import type { ProdutoView } from "@shared/schema";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";

interface ProdutoForm {
  id?: number;
  nome: string;
  descricao: string;
  preco: string;
  tamanhos: string;
  cores: string;
  imagemUrl: string;
  destaque: boolean;
  ativo: boolean;
  estoque: string;
}

const emptyForm: ProdutoForm = {
  nome: "",
  descricao: "",
  preco: "",
  tamanhos: "P, M, G",
  cores: "",
  imagemUrl: "",
  destaque: true,
  ativo: true,
  estoque: "10",
};

export default function AdminProdutos() {
  const { toast } = useToast();
  const { data: produtos, isLoading } = useQuery<ProdutoView[]>({
    queryKey: ["/api/admin/produtos"],
  });

  const [editing, setEditing] = useState<ProdutoForm | null>(null);

  function abrirNovo() {
    setEditing({ ...emptyForm });
  }
  function abrirEdicao(p: ProdutoView) {
    setEditing({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      preco: String(p.preco),
      tamanhos: p.tamanhos.join(", "),
      cores: p.cores.join(", "),
      imagemUrl: p.imagemUrl,
      destaque: !!p.destaque,
      ativo: !!p.ativo,
      estoque: String(p.estoque),
    });
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const body = {
        nome: editing.nome,
        descricao: editing.descricao,
        preco: Number(editing.preco) || 0,
        tamanhos: JSON.stringify(editing.tamanhos.split(",").map((s) => s.trim()).filter(Boolean)),
        cores: JSON.stringify(editing.cores.split(",").map((s) => s.trim()).filter(Boolean)),
        imagemUrl: editing.imagemUrl,
        destaque: editing.destaque ? 1 : 0,
        ativo: editing.ativo ? 1 : 0,
        estoque: Number(editing.estoque) || 0,
      };
      if (editing.id) {
        await apiRequest("PUT", `/api/admin/produtos/${editing.id}`, body);
      } else {
        await apiRequest("POST", "/api/admin/produtos", body);
      }
    },
    onSuccess: () => {
      toast({ title: editing?.id ? "Produto atualizado" : "Produto criado" });
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/produtos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/produtos"] });
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const delMut = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/produtos/${id}`),
    onSuccess: () => {
      toast({ title: "Produto removido" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/produtos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/produtos"] });
    },
  });

  return (
    <AdminLayout current="produtos">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            Produtos
          </h1>
          <p className="text-sm text-muted-foreground">{produtos?.length || 0} cadastrados</p>
        </div>
        <Button onClick={abrirNovo} className="gap-2" data-testid="button-novo-produto">
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(produtos || []).map((p) => (
            <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-card" data-testid={`card-admin-produto-${p.id}`}>
              <div className="aspect-[4/3] bg-muted">
                {p.imagemUrl && <img src={p.imagemUrl} alt={p.nome} className="h-full w-full object-cover" />}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-sm text-muted-foreground">{formatBRL(p.preco)}</div>
                  </div>
                  <div className="flex gap-1">
                    {!!p.destaque && <Badge variant="outline" className="gap-1 text-xs" title="Em destaque"><Star className="h-3 w-3 fill-[hsl(46_65%_52%)] text-[hsl(46_65%_45%)]" /></Badge>}
                    {!p.ativo && <Badge variant="outline" className="text-xs">inativo</Badge>}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => abrirEdicao(p)} className="flex-1 gap-1" data-testid={`button-editar-${p.id}`}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Remover "${p.nome}"?`)) delMut.mutate(p.id);
                    }}
                    data-testid={`button-deletar-${p.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-2xl font-semibold" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                {editing.id ? "Editar produto" : "Novo produto"}
              </h3>
              <button onClick={() => setEditing(null)} className="rounded-md p-1 hover-elevate">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMut.mutate();
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <Label>Nome *</Label>
                <Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} required data-testid="input-prod-nome" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea rows={3} value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} data-testid="input-prod-desc" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editing.preco}
                    onChange={(e) => setEditing({ ...editing, preco: e.target.value })}
                    required
                    data-testid="input-prod-preco"
                  />
                </div>
                <div>
                  <Label>Estoque</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editing.estoque}
                    onChange={(e) => setEditing({ ...editing, estoque: e.target.value })}
                    data-testid="input-prod-estoque"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tamanhos (separados por vírgula)</Label>
                  <Input value={editing.tamanhos} onChange={(e) => setEditing({ ...editing, tamanhos: e.target.value })} placeholder="P, M, G" data-testid="input-prod-tamanhos" />
                </div>
                <div>
                  <Label>Cores (separados por vírgula)</Label>
                  <Input value={editing.cores} onChange={(e) => setEditing({ ...editing, cores: e.target.value })} placeholder="Rosé, Bege, Preto" data-testid="input-prod-cores" />
                </div>
              </div>
              <div>
                <Label>URL da imagem</Label>
                <Input
                  value={editing.imagemUrl}
                  onChange={(e) => setEditing({ ...editing, imagemUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-prod-imagem"
                />
                {editing.imagemUrl && (
                  <img src={editing.imagemUrl} alt="preview" className="mt-2 h-32 rounded border border-border object-cover" />
                )}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.destaque}
                    onChange={(e) => setEditing({ ...editing, destaque: e.target.checked })}
                    data-testid="checkbox-prod-destaque"
                  />
                  Em destaque
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.ativo}
                    onChange={(e) => setEditing({ ...editing, ativo: e.target.checked })}
                    data-testid="checkbox-prod-ativo"
                  />
                  Ativo (visível na loja)
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <Button type="submit" disabled={saveMut.isPending} data-testid="button-salvar-produto">
                  {saveMut.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
