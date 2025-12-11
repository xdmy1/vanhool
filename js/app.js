// Main Application Entry Point

class App {
    constructor() {
        this.isInitialized = false;
        this.currentPage = this.getCurrentPage();
        this.managers = {
            auth: null, // Will be set after loading
            cart: null,
            products: null,
            ui: null
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 AutoParts App starting...');
            
            // Show loading for initial page load
            this.showInitialLoading();
            
            // Wait for essential managers to initialize
            await this.waitForManagersReady();
            
            // Load page-specific content
            await this.initializePage();
            
            // Setup global features
            this.setupGlobalFeatures();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Hide loading
            this.hideInitialLoading();
            
            // Trigger ready event
            this.triggerReadyEvent();
            
            console.log('✅ AutoParts App ready!');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.handleInitializationError(error);
        }
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        
        if (path === '/' || path === '/index.html') return 'home';
        if (path.startsWith('/produs/')) return 'product';
        if (path.startsWith('/categorie/')) return 'category';
        if (path.startsWith('/cautare')) return 'search';
        if (path.startsWith('/cautare-vin')) return 'vin-search';
        if (path.startsWith('/cos')) return 'cart';
        if (path.startsWith('/checkout')) return 'checkout';
        if (path.startsWith('/cont')) return 'account';
        if (path.startsWith('/comenzi')) return 'orders';
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/login')) return 'login';
        if (path.startsWith('/register')) return 'register';
        
        return 'other';
    }
    
    showInitialLoading() {
        // Create minimal loading overlay that doesn't interfere with page content
        const existing = document.getElementById('app-loading');
        if (existing) return;
        
        const loading = document.createElement('div');
        loading.id = 'app-loading';
        loading.className = 'fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50';
        loading.innerHTML = `
            <div class="text-center">
                <div class="flex items-center space-x-2 mb-4">
                    <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7h-3V6a3 3 0 0 0-6 0v1H7a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM9 6a1 1 0 0 1 2 0v1H9V6zm5 13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v10z"/>
                    </svg>
                    <span class="text-xl font-bold text-blue-600">AutoParts</span>
                </div>
                <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600 text-sm">Se încarcă aplicația...</p>
            </div>
        `;
        
        document.body.appendChild(loading);
    }
    
    hideInitialLoading() {
        const loading = document.getElementById('app-loading');
        if (loading) {
            loading.style.opacity = '0';
            loading.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => loading.remove(), 300);
        }
    }
    
    async waitForManagersReady() {
        const checkInterval = 100; // ms
        const maxWait = 10000; // 10 seconds
        let waited = 0;
        
        while (waited < maxWait) {
            const allReady = Object.values(this.managers).every(manager => 
                typeof manager.isInitialized === 'undefined' || manager.isInitialized
            );
            
            if (allReady) break;
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        
        if (waited >= maxWait) {
            console.warn('⚠️ Some managers may not be fully initialized');
        }
    }
    
    async initializePage() {
        try {
            switch (this.currentPage) {
                case 'home':
                    await this.initHomePage();
                    break;
                    
                case 'product':
                    await this.initProductPage();
                    break;
                    
                case 'category':
                    await this.initCategoryPage();
                    break;
                    
                case 'search':
                    await this.initSearchPage();
                    break;
                    
                case 'vin-search':
                    await this.initVinSearchPage();
                    break;
                    
                case 'admin':
                    await this.initAdminPage();
                    break;
                    
                default:
                    // Default page initialization
                    await this.initDefaultPage();
                    break;
            }
        } catch (error) {
            console.error('Page initialization error:', error);
        }
    }
    
    async initHomePage() {
        console.log('🏠 Initializing homepage...');
        
        try {
            // Load categories for navigation
            const categories = await productManager.loadCategories();
            this.renderCategoriesMenu(categories);
            this.renderFeaturedCategories(categories.slice(0, 6));
            
            // Load featured products
            const featuredProducts = await productManager.loadFeaturedProducts(8);
            this.renderFeaturedProducts(featuredProducts);
            
            // Setup VIN search
            this.setupVinSearch();
            
        } catch (error) {
            console.error('Homepage initialization error:', error);
            uiManager.error('Eroare la încărcarea paginii principale');
        }
    }
    
    async initProductPage() {
        console.log('📦 Initializing product page...');
        
        try {
            const slug = this.getProductSlugFromUrl();
            if (!slug) {
                throw new Error('Product slug not found');
            }
            
            const product = await productManager.getProduct(slug, true);
            if (!product) {
                throw new Error('Product not found');
            }
            
            // Render product details
            this.renderProductDetails(product);
            
            // Load related products
            const relatedProducts = await productManager.getRelatedProducts(product.id);
            this.renderRelatedProducts(relatedProducts);
            
            // Setup product interactions
            this.setupProductInteractions(product);
            
        } catch (error) {
            console.error('Product page initialization error:', error);
            this.show404Page();
        }
    }
    
    async initCategoryPage() {
        console.log('🏷️ Initializing category page...');
        
        try {
            const categorySlug = this.getCategorySlugFromUrl();
            const urlParams = new URLSearchParams(window.location.search);
            const page = parseInt(urlParams.get('page')) || 1;
            
            // Get category info
            const categories = await productManager.loadCategories();
            const category = categories.find(c => c.slug === categorySlug);
            
            if (!category) {
                throw new Error('Category not found');
            }
            
            // Build filters from URL
            const filters = this.buildFiltersFromUrl();
            filters.category = category.id;
            
            // Load products
            const result = await productManager.searchProducts('', filters, { page });
            
            // Render category page
            this.renderCategoryPage(category, result);
            
        } catch (error) {
            console.error('Category page initialization error:', error);
            this.show404Page();
        }
    }
    
    async initSearchPage() {
        console.log('🔍 Initializing search page...');
        
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q') || '';
            const page = parseInt(urlParams.get('page')) || 1;
            
            // Build filters from URL
            const filters = this.buildFiltersFromUrl();
            
            // Perform search
            const result = await productManager.searchProducts(query, filters, { page });
            
            // Render search results
            this.renderSearchResults(query, result);
            
        } catch (error) {
            console.error('Search page initialization error:', error);
            uiManager.error('Eroare la căutare');
        }
    }
    
    async initVinSearchPage() {
        console.log('🔍 Initializing VIN search page...');
        
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const vin = urlParams.get('vin') || '';
            
            if (!vin) {
                window.location.href = '/';
                return;
            }
            
            // Perform VIN-based product search
            const result = await this.searchProductsByVin(vin);
            
            // Render VIN search results
            this.renderVinSearchResults(vin, result);
            
        } catch (error) {
            console.error('VIN search page initialization error:', error);
            uiManager.error('Eroare la căutarea VIN');
        }
    }
    
    async initAdminPage() {
        console.log('👨‍💼 Initializing admin page...');
        
        // Check admin access
        if (!authManager.requireAdmin()) {
            return; // User will be redirected
        }
        
        // Load admin interface
        try {
            await this.loadAdminInterface();
        } catch (error) {
            console.error('Admin page initialization error:', error);
            uiManager.error('Eroare la încărcarea interfeței de administrare');
        }
    }
    
    async initDefaultPage() {
        console.log('📄 Initializing default page...');
        
        // Load basic navigation
        const categories = await productManager.loadCategories();
        this.renderCategoriesMenu(categories);
    }
    
    // Rendering methods
    async renderCategoriesMenu(categories) {
        const container = document.getElementById('categories-grid');
        if (!container) return;
        
        if (categories.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Nu există categorii disponibile</p>';
            return;
        }
        
        container.innerHTML = categories.map(category => `
            <div class="space-y-1">
                <a href="/categorie/${category.slug}" class="font-semibold text-gray-900 hover:text-blue-600 text-sm transition-colors">
                    ${category.name}
                </a>
                <p class="text-xs text-gray-500">${category.description || ''}</p>
            </div>
        `).join('');
        
        // Update footer categories
        const footerContainer = document.getElementById('footer-categories');
        if (footerContainer) {
            footerContainer.innerHTML = categories.slice(0, 5).map(category => `
                <li><a href="/categorie/${category.slug}" class="hover:text-white transition-colors">${category.name}</a></li>
            `).join('');
        }
    }
    
    async renderFeaturedCategories(categories) {
        const container = document.getElementById('featured-categories');
        if (!container) return;
        
        if (categories.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">Nu există categorii disponibile</p>';
            return;
        }
        
        container.innerHTML = categories.map(category => `
            <div class="group cursor-pointer" onclick="window.location.href='/categorie/${category.slug}'">
                <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center">
                    <div class="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <img src="${category.image_url || '/images/icons/default-category.svg'}" 
                             alt="${category.name}" 
                             class="w-8 h-8"
                             onerror="this.src='/images/icons/default-category.svg'">
                    </div>
                    <h3 class="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">${category.name}</h3>
                    <p class="text-sm text-gray-500 mt-1">Vezi produsele</p>
                </div>
            </div>
        `).join('');
    }
    
    async renderFeaturedProducts(products) {
        const container = document.getElementById('featured-products');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500">Nu există produse recomandate disponibile</p>';
            return;
        }
        
        // Clear loading skeleton
        container.innerHTML = '';
        
        products.forEach(product => {
            const productCard = uiManager.renderProductCard(product);
            if (productCard) {
                container.appendChild(productCard);
            }
        });
    }
    
    // URL helpers
    getProductSlugFromUrl() {
        const path = window.location.pathname;
        const matches = path.match(/^\/produs\/(.+)$/);
        return matches ? matches[1] : null;
    }
    
    getCategorySlugFromUrl() {
        const path = window.location.pathname;
        const matches = path.match(/^\/categorie\/(.+)$/);
        return matches ? matches[1] : null;
    }
    
    buildFiltersFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const filters = {};
        
        if (urlParams.get('brand')) filters.brand = urlParams.get('brand');
        if (urlParams.get('min_price')) filters.minPrice = parseFloat(urlParams.get('min_price'));
        if (urlParams.get('max_price')) filters.maxPrice = parseFloat(urlParams.get('max_price'));
        if (urlParams.get('in_stock')) filters.inStock = urlParams.get('in_stock') === '1';
        if (urlParams.get('sort')) filters.sortBy = urlParams.get('sort');
        
        return filters;
    }
    
    // Global features setup
    setupGlobalFeatures() {
        // Setup periodic cart validation for authenticated users
        if (authManager.isAuthenticated()) {
            this.setupCartValidation();
        }
        
        // Setup auth state change listener
        authManager.addListener((user, session) => {
            this.handleAuthStateChange(user, session);
        });
        
        // Setup page visibility change (for cache refresh)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isInitialized) {
                this.handlePageVisible();
            }
        });
        
        // Setup online/offline detection
        window.addEventListener('online', () => {
            uiManager.success('Conexiunea a fost restabilită');
            this.handleOnline();
        });
        
        window.addEventListener('offline', () => {
            uiManager.warning('Conexiunea la internet a fost pierdută');
        });
    }
    
    setupCartValidation() {
        // Validate cart items every 5 minutes
        setInterval(async () => {
            if (cartManager && !cartManager.isEmpty()) {
                try {
                    const validationResults = await cartManager.validateCartItems();
                    if (validationResults.length > 0) {
                        const hasChanges = await cartManager.applyValidationResults(validationResults);
                        if (hasChanges) {
                            const issues = validationResults.filter(r => !r.valid).length;
                            if (issues > 0) {
                                uiManager.warning(`Coșul a fost actualizat: ${issues} produse modificate`);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Cart validation error:', error);
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    setupVinSearch() {
        const vinForm = document.getElementById('vin-search-form');
        const vinInput = document.getElementById('vin-search-input');
        
        if (!vinForm || !vinInput) return;
        
        // Real-time validation
        vinInput.addEventListener('input', (e) => {
            const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
            e.target.value = value;
            
            // Visual feedback
            if (value.length === 17) {
                vinInput.classList.remove('border-red-300');
                vinInput.classList.add('border-green-300');
            } else if (value.length > 0) {
                vinInput.classList.remove('border-green-300');
                vinInput.classList.add('border-yellow-300');
            } else {
                vinInput.classList.remove('border-green-300', 'border-yellow-300', 'border-red-300');
            }
        });
        
        vinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const vin = vinInput.value.trim();
            if (!vin) {
                uiManager.error('Introduceți codul VIN');
                vinInput.focus();
                return;
            }
            
            if (vin.length !== 17) {
                uiManager.error('Codul VIN trebuie să aibă exact 17 caractere');
                vinInput.classList.add('border-red-300');
                vinInput.focus();
                return;
            }
            
            // Navigate to VIN search
            window.location.href = `/cautare-vin?vin=${encodeURIComponent(vin)}`;
        });
    }
    
    // Event handlers
    handleAuthStateChange(user, session) {
        if (user) {
            // User logged in
            if (cartManager) {
                cartManager.syncWithServer();
            }
        } else {
            // User logged out
            if (this.currentPage === 'admin' || this.currentPage === 'account') {
                window.location.href = '/';
            }
        }
    }
    
    handlePageVisible() {
        // Refresh critical data when page becomes visible
        if (cartManager && authManager.isAuthenticated()) {
            cartManager.syncWithServer();
        }
    }
    
    handleOnline() {
        // Retry failed operations when back online
        if (cartManager && authManager.isAuthenticated()) {
            cartManager.syncWithServer();
        }
    }
    
    // Error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            
            if (ENV.isDevelopment) {
                uiManager.error(`Eroare JavaScript: ${event.error?.message || 'Eroare necunoscută'}`, {
                    duration: 10000,
                    subtitle: event.filename ? `${event.filename}:${event.lineno}` : ''
                });
            }
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            if (ENV.isDevelopment) {
                uiManager.error(`Promise rejection: ${event.reason?.message || 'Eroare necunoscută'}`, {
                    duration: 10000
                });
            }
            
            event.preventDefault();
        });
    }
    
    handleInitializationError(error) {
        this.hideInitialLoading();
        
        const errorContainer = document.createElement('div');
        errorContainer.className = 'fixed inset-0 bg-white flex items-center justify-center z-50';
        errorContainer.innerHTML = `
            <div class="text-center max-w-md mx-auto px-4">
                <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Eroare de încărcare</h1>
                <p class="text-gray-600 mb-6">Ne pare rău, aplicația nu a putut fi încărcată corect.</p>
                <button onclick="window.location.reload()" 
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Reîncarcă Pagina
                </button>
                ${ENV.isDevelopment ? `<pre class="mt-4 text-xs text-red-600 text-left bg-red-50 p-3 rounded overflow-auto">${error.stack}</pre>` : ''}
            </div>
        `;
        
        document.body.appendChild(errorContainer);
    }
    
    show404Page() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="container mx-auto px-4 py-16 text-center">
                    <svg class="w-24 h-24 text-gray-300 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v3M12 3c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z"></path>
                    </svg>
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">404 - Pagina nu a fost găsită</h1>
                    <p class="text-gray-600 mb-8 max-w-md mx-auto">Ne pare rău, pagina pe care o căutați nu există sau a fost mutată.</p>
                    <div class="space-x-4">
                        <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                            Acasă
                        </a>
                        <button onclick="history.back()" class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                            Înapoi
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    triggerReadyEvent() {
        // Trigger custom ready event for external scripts
        const readyEvent = new CustomEvent('autopartsReady', {
            detail: {
                app: this,
                managers: this.managers,
                version: '1.0.0'
            }
        });
        
        window.dispatchEvent(readyEvent);
        
        // Also set a global flag
        window.autopartsApp = this;
        window.appReady = true;
    }
    
    // Public API
    getManager(name) {
        return this.managers[name];
    }
    
    isReady() {
        return this.isInitialized;
    }
    
    getCurrentPageType() {
        return this.currentPage;
    }
}

// Initialize the app
const app = new App();

// Make it globally available
window.app = app;

// Export for module usage
export { app };