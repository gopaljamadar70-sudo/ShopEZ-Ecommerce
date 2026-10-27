export const users = [
  {
    name: 'Admin User',
    email: 'admin@shopez.com',
    password: 'password123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    phone: '+1 555-0199',
    address: {
      street: '100 Commerce Way',
      city: 'San Jose',
      state: 'CA',
      postalCode: '95113',
      country: 'USA',
    },
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    phone: '+1 555-0144',
    address: {
      street: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
    },
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    phone: '+1 555-0188',
    address: {
      street: '789 Broadway Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10003',
      country: 'USA',
    },
  },
];

export const products = [
  {
    name: 'AeroPulse Wireless Noise-Cancelling Headphones',
    description:
      'Engineered with hybrid active noise cancellation, high-fidelity 40mm titanium drivers, and up to 45 hours of continuous battery playback. Ultra-plush memory foam cushions ensure all-day comfort.',
    price: 199.99,
    originalPrice: 249.99,
    category: 'Electronics',
    brand: 'AeroAudio',
    countInStock: 25,
    rating: 4.8,
    numReviews: 12,
    featured: true,
    badge: 'Sale',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    ],
    specs: [
      { key: 'Connectivity', value: 'Bluetooth 5.3 & 3.5mm Aux' },
      { key: 'Battery Life', value: '45 hours with ANC off, 35 hours ANC on' },
      { key: 'Weight', value: '250g' },
    ],
    reviews: [
      {
        name: 'Jane Smith',
        rating: 5,
        comment: 'Best noise-cancelling headphones I have ever used. Soundstage is incredible!',
      },
    ],
  },
  {
    name: 'PrecisionFit Smart Fitness Watch 4',
    description:
      'Advanced biometric tracking with optical heart rate monitor, blood oxygen sensor, GPS navigation, and 5 ATM water resistance. Syncs seamlessly with iOS and Android devices.',
    price: 149.5,
    originalPrice: 179.99,
    category: 'Electronics',
    brand: 'TechPulse',
    countInStock: 30,
    rating: 4.6,
    numReviews: 9,
    featured: true,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    ],
    specs: [
      { key: 'Display', value: '1.43-inch AMOLED (466x466)' },
      { key: 'Water Resistance', value: '5 ATM (50m)' },
      { key: 'Sensors', value: 'SpO2, Heart Rate, Barometer, Gyroscope' },
    ],
  },
  {
    name: 'Minimalist Mechanical Keyboard RGB',
    description:
      'Compact 75% mechanical keyboard featuring hot-swappable custom lubricated switches, sound-dampening foam gaskets, and per-key RGB backlighting.',
    price: 89.99,
    originalPrice: 109.99,
    category: 'Electronics',
    brand: 'KeyFlow',
    countInStock: 18,
    rating: 4.7,
    numReviews: 14,
    featured: false,
    badge: 'Hot',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    ],
    specs: [
      { key: 'Layout', value: '75% Layout (82 keys)' },
      { key: 'Switches', value: 'Hot-swappable Pre-lubed Linear' },
      { key: 'Connectivity', value: 'Triple Mode (2.4Ghz, BT 5.0, Type-C)' },
    ],
  },
  {
    name: 'Artisan Pour-Over Ceramic Coffee Dripper & Carafe',
    description:
      'Handcrafted heat-resistant borosilicate glass server with double-layered ultra-fine mesh stainless steel and ceramic cone. Brew rich, sediment-free coffee every morning.',
    price: 42.0,
    originalPrice: 48.0,
    category: 'Home & Kitchen',
    brand: 'BrewCraft',
    countInStock: 40,
    rating: 4.9,
    numReviews: 8,
    featured: true,
    badge: '',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    ],
    specs: [
      { key: 'Capacity', value: '600 ml (2-4 cups)' },
      { key: 'Material', value: 'Borosilicate Glass & Matte Ceramic' },
      { key: 'Dishwasher Safe', value: 'Yes' },
    ],
  },
  {
    name: 'Summit Waterproof Ultralight Hiking Backpack 35L',
    description:
      'Ripstop nylon backpack with ergonomic breathable harness, integrated rain cover, hydration bladder sleeve, and exterior gear loops for trekking poles.',
    price: 79.99,
    originalPrice: 95.0,
    category: 'Sports & Outdoors',
    brand: 'PeakExpedition',
    countInStock: 15,
    rating: 4.5,
    numReviews: 7,
    featured: false,
    badge: 'Trending',
    images: [
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    ],
    specs: [
      { key: 'Volume', value: '35 Liters' },
      { key: 'Material', value: '420D Waterproof Diamond Ripstop Nylon' },
      { key: 'Weight', value: '880g' },
    ],
  },
  {
    name: 'EcoComfort Organic Cotton Casual Hoodie',
    description:
      'Sustainably sourced 100% GOTS-certified heavyweight organic cotton hoodie with brushed interior fleece, ribbed cuffs, and spacious kangaroo pocket.',
    price: 54.0,
    originalPrice: 65.0,
    category: 'Fashion',
    brand: 'EcoWear',
    countInStock: 50,
    rating: 4.6,
    numReviews: 11,
    featured: false,
    badge: 'Eco Friendly',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    ],
    specs: [
      { key: 'Material', value: '100% Organic Combed Ring-Spun Cotton' },
      { key: 'Fit', value: 'Relaxed Unisex Fit' },
      { key: 'Care', value: 'Machine wash cold' },
    ],
  },
  {
    name: 'Stainless Steel Vacuum Insulated Travel Tumbler 24oz',
    description:
      'Double-wall vacuum insulation keeps iced beverages frosty for 24 hours or piping hot for 12 hours. Features leak-proof flip lid with silicone straw compatibility.',
    price: 24.99,
    originalPrice: 29.99,
    category: 'Home & Kitchen',
    brand: 'ThermoPro',
    countInStock: 65,
    rating: 4.7,
    numReviews: 22,
    featured: false,
    badge: '',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    ],
    specs: [
      { key: 'Capacity', value: '24 oz / 710 ml' },
      { key: 'Material', value: '18/8 Food-Grade Stainless Steel' },
      { key: 'BPA Free', value: 'Yes' },
    ],
  },
  {
    name: 'UltraSonic Electric Sonic Toothbrush Pro',
    description:
      '40,000 vibrations per minute with 5 specialized cleaning modes, built-in smart 2-minute timer with 30-second interval alerts, and 60-day wireless battery life.',
    price: 49.95,
    originalPrice: 69.95,
    category: 'Health & Personal Care',
    brand: 'SmileTech',
    countInStock: 35,
    rating: 4.8,
    numReviews: 16,
    featured: true,
    badge: 'Sale',
    images: [
      'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80',
    ],
    specs: [
      { key: 'Modes', value: 'Clean, White, Polish, Massage, Sensitive' },
      { key: 'Battery', value: 'Lithium-ion with USB Fast Charging' },
      { key: 'Waterproof', value: 'IPX7 Waterproof' },
    ],
  },
];

export const coupons = [
  {
    code: 'WELCOME10',
    discountPercentage: 10,
    minPurchaseAmount: 20,
    usageLimit: 500,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
  },
  {
    code: 'SAVE20',
    discountPercentage: 20,
    minPurchaseAmount: 100,
    usageLimit: 200,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
  },
  {
    code: 'FLASH50',
    discountPercentage: 50,
    minPurchaseAmount: 150,
    usageLimit: 50,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
];
