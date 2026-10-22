export type OrderStatus =
  | 'CONFIRMED'
  | 'HANDOVER_IN_PROGRESS'
  | 'ACTIVE_TRIP'
  | 'COMPLETED'
  | 'CANCELLED';

export interface UserOrder {
  id: string; // e.g. "ORD-941820"
  listingId: string;
  title: string;
  category: 'CAR' | 'ROOM_ESSENTIAL' | 'ELECTRONICS' | 'RESALE' | 'MAKER';
  primaryImage: string;
  status: OrderStatus;
  createdAt: string;
  totalPayableNow: number;
  securityDeposit: number;
  handoverOtp: string; // e.g. "482910"
  handoverLocation: string;
  rentalDuration?: string;
  operatorName?: string;
  regNumber?: string;
  buyerContact?: string;
  customText?: string;
  leadDays?: number;
}
