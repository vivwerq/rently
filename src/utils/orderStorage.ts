import type { UserOrder } from '../types/order';

const STORAGE_KEY = 'rently_user_orders_v1';

const INITIAL_DEMO_ORDERS: UserOrder[] = [
  {
    id: 'ORD-482910',
    listingId: 'car-1',
    title: 'Hyundai Creta SX (O) Diesel AT (2024)',
    category: 'CAR',
    primaryImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    status: 'CONFIRMED',
    createdAt: 'Today, 2:15 PM',
    totalPayableNow: 5600,
    securityDeposit: 2400,
    handoverOtp: '482910',
    handoverLocation: 'Mohali Phase 7 (Operator Hub)',
    rentalDuration: '2 Days',
    operatorName: 'Tricity SelfDrive Mobility',
    regNumber: 'PB65-AX-7821'
  },
  {
    id: 'ORD-108422',
    listingId: 'room-2',
    title: 'Bajaj 65L Desert Air Cooler with Honeycomb Pads',
    category: 'ROOM_ESSENTIAL',
    primaryImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    status: 'COMPLETED',
    createdAt: 'Last Month',
    totalPayableNow: 1798,
    securityDeposit: 300,
    handoverOtp: '912044',
    handoverLocation: 'CU Gate 2 Hostels',
    rentalDuration: '3 Months'
  }
];

export function getStoredOrders(): UserOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ORDERS;
  }
}

export function saveOrder(newOrder: Omit<UserOrder, 'id' | 'createdAt' | 'handoverOtp'> & { id?: string; handoverOtp?: string }): UserOrder {
  const currentOrders = getStoredOrders();
  const id = newOrder.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const handoverOtp = newOrder.handoverOtp || `${Math.floor(100000 + Math.random() * 900000)}`;

  const order: UserOrder = {
    ...newOrder,
    id,
    handoverOtp,
    status: 'CONFIRMED',
    createdAt: 'Just now'
  };

  const updated = [order, ...currentOrders.filter(o => o.id !== id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save order to storage', e);
  }
  return order;
}

export function updateOrderStatus(orderId: string, status: UserOrder['status']): void {
  const current = getStoredOrders();
  const updated = current.map(o => o.id === orderId ? { ...o, status } : o);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not update order', e);
  }
}

export function removeOrder(orderId: string): void {
  const current = getStoredOrders();
  const updated = current.filter(o => o.id !== orderId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not remove order', e);
  }
}

export function resetAllDemoData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('rently_saved_favorites');
  localStorage.removeItem('rently_active_booking');
}
