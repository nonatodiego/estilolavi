import { Link, useLocation, Redirect } from "wouter";
import { ReactNode } from "react";
import { LayoutDashboard, ShoppingBag, Package, LogOut } from "lucide-react";
import { Logo } from "@/components/loja/Logo";
import { Button } from "@/components/ui/button";
import { getAdminToken, setAdminToken } from "@/lib/queryClient";

export function AdminLayout({ children, current }: { children: ReactNode; current: string }) {
  const [, setLocation] = useLocation();
  const token = getAdminToken();
  if (!token) return <Redirect to="/admin/login" />;

  function logout() {
    setAdminToken(null);
    setLocation("/admin/login");
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { href: "/admin/vendas", label: "Vendas", icon: ShoppingBag, key: "vendas" },
    { href: "/admin/produtos", label: "Produtos", icon: Package, key: "produtos" },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border p-4">
          <Link href="/admin"><a><Logo /></a></Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((l) => {
            const Icon = l.icon;
            const active = current === l.key;
            return (
              <Link key={l.key} href={l.href}>
                <a
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover-elevate"
                  }`}
                  data-testid={`link-admin-${l.key}`}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </a>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Button onClick={logout} variant="ghost" className="w-full justify-start gap-2" data-testid="button-logout">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex w-full flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-border bg-background p-3 md:hidden">
          <Logo />
          <div className="flex gap-1">
            {links.map((l) => {
              const Icon = l.icon;
              const active = current === l.key;
              return (
                <Link key={l.key} href={l.href}>
                  <a
                    className={`rounded-md p-2 ${active ? "bg-secondary" : ""}`}
                    aria-label={l.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </Link>
              );
            })}
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
