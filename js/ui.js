// UI Management System
import { CONFIG, UTILS } from './config.js';

class UIManager {
    constructor() {
        this.toastContainer = null;
        this.loadingElements = new Set();
        this.modalStack = [];
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        this.createToastContainer();
        this.setupGlobalEventListeners();
        this.setupCartUI();
        this.setupMobileMenu();
        this.setupSearchFunctionality();
        this.isInitialized = true;
    }
    
    // Toast notification system
    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-3 pointer-events-none';
        this.toastContainer.setAttribute('aria-live', 'polite');
        this.toastContainer.setAttribute('aria-label', 'Notificări');
        document.body.appendChild(this.toastContainer);
    }
    
    showToast(message, type = 'info', options = {}) {
        const toast = document.createElement('div');
        const toastId = UTILS.generateId('toast');
        const duration = options.duration || 4000;
        const persistent = options.persistent || false;
        
        toast.id = toastId;
        toast.className = `
            pointer-events-auto max-w-sm w-full transform transition-all duration-300 translate-x-full
            bg-white shadow-lg rounded-lg border-l-4 ${this.getToastClasses(type)}
        `;
        
        toast.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        ${this.getToastIcon(type)}
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">${message}</p>
                        ${options.subtitle ? `<p class="text-sm text-gray-500 mt-1">${options.subtitle}</p>` : ''}
                        ${options.actions ? this.renderToastActions(options.actions, toastId) : ''}
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                                onclick="uiManager.removeToast('${toastId}')">
                            <span class="sr-only">Închide</span>
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Entrance animation
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Auto-remove if not persistent
        if (!persistent) {
            setTimeout(() => {
                this.removeToast(toastId);
            }, duration);
        }
        
        return toastId;
    }
    
    getToastClasses(type) {
        const classes = {
            success: 'border-green-400',
            error: 'border-red-400',
            warning: 'border-yellow-400',
            info: 'border-blue-400'
        };
        return classes[type] || classes.info;
    }
    
    getToastIcon(type) {
        const icons = {
            success: '<svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
            error: '<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
            warning: '<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
            info: '<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
        };
        return icons[type] || icons.info;
    }
    
    renderToastActions(actions, toastId) {
        return `
            <div class="mt-2 flex space-x-2">
                ${actions.map(action => `
                    <button class="text-sm font-medium text-${action.color || 'blue'}-600 hover:text-${action.color || 'blue'}-500 transition-colors"
                            onclick="${action.handler}; ${action.closeAfter !== false ? `uiManager.removeToast('${toastId}');` : ''}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return;
        
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    // Cart UI management
    setupCartUI() {
        if (window.cartManager) {
            window.cartManager.addListener((event, data) => {
                this.updateCartUI(data.cart);
                this.handleCartEvents(event, data);
            });
        }
    }
    
    updateCartUI(cart) {
        // Update cart counters
        const counters = document.querySelectorAll('#cart-count, [data-cart-count]');
        const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        counters.forEach(counter => {
            counter.textContent = itemCount > 99 ? '99+' : itemCount;
            counter.style.display = itemCount > 0 ? 'flex' : 'none';
        });
        
        // Update cart sidebar
        this.updateCartSidebar(cart);
    }
    
    updateCartSidebar(cart) {
        const cartItemsList = document.getElementById('cart-items-list');
        const cartEmpty = document.getElementById('cart-empty');
        const cartFooter = document.getElementById('cart-footer');
        
        if (!cartItemsList) return;
        
        if (cart.items.length === 0) {
            cartEmpty?.classList.remove('hidden');
            cartItemsList.classList.add('hidden');
            cartFooter?.style.setProperty('display', 'none');
        } else {
            cartEmpty?.classList.add('hidden');
            cartItemsList.classList.remove('hidden');
            cartFooter?.style.setProperty('display', 'block');
            
            // Render cart items
            cartItemsList.innerHTML = cart.items.map(item => this.renderCartItem(item)).join('');
            
            // Update totals
            this.updateCartTotals(cart);
        }
    }
    
    renderCartItem(item) {
        return `
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg" data-product-id="${item.productId}">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded" loading="lazy">
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-sm truncate">${item.name}</h4>
                    <p class="text-xs text-gray-600">${item.sku}</p>
                    <p class="text-xs text-gray-500">${item.category}</p>
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center space-x-2">
                            <button class="w-6 h-6 rounded border flex items-center justify-center text-xs hover:bg-gray-200 transition-colors" 
                                    onclick="uiManager.updateCartItemQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                            <span class="text-sm font-semibold min-w-[20px] text-center">${item.quantity}</span>
                            <button class="w-6 h-6 rounded border flex items-center justify-center text-xs hover:bg-gray-200 transition-colors"
                                    onclick="uiManager.updateCartItemQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold text-sm">${UTILS.formatPrice(item.totalPrice)}</div>
                            <button class="text-xs text-red-600 hover:underline transition-colors" 
                                    onclick="uiManager.removeCartItem('${item.productId}')">Elimină</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateCartTotals(cart) {
        const elements = {
            subtotal: document.getElementById('cart-subtotal'),
            shipping: document.getElementById('cart-shipping'),
            total: document.getElementById('cart-total')
        };
        
        if (elements.subtotal) {
            elements.subtotal.textContent = UTILS.formatPrice(cart.subtotal);
        }
        
        if (elements.shipping) {
            elements.shipping.textContent = cart.shipping > 0 ? UTILS.formatPrice(cart.shipping) : 'Gratuită';
        }
        
        if (elements.total) {
            elements.total.textContent = UTILS.formatPrice(cart.total);
        }
    }
    
    handleCartEvents(event, data) {
        switch (event) {
            case 'item_added':
                this.showToast('Produs adăugat în coș', 'success', {
                    subtitle: data.product?.name,
                    actions: [{
                        label: 'Vezi coșul',
                        color: 'blue',
                        handler: 'uiManager.toggleCartSidebar(true)'
                    }]
                });
                break;
                
            case 'item_removed':
                this.showToast('Produs eliminat din coș', 'info');
                break;
                
            case 'promocode_applied':
                this.showToast('Cod promoțional aplicat cu succes', 'success');
                break;
                
            case 'cart_validated':
                const issues = data.validationResults?.filter(r => !r.valid);
                if (issues && issues.length > 0) {
                    this.showToast(`${issues.length} produse au fost actualizate în coș`, 'warning', {
                        subtitle: 'Verificați modificările'
                    });
                }
                break;
        }
    }
    
    // Cart interaction methods
    async updateCartItemQuantity(productId, quantity) {
        if (window.cartManager) {
            const result = await window.cartManager.updateItemQuantity(productId, quantity);
            if (!result.success) {
                this.showToast(result.error, 'error');
            }
        }
    }
    
    removeCartItem(productId) {
        if (window.cartManager) {
            window.cartManager.removeItem(productId);
        }
    }
    
    // Product card rendering
    renderProductCard(product, templateId = 'product-card-template') {
        const template = document.getElementById(templateId);
        if (!template) return null;
        
        const clone = template.content.cloneNode(true);
        
        // Populate product data
        const img = clone.querySelector('img');
        img.src = product.images?.[0] || '/images/placeholder.jpg';
        img.alt = product.name;
        
        clone.querySelector('[data-category]').textContent = product.categories?.name || '';
        clone.querySelector('[data-name]').textContent = product.name;
        clone.querySelector('[data-sku]').textContent = `SKU: ${product.sku}`;
        clone.querySelector('[data-price]').textContent = UTILS.formatPrice(product.sale_price || product.price);
        
        // Handle sale price
        const oldPriceEl = clone.querySelector('[data-old-price]');
        const saleBadge = clone.querySelector('[data-sale-badge]');
        
        if (product.sale_price && product.sale_price < product.price) {
            oldPriceEl.textContent = UTILS.formatPrice(product.price);
            oldPriceEl.classList.remove('hidden');
            saleBadge?.classList.remove('hidden');
        }
        
        // Stock status
        const stockStatus = clone.querySelector('[data-stock-status]');
        if (product.stock_quantity > 0) {
            stockStatus.textContent = 'În stoc';
            stockStatus.className = 'text-xs text-green-600';
        } else {
            stockStatus.textContent = 'Stoc epuizat';
            stockStatus.className = 'text-xs text-red-600';
        }
        
        // Add to cart button
        const addToCartBtn = clone.querySelector('[data-add-to-cart]');
        addToCartBtn.disabled = product.stock_quantity === 0;
        addToCartBtn.onclick = () => this.handleAddToCart(product.id, product);
        
        // Quick view button
        const quickViewBtn = clone.querySelector('[data-quick-view]');
        if (quickViewBtn) {
            quickViewBtn.onclick = () => this.showQuickView(product.id);
        }
        
        // Product link
        const productLink = clone.querySelector('[data-name]');
        if (productLink) {
            productLink.onclick = () => window.location.href = `/produs/${product.slug}`;
        }
        
        return clone;
    }
    
    async handleAddToCart(productId, product = null) {
        if (!window.cartManager) {
            this.showToast('Coșul de cumpărături nu este disponibil', 'error');
            return;
        }
        
        // Show loading state
        const buttons = document.querySelectorAll(`[data-add-to-cart]`);
        buttons.forEach(btn => {
            if (btn.onclick?.toString().includes(productId)) {
                this.setButtonLoading(btn, true);
            }
        });
        
        try {
            const result = await window.cartManager.addItem(productId, 1);
            
            if (!result.success) {
                this.showToast(result.error, 'error');
            }
            
        } catch (error) {
            console.error('Add to cart error:', error);
            this.showToast('Eroare la adăugarea în coș', 'error');
        } finally {
            // Remove loading state
            buttons.forEach(btn => {
                if (btn.onclick?.toString().includes(productId)) {
                    this.setButtonLoading(btn, false);
                }
            });
        }
    }
    
    setButtonLoading(button, loading) {
        const textEl = button.querySelector('[data-button-text]');
        const spinnerEl = button.querySelector('[data-loading-spinner]');
        
        if (loading) {
            button.disabled = true;
            if (textEl) textEl.textContent = 'Se adaugă...';
            spinnerEl?.classList.remove('hidden');
            this.loadingElements.add(button);
        } else {
            button.disabled = false;
            if (textEl) textEl.textContent = 'Adaugă în coș';
            spinnerEl?.classList.add('hidden');
            this.loadingElements.delete(button);
        }
    }
    
    // Cart sidebar management
    toggleCartSidebar(forceOpen = null) {
        const sidebar = document.getElementById('cart-sidebar');
        const panel = document.getElementById('cart-panel');
        
        if (!sidebar || !panel) return;
        
        const isOpen = !sidebar.classList.contains('hidden');
        
        if (forceOpen === true || (!isOpen && forceOpen !== false)) {
            // Open cart
            sidebar.classList.remove('hidden');
            setTimeout(() => panel.classList.remove('translate-x-full'), 10);
        } else {
            // Close cart
            this.closeCartSidebar();
        }
    }
    
    closeCartSidebar() {
        const sidebar = document.getElementById('cart-sidebar');
        const panel = document.getElementById('cart-panel');
        
        if (panel) panel.classList.add('translate-x-full');
        if (sidebar) {
            setTimeout(() => sidebar.classList.add('hidden'), 300);
        }
    }
    
    // Mobile menu management
    setupMobileMenu() {
        const toggleButton = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (toggleButton && mobileMenu) {
            toggleButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }
    
    // Search functionality
    setupSearchFunctionality() {
        const searchForms = document.querySelectorAll('[data-search-form]');
        
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch(form);
            });
        });
        
        // Search suggestions (debounced)
        const searchInputs = document.querySelectorAll('[data-search-input]');
        searchInputs.forEach(input => {
            input.addEventListener('input', UTILS.debounce((e) => {
                this.handleSearchInput(e.target);
            }, 300));
        });
    }
    
    handleSearch(form) {
        const input = form.querySelector('[data-search-input]');
        const query = input?.value.trim();
        
        if (!query) {
            this.showToast('Introduceți un termen de căutare', 'warning');
            return;
        }
        
        // Navigate to search results
        window.location.href = `/cautare?q=${encodeURIComponent(query)}`;
    }
    
    async handleSearchInput(input) {
        const query = input.value.trim();
        
        if (query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }
        
        if (window.productManager) {
            try {
                const suggestions = await window.productManager.getSearchSuggestions(query, 5);
                this.showSearchSuggestions(input, suggestions);
            } catch (error) {
                console.error('Search suggestions error:', error);
            }
        }
    }
    
    showSearchSuggestions(input, suggestions) {
        let container = input.parentNode.querySelector('.search-suggestions');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'search-suggestions absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 hidden';
            input.parentNode.appendChild(container);
        }
        
        if (suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <a href="/produs/${suggestion.slug}" class="block px-4 py-2 hover:bg-gray-50 text-gray-800 text-sm border-b border-gray-100 last:border-b-0">
                ${suggestion.name}
            </a>
        `).join('');
        
        container.classList.remove('hidden');
        
        // Hide suggestions when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!input.parentNode.contains(e.target)) {
                    container.classList.add('hidden');
                }
            }, { once: true });
        }, 100);
    }
    
    hideSearchSuggestions() {
        const suggestions = document.querySelectorAll('.search-suggestions');
        suggestions.forEach(container => container.classList.add('hidden'));
    }
    
    // Global event listeners
    setupGlobalEventListeners() {
        document.addEventListener('click', (e) => {
            // Cart toggle
            if (e.target.closest('[data-cart-toggle]')) {
                this.toggleCartSidebar();
                return;
            }
            
            // Cart overlay close
            if (e.target.matches('#cart-overlay, #close-cart')) {
                this.closeCartSidebar();
                return;
            }
            
            // Continue shopping
            if (e.target.matches('#continue-shopping')) {
                this.closeCartSidebar();
                return;
            }
            
            // Checkout button
            if (e.target.matches('#checkout-btn')) {
                this.handleCheckout();
                return;
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCartSidebar();
                this.hideSearchSuggestions();
            }
        });
        
        // VIN search form
        const vinForm = document.getElementById('vin-search-form');
        if (vinForm) {
            vinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleVinSearch();
            });
        }
    }
    
    handleCheckout() {
        if (window.authManager && !window.authManager.isAuthenticated()) {
            window.authManager.redirectToLogin('/checkout');
        } else {
            window.location.href = '/checkout';
        }
    }
    
    async handleVinSearch() {
        const input = document.getElementById('vin-search-input');
        const vin = input?.value.trim();
        
        if (!vin) {
            this.showToast('Introduceți codul VIN', 'warning');
            return;
        }
        
        if (vin.length !== 17) {
            this.showToast('Codul VIN trebuie să aibă exact 17 caractere', 'error');
            return;
        }
        
        // Navigate to VIN search results
        window.location.href = `/cautare-vin?vin=${encodeURIComponent(vin)}`;
    }
    
    // Loading states
    showPageLoading(message = 'Se încarcă...') {
        const loading = document.createElement('div');
        loading.id = 'page-loading';
        loading.className = 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50';
        loading.innerHTML = `
            <div class="text-center">
                <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        document.body.appendChild(loading);
    }
    
    hidePageLoading() {
        const loading = document.getElementById('page-loading');
        if (loading) {
            loading.remove();
        }
    }
    
    showElementLoading(element, message = '') {
        if (!element) return;
        
        element.style.position = 'relative';
        element.style.pointerEvents = 'none';
        
        const loading = document.createElement('div');
        loading.className = 'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10';
        loading.innerHTML = `
            <div class="text-center">
                <svg class="animate-spin h-6 w-6 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ${message ? `<p class="text-sm text-gray-600">${message}</p>` : ''}
            </div>
        `;
        
        element.appendChild(loading);
        this.loadingElements.add(element);
    }
    
    hideElementLoading(element) {
        if (!element) return;
        
        const loading = element.querySelector('.absolute.inset-0');
        if (loading) {
            loading.remove();
        }
        
        element.style.pointerEvents = '';
        this.loadingElements.delete(element);
    }
    
    // Form validation helpers
    validateForm(form) {
        let isValid = true;
        const requiredInputs = form.querySelectorAll('[required]');
        
        requiredInputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        // Required check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Acest câmp este obligatoriu';
        }
        
        // Type-specific validation
        if (value && isValid) {
            switch (field.type) {
                case 'email':
                    if (!UTILS.isValidEmail(value)) {
                        isValid = false;
                        message = 'Adresa de email nu este validă';
                    }
                    break;
                    
                case 'tel':
                    if (!UTILS.isValidPhone(value)) {
                        isValid = false;
                        message = 'Numărul de telefon nu este valid';
                    }
                    break;
                    
                case 'password':
                    if (value.length < CONFIG.minPasswordLength) {
                        isValid = false;
                        message = `Parola trebuie să aibă minim ${CONFIG.minPasswordLength} caractere`;
                    }
                    break;
            }
            
            // Custom validation attributes
            if (field.hasAttribute('data-validate')) {
                const validateType = field.getAttribute('data-validate');
                switch (validateType) {
                    case 'postal-code':
                        if (!UTILS.isValidPostalCode(value)) {
                            isValid = false;
                            message = 'Codul poștal nu este valid';
                        }
                        break;
                }
            }
        }
        
        // Show/hide error
        if (isValid) {
            this.clearFieldError(field);
        } else {
            this.showFieldError(field, message);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        field.classList.add('border-red-500', 'ring-red-500', 'ring-1');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error text-red-600 text-sm mt-1';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    clearFieldError(field) {
        field.classList.remove('border-red-500', 'ring-red-500', 'ring-1');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    // Convenience toast methods
    success(message, options) { return this.showToast(message, 'success', options); }
    error(message, options) { return this.showToast(message, 'error', options); }
    warning(message, options) { return this.showToast(message, 'warning', options); }
    info(message, options) { return this.showToast(message, 'info', options); }
    
    // Cleanup
    cleanup() {
        // Clear loading states
        this.loadingElements.forEach(element => {
            this.hideElementLoading(element);
        });
        
        // Remove toast container
        if (this.toastContainer) {
            this.toastContainer.remove();
        }
    }
}

// Create global instance
const uiManager = new UIManager();

// Make globally available
window.uiManager = uiManager;

// Global convenience functions
window.showToast = (message, type, options) => uiManager.showToast(message, type, options);
window.showSuccess = (message, options) => uiManager.success(message, options);
window.showError = (message, options) => uiManager.error(message, options);
window.showWarning = (message, options) => uiManager.warning(message, options);
window.showInfo = (message, options) => uiManager.info(message, options);

export { uiManager };