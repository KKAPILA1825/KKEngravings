export type CategoryId =
  | "baby-plaques"
  | "coasters"
  | "family-plaques"
  | "gift-card-holders"
  | "keychains"
  | "luggage-tags"
  | "name-plaques"
  | "ornaments"
  | "pet-ornaments"
  | "wall-art";

export type Design = {
  id: string;
  categoryId: CategoryId | "uncategorized";
  categoryLabel: string;
  title: string;
  designIndex: number;
  imageFull: string;
  imageThumb: string;
  width: number;
  height: number;
  alt: string;
};

export type Variant = {
  id: string;
  categoryId: CategoryId;
  label: string;
  description: string;
};

export type Customization = {
  engravingText: string;
  occasionNote?: string;
};

export type CartItem = {
  id: string;
  designId: string;
  categoryId: CategoryId | "uncategorized";
  variantId: string;
  customization: Customization;
  quantity: number;
  addedAt: number;
};

export type Cart = {
  version: 1;
  items: CartItem[];
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
};

export type CheckoutStep = "review" | "shipping" | "payment" | "success";
