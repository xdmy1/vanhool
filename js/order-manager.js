// Order Management System
import { CONFIG, UTILS } from './config.js';

class OrderManager {
    constructor() {
        this.isInitialized = false;
        this.currentOrder = null;
        this.listeners = [];
        
        this.init();
    }
    
    async init() {
        try {
            this.isInitialized = true;
            console.log('✅ Order Manager initialized');
        } catch (error) {
            console.error('Order Manager initialization error:', error);
        }
    }
    
    // Create order from cart
    async createOrder(orderData) {
        try {
            if (!window.cartManager || window.cartManager.isEmpty()) {
                throw new Error('Coșul este gol');
            }
            
            // Check if user is authenticated (required for orders)
            if (!window.authManager || !window.authManager.isAuthenticated()) {
                throw new Error('Trebuie să vă autentificați pentru a plasa o comandă');
            }
            
            // Validate cart items before creating order
            const validationResults = await window.cartManager.validateCartItems();
            const invalidItems = validationResults.filter(r => !r.valid);
            
            if (invalidItems.length > 0) {
                throw new Error('Coșul conține produse invalide. Verificați din nou coșul.');
            }
            
            const cart = window.cartManager.getCart();
            const user = window.authManager.getUser();
            
            // Prepare order data
            const order = {
                id: UTILS.generateId('order'),
                user_id: user.id,
                status: 'pending',
                
                // Customer info
                customer_info: {
                    firstName: orderData.firstName,
                    lastName: orderData.lastName,
                    email: orderData.email,
                    phone: orderData.phone,
                    company: orderData.company || null
                },
                
                // Billing address
                billing_address: {
                    street: orderData.billingAddress.street,
                    city: orderData.billingAddress.city,
                    state: orderData.billingAddress.state,
                    postalCode: orderData.billingAddress.postalCode,
                    country: orderData.billingAddress.country || 'România'
                },
                
                // Shipping address
                shipping_address: orderData.sameAsShipping ? 
                    orderData.billingAddress : orderData.shippingAddress,
                    
                // Order items
                items: cart.items.map(item => ({
                    product_id: item.productId,
                    product_name: item.name,
                    product_sku: item.sku,
                    product_image: item.image,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.totalPrice,
                    product_details: {
                        brand: item.brand,
                        category: item.category
                    }
                })),
                
                // Pricing
                subtotal: cart.subtotal,
                discount_amount: cart.discountAmount,
                shipping_cost: cart.shipping,
                total: cart.total,
                currency: CONFIG.currency,
                
                // Promo code
                promocode_id: cart.promocode?.id || null,
                promocode_code: cart.promocode?.code || null,
                
                // Payment and shipping
                payment_method: orderData.paymentMethod,
                shipping_method: orderData.shippingMethod || 'standard',
                
                // Notes
                notes: orderData.notes || null,
                
                // Metadata
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                order_number: this.generateOrderNumber(),
                session_id: window.cartManager.getSessionId()
            };
            
            // Save order to database
            const savedOrder = await this.saveOrderToDatabase(order);
            
            // Update promo code usage if applied
            if (cart.promocode) {
                await this.updatePromoCodeUsage(cart.promocode.id);
            }
            
            // Reserve stock for order items
            await this.reserveStock(savedOrder.items);
            
            // Store current order
            this.currentOrder = savedOrder;
            
            // Notify listeners
            this.notifyListeners('order_created', { order: savedOrder });
            
            return {
                success: true,
                order: savedOrder,
                message: 'Comanda a fost creată cu succes'
            };
            
        } catch (error) {
            console.error('Error creating order:', error);
            return {
                success: false,
                error: error.message || 'Eroare la crearea comenzii'
            };
        }
    }
    
    // Generate unique order number
    generateOrderNumber() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 9000) + 1000;
        
        return `${year}${month}${day}${random}`;
    }
    
    // Save order to database
    async saveOrderToDatabase(order) {
        try {
            // Save main order
            const { data: savedOrder, error: orderError } = await CONFIG.supabase
                .from('orders')
                .insert({
                    id: order.id,
                    user_id: order.user_id,
                    order_number: order.order_number,
                    status: order.status,
                    customer_info: order.customer_info,
                    billing_address: order.billing_address,
                    shipping_address: order.shipping_address,
                    subtotal: order.subtotal,
                    discount_amount: order.discount_amount,
                    shipping_cost: order.shipping_cost,
                    total: order.total,
                    currency: order.currency,
                    promocode_id: order.promocode_id,
                    promocode_code: order.promocode_code,
                    payment_method: order.payment_method,
                    shipping_method: order.shipping_method,
                    notes: order.notes,
                    session_id: order.session_id,
                    created_at: order.created_at,
                    updated_at: order.updated_at
                })
                .select()
                .single();
                
            if (orderError) throw orderError;
            
            // Save order items
            const orderItems = order.items.map(item => ({
                order_id: savedOrder.id,
                product_id: item.product_id,
                product_name: item.product_name,
                product_sku: item.product_sku,
                product_image: item.product_image,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                product_details: item.product_details
            }));
            
            const { error: itemsError } = await CONFIG.supabase
                .from('order_items')
                .insert(orderItems);
                
            if (itemsError) throw itemsError;
            
            // Return complete order with items
            return {
                ...savedOrder,
                items: orderItems
            };
            
        } catch (error) {
            console.error('Database save error:', error);
            throw new Error('Eroare la salvarea comenzii în baza de date');
        }
    }
    
    // Update promo code usage
    async updatePromoCodeUsage(promocodeId) {
        try {
            const { error } = await CONFIG.supabase
                .from('promocodes')
                .update({ 
                    used_count: CONFIG.supabase.raw('used_count + 1'),
                    updated_at: new Date().toISOString()
                })
                .eq('id', promocodeId);
                
            if (error) throw error;
            
        } catch (error) {
            console.error('Error updating promo code usage:', error);
            // Don't throw - this is not critical for order creation
        }
    }
    
    // Reserve stock for order items
    async reserveStock(items) {
        try {
            for (const item of items) {
                const { error } = await CONFIG.supabase
                    .from('products')
                    .update({ 
                        stock_quantity: CONFIG.supabase.raw(`stock_quantity - ${item.quantity}`),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.product_id)
                    .gte('stock_quantity', item.quantity);
                    
                if (error) {
                    console.error(`Stock reservation error for product ${item.product_id}:`, error);
                    // Continue with other items
                }
            }
        } catch (error) {
            console.error('Error reserving stock:', error);
            // Don't throw - this is not critical for order creation
        }
    }
    
    // Get order by ID
    async getOrder(orderId, includeItems = true) {
        try {
            let query = CONFIG.supabase
                .from('orders')
                .select('*');
                
            if (includeItems) {
                query = query.select(`
                    *,
                    order_items(*)
                `);
            }
            
            const { data: order, error } = await query
                .eq('id', orderId)
                .single();
                
            if (error) throw error;
            return order;
            
        } catch (error) {
            console.error('Error fetching order:', error);
            return null;
        }
    }
    
    // Get orders for user
    async getUserOrders(userId, options = {}) {
        try {
            const { page = 1, limit = 10, status = null } = options;
            const offset = (page - 1) * limit;
            
            let query = CONFIG.supabase
                .from('orders')
                .select(`
                    *,
                    order_items(*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
                
            if (status) {
                query = query.eq('status', status);
            }
            
            const { data: orders, error } = await query;
            
            if (error) throw error;
            return orders || [];
            
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
    }
    
    // Get order by number (authenticated users only)
    async getOrderByNumber(orderNumber) {
        try {
            if (!window.authManager || !window.authManager.isAuthenticated()) {
                throw new Error('Autentificare necesară');
            }
            
            const userId = window.authManager.getUserId();
            const { data: order, error } = await CONFIG.supabase
                .from('orders')
                .select(`
                    *,
                    order_items(*)
                `)
                .eq('user_id', userId)
                .eq('order_number', orderNumber)
                .single();
                
            if (error) throw error;
            return order;
            
        } catch (error) {
            console.error('Error fetching order by number:', error);
            return null;
        }
    }
    
    // Update order status
    async updateOrderStatus(orderId, newStatus, notes = null) {
        try {
            const validStatuses = CONFIG.orderStatuses.map(s => s.value);
            if (!validStatuses.includes(newStatus)) {
                throw new Error('Status invalid');
            }
            
            const updateData = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };
            
            // Add status-specific fields
            switch (newStatus) {
                case 'confirmed':
                    updateData.confirmed_at = new Date().toISOString();
                    break;
                case 'shipped':
                    updateData.shipped_at = new Date().toISOString();
                    break;
                case 'delivered':
                    updateData.delivered_at = new Date().toISOString();
                    break;
                case 'cancelled':
                    updateData.cancelled_at = new Date().toISOString();
                    if (notes) updateData.cancellation_reason = notes;
                    break;
            }
            
            const { data: updatedOrder, error } = await CONFIG.supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId)
                .select()
                .single();
                
            if (error) throw error;
            
            // If order is cancelled, restore stock
            if (newStatus === 'cancelled') {
                await this.restoreStock(orderId);
            }
            
            this.notifyListeners('order_status_updated', { 
                orderId, 
                newStatus, 
                order: updatedOrder 
            });
            
            return {
                success: true,
                order: updatedOrder
            };
            
        } catch (error) {
            console.error('Error updating order status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Restore stock when order is cancelled
    async restoreStock(orderId) {
        try {
            // Get order items
            const { data: orderItems, error: itemsError } = await CONFIG.supabase
                .from('order_items')
                .select('product_id, quantity')
                .eq('order_id', orderId);
                
            if (itemsError || !orderItems) {
                console.error('Error fetching order items for stock restoration:', itemsError);
                return;
            }
            
            // Restore stock for each item
            for (const item of orderItems) {
                const { error } = await CONFIG.supabase
                    .from('products')
                    .update({ 
                        stock_quantity: CONFIG.supabase.raw(`stock_quantity + ${item.quantity}`),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.product_id);
                    
                if (error) {
                    console.error(`Stock restoration error for product ${item.product_id}:`, error);
                }
            }
            
        } catch (error) {
            console.error('Error restoring stock:', error);
        }
    }
    
    // Calculate order total
    calculateOrderTotal(items, shippingCost = 0, discountAmount = 0) {
        const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
        return Math.max(0, subtotal - discountAmount + shippingCost);
    }
    
    // Get order status info
    getOrderStatusInfo(status) {
        return CONFIG.orderStatuses.find(s => s.value === status) || 
               { value: status, label: status, color: 'gray', description: '' };
    }
    
    // Format order for display
    formatOrderForDisplay(order) {
        return {
            ...order,
            formattedTotal: UTILS.formatPrice(order.total),
            formattedSubtotal: UTILS.formatPrice(order.subtotal),
            formattedShipping: UTILS.formatPrice(order.shipping_cost),
            formattedDiscount: UTILS.formatPrice(order.discount_amount),
            formattedDate: UTILS.formatDate(order.created_at),
            formattedDateTime: UTILS.formatDateTime(order.created_at),
            statusInfo: this.getOrderStatusInfo(order.status),
            itemCount: order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
        };
    }
    
    // Send order confirmation email
    async sendOrderConfirmationEmail(orderId) {
        try {
            // This would integrate with your email service
            // For now, just log the action
            console.log(`Order confirmation email should be sent for order: ${orderId}`);
            
            // In a real implementation, you would:
            // 1. Get order details
            // 2. Generate email template
            // 3. Send via email service (SendGrid, etc.)
            
            return { success: true };
            
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Clear cart after successful order
    clearCartAfterOrder() {
        if (window.cartManager) {
            window.cartManager.clear();
        }
    }
    
    // Event listeners
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    notifyListeners(event, data = {}) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Order listener error:', error);
            }
        });
    }
    
    // Public getters
    getCurrentOrder() {
        return this.currentOrder;
    }
    
    isReady() {
        return this.isInitialized;
    }
}

// Create global instance
const orderManager = new OrderManager();

// Make it globally available
window.orderManager = orderManager;

export { orderManager };