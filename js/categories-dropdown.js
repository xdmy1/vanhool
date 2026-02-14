// Enhanced Categories Dropdown System for Van Hool Parts
// Works on both mobile and desktop with subcategories

// Global variables
window.allCategoriesForDropdown = null;

// Category icons mapping
const categoryIcons = {
    'brakes': 'fas fa-stop-circle',
    'air-pressure': 'fas fa-wind',
    'chassis-suspension': 'fas fa-car-side',
    'electro': 'fas fa-bolt',
    'engine-extension': 'fas fa-cog',
    'clutch-gearbox': 'fas fa-cogs',
    'steering-axle-hubs': 'fas fa-steering-wheel',
    'bodywork': 'fas fa-car',
    'air-conditioning-heating': 'fas fa-thermometer-half',
    'interior': 'fas fa-chair',
    'silicone-pipe': 'fas fa-grip-lines',
    'abc-raufoss-air-couplings': 'fas fa-plug'
};

// Load categories and populate dropdown
async function loadEnhancedCategoriesDropdown() {
    try {
        const { data: allCategories, error } = await window.supabase
            .from('categories')
            .select('*')
            .order('sort_order');
        
        if (error) {
            console.error('Error loading categories:', error);
            return;
        }

        const parentCategories = allCategories?.filter(cat => !cat.parent_id) || [];
        const subcategories = allCategories?.filter(cat => cat.parent_id) || [];
        
        // Store globally for mobile functions
        window.allCategoriesForDropdown = allCategories;
        
        const dropdownContent = document.getElementById('categories-dropdown');
        if (dropdownContent && parentCategories.length > 0) {
            dropdownContent.innerHTML = createEnhancedCategoriesDropdown(parentCategories, subcategories);
        } else if (dropdownContent) {
            // Fallback to static content if no categories
            dropdownContent.innerHTML = getStaticCategoriesDropdown();
        }
        
    } catch (error) {
        console.error('Error loading categories for dropdown:', error);
    }
}

// Create compact dropdown HTML with proper hover behavior
function createEnhancedCategoriesDropdown(categories, subcategories) {
    return `
        <div class="py-3">
            <div class="grid grid-cols-2 gap-2">
                ${categories.map(category => {
                    const categorySubcats = subcategories.filter(sub => sub.parent_id === category.id);
                    const icon = categoryIcons[category.slug] || 'fas fa-cog';
                    
                    return `
                        <div class="relative group/category">
                            <div class="flex items-center p-2 rounded-lg hover:bg-blue-50 border transition-colors cursor-pointer" 
                               onclick="handleCategoryClick(event, '${category.slug}')"
                               ontouchstart="handleCategoryTouch(event, '${category.slug}')">
                                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                                    <i class="${icon} text-blue-600 text-sm"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-sm truncate">${category.name_en || category.name || 'Unknown'}</div>
                                    <div class="text-xs text-gray-500">${categorySubcats.length} items</div>
                                </div>
                                ${categorySubcats.length > 0 ? '<i class="fas fa-chevron-right text-xs text-gray-400 group-hover/category:text-blue-600 transition-transform duration-200"></i>' : ''}
                            </div>
                            ${categorySubcats.length > 0 ? `
                                <!-- Desktop Hover Subcategories -->
                                <div class="absolute left-full top-0 ml-1 w-56 bg-white border rounded-lg shadow-xl opacity-0 invisible group-hover/category:opacity-100 group-hover/category:visible transition-all duration-200 z-[80] hidden lg:block">
                                    <div class="p-2">
                                        <div class="text-xs font-semibold text-gray-700 mb-2 px-2 flex items-center">
                                            <i class="${icon} text-blue-600 mr-1 text-xs"></i>
                                            ${category.name_en || category.name || 'Unknown'}
                                        </div>
                                        <div class="max-h-48 overflow-y-auto">
                                            ${categorySubcats.map(subcat => `
                                                <a href="catalog.html?category=${subcat.slug}" class="block px-2 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors">
                                                    ${subcat.name_en || subcat.name || 'Unknown'}
                                                </a>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                                <!-- Mobile Dropdown -->
                                <div id="mobile-subcats-${category.id}" class="lg:hidden mt-1 bg-gray-50 rounded border hidden">
                                    <div class="p-2">
                                        ${categorySubcats.map(subcat => `
                                            <a href="catalog.html?category=${subcat.slug}" class="block px-2 py-1 text-sm text-gray-600 hover:bg-white hover:text-blue-600 rounded transition-colors">
                                                • ${subcat.name_en || subcat.name || 'Unknown'}
                                            </a>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Handle category clicks for mobile/desktop
function handleCategoryClick(event, categorySlug) {
    // On mobile, if there are subcategories, show them instead of navigating
    if (window.innerWidth < 1024) { // lg breakpoint
        const subcatsDiv = document.getElementById(`mobile-subcats-${getCategoryIdBySlug(categorySlug)}`);
        if (subcatsDiv) {
            event.preventDefault();
            
            // Toggle visibility
            const isHidden = subcatsDiv.classList.contains('hidden');
            
            // Hide all other mobile subcategories
            document.querySelectorAll('[id^="mobile-subcats-"]').forEach(div => {
                div.classList.add('hidden');
                // Reset all chevrons
                const parentLink = div.parentElement.querySelector('a');
                if (parentLink) {
                    const chevron = parentLink.querySelector('.fa-chevron-right');
                    if (chevron) chevron.style.transform = 'rotate(0deg)';
                }
            });
            
            // Show this one if it was hidden
            if (isHidden) {
                subcatsDiv.classList.remove('hidden');
                
                // Rotate chevron
                const chevron = event.currentTarget.querySelector('.fa-chevron-right');
                if (chevron) {
                    chevron.style.transform = 'rotate(90deg)';
                }
            } else {
                // Reset chevron
                const chevron = event.currentTarget.querySelector('.fa-chevron-right');
                if (chevron) {
                    chevron.style.transform = 'rotate(0deg)';
                }
            }
        }
    }
    // On desktop, normal navigation happens via the href
}

// Handle touch events for better mobile experience
function handleCategoryTouch(event, categorySlug) {
    // This helps with touch responsiveness on mobile
    if (window.innerWidth < 1024) {
        event.preventDefault();
    }
}

// Helper function to get category ID by slug (needed for mobile subcategories)
function getCategoryIdBySlug(slug) {
    if (window.allCategoriesForDropdown) {
        const category = window.allCategoriesForDropdown.find(cat => cat.slug === slug && !cat.parent_id);
        return category ? category.id : null;
    }
    return null;
}

// Fallback static content
function getStaticCategoriesDropdown() {
    return `
        <div class="py-4">
            <h4 class="font-semibold mb-4 text-center">Van Hool Parts Categories</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <div class="text-center text-gray-500 py-8">
                    Loading categories...
                </div>
            </div>
        </div>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only load if we have supabase and categories dropdown element
    if (window.supabase && document.getElementById('categories-dropdown')) {
        loadEnhancedCategoriesDropdown();
    }
});