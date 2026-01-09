// Configuration for Van Hool Parts Application
// SETUP INSTRUCTIONS:
// 1. Go to https://supabase.com and create a new project
// 2. In your project dashboard, go to Settings > API
// 3. Copy your Project URL and replace SUPABASE_URL below
// 4. Copy your anon/public key and replace SUPABASE_ANON_KEY below
// 5. Run the SQL commands from supabase-schema.sql in your SQL editor
// 6. Run the SQL commands from initial-data.sql to populate with sample data

const SUPABASE_URL = 'https://iqsfmofoezkdnmhbxwbn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2Ztb2ZvZXprZG5taGJ4d2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA3MTksImV4cCI6MjA3OTEyNjcxOX0.w6BinbOGMZPTxyQ2e65bnSuEyHuEeQ59NQOPOtDW56I';

// Create Supabase client (will work offline with demo data if not configured)
let supabase = null;

// Initialize Supabase when DOM is ready and library is loaded
function initializeSupabase() {
    try {
        if (typeof window !== 'undefined' && SUPABASE_URL !== 'https://your-project-id.supabase.co') {
            // Check if Supabase is already initialized by app-universal.js
            if (window.supabase && typeof window.supabase.auth === 'object') {
                console.log('✅ Using existing Supabase client from app-universal.js');
                supabase = window.supabase;
                // CONFIG will be updated after it's defined
                return true;
            }
            
            // If not, try to initialize it ourselves
            let createClient = null;
            
            if (window.supabase?.createClient) {
                createClient = window.supabase.createClient;
            } else if (window.supabase?.default?.createClient) {
                createClient = window.supabase.default.createClient;
            } else if (typeof window.supabase === 'function') {
                // Sometimes the library exports the createClient function directly
                createClient = window.supabase;
            }
            
            if (!createClient) {
                console.error('❌ Supabase createClient function not found. Available methods:', Object.keys(window.supabase || {}));
                return false;
            }
            
            supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized successfully in config.js');
            
            // Update CONFIG object
            CONFIG.supabase = supabase;
            window.supabase = supabase;
            
            return true;
        } else {
            console.warn('⚠️ Supabase not configured - using demo data mode');
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        console.error('Available window.supabase:', window.supabase);
        return false;
    }
}

// Try to initialize immediately if possible
if (typeof window !== 'undefined' && window.supabase) {
    initializeSupabase();
} else {
    // Wait for window load
    if (typeof window !== 'undefined') {
        window.addEventListener('load', initializeSupabase);
    }
}

const CONFIG = {
    supabase,
    
    // Application settings
    currency: 'EUR',
    freeShippingThreshold: 300,
    shippingCost: 35,
    itemsPerPage: 12,
    maxCartItems: 50,
    sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
    
    // Cache settings
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 100,
    
    // Image settings
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageCompressionQuality: 0.8,
    
    // Validation settings
    minPasswordLength: 8,
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    
    // Romanian specific settings
    defaultCountry: 'Romania',
    phoneRegex: /^(\+4|004)?0?7[0-9]{8}$/,
    postalCodeRegex: /^[0-9]{6}$/,
    
    // Error reporting (optional - set to false to disable)
    errorReporting: {
        enabled: false,
        endpoint: null
    },
    
    // Feature flags
    features: {
        vinCompatibilityCheck: false, // Disabled for Van Hool parts
        promocodes: true,
        productReviews: true,
        wishlist: true,
        compareProducts: false, // To be implemented later
        multiLanguage: true
    },
    
    // Payment methods
    paymentMethods: [
        { value: 'paynet', label: 'Paynet (Card/Transfer)', enabled: true },
        { value: 'cash', label: 'Cash on Delivery', enabled: true },
        { value: 'transfer', label: 'Bank Transfer', enabled: true }
    ],
    
    // Shipping methods
    shippingMethods: [
        { 
            value: 'standard', 
            label: 'Livrare standard (2-3 zile)', 
            cost: 25,
            freeThreshold: 200,
            enabled: true 
        },
        { 
            value: 'express', 
            label: 'Livrare express (1-2 zile)', 
            cost: 45,
            freeThreshold: 500,
            enabled: false 
        }
    ],
    
    // Order status configuration
    orderStatuses: [
        { value: 'pending', label: 'În așteptare', color: 'yellow', description: 'Comanda a fost plasată și așteaptă confirmarea' },
        { value: 'confirmed', label: 'Confirmată', color: 'blue', description: 'Comanda a fost confirmată și este în preparare' },
        { value: 'processing', label: 'În procesare', color: 'purple', description: 'Comanda este în curs de pregătire' },
        { value: 'shipped', label: 'Expediată', color: 'indigo', description: 'Comanda a fost expediată' },
        { value: 'delivered', label: 'Livrată', color: 'green', description: 'Comanda a fost livrată cu succes' },
        { value: 'cancelled', label: 'Anulată', color: 'red', description: 'Comanda a fost anulată' }
    ],
    
    // API endpoints (for external services)
    apis: {
        vinDecoder: null, // To be implemented if needed
        courierTracking: null // To be implemented if needed
    },
    
    // SEO configuration
    seo: {
        defaultTitle: 'Van Hool Parts - Rare Bus Parts & Components',
        defaultDescription: 'Find genuine Van Hool bus parts and components. Rare parts for Van Hool buses with worldwide shipping and quality guarantee.',
        defaultImage: '/images/og-default.jpg',
        siteName: 'Van Hool Parts',
        twitterHandle: '@vanhoolparts'
    },
    
    // Contact information
    contact: {
        phone: '+31 20 123 4567',
        email: 'contact@vanhoolparts.com',
        address: {
            street: 'Bernard Connellystraat 86',
            city: 'Lier',
            state: 'Antwerp',
            postalCode: '2500',
            country: 'Belgium'
        },
        workingHours: {
            monday: '08:00 - 17:00',
            tuesday: '08:00 - 17:00',
            wednesday: '08:00 - 17:00',
            thursday: '08:00 - 17:00',
            friday: '08:00 - 17:00',
            saturday: 'Closed',
            sunday: 'Closed'
        }
    },
    
    // Languages
    languages: [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'ro', name: 'Română', flag: '🇷🇴' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ]
};

// Utility functions
const UTILS = {
    // Format price with currency
    formatPrice(price, currency = CONFIG.currency) {
        return `€${parseFloat(price).toFixed(2)}`;
    },
    
    // Format date for Romanian locale
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        };
        return new Date(date).toLocaleDateString('ro-RO', defaultOptions);
    },
    
    // Format date and time
    formatDateTime(date) {
        return new Date(date).toLocaleString('ro-RO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Generate slug from text
    generateSlug(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    },
    
    // Generate unique ID
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 15);
        return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
    },
    
    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate Romanian phone number
    isValidPhone(phone) {
        // Allow any phone format - just check if it exists and has some digits
        return phone && phone.toString().replace(/[^\d]/g, '').length >= 3;
    },
    
    // Normalize phone number
    normalizePhone(phone) {
        return phone.replace(/[\s\-\(\)]/g, '');
    },
    
    // Validate postal code
    isValidPostalCode(postalCode) {
        return CONFIG.postalCodeRegex.test(postalCode);
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },
    
    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = this.deepClone(obj[key]);
            });
            return copy;
        }
    },
    
    // Get query parameter
    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    // Set query parameter
    setQueryParam(name, value) {
        const url = new URL(window.location);
        if (value) {
            url.searchParams.set(name, value);
        } else {
            url.searchParams.delete(name);
        }
        window.history.replaceState({}, '', url);
    },
    
    // Storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        },
        
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Storage clear error:', error);
                return false;
            }
        }
    }
};

// Standardized Database Queries
const DB_QUERIES = {
    // Standard product selection with all related data
    PRODUCTS_SELECT: `*`,
    
    // Standard category selection
    CATEGORIES_SELECT: `
        id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active
    `,
    
    // Standard product queries
    getProducts: function(options = {}) {
        if (!CONFIG.supabase) {
            console.warn('Supabase not available');
            return null;
        }
        
        let query = CONFIG.supabase
            .from('products')
            .select(this.PRODUCTS_SELECT);
            
        // Apply filters
        if (options.activeOnly !== false) {
            query = query.eq('is_active', true);
        }
        
        if (options.inStockOnly) {
            query = query.gt('stock_quantity', 0);
        }
        
        if (options.featured) {
            query = query.eq('is_featured', true);
        }
        
        if (options.categoryId) {
            query = query.eq('category_id', options.categoryId);
        }
        
        if (options.search) {
            query = query.or(`name_en.ilike.%${options.search}%, name_ro.ilike.%${options.search}%, name_ru.ilike.%${options.search}%, part_code.ilike.%${options.search}%`);
        }
        
        // Sorting
        if (options.orderBy) {
            query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending });
        } else {
            query = query.order('created_at', { ascending: false });
        }
        
        // Limit
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        return query;
    },
    
    // Standard category query
    getCategories: function(options = {}) {
        if (!CONFIG.supabase) {
            console.warn('Supabase not available');
            return null;
        }
        
        let query = CONFIG.supabase
            .from('categories')
            .select(this.CATEGORIES_SELECT);
            
        if (options.activeOnly !== false) {
            query = query.eq('is_active', true);
        }
        
        if (options.parentOnly) {
            query = query.is('parent_id', null);
        }
        
        if (options.childrenOf) {
            query = query.eq('parent_id', options.childrenOf);
        }
        
        return query.order('sort_order');
    },
    
    // Get single product
    getProduct: function(id) {
        if (!CONFIG.supabase) {
            console.warn('Supabase not available');
            return null;
        }
        
        return CONFIG.supabase
            .from('products')
            .select(this.PRODUCTS_SELECT)
            .eq('id', id)
            .single();
    }
};

// Make CONFIG, UTILS, and DB_QUERIES globally available
window.CONFIG = CONFIG;
window.UTILS = UTILS;
window.DB_QUERIES = DB_QUERIES;

// Set supabase in CONFIG if it was initialized before CONFIG was defined
if (supabase && !CONFIG.supabase) {
    CONFIG.supabase = supabase;
    console.log('✅ CONFIG.supabase set after CONFIG initialization');
}

// Check if Supabase is properly initialized
if (!supabase) {
    console.error('Supabase client failed to initialize. Please check your configuration.');
}

// Environment detection
const ENV = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.protocol === 'https:' && window.location.hostname !== 'localhost',
    isStaging: window.location.hostname.includes('staging') || window.location.hostname.includes('dev')
};

window.ENV = ENV;

// Export for module usage
export { CONFIG, UTILS, ENV };