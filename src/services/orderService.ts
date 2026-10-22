import type { UserOrder, OrderStatus } from '../types/order';
import { getStoredOrders, saveOrder as persistOrder, updateOrderStatus as persistStatus, removeOrder as persistRemove } from '../utils/orderStorage';

export const orderService = {
  /**
   * Get all user orders from persistent storage.
   */
  async getOrders(): Promise<UserOrder[]> {
    return getStoredOrders();
  },

  /**
   * Look up an order by ID.
   */
  async getOrderById(id: string): Promise<UserOrder | null> {
    const orders = getStoredOrders();
    return orders.find(o => o.id === id) || null;
  },

  /**
   * Create and persist a new order.
   */
  async createOrder(orderPayload: Omit<UserOrder, 'id' | 'createdAt' | 'handoverOtp'> & { id?: string; handoverOtp?: string }): Promise<UserOrder> {
    return persistOrder(orderPayload);
  },

  /**
   * Update the status of an active order.
   */
  async updateStatus(id: string, status: OrderStatus): Promise<UserOrder | null> {
    persistStatus(id, status);
    return this.getOrderById(id);
  },

  /**
   * Cancel / delete an order.
   */
  async cancelOrder(id: string): Promise<boolean> {
    persistRemove(id);
    return true;
  }
};
