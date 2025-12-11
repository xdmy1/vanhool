class ProductDetailManager {
    constructor() {
        this.product = null;
        this.relatedProducts = [];
        this.reviews = [];
        this.currentImageIndex = 0;
        this.productId = null;
        this.quantity = 1;
        
        this.initEventListeners();
    }

    async init() {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('id');
        
        if (!this.productId) {
            this.showProductNotFound();
            return;
        }

        try {
            await this.loadProduct();
            await this.loadRelatedProducts();
            await this.loadReviews();
            this.renderProduct();
        } catch (error) {
            console.error('Error loading product:', error);
            this.showProductNotFound();
        }
    }

    initEventListeners() {
        // Quantity controls
        const quantityDecrease = document.getElementById('quantity-decrease');
        const quantityIncrease = document.getElementById('quantity-increase');
        const quantityInput = document.getElementById('quantity');

        if (quantityDecrease) {
            quantityDecrease.addEventListener('click', () => {
                const input = document.getElementById('quantity');
                const currentValue = parseInt(input.value) || 1;
                if (currentValue > 1) {
                    input.value = currentValue - 1;
                    this.quantity = currentValue - 1;
                    this.updateQuantityControls();
                }
            });
        }

        if (quantityIncrease) {
            quantityIncrease.addEventListener('click', () => {
                const input = document.getElementById('quantity');
                const currentValue = parseInt(input.value) || 1;
                const maxStock = this.product ? this.product.stock_quantity : 999;
                if (currentValue < maxStock) {
                    input.value = currentValue + 1;
                    this.quantity = currentValue + 1;
                    this.updateQuantityControls();
                }
            });
        }

        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                const value = parseInt(e.target.value) || 1;
                const maxStock = this.product ? this.product.stock_quantity : 999;
                const newQuantity = Math.max(1, Math.min(value, maxStock));
                e.target.value = newQuantity;
                this.quantity = newQuantity;
                this.updateQuantityControls();
            });
        }

        // Add to cart
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        }

        // Wishlist
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => this.handleWishlist());
        }
    }

    async loadProduct() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    category:categories(*)
                `)
                .eq('id', this.productId)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            this.product = data;
        } catch (error) {
            console.error('Error loading product:', error);
            // Fallback to demo product for development
            this.product = this.getDemoProduct();
        }
    }

    async loadRelatedProducts() {
        if (!this.product) return;

        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    id,
                    slug,
                    part_code,
                    name_en,
                    name_ro,
                    name_ru,
                    price,
                    stock_quantity,
                    is_featured,
                    images,
                    category:categories(name_en, name_ro, name_ru)
                `)
                .eq('category_id', this.product.category_id)
                .neq('id', this.product.id)
                .eq('is_active', true)
                .limit(4);

            if (error) throw error;
            this.relatedProducts = data || [];
        } catch (error) {
            console.error('Error loading related products:', error);
            this.relatedProducts = [];
        }
    }

    async loadReviews() {
        if (!this.product) return;

        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    user:profiles(first_name, last_name)
                `)
                .eq('product_id', this.productId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.reviews = data || [];
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.reviews = [];
        }
    }

    renderProduct() {
        if (!this.product) {
            this.showProductNotFound();
            return;
        }

        this.updatePageMeta();
        this.renderProductInfo();
        this.renderProductImages();
        this.renderSpecifications();
        this.renderCompatibility();
        this.renderRelatedProducts();
        this.renderReviews();
        this.showProductContent();
    }

    updatePageMeta() {
        const productName = this.getProductName(this.product);
        const productDescription = this.getProductDescription(this.product);
        
        document.title = `${productName} - ${this.product.part_code} - Van Hool Parts`;
        document.getElementById('page-title').textContent = `${productName} - Van Hool Parts`;
        document.getElementById('page-description').content = productDescription || `${productName} - Van Hool bus part ${this.product.part_code}`;

        // Update breadcrumb
        document.getElementById('breadcrumb-product').textContent = productName;
        
        if (this.product.category) {
            const categoryName = this.getCategoryName(this.product.category);
            document.getElementById('category-name').textContent = categoryName;
            document.getElementById('breadcrumb-category').classList.remove('hidden');
        }
    }

    renderProductInfo() {
        const productName = this.getProductName(this.product);
        const productDescription = this.getProductDescription(this.product);
        
        // Basic info
        document.getElementById('part-code').textContent = this.product.part_code;
        document.getElementById('product-name').textContent = productName;
        document.getElementById('product-price').textContent = this.product.price.toFixed(2);
        
        if (this.product.category) {
            document.getElementById('product-category').textContent = this.getCategoryName(this.product.category);
        }

        // Description
        const descriptionElement = document.getElementById('product-description');
        if (productDescription) {
            descriptionElement.innerHTML = `<p>${productDescription}</p>`;
        } else {
            descriptionElement.innerHTML = `<p class="text-gray-500">No description available.</p>`;
        }

        // Badges
        this.renderProductBadges();

        // Stock status
        this.renderStockStatus();

        // Update quantity controls
        this.updateQuantityControls();

        // Authentication check for cart
        this.updateCartSection();
    }

    renderProductBadges() {
        const badgesContainer = document.getElementById('product-badges');
        const badges = [];

        if (this.product.is_featured) {
            badges.push('<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Featured</span>');
        }

        if (this.product.stock_quantity <= 5 && this.product.stock_quantity > 0) {
            badges.push('<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Low Stock</span>');
        }

        if (this.product.stock_quantity <= 0) {
            badges.push('<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>');
        }

        badgesContainer.innerHTML = badges.join('');
    }

    renderStockStatus() {
        const stockContainer = document.getElementById('stock-status');
        const isInStock = this.product.stock_quantity > 0;

        if (isInStock) {
            stockContainer.innerHTML = `
                <div class="flex items-center text-green-600">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>In stock (${this.product.stock_quantity} available)</span>
                </div>
            `;
        } else {
            stockContainer.innerHTML = `
                <div class="flex items-center text-red-600">
                    <i class="fas fa-times-circle mr-2"></i>
                    <span>Out of stock</span>
                </div>
            `;
        }
    }

    renderProductImages() {
        const mainImage = document.getElementById('main-image');
        const thumbnailsContainer = document.getElementById('image-thumbnails');
        
        let images = [];
        if (Array.isArray(this.product.images) && this.product.images.length > 0) {
            images = this.product.images;
        } else {
            // Placeholder image
            images = ['data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'600\' viewBox=\'0 0 600 600\'%3E%3Crect width=\'600\' height=\'600\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%236b7280\' font-size=\'24\'%3EVan Hool Part%3C/text%3E%3C/svg%3E'];
        }

        // Set main image
        mainImage.src = images[this.currentImageIndex];
        mainImage.alt = this.getProductName(this.product);

        // Render thumbnails if more than one image
        if (images.length > 1) {
            const thumbnails = images.map((image, index) => `
                <button class="aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${index === this.currentImageIndex ? 'ring-2 ring-blue-500' : ''}" 
                        onclick="productDetailManager.setCurrentImage(${index})">
                    <img src="${image}" 
                         alt="Product thumbnail ${index + 1}" 
                         class="w-full h-full object-center object-cover">
                </button>
            `).join('');
            
            thumbnailsContainer.innerHTML = thumbnails;
        }
    }

    renderSpecifications() {
        const specificationsContent = document.getElementById('specifications-content');
        
        if (this.product.specifications && Object.keys(this.product.specifications).length > 0) {
            const specs = Object.entries(this.product.specifications).map(([key, value]) => `
                <div class="flex justify-between py-2 border-b border-gray-200">
                    <span class="font-medium text-gray-900">${this.formatSpecKey(key)}:</span>
                    <span class="text-gray-700">${value}</span>
                </div>
            `).join('');
            
            specificationsContent.innerHTML = `<div class="space-y-0">${specs}</div>`;
        } else {
            specificationsContent.innerHTML = '<p class="text-gray-500">No specifications available.</p>';
        }
    }

    renderCompatibility() {
        const compatibilityContent = document.getElementById('compatibility-content');
        
        if (this.product.compatibility && Array.isArray(this.product.compatibility) && this.product.compatibility.length > 0) {
            const compatibilityList = this.product.compatibility.map(item => `
                <li class="flex items-center text-gray-700">
                    <i class="fas fa-check text-green-500 mr-2"></i>
                    ${item}
                </li>
            `).join('');
            
            compatibilityContent.innerHTML = `<ul class="space-y-2">${compatibilityList}</ul>`;
        } else {
            compatibilityContent.innerHTML = '<p class="text-gray-500">Compatibility information not available.</p>';
        }
    }

    renderRelatedProducts() {
        const relatedContainer = document.getElementById('related-products');
        
        if (this.relatedProducts.length === 0) {
            document.getElementById('related-products-section').style.display = 'none';
            return;
        }

        const productsHtml = this.relatedProducts.map(product => {
            const productName = this.getProductName(product);
            const isInStock = product.stock_quantity > 0;
            const images = Array.isArray(product.images) ? product.images : [];
            const imageUrl = images.length > 0 ? images[0] : '/api/placeholder/300/200';
            
            return `
                <div class="product-card bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer" 
                     onclick="window.location.href='product.html?id=${product.id}&slug=${product.slug}'">
                    <div class="relative">
                        <img src="${imageUrl}" alt="${productName}" class="w-full h-48 object-cover" 
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'200\\' viewBox=\\'0 0 300 200\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23f3f4f6\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%236b7280\\'%3EVan Hool Part%3C/text%3E%3C/svg%3E'">
                        ${product.is_featured ? '<span class="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">Featured</span>' : ''}
                        ${!isInStock ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">Out of Stock</span>' : ''}
                    </div>
                    
                    <div class="p-4">
                        <div class="mb-2">
                            <span class="text-xs text-blue-600 font-medium">${product.part_code}</span>
                        </div>
                        
                        <h3 class="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">${productName}</h3>
                        
                        <div class="flex items-center justify-between">
                            <span class="text-lg font-bold text-blue-600">€${product.price.toFixed(2)}</span>
                            <button class="text-sm text-blue-600 hover:text-blue-800">View →</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        relatedContainer.innerHTML = productsHtml;
    }

    renderReviews() {
        this.renderReviewsSummary();
        this.renderReviewForm();
        this.renderReviewsList();
    }

    renderReviewsSummary() {
        const summaryContainer = document.getElementById('reviews-summary');
        const reviewsSection = document.getElementById('reviews-section');
        
        if (this.reviews.length === 0) {
            summaryContainer.innerHTML = '<p class="text-gray-500">No reviews yet. Be the first to review this product!</p>';
            reviewsSection.style.display = 'none';
            return;
        }

        // Calculate average rating
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / this.reviews.length;
        
        // Update rating display
        document.getElementById('rating-value').textContent = averageRating.toFixed(1);
        document.getElementById('review-count').textContent = this.reviews.length;
        
        // Render stars
        this.renderStars(document.getElementById('rating-stars'), averageRating);
        
        // Show detailed breakdown
        const ratingBreakdown = this.calculateRatingBreakdown();
        summaryContainer.innerHTML = `
            <div class="flex items-center space-x-8">
                <div class="text-center">
                    <div class="text-4xl font-bold text-gray-900">${averageRating.toFixed(1)}</div>
                    <div class="mt-1">${this.renderStarsHTML(averageRating)}</div>
                    <div class="text-sm text-gray-500 mt-1">${this.reviews.length} review${this.reviews.length !== 1 ? 's' : ''}</div>
                </div>
                <div class="flex-1 max-w-md">
                    ${ratingBreakdown.map(item => `
                        <div class="flex items-center text-sm mb-2">
                            <span class="w-3 text-gray-600">${item.stars}</span>
                            <div class="mx-3 flex-1 bg-gray-200 rounded-full h-2">
                                <div class="bg-yellow-400 h-2 rounded-full" style="width: ${item.percentage}%"></div>
                            </div>
                            <span class="w-8 text-gray-600 text-right">${item.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderReviewForm() {
        const formContainer = document.getElementById('review-form-section');
        
        if (!authManager || !authManager.isAuthenticated()) {
            formContainer.innerHTML = `
                <div class="bg-gray-50 rounded-lg p-6 text-center">
                    <p class="text-gray-600 mb-4">Sign in to write a review</p>
                    <a href="login.html" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign In</a>
                </div>
            `;
            return;
        }

        // Check if user already reviewed this product
        const user = authManager.getCurrentUser();
        const hasReviewed = this.reviews.some(review => review.user_id === user.id);
        
        if (hasReviewed) {
            formContainer.innerHTML = `
                <div class="bg-green-50 rounded-lg p-6 text-center">
                    <p class="text-green-800">Thank you for your review!</p>
                </div>
            `;
            return;
        }

        formContainer.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">Write a Review</h4>
                <form id="review-form">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div class="flex space-x-1" id="review-rating">
                            ${[1,2,3,4,5].map(i => `<button type="button" class="rating-star text-2xl text-gray-300 hover:text-yellow-400" data-rating="${i}">★</button>`).join('')}
                        </div>
                    </div>
                    <div class="mb-4">
                        <label for="review-title" class="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input type="text" id="review-title" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="mb-4">
                        <label for="review-content" class="block text-sm font-medium text-gray-700 mb-2">Review</label>
                        <textarea id="review-content" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Submit Review</button>
                </form>
            </div>
        `;

        this.initReviewForm();
    }

    renderReviewsList() {
        const listContainer = document.getElementById('reviews-list');
        
        if (this.reviews.length === 0) {
            return;
        }

        const reviewsHtml = this.reviews.map(review => `
            <div class="border-b border-gray-200 pb-6 mb-6">
                <div class="flex items-start justify-between">
                    <div>
                        <div class="flex items-center">
                            <span class="font-medium text-gray-900">${review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous'}</span>
                            <div class="ml-3">${this.renderStarsHTML(review.rating)}</div>
                        </div>
                        <div class="mt-1 text-sm text-gray-500">${new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
                ${review.title ? `<h5 class="font-medium text-gray-900 mt-3">${review.title}</h5>` : ''}
                <p class="mt-2 text-gray-700">${review.content}</p>
            </div>
        `).join('');

        listContainer.innerHTML = reviewsHtml;
    }

    async handleAddToCart() {
        if (!authManager || !authManager.isAuthenticated()) {
            document.getElementById('login-required').classList.remove('hidden');
            return;
        }

        if (!this.product || this.product.stock_quantity <= 0) {
            return;
        }

        const addToCartBtn = document.getElementById('add-to-cart-btn');
        const originalText = addToCartBtn.innerHTML;
        
        try {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding...';
            
            if (cartManager) {
                await cartManager.addToCart(this.product, this.quantity);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Show error message
        } finally {
            addToCartBtn.disabled = false;
            addToCartBtn.innerHTML = originalText;
        }
    }

    async handleWishlist() {
        if (!authManager || !authManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Implement wishlist functionality
        console.log('Add to wishlist:', this.product.id);
    }

    updateQuantityControls() {
        const decreaseBtn = document.getElementById('quantity-decrease');
        const increaseBtn = document.getElementById('quantity-increase');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        
        if (decreaseBtn) {
            decreaseBtn.disabled = this.quantity <= 1;
        }
        
        if (increaseBtn) {
            const maxStock = this.product ? this.product.stock_quantity : 999;
            increaseBtn.disabled = this.quantity >= maxStock;
        }
        
        if (addToCartBtn) {
            const isInStock = this.product && this.product.stock_quantity > 0;
            addToCartBtn.disabled = !isInStock;
        }
    }

    updateCartSection() {
        const loginRequired = document.getElementById('login-required');
        const isAuthenticated = authManager && authManager.isAuthenticated();
        
        if (!isAuthenticated) {
            loginRequired.classList.remove('hidden');
        } else {
            loginRequired.classList.add('hidden');
        }
    }

    setCurrentImage(index) {
        this.currentImageIndex = index;
        this.renderProductImages();
    }

    // Utility methods
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

    getCategoryName(category) {
        const currentLang = translationManager ? translationManager.currentLanguage : 'en';
        switch (currentLang) {
            case 'ro': return category.name_ro;
            case 'ru': return category.name_ru;
            default: return category.name_en;
        }
    }

    formatSpecKey(key) {
        return key.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    renderStars(container, rating) {
        if (!container) return;
        
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star text-yellow-400"></i>';
        }
        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star text-yellow-400"></i>';
        }
        
        container.innerHTML = starsHtml;
    }

    renderStarsHTML(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star text-yellow-400"></i>';
        }
        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star text-yellow-400"></i>';
        }
        
        return starsHtml;
    }

    calculateRatingBreakdown() {
        const breakdown = [5, 4, 3, 2, 1].map(stars => {
            const count = this.reviews.filter(review => review.rating === stars).length;
            const percentage = this.reviews.length > 0 ? (count / this.reviews.length) * 100 : 0;
            return { stars, count, percentage };
        });
        return breakdown;
    }

    initReviewForm() {
        const form = document.getElementById('review-form');
        const ratingStars = document.querySelectorAll('.rating-star');
        let selectedRating = 0;

        // Star rating interaction
        ratingStars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                ratingStars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.remove('text-gray-300');
                        s.classList.add('text-yellow-400');
                    } else {
                        s.classList.remove('text-yellow-400');
                        s.classList.add('text-gray-300');
                    }
                });
            });
        });

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (selectedRating === 0) {
                    alert('Please select a rating');
                    return;
                }

                const title = document.getElementById('review-title').value;
                const content = document.getElementById('review-content').value;
                
                if (!content.trim()) {
                    alert('Please write a review');
                    return;
                }

                try {
                    // Submit review to Supabase
                    const user = authManager.getCurrentUser();
                    const { error } = await supabase
                        .from('reviews')
                        .insert({
                            product_id: this.productId,
                            user_id: user.id,
                            rating: selectedRating,
                            title: title,
                            content: content
                        });

                    if (error) throw error;

                    // Reload reviews
                    await this.loadReviews();
                    this.renderReviews();
                    
                    alert('Review submitted successfully! It will be visible after approval.');
                } catch (error) {
                    console.error('Error submitting review:', error);
                    alert('Failed to submit review. Please try again.');
                }
            });
        }
    }

    showProductNotFound() {
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('product-not-found').classList.remove('hidden');
    }

    showProductContent() {
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('product-content').classList.remove('hidden');
    }

    // Fallback demo product for development
    getDemoProduct() {
        return {
            id: '1',
            slug: 'brake-pad-front-vanhool',
            part_code: 'VH-BP-F-001',
            name_en: 'Front Brake Pads Van Hool',
            name_ro: 'Plăcuțe Frână Față Van Hool',
            name_ru: 'Передние тормозные колодки Van Hool',
            description_en: 'High-quality front brake pads specifically designed for Van Hool buses. OEM specification with excellent stopping power and durability.',
            description_ro: 'Plăcuțe de frână față de înaltă calitate special concepute pentru autobuzele Van Hool. Specificație OEM cu putere de frânare excelentă și durabilitate.',
            description_ru: 'Высококачественные передние тормозные колодки, специально разработанные для автобусов Van Hool. Спецификация OEM с отличной тормозной мощностью и долговечностью.',
            category_id: '1',
            price: 299.99,
            stock_quantity: 15,
            is_featured: true,
            is_active: true,
            images: [],
            specifications: {
                'material': 'Ceramic',
                'width': '150mm',
                'height': '60mm',
                'thickness': '18mm',
                'weight': '2.5kg'
            },
            compatibility: [
                'Van Hool AG300',
                'Van Hool A330',
                'Van Hool A360',
                'Van Hool EX series'
            ],
            category: {
                id: '1',
                name_en: 'Brake System',
                name_ro: 'Sistem de Frânare',
                name_ru: 'Тормозная система'
            }
        };
    }
}

// Initialize product detail manager
const productDetailManager = new ProductDetailManager();