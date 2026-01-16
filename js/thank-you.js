// Thank You Page Functionality
import { CONFIG, UTILS } from './config.js';

class ThankYouManager {
    constructor() {
        this.orderNumber = null;
        this.order = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Get order number from URL
            this.orderNumber = this.getOrderNumberFromUrl();
            
            if (!this.orderNumber) {
                this.redirectToHome();
                return;
            }
            
            // Load order details
            await this.loadOrderDetails();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Thank You page initialized');
            
        } catch (error) {
            console.error('Thank You page initialization error:', error);
            this.showError('Eroare la încărcarea detaliilor comenzii');
        }
    }
    
    getOrderNumberFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('order');
    }
    
    redirectToHome() {
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }
    
    async loadOrderDetails() {
        try {
            // First try to get order from session storage (just completed)
            const completedOrder = sessionStorage.getItem('completed_order');
            
            if (completedOrder) {
                this.order = JSON.parse(completedOrder);
                sessionStorage.removeItem('completed_order');
                this.renderOrderDetails();
                return;
            }
            
            // If not in session, fetch from database
            await this.fetchOrderFromDatabase();
            
        } catch (error) {
            console.error('Error loading order details:', error);
            throw error;
        }
    }
    
    async fetchOrderFromDatabase() {
        try {
            if (!window.orderManager) {
                throw new Error('Order manager not available');
            }
            
            // Check if user is authenticated (required)
            if (!window.authManager || !window.authManager.isAuthenticated()) {
                throw new Error('Trebuie să vă autentificați pentru a vedea detaliile comenzii');
            }
            
            // Get order by number for authenticated user
            const userId = window.authManager.getUserId();
            const { data: order, error } = await CONFIG.supabase
                .from('orders')
                .select(`
                    *,
                    order_items(*)
                `)
                .eq('user_id', userId)
                .eq('order_number', this.orderNumber)
                .single();
            
            if (error || !order) {
                throw new Error('Comanda nu a fost găsită');
            }
            
            this.order = order;
            this.renderOrderDetails();
            
        } catch (error) {
            console.error('Database fetch error:', error);
            throw new Error('Nu am putut încărca detaliile comenzii');
        }
    }
    
    renderOrderDetails() {
        if (!this.order) return;
        
        this.renderOrderInfo();
        this.renderOrderItems();
        this.renderPaymentInfo();
        this.renderOrderSummary();
    }
    
    renderOrderInfo() {
        const container = document.getElementById('order-details');
        if (!container) return;
        
        const orderDate = new Date(this.order.created_at);
        
        // Use the actual order data structure from order-manager.js
        const customerName = this.order.customer_name || 'N/A';
        const customerEmail = this.order.customer_email || 'N/A';
        const customerPhone = this.order.customer_phone || 'N/A';
        const customerAddress = this.order.customer_address || 'N/A';
        const orderNumber = this.order.id || this.order.order_number || 'N/A';
        
        container.innerHTML = `
            <div class="space-y-3">
                <div>
                    <label class="text-sm font-medium text-gray-500">Numărul comenzii</label>
                    <p class="text-lg font-semibold text-gray-900">#${orderNumber}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-500">Data comenzii</label>
                    <p class="text-gray-900">${UTILS.formatDateTime(orderDate)}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-500">Status</label>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ${this.getOrderStatusLabel(this.order.status)}
                    </span>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-500">Client</label>
                    <p class="text-gray-900">${customerName}</p>
                    <p class="text-sm text-gray-600">${customerEmail}</p>
                    <p class="text-sm text-gray-600">${customerPhone}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-500">Adresa de livrare</label>
                    <div class="text-sm text-gray-900">
                        <p>${customerAddress}</p>
                    </div>
                </div>
                ${this.order.notes ? `
                <div>
                    <label class="text-sm font-medium text-gray-500">Observații</label>
                    <p class="text-sm text-gray-900">${this.order.notes}</p>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    renderOrderItems() {
        const container = document.getElementById('order-items');
        if (!container) return;
        
        const items = this.order.order_items || this.order.items || [];
        
        if (items.length === 0) {
            container.innerHTML = '<p class="text-gray-500">Nu există produse în această comandă.</p>';
            return;
        }
        
        container.innerHTML = items.map(item => {
            // Use the actual order data structure from order-manager.js
            const productName = item.product_name || item.name || 'Produs';
            const productImage = item.product_image || item.image || '/images/placeholder.jpg';
            const productSku = item.product_sku || item.sku || 'N/A';
            const quantity = item.quantity || 1;
            const unitPrice = item.unit_price || item.price || 0;
            const totalPrice = item.total_price || item.total || (unitPrice * quantity);
            
            return `
                <div class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <img src="${productImage}" 
                         alt="${productName}" 
                         class="w-16 h-16 object-cover rounded-md"
                         onerror="this.src='/images/placeholder.jpg'">
                    <div class="flex-1">
                        <h4 class="text-sm font-medium text-gray-900">${productName}</h4>
                        <p class="text-xs text-gray-500">SKU: ${productSku}</p>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-sm text-gray-600">Cantitate: ${quantity}</span>
                            <div class="text-right">
                                <p class="text-sm font-medium text-gray-900">${UTILS.formatPrice(totalPrice)}</p>
                                ${quantity > 1 ? `<p class="text-xs text-gray-500">${UTILS.formatPrice(unitPrice)}/buc</p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderPaymentInfo() {
        const container = document.getElementById('payment-details');
        if (!container) return;
        
        const paymentMethod = this.getPaymentMethodLabel(this.order.payment_method);
        const shippingMethod = this.getShippingMethodLabel(this.order.shipping_method);
        
        let paymentInstructions = '';
        
        switch (this.order.payment_method) {
            case 'cash':
                paymentInstructions = `
                    <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            Plata se va face la livrare, în numerar.
                        </p>
                    </div>
                `;
                break;
                
            case 'transfer':
                paymentInstructions = `
                    <div class="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <h4 class="text-sm font-medium text-blue-900 mb-2">Detalii transfer bancar:</h4>
                        <div class="text-sm text-blue-800 space-y-1">
                            <p><strong>Beneficiar:</strong> AutoParts SRL</p>
                            <p><strong>IBAN:</strong> RO49AAAA1B31007593840000</p>
                            <p><strong>Banca:</strong> Banca Transilvania</p>
                            <p><strong>SWIFT:</strong> BTRLRO22</p>
                            <p><strong>Referință:</strong> ${this.order.order_number}</p>
                        </div>
                        <p class="text-xs text-blue-700 mt-2">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            Vă rugăm să menționați numărul comenzii la transferul bancar.
                        </p>
                    </div>
                `;
                break;
                
            case 'paynet':
                paymentInstructions = `
                    <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p class="text-sm text-green-800">
                            <i class="fas fa-credit-card mr-2"></i>
                            Plata cu cardul a fost procesată cu succes.
                        </p>
                    </div>
                `;
                break;
        }
        
        container.innerHTML = `
            <div class="space-y-3">
                <div>
                    <label class="text-sm font-medium text-gray-500">Metodă de plată</label>
                    <p class="text-gray-900">${paymentMethod}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-500">Metodă de livrare</label>
                    <p class="text-gray-900">${shippingMethod}</p>
                </div>
                ${paymentInstructions}
            </div>
        `;
    }
    
    renderOrderSummary() {
        // Update subtotal
        document.getElementById('summary-subtotal').textContent = UTILS.formatPrice(this.order.subtotal);
        
        // Update discount
        if (this.order.discount_amount > 0) {
            document.getElementById('summary-discount').classList.remove('hidden');
            document.getElementById('summary-discount-amount').textContent = `-${UTILS.formatPrice(this.order.discount_amount)}`;
        }
        
        // Update shipping
        document.getElementById('summary-shipping').textContent = UTILS.formatPrice(this.order.shipping_cost);
        
        // Update total
        document.getElementById('summary-total').textContent = UTILS.formatPrice(this.order.total);
    }
    
    setupEventListeners() {
        // Track order button
        const trackOrderBtn = document.getElementById('track-order-btn');
        if (trackOrderBtn) {
            trackOrderBtn.addEventListener('click', () => {
                this.showTrackingModal();
            });
        }
        
        // Close tracking modal
        const closeModalBtn = document.getElementById('close-tracking-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideTrackingModal();
            });
        }
        
        // Close modal on background click
        const modal = document.getElementById('tracking-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideTrackingModal();
                }
            });
        }
    }
    
    showTrackingModal() {
        const modal = document.getElementById('tracking-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideTrackingModal() {
        const modal = document.getElementById('tracking-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    getOrderStatusLabel(status) {
        const statusMap = {
            'pending': 'În așteptare',
            'confirmed': 'Confirmată',
            'processing': 'În procesare',
            'shipped': 'Expediată',
            'delivered': 'Livrată',
            'cancelled': 'Anulată'
        };
        
        return statusMap[status] || status;
    }
    
    getPaymentMethodLabel(method) {
        const methodMap = {
            'paynet': 'Card bancar (Paynet)',
            'cash': 'Ramburs (Cash on Delivery)',
            'transfer': 'Transfer bancar'
        };
        
        return methodMap[method] || method;
    }
    
    getShippingMethodLabel(method) {
        const methodMap = {
            'standard': 'Livrare standard (2-3 zile)',
            'express': 'Livrare express (1-2 zile)'
        };
        
        return methodMap[method] || method;
    }
    
    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md z-50 max-w-md';
        notification.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-exclamation-circle mt-0.5 mr-2 flex-shrink-0"></i>
                <div class="flex-1">${message}</div>
                <button type="button" class="ml-3 flex-shrink-0 text-red-500 hover:text-red-700" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
    }
}

// Initialize thank you manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ThankYouManager();
});