import { CartItem } from '@/types/cart';

// Mock cart data matching the screenshot
export const mockProductsData: CartItem[] = [
  {
    id: '1',
    name: 'Classic Cotton Shirt',
    price: 799,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&crop=center',
    cashback: 'Upto 12% cash back',
    category: 'products'
  },
  {
    id: '2',
    name: 'Shoes',
    price: 799,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop&crop=center',
    cashback: 'Upto 12% cash back',
    category: 'products'
  },
  {
    id: '3',
    name: 'Gifts',
    price: 799,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop&crop=center',
    cashback: 'Upto 12% cash back',
    category: 'products'
  },
  {
    id: '4',
    name: 'Fruits',
    price: 799,
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop&crop=center',
    cashback: 'Upto 12% cash back',
    category: 'products'
  },
  {
    id: '5',
    name: 'Fruits',
    price: 799,
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&h=200&fit=crop&crop=center',
    cashback: 'Upto 12% cash back',
    category: 'products'
  },
];

export const mockServicesData: CartItem[] = [
  {
    id: 's1',
    name: 'Home Cleaning Service',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center',
    cashback: 'Upto 15% cash back',
    category: 'service'
  },
  {
    id: 's2',
    name: 'Plumbing Service',
    price: 999,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop&crop=center',
    cashback: 'Upto 10% cash back',
    category: 'service'
  },
  {
    id: 's3',
    name: 'Electrical Repair',
    price: 799,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop&crop=center',
    cashback: 'Upto 12% cash back',
    category: 'service'
  },
];

// Helper function to calculate total price
export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price, 0);
};

// Helper function to get item count
export const getItemCount = (items: CartItem[]): number => {
  return items.length;
};