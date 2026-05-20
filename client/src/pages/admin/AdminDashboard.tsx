import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/store/cart";
import { TrendingUp, ShoppingBag, Clock, Package } from "lucide-react";

interface DashboardData {
  totalHoje: number;
  countHoje: number;
  totalMes: number;
  countMes: number;
  pendentes: number;
  totalPedidos: number;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/admin/dashboard"],
  });

  const cards = [
    {
      label: "Vendas hoje",
      value: data ? formatBRL(data.totalHoje) : "—",
      hint: `${data?.countHoje || 0} pedidos`,
      icon: TrendingUp,
      tone: "bg-secondary",
    },
    {
      label: "Vendas no mês",
      value: data ? formatBRL(data.totalMes) : "—",
      hint: `${data?.countMes || 0} pedidos`,
      icon: ShoppingBag,
      tone: "bg-secondary",
    },
    {
      label: "Pendentes de pagamento",
      value: data?.pendentes ?? "—",
      hint: "aguardando comprovante",
      icon: Clock,
      tone: "bg-accent",
    },
    {
      label: "Total de pedidos",
      value: data?.totalPedidos ?? "—",
      hint: "histórico completo",
      icon: Package,
      tone: "bg-secondary",
    },
  ];

  return (
    <AdminLayout current="dashboard">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold" style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }} data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Visão geral da loja</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="p-4" data-testid={`card-${c.label.replace(/\s+/g, "-").toLowerCase()}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  <div className="mt-2 text-2xl font-semibold">
                    {isLoading ? "..." : c.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{c.hint}</div>
                </div>
                <div className={`rounded-lg ${c.tone} p-2`}>
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider">Próximos passos</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>· Confirme pagamentos pendentes em <strong>Vendas</strong></li>
          <li>· Cadastre novos produtos em <strong>Produtos</strong></li>
          <li>· Compartilhe o link da loja com suas clientes</li>
        </ul>
      </div>
    </AdminLayout>
  );
}
