import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from "react";

export interface CartItem {
  produtoId: number;
  nome: string;
  preco: number;
  qtd: number;
  tamanho?: string;
  cor?: string;
  imagemUrl?: string;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (produtoId: number, tamanho?: string, cor?: string) => void;
  updateQty: (produtoId: number, qtd: number, tamanho?: string, cor?: string) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function sameVariant(a: CartItem, produtoId: number, tamanho?: string, cor?: string) {
  return a.produtoId === produtoId && (a.tamanho || "") === (tamanho || "") && (a.cor || "") === (cor || "");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => sameVariant(p, item.produtoId, item.tamanho, item.cor));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qtd: next[idx].qtd + item.qtd };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((produtoId: number, tamanho?: string, cor?: string) => {
    setItems((prev) => prev.filter((p) => !sameVariant(p, produtoId, tamanho, cor)));
  }, []);

  const updateQty = useCallback((produtoId: number, qtd: number, tamanho?: string, cor?: string) => {
    setItems((prev) =>
      prev
        .map((p) => (sameVariant(p, produtoId, tamanho, cor) ? { ...p, qtd } : p))
        .filter((p) => p.qtd > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(() => items.reduce((s, i) => s + i.preco * i.qtd, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qtd, 0), [items]);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
