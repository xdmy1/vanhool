// Cart Page Functionality
import { CONFIG, UTILS } from './config.js';

class CartPageManager {
    constructor() {
        this.cart = null;
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for cart manager to be ready
            await this.waitForDependencies();
            
            // Load cart
            this.loadCart();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Cart page initialized');
            
        } catch (error) {
            console.error('Cart page initialization error:', error);
            this.showError('Eroare la încărcarea coșului');
        }
    }
    
    async waitForDependencies() {
        const maxWait = 5000; // 5 seconds
        const interval = 100;
        let waited = 0;
        
        while (waited < maxWait) {
            if (window.cartManager) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
            waited += interval;
        }
        
        throw new Error('Cart manager not loaded');
    }
    
    loadCart() {
        console.log('🛒 Loading cart...');
        
        if (!window.cartManager) {
            console.warn('⚠️ Cart manager not available');
            this.showEmptyCart();
            return;
        }
        
        // Get raw cart from storage for debugging
        const rawCart = window.cartManager.cart;
        console.log('🔍 Raw cart from cartManager:', rawCart);
        
        this.cart = window.cartManager.getCart();
        console.log('📊 Cart data (from getCart()):', this.cart);
        
        // Check localStorage directly for comparison
        const storedCart = localStorage.getItem('autoparts_cart');
        console.log('💾 Raw localStorage cart:', storedCart);
        
        if (!this.cart || this.cart.items.length === 0) {
            console.log('📭 Cart is empty');
            this.showEmptyCart();
            return;
        }
        
        console.log(`🛍️ Found ${this.cart.items.length} items in cart:`, this.cart.items);
        console.log('🔢 Item count calculation:', this.cart.items.reduce((sum, item) => sum + item.quantity, 0));
        
        // Validate each item structure
        this.cart.items.forEach((item, index) => {
            console.log(`Item ${index}:`, {
                productId: item.productId,
                name: item.name,
                sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                valid: !!(item.productId && item.name && item.quantity > 0)
            });
        });
        
        this.renderCartItems();
        this.updateOrderSummary();
        this.updateCheckoutButton();
        
        console.log('✅ Cart loaded successfully');
    }
    
    showEmptyCart() {
        document.getElementById('cart-items-container').style.display = 'none';
        document.getElementById('empty-cart').classList.remove('hidden');
        
        // Hide checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Coș gol';
        }
    }
    
    renderCartItems() {
        console.log('🎨 Rendering cart items...');
        
        const container = document.getElementById('cart-items-container');
        if (!container) {
            console.error('❌ Cart items container not found');
            return;
        }
        
        // Update item count
        const itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        console.log(`📝 Total items in cart: ${itemCount}`);
        
        const itemCountElement = document.getElementById('cart-item-count');
        if (itemCountElement) {
            itemCountElement.textContent = itemCount;
        } else {
            console.warn('⚠️ cart-item-count element not found');
        }
        
        // Render items
        console.log('🔍 Individual cart items before rendering:');
        this.cart.items.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, {
                id: item.productId,
                name: item.name,
                sku: item.sku,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                totalPrice: item.totalPrice
            });
        });
        
        console.log(`🔄 About to render ${this.cart.items.length} items to DOM...`);
        
        const renderedHTML = this.cart.items.map((item, index) => {
            console.log(`🏗️ Rendering item ${index + 1}: ${item.name}`);
            console.log(`🖼️ Image URL for ${item.name}:`, item.image);
            
            // Multiple fallbacks for image
            const imageSrc = item.image || item.imageUrl || '/images/placeholder.svg';
            const imageElement = `
                <img src="${imageSrc}" alt="${item.name}" 
                     class="w-20 h-20 object-cover rounded-lg"
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cmVjdCB4PSI0MCIgeT0iNjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIHJ4PSI4IiBmaWxsPSIjRTVFN0VCIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI4NSIgcj0iOCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik01MCA1MkM3MCA2MEw5MCA4MEwxMjAgNDBMMTUwIDgwVjEyMEg1MFY4MFoiIGZpbGw9IiM5Q0EzQUYiLz48dGV4dCB4PSIxMDAiIHk9IjE2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';">
            `;
            
            return `
            <div class="cart-item flex items-center space-x-4 py-6 border-b border-gray-200 last:border-b-0" data-product-id="${item.productId}">
                <div class="flex-shrink-0">
                    ${imageElement}
                </div>
                
                <div class="flex-1">
                    <h3 class="text-lg font-medium text-gray-900 mb-1">${item.name}</h3>
                    <p class="text-sm text-gray-500 mb-1">SKU: ${item.sku}</p>
                    ${item.brand ? `<p class="text-sm text-gray-500 mb-2">Brand: ${item.brand}</p>` : ''}
                    
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <label class="text-sm font-medium text-gray-700">Cantitate:</label>
                            <div class="flex items-center border border-gray-300 rounded-md">
                                <button type="button" class="quantity-btn decrease-btn p-2 hover:bg-gray-50" 
                                        data-action="decrease" data-product-id="${item.productId}">
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                <input type="number" min="1" max="99" value="${item.quantity}" 
                                       class="quantity-input w-16 text-center border-0 focus:ring-0" 
                                       data-product-id="${item.productId}">
                                <button type="button" class="quantity-btn increase-btn p-2 hover:bg-gray-50" 
                                        data-action="increase" data-product-id="${item.productId}">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="text-right">
                            <p class="text-lg font-semibold text-gray-900">${UTILS.formatPrice(item.totalPrice)}</p>
                            ${item.quantity > 1 ? `<p class="text-sm text-gray-500">${UTILS.formatPrice(item.price)} / buc</p>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="flex-shrink-0">
                    <button type="button" class="remove-btn text-red-600 hover:text-red-800 p-2" 
                            data-product-id="${item.productId}" title="Șterge din coș">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        });
        
        container.innerHTML = renderedHTML.join('');
        
        console.log(`✅ Rendered HTML length: ${renderedHTML.length} items`);
        console.log('🔍 Final container HTML:', container.innerHTML.length > 0 ? 'Content present' : 'No content');
        
        // Verify DOM elements were created
        const renderedElements = container.querySelectorAll('.cart-item');
        console.log(`📊 DOM elements created: ${renderedElements.length} cart-item divs`);
        
        if (renderedElements.length !== this.cart.items.length) {
            console.error(`❌ MISMATCH: Expected ${this.cart.items.length} items, but rendered ${renderedElements.length} DOM elements!`);
            console.log('🔍 Checking for rendering issues...');
            
            // Check each item for rendering problems
            this.cart.items.forEach((item, index) => {
                if (!item.productId || !item.name) {
                    console.error(`❌ Item ${index} has missing required fields:`, item);
                }
                if (item.quantity <= 0) {
                    console.error(`❌ Item ${index} has invalid quantity:`, item.quantity);
                }
            });
        }
    }
    
    updateOrderSummary() {
        // Update subtotal
        document.getElementById('subtotal-amount').textContent = UTILS.formatPrice(this.cart.subtotal);
        
        // Update discount
        const discountRow = document.getElementById('discount-row');
        const discountAmount = document.getElementById('discount-amount');
        
        if (this.cart.discountAmount > 0) {
            discountRow.classList.remove('hidden');
            discountAmount.textContent = `-${UTILS.formatPrice(this.cart.discountAmount)}`;
        } else {
            discountRow.classList.add('hidden');
        }
        
        // Update shipping
        document.getElementById('shipping-amount').textContent = UTILS.formatPrice(this.cart.shipping);
        
        // Update total
        document.getElementById('total-amount').textContent = UTILS.formatPrice(this.cart.total);
        
        // Update promo code display
        this.updatePromoCodeDisplay();
    }
    
    updatePromoCodeDisplay() {
        const toggleBtn = document.getElementById('toggle-promo-code');
        const promoForm = document.getElementById('promo-code-form');
        const appliedPromo = document.getElementById('applied-promo-code');
        const promoCodeName = document.getElementById('promo-code-name');
        
        if (this.cart.promocode) {
            // Show applied promo code
            toggleBtn.classList.add('hidden');
            promoForm.classList.add('hidden');
            appliedPromo.classList.remove('hidden');
            promoCodeName.textContent = `${this.cart.promocode.code} (-${UTILS.formatPrice(this.cart.discountAmount)})`;
        } else {
            // Show promo code toggle
            toggleBtn.classList.remove('hidden');
            appliedPromo.classList.add('hidden');
        }
    }
    
    updateCheckoutButton() {
        const checkoutBtn = document.getElementById('checkout-btn');
        const authNotice = document.getElementById('auth-notice');
        
        // Wait for auth systems to be ready, then check authentication
        this.checkAuthenticationStatus().then(isAuthenticated => {
            if (!isAuthenticated) {
                // User not authenticated
                checkoutBtn.disabled = true;
                checkoutBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>Autentificare necesară';
                authNotice.classList.remove('hidden');
            } else {
                // User authenticated
                checkoutBtn.disabled = false;
                checkoutBtn.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i>Continuă către finalizare';
                authNotice.classList.add('hidden');
            }
        });
    }
    
    async checkAuthenticationStatus() {
        // Wait for auth systems to be available
        const maxWait = 3000; // 3 seconds
        const interval = 100;
        let waited = 0;
        
        while (waited < maxWait) {
            // Check multiple sources for authentication status
            if (window.authManager?.isAuthenticated()) {
                return true;
            }
            
            if (window.VanHoolApp?.currentUser) {
                return true;
            }
            
            // Check Supabase session directly
            if (window.supabase) {
                try {
                    const { data: { session } } = await window.supabase.auth.getSession();
                    if (session?.user) {
                        return true;
                    }
                } catch (error) {
                    console.error('Error checking Supabase session:', error);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
            waited += interval;
        }
        
        return false;
    }
    
    setupEventListeners() {
        // Quantity change buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quantity-btn')) {
                const btn = e.target.closest('.quantity-btn');
                const action = btn.dataset.action;
                const productId = btn.dataset.productId;
                
                if (action === 'increase') {
                    this.increaseQuantity(productId);
                } else if (action === 'decrease') {
                    this.decreaseQuantity(productId);
                }
            }
        });
        
        // Quantity input changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const productId = e.target.dataset.productId;
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity > 0) {
                    this.updateQuantity(productId, newQuantity);
                } else {
                    e.target.value = 1;
                    this.updateQuantity(productId, 1);
                }
            }
        });
        
        // Remove item buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) {
                const btn = e.target.closest('.remove-btn');
                const productId = btn.dataset.productId;
                this.removeItem(productId);
            }
        });
        
        // Promo code functionality
        const togglePromoBtn = document.getElementById('toggle-promo-code');
        if (togglePromoBtn) {
            togglePromoBtn.addEventListener('click', () => {
                document.getElementById('promo-code-form').classList.toggle('hidden');
            });
        }
        
        const applyPromoBtn = document.getElementById('apply-promo-code');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => {
                this.applyPromoCode();
            });
        }
        
        const removePromoBtn = document.getElementById('remove-promo-code');
        if (removePromoBtn) {
            removePromoBtn.addEventListener('click', () => {
                this.removePromoCode();
            });
        }
        
        // Promo code input enter key
        const promoInput = document.getElementById('promo-code-input');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyPromoCode();
                }
            });
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }
        
        // Listen for cart changes
        if (window.cartManager) {
            window.cartManager.addListener((event, data) => {
                if (['item_added', 'item_removed', 'item_updated', 'promocode_applied', 'promocode_removed', 'cart_synced'].includes(event)) {
                    this.loadCart();
                }
            });
        }
        
        // Listen for auth changes from multiple sources
        if (window.authManager) {
            window.authManager.addListener(() => {
                this.updateCheckoutButton();
            });
        }
        
        // Listen for VanHoolApp auth state changes
        window.addEventListener('authStateChange', () => {
            this.updateCheckoutButton();
        });
        
        // Periodically check auth status in case user logs in from another tab
        setInterval(() => {
            this.updateCheckoutButton();
        }, 2000); // Check every 2 seconds
    }
    
    async increaseQuantity(productId) {
        const item = this.cart.items.find(i => i.productId === productId);
        if (item) {
            await this.updateQuantity(productId, item.quantity + 1);
        }
    }
    
    async decreaseQuantity(productId) {
        const item = this.cart.items.find(i => i.productId === productId);
        if (item && item.quantity > 1) {
            await this.updateQuantity(productId, item.quantity - 1);
        }
    }
    
    async updateQuantity(productId, newQuantity) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            const result = await window.cartManager.updateItemQuantity(productId, newQuantity);
            
            if (!result.success) {
                this.showError(result.error);
                // Revert the input value
                const input = document.querySelector(`input[data-product-id="${productId}"]`);
                if (input) {
                    const currentItem = this.cart.items.find(i => i.productId === productId);
                    input.value = currentItem ? currentItem.quantity : 1;
                }
            }
            
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showError('Eroare la actualizarea cantității');
        } finally {
            this.isLoading = false;
        }
    }
    
    async removeItem(productId) {
        if (this.isLoading) return;
        
        if (!confirm('Sunteți sigur că doriți să ștergeți acest produs din coș?')) {
            return;
        }
        
        this.isLoading = true;
        
        try {
            const result = await window.cartManager.removeItem(productId);
            
            if (!result.success) {
                this.showError(result.error);
            }
            
        } catch (error) {
            console.error('Error removing item:', error);
            this.showError('Eroare la ștergerea produsului');
        } finally {
            this.isLoading = false;
        }
    }
    
    async applyPromoCode() {
        const input = document.getElementById('promo-code-input');
        const code = input.value.trim();
        
        if (!code) {
            this.showError('Introduceți codul promoțional');
            return;
        }
        
        const applyBtn = document.getElementById('apply-promo-code');
        const originalText = applyBtn.textContent;
        applyBtn.textContent = 'Se aplică...';
        applyBtn.disabled = true;
        
        try {
            const result = await window.cartManager.applyPromocode(code);
            
            if (result.success) {
                input.value = '';
                this.showSuccess(result.message);
            } else {
                this.showError(result.error);
            }
            
        } catch (error) {
            console.error('Promo code application error:', error);
            this.showError('Eroare la aplicarea codului promoțional');
        } finally {
            applyBtn.textContent = originalText;
            applyBtn.disabled = false;
        }
    }
    
    async removePromoCode() {
        try {
            window.cartManager.removePromocode();
            this.showSuccess('Codul promoțional a fost eliminat');
        } catch (error) {
            console.error('Promo code removal error:', error);
            this.showError('Eroare la eliminarea codului promoțional');
        }
    }
    
    async proceedToCheckout() {
        // Check authentication status properly
        const isAuthenticated = await this.checkAuthenticationStatus();
        
        if (!isAuthenticated) {
            // Redirect to login with return URL
            localStorage.setItem('redirect_after_login', 'checkout.html');
            window.location.href = `login.html?redirect=${encodeURIComponent('checkout.html')}`;
        } else {
            // Go to checkout
            window.location.href = 'checkout.html';
        }
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.cart-notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `cart-notification fixed top-4 right-4 p-4 rounded-md shadow-md z-50 max-w-md ${
            type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
            type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
            'bg-blue-100 border border-blue-400 text-blue-700'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-start">
                <i class="fas ${
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'success' ? 'fa-check-circle' :
                    'fa-info-circle'
                } mt-0.5 mr-2 flex-shrink-0"></i>
                <div class="flex-1">${message}</div>
                <button type="button" class="ml-3 flex-shrink-0 hover:opacity-75" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize cart page manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CartPageManager();
});