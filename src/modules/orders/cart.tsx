import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { Cart, CartItem, CategoryId } from "./types";

const STORAGE_KEY = "kk_engravings.orders.cart.v1";

type Action =
  | { type: "add"; item: Omit<CartItem, "id" | "addedAt"> }
  | { type: "update"; id: string; patch: Partial<Omit<CartItem, "id">> }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "hydrate"; cart: Cart };

const empty: Cart = { version: 1, items: [] };

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ci_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function reducer(state: Cart, action: Action): Cart {
  switch (action.type) {
    case "add": {
      const item: CartItem = { ...action.item, id: newId(), addedAt: Date.now() };
      return { ...state, items: [...state.items, item] };
    }
    case "update": {
      const items = state.items.map((it) =>
        it.id === action.id ? { ...it, ...action.patch } : it,
      );
      return { ...state, items };
    }
    case "remove":
      return { ...state, items: state.items.filter((it) => it.id !== action.id) };
    case "clear":
      return { ...empty };
    case "hydrate":
      return action.cart;
    default:
      return state;
  }
}

function loadFromStorage(): Cart {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as Cart).version === 1 &&
      Array.isArray((parsed as Cart).items)
    ) {
      const items = (parsed as Cart).items.filter(
        (it) =>
          it &&
          typeof it.id === "string" &&
          typeof it.designId === "string" &&
          typeof it.variantId === "string" &&
          typeof it.quantity === "number" &&
          it.quantity > 0,
      );
      return { version: 1, items };
    }
  } catch {
    // corrupted — fall through to empty
  }
  return empty;
}

function saveToStorage(cart: Cart): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore quota / private-mode failures
  }
}

type CartApi = {
  cart: Cart;
  count: number;
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => void;
  updateItem: (id: string, patch: Partial<Omit<CartItem, "id">>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  findItem: (id: string) => CartItem | undefined;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(reducer, empty);

  useEffect(() => {
    const loaded = loadFromStorage();
    if (loaded.items.length > 0) dispatch({ type: "hydrate", cart: loaded });
  }, []);

  useEffect(() => {
    saveToStorage(cart);
  }, [cart]);

  const api = useMemo<CartApi>(
    () => ({
      cart,
      count: cart.items.length,
      addItem: (item) => dispatch({ type: "add", item }),
      updateItem: (id, patch) => dispatch({ type: "update", id, patch }),
      removeItem: (id) => dispatch({ type: "remove", id }),
      clearCart: () => dispatch({ type: "clear" }),
      findItem: (id) => cart.items.find((it) => it.id === id),
    }),
    [cart],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export type { CategoryId };
