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
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cmVjdCB4PSI0MCIgeT0iNjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIHJ4PSI4IiBmaWxsPSIjRTVFN0VCIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI4NSIgcj0iOCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik01MCA1MkM3MCA2MEw5MCA4MEwxMjAgNDBMMTUwIDgwVjEyMEg1MFY4MFoiIGZpbGw9IiM5Q0EzQUYiLz48dGV4dCB4PSIxMDAiIHk9IjE2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
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

        // Phone number - digits only
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^\d]/g, '');
        });

        // Payment method selection - highlight selected option
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.payment-option').forEach(opt => {
                    opt.classList.remove('border-red-500', 'bg-red-50');
                    opt.classList.add('border-slate-200');
                });
                const selected = document.querySelector('input[name="paymentMethod"]:checked');
                if (selected) {
                    const parent = selected.closest('.payment-option');
                    if (parent) {
                        parent.classList.remove('border-slate-200');
                        parent.classList.add('border-red-500', 'bg-red-50');
                    }
                }
            });
        });

        // Trigger initial highlight
        const initialSelected = document.querySelector('input[name="paymentMethod"]:checked');
        if (initialSelected) {
            initialSelected.dispatchEvent(new Event('change'));
        }
    }
    
    clearShippingFields() {
        // Not needed for simplified form
    }
    
    async prefillUserData() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getUser();
            if (user) {
                // Pre-fill basic info
                const fullNameField = document.getElementById('fullName');
                const phoneField = document.getElementById('phone');
                const emailField = document.getElementById('email');

                if (user.first_name && user.last_name && fullNameField) {
                    fullNameField.value = `${user.first_name} ${user.last_name}`;
                } else if (user.full_name && fullNameField) {
                    fullNameField.value = user.full_name;
                }

                if (user.email && emailField) {
                    emailField.value = user.email;
                }

                if (user.phone && phoneField) {
                    phoneField.value = user.phone;
                }
                
                // Try to load saved addresses
                try {
                    const { data: addresses } = await CONFIG.supabase
                        .from('user_addresses')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_default', true)
                        .single();
                        
                    if (addresses) {
                        const addressField = document.getElementById('address');
                        if (addressField && addresses.street) {
                            const fullAddress = `${addresses.street}, ${addresses.city || ''}, ${addresses.state || ''}, ${addresses.country || 'România'}`;
                            addressField.value = fullAddress;
                        }
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
            { field: 'fullName', message: 'Numele complet este obligatoriu' },
            { field: 'email', message: 'Email-ul este obligatoriu' },
            { field: 'phone', message: 'Telefonul este obligatoriu' },
            { field: 'address', message: 'Adresa este obligatorie' }
        ];

        requiredFields.forEach(({ field, message }) => {
            if (!formData.get(field)?.trim()) {
                errors.push(message);
            }
        });

        // Email format validation
        const email = formData.get('email')?.trim();
        if (email && !UTILS.isValidEmail(email)) {
            errors.push('Adresa de email nu este validă');
        }

        // Phone validation
        const phone = formData.get('phone');
        if (phone && phone.trim().length < 3) {
            errors.push('Numărul de telefon este prea scurt');
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

        // Parse full name
        const fullName = formData.get('fullName').trim();
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Build full phone with country code
        const countryCode = formData.get('countryCode') || '+373';
        const phoneNumber = (formData.get('phone') || '').replace(/[^\d]/g, '');
        const fullPhone = countryCode + phoneNumber;

        const orderData = {
            // Customer info
            firstName: firstName,
            lastName: lastName,
            fullName: fullName,
            email: formData.get('email').trim(),
            phone: fullPhone,
            countryCode: countryCode,

            // Address
            address: formData.get('address').trim(),
            billingAddress: formData.get('address').trim(),
            shippingAddress: formData.get('address').trim(),

            // Payment and shipping
            paymentMethod: formData.get('paymentMethod') || 'cash',
            shippingMethod: 'standard',

            // Notes
            notes: formData.get('notes')?.trim() || null
        };

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

            // Build order data
            const orderData = this.buildOrderData();

            // Create order
            const result = await window.orderManager.createOrder(orderData);

            if (result.success) {
                // Save order info for thank you page
                sessionStorage.setItem('completed_order', JSON.stringify(result.order));

                // Store payment method for thank-you page
                sessionStorage.setItem('payment_method', orderData.paymentMethod);
                sessionStorage.setItem('customer_email', orderData.email);

                // Call Edge Function based on payment method
                let invoiceData = null;
                try {
                    invoiceData = await this.callInvoiceFunction(orderData, result.order);
                    if (invoiceData && invoiceData.invoiceId) {
                        sessionStorage.setItem('invoice_data', JSON.stringify(invoiceData));
                        // Update order with invoice info
                        await window.orderManager.updateOrderInvoice(
                            result.order.id,
                            invoiceData.invoiceId,
                            invoiceData.invoiceUrl
                        );
                    }
                } catch (invoiceError) {
                    console.error('Invoice function error (non-blocking):', invoiceError);
                    // Order is already saved, continue to thank-you
                }

                // Clear cart
                window.cartManager.clear();

                // Redirect to thank you page
                this.redirectToThankYou(result.order);

            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Order processing error:', error);
            this.showError(error.message || 'Eroare la procesarea comenzii');
            this.setProcessingState(false);
        }
    }

    async callInvoiceFunction(orderData, savedOrder) {
        const SUPABASE_URL = 'https://iqsfmofoezkdnmhbxwbn.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2Ztb2ZvZXprZG5taGJ4d2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA3MTksImV4cCI6MjA3OTEyNjcxOX0.w6BinbOGMZPTxyQ2e65bnSuEyHuEeQ59NQOPOtDW56I';
        const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-invoice`;

        const payload = {
            action: orderData.paymentMethod === 'transfer' ? 'invoice' : 'confirmation',
            customerName: orderData.fullName,
            customerEmail: orderData.email,
            orderId: savedOrder.id,
            items: this.cart.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: this.cart.subtotal,
            shipping: this.cart.shipping,
            discount: this.cart.discountAmount || 0,
            total: this.cart.total,
            countryCode: orderData.countryCode || '+373'
        };

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Edge function error: ${errText}`);
        }

        return await response.json();
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
            submitBtn.innerHTML = '<span class="flex items-center justify-center"><i class="fas fa-truck mr-2"></i>Trimite comanda</span>';
            loadingOverlay.classList.add('hidden');
            this.form.style.pointerEvents = '';
        }
    }
    
    redirectToThankYou(order) {
        console.log('🎯 Redirecting to thank you with order:', order);
        const orderId = order?.id || order?.order_number || 'unknown';
        console.log('🔗 Final redirect URL:', `thank-you.html?order=${orderId}`);
        window.location.href = `thank-you.html?order=${orderId}`;
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