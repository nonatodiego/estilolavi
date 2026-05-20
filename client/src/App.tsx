import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/store/cart";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Produtos from "@/pages/Produtos";
import ProdutoDetalhe from "@/pages/ProdutoDetalhe";
import Carrinho from "@/pages/Carrinho";
import Checkout from "@/pages/Checkout";
import Contato from "@/pages/Contato";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/produtos" component={Produtos} />
      <Route path="/produto/:id" component={ProdutoDetalhe} />
      <Route path="/carrinho" component={Carrinho} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/contato" component={Contato} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <AppRouter />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
