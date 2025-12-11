// Payment Processing Manager
import { CONFIG, UTILS } from './config.js';

class PaymentManager {
    constructor() {
        this.isInitialized = false;
        this.paymentMethods = CONFIG.paymentMethods;
        this.listeners = [];
        
        this.init();
    }
    
    async init() {
        try {
            this.isInitialized = true;
            console.log('✅ Payment Manager initialized');
        } catch (error) {
            console.error('Payment Manager initialization error:', error);
        }
    }
    
    // Process payment based on method
    async processPayment(order, paymentData = {}) {
        try {
            switch (order.payment_method) {
                case 'paynet':
                    return await this.processPaynetPayment(order, paymentData);
                case 'cash':
                    return await this.processCashPayment(order);
                case 'transfer':
                    return await this.processBankTransferPayment(order);
                default:
                    throw new Error('Metodă de plată necunoscută');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Paynet payment processing (card/bank transfer via Paynet gateway)
    async processPaynetPayment(order, paymentData) {
        try {
            // In a real implementation, you would:
            // 1. Create payment session with Paynet
            // 2. Redirect user to Paynet payment page
            // 3. Handle callback/webhook from Paynet
            // 4. Update order status based on payment result
            
            // For demo purposes, simulate payment processing
            console.log('Processing Paynet payment for order:', order.order_number);
            
            // Simulate payment gateway integration
            const paymentSession = {
                id: UTILS.generateId('payment'),
                order_id: order.id,
                amount: order.total,
                currency: order.currency,
                payment_method: 'paynet',
                status: 'pending',
                gateway_url: this.generatePaynetUrl(order),
                created_at: new Date().toISOString()
            };
            
            // Save payment session to database
            const { data: savedPayment, error } = await CONFIG.supabase
                .from('payments')
                .insert({
                    id: paymentSession.id,
                    order_id: order.id,
                    amount: order.total,
                    currency: order.currency,
                    payment_method: 'paynet',
                    status: 'pending',
                    gateway_response: {
                        session_id: paymentSession.id,
                        redirect_url: paymentSession.gateway_url
                    },
                    created_at: paymentSession.created_at
                })
                .select()
                .single();
                
            if (error) throw error;
            
            // Update order status to processing
            await this.updateOrderPaymentStatus(order.id, 'processing');
            
            return {
                success: true,
                payment: savedPayment,
                redirectUrl: paymentSession.gateway_url,
                message: 'Redirecționare către gateway-ul de plată...'
            };
            
        } catch (error) {
            console.error('Paynet payment error:', error);
            return {
                success: false,
                error: 'Eroare la inițierea plății cu cardul'
            };
        }
    }
    
    // Generate Paynet payment URL (demo)
    generatePaynetUrl(order) {
        // In a real implementation, this would be the actual Paynet gateway URL
        // with proper authentication and parameters
        
        const params = new URLSearchParams({
            merchant_id: 'your_merchant_id',
            order_number: order.order_number,
            amount: order.total,
            currency: order.currency,
            return_url: `${window.location.origin}/payment-return.html`,
            cancel_url: `${window.location.origin}/checkout.html`,
            callback_url: `${window.location.origin}/api/payment-webhook`
        });
        
        // For demo, redirect to a demo payment page
        return `/payment-demo.html?${params.toString()}`;
    }
    
    // Cash on delivery payment
    async processCashPayment(order) {
        try {
            console.log('Processing cash payment for order:', order.order_number);
            
            // Create payment record
            const { data: payment, error } = await CONFIG.supabase
                .from('payments')
                .insert({
                    id: UTILS.generateId('payment'),
                    order_id: order.id,
                    amount: order.total,
                    currency: order.currency,
                    payment_method: 'cash',
                    status: 'pending_delivery',
                    notes: 'Plată la livrare - cash',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
                
            if (error) throw error;
            
            // Update order status to confirmed (waiting for delivery)
            await this.updateOrderPaymentStatus(order.id, 'confirmed');
            
            return {
                success: true,
                payment,
                message: 'Comandă confirmată - plata se va face la livrare'
            };
            
        } catch (error) {
            console.error('Cash payment error:', error);
            return {
                success: false,
                error: 'Eroare la confirmarea plății cash'
            };
        }
    }
    
    // Bank transfer payment
    async processBankTransferPayment(order) {
        try {
            console.log('Processing bank transfer for order:', order.order_number);
            
            // Create payment record with transfer details
            const { data: payment, error } = await CONFIG.supabase
                .from('payments')
                .insert({
                    id: UTILS.generateId('payment'),
                    order_id: order.id,
                    amount: order.total,
                    currency: order.currency,
                    payment_method: 'transfer',
                    status: 'awaiting_transfer',
                    transfer_details: {
                        bank_name: 'Banca Transilvania',
                        account_holder: 'AutoParts SRL',
                        iban: 'RO49AAAA1B31007593840000',
                        swift: 'BTRLRO22',
                        reference: order.order_number
                    },
                    notes: 'Transfer bancar - se așteaptă confirmarea plății',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
                
            if (error) throw error;
            
            // Update order status to confirmed (waiting for payment)
            await this.updateOrderPaymentStatus(order.id, 'confirmed');
            
            return {
                success: true,
                payment,
                message: 'Comandă confirmată - se așteaptă transferul bancar'
            };
            
        } catch (error) {
            console.error('Bank transfer payment error:', error);
            return {
                success: false,
                error: 'Eroare la confirmarea transferului bancar'
            };
        }
    }
    
    // Update order payment status
    async updateOrderPaymentStatus(orderId, status) {
        try {
            const { error } = await CONFIG.supabase
                .from('orders')
                .update({
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);
                
            if (error) throw error;
            
            this.notifyListeners('order_payment_status_updated', { orderId, status });
            
        } catch (error) {
            console.error('Error updating order payment status:', error);
        }
    }
    
    // Handle payment webhook/callback (for Paynet)
    async handlePaymentCallback(callbackData) {
        try {
            const { order_number, status, transaction_id, amount } = callbackData;
            
            // Find the payment record
            const { data: payment, error: paymentError } = await CONFIG.supabase
                .from('payments')
                .select('*, orders(*)')
                .eq('orders.order_number', order_number)
                .single();
                
            if (paymentError || !payment) {
                throw new Error('Payment record not found');
            }
            
            // Update payment status
            const paymentStatus = this.mapGatewayStatus(status);
            const { error: updateError } = await CONFIG.supabase
                .from('payments')
                .update({
                    status: paymentStatus,
                    gateway_response: {
                        ...payment.gateway_response,
                        transaction_id,
                        callback_data: callbackData
                    },
                    completed_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', payment.id);
                
            if (updateError) throw updateError;
            
            // Update order status based on payment result
            if (paymentStatus === 'completed') {
                await this.updateOrderPaymentStatus(payment.order_id, 'confirmed');
                
                // Send confirmation email
                this.sendPaymentConfirmationEmail(payment.order_id);
                
                this.notifyListeners('payment_completed', { 
                    orderId: payment.order_id,
                    paymentId: payment.id 
                });
                
            } else if (paymentStatus === 'failed') {
                await this.updateOrderPaymentStatus(payment.order_id, 'payment_failed');
                
                this.notifyListeners('payment_failed', { 
                    orderId: payment.order_id,
                    paymentId: payment.id 
                });
            }
            
            return {
                success: true,
                payment,
                status: paymentStatus
            };
            
        } catch (error) {
            console.error('Payment callback handling error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Map gateway status to internal status
    mapGatewayStatus(gatewayStatus) {
        const statusMap = {
            'success': 'completed',
            'completed': 'completed',
            'paid': 'completed',
            'failed': 'failed',
            'error': 'failed',
            'cancelled': 'cancelled',
            'pending': 'pending'
        };
        
        return statusMap[gatewayStatus.toLowerCase()] || 'pending';
    }
    
    // Get payment status
    async getPaymentStatus(orderId) {
        try {
            const { data: payment, error } = await CONFIG.supabase
                .from('payments')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
                
            if (error) throw error;
            
            return {
                success: true,
                payment
            };
            
        } catch (error) {
            console.error('Error getting payment status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Refund payment
    async refundPayment(paymentId, amount = null, reason = null) {
        try {
            const { data: payment, error: paymentError } = await CONFIG.supabase
                .from('payments')
                .select('*')
                .eq('id', paymentId)
                .single();
                
            if (paymentError || !payment) {
                throw new Error('Payment not found');
            }
            
            if (payment.status !== 'completed') {
                throw new Error('Only completed payments can be refunded');
            }
            
            const refundAmount = amount || payment.amount;
            
            // Create refund record
            const { data: refund, error: refundError } = await CONFIG.supabase
                .from('payment_refunds')
                .insert({
                    id: UTILS.generateId('refund'),
                    payment_id: paymentId,
                    order_id: payment.order_id,
                    amount: refundAmount,
                    reason: reason || 'Customer refund request',
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
                
            if (refundError) throw refundError;
            
            // In a real implementation, you would process the refund with the payment gateway
            // For now, mark as completed
            await CONFIG.supabase
                .from('payment_refunds')
                .update({
                    status: 'completed',
                    processed_at: new Date().toISOString()
                })
                .eq('id', refund.id);
            
            // Update payment status
            await CONFIG.supabase
                .from('payments')
                .update({
                    status: refundAmount >= payment.amount ? 'refunded' : 'partially_refunded',
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentId);
            
            this.notifyListeners('payment_refunded', { 
                paymentId, 
                refundId: refund.id, 
                amount: refundAmount 
            });
            
            return {
                success: true,
                refund,
                message: 'Rambursarea a fost procesată cu succes'
            };
            
        } catch (error) {
            console.error('Refund error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Send payment confirmation email
    async sendPaymentConfirmationEmail(orderId) {
        try {
            // In a real implementation, you would send an email
            console.log(`Payment confirmation email should be sent for order: ${orderId}`);
            
            return { success: true };
            
        } catch (error) {
            console.error('Error sending payment confirmation email:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Format payment for display
    formatPaymentForDisplay(payment) {
        return {
            ...payment,
            formattedAmount: UTILS.formatPrice(payment.amount),
            formattedDate: UTILS.formatDate(payment.created_at),
            formattedDateTime: UTILS.formatDateTime(payment.created_at),
            methodLabel: this.getPaymentMethodLabel(payment.payment_method),
            statusLabel: this.getPaymentStatusLabel(payment.status)
        };
    }
    
    // Get payment method label
    getPaymentMethodLabel(method) {
        const methodMap = {
            'paynet': 'Card bancar (Paynet)',
            'cash': 'Ramburs',
            'transfer': 'Transfer bancar'
        };
        
        return methodMap[method] || method;
    }
    
    // Get payment status label
    getPaymentStatusLabel(status) {
        const statusMap = {
            'pending': 'În așteptare',
            'pending_delivery': 'În așteptarea livrării',
            'awaiting_transfer': 'În așteptarea transferului',
            'processing': 'Se procesează',
            'completed': 'Finalizată',
            'failed': 'Eșuată',
            'cancelled': 'Anulată',
            'refunded': 'Rambursată',
            'partially_refunded': 'Rambursată parțial'
        };
        
        return statusMap[status] || status;
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
                console.error('Payment listener error:', error);
            }
        });
    }
    
    // Public getters
    getPaymentMethods() {
        return this.paymentMethods.filter(method => method.enabled);
    }
    
    isReady() {
        return this.isInitialized;
    }
}

// Create global instance
const paymentManager = new PaymentManager();

// Make it globally available
window.paymentManager = paymentManager;

export { paymentManager };