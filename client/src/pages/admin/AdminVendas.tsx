import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMemo, useState } from "react";
import { formatBRL } from "@/store/cart";
import type { Pedido, PedidoItem } from "@shared/schema";
import { CheckCircle2, Download, Eye, X } from "lucide-react";

function fmtDate(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("pt-BR");
}

const STATUS_TONES: Record<string, string> = {
  pendente: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  pago: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  enviado: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  cancelado: "bg-destructive/15 text-destructive",
};

export default function AdminVendas() {
  const { toast } = useToast();
  const { data: pedidos, isLoading } = useQuery<Pedido[]>({
    queryKey: ["/api/admin/pedidos"],
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detalhe, setDetalhe] = useState<Pedido | null>(null);

  const filtrados = useMemo(() => {
    let arr = pedidos || [];
    if (statusFilter) arr = arr.filter((p) => p.status === statusFilter);
    if (from) {
      const fts = new Date(from).getTime();
      arr = arr.filter((p) => p.dataCriacao >= fts);
    }
    if (to) {
      const tts = new Date(to).getTime() + 24 * 3600 * 1000;
      arr = arr.filter((p) => p.dataCriacao <= tts);
    }
    return arr;
  }, [pedidos, statusFilter, from, to]);

  const confirmarMut = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/admin/pedidos/${id}/confirmar`);
    },
    onSuccess: () => {
      toast({ title: "Pedido confirmado" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
    },
  });

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/admin/pedidos/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status atualizado" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
    },
  });

  function exportCsv() {
    const header = ["ID", "Nome", "WhatsApp", "Email", "Total", "Status", "Data Criação", "Data Pagamento"];
    const rows = filtrados.map((p) => [
      p.id,
      `"${p.clienteNome}"`,
      p.clienteWhatsapp,
      p.clienteEmail,
      p.total.toFixed(2),
      p.status,
      fmtDate(p.dataCriacao),
      fmtDate(p.dataPagamento),
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendas-lavi-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout current="vendas">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
            Vendas
          </h1>
          <p className="text-sm text-muted-foreground">{filtrados.length} pedidos</p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="gap-2" data-testid="button-export-csv">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="mb-4 grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          data-testid="select-filtro-status"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="enviado">Enviado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} data-testid="input-data-de" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} data-testid="input-data-ate" />
        <Button variant="outline" onClick={() => { setStatusFilter(""); setFrom(""); setTo(""); }}>
          Limpar
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2 hidden md:table-cell">WhatsApp</th>
                <th className="px-3 py-2 hidden md:table-cell">Data</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum pedido</td></tr>
              ) : (
                filtrados.map((p) => (
                  <tr key={p.id} className="border-t border-border" data-testid={`row-pedido-${p.id}`}>
                    <td className="px-3 py-2 font-mono text-xs">#{p.id}</td>
                    <td className="px-3 py-2">{p.clienteNome}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-muted-foreground">{p.clienteWhatsapp}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-muted-foreground">{fmtDate(p.dataCriacao)}</td>
                    <td className="px-3 py-2 font-medium">{formatBRL(p.total)}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={STATUS_TONES[p.status] || ""}>{p.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setDetalhe(p)} data-testid={`button-ver-${p.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {p.status === "pendente" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => confirmarMut.mutate(p.id)}
                            data-testid={`button-confirmar-${p.id}`}
                            title="Confirmar pagamento"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          </Button>
                        )}
                        {p.status === "pago" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => statusMut.mutate({ id: p.id, status: "enviado" })}
                            data-testid={`button-enviar-${p.id}`}
                            title="Marcar como enviado"
                          >
                            ✉️
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal detalhe */}
      {detalhe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDetalhe(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-2xl font-semibold" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
                  Pedido #{detalhe.id}
                </h3>
                <p className="text-xs text-muted-foreground">{fmtDate(detalhe.dataCriacao)}</p>
              </div>
              <button onClick={() => setDetalhe(null)} className="rounded-md p-1 hover-elevate" data-testid="button-fechar-detalhe">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</div>
                <div>{detalhe.clienteNome}</div>
                <div className="text-muted-foreground">{detalhe.clienteWhatsapp}</div>
                {detalhe.clienteEmail && <div className="text-muted-foreground">{detalhe.clienteEmail}</div>}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
                <Badge className={STATUS_TONES[detalhe.status]}>{detalhe.status}</Badge>
                <div className="mt-1 text-muted-foreground">Total: <strong>{formatBRL(detalhe.total)}</strong></div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Endereço de entrega</div>
              <div className="mt-1 whitespace-pre-line rounded-md border border-border bg-muted/30 p-2 text-sm">
                {detalhe.enderecoEntrega || "—"}
              </div>
            </div>

            {detalhe.observacoes && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Observações</div>
                <div className="mt-1 text-sm">{detalhe.observacoes}</div>
              </div>
            )}

            <div className="mt-4">
              <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Itens</div>
              <div className="space-y-2">
                {(JSON.parse(detalhe.itens || "[]") as PedidoItem[]).map((it, idx) => (
                  <div key={idx} className="flex justify-between border-b border-border pb-2 text-sm">
                    <div>
                      {it.qtd}× {it.nome}
                      {it.tamanho && <span className="text-muted-foreground"> · Tam {it.tamanho}</span>}
                      {it.cor && <span className="text-muted-foreground"> · {it.cor}</span>}
                    </div>
                    <div>{formatBRL(it.preco * it.qtd)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {detalhe.status === "pendente" && (
                <Button onClick={() => { confirmarMut.mutate(detalhe.id); setDetalhe(null); }} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Confirmar pagamento
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => statusMut.mutate({ id: detalhe.id, status: "enviado" })}
                disabled={detalhe.status === "enviado"}
              >
                Marcar enviado
              </Button>
              <Button
                variant="outline"
                onClick={() => statusMut.mutate({ id: detalhe.id, status: "cancelado" })}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
