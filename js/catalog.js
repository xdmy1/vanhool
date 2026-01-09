class CatalogManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            search: '',
            category: '',
            minPrice: null,
            maxPrice: null,
            inStock: false,
            featured: false
        };
        this.sortBy = 'name';
        
        this.initEventListeners();
    }

    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.renderFilters();
        this.applyFilters();
    }

    initEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        // Price filters
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        
        if (minPrice) {
            minPrice.addEventListener('input', (e) => {
                this.filters.minPrice = e.target.value ? parseFloat(e.target.value) : null;
                this.debounceFilter();
            });
        }
        
        if (maxPrice) {
            maxPrice.addEventListener('input', (e) => {
                this.filters.maxPrice = e.target.value ? parseFloat(e.target.value) : null;
                this.debounceFilter();
            });
        }

        // Stock filters
        const inStock = document.getElementById('in-stock');
        const featured = document.getElementById('featured');
        
        if (inStock) {
            inStock.addEventListener('change', (e) => {
                this.filters.inStock = e.target.checked;
                this.applyFilters();
            });
        }
        
        if (featured) {
            featured.addEventListener('change', (e) => {
                this.filters.featured = e.target.checked;
                this.applyFilters();
            });
        }

        // Sort
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // Clear filters
        const clearFilters = document.getElementById('clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Pagination
        const prevPage = document.getElementById('prev-page');
        const nextPage = document.getElementById('next-page');
        
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderProducts();
                    this.renderPagination();
                    this.scrollToTop();
                }
            });
        }
        
        if (nextPage) {
            nextPage.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderProducts();
                    this.renderPagination();
                    this.scrollToTop();
                }
            });
        }
    }

    async loadCategories() {
        console.log('🚀 Loading categories from Supabase...');
        
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            
            if (data && data.length > 0) {
                this.categories = data;
                console.log('✅ Loaded categories from Supabase:', data.length);
            } else {
                console.log('⚠️ No categories found in Supabase, using static data');
                this.categories = this.getStaticCategories();
            }
        } catch (error) {
            console.error('❌ Error loading categories from Supabase:', error);
            console.log('📦 Fallback to static categories');
            this.categories = this.getStaticCategories();
        }
    }

    async loadProducts() {
        console.log('🚀 Loading Van Hool products from Supabase...');
        
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories(name_en, name_ro, name_ru, slug),
                    brands(name_en, slug)
                `)
                .eq('is_active', true);

            if (error) throw error;
            
            if (data && data.length > 0) {
                this.products = data;
                console.log('✅ Loaded products from Supabase:', data.length);
            } else {
                console.log('⚠️ No products found in Supabase, using demo data');
                this.products = this.getDemoProducts();
            }
        } catch (error) {
            console.error('❌ Error loading products from Supabase:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            
            // Try to test Supabase connection
            try {
                console.log('🔍 Testing Supabase connection...');
                const { data: testData, error: testError } = await supabase
                    .from('products')
                    .select('count', { count: 'exact', head: true });
                
                if (testError) {
                    console.error('❌ Supabase connection test failed:', testError);
                } else {
                    console.log('✅ Supabase connection OK, total products in DB:', testData);
                }
            } catch (testErr) {
                console.error('❌ Supabase connection test error:', testErr);
            }
            
            console.log('📦 Fallback to demo products due to error');
            this.products = this.getDemoProducts();
        }
    }

    renderFilters() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;

        // Clear existing options except "All Categories"
        const allOption = categoryFilter.querySelector('option[value=""]');
        categoryFilter.innerHTML = '';
        if (allOption) {
            categoryFilter.appendChild(allOption);
        }

        // Add main categories
        const mainCategories = this.categories.filter(cat => !cat.parent_id);
        mainCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = this.getCategoryName(category);
            categoryFilter.appendChild(option);

            // Add subcategories
            const subcategories = this.categories.filter(cat => cat.parent_id === category.id);
            subcategories.forEach(subcat => {
                const subOption = document.createElement('option');
                subOption.value = subcat.id;
                subOption.textContent = `  └ ${this.getCategoryName(subcat)}`;
                categoryFilter.appendChild(subOption);
            });
        });
    }

    getCategoryName(category) {
        const currentLang = translationManager ? translationManager.currentLanguage : 'en';
        switch (currentLang) {
            case 'ro': return category.name_ro;
            case 'ru': return category.name_ru;
            default: return category.name_en;
        }
    }

    getProductName(product) {
        const currentLang = translationManager ? translationManager.currentLanguage : 'en';
        switch (currentLang) {
            case 'ro': return product.name_ro;
            case 'ru': return product.name_ru;
            default: return product.name_en;
        }
    }

    getProductDescription(product) {
        const currentLang = translationManager ? translationManager.currentLanguage : 'en';
        switch (currentLang) {
            case 'ro': return product.description_ro;
            case 'ru': return product.description_ru;
            default: return product.description_en;
        }
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const productName = this.getProductName(product).toLowerCase();
                const productDescription = this.getProductDescription(product)?.toLowerCase() || '';
                const partCode = product.part_code.toLowerCase();
                
                if (!productName.includes(searchTerm) && 
                    !productDescription.includes(searchTerm) && 
                    !partCode.includes(searchTerm)) {
                    return false;
                }
            }

            // Category filter
            if (this.filters.category && product.category_id !== this.filters.category) {
                return false;
            }

            // Price filters
            if (this.filters.minPrice !== null && product.price < this.filters.minPrice) {
                return false;
            }
            
            if (this.filters.maxPrice !== null && product.price > this.filters.maxPrice) {
                return false;
            }

            // Stock filter
            if (this.filters.inStock && product.stock_quantity <= 0) {
                return false;
            }

            // Featured filter
            if (this.filters.featured && !product.is_featured) {
                return false;
            }

            return true;
        });

        this.sortProducts();
        this.currentPage = 1;
        this.renderProducts();
        this.renderPagination();
        this.updateResultsInfo();
    }

    sortProducts() {
        this.filteredProducts.sort((a, b) => {
            switch (this.sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'featured':
                    if (a.is_featured && !b.is_featured) return -1;
                    if (!a.is_featured && b.is_featured) return 1;
                    return this.getProductName(a).localeCompare(this.getProductName(b));
                case 'name':
                default:
                    return this.getProductName(a).localeCompare(this.getProductName(b));
            }
        });
    }

    renderProducts() {
        const grid = document.getElementById('products-grid');
        const loading = document.getElementById('loading-state');
        const noResults = document.getElementById('no-results');
        
        if (!grid) return;

        // Hide loading state
        if (loading) loading.classList.add('hidden');

        if (this.filteredProducts.length === 0) {
            grid.classList.add('hidden');
            if (noResults) noResults.classList.remove('hidden');
            return;
        }

        // Show grid and hide no results
        grid.classList.remove('hidden');
        if (noResults) noResults.classList.add('hidden');

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

        // Render products
        grid.innerHTML = pageProducts.map(product => this.createProductCard(product)).join('');

        // Add event listeners to product cards
        this.addProductCardEventListeners();
    }

    createProductCard(product) {
        const productName = this.getProductName(product);
        const productDescription = this.getProductDescription(product);
        const categoryName = product.category ? this.getCategoryName(product.category) : '';
        const isInStock = product.stock_quantity > 0;
        
        // Get first image or use placeholder
        const images = Array.isArray(product.images) ? product.images : [];
        const imageUrl = images.length > 0 ? images[0] : '/api/placeholder/300/200';
        
        return `
            <div class="product-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden" data-product-id="${product.id}">
                <div class="relative">
                    <img src="${imageUrl}" alt="${productName}" class="w-full h-48 object-cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23f3f4f6\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%236b7280\\'%3EVan Hool Part%3C/text%3E%3C/svg%3E'">
                    ${product.is_featured ? '<span class="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded" data-translate="catalog.featured">Featured</span>' : ''}
                    ${!isInStock ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded" data-translate="catalog.out_of_stock">Out of Stock</span>' : ''}
                </div>
                
                <div class="p-4">
                    <div class="mb-2">
                        <span class="text-xs text-blue-600 font-medium">${product.part_code}</span>
                        ${categoryName ? `<span class="text-xs text-gray-500 ml-2">${categoryName}</span>` : ''}
                    </div>
                    
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">${productName}</h3>
                    
                    ${productDescription ? `<p class="text-sm text-gray-600 mb-3 line-clamp-2">${productDescription}</p>` : ''}
                    
                    <div class="flex items-center justify-between">
                        <span class="text-xl font-bold text-blue-600">€${product.price.toFixed(2)}</span>
                        <div class="flex space-x-2">
                            <button class="view-product-btn p-2 text-gray-400 hover:text-blue-600" data-product-id="${product.id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${isInStock ? `
                                <button class="add-to-cart-btn bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors" data-product-id="${product.id}">
                                    <i class="fas fa-cart-plus mr-2"></i>
                                    <span data-translate="catalog.add_to_cart">Add to Cart</span>
                                </button>
                            ` : `
                                <button class="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed" disabled>
                                    <span data-translate="catalog.out_of_stock">Out of Stock</span>
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addProductCardEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const productId = button.dataset.productId;
                const product = this.products.find(p => p.id === productId);
                
                if (product && cartManager) {
                    await cartManager.addToCart(product);
                }
            });
        });

        // View product buttons
        document.querySelectorAll('.view-product-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = button.dataset.productId;
                const product = this.products.find(p => p.id === productId);
                
                if (product) {
                    window.location.href = `product.html?id=${product.id}&slug=${product.slug}`;
                }
            });
        });

        // Product card click
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                const product = this.products.find(p => p.id === productId);
                
                if (product) {
                    window.location.href = `product.html?id=${product.id}&slug=${product.slug}`;
                }
            });
        });
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageNumbers = document.getElementById('page-numbers');
        
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.classList.add('hidden');
            return;
        }

        pagination.classList.remove('hidden');

        // Update navigation buttons
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }

        // Generate page numbers
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = `px-3 py-2 text-sm rounded-lg ${i === this.currentPage ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`;
                    pageBtn.textContent = i;
                    pageBtn.addEventListener('click', () => {
                        this.currentPage = i;
                        this.renderProducts();
                        this.renderPagination();
                        this.scrollToTop();
                    });
                    pageNumbers.appendChild(pageBtn);
                } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                    const dots = document.createElement('span');
                    dots.className = 'px-2 text-gray-400';
                    dots.textContent = '...';
                    pageNumbers.appendChild(dots);
                }
            }
        }
    }

    updateResultsInfo() {
        const resultsInfo = document.getElementById('results-info');
        if (!resultsInfo) return;

        const total = this.filteredProducts.length;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, total);
        
        if (total === 0) {
            resultsInfo.textContent = 'No products found';
        } else {
            resultsInfo.textContent = `Showing ${startIndex}-${endIndex} of ${total} products`;
        }
    }

    clearFilters() {
        // Reset filter values
        this.filters = {
            search: '',
            category: '',
            minPrice: null,
            maxPrice: null,
            inStock: false,
            featured: false
        };
        this.sortBy = 'name';

        // Reset form elements
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) categoryFilter.value = '';

        const minPrice = document.getElementById('min-price');
        if (minPrice) minPrice.value = '';

        const maxPrice = document.getElementById('max-price');
        if (maxPrice) maxPrice.value = '';

        const inStock = document.getElementById('in-stock');
        if (inStock) inStock.checked = false;

        const featured = document.getElementById('featured');
        if (featured) featured.checked = false;

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'name';

        // Apply filters
        this.applyFilters();
    }

    debounceFilter() {
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => {
            this.currentPage = 1;
            this.applyFilters();
        }, 500);
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showError(message) {
        const grid = document.getElementById('products-grid');
        const loading = document.getElementById('loading-state');
        
        if (loading) loading.classList.add('hidden');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
                    <p class="text-gray-600">${message}</p>
                </div>
            `;
            grid.classList.remove('hidden');
        }
    }

    // Fallback methods for when Supabase is not available
    getStaticCategories() {
        return [
            { id: '1', slug: 'brake-system', name_en: 'Brake System', name_ro: 'Sistem de Frânare', name_ru: 'Тормозная система', parent_id: null, sort_order: 1 },
            { id: '2', slug: 'air-pressure', name_en: 'Air Pressure', name_ro: 'Presiune Aer', name_ru: 'Пневматическая система', parent_id: null, sort_order: 2 },
            { id: '3', slug: 'chassis-suspension', name_en: 'Chassis & Suspension', name_ro: 'Șasiu și Suspensie', name_ru: 'Шасси и подвеска', parent_id: null, sort_order: 3 }
        ];
    }

    getDemoProducts() {
        return [
            {
                id: '1',
                slug: 'brake-pad-front-vanhool-ag300',
                part_code: 'VH-BP-F-AG300-001',
                name_en: 'Front Brake Pads Van Hool AG300',
                name_ro: 'Plăcuțe Frână Față Van Hool AG300',
                name_ru: 'Передние тормозные колодки Van Hool AG300',
                description_en: 'OEM quality front brake pads for Van Hool AG300 bus series. Compatible with models 2010-2020.',
                description_ro: 'Plăcuțe de frână față de calitate OEM pentru seria de autobuze Van Hool AG300. Compatibile cu modelele 2010-2020.',
                description_ru: 'Передние тормозные колодки OEM качества для серии автобусов Van Hool AG300. Совместимы с моделями 2010-2020.',
                category_id: '1',
                price: 299.99,
                stock_quantity: 15,
                is_featured: true,
                is_active: true,
                images: [],
                category: { id: '1', name_en: 'Brake System', name_ro: 'Sistem de Frânare', name_ru: 'Тормозная система' }
            },
            {
                id: '2',
                slug: 'air-compressor-vanhool-a330',
                part_code: 'VH-AC-A330-002',
                name_en: 'Air Compressor Van Hool A330',
                name_ro: 'Compresor Aer Van Hool A330',
                name_ru: 'Воздушный компрессор Van Hool A330',
                description_en: 'Genuine air compressor for Van Hool A330 articulated buses. Essential for pneumatic systems.',
                description_ro: 'Compresor de aer original pentru autobuzele articulate Van Hool A330. Esențial pentru sistemele pneumatice.',
                description_ru: 'Оригинальный воздушный компрессор для сочлененных автобусов Van Hool A330. Необходим для пневматических систем.',
                category_id: '2',
                price: 1299.99,
                stock_quantity: 5,
                is_featured: true,
                is_active: true,
                images: [],
                category: { id: '2', name_en: 'Air Pressure', name_ro: 'Presiune Aer', name_ru: 'Пневматическая система' }
            },
            {
                id: '3',
                slug: 'shock-absorber-rear-vanhool-exquicity',
                part_code: 'VH-SA-EX-003',
                name_en: 'Rear Shock Absorber Van Hool ExquiCity',
                name_ro: 'Amortizor Spate Van Hool ExquiCity',
                name_ru: 'Задний амортизатор Van Hool ExquiCity',
                description_en: 'Premium rear shock absorber for Van Hool ExquiCity electric buses. Designed for urban comfort.',
                description_ro: 'Amortizor spate premium pentru autobuzele electrice Van Hool ExquiCity. Conceput pentru confortul urban.',
                description_ru: 'Премиальный задний амортизатор для электрических автобусов Van Hool ExquiCity. Разработан для городского комфорта.',
                category_id: '3',
                price: 459.99,
                stock_quantity: 8,
                is_featured: false,
                is_active: true,
                images: [],
                category: { id: '3', name_en: 'Chassis & Suspension', name_ro: 'Șasiu și Suspensie', name_ru: 'Шасси и подвеска' }
            },
            {
                id: '4',
                slug: 'door-seal-vanhool-newag300',
                part_code: 'VH-DS-NAG-004',
                name_en: 'Door Seal Van Hool New AG300',
                name_ro: 'Garnitură Ușă Van Hool New AG300',
                name_ru: 'Уплотнитель двери Van Hool New AG300',
                description_en: 'Weather-resistant door seal for Van Hool New AG300. Ensures passenger comfort and energy efficiency.',
                description_ro: 'Garnitură de ușă rezistentă la intemperii pentru Van Hool New AG300. Asigură confortul pasagerilor și eficiența energetică.',
                description_ru: 'Погодостойкий уплотнитель двери для Van Hool New AG300. Обеспечивает комфорт пассажиров и энергоэффективность.',
                category_id: '4',
                price: 89.99,
                stock_quantity: 25,
                is_featured: false,
                is_active: true,
                images: [],
                category: { id: '4', name_en: 'Body & Interior', name_ro: 'Caroserie și Interior', name_ru: 'Кузов и интерьер' }
            },
            {
                id: '5',
                slug: 'radiator-vanhool-tx-series',
                part_code: 'VH-RAD-TX-005',
                name_en: 'Radiator Van Hool TX Series',
                name_ro: 'Radiator Van Hool Seria TX',
                name_ru: 'Радиатор Van Hool серия TX',
                description_en: 'High-performance radiator for Van Hool TX tourist coaches. Optimal cooling for long-distance travel.',
                description_ro: 'Radiator de înaltă performanță pentru autocarele turistice Van Hool TX. Răcire optimă pentru călătoriile pe distanțe lungi.',
                description_ru: 'Высокопроизводительный радиатор для туристических автобусов Van Hool TX. Оптимальное охлаждение для дальних поездок.',
                category_id: '5',
                price: 899.99,
                stock_quantity: 3,
                is_featured: true,
                is_active: true,
                images: [],
                category: { id: '5', name_en: 'Engine & Cooling', name_ro: 'Motor și Răcire', name_ru: 'Двигатель и охлаждение' }
            }
        ];
    }
}

// Initialize catalog manager
const catalogManager = new CatalogManager();