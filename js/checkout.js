// Checkout Page Functionality
import { CONFIG, UTILS } from './config.js';

class CheckoutManager {
    constructor() {
        console.log('🚀 CheckoutManager constructor called');
        this.form = null;
        this.isProcessing = false;
        this.cart = null;
        this.shippingCost = CONFIG.shippingCost;
        
        console.log('⏳ Starting checkout initialization...');
        this.init();
    }
    
    async init() {
        try {
            // Wait for cart manager to be ready
            await this.waitForDependencies();
            
            // Check if user is authenticated (required for checkout) with robust auth check
            const isAuthenticated = await this.checkAuthenticationStatus();
            if (!isAuthenticated) {
                console.log('❌ User not authenticated, redirecting to login');
                this.redirectToLogin();
                return;
            }
            
            console.log('✅ User authenticated, proceeding with checkout');
            
            // Check if cart is empty
            if (!window.cartManager || window.cartManager.isEmpty()) {
                this.redirectToCart();
                return;
            }
            
            // Get cart data
            this.cart = window.cartManager.getCart();
            
            // Initialize form
            this.initializeForm();
            
            // Load cart items
            this.loadCartItems();
            
            // Update totals
            this.updateOrderTotals();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Pre-fill user data if logged in
            this.prefillUserData();
            
            console.log('✅ Checkout initialized');
            
        } catch (error) {
            console.error('Checkout initialization error:', error);
            this.showError('Eroare la încărcarea paginii de checkout');
        }
    }
    
    async waitForDependencies() {
        console.log('⏳ Waiting for dependencies (cartManager, orderManager, auth systems)...');
        
        const maxWait = 5000; // 5 seconds
        const interval = 100;
        let waited = 0;
        
        while (waited < maxWait) {
            const cartAvailable = !!window.cartManager;
            const orderAvailable = !!window.orderManager;
            const authAvailable = !!window.authManager;
            const supabaseAvailable = !!window.supabase;
            
            console.log(`📊 Dependencies status: cart=${cartAvailable}, order=${orderAvailable}, auth=${authAvailable}, supabase=${supabaseAvailable}, waited=${waited}ms`);
            
            if (window.cartManager && window.orderManager) {
                console.log('✅ All required dependencies are ready');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
            waited += interval;
        }
        
        throw new Error('Required dependencies not loaded');
    }
    
    redirectToCart() {
        window.location.href = '/cart.html';
    }
    
    async checkAuthenticationStatus() {
        console.log('🔍 Checking authentication status for checkout...');
        
        // Wait for auth systems to be available
        const maxWait = 3000; // 3 seconds
        const interval = 100;
        let waited = 0;
        
        while (waited < maxWait) {
            // Check multiple sources for authentication status
            if (window.authManager?.isAuthenticated()) {
                console.log('✅ Authenticated via authManager');
                return true;
            }
            
            if (window.VanHoolApp?.currentUser) {
                console.log('✅ Authenticated via VanHoolApp');
                return true;
            }
            
            // Check Supabase session directly
            if (window.supabase) {
                try {
                    const { data: { session } } = await window.supabase.auth.getSession();
                    if (session?.user) {
                        console.log('✅ Authenticated via Supabase session');
                        return true;
                    }
                } catch (error) {
                    console.error('Error checking Supabase session:', error);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
            waited += interval;
        }
        
        console.log('❌ No authentication found after waiting');
        return false;
    }

    redirectToLogin() {
        console.log('🔄 Redirecting to login...');
        // Store current page in localStorage to redirect back after login
        localStorage.setItem('redirect_after_login', 'checkout.html');
        window.location.href = 'login.html?redirect=checkout.html';
    }
    
    initializeForm() {
        this.form = document.getElementById('checkout-form');
        if (!this.form) {
            throw new Error('Checkout form not found');
        }
    }
    
    loadCartItems() {
        const container = document.getElementById('checkout-cart-items');
        if (!container) return;
        
        if (this.cart.items.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Coșul este gol</p>';
            return;
        }
        
        container.innerHTML = this.cart.items.map(item => `
            <div class="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                <img src="${item.image}" alt="${item.name}" 
                     class="w-12 h-12 object-cover rounded-md"
                     onerror="this.src='/images/placeholder.jpg'">
                <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900 line-clamp-1">${item.name}</h4>
                    <p class="text-xs text-gray-500">SKU: ${item.sku}</p>
                    <div class="flex items-center justify-between mt-1">
                        <span class="text-xs text-gray-500">Cantitate: ${item.quantity}</span>
                        <span class="text-sm font-medium">${UTILS.formatPrice(item.totalPrice)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    updateOrderTotals() {
        // Update item count
        const itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('item-count').textContent = itemCount;
        
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
    
    setupEventListeners() {
        // Same as shipping checkbox
        const sameAsShippingCheckbox = document.getElementById('sameAsShipping');
        const shippingFields = document.getElementById('shipping-address-fields');
        
        sameAsShippingCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                shippingFields.classList.add('hidden');
                this.clearShippingFields();
            } else {
                shippingFields.classList.remove('hidden');
            }
        });
        
        // Promo code functionality
        document.getElementById('toggle-promo-code').addEventListener('click', () => {
            document.getElementById('promo-code-form').classList.toggle('hidden');
        });
        
        document.getElementById('apply-promo-code').addEventListener('click', () => {
            this.applyPromoCode();
        });
        
        document.getElementById('remove-promo-code').addEventListener('click', () => {
            this.removePromoCode();
        });
        
        // Promo code input enter key
        document.getElementById('promo-code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.applyPromoCode();
            }
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOrder();
        });
        
        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', (e) => {
            const value = e.target.value.replace(/[^\d+]/g, '');
            if (!value.startsWith('+')) {
                e.target.value = '+40' + value.replace(/^\+?40?/, '');
            } else {
                e.target.value = value;
            }
        });
        
        // Postal code validation
        const postalInputs = document.querySelectorAll('input[name$="PostalCode"]');
        postalInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
            });
        });
    }
    
    clearShippingFields() {
        document.getElementById('shippingStreet').value = '';
        document.getElementById('shippingCity').value = '';
        document.getElementById('shippingState').value = '';
        document.getElementById('shippingPostalCode').value = '';
        document.getElementById('shippingCountry').value = 'România';
    }
    
    async prefillUserData() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user) {
                // Pre-fill basic info
                if (user.first_name) document.getElementById('firstName').value = user.first_name;
                if (user.last_name) document.getElementById('lastName').value = user.last_name;
                if (user.email) document.getElementById('email').value = user.email;
                if (user.phone) document.getElementById('phone').value = user.phone;
                
                // Try to load saved addresses
                try {
                    const { data: addresses } = await CONFIG.supabase
                        .from('user_addresses')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_default', true)
                        .single();
                        
                    if (addresses) {
                        document.getElementById('billingStreet').value = addresses.street || '';
                        document.getElementById('billingCity').value = addresses.city || '';
                        document.getElementById('billingState').value = addresses.state || '';
                        document.getElementById('billingPostalCode').value = addresses.postal_code || '';
                        document.getElementById('billingCountry').value = addresses.country || 'România';
                    }
                } catch (error) {
                    console.log('No saved addresses found');
                }
            }
        }
    }
    
    async applyPromoCode() {
        const input = document.getElementById('promo-code-input');
        const code = input.value.trim();
        
        if (!code) {
            this.showError('Introduceți codul promoțional');
            return;
        }
        
        // Show loading
        const applyBtn = document.getElementById('apply-promo-code');
        const originalText = applyBtn.textContent;
        applyBtn.textContent = 'Se aplică...';
        applyBtn.disabled = true;
        
        try {
            const result = await window.cartManager.applyPromocode(code);
            
            if (result.success) {
                this.cart = window.cartManager.getCart();
                this.updateOrderTotals();
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
            this.cart = window.cartManager.getCart();
            this.updateOrderTotals();
            this.showSuccess('Codul promoțional a fost eliminat');
        } catch (error) {
            console.error('Promo code removal error:', error);
            this.showError('Eroare la eliminarea codului promoțional');
        }
    }
    
    validateForm() {
        const formData = new FormData(this.form);
        const errors = [];
        
        // Required fields validation
        const requiredFields = [
            { field: 'firstName', message: 'Prenumele este obligatoriu' },
            { field: 'lastName', message: 'Numele este obligatoriu' },
            { field: 'email', message: 'Email-ul este obligatoriu' },
            { field: 'phone', message: 'Telefonul este obligatoriu' },
            { field: 'billingStreet', message: 'Adresa de facturare este obligatorie' },
            { field: 'billingCity', message: 'Orașul de facturare este obligatoriu' },
            { field: 'billingState', message: 'Județul de facturare este obligatoriu' },
            { field: 'billingPostalCode', message: 'Codul poștal de facturare este obligatoriu' }
        ];
        
        requiredFields.forEach(({ field, message }) => {
            if (!formData.get(field)?.trim()) {
                errors.push(message);
            }
        });
        
        // Email validation
        const email = formData.get('email');
        if (email && !UTILS.isValidEmail(email)) {
            errors.push('Adresa de email nu este validă');
        }
        
        // Phone validation
        const phone = formData.get('phone');
        if (phone && !UTILS.isValidPhone(phone)) {
            errors.push('Numărul de telefon nu este valid');
        }
        
        // Postal code validation
        const postalCode = formData.get('billingPostalCode');
        if (postalCode && !UTILS.isValidPostalCode(postalCode)) {
            errors.push('Codul poștal nu este valid (trebuie să aibă 6 cifre)');
        }
        
        // Shipping address validation if different
        if (!formData.get('sameAsShipping')) {
            const shippingRequired = [
                { field: 'shippingStreet', message: 'Adresa de livrare este obligatorie' },
                { field: 'shippingCity', message: 'Orașul de livrare este obligatoriu' },
                { field: 'shippingState', message: 'Județul de livrare este obligatoriu' },
                { field: 'shippingPostalCode', message: 'Codul poștal de livrare este obligatoriu' }
            ];
            
            shippingRequired.forEach(({ field, message }) => {
                if (!formData.get(field)?.trim()) {
                    errors.push(message);
                }
            });
            
            const shippingPostalCode = formData.get('shippingPostalCode');
            if (shippingPostalCode && !UTILS.isValidPostalCode(shippingPostalCode)) {
                errors.push('Codul poștal de livrare nu este valid');
            }
        }
        
        // Terms acceptance
        if (!formData.get('acceptTerms')) {
            errors.push('Trebuie să acceptați termenii și condițiile');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    buildOrderData() {
        const formData = new FormData(this.form);
        
        const orderData = {
            // Customer info
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim().toLowerCase(),
            phone: UTILS.normalizePhone(formData.get('phone')),
            company: formData.get('company')?.trim() || null,
            
            // Billing address
            billingAddress: {
                street: formData.get('billingStreet').trim(),
                city: formData.get('billingCity').trim(),
                state: formData.get('billingState').trim(),
                postalCode: formData.get('billingPostalCode').trim(),
                country: formData.get('billingCountry') || 'România'
            },
            
            // Shipping address
            sameAsShipping: formData.get('sameAsShipping') === 'on',
            
            // Payment and shipping
            paymentMethod: formData.get('paymentMethod'),
            shippingMethod: formData.get('shippingMethod') || 'standard',
            
            // Notes
            notes: formData.get('notes')?.trim() || null
        };
        
        // Set shipping address
        if (orderData.sameAsShipping) {
            orderData.shippingAddress = orderData.billingAddress;
        } else {
            orderData.shippingAddress = {
                street: formData.get('shippingStreet').trim(),
                city: formData.get('shippingCity').trim(),
                state: formData.get('shippingState').trim(),
                postalCode: formData.get('shippingPostalCode').trim(),
                country: formData.get('shippingCountry') || 'România'
            };
        }
        
        return orderData;
    }
    
    async processOrder() {
        if (this.isProcessing) return;
        
        try {
            // Validate form
            const validation = this.validateForm();
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }
            
            // Show processing state
            this.setProcessingState(true);
            
            // Final cart validation
            const cartValidation = await window.cartManager.validateCartItems();
            const invalidItems = cartValidation.filter(r => !r.valid);
            
            if (invalidItems.length > 0) {
                throw new Error('Coșul conține produse care nu mai sunt disponibile');
            }
            
            // Build order data
            const orderData = this.buildOrderData();
            
            // Create order
            const result = await window.orderManager.createOrder(orderData);
            
            if (result.success) {
                // Save order info for thank you page
                sessionStorage.setItem('completed_order', JSON.stringify(result.order));
                
                // Clear cart
                window.cartManager.clear();
                
                // Handle payment method
                if (orderData.paymentMethod === 'paynet') {
                    // Redirect to payment gateway
                    this.redirectToPayment(result.order);
                } else {
                    // Redirect to thank you page
                    this.redirectToThankYou(result.order);
                }
                
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Order processing error:', error);
            this.showError(error.message || 'Eroare la procesarea comenzii');
            this.setProcessingState(false);
        }
    }
    
    setProcessingState(processing) {
        this.isProcessing = processing;
        const submitBtn = document.getElementById('place-order-btn');
        const loadingOverlay = document.getElementById('loading-overlay');
        
        if (processing) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Se procesează...';
            loadingOverlay.classList.remove('hidden');
            this.form.style.pointerEvents = 'none';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>Finalizează comanda';
            loadingOverlay.classList.add('hidden');
            this.form.style.pointerEvents = '';
        }
    }
    
    redirectToPayment(order) {
        // In a real implementation, you would integrate with Paynet or other payment gateway
        // For now, simulate payment processing
        setTimeout(() => {
            this.redirectToThankYou(order);
        }, 2000);
    }
    
    redirectToThankYou(order) {
        window.location.href = `/thank-you.html?order=${order.order_number}`;
    }
    
    showValidationErrors(errors) {
        const errorHtml = errors.map(error => `<li>${error}</li>`).join('');
        this.showError(`
            <div>
                <p class="font-medium mb-2">Vă rugăm să corectați următoarele erori:</p>
                <ul class="list-disc list-inside space-y-1 text-sm">${errorHtml}</ul>
            </div>
        `);
    }
    
    showError(message) {
        // Create or update error notification
        this.removeExistingNotifications();
        
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md z-50 max-w-md';
        notification.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-exclamation-circle mt-0.5 mr-2 flex-shrink-0"></i>
                <div class="flex-1">
                    ${typeof message === 'string' ? message : message}
                </div>
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
    
    showSuccess(message) {
        this.removeExistingNotifications();
        
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-md z-50 max-w-md';
        notification.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-check-circle mt-0.5 mr-2 flex-shrink-0"></i>
                <div class="flex-1">${message}</div>
                <button type="button" class="ml-3 flex-shrink-0 text-green-500 hover:text-green-700" onclick="this.parentElement.parentElement.remove()">
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
    
    removeExistingNotifications() {
        const existingNotifications = document.querySelectorAll('.fixed.top-4.right-4');
        existingNotifications.forEach(notification => notification.remove());
    }
}

// Initialize checkout manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});

// Make it globally available for debugging
window.checkoutManager = CheckoutManager;