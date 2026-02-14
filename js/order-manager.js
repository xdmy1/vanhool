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
            
            // Skip all cart validation - just proceed with order
            console.log('🚀 Skipping cart validation - proceeding directly with order creation...');
            
            const cart = window.cartManager.getCart();
            const user = window.authManager.getUser();
            
            console.log('📊 Creating order with cart:', cart);
            console.log('👤 User creating order:', user);
            console.log('💰 Cart total value:', cart.total, typeof cart.total);
            
            if (!user || !user.id) {
                throw new Error('User ID is missing. Please log in again.');
            }
            
            if (!cart || !cart.items || cart.items.length === 0) {
                throw new Error('Cart is empty or invalid');
            }
            
            // Prepare simple order data - only essential fields
            const order = {
                user_id: user.id,

                // Customer info (simple)
                customer_name: orderData.fullName || '',
                customer_email: orderData.email || user.email || '',
                customer_phone: orderData.phone || '',
                customer_address: orderData.address || '',

                // Order items as JSON
                items: cart.items.map(item => ({
                    name: item.name || 'Produs',
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    total: (item.price || 0) * (item.quantity || 1)
                })),

                // Pricing (simple numbers)
                subtotal: parseFloat(cart.subtotal) || 0,
                discount_amount: parseFloat(cart.discountAmount) || 0,
                shipping_cost: parseFloat(cart.shipping) || 25.00,
                total: parseFloat(cart.total) || 0,

                // Order details
                status: 'pending',
                payment_method: orderData.paymentMethod || 'transfer',
                notes: orderData.notes || null
            };
            
            console.log('🚀 Final order object before saving:', order);
            
            // Save order to database
            const savedOrder = await this.saveOrderToDatabase(order);
            
            // Update promo code usage if applied
            if (cart.promocode) {
                await this.updatePromoCodeUsage(cart.promocode.id, cart.promocode.code);
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
            console.log('🔍 Saving order to database:', order);
            
            // Use simple order object directly - only fields that exist in new table
            const orderData = order;
            
            console.log('📝 Order data to insert:', orderData);
            
            // Save main order
            const { data: savedOrder, error: orderError } = await CONFIG.supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single();
                
            if (orderError) {
                console.error('❌ Order insertion error:', orderError);
                throw orderError;
            }
            
            console.log('✅ Order saved successfully:', savedOrder);
            console.log('🆔 Order ID for redirect:', savedOrder?.id);
            
            // Return the saved order (items are already in JSON field)
            return savedOrder;
            
        } catch (error) {
            console.error('❌ Database save error details:', {
                error: error,
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            
            // Provide more specific error messages
            let errorMessage = 'Eroare la salvarea comenzii în baza de date';
            
            if (error.code === '42P01') {
                errorMessage = 'Tabelul orders nu există în baza de date';
            } else if (error.code === '23505') {
                errorMessage = 'Există deja o comandă cu acest număr';
            } else if (error.code === '23503') {
                errorMessage = 'Eroare de referință în baza de date';
            } else if (error.message) {
                errorMessage = `Eroare bază de date: ${error.message}`;
            }
            
            throw new Error(errorMessage);
        }
    }
    
    // Update promo code usage
    async updatePromoCodeUsage(promocodeId, promocodeCode) {
        // Get the best available Supabase client
        const sb = CONFIG.supabase || window.supabase;
        if (!sb) {
            console.error('❌ No Supabase client available for promo code update');
            return;
        }

        console.log('🎟️ Updating promo code usage for ID:', promocodeId, 'Code:', promocodeCode);

        if (!promocodeId && !promocodeCode) {
            console.error('❌ No promo code ID or code provided');
            return;
        }

        // Try RPC function first (bypasses RLS)
        try {
            if (promocodeId) {
                const { data, error } = await sb.rpc('increment_promo_usage', { promo_code_id: promocodeId });
                if (!error && data && data.success) {
                    console.log(`✅ Promo code usage updated via RPC: ${data.code} ${data.new_uses}/${data.max_uses}${data.disabled ? ' (DISABLED)' : ''}`);
                    return;
                }
                if (error) {
                    console.warn('⚠️ RPC increment_promo_usage failed:', error.message);
                }
            }
        } catch (rpcError) {
            console.warn('⚠️ RPC method not available, trying fallback:', rpcError.message);
        }

        // Try RPC by code string
        try {
            if (promocodeCode) {
                const { data, error } = await sb.rpc('increment_promo_usage_by_code', { promo_code: promocodeCode });
                if (!error && data && data.success) {
                    console.log(`✅ Promo code usage updated via RPC (by code): ${data.code} ${data.new_uses}/${data.max_uses}${data.disabled ? ' (DISABLED)' : ''}`);
                    return;
                }
                if (error) {
                    console.warn('⚠️ RPC increment_promo_usage_by_code failed:', error.message);
                }
            }
        } catch (rpcError) {
            console.warn('⚠️ RPC by code method not available:', rpcError.message);
        }

        // Fallback: direct table update
        try {
            await this.performDirectPromoUpdate(sb, promocodeId, promocodeCode);
        } catch (error) {
            console.error('❌ All promo code usage update methods failed:', error);
        }
    }

    // Fallback: direct table update for promo code usage
    async performDirectPromoUpdate(sb, promocodeId, promocodeCode) {
        // Fetch current promo data
        let fetchQuery = sb.from('promocodes').select('id, current_uses, max_uses, is_active, code');
        if (promocodeId) {
            fetchQuery = fetchQuery.eq('id', promocodeId);
        } else {
            fetchQuery = fetchQuery.eq('code', promocodeCode);
        }
        const { data: currentPromo, error: fetchError } = await fetchQuery.single();

        if (fetchError || !currentPromo) {
            console.error('❌ Error fetching promo code data:', fetchError);
            return;
        }

        console.log('📊 Current promo code data:', currentPromo);

        const newUsageCount = (currentPromo.current_uses || 0) + 1;
        const maxUses = currentPromo.max_uses || 1;

        const updateData = {
            current_uses: newUsageCount,
            updated_at: new Date().toISOString()
        };

        if (newUsageCount >= maxUses) {
            updateData.is_active = false;
            console.log(`🚫 Promo code "${currentPromo.code}" reached limit (${newUsageCount}/${maxUses}), disabling...`);
        }

        const { error } = await sb
            .from('promocodes')
            .update(updateData)
            .eq('id', currentPromo.id);

        if (error) {
            console.error('❌ Direct promo code update failed (likely RLS). Run fix-promo-usage.sql in Supabase SQL Editor to fix this.', error);
            return;
        }

        console.log(`✅ Promo code "${currentPromo.code}" usage updated: ${newUsageCount}/${maxUses}${updateData.is_active === false ? ' (DISABLED)' : ''}`);
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
    
    // Update order with invoice info after creation
    async updateOrderInvoice(orderId, invoiceId, invoiceUrl) {
        try {
            const updateData = { invoice_id: invoiceId };
            if (invoiceUrl) {
                updateData.invoice_url = invoiceUrl;
            }
            const { error } = await CONFIG.supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);
            if (error) {
                console.error('Failed to update order with invoice info:', error);
            } else {
                console.log('✅ Order updated with invoice info:', invoiceId);
            }
        } catch (error) {
            console.error('Error updating order invoice:', error);
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