// Universal Van Hool Parts App System
// This connects all pages and functionality together

console.log('🔥 Universal App System Loading...');

// Initialize Supabase globally
const { createClient } = supabase;
window.supabase = createClient(
    'https://iqsfmofoezkdnmhbxwbn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2Ztb2ZvZXprZG5taGJ4d2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA3MTksImV4cCI6MjA3OTEyNjcxOX0.w6BinbOGMZPTxyQ2e65bnSuEyHuEeQ59NQOPOtDW56I'
);

// Global App State
window.VanHoolApp = {
    currentUser: null,
    currentLanguage: localStorage.getItem('vanhool_language') || 'en',
    cart: JSON.parse(localStorage.getItem('vanhool_cart')) || [],
    categories: [],
    isAdmin: false
};

// Universal Translation System
const TRANSLATIONS = {
    en: {
        // Navigation
        catalog: "Catalog",
        about: "About", 
        contact: "Contact",
        login: "Login",
        register: "Register",
        dashboard: "Dashboard",
        logout: "Logout",
        
        // Common
        loading: "Loading...",
        error: "Error",
        success: "Success",
        add_to_cart: "Add to Cart",
        in_stock: "In Stock",
        out_of_stock: "Out of Stock",
        
        // Hero
        hero_title: "Rare Van Hool Bus Parts",
        hero_subtitle: "Specialized supplier of authentic Van Hool parts. Hard-to-find components for all Van Hool bus models with worldwide shipping.",
        view_catalog: "View Catalog",
        contact_us: "Contact Us",
        parts_available: "Parts Available",
        countries_served: "Countries Served",
        years_experience: "Years Experience",
        
        // Categories
        popular_categories: "Popular Categories",
        featured_parts: "Featured Parts",
        featured_parts_desc: "Discover our most popular Van Hool parts. All parts come with detailed specifications and authentic part numbers.",
        see_all_parts: "See All Parts",
        
        // Catalog
        title: "Van Hool Parts Catalog",
        subtitle: "Find the perfect part for your Van Hool bus",
        filters: "Filters",
        search: "Search",
        search_placeholder: "Search by part code or name...",
        category: "Category",
        all_categories: "All Categories",
        price_range: "Price Range",
        availability: "Availability",
        featured: "Featured",
        clear_filters: "Clear Filters",
        sort_by: "Sort by:",
        sort_name: "Name",
        sort_price_low: "Price: Low to High",
        sort_price_high: "Price: High to Low",
        sort_featured: "Featured",
        no_results: "No products found",
        no_results_desc: "Try adjusting your filters or search terms",
        
        // Admin
        admin_panel: "Admin Panel",
        manage_products: "Manage Products",
        manage_users: "Manage Users",
        manage_orders: "Manage Orders"
    },
    ro: {
        // Navigation
        catalog: "Catalog",
        about: "Despre Noi",
        contact: "Contact", 
        login: "Autentificare",
        register: "Înregistrare",
        dashboard: "Panou",
        logout: "Deconectare",
        
        // Common
        loading: "Se încarcă...",
        error: "Eroare",
        success: "Succes",
        add_to_cart: "Adaugă în Coș",
        in_stock: "În Stoc",
        out_of_stock: "Fără Stoc",
        
        // Hero
        hero_title: "Piese Rare Autobuze Van Hool",
        hero_subtitle: "Furnizor specializat de piese originale Van Hool. Componente greu de găsit pentru toate modelele de autobuze Van Hool cu livrare în întreaga lume.",
        view_catalog: "Vezi Catalogul",
        contact_us: "Contactează-ne",
        parts_available: "Piese Disponibile",
        countries_served: "Țări Servite",
        years_experience: "Ani Experiență",
        
        // Categories 
        popular_categories: "Categorii Populare",
        featured_parts: "Piese Recomandate", 
        featured_parts_desc: "Descoperă cele mai populare piese Van Hool. Toate piesele vin cu specificații detaliate și numere originale de piese.",
        see_all_parts: "Vezi Toate Piesele",
        
        // Catalog
        title: "Catalog Piese Van Hool",
        subtitle: "Găsește piesa perfectă pentru autobuzul tău Van Hool",
        filters: "Filtre",
        search: "Căutare",
        search_placeholder: "Caută după cod piesă sau nume...",
        category: "Categorie",
        all_categories: "Toate Categoriile",
        price_range: "Interval Preț",
        availability: "Disponibilitate",
        featured: "Recomandate", 
        clear_filters: "Șterge Filtrele",
        sort_by: "Sortează după:",
        sort_name: "Nume",
        sort_price_low: "Preț: De la mic la mare",
        sort_price_high: "Preț: De la mare la mic", 
        sort_featured: "Recomandate",
        no_results: "Nu s-au găsit produse",
        no_results_desc: "Încearcă să ajustezi filtrele sau termenii de căutare",
        
        // Admin
        admin_panel: "Panou Admin",
        manage_products: "Gestionează Produse", 
        manage_users: "Gestionează Utilizatori",
        manage_orders: "Gestionează Comenzi"
    },
    ru: {
        // Navigation
        catalog: "Каталог",
        about: "О нас",
        contact: "Контакты",
        login: "Вход",
        register: "Регистрация",
        dashboard: "Панель",
        logout: "Выход",
        
        // Common
        loading: "Загрузка...",
        error: "Ошибка",
        success: "Успех",
        add_to_cart: "В корзину",
        in_stock: "В наличии", 
        out_of_stock: "Нет в наличии",
        
        // Hero
        hero_title: "Редкие запчасти для автобусов Van Hool",
        hero_subtitle: "Специализированный поставщик оригинальных запчастей Van Hool. Труднодоступные компоненты для всех моделей автобусов Van Hool с доставкой по всему миру.",
        view_catalog: "Смотреть каталог",
        contact_us: "Связаться с нами",
        parts_available: "Доступных запчастей",
        countries_served: "Обслуживаемых стран", 
        years_experience: "Лет опыта",
        
        // Categories
        popular_categories: "Популярные категории",
        featured_parts: "Рекомендуемые запчасти",
        featured_parts_desc: "Откройте для себя самые популярные запчасти Van Hool. Все запчасти поставляются с подробными характеристиками и подлинными номерами запчастей.",
        see_all_parts: "Смотреть все запчасти",
        
        // Catalog
        title: "Каталог запчастей Van Hool",
        subtitle: "Найдите идеальную запчасть для вашего автобуса Van Hool",
        filters: "Фильтры",
        search: "Поиск",
        search_placeholder: "Поиск по коду запчасти или названию...",
        category: "Категория",
        all_categories: "Все категории",
        price_range: "Диапазон цен",
        availability: "Наличие",
        featured: "Рекомендуемые",
        clear_filters: "Очистить фильтры",
        sort_by: "Сортировка:",
        sort_name: "Название",
        sort_price_low: "Цена: По возрастанию",
        sort_price_high: "Цена: По убыванию",
        sort_featured: "Рекомендуемые",
        no_results: "Товары не найдены",
        no_results_desc: "Попробуйте изменить фильтры или условия поиска",
        
        // Admin
        admin_panel: "Админ панель",
        manage_products: "Управление товарами",
        manage_users: "Управление пользователями", 
        manage_orders: "Управление заказами"
    }
};

// Language functions
window.setLanguage = function(lang) {
    console.log('🌐 Setting language to:', lang);
    
    // Ensure VanHoolApp is initialized
    if (!window.VanHoolApp) {
        window.VanHoolApp = {
            currentLanguage: 'en',
            currentUser: null,
            cart: [],
            categories: [],
            isAdmin: false
        };
    }
    
    if (TRANSLATIONS[lang]) {
        window.VanHoolApp.currentLanguage = lang;
        localStorage.setItem('vanhool_language', lang);
        updateTranslations();
        updateLanguageDisplay();
        
        // Reload page content if needed
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof loadCategories === 'function') loadCategories();
        
        console.log('✅ Language set successfully to:', lang);
    } else {
        console.error('❌ Translation not found for language:', lang);
    }
};

window.translate = function(key) {
    const lang = window.VanHoolApp.currentLanguage;
    return TRANSLATIONS[lang] && TRANSLATIONS[lang][key] || key;
};

function updateTranslations() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        const translation = translate(key);
        if (translation !== key) {
            el.textContent = translation;
        }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        const translation = translate(key);
        if (translation !== key) {
            el.placeholder = translation;
        }
    });
}

function updateLanguageDisplay() {
    const langElement = document.getElementById('current-lang');
    if (langElement && window.VanHoolApp?.currentLanguage) {
        langElement.textContent = window.VanHoolApp.currentLanguage.toUpperCase();
        console.log('🎌 Updated language display to:', window.VanHoolApp.currentLanguage);
    } else if (langElement) {
        // Fallback
        langElement.textContent = 'EN';
        console.log('⚠️ Language display fallback to EN');
    }
}

// Authentication System
async function checkUserAuth() {
    try {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (session && session.user) {
            window.VanHoolApp.currentUser = session.user;
            
            // Check if admin
            const { data: profile } = await window.supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();
                
            window.VanHoolApp.isAdmin = profile?.is_admin || false;
            
            updateNavbarForLoggedInUser(session.user);
            return session.user;
        } else {
            window.VanHoolApp.currentUser = null;
            window.VanHoolApp.isAdmin = false;
            updateNavbarForGuest();
            return null;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

function updateNavbarForLoggedInUser(user) {
    const authLinksElement = document.getElementById('auth-links');
    if (!authLinksElement) return;
    
    const firstName = user.email.split('@')[0].split('.')[0];
    const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    
    let adminLink = '';
    if (window.VanHoolApp.isAdmin) {
        adminLink = `
            <a href="admin.html" class="block px-4 py-2 text-sm text-purple-600 hover:bg-gray-100 rounded-md">
                <i class="fas fa-crown mr-2"></i>Admin Panel
            </a>
            <div class="border-t border-gray-100 my-1"></div>
        `;
    }
    
    // Desktop auth links
    authLinksElement.innerHTML = `
        <div class="relative group">
            <button onclick="toggleUserDropdown()" class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 py-2 px-3 rounded-lg transition-colors">
                <i class="fas fa-user-circle text-xl"></i>
                <span class="hidden lg:block">${capitalizedName}</span>
                <i class="fas fa-chevron-down text-sm"></i>
            </button>
            <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <a href="dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                </a>
                <a href="catalog.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    <i class="fas fa-shopping-bag mr-2"></i>Catalog
                </a>
                ${adminLink}
                <button onclick="handleLogout()" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        </div>
    `;
    
    // Update mobile auth links
    updateMobileAuthForLoggedIn(user, capitalizedName, adminLink);
}

function updateNavbarForGuest() {
    const authLinksElement = document.getElementById('auth-links');
    if (authLinksElement) {
        authLinksElement.innerHTML = `
            <a href="login.html" class="text-gray-600 hover:text-blue-600 font-medium transition-colors">Login</a>
            <a href="register.html" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md">Register</a>
        `;
    }
    
    // Update mobile auth links for guests
    updateMobileAuthForGuest();
}

function updateMobileAuthForLoggedIn(user, capitalizedName, adminLink) {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    
    // Find mobile auth section or create it
    let mobileAuthSection = mobileMenu.querySelector('.mobile-auth-section');
    if (!mobileAuthSection) {
        mobileAuthSection = document.createElement('div');
        mobileAuthSection.className = 'mobile-auth-section border-t pt-3 space-y-2';
        mobileMenu.querySelector('.px-4').appendChild(mobileAuthSection);
    }
    
    mobileAuthSection.innerHTML = `
        <div class="px-3 py-2 text-sm font-medium text-gray-900 bg-blue-50 rounded-lg">
            <i class="fas fa-user-circle mr-2"></i>Welcome, ${capitalizedName}
        </div>
        <a href="dashboard.html" class="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
        </a>
        <a href="catalog.html" class="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <i class="fas fa-shopping-bag mr-2"></i>Catalog
        </a>
        ${window.VanHoolApp.isAdmin ? `
            <a href="admin.html" class="block px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                <i class="fas fa-crown mr-2"></i>Admin Panel
            </a>
        ` : ''}
        <button onclick="handleLogout()" class="w-full text-left block px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
            <i class="fas fa-sign-out-alt mr-2"></i>Logout
        </button>
    `;
}

function updateMobileAuthForGuest() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    
    // Find mobile auth section or create it
    let mobileAuthSection = mobileMenu.querySelector('.mobile-auth-section');
    if (!mobileAuthSection) {
        mobileAuthSection = document.createElement('div');
        mobileAuthSection.className = 'mobile-auth-section border-t pt-3 space-y-2';
        mobileMenu.querySelector('.px-4').appendChild(mobileAuthSection);
    }
    
    mobileAuthSection.innerHTML = `
        <a href="login.html" class="block px-3 py-2 text-center text-gray-600 hover:text-blue-600 border border-gray-300 rounded-lg transition-colors">Login</a>
        <a href="register.html" class="block px-3 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Register</a>
    `;
}

// Dropdown functions
window.toggleUserDropdown = function() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
};

window.handleLogout = async function() {
    try {
        const { error } = await window.supabase.auth.signOut();
        if (error) throw error;
        
        window.VanHoolApp.currentUser = null;
        window.VanHoolApp.isAdmin = false;
        window.VanHoolApp.cart = [];
        localStorage.removeItem('vanhool_cart');
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out');
    }
};

// Cart System
window.addToCart = async function(productId) {
    console.log('🛒 Adding to cart:', productId);
    
    // Check if user is logged in
    if (!window.VanHoolApp.currentUser) {
        if (confirm('You need to be logged in to add items to cart. Login now?')) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        }
        return;
    }
    
    try {
        // Get or create user cart
        let { data: cart, error } = await window.supabase
            .from('carts')
            .select('id')
            .eq('user_id', window.VanHoolApp.currentUser.id)
            .eq('status', 'active')
            .single();
        
        if (error && error.code === 'PGRST116') {
            // Create new cart
            const { data: newCart, error: createError } = await window.supabase
                .from('carts')
                .insert({
                    user_id: window.VanHoolApp.currentUser.id,
                    status: 'active'
                })
                .select('id')
                .single();
                
            if (createError) throw createError;
            cart = newCart;
        } else if (error) {
            throw error;
        }
        
        // Check if item already in cart
        const { data: existingItem } = await window.supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
            .single();
            
        if (existingItem) {
            // Update quantity
            const { error: updateError } = await window.supabase
                .from('cart_items')
                .update({ 
                    quantity: existingItem.quantity + 1,
                    total_price: (existingItem.quantity + 1) * existingItem.unit_price,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingItem.id);
                
            if (updateError) throw updateError;
        } else {
            // Get product details
            const { data: product, error: productError } = await window.supabase
                .from('products')
                .select('price')
                .eq('id', productId)
                .single();
                
            if (productError) throw productError;
            
            // Add new item to cart
            const { error: insertError } = await window.supabase
                .from('cart_items')
                .insert({
                    cart_id: cart.id,
                    product_id: productId,
                    quantity: 1,
                    unit_price: product.price,
                    total_price: product.price
                });
                
            if (insertError) throw insertError;
        }
        
        // Show success feedback
        showNotification('Added to cart!', 'success');
        updateCartCount();
        
    } catch (error) {
        console.error('Cart error:', error);
        showNotification('Failed to add to cart', 'error');
    }
};

// Get cart count
async function updateCartCount() {
    if (!window.VanHoolApp.currentUser) return;
    
    try {
        const { data: cart } = await window.supabase
            .from('carts')
            .select(`
                cart_items(quantity)
            `)
            .eq('user_id', window.VanHoolApp.currentUser.id)
            .eq('status', 'active')
            .single();
            
        const totalItems = cart?.cart_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        
        // Update cart badge if exists
        const cartBadge = document.querySelector('.cart-count');
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.classList.toggle('hidden', totalItems === 0);
        }
    } catch (error) {
        console.error('Cart count error:', error);
    }
}

// Admin access function
window.becomeAdmin = async function() {
    if (!window.VanHoolApp.currentUser) {
        alert('You must be logged in to access admin functions');
        return;
    }
    
    try {
        const { error } = await window.supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', window.VanHoolApp.currentUser.id);
            
        if (error) throw error;
        
        window.VanHoolApp.isAdmin = true;
        alert('Admin access granted! Refreshing page...');
        window.location.reload();
        
    } catch (error) {
        console.error('Admin access error:', error);
        alert('Error granting admin access');
    }
};

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-transform transform translate-x-full ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Categories with dropdown
function createCategoriesDropdown() {
    // This will be implemented when categories are loaded
    const categoriesMenu = document.getElementById('categories-menu');
    if (!categoriesMenu) return;
    
    // TODO: Load and display categories with subcategories
}

// Mobile responsive navbar
function initMobileNavbar() {
    // Add mobile menu toggle if it doesn't exist
    const nav = document.querySelector('nav');
    if (nav && !document.getElementById('mobile-menu-button')) {
        const mobileButton = document.createElement('button');
        mobileButton.id = 'mobile-menu-button';
        mobileButton.className = 'md:hidden flex items-center px-3 py-2 border rounded text-gray-600 border-gray-600 hover:text-blue-600 hover:border-blue-600';
        mobileButton.innerHTML = '<i class="fas fa-bars"></i>';
        
        mobileButton.addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
        
        // Add to nav
        const navContainer = nav.querySelector('.container > div');
        if (navContainer) {
            navContainer.appendChild(mobileButton);
        }
    }
}

// Dynamic Categories for Mobile Navigation
async function loadMobileCategories() {
    try {
        const { data: categories, error } = await window.supabase
            .from('categories')
            .select('*')
            .is('parent_id', null) // Only parent categories
            .order('name');
        
        if (error) {
            console.error('Error loading categories for mobile:', error);
            return;
        }
        
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu || !categories) return;
        
        // Find or create mobile categories section
        let mobileCategoriesSection = mobileMenu.querySelector('#mobile-categories');
        if (!mobileCategoriesSection) {
            mobileCategoriesSection = document.querySelector('#mobile-categories');
        }
        
        if (mobileCategoriesSection && categories.length > 0) {
            const categoryIcons = {
                'brake-system': 'fas fa-stop-circle',
                'air-pressure': 'fas fa-wind', 
                'electrical': 'fas fa-bolt',
                'chassis-suspension': 'fas fa-car-side',
                'engine-transmission': 'fas fa-cog',
                'body-interior': 'fas fa-door-open',
                'hvac': 'fas fa-snowflake',
                'fuel-system': 'fas fa-gas-pump',
                'lighting': 'fas fa-lightbulb',
                'safety': 'fas fa-shield-alt'
            };
            
            mobileCategoriesSection.innerHTML = categories.map(category => {
                const icon = categoryIcons[category.slug] || 'fas fa-cog';
                return `
                    <a href="catalog.html?category=${category.slug}" class="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <i class="${icon} mr-3 w-4"></i>${category.name}
                    </a>
                `;
            }).join('');
        }
        
        console.log('✅ Mobile categories loaded:', categories.length);
    } catch (error) {
        console.error('Error loading mobile categories:', error);
    }
}

// Setup cart icon handlers
function setupCartIconHandlers() {
    const cartToggle = document.getElementById('cart-toggle');
    if (cartToggle) {
        cartToggle.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
    
    // Setup cart count updates
    if (window.cartManager) {
        window.cartManager.on('cart_updated', function() {
            updateCartCountDisplay();
        });
        
        window.cartManager.on('item_added', function() {
            updateCartCountDisplay();
        });
        
        window.cartManager.on('item_removed', function() {
            updateCartCountDisplay();
        });
        
        window.cartManager.on('cart_cleared', function() {
            updateCartCountDisplay();
        });
    }
}

// Update cart count display
function updateCartCountDisplay() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl && window.cartManager) {
        const cart = window.cartManager.getCart();
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCountEl.classList.remove('hidden');
        } else {
            cartCountEl.classList.add('hidden');
        }
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown && !event.target.closest('[onclick="toggleUserDropdown()"]')) {
        userDropdown.classList.add('hidden');
    }
    
    const langMenu = document.querySelector('.language-menu');
    if (langMenu && !event.target.closest('.language-switcher')) {
        langMenu.classList.add('hidden');
    }
});

// Initialize CartManager and other managers
async function initializeManagers() {
    try {
        console.log('🔐 Setting up Auth Manager...');
        
        // Create simple authManager compatibility layer FIRST
        window.authManager = {
            listeners: [],
            
            isAuthenticated: () => {
                const authenticated = window.VanHoolApp.currentUser !== null;
                console.log('🔐 Auth check:', authenticated, window.VanHoolApp.currentUser?.email);
                return authenticated;
            },
            
            getUserId: () => {
                return window.VanHoolApp.currentUser?.id || null;
            },
            
            getUser: () => {
                return window.VanHoolApp.currentUser;
            },
            
            signOut: async () => {
                return window.handleLogout();
            },
            
            // Force refresh auth state
            refreshAuth: async () => {
                await checkUserAuth();
            },
            
            // Add listener for auth state changes
            addListener: (callback) => {
                if (typeof callback === 'function') {
                    window.authManager.listeners.push(callback);
                }
            },
            
            // Remove listener
            removeListener: (callback) => {
                const index = window.authManager.listeners.indexOf(callback);
                if (index > -1) {
                    window.authManager.listeners.splice(index, 1);
                }
            },
            
            // Notify all listeners
            notifyListeners: (event) => {
                window.authManager.listeners.forEach(callback => {
                    try {
                        callback(event);
                    } catch (error) {
                        console.error('Auth listener error:', error);
                    }
                });
            }
        };
        
        console.log('🛒 Loading Cart Manager...');
        
        // Import CartManager instance (after auth manager is ready)
        const { cartManager } = await import('./cart.js');
        window.cartManager = cartManager;
        
        console.log('📦 Loading Order Manager...');
        
        // Import OrderManager instance
        const { orderManager } = await import('./order-manager.js');
        window.orderManager = orderManager;
        
        console.log('✅ All managers loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load managers:', error);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Universal Van Hool App Initializing...');
    
    // Initialize managers first
    await initializeManagers();
    
    // Set initial language
    updateLanguageDisplay();
    updateTranslations();
    
    // Ensure language is set properly on page load
    const savedLanguage = localStorage.getItem('vanhool_language') || 'en';
    if (savedLanguage !== window.VanHoolApp.currentLanguage) {
        window.VanHoolApp.currentLanguage = savedLanguage;
        updateLanguageDisplay();
    }
    
    // Check authentication
    await checkUserAuth();
    
    // Initialize mobile navbar
    initMobileNavbar();
    
    // Load mobile categories
    await loadMobileCategories();
    
    // Update cart count
    await updateCartCount();
    
    // Setup cart icon click handlers
    setupCartIconHandlers();
    
    // Initial cart count display
    updateCartCountDisplay();
    
    // Listen for auth state changes
    window.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
            window.VanHoolApp.currentUser = session.user;
            updateNavbarForLoggedInUser(session.user);
            
            // Dispatch auth state change event for other components
            window.dispatchEvent(new CustomEvent('authStateChange', {
                detail: { user: session.user, event: 'SIGNED_IN' }
            }));
            
            // Notify authManager listeners
            if (window.authManager && window.authManager.notifyListeners) {
                window.authManager.notifyListeners('SIGNED_IN');
            }
        } else if (event === 'SIGNED_OUT') {
            window.VanHoolApp.currentUser = null;
            window.VanHoolApp.isAdmin = false;
            updateNavbarForGuest();
            
            // Dispatch auth state change event for other components
            window.dispatchEvent(new CustomEvent('authStateChange', {
                detail: { user: null, event: 'SIGNED_OUT' }
            }));
            
            // Notify authManager listeners
            if (window.authManager && window.authManager.notifyListeners) {
                window.authManager.notifyListeners('SIGNED_OUT');
            }
        }
    });
    
    console.log('✅ Universal App Initialized');
    console.log('Current user:', window.VanHoolApp.currentUser?.email);
    console.log('Is admin:', window.VanHoolApp.isAdmin);
    console.log('Language:', window.VanHoolApp.currentLanguage);
    
    // Add console helpers
    if (window.VanHoolApp.currentUser && !window.VanHoolApp.isAdmin) {
        console.log('💡 To become admin, run: becomeAdmin()');
    }
    
    // Add debug helper
    window.checkAuth = () => {
        console.log('🔐 Auth status debug:');
        console.log('- VanHoolApp.currentUser:', window.VanHoolApp.currentUser);
        console.log('- authManager.isAuthenticated():', window.authManager?.isAuthenticated());
        console.log('- authManager.getUserId():', window.authManager?.getUserId());
    };
    
    console.log('💡 Debug authentication: run checkAuth() in console');
});

console.log('✅ Universal App System Loaded');