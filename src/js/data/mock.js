/**
 * Medina Alacarte — Mock Data
 * Digunakan saat Supabase belum dikonfigurasi
 */

export const MOCK_CATEGORIES = [
  { id: 'all', name: 'Semua', icon: '☕' },
  { id: 'coffee', name: 'Coffee', icon: '☕' },
  { id: 'non-coffee', name: 'Non-Coffee', icon: '🧋' },
  { id: 'pastry', name: 'Pastry', icon: '🥐' },
  { id: 'light-meal', name: 'Light Meal', icon: '🥗' },
  { id: 'dessert', name: 'Dessert', icon: '🍰' }
];

export const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Espresso Classico',
    category: 'coffee',
    price: 22000,
    description: 'Shot espresso premium dari biji Arabica pilihan. Bold dan intense.',
    image: 'https://picsum.photos/seed/espresso1/400/400',
    best_seller: true,
    rating: 4.8
  },
  {
    id: 'p2',
    name: 'Caramel Latte',
    category: 'coffee',
    price: 32000,
    description: 'Espresso dengan susu steamed dan sirup karamel lembut.',
    image: 'https://picsum.photos/seed/caramel2/400/400',
    best_seller: true,
    rating: 4.9
  },
  {
    id: 'p3',
    name: 'Vanilla Cold Brew',
    category: 'coffee',
    price: 35000,
    description: 'Cold brew 12 jam dengan vanilla bean Madagascar.',
    image: 'https://picsum.photos/seed/coldbrew3/400/400',
    best_seller: false,
    rating: 4.6
  },
  {
    id: 'p4',
    name: 'Matcha Latte',
    category: 'non-coffee',
    price: 30000,
    description: 'Matcha ceremonial grade Uji, Jepang. Creamy dan smooth.',
    image: 'https://picsum.photos/seed/matcha4/400/400',
    best_seller: true,
    rating: 4.9
  },
  {
    id: 'p5',
    name: 'Chocolate Bliss',
    category: 'non-coffee',
    price: 33000,
    description: 'Belgian dark chocolate dengan susu oat dan whipped cream.',
    image: 'https://picsum.photos/seed/choco5/400/400',
    best_seller: false,
    rating: 4.5
  },
  {
    id: 'p6',
    name: 'Taro Milk Tea',
    category: 'non-coffee',
    price: 28000,
    description: 'Taro asli dengan fresh milk dan boba pearl.',
    image: 'https://picsum.photos/seed/taro6/400/400',
    best_seller: false,
    rating: 4.4
  },
  {
    id: 'p7',
    name: 'Butter Croissant',
    category: 'pastry',
    price: 25000,
    description: 'Croissant butter Prancis, flaky dan golden. Dipanggang fresh.',
    image: 'https://picsum.photos/seed/croissant7/400/400',
    best_seller: true,
    rating: 4.7
  },
  {
    id: 'p8',
    name: 'Almond Danish',
    category: 'pastry',
    price: 28000,
    description: 'Danish pastry dengan almond cream dan sliced almond.',
    image: 'https://picsum.photos/seed/danish8/400/400',
    best_seller: false,
    rating: 4.3
  },
  {
    id: 'p9',
    name: 'Chicken Pesto Sandwich',
    category: 'light-meal',
    price: 42000,
    description: 'Sourdough toast dengan chicken breast, pesto, dan mixed greens.',
    image: 'https://picsum.photos/seed/sandwich9/400/400',
    best_seller: false,
    rating: 4.6
  },
  {
    id: 'p10',
    name: 'Truffle Fries',
    category: 'light-meal',
    price: 35000,
    description: 'Crispy fries dengan truffle oil, parmesan, dan rosemary.',
    image: 'https://picsum.photos/seed/fries10/400/400',
    best_seller: true,
    rating: 4.8
  },
  {
    id: 'p11',
    name: 'Tiramisu Cake',
    category: 'dessert',
    price: 38000,
    description: 'Classic tiramisu dengan mascarpone dan espresso soaked ladyfinger.',
    image: 'https://picsum.photos/seed/tiramisu11/400/400',
    best_seller: false,
    rating: 4.7
  },
  {
    id: 'p12',
    name: 'Strawberry Shortcake',
    category: 'dessert',
    price: 36000,
    description: 'Layered sponge cake dengan fresh strawberry dan whipped cream.',
    image: 'https://picsum.photos/seed/shortcake12/400/400',
    best_seller: false,
    rating: 4.5
  },
  {
    id: 'p13',
    name: 'Americano',
    category: 'coffee',
    price: 24000,
    description: 'Double shot espresso dengan hot water. Clean dan bold.',
    image: 'https://picsum.photos/seed/americano13/400/400',
    best_seller: false,
    rating: 4.4
  },
  {
    id: 'p14',
    name: 'Mocha Frappe',
    category: 'coffee',
    price: 37000,
    description: 'Blended iced coffee dengan chocolate dan whipped cream.',
    image: 'https://picsum.photos/seed/mocha14/400/400',
    best_seller: true,
    rating: 4.8
  },
  {
    id: 'p15',
    name: 'Pistachio Latte',
    category: 'non-coffee',
    price: 38000,
    description: 'Pistachio cream dengan espresso dan oat milk. Trending!',
    image: 'https://picsum.photos/seed/pistachio15/400/400',
    best_seller: true,
    rating: 4.9
  },
  {
    id: 'p16',
    name: 'Egg Benedict',
    category: 'light-meal',
    price: 48000,
    description: 'Poached egg, hollandaise sauce, dan smoked ham on English muffin.',
    image: 'https://picsum.photos/seed/eggben16/400/400',
    best_seller: false,
    rating: 4.6
  }
];