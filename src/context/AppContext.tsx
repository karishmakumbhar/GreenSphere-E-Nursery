"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  scientificName: string;
  price: number;
  category: string;
  rating: number;
  reviewsCount: number;
  description: string;
  details: string;
  sunlight: string;
  water: string;
  temperature: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  size: "Small" | "Medium" | "Large" | "Huge";
  stock: number;
  imageUrl: string;
  glowColor: string;
  variants: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant: string;
}

export interface CareHistoryLog {
  id: string;
  action: string;
  date: string;
  notes?: string;
}

export interface GardenPlant {
  id: string;
  name: string;
  species: string;
  health: number; // 0 to 100
  lastWatered: string; // ISO string
  waterIntervalHours: number;
  imageUrl: string;
  sunlightRequired: string;
  notes: string;
  plantingDate: string;
  photos: string[];
  growthStage: "Seedling" | "Vegetative" | "Flowering" | "Mature";
  historyLogs: CareHistoryLog[];
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  address: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    zipCode: string;
  };
  paymentMethod: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: "user" | "admin";
  isBanned?: boolean;
  joinDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  date: string;
  read: boolean;
}

interface AppContextType {
  user: User | null;
  users: User[];
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  garden: GardenPlant[];
  orders: Order[];
  notifications: Notification[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, "id" | "role" | "joinDate"> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product, quantity: number, variant: string) => void;
  removeFromCart: (productId: string, variant: string) => void;
  updateCartQuantity: (productId: string, variant: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  addPlantToGarden: (plant: Omit<GardenPlant, "id" | "health" | "lastWatered" | "plantingDate" | "photos" | "historyLogs" | "growthStage">) => void;
  addPlantPhoto: (plantId: string, photoUrl: string) => void;
  logCareActivity: (plantId: string, action: string, notes?: string) => void;
  waterPlant: (id: string) => void;
  removePlantFromGarden: (id: string) => void;
  placeOrder: (address: Order["address"], paymentMethod: string, orderTotal?: number) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  addAdminProduct: (product: Omit<Product, "id" | "rating" | "reviewsCount">) => void;
  updateAdminProduct: (productId: string, updatedFields: Partial<Product>) => void;
  deleteAdminProduct: (productId: string) => void;
  toggleUserBan: (userId: string) => void;
  addNotification: (title: string, message: string, type: Notification["type"]) => void;
  markNotificationsAsRead: () => void;
}

const defaultProducts: Product[] = [
  {
    id: "r1", name: "Monstera Albo", scientificName: "Monstera deliciosa 'Albo Borsigiana'", price: 1499.00,
    category: "Rare Plants", rating: 4.9, reviewsCount: 34,
    description: "A highly sought-after rare Monstera with stunning white variegation.",
    details: "Requires bright indirect light to maintain variegation. Do not overwater. A collector's dream plant.",
    sunlight: "Bright Indirect Light", water: "Every 7 Days", temperature: "18°C - 27°C",
    difficulty: "Medium", size: "Medium", stock: 5,
    imageUrl: "/images/monstera_albo.jpg",
    glowColor: "rgba(255, 255, 255, 0.4)", variants: ["Premium Pot"]
  },
  {
    id: "r2", name: "Philodendron Pink Princess", scientificName: "Philodendron erubescens", price: 1299.00,
    category: "Rare Plants", rating: 4.8, reviewsCount: 56,
    description: "Striking dark green leaves adorned with bright pink variegation.",
    details: "Each leaf is completely unique. Needs plenty of bright indirect light to encourage the pink variegation to flourish.",
    sunlight: "Bright Indirect Light", water: "Every 7 Days", temperature: "16°C - 26°C",
    difficulty: "Medium", size: "Medium", stock: 8,
    imageUrl: "/images/pink_princess.jpg",
    glowColor: "rgba(255, 105, 180, 0.4)", variants: ["Ceramic Pot"]
  },
  {
    id: "r3", name: "Variegated Alocasia", scientificName: "Alocasia macrorrhiza variegata", price: 1399.00,
    category: "Rare Plants", rating: 4.7, reviewsCount: 22,
    description: "Large, elephant-ear leaves with spectacular white and green mottling.",
    details: "A dramatic statement piece. Requires high humidity and consistent moisture. Keep away from cold drafts.",
    sunlight: "Bright Indirect Light", water: "Every 5 Days", temperature: "20°C - 30°C",
    difficulty: "Hard", size: "Large", stock: 3,
    imageUrl: "/images/alocasia_variegata.jpg",
    glowColor: "rgba(107, 142, 35, 0.5)", variants: ["Large Nursery Pot"]
  },
  {
    id: "b1", name: "Juniper Bonsai", scientificName: "Juniperus procumbens", price: 899.00,
    category: "Bonsai", rating: 4.8, reviewsCount: 45,
    description: "Classic evergreen bonsai with cascading branches.",
    details: "Requires careful pruning and shaping. Perfect for adding a zen touch to your space.",
    sunlight: "Bright Direct Light", water: "Every 3 Days", temperature: "15°C - 25°C",
    difficulty: "Hard", size: "Small", stock: 12,
    imageUrl: "/images/bonsai juniper.jpg",
    glowColor: "rgba(107, 142, 35, 0.4)", variants: ["Ceramic Tray"]
  },
  {
    id: "b2", name: "Ficus Bonsai", scientificName: "Ficus retusa", price: 1099.00,
    category: "Bonsai", rating: 4.9, reviewsCount: 67,
    description: "Sturdy indoor bonsai with a thick, sculptural trunk.",
    details: "Very forgiving for beginners. Thrives in indoor environments with bright indirect light.",
    sunlight: "Bright Indirect Light", water: "Every 5 Days", temperature: "18°C - 28°C",
    difficulty: "Medium", size: "Small", stock: 8,
    imageUrl: "/images/ficus bonsai.jpg",
    glowColor: "rgba(107, 142, 35, 0.3)", variants: ["Glazed Pot"]
  },
  {
    id: "b3", name: "Premium Juniper", scientificName: "Juniperus chinensis", price: 1499.00,
    category: "Bonsai", rating: 4.9, reviewsCount: 29,
    description: "A meticulously styled premium bonsai specimen.",
    details: "Features beautiful deadwood elements (jin and shari) for a mature, weathered look.",
    sunlight: "Bright Direct Light", water: "Every 2 Days", temperature: "10°C - 25°C",
    difficulty: "Expert", size: "Medium", stock: 4,
    imageUrl: "/images/juniper.jpg",
    glowColor: "rgba(107, 142, 35, 0.5)", variants: ["Artisan Pot"]
  },
  {
    id: "a1", name: "Areca Palm", scientificName: "Dypsis lutescens", price: 699.00,
    category: "Air Purifying", rating: 4.8, reviewsCount: 84,
    description: "Feathery, arching fronds that bring a tropical feel indoors.",
    details: "One of the best plants for improving indoor air quality and adding humidity to the air.",
    sunlight: "Bright Indirect Light", water: "Every 7 Days", temperature: "18°C - 26°C",
    difficulty: "Medium", size: "Large", stock: 15,
    imageUrl: "/images/areca palm.jpg",
    glowColor: "rgba(107, 142, 35, 0.4)", variants: ["Large Pot"]
  },
  {
    id: "a2", name: "Air Purifying Snake Plant", scientificName: "Sansevieria trifasciata", price: 499.00,
    category: "Air Purifying", rating: 4.9, reviewsCount: 142,
    description: "Extremely resilient plant with upright, sword-like leaves.",
    details: "Excellent at converting CO2 into oxygen at night. Perfect for bedrooms.",
    sunlight: "Low to Bright Light", water: "Every 14 Days", temperature: "15°C - 35°C",
    difficulty: "Easy", size: "Medium", stock: 35,
    imageUrl: "/images/snake plant.jpg",
    glowColor: "rgba(107, 142, 35, 0.4)", variants: ["Matte Pot"]
  },
  {
    id: "a3", name: "Air Purifying Peace Lily", scientificName: "Spathiphyllum wallisii", price: 599.00,
    category: "Air Purifying", rating: 4.7, reviewsCount: 92,
    description: "Elegant white flowers on rich green foliage.",
    details: "A top performer in removing indoor air pollutants. Visibly droops when thirsty.",
    sunlight: "Medium Indirect Light", water: "Every 5 Days", temperature: "18°C - 26°C",
    difficulty: "Medium", size: "Medium", stock: 22,
    imageUrl: "/images/peace_lily.jpg",
    glowColor: "rgba(107, 142, 35, 0.3)", variants: ["Ceramic Pot"]
  },
  {
    id: "s1", name: "Crassula Green", scientificName: "Crassula ovata", price: 299.00,
    category: "Succulents", rating: 4.8, reviewsCount: 156,
    description: "Classic Jade Plant with thick, glossy green leaves.",
    details: "Very easy to care for and perfect for bright windowsills. Symbolizes good luck and prosperity.",
    sunlight: "Bright Direct Light", water: "Every 14 Days", temperature: "15°C - 30°C",
    difficulty: "Easy", size: "Small", stock: 45,
    imageUrl: "/images/crassuta green.jpg",
    glowColor: "rgba(107, 142, 35, 0.3)", variants: ["Terracotta Pot"]
  },
  {
    id: "s2", name: "Echeveria Elegans", scientificName: "Echeveria", price: 349.00,
    category: "Succulents", rating: 4.9, reviewsCount: 89,
    description: "Stunning rosette-shaped succulent with a powdery blue-green tint.",
    details: "Produces beautiful pink and yellow flowers in the spring. Requires excellent drainage.",
    sunlight: "Bright Direct Light", water: "Every 14 Days", temperature: "18°C - 28°C",
    difficulty: "Easy", size: "Small", stock: 32,
    imageUrl: "/images/echeveria.jpg",
    glowColor: "rgba(107, 142, 35, 0.4)", variants: ["Ceramic Bowl"]
  },
  {
    id: "s3", name: "Sedum", scientificName: "Sedum rubrotinctum", price: 249.00,
    category: "Succulents", rating: 4.7, reviewsCount: 112,
    description: "Also known as Jelly Bean Plant, with plump colorful leaves.",
    details: "Leaves turn red in the sun. A fun and whimsical addition to any succulent collection.",
    sunlight: "Bright Direct Light", water: "Every 10 Days", temperature: "15°C - 30°C",
    difficulty: "Easy", size: "Small", stock: 50,
    imageUrl: "/images/sedum.jpg",
    glowColor: "rgba(107, 142, 35, 0.2)", variants: ["Nursery Pot"]
  },
  {
    id: "s4", name: "Succulent Cactus", scientificName: "Cactaceae", price: 199.00,
    category: "Succulents", rating: 4.8, reviewsCount: 201,
    description: "A hardy, low-maintenance succulent cactus.",
    details: "Perfect for beginners. Needs very little water and thrives on neglect.",
    sunlight: "Bright Direct Light", water: "Every 21 Days", temperature: "20°C - 35°C",
    difficulty: "Easy", size: "Small", stock: 65,
    imageUrl: "/images/succulunt cactus.jpg",
    glowColor: "rgba(107, 142, 35, 0.2)", variants: ["Mini Pot"]
  },
  {
    id: "p1", name: "Money Plant", scientificName: "Epipremnum aureum", price: 199.00,
    category: "Indoor Plants", rating: 4.8, reviewsCount: 156,
    description: "A popular, easy-to-grow houseplant that brings good luck and positive energy.",
    details: "The Money Plant is a hardy vine that thrives indoors with minimal care. It's known for its beautiful heart-shaped leaves and is believed to bring prosperity.",
    sunlight: "Low to Bright Indirect Light", water: "Every 7 Days", temperature: "15°C - 30°C",
    difficulty: "Easy", size: "Small", stock: 120,
    imageUrl: "/images/money_plant.png",
    glowColor: "rgba(107, 142, 35, 0.4)", variants: ["Basic Pot", "Hanging Basket"]
  },
  {
    id: "p2", name: "Snake Plant", scientificName: "Sansevieria", price: 349.00,
    category: "Indoor Plants", rating: 4.9, reviewsCount: 89,
    description: "Extremely resilient plant with upright, sword-like leaves.",
    details: "Snake plants are nearly indestructible and excellent at purifying indoor air by converting CO2 into oxygen at night.",
    sunlight: "Low to Bright Light", water: "Every 14 Days", temperature: "15°C - 35°C",
    difficulty: "Easy", size: "Medium", stock: 85,
    imageUrl: "/images/snake_plant.png",
    glowColor: "rgba(107, 142, 35, 0.4)", variants: ["Matte Pot"]
  },
  {
    id: "p3", name: "Peace Lily", scientificName: "Spathiphyllum", price: 499.00,
    category: "Indoor Plants", rating: 4.7, reviewsCount: 65,
    description: "Elegant white flowers on rich green foliage.",
    details: "Peace Lilies are excellent natural air purifiers that add a touch of grace to any room. They visibly droop when thirsty, making watering a breeze.",
    sunlight: "Medium Indirect Light", water: "Every 5 Days", temperature: "18°C - 26°C",
    difficulty: "Medium", size: "Medium", stock: 0,
    imageUrl: "/images/peace_lily.png",
    glowColor: "rgba(107, 142, 35, 0.3)", variants: ["Ceramic Pot"]
  },

  {
    id: "p7", name: "Rose Plant", scientificName: "Rosa", price: 299.00,
    category: "Outdoor Plants", rating: 4.9, reviewsCount: 310,
    description: "Classic romantic blooms for your outdoor garden.",
    details: "Produces vibrant and fragrant flowers. Needs full sun and regular pruning to thrive.",
    sunlight: "Full Sun", water: "Every 2 Days", temperature: "15°C - 28°C",
    difficulty: "Medium", size: "Medium", stock: 65,
    imageUrl: "/images/rose_plant.png",
    glowColor: "rgba(107, 142, 35, 0.2)", variants: ["Nursery Pot"]
  },

  {
    id: "p10", name: "Tulsi Plant", scientificName: "Ocimum tenuiflorum", price: 149.00,
    category: "Outdoor Plants", rating: 5.0, reviewsCount: 500,
    description: "Holy Basil, highly revered in India for its medicinal properties.",
    details: "A sacred plant widely cultivated for religious and traditional medicine purposes.",
    sunlight: "Full Sun", water: "Every 2 Days", temperature: "20°C - 35°C",
    difficulty: "Easy", size: "Small", stock: 200,
    imageUrl: "/images/bonsai_tree.png",
    glowColor: "rgba(107, 142, 35, 0.2)", variants: ["Standard Pot"]
  }
];

const mockUsers: User[] = [
  {
    id: "u1",
    name: "Sakshi Sharma",
    email: "sakshi@glass.botany",
    phone: "+91 98765 43210",
    address: "Glass Boutique Lane, Mumbai 400001",
    role: "user",
    joinDate: "2026-01-15T09:30:00Z"
  },
  {
    id: "u2",
    name: "Administrator Prime",
    email: "admin@greensphere.ai",
    role: "admin",
    joinDate: "2025-12-01T08:00:00Z"
  },
  {
    id: "u3",
    name: "Marcus Vance",
    email: "marcus@domain.com",
    phone: "+1 (555) 482-9381",
    address: "99 Solar Crest, Aurora, CO 80016",
    role: "user",
    isBanned: false,
    joinDate: "2026-03-22T14:15:00Z"
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Sync state with localStorage if in client
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [garden, setGarden] = useState<GardenPlant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("gs_user");
      const storedUsers = localStorage.getItem("gs_users");
      const storedProducts = localStorage.getItem("gs_products");
      const storedCart = localStorage.getItem("gs_cart");
      const storedWishlist = localStorage.getItem("gs_wishlist");
      const storedGarden = localStorage.getItem("gs_garden");
      const storedOrders = localStorage.getItem("gs_orders");
      const storedNotifications = localStorage.getItem("gs_notifications");

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        // Migration: If any product price is less than 1000, or we detect duplicate images, or image URLs don't match default products, reset products to default
        const hasOldPrices = parsed.some((p: any) => p.price < 1000);
        const imageSet = new Set(parsed.map((p: any) => p.imageUrl));
        const hasDuplicates = imageSet.size < parsed.length;
        const matchesDefaultImages = parsed.every((p: any) => {
          const dp = defaultProducts.find(d => d.id === p.id);
          return !dp || dp.imageUrl === p.imageUrl;
        });

        if (hasOldPrices || hasDuplicates || !matchesDefaultImages || parsed.length !== defaultProducts.length) {
          setProducts(defaultProducts);
          localStorage.setItem("gs_products", JSON.stringify(defaultProducts));
        } else {
          setProducts(parsed);
        }
      } else {
        setProducts(defaultProducts);
        localStorage.setItem("gs_products", JSON.stringify(defaultProducts));
      }

      const oldBonsaiImg = "photo-1512428559087-560fa5ceab42";
      const oldSucculentImg = "photo-1536882240095-0379873feb4e";
      const newBonsaiImg = "photo-1600565193348-f74bd3c7ccdf";
      const newSucculentImg = "photo-1453904300235-df521a8e430f";

      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      
      if (storedGarden) {
        const parsedGarden = JSON.parse(storedGarden);
        const sanitizedGarden = parsedGarden.map((plant: any) => {
          if (plant.imageUrl && plant.imageUrl.includes(oldBonsaiImg)) {
            return { ...plant, imageUrl: plant.imageUrl.replace(oldBonsaiImg, newBonsaiImg) };
          }
          if (plant.imageUrl && plant.imageUrl.includes(oldSucculentImg)) {
            return { ...plant, imageUrl: plant.imageUrl.replace(oldSucculentImg, newSucculentImg) };
          }
          return plant;
        });
        setGarden(sanitizedGarden);
        localStorage.setItem("gs_garden", JSON.stringify(sanitizedGarden));
      }

      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        const sanitizedOrders = parsedOrders.map((order: any) => {
          const sanitizedItems = order.items.map((item: any) => {
            let updatedProduct = { ...item.product };
            if (updatedProduct.imageUrl && updatedProduct.imageUrl.includes(oldBonsaiImg)) {
              updatedProduct.imageUrl = updatedProduct.imageUrl.replace(oldBonsaiImg, newBonsaiImg);
            }
            if (updatedProduct.imageUrl && updatedProduct.imageUrl.includes(oldSucculentImg)) {
              updatedProduct.imageUrl = updatedProduct.imageUrl.replace(oldSucculentImg, newSucculentImg);
            }
            return { ...item, product: updatedProduct };
          });
          return { ...order, items: sanitizedItems };
        });
        setOrders(sanitizedOrders);
        localStorage.setItem("gs_orders", JSON.stringify(sanitizedOrders));
      }

      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        // Initial welcome notifications
        const initialNotes: Notification[] = [
          {
            id: "n1",
            title: "Welcome to GreenSphere",
            message: "Explore our collection of premium plants and track their care routines.",
            type: "success",
            date: new Date().toISOString(),
            read: false
          },
          {
            id: "n2",
            title: "Watering reminder",
            message: "Your Fiddle Leaf Fig is ready for watering today.",
            type: "warning",
            date: new Date(Date.now() - 3600000).toISOString(),
            read: false
          }
        ];
        setNotifications(initialNotes);
        localStorage.setItem("gs_notifications", JSON.stringify(initialNotes));
      }
    }
  }, []);

  // Helper to save state
  const saveToLocal = (key: string, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const login = async (email: string, passwordHash: string): Promise<boolean> => {
    // Basic simulate auth
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      if (matched.isBanned) {
        addNotification("Access Denied", "Your account has been suspended by an administrator.", "alert");
        return false;
      }
      setUser(matched);
      saveToLocal("gs_user", matched);
      addNotification("Welcome Back", `Successfully logged in as ${matched.name}.`, "success");
      return true;
    }
    // Auto-create user if mock login for easy testing!
    if (email.includes("@")) {
      const isAd = email.startsWith("admin");
      const name = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
      const newUser: User = {
        id: "u_" + Math.random().toString(36).substring(2, 9),
        name: name,
        email: email,
        role: isAd ? "admin" : "user",
        joinDate: new Date().toISOString()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveToLocal("gs_users", updatedUsers);
      setUser(newUser);
      saveToLocal("gs_user", newUser);
      addNotification("Welcome Back", `Created new session for ${name}.`, "success");
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, "id" | "role" | "joinDate">): Promise<boolean> => {
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) return false;

    const newUser: User = {
      ...userData,
      id: "u_" + Math.random().toString(36).substring(2, 9),
      role: "user",
      joinDate: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToLocal("gs_users", updatedUsers);
    
    // Automatically log in
    setUser(newUser);
    saveToLocal("gs_user", newUser);
    addNotification("Account Created", "Welcome to GLASS!", "success");
    return true;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("gs_user");
    }
    addNotification("Logged Out", "You have safely disconnected from GLASS.", "info");
  };

  const addToCart = (product: Product, quantity: number, variant: string) => {
    const updated = [...cart];
    const index = updated.findIndex(
      item => item.product.id === product.id && item.variant === variant
    );

    if (index > -1) {
      updated[index].quantity += quantity;
    } else {
      updated.push({ product, quantity, variant });
    }

    setCart(updated);
    saveToLocal("gs_cart", updated);
    addNotification("Cart Updated", `${product.name} (${variant}) added to cart.`, "success");
  };

  const removeFromCart = (productId: string, variant: string) => {
    const updated = cart.filter(item => !(item.product.id === productId && item.variant === variant));
    setCart(updated);
    saveToLocal("gs_cart", updated);
  };

  const updateCartQuantity = (productId: string, variant: string, quantity: number) => {
    const updated = cart.map(item => {
      if (item.product.id === productId && item.variant === variant) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    setCart(updated);
    saveToLocal("gs_cart", updated);
  };

  const clearCart = () => {
    setCart([]);
    saveToLocal("gs_cart", []);
  };

  const toggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter(id => id !== productId);
    } else {
      updated = [...wishlist, productId];
      const prod = products.find(p => p.id === productId);
      if (prod) {
        addNotification("Wishlist", `${prod.name} added to your wishlist.`, "info");
      }
    }
    setWishlist(updated);
    saveToLocal("gs_wishlist", updated);
  };

  const addPlantToGarden = (plantData: Omit<GardenPlant, "id" | "health" | "lastWatered" | "plantingDate" | "photos" | "historyLogs" | "growthStage">) => {
    const newPlant: GardenPlant = {
      ...plantData,
      id: "gp_" + Math.random().toString(36).substring(2, 9),
      health: 100,
      lastWatered: new Date().toISOString(),
      plantingDate: new Date().toISOString(),
      photos: [plantData.imageUrl],
      growthStage: "Seedling",
      historyLogs: [{
        id: "hl_" + Math.random().toString(36).substring(2, 9),
        action: "Planted",
        date: new Date().toISOString(),
        notes: "Added to digital garden."
      }]
    };
    const updated = [...garden, newPlant];
    setGarden(updated);
    saveToLocal("gs_garden", updated);
    addNotification("My Garden", `${plantData.name} added to your digital garden tracking.`, "success");
  };

  const waterPlant = (id: string) => {
    setGarden(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            health: Math.min(100, p.health + 10),
            lastWatered: new Date().toISOString()
          };
        }
        return p;
      });
      saveToLocal("gs_garden", updated);
      return updated;
    });
    addNotification("Hydration Initiated", "Water system completed watering process successfully.", "success");
  };

  const removePlantFromGarden = (id: string) => {
    const updated = garden.filter(p => p.id !== id);
    setGarden(updated);
    saveToLocal("gs_garden", updated);
  };

  const addPlantPhoto = (plantId: string, photoUrl: string) => {
    setGarden(prev => {
      const updated = prev.map(p => {
        if (p.id === plantId) {
          return { ...p, photos: [...(p.photos || []), photoUrl] };
        }
        return p;
      });
      saveToLocal("gs_garden", updated);
      return updated;
    });
    addNotification("Growth Tracked", "A new photo was added to your plant's timeline.", "success");
  };

  const logCareActivity = (plantId: string, action: string, notes?: string) => {
    setGarden(prev => {
      const updated = prev.map(p => {
        if (p.id === plantId) {
          const newLog: CareHistoryLog = {
            id: "hl_" + Math.random().toString(36).substring(2, 9),
            action,
            date: new Date().toISOString(),
            notes
          };
          return { ...p, historyLogs: [newLog, ...(p.historyLogs || [])] };
        }
        return p;
      });
      saveToLocal("gs_garden", updated);
      return updated;
    });
  };

  const placeOrder = async (address: Order["address"], paymentMethod: string, orderTotal?: number): Promise<Order> => {
    const lastSeq = parseInt(localStorage.getItem("gs_last_order_seq") || "0", 10);
    const nextSeq = lastSeq + 1;
    localStorage.setItem("gs_last_order_seq", nextSeq.toString());
    const paddedSeq = nextSeq.toString().padStart(4, "0");
    const orderId = `GS-2026-${paddedSeq}`;
    
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const finalTotal = orderTotal !== undefined ? orderTotal : (subtotal + (subtotal > 15000 ? 0 : 1500));
    
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      total: finalTotal,
      date: new Date().toISOString(),
      status: "Processing",
      address,
      paymentMethod
    };

    // Auto-add purchased plants to the user's garden automatically!
    const newGardenPlants = [...garden];
    cart.forEach(item => {
      newGardenPlants.push({
        id: "gp_" + Math.random().toString(36).substring(2, 9),
        name: `${item.product.name} #${Math.floor(100 + Math.random() * 900)}`,
        species: item.product.scientificName,
        health: 100,
        lastWatered: new Date().toISOString(),
        waterIntervalHours: item.product.water.toLowerCase().includes("30 days") 
          ? 720 
          : item.product.water.toLowerCase().includes("10 days")
          ? 240
          : item.product.water.toLowerCase().includes("7 days")
          ? 168
          : 96,
        imageUrl: item.product.imageUrl,
        sunlightRequired: item.product.sunlight,
        notes: `Purchased on ${new Date().toLocaleDateString()}`,
        plantingDate: new Date().toISOString(),
        photos: [item.product.imageUrl],
        growthStage: "Seedling",
        historyLogs: [{
          id: "hl_" + Math.random().toString(36).substring(2, 9),
          action: "Purchased",
          date: new Date().toISOString(),
          notes: "Added automatically from order."
        }]
      });
    });

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveToLocal("gs_orders", updatedOrders);
    
    setGarden(newGardenPlants);
    saveToLocal("gs_garden", newGardenPlants);

    clearCart();
    
    addNotification("Order Confirmed", `Order ${orderId} was successfully generated!`, "success");
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status };
      }
      return ord;
    });
    setOrders(updated);
    saveToLocal("gs_orders", updated);
    addNotification("Order Update", `Order ${orderId} has been updated to: ${status}`, "info");
  };

  const addAdminProduct = (productData: Omit<Product, "id" | "rating" | "reviewsCount">) => {
    const newProduct: Product = {
      ...productData,
      id: "p" + (products.length + 1),
      rating: 5.0,
      reviewsCount: 0
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveToLocal("gs_products", updated);
    addNotification("Inventory Management", `New product '${productData.name}' created.`, "success");
  };

  const updateAdminProduct = (productId: string, updatedFields: Partial<Product>) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, ...updatedFields } as Product;
      }
      return p;
    });
    setProducts(updated);
    saveToLocal("gs_products", updated);
    addNotification("Inventory Management", `Product updated successfully.`, "success");
  };

  const deleteAdminProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveToLocal("gs_products", updated);
    addNotification("Inventory Management", `Product was removed from inventory.`, "info");
  };

  const toggleUserBan = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextBanState = !u.isBanned;
        if (nextBanState && u.id === user?.id) {
          // Can't ban yourself
          return u;
        }
        return { ...u, isBanned: nextBanState };
      }
      return u;
    });
    setUsers(updated);
    saveToLocal("gs_users", updated);
    
    const targetUser = users.find(u => u.id === userId);
    addNotification(
      "Security Administration",
      `User ${targetUser?.name || userId} has been ${targetUser?.isBanned ? "unbanned" : "banned"}.`,
      "warning"
    );
  };

  const addNotification = (title: string, message: string, type: Notification["type"]) => {
    const newNote: Notification = {
      id: "n_" + Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => {
      const next = [newNote, ...prev];
      saveToLocal("gs_notifications", next);
      return next;
    });
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      saveToLocal("gs_notifications", next);
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        products,
        cart,
        wishlist,
        garden,
        orders,
        notifications,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        addPlantToGarden,
        addPlantPhoto,
        logCareActivity,
        waterPlant,
        removePlantFromGarden,
        placeOrder,
        updateOrderStatus,
        addAdminProduct,
        updateAdminProduct,
        deleteAdminProduct,
        toggleUserBan,
        addNotification,
        markNotificationsAsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
