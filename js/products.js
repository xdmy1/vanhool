// Products Management System
import { CONFIG, UTILS } from './config.js';

class ProductManager {
    constructor() {
        this.searchCache = new Map();
        this.categoriesCache = null;
        this.brandsCache = null;
        this.featuredProductsCache = null;
        this.recentlyViewed = this.loadRecentlyViewed();
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Load initial data
            await this.loadCategories();
            await this.loadBrands();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Product manager initialization error:', error);
        }
    }
    
    // Load categories with caching
    async loadCategories(forceReload = false) {
        if (this.categoriesCache && !forceReload) {
            return this.categoriesCache;
        }
        
        try {
            const { data: categories, error } = await CONFIG.supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true })
                .order('name', { ascending: true });
                
            if (error) throw error;
            
            this.categoriesCache = categories || [];
            return this.categoriesCache;
            
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    }
    
    // Load brands with caching
    async loadBrands(forceReload = false) {
        if (this.brandsCache && !forceReload) {
            return this.brandsCache;
        }
        
        try {
            const { data: brands, error } = await CONFIG.supabase
                .from('brands')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true });
                
            if (error) throw error;
            
            this.brandsCache = brands || [];
            return this.brandsCache;
            
        } catch (error) {
            console.error('Error loading brands:', error);
            return [];
        }
    }
    
    // Load featured products
    async loadFeaturedProducts(limit = 8) {
        const cacheKey = `featured_${limit}`;
        const cached = this.searchCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < CONFIG.cacheTimeout) {
            return cached.data;
        }
        
        try {
            const { data: products, error } = await CONFIG.supabase
                .from('products')
                .select(`
                    *,
                    categories(name, slug),
                    brands(name, slug)
                `)
                .eq('is_active', true)
                .eq('is_featured', true)
                .gt('stock_quantity', 0)
                .order('created_at', { ascending: false })
                .limit(limit);
                
            if (error) throw error;
            
            const result = products || [];
            
            this.searchCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            console.error('Error loading featured products:', error);
            return [];
        }
    }
    
    // Search products with advanced filtering
    async searchProducts(query = '', filters = {}, pagination = {}) {
        try {
            const cacheKey = JSON.stringify({ query, filters, pagination });
            const cached = this.searchCache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < CONFIG.cacheTimeout) {
                return cached.data;
            }
            
            let searchQuery = CONFIG.supabase
                .from('products')
                .select(`
                    *,
                    categories(id, name, slug),
                    brands(id, name, slug)
                `, { count: 'exact' })
                .eq('is_active', true);
                
            // Text search with ranking
            if (query && query.trim()) {
                const searchTerm = query.trim();
                searchQuery = searchQuery.or(
                    `name.ilike.%${searchTerm}%,` +
                    `description.ilike.%${searchTerm}%,` +
                    `sku.ilike.%${searchTerm}%,` +
                    `attributes->>'material'.ilike.%${searchTerm}%,` +
                    `attributes->>'manufacturer'.ilike.%${searchTerm}%`
                );
            }
            
            // Category filter
            if (filters.category) {
                if (Array.isArray(filters.category)) {
                    searchQuery = searchQuery.in('category_id', filters.category);
                } else {
                    searchQuery = searchQuery.eq('category_id', filters.category);
                }
            }
            
            // Brand filter
            if (filters.brand) {
                if (Array.isArray(filters.brand)) {
                    searchQuery = searchQuery.in('brand_id', filters.brand);
                } else {
                    searchQuery = searchQuery.eq('brand_id', filters.brand);
                }
            }
            
            // Price range filter
            if (filters.minPrice && filters.minPrice > 0) {
                searchQuery = searchQuery.gte('price', filters.minPrice);
            }
            
            if (filters.maxPrice && filters.maxPrice > 0) {
                searchQuery = searchQuery.lte('price', filters.maxPrice);
            }
            
            // Stock filter
            if (filters.inStock) {
                searchQuery = searchQuery.gt('stock_quantity', 0);
            }
            
            // Featured filter
            if (filters.featured) {
                searchQuery = searchQuery.eq('is_featured', true);
            }
            
            // Sale items filter
            if (filters.onSale) {
                searchQuery = searchQuery.not('sale_price', 'is', null);
            }
            
            // Attributes filter
            if (filters.attributes && typeof filters.attributes === 'object') {
                Object.keys(filters.attributes).forEach(key => {
                    const value = filters.attributes[key];
                    if (value) {
                        searchQuery = searchQuery.eq(`attributes->>${key}`, value);
                    }
                });
            }
            
            // Sorting
            const sortBy = filters.sortBy || 'created_at';
            const sortOrder = filters.sortOrder || 'desc';
            
            switch (sortBy) {
                case 'price_asc':
                    searchQuery = searchQuery.order('price', { ascending: true });
                    break;
                case 'price_desc':
                    searchQuery = searchQuery.order('price', { ascending: false });
                    break;
                case 'name':
                    searchQuery = searchQuery.order('name', { ascending: sortOrder === 'asc' });
                    break;
                case 'popularity':
                    // Order by featured first, then by creation date
                    searchQuery = searchQuery
                        .order('is_featured', { ascending: false })
                        .order('created_at', { ascending: false });
                    break;
                case 'newest':
                    searchQuery = searchQuery.order('created_at', { ascending: false });
                    break;
                case 'oldest':
                    searchQuery = searchQuery.order('created_at', { ascending: true });
                    break;
                default:
                    searchQuery = searchQuery.order(sortBy, { ascending: sortOrder === 'asc' });
            }
            
            // Pagination
            const page = pagination.page || 1;
            const limit = pagination.limit || CONFIG.itemsPerPage;
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            
            searchQuery = searchQuery.range(from, to);
            
            const { data, error, count } = await searchQuery;
            
            if (error) throw error;
            
            const result = {
                products: data || [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                    hasNext: (page * limit) < (count || 0),
                    hasPrev: page > 1
                },
                filters: filters,
                query: query
            };
            
            // Cache results
            this.searchCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            return result;
            
        } catch (error) {
            console.error('Product search error:', error);
            return {
                products: [],
                pagination: { page: 1, limit: CONFIG.itemsPerPage, total: 0, totalPages: 0 },
                error: error.message
            };
        }
    }
    
    // Get single product by ID or slug
    async getProduct(identifier, bySlug = false) {
        try {
            const cacheKey = `product_${identifier}_${bySlug}`;
            const cached = this.searchCache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < CONFIG.cacheTimeout) {
                return cached.data;
            }
            
            let query = CONFIG.supabase
                .from('products')
                .select(`
                    *,
                    categories(id, name, slug),
                    brands(id, name, slug)
                `)
                .eq('is_active', true)
                .single();
                
            if (bySlug) {
                query = query.eq('slug', identifier);
            } else {
                query = query.eq('id', identifier);
            }
            
            const { data: product, error } = await query;
            
            if (error) throw error;
            
            // Add to recently viewed
            if (product) {
                this.addToRecentlyViewed(product);
            }
            
            // Cache product
            this.searchCache.set(cacheKey, {
                data: product,
                timestamp: Date.now()
            });
            
            return product;
            
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }
    
    // Get related products
    async getRelatedProducts(productId, limit = 4) {
        try {
            // First get the current product to find related ones
            const currentProduct = await this.getProduct(productId);
            if (!currentProduct) return [];
            
            const { data: products, error } = await CONFIG.supabase
                .from('products')
                .select(`
                    *,
                    categories(name, slug),
                    brands(name, slug)
                `)
                .eq('is_active', true)
                .neq('id', productId)
                .or(`category_id.eq.${currentProduct.category_id},brand_id.eq.${currentProduct.brand_id}`)
                .gt('stock_quantity', 0)
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(limit);
                
            if (error) throw error;
            
            return products || [];
            
        } catch (error) {
            console.error('Error fetching related products:', error);
            return [];
        }
    }
    
    // Check VIN compatibility
    async checkVinCompatibility(productId, vinCode) {
        try {
            if (!vinCode || vinCode.length !== 17) {
                return {
                    compatible: null,
                    message: 'Codul VIN trebuie să aibă exact 17 caractere'
                };
            }
            
            const { data: compatibilities, error } = await CONFIG.supabase
                .from('product_compatibility')
                .select('*')
                .eq('product_id', productId);
                
            if (error) throw error;
            
            if (!compatibilities || compatibilities.length === 0) {
                return {
                    compatible: null,
                    message: 'Nu există date de compatibilitate pentru acest produs'
                };
            }
            
            // Check VIN patterns
            for (const compatibility of compatibilities) {
                if (compatibility.vin_patterns && Array.isArray(compatibility.vin_patterns)) {
                    for (const pattern of compatibility.vin_patterns) {
                        try {
                            const regex = new RegExp(pattern, 'i');
                            if (regex.test(vinCode)) {
                                return {
                                    compatible: true,
                                    message: `Compatibil cu ${compatibility.vehicle_make} ${compatibility.vehicle_model}`,
                                    details: {
                                        make: compatibility.vehicle_make,
                                        model: compatibility.vehicle_model,
                                        yearFrom: compatibility.year_from,
                                        yearTo: compatibility.year_to,
                                        engineCode: compatibility.engine_code,
                                        notes: compatibility.notes
                                    }
                                };
                            }
                        } catch (regexError) {
                            console.error('Invalid regex pattern:', pattern, regexError);
                        }
                    }
                }
            }
            
            return {
                compatible: false,
                message: 'Produsul nu este compatibil cu VIN-ul introdus'
            };
            
        } catch (error) {
            console.error('VIN compatibility check error:', error);
            return {
                compatible: null,
                message: 'Eroare la verificarea compatibilității VIN'
            };
        }
    }
    
    // Get product availability
    async checkProductAvailability(productIds) {
        try {
            if (!Array.isArray(productIds)) {
                productIds = [productIds];
            }
            
            const { data: products, error } = await CONFIG.supabase
                .from('products')
                .select('id, stock_quantity, is_active')
                .in('id', productIds);
                
            if (error) throw error;
            
            const availability = {};
            
            products?.forEach(product => {
                availability[product.id] = {
                    available: product.is_active && product.stock_quantity > 0,
                    stock: product.stock_quantity,
                    isActive: product.is_active
                };
            });
            
            return availability;
            
        } catch (error) {
            console.error('Product availability check error:', error);
            return {};
        }
    }
    
    // Recently viewed products management
    addToRecentlyViewed(product) {
        try {
            // Don't add if already exists
            const existingIndex = this.recentlyViewed.findIndex(p => p.id === product.id);
            if (existingIndex !== -1) {
                // Move to front
                this.recentlyViewed.splice(existingIndex, 1);
            }
            
            // Add to front
            this.recentlyViewed.unshift({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.sale_price || product.price,
                originalPrice: product.price,
                image: product.images?.[0] || '/images/placeholder.jpg',
                category: product.categories?.name || '',
                brand: product.brands?.name || '',
                viewedAt: Date.now()
            });
            
            // Limit to 20 items
            this.recentlyViewed = this.recentlyViewed.slice(0, 20);
            
            // Save to localStorage
            this.saveRecentlyViewed();
            
        } catch (error) {
            console.error('Error adding to recently viewed:', error);
        }
    }
    
    // Load recently viewed from localStorage
    loadRecentlyViewed() {
        try {
            const stored = UTILS.storage.get('recently_viewed', []);
            
            // Filter out old items (older than 30 days)
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            return stored.filter(item => item.viewedAt > thirtyDaysAgo);
            
        } catch (error) {
            console.error('Error loading recently viewed:', error);
            return [];
        }
    }
    
    // Save recently viewed to localStorage
    saveRecentlyViewed() {
        try {
            UTILS.storage.set('recently_viewed', this.recentlyViewed);
        } catch (error) {
            console.error('Error saving recently viewed:', error);
        }
    }
    
    // Get recently viewed products
    getRecentlyViewed(limit = 10) {
        return this.recentlyViewed.slice(0, limit);
    }
    
    // Clear recently viewed
    clearRecentlyViewed() {
        this.recentlyViewed = [];
        this.saveRecentlyViewed();
    }
    
    // Get price statistics for a category
    async getPriceStats(categoryId) {
        try {
            const { data: stats, error } = await CONFIG.supabase
                .rpc('get_price_stats', { category_id: categoryId });
                
            if (error) throw error;
            
            return stats || { min: 0, max: 1000, avg: 100 };
            
        } catch (error) {
            console.error('Price stats error:', error);
            // Fallback values
            return { min: 0, max: 1000, avg: 100 };
        }
    }
    
    // Get product filters for a category
    async getProductFilters(categoryId = null) {
        try {
            let query = CONFIG.supabase
                .from('products')
                .select('attributes, price, brands(id, name)')
                .eq('is_active', true);
                
            if (categoryId) {
                query = query.eq('category_id', categoryId);
            }
            
            const { data: products, error } = await query;
            
            if (error) throw error;
            
            // Extract unique attributes
            const attributes = {};
            const brands = [];
            let minPrice = Infinity;
            let maxPrice = 0;
            
            products?.forEach(product => {
                // Price range
                const price = product.price;
                if (price < minPrice) minPrice = price;
                if (price > maxPrice) maxPrice = price;
                
                // Brands
                if (product.brands && !brands.find(b => b.id === product.brands.id)) {
                    brands.push(product.brands);
                }
                
                // Attributes
                if (product.attributes && typeof product.attributes === 'object') {
                    Object.keys(product.attributes).forEach(key => {
                        if (!attributes[key]) {
                            attributes[key] = new Set();
                        }
                        const value = product.attributes[key];
                        if (value && value !== '') {
                            attributes[key].add(value);
                        }
                    });
                }
            });
            
            // Convert sets to arrays
            const processedAttributes = {};
            Object.keys(attributes).forEach(key => {
                processedAttributes[key] = Array.from(attributes[key]).sort();
            });
            
            return {
                brands: brands.sort((a, b) => a.name.localeCompare(b.name)),
                attributes: processedAttributes,
                priceRange: {
                    min: minPrice === Infinity ? 0 : minPrice,
                    max: maxPrice
                }
            };
            
        } catch (error) {
            console.error('Error getting product filters:', error);
            return {
                brands: [],
                attributes: {},
                priceRange: { min: 0, max: 1000 }
            };
        }
    }
    
    // Search suggestions
    async getSearchSuggestions(query, limit = 5) {
        try {
            if (!query || query.length < 2) return [];
            
            const { data: suggestions, error } = await CONFIG.supabase
                .from('products')
                .select('name, slug')
                .eq('is_active', true)
                .ilike('name', `%${query}%`)
                .limit(limit);
                
            if (error) throw error;
            
            return suggestions || [];
            
        } catch (error) {
            console.error('Search suggestions error:', error);
            return [];
        }
    }
    
    // Clear cache
    clearCache() {
        this.searchCache.clear();
        this.categoriesCache = null;
        this.brandsCache = null;
        this.featuredProductsCache = null;
    }
    
    // Get cache stats
    getCacheStats() {
        return {
            searchCacheSize: this.searchCache.size,
            hasCategories: !!this.categoriesCache,
            hasBrands: !!this.brandsCache,
            hasFeatured: !!this.featuredProductsCache
        };
    }
    
    // Cleanup cache based on age
    cleanupCache() {
        const now = Date.now();
        
        for (const [key, value] of this.searchCache) {
            if ((now - value.timestamp) > CONFIG.cacheTimeout) {
                this.searchCache.delete(key);
            }
        }
        
        // Clear other caches if too old (1 hour)
        const oneHour = 60 * 60 * 1000;
        if (this.categoriesCache && (now - this.categoriesCache.timestamp) > oneHour) {
            this.categoriesCache = null;
        }
        
        if (this.brandsCache && (now - this.brandsCache.timestamp) > oneHour) {
            this.brandsCache = null;
        }
    }
    
    // Getters
    getCategories() {
        return this.categoriesCache || [];
    }
    
    getBrands() {
        return this.brandsCache || [];
    }
    
    isReady() {
        return this.isInitialized;
    }
}

// Create global instance
const productManager = new ProductManager();

// Periodic cache cleanup
setInterval(() => {
    productManager.cleanupCache();
}, 5 * 60 * 1000); // Every 5 minutes

// Make it globally available
window.productManager = productManager;

export { productManager };