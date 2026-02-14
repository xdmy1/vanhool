// Universal Inter Bus Parts App System
// This connects all pages and functionality together

console.log('🔥 Universal App System Loading...');

// Initialize Supabase globally with retry mechanism
function initializeGlobalSupabase() {
    try {
        // Check if already initialized
        if (window.supabase && window.supabase.auth) {
            console.log('✅ Supabase already initialized');
            return true;
        }

        // Check if the library is available
        if (typeof window.supabase !== 'undefined') {
            // If it's a constructor function from CDN
            if (typeof window.supabase.createClient === 'function') {
                window.supabase = window.supabase.createClient(
                    'https://iqsfmofoezkdnmhbxwbn.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2Ztb2ZvZXprZG5taGJ4d2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA3MTksImV4cCI6MjA3OTEyNjcxOX0.w6BinbOGMZPTxyQ2e65bnSuEyHuEeQ59NQOPOtDW56I'
                );
                console.log('✅ Global Supabase client initialized with createClient');
                return true;
            }
            // If it's already an instance (some CDN versions work this way)
            else if (window.supabase.auth) {
                console.log('✅ Supabase instance already available');
                return true;
            }
        }

        console.warn('⚠️ Supabase library not yet available');
        return false;
    } catch (error) {
        console.error('❌ Error initializing global Supabase:', error);
        return false;
    }
}

// Progressive initialization with multiple attempts
let supabaseInitAttempts = 0;
const maxInitAttempts = 10;

function tryInitializeSupabase() {
    if (initializeGlobalSupabase() || supabaseInitAttempts >= maxInitAttempts) {
        return;
    }
    
    supabaseInitAttempts++;
    setTimeout(tryInitializeSupabase, 100 * supabaseInitAttempts);
}

// Start initialization attempts immediately
tryInitializeSupabase();

// Global App State
window.InterBusApp = {
    currentUser: null,
    currentLanguage: localStorage.getItem('interbus_language') || 'en',
    cart: JSON.parse(localStorage.getItem('interbus_cart')) || [],
    categories: [],
    isAdmin: false
};

// Create alias for backward compatibility
window.VanHoolApp = window.InterBusApp;

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
        hero_title: "Rare Inter Bus Bus Parts",
        hero_subtitle: "Specialized supplier of authentic Inter Bus parts. Hard-to-find components for all Inter Bus bus models with worldwide shipping.",
        view_catalog: "View Catalog",
        contact_us: "Contact Us",
        parts_available: "Parts Available",
        countries_served: "Countries Served",
        years_experience: "Years Experience",
        
        // Categories
        popular_categories: "Popular Categories",
        featured_parts: "Featured Parts",
        featured_parts_desc: "Discover our most popular Inter Bus parts. All parts come with detailed specifications and authentic part numbers.",
        see_all_parts: "See All Parts",
        
        // Catalog
        title: "Inter Bus Parts Catalog",
        subtitle: "Find the perfect part for your Inter Bus bus",
        filters: "Filters",
        search: "Search",
        search_placeholder: "Search by part code or name...",
        category: "Category",
        all_categories: "All Categories",
        price_range: "Price Range",
        price_min: "Min",
        price_max: "Max",
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
        
        // Home page additions
        about_inter_bus: "About Inter Bus",
        about_description: "Inter Bus is your trusted supplier of authentic bus parts and components worldwide. We specialize in providing hard-to-find, rare parts for all bus models, ensuring your fleet stays operational and safe. With over 25 years of experience in the industry, we maintain an extensive inventory of genuine parts and high-quality alternatives that meet or exceed OEM standards.",
        authentic_parts: "Authentic Parts",
        authentic_parts_desc: "Genuine components from trusted manufacturers",
        global_shipping: "Global Shipping",
        global_shipping_desc: "Fast, reliable delivery to 50+ countries worldwide",
        expert_support: "Expert Support",
        expert_support_desc: "Professional guidance from experienced specialists",
        
        // Footer
        footer_description: "Your trusted partner for authentic bus parts and components worldwide.",
        quick_links: "Quick Links",
        home: "Home",
        address: "Chișinău, Moldova",
        all_rights_reserved: "All rights reserved.",
        latest_parts: "Latest Parts",
        latest_parts_desc: "Discover our bus parts collection. All parts come with detailed specifications and authentic part numbers.",
        over_parts: "Over 1000+ authentic parts",
        view_all_catalog: "View All Catalog",
        
        // Admin
        admin_panel: "Admin Panel",
        manage_products: "Manage Products",
        manage_users: "Manage Users",
        manage_orders: "Manage Orders",

        // Footer Categories
        footer_categories: "Categories",
        cat_brake_system: "Brake System",
        cat_electrical: "Electrical",
        cat_engine: "Engine",
        cat_chassis: "Chassis",

        // Contact page
        contact_page_title: "Contact - Inter Bus",
        contact_title: "Contact Us",
        contact_subtitle: "Get in touch with our expert team for any questions about Inter Bus parts, orders, or technical support.",
        send_message: "Send us a Message",
        first_name: "First Name",
        last_name: "Last Name",
        email: "Email Address",
        phone: "Phone Number (Optional)",
        subject: "Subject",
        message: "Message",
        select_subject: "Select a subject",
        parts_inquiry: "Parts Inquiry",
        order_status: "Order Status",
        technical_support: "Technical Support",
        partnership: "Partnership",
        other: "Other",
        first_name_placeholder: "Enter your first name",
        last_name_placeholder: "Enter your last name",
        email_placeholder: "Enter your email address",
        phone_placeholder: "Enter your phone number",
        message_placeholder: "Write your message here...",
        send_message_btn: "Send Message",
        contact_info: "Contact Information",
        address_label: "Address",
        company_address: "Chișinău, Moldova\nStreet Name, Building Number\nMD-2001",
        phone_label: "Phone",
        email_label: "Email",
        business_hours: "Business Hours",
        monday_friday: "Monday - Friday",
        saturday: "Saturday",
        sunday: "Sunday",
        closed: "Closed",
        why_choose_us: "Why Choose Us",
        fast_shipping: "Fast Shipping",
        fast_shipping_desc: "Worldwide delivery in 3-7 days",
        authentic_parts_contact: "Authentic Parts",
        authentic_parts_desc_contact: "100% genuine bus components",
        expert_support_contact: "Expert Support",
        expert_support_desc_contact: "Professional technical assistance",
        sending: "Sending...",

        // Thank You page
        thankyou_page_title: "Order Completed | Inter Bus",
        order_placed_badge: "Order Placed",
        order_success_title: "Order completed successfully!",
        order_success_message: "Thank you for your order. You will receive a confirmation email shortly.",
        order_details_heading: "Order Details",
        payment_info_heading: "Payment Information",
        ordered_products_heading: "Ordered Products",
        summary_subtotal: "Subtotal",
        summary_discount: "Discount",
        summary_shipping: "Shipping",
        summary_total: "Total",
        whats_next: "What's next?",
        step1_title: "Order Confirmation",
        step1_desc: "You will receive a confirmation email within 15-30 minutes.",
        step2_title: "Order Processing",
        step2_desc: "Your order will be verified and prepared for shipment.",
        step3_title: "Delivery",
        step3_desc: "Products will be delivered to the specified address within 2-3 days.",
        back_to_store: "Back to store",
        track_order: "Track Order",
        order_questions: "Have questions about your order?",
        tracking_modal_title: "Order Tracking",
        tracking_order_placed: "Order Placed",
        tracking_today: "Today",
        tracking_order_confirmed: "Order Confirmed",
        tracking_soon: "Soon",
        tracking_preparing: "Preparing",
        tracking_shipped: "Shipped",
        tracking_1_2_days: "1-2 days",
        tracking_delivery: "Delivery",
        tracking_2_3_days: "2-3 days",
        tracking_email_notification: "You will receive email notifications at each stage.",

        // Login page
        login_page_title: "Login | Inter Bus",
        sign_in_title: "Sign In",
        sign_in_btn: "Sign In",
        password_label: "Password",
        login_failed: "Login failed. Please check your credentials.",
        login_success: "Login successful!",
        redirecting: "Redirecting...",
        welcome_back: "Welcome back!",
        no_account: "Don't have an account?",
        register_here: "Register here",
        enter_email_placeholder: "Enter your email",
        enter_password_placeholder: "Enter your password",
        login_required_message: "You need to log in to access this feature.",
        account_created: "Account created successfully!",

        // Register page
        "register.page_title": "Register | Inter Bus",
        "register.title": "Create Account",
        "register.first_name": "First Name",
        "register.last_name": "Last Name",
        "register.email": "Email",
        "register.phone": "Phone",
        "register.password": "Password",
        "register.confirm_password": "Confirm Password",
        "register.company": "Company (Optional)",
        "register.create_account": "Create Account",
        "register.have_account": "Already have an account?",
        "register.login_link": "Log in",
        "register.terms": "Terms & Conditions",
        "register.privacy": "Privacy Policy",
        "register.and": "and",
        "register.agree": "I agree to the",
        "register.marketing": "I want to receive marketing emails",
        "register.lang_english": "English",
        "register.lang_romana": "Română",
        "register.lang_russian": "Русский",
        "register.language": "Language",
        "register.password_length": "At least 8 characters",
        "register.password_number": "At least one number",
        "register.password_special": "At least one special character",
        "register.password_mismatch": "Passwords do not match",
        "register.error_title": "Registration Error",
        "register.success": "Registration successful!",
        "register.check_email": "Please check your email to confirm your account.",
        "register.meta_description": "Register for Inter Bus - Bus parts supplier",
        "register.first_name_placeholder": "Enter your first name",
        "register.last_name_placeholder": "Enter your last name",
        "register.email_placeholder": "Enter your email",
        "register.phone_placeholder": "Enter phone number",
        "register.password_placeholder": "Create a password",
        "register.confirm_password_placeholder": "Confirm your password",
        "register.company_placeholder": "Enter company name",

        // Dashboard page
        dashboard_page_title: "Dashboard | Inter Bus",
        profile: "Profile",
        account_info: "Account Information",
        edit_profile: "Edit Profile",
        member_since: "Member since",
        my_orders: "My Orders",
        wishlist: "Wishlist",
        recent_activity: "Recent Activity",
        no_recent_orders: "No recent orders",
        browse_parts: "Browse Parts",
        loading_dashboard: "Loading dashboard...",
        not_set: "Not set",
        zero_orders: "0 orders",
        zero_items: "0 items",
        name_label: "Name",
        total_orders: "Total Orders",
        total_spent: "Total Spent",
        cart_items: "Cart Items",
        all_statuses: "All",
        status_pending: "Pending",
        status_confirmed: "Confirmed",
        status_shipped: "Shipped",
        status_delivered: "Delivered",
        status_cancelled: "Cancelled",
        loading_orders: "Loading orders...",
        no_orders_yet: "No orders yet",
        no_orders_desc: "Your orders will appear here after you place them.",
        start_shopping: "Start Shopping",
        quick_actions: "Quick Actions",
        view_cart: "View Cart",
        contact_support: "Contact Support",
        order_details: "Order Details",
        find_parts: "Find bus parts",

        // Product page
        product_title: "Product | Inter Bus",
        product_not_found: "Product not found",
        product_not_found_desc: "The product you are looking for does not exist or has been removed.",
        back_to_catalog: "Back to Catalog",
        specifications: "Specifications",
        dimensions: "Dimensions",
        weight: "Weight",
        quantity: "Quantity",
        related_products: "Related Products",
        secure_ordering: "Secure ordering with cash on delivery",

        // Cart page
        cart: "Cart",
        cart_page_title: "Cart | Inter Bus",
        shopping_cart: "Shopping Cart",
        cart_empty: "Your cart is empty",
        cart_empty_desc: "Looks like you haven't added any items to your cart yet.",
        explore_products: "Explore Products",
        products_in_cart: "products in cart",
        subtotal: "Subtotal",
        discount: "Discount",
        shipping: "Shipping",
        cart_total: "Total",
        proceed_to_checkout: "Proceed to Checkout",
        add_promo_code: "Add promo code",
        apply: "Apply",
        free_shipping_notice: "Free shipping on orders over €500",
        auth_notice_checkout: "You must be logged in to checkout",
        continue_shopping: "Continue Shopping",
        explore_catalog: "Explore Catalog",
        promo_code_placeholder: "Promo code",

        // Checkout page
        checkout_page_title: "Checkout | Inter Bus",
        secure_checkout: "Secure Checkout",
        step_cart: "Cart",
        step_order_details: "Order Details",
        step_payment: "Payment",
        submit_order: "Submit Order",
        simplified_process_info: "Simplified process: Just fill in your name and address. Pay upon delivery.",
        your_details: "Your Details",
        full_name_label: "Full Name *",
        full_name_placeholder: "e.g. John Smith",
        delivery_address: "Delivery Address",
        full_address_label: "Full Address *",
        address_placeholder: "e.g. 123 Flower Street, Apt 4B, Bucharest, Romania",
        address_hint: "Please include street, number, city and region",
        payment_method: "Payment Method",
        cash_on_delivery: "Cash on Delivery",
        cash_on_delivery_desc: "Pay with cash upon product delivery",
        payment_info_note: "Payment is made directly to the courier upon parcel delivery. No advance payment required.",
        order_notes: "Notes (optional)",
        order_notes_placeholder: "Special delivery instructions...",
        accept_terms_label: "I agree to receive this order and pay upon delivery *",
        order_summary: "Order Summary",

        // Index/Home page extras
        page_title: "Inter Bus - Rare Bus Parts",
        meta_description: "Specialized supplier of authentic Inter Bus parts",
        loading_categories: "Loading categories...",
        loading_products: "Loading products...",
        view_all: "View All",
        footer_brakes: "Brakes",
        footer_air_pressure: "Air Pressure",
        footer_engine_extension: "Engine & Extension",
        footer_chassis_suspension: "Chassis & Suspension",
        interbus_categories: "Inter Bus Categories",
        find_parts: "Find the parts you need",
        browse_catalog: "Browse Catalog",
        get_started_today: "Get started today",
        categories: "Categories",
        brake_system: "Brake System",
        electrical: "Electrical",
        engine: "Engine",
        engine_transmission: "Engine & Transmission",
        chassis_suspension: "Chassis & Suspension",
        air_pressure: "Air Pressure",
        air_pressure_desc: "Air pressure systems and components",
        body_interior: "Body & Interior",
        body_interior_desc: "Body panels and interior components",
        brake_system_desc: "Complete brake system components",
        electrical_desc: "Electrical systems and wiring",
        engine_transmission_desc: "Engine and transmission parts",
        chassis_suspension_desc: "Chassis and suspension components",

        // Tags
        tag_247_support: "24/7 Support",
        tag_50_countries: "50+ Countries",
        tag_best_prices: "Best Prices",
        tag_brake_systems: "Brake Systems",
        tag_bulk_discounts: "Bulk Discounts",
        tag_current_parts: "Current Parts",
        tag_customer_service: "Customer Service",
        tag_electrical_parts: "Electrical Parts",
        tag_expert_team: "Expert Team",
        tag_fast_delivery: "Fast Delivery",
        tag_global_shipping: "Global Shipping",
        tag_installation_help: "Installation Help",
        tag_inventory: "Inventory",
        tag_no_hidden_fees: "No Hidden Fees",
        tag_oem_quality: "OEM Quality",
        tag_rare_components: "Rare Components",
        tag_secure_packaging: "Secure Packaging",
        tag_technical_support: "Technical Support",

        // About page
        about_page_title: "About Us | Inter Bus",
        about_meta_description: "Learn about Inter Bus - Your trusted supplier of bus parts",
        about_hero_title: "About Inter Bus",
        about_hero_description: "Your trusted partner for authentic bus parts since 1998",
        our_story_title: "Our Story",
        our_story_p1: "Founded in 1998, Inter Bus has grown from a small local supplier to a global leader in rare bus parts distribution.",
        our_story_p2: "We specialize in hard-to-find components for all bus models, maintaining an extensive inventory of genuine parts.",
        our_story_p3: "Our team of dedicated professionals ensures every part meets the highest quality standards.",
        our_values_title: "Our Values",
        our_values_description: "The principles that guide everything we do",
        core_values: "Core Values",
        quality_title: "Quality",
        quality_description: "We never compromise on quality, sourcing only authentic and certified parts.",
        quality_guaranteed: "Quality Guaranteed",
        service_title: "Service",
        service_description: "Customer satisfaction is at the heart of everything we do.",
        expertise_title: "Expertise",
        expertise_description: "Our team brings decades of combined experience in the bus parts industry.",
        our_team: "Our Team",
        meet_team_title: "Meet Our Team",
        team_description: "The dedicated professionals behind Inter Bus",
        team_member_1_name: "Alexandru Popescu",
        team_member_1_role: "Founder & CEO",
        team_member_1_desc: "25+ years of experience in the bus parts industry",
        team_member_2_name: "Maria Ionescu",
        team_member_2_role: "Operations Manager",
        team_member_2_desc: "Expert in logistics and supply chain management",
        team_member_3_name: "Dmitri Volkov",
        team_member_3_role: "Technical Director",
        team_member_3_desc: "Specialist in bus engineering and parts compatibility",
        by_numbers: "By the Numbers",
        years_combined: "Years Combined Experience",
        parts_in_stock: "Parts in Stock",
        satisfied_customers: "Satisfied Customers",
        orders_processed: "Orders Processed",
        trusted_worldwide: "Trusted Worldwide",
        certified_dealer: "Certified Dealer",
        customer_support: "Customer Support",
        contact_cta_title: "Ready to Find Your Parts?",
        contact_cta_description: "Contact our expert team to find the exact parts you need.",
        our_journey: "Our Journey",
        get_started: "Get Started",
        since: "Since",
        specializing_in: "Specializing in rare bus parts",
        trusted_since: "Trusted since 1998",
        top_rated: "Top Rated",
        customer_satisfaction: "Customer Satisfaction",
        competitive_pricing: "Competitive Pricing",
        competitive_pricing_desc: "Best prices for authentic bus parts",
        extensive_inventory: "Extensive Inventory",
        extensive_inventory_desc: "Over 10,000 parts in stock",
        technical_support_desc: "Professional technical assistance",
        why_choose_title: "Why Choose Inter Bus",
        why_choose_subtitle: "What makes us different",
        why_us: "Why Us",
        call_us: "Call Us",
        email_us: "Email Us",
        chassis: "Chassis",
        trusted_by: "Trusted By"
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
        hero_title: "Piese Rare Autobuze Inter Bus",
        hero_subtitle: "Furnizor specializat de piese originale Inter Bus. Componente greu de găsit pentru toate modelele de autobuze Inter Bus cu livrare în întreaga lume.",
        view_catalog: "Vezi Catalogul",
        contact_us: "Contactează-ne",
        parts_available: "Piese Disponibile",
        countries_served: "Țări Servite",
        years_experience: "Ani Experiență",
        
        // Categories 
        popular_categories: "Categorii Populare",
        featured_parts: "Piese Recomandate", 
        featured_parts_desc: "Descoperă cele mai populare piese Inter Bus. Toate piesele vin cu specificații detaliate și numere originale de piese.",
        see_all_parts: "Vezi Toate Piesele",
        
        // Catalog
        title: "Catalog Piese Inter Bus",
        subtitle: "Găsește piesa perfectă pentru autobuzul tău Inter Bus",
        filters: "Filtre",
        search: "Căutare",
        search_placeholder: "Caută după cod piesă sau nume...",
        category: "Categorie",
        all_categories: "Toate Categoriile",
        price_range: "Interval Preț",
        price_min: "Min",
        price_max: "Max",
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
        
        // Home page additions
        about_inter_bus: "Despre Inter Bus",
        about_description: "Inter Bus este furnizorul de încredere pentru piese și componente autentice de autobuz la nivel mondial. Ne specializăm în furnizarea de piese rare și greu de găsit pentru toate modelele de autobuze, asigurându-ne că flota dumneavoastră rămâne operațională și sigură. Cu peste 25 de ani de experiență în industrie, menținem un inventar extins de piese originale și alternative de înaltă calitate care îndeplinesc sau depășesc standardele OEM.",
        authentic_parts: "Piese Autentice",
        authentic_parts_desc: "Componente originale de la producători de încredere",
        global_shipping: "Livrare Globală",
        global_shipping_desc: "Livrare rapidă și sigură în peste 50 de țări",
        expert_support: "Suport Expert",
        expert_support_desc: "Ghidare profesională de la specialiști cu experiență",
        
        // Footer
        footer_description: "Partenerul dumneavoastră de încredere pentru piese și componente autentice de autobuz în întreaga lume.",
        quick_links: "Legături Rapide",
        home: "Acasă",
        address: "Chișinău, Moldova",
        all_rights_reserved: "Toate drepturile rezervate.",
        latest_parts: "Ultimele Piese",
        latest_parts_desc: "Descoperiți colecția noastră de piese de autobuz. Toate piesele vin cu specificații detaliate și numere autentice de piese.",
        over_parts: "Peste 1000+ piese autentice",
        view_all_catalog: "Vezi Tot Catalogul",
        
        // Admin
        admin_panel: "Panou Admin",
        manage_products: "Gestionează Produse",
        manage_users: "Gestionează Utilizatori",
        manage_orders: "Gestionează Comenzi",

        // Footer Categories
        footer_categories: "Categorii",
        cat_brake_system: "Sistem de Frânare",
        cat_electrical: "Electrice",
        cat_engine: "Motor",
        cat_chassis: "Șasiu",

        // Contact page
        contact_page_title: "Contact - Inter Bus",
        contact_title: "Contactează-ne",
        contact_subtitle: "Contactează echipa noastră de experți pentru orice întrebări despre piese Inter Bus, comenzi sau suport tehnic.",
        send_message: "Trimite-ne un Mesaj",
        first_name: "Prenume",
        last_name: "Nume",
        email: "Adresă de Email",
        phone: "Număr de Telefon (Opțional)",
        subject: "Subiect",
        message: "Mesaj",
        select_subject: "Selectează un subiect",
        parts_inquiry: "Întrebare Piese",
        order_status: "Status Comandă",
        technical_support: "Suport Tehnic",
        partnership: "Parteneriat",
        other: "Altele",
        first_name_placeholder: "Introduceți prenumele",
        last_name_placeholder: "Introduceți numele",
        email_placeholder: "Introduceți adresa de email",
        phone_placeholder: "Introduceți numărul de telefon",
        message_placeholder: "Scrieți mesajul aici...",
        send_message_btn: "Trimite Mesaj",
        contact_info: "Informații de Contact",
        address_label: "Adresă",
        company_address: "Chișinău, Moldova\nStrada, Numărul Clădirii\nMD-2001",
        phone_label: "Telefon",
        email_label: "Email",
        business_hours: "Program de Lucru",
        monday_friday: "Luni - Vineri",
        saturday: "Sâmbătă",
        sunday: "Duminică",
        closed: "Închis",
        why_choose_us: "De Ce Să Ne Alegeți",
        fast_shipping: "Livrare Rapidă",
        fast_shipping_desc: "Livrare mondială în 3-7 zile",
        authentic_parts_contact: "Piese Autentice",
        authentic_parts_desc_contact: "Componente de autobuz 100% originale",
        expert_support_contact: "Suport Expert",
        expert_support_desc_contact: "Asistență tehnică profesională",
        sending: "Se trimite...",

        // Thank You page
        thankyou_page_title: "Comandă Finalizată | Inter Bus",
        order_placed_badge: "Comandă Plasată",
        order_success_title: "Comandă finalizată cu succes!",
        order_success_message: "Vă mulțumim pentru comandă. Veți primi în curând un email de confirmare.",
        order_details_heading: "Detalii Comandă",
        payment_info_heading: "Informații Plată",
        ordered_products_heading: "Produse Comandate",
        summary_subtotal: "Subtotal",
        summary_discount: "Reducere",
        summary_shipping: "Livrare",
        summary_total: "Total",
        whats_next: "Ce urmează?",
        step1_title: "Confirmarea Comenzii",
        step1_desc: "Veți primi un email de confirmare în 15-30 de minute.",
        step2_title: "Procesarea Comenzii",
        step2_desc: "Comanda va fi verificată și pregătită pentru expediție.",
        step3_title: "Livrarea",
        step3_desc: "Produsele vor fi livrate la adresa specificată în 2-3 zile.",
        back_to_store: "Înapoi la magazin",
        track_order: "Urmărește Comanda",
        order_questions: "Aveți întrebări despre comandă?",
        tracking_modal_title: "Urmărire Comandă",
        tracking_order_placed: "Comandă Plasată",
        tracking_today: "Astăzi",
        tracking_order_confirmed: "Comandă Confirmată",
        tracking_soon: "În curând",
        tracking_preparing: "În Preparare",
        tracking_shipped: "Expediere",
        tracking_1_2_days: "1-2 zile",
        tracking_delivery: "Livrare",
        tracking_2_3_days: "2-3 zile",
        tracking_email_notification: "Veți primi notificări prin email la fiecare etapă.",

        // Login page
        login_page_title: "Autentificare | Inter Bus",
        sign_in_title: "Autentificare",
        sign_in_btn: "Autentificare",
        password_label: "Parolă",
        login_failed: "Autentificare eșuată. Verificați datele de acces.",
        login_success: "Autentificare reușită!",
        redirecting: "Redirecționare...",
        welcome_back: "Bine ați revenit!",
        no_account: "Nu aveți un cont?",
        register_here: "Înregistrează-te aici",
        enter_email_placeholder: "Introduceți emailul",
        enter_password_placeholder: "Introduceți parola",
        login_required_message: "Trebuie să vă autentificați pentru a accesa această funcție.",
        account_created: "Cont creat cu succes!",

        // Register page
        "register.page_title": "Înregistrare | Inter Bus",
        "register.title": "Creare Cont",
        "register.first_name": "Prenume",
        "register.last_name": "Nume",
        "register.email": "Email",
        "register.phone": "Telefon",
        "register.password": "Parolă",
        "register.confirm_password": "Confirmă Parola",
        "register.company": "Companie (Opțional)",
        "register.create_account": "Creare Cont",
        "register.have_account": "Aveți deja un cont?",
        "register.login_link": "Autentificare",
        "register.terms": "Termeni și Condiții",
        "register.privacy": "Politica de Confidențialitate",
        "register.and": "și",
        "register.agree": "Sunt de acord cu",
        "register.marketing": "Vreau să primesc emailuri de marketing",
        "register.lang_english": "English",
        "register.lang_romana": "Română",
        "register.lang_russian": "Русский",
        "register.language": "Limbă",
        "register.password_length": "Minim 8 caractere",
        "register.password_number": "Cel puțin o cifră",
        "register.password_special": "Cel puțin un caracter special",
        "register.password_mismatch": "Parolele nu se potrivesc",
        "register.error_title": "Eroare la Înregistrare",
        "register.success": "Înregistrare reușită!",
        "register.check_email": "Verificați emailul pentru a confirma contul.",
        "register.meta_description": "Înregistrare Inter Bus - Furnizor piese autobuz",
        "register.first_name_placeholder": "Introduceți prenumele",
        "register.last_name_placeholder": "Introduceți numele",
        "register.email_placeholder": "Introduceți emailul",
        "register.phone_placeholder": "Introduceți telefonul",
        "register.password_placeholder": "Creați o parolă",
        "register.confirm_password_placeholder": "Confirmați parola",
        "register.company_placeholder": "Introduceți numele companiei",

        // Dashboard page
        dashboard_page_title: "Panou de Control | Inter Bus",
        profile: "Profil",
        account_info: "Informații Cont",
        edit_profile: "Editare Profil",
        member_since: "Membru din",
        my_orders: "Comenzile Mele",
        wishlist: "Lista de Dorințe",
        recent_activity: "Activitate Recentă",
        no_recent_orders: "Fără comenzi recente",
        browse_parts: "Răsfoiește Piese",
        loading_dashboard: "Se încarcă panoul...",
        not_set: "Nesetat",
        zero_orders: "0 comenzi",
        zero_items: "0 articole",
        name_label: "Nume",
        total_orders: "Total comenzi",
        total_spent: "Total cheltuit",
        cart_items: "Produse în coș",
        all_statuses: "Toate",
        status_pending: "În așteptare",
        status_confirmed: "Confirmată",
        status_shipped: "Expediată",
        status_delivered: "Livrată",
        status_cancelled: "Anulată",
        loading_orders: "Se încarcă comenzile...",
        no_orders_yet: "Nicio comandă încă",
        no_orders_desc: "Comenzile dvs. vor apărea aici după ce le plasați.",
        start_shopping: "Începe cumpărăturile",
        quick_actions: "Acțiuni rapide",
        view_cart: "Vezi coșul",
        contact_support: "Contactează suportul",
        order_details: "Detalii comandă",
        find_parts: "Caută piese",

        // Product page
        product_title: "Produs | Inter Bus",
        product_not_found: "Produs negăsit",
        product_not_found_desc: "Produsul pe care îl căutați nu există sau a fost eliminat.",
        back_to_catalog: "Înapoi la Catalog",
        specifications: "Specificații",
        dimensions: "Dimensiuni",
        weight: "Greutate",
        quantity: "Cantitate",
        related_products: "Produse Similare",
        secure_ordering: "Comandă securizată cu plata la livrare",

        // Cart page
        cart: "Coș",
        cart_page_title: "Coș | Inter Bus",
        shopping_cart: "Coș de Cumpărături",
        cart_empty: "Coșul este gol",
        cart_empty_desc: "Se pare că nu ați adăugat încă articole în coș.",
        explore_products: "Explorează Produse",
        products_in_cart: "produse în coș",
        subtotal: "Subtotal",
        discount: "Reducere",
        shipping: "Livrare",
        cart_total: "Total",
        proceed_to_checkout: "Finalizare Comandă",
        add_promo_code: "Adaugă cod promoțional",
        apply: "Aplică",
        free_shipping_notice: "Livrare gratuită pentru comenzi peste €500",
        auth_notice_checkout: "Trebuie să fiți autentificat pentru a finaliza comanda",
        continue_shopping: "Continuă Cumpărăturile",
        explore_catalog: "Explorează Catalogul",
        promo_code_placeholder: "Cod promoțional",

        // Checkout page
        checkout_page_title: "Finalizare Comandă | Inter Bus",
        secure_checkout: "Checkout Securizat",
        step_cart: "Coș",
        step_order_details: "Date Comandă",
        step_payment: "Plată",
        submit_order: "Trimite Comanda",
        simplified_process_info: "Proces simplificat: Completați doar numele și adresa. Plata se face la primirea produselor.",
        your_details: "Datele Dumneavoastră",
        full_name_label: "Nume Complet *",
        full_name_placeholder: "Ex: Ion Popescu",
        delivery_address: "Adresa de Livrare",
        full_address_label: "Adresa Completă *",
        address_placeholder: "Ex: Strada Florilor 123, Ap. 4B, București, România",
        address_hint: "Vă rugăm includeți strada, numărul, orașul și județul",
        payment_method: "Metodă de Plată",
        cash_on_delivery: "Plata la Livrare (Ramburs)",
        cash_on_delivery_desc: "Plătiți cu bani cash la primirea produselor",
        payment_info_note: "Plata se face direct curierului la primirea coletului. Nu este necesară plata în avans.",
        order_notes: "Observații (opțional)",
        order_notes_placeholder: "Mențiuni speciale pentru livrare...",
        accept_terms_label: "Sunt de acord să primesc această comandă și să plătesc la livrare *",
        order_summary: "Rezumatul Comenzii",

        // Index/Home page extras
        page_title: "Inter Bus - Piese Rare Autobuze",
        meta_description: "Furnizor specializat de piese autentice Inter Bus",
        loading_categories: "Se încarcă categoriile...",
        loading_products: "Se încarcă produsele...",
        view_all: "Vezi Tot",
        footer_brakes: "Frâne",
        footer_air_pressure: "Presiune Aer",
        footer_engine_extension: "Motor & Extensie",
        footer_chassis_suspension: "Sasiu & Suspensie",
        interbus_categories: "Categorii Inter Bus",
        find_parts: "Găsește piesele de care ai nevoie",
        browse_catalog: "Răsfoiește Catalogul",
        get_started_today: "Începe astăzi",
        categories: "Categorii",
        brake_system: "Sistem de Frânare",
        electrical: "Electrice",
        engine: "Motor",
        engine_transmission: "Motor și Transmisie",
        chassis_suspension: "Șasiu și Suspensie",
        air_pressure: "Presiune Aer",
        air_pressure_desc: "Sisteme și componente de presiune aer",
        body_interior: "Caroserie și Interior",
        body_interior_desc: "Panouri caroserie și componente interior",
        brake_system_desc: "Componente complete sistem de frânare",
        electrical_desc: "Sisteme electrice și cablaje",
        engine_transmission_desc: "Piese motor și transmisie",
        chassis_suspension_desc: "Componente șasiu și suspensie",

        // Tags
        tag_247_support: "Suport 24/7",
        tag_50_countries: "50+ Țări",
        tag_best_prices: "Cele Mai Bune Prețuri",
        tag_brake_systems: "Sisteme de Frânare",
        tag_bulk_discounts: "Reduceri en-gros",
        tag_current_parts: "Piese Actuale",
        tag_customer_service: "Serviciu Clienți",
        tag_electrical_parts: "Piese Electrice",
        tag_expert_team: "Echipă de Experți",
        tag_fast_delivery: "Livrare Rapidă",
        tag_global_shipping: "Livrare Globală",
        tag_installation_help: "Ajutor la Instalare",
        tag_inventory: "Inventar",
        tag_no_hidden_fees: "Fără Costuri Ascunse",
        tag_oem_quality: "Calitate OEM",
        tag_rare_components: "Componente Rare",
        tag_secure_packaging: "Ambalare Securizată",
        tag_technical_support: "Suport Tehnic",

        // About page
        about_page_title: "Despre Noi | Inter Bus",
        about_meta_description: "Despre Inter Bus - Furnizorul dumneavoastră de încredere de piese auto",
        about_hero_title: "Despre Inter Bus",
        about_hero_description: "Partenerul dumneavoastră de încredere pentru piese autentice de autobuz din 1998",
        our_story_title: "Povestea Noastră",
        our_story_p1: "Fondat în 1998, Inter Bus a crescut de la un mic furnizor local la un lider global în distribuția de piese rare de autobuz.",
        our_story_p2: "Ne specializăm în componente greu de găsit pentru toate modelele de autobuze, menținând un inventar extins de piese originale.",
        our_story_p3: "Echipa noastră de profesioniști dedicați asigură că fiecare piesă îndeplinește cele mai înalte standarde de calitate.",
        our_values_title: "Valorile Noastre",
        our_values_description: "Principiile care ne ghidează în tot ceea ce facem",
        core_values: "Valori Fundamentale",
        quality_title: "Calitate",
        quality_description: "Nu facem compromisuri la calitate, furnizând doar piese autentice și certificate.",
        quality_guaranteed: "Calitate Garantată",
        service_title: "Serviciu",
        service_description: "Satisfacția clientului este în centrul a tot ceea ce facem.",
        expertise_title: "Expertiză",
        expertise_description: "Echipa noastră aduce decenii de experiență combinată în industria pieselor de autobuz.",
        our_team: "Echipa Noastră",
        meet_team_title: "Cunoaște Echipa Noastră",
        team_description: "Profesioniștii dedicați din spatele Inter Bus",
        team_member_1_name: "Alexandru Popescu",
        team_member_1_role: "Fondator și CEO",
        team_member_1_desc: "Peste 25 de ani de experiență în industria pieselor de autobuz",
        team_member_2_name: "Maria Ionescu",
        team_member_2_role: "Manager Operațiuni",
        team_member_2_desc: "Expert în logistică și managementul lanțului de aprovizionare",
        team_member_3_name: "Dmitri Volkov",
        team_member_3_role: "Director Tehnic",
        team_member_3_desc: "Specialist în inginerie autobuze și compatibilitate piese",
        by_numbers: "În Cifre",
        years_combined: "Ani de Experiență Combinată",
        parts_in_stock: "Piese în Stoc",
        satisfied_customers: "Clienți Mulțumiți",
        orders_processed: "Comenzi Procesate",
        trusted_worldwide: "De Încredere în Întreaga Lume",
        certified_dealer: "Dealer Certificat",
        customer_support: "Suport Clienți",
        contact_cta_title: "Pregătit să Găsești Piesele?",
        contact_cta_description: "Contactează echipa noastră de experți pentru a găsi piesele exacte de care ai nevoie.",
        our_journey: "Călătoria Noastră",
        get_started: "Începe",
        since: "Din",
        specializing_in: "Specializați în piese rare de autobuz",
        trusted_since: "De încredere din 1998",
        top_rated: "Cel Mai Bine Cotat",
        customer_satisfaction: "Satisfacția Clientului",
        competitive_pricing: "Prețuri Competitive",
        competitive_pricing_desc: "Cele mai bune prețuri pentru piese autentice",
        extensive_inventory: "Inventar Extins",
        extensive_inventory_desc: "Peste 10.000 de piese în stoc",
        technical_support_desc: "Asistență tehnică profesională",
        why_choose_title: "De Ce Să Alegi Inter Bus",
        why_choose_subtitle: "Ce ne face diferiți",
        why_us: "De Ce Noi",
        call_us: "Sună-ne",
        email_us: "Scrie-ne",
        chassis: "Șasiu",
        trusted_by: "De Încredere Pentru"
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
        hero_title: "Редкие запчасти для автобусов Inter Bus",
        hero_subtitle: "Специализированный поставщик оригинальных запчастей Inter Bus. Труднодоступные компоненты для всех моделей автобусов Inter Bus с доставкой по всему миру.",
        view_catalog: "Смотреть каталог",
        contact_us: "Связаться с нами",
        parts_available: "Доступных запчастей",
        countries_served: "Обслуживаемых стран", 
        years_experience: "Лет опыта",
        
        // Categories
        popular_categories: "Популярные категории",
        featured_parts: "Рекомендуемые запчасти",
        featured_parts_desc: "Откройте для себя самые популярные запчасти Inter Bus. Все запчасти поставляются с подробными характеристиками и подлинными номерами запчастей.",
        see_all_parts: "Смотреть все запчасти",
        
        // Catalog
        title: "Каталог запчастей Inter Bus",
        subtitle: "Найдите идеальную запчасть для вашего автобуса Inter Bus",
        filters: "Фильтры",
        search: "Поиск",
        search_placeholder: "Поиск по коду запчасти или названию...",
        category: "Категория",
        all_categories: "Все категории",
        price_range: "Диапазон цен",
        price_min: "Мин",
        price_max: "Макс",
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
        
        // Home page additions
        about_inter_bus: "О Inter Bus",
        about_description: "Inter Bus — ваш надежный поставщик аутентичных автобусных запчастей и компонентов по всему миру. Мы специализируемся на поставке труднодоступных, редких запчастей для всех моделей автобусов, обеспечивая работоспособность и безопасность вашего парка. Имея более 25 лет опыта в отрасли, мы поддерживаем обширный склад оригинальных запчастей и высококачественных альтернатив, которые соответствуют или превышают стандарты OEM.",
        authentic_parts: "Аутентичные запчасти",
        authentic_parts_desc: "Оригинальные компоненты от надежных производителей",
        global_shipping: "Глобальная доставка",
        global_shipping_desc: "Быстрая, надежная доставка в более чем 50 стран мира",
        expert_support: "Экспертная поддержка",
        expert_support_desc: "Профессиональное руководство от опытных специалистов",
        
        // Footer
        footer_description: "Ваш надежный партнер по аутентичным автобусным запчастям и компонентам по всему миру.",
        quick_links: "Быстрые ссылки",
        home: "Главная",
        address: "Кишинёв, Молдова",
        all_rights_reserved: "Все права защищены.",
        latest_parts: "Последние запчасти",
        latest_parts_desc: "Откройте для себя нашу коллекцию автобусных запчастей. Все запчасти поставляются с подробными техническими характеристиками и подлинными номерами запчастей.",
        over_parts: "Более 1000+ подлинных запчастей",
        view_all_catalog: "Посмотреть весь каталог",
        
        // Admin
        admin_panel: "Админ панель",
        manage_products: "Управление товарами",
        manage_users: "Управление пользователями",
        manage_orders: "Управление заказами",

        // Footer Categories
        footer_categories: "Категории",
        cat_brake_system: "Тормозная система",
        cat_electrical: "Электрика",
        cat_engine: "Двигатель",
        cat_chassis: "Шасси",

        // Contact page
        contact_page_title: "Контакты - Inter Bus",
        contact_title: "Свяжитесь с нами",
        contact_subtitle: "Обратитесь к нашей экспертной команде по любым вопросам о запчастях Inter Bus, заказах или технической поддержке.",
        send_message: "Отправьте нам сообщение",
        first_name: "Имя",
        last_name: "Фамилия",
        email: "Электронная почта",
        phone: "Номер телефона (необязательно)",
        subject: "Тема",
        message: "Сообщение",
        select_subject: "Выберите тему",
        parts_inquiry: "Вопрос о запчастях",
        order_status: "Статус заказа",
        technical_support: "Техническая поддержка",
        partnership: "Партнёрство",
        other: "Другое",
        first_name_placeholder: "Введите ваше имя",
        last_name_placeholder: "Введите вашу фамилию",
        email_placeholder: "Введите ваш email",
        phone_placeholder: "Введите номер телефона",
        message_placeholder: "Напишите ваше сообщение здесь...",
        send_message_btn: "Отправить сообщение",
        contact_info: "Контактная информация",
        address_label: "Адрес",
        company_address: "Кишинёв, Молдова\nУлица, Номер дома\nMD-2001",
        phone_label: "Телефон",
        email_label: "Email",
        business_hours: "Часы работы",
        monday_friday: "Понедельник - Пятница",
        saturday: "Суббота",
        sunday: "Воскресенье",
        closed: "Закрыто",
        why_choose_us: "Почему выбирают нас",
        fast_shipping: "Быстрая доставка",
        fast_shipping_desc: "Доставка по всему миру за 3-7 дней",
        authentic_parts_contact: "Подлинные запчасти",
        authentic_parts_desc_contact: "100% оригинальные автобусные компоненты",
        expert_support_contact: "Экспертная поддержка",
        expert_support_desc_contact: "Профессиональная техническая помощь",
        sending: "Отправка...",

        // Thank You page
        thankyou_page_title: "Заказ оформлен | Inter Bus",
        order_placed_badge: "Заказ оформлен",
        order_success_title: "Заказ успешно оформлен!",
        order_success_message: "Спасибо за заказ. Вы получите письмо с подтверждением в ближайшее время.",
        order_details_heading: "Детали заказа",
        payment_info_heading: "Информация об оплате",
        ordered_products_heading: "Заказанные товары",
        summary_subtotal: "Подытог",
        summary_discount: "Скидка",
        summary_shipping: "Доставка",
        summary_total: "Итого",
        whats_next: "Что дальше?",
        step1_title: "Подтверждение заказа",
        step1_desc: "Вы получите письмо с подтверждением в течение 15-30 минут.",
        step2_title: "Обработка заказа",
        step2_desc: "Ваш заказ будет проверен и подготовлен к отправке.",
        step3_title: "Доставка",
        step3_desc: "Товары будут доставлены по указанному адресу в течение 2-3 дней.",
        back_to_store: "Вернуться в магазин",
        track_order: "Отследить заказ",
        order_questions: "Есть вопросы о заказе?",
        tracking_modal_title: "Отслеживание заказа",
        tracking_order_placed: "Заказ оформлен",
        tracking_today: "Сегодня",
        tracking_order_confirmed: "Заказ подтверждён",
        tracking_soon: "Скоро",
        tracking_preparing: "Подготовка",
        tracking_shipped: "Отправлен",
        tracking_1_2_days: "1-2 дня",
        tracking_delivery: "Доставка",
        tracking_2_3_days: "2-3 дня",
        tracking_email_notification: "Вы будете получать уведомления по email на каждом этапе.",

        // Login page
        login_page_title: "Вход | Inter Bus",
        sign_in_title: "Войти",
        sign_in_btn: "Войти",
        password_label: "Пароль",
        login_failed: "Ошибка входа. Проверьте ваши данные.",
        login_success: "Вход выполнен!",
        redirecting: "Перенаправление...",
        welcome_back: "С возвращением!",
        no_account: "Нет аккаунта?",
        register_here: "Зарегистрируйтесь здесь",
        enter_email_placeholder: "Введите ваш email",
        enter_password_placeholder: "Введите ваш пароль",
        login_required_message: "Необходимо войти для доступа к этой функции.",
        account_created: "Аккаунт успешно создан!",

        // Register page
        "register.page_title": "Регистрация | Inter Bus",
        "register.title": "Создать Аккаунт",
        "register.first_name": "Имя",
        "register.last_name": "Фамилия",
        "register.email": "Email",
        "register.phone": "Телефон",
        "register.password": "Пароль",
        "register.confirm_password": "Подтвердить Пароль",
        "register.company": "Компания (Необязательно)",
        "register.create_account": "Создать Аккаунт",
        "register.have_account": "Уже есть аккаунт?",
        "register.login_link": "Войти",
        "register.terms": "Условия использования",
        "register.privacy": "Политика конфиденциальности",
        "register.and": "и",
        "register.agree": "Я согласен с",
        "register.marketing": "Я хочу получать маркетинговые письма",
        "register.lang_english": "English",
        "register.lang_romana": "Română",
        "register.lang_russian": "Русский",
        "register.language": "Язык",
        "register.password_length": "Минимум 8 символов",
        "register.password_number": "Хотя бы одна цифра",
        "register.password_special": "Хотя бы один специальный символ",
        "register.password_mismatch": "Пароли не совпадают",
        "register.error_title": "Ошибка регистрации",
        "register.success": "Регистрация успешна!",
        "register.check_email": "Проверьте email для подтверждения аккаунта.",
        "register.meta_description": "Регистрация Inter Bus - Поставщик автобусных запчастей",
        "register.first_name_placeholder": "Введите ваше имя",
        "register.last_name_placeholder": "Введите вашу фамилию",
        "register.email_placeholder": "Введите ваш email",
        "register.phone_placeholder": "Введите номер телефона",
        "register.password_placeholder": "Создайте пароль",
        "register.confirm_password_placeholder": "Подтвердите пароль",
        "register.company_placeholder": "Введите название компании",

        // Dashboard page
        dashboard_page_title: "Панель управления | Inter Bus",
        profile: "Профиль",
        account_info: "Информация об аккаунте",
        edit_profile: "Редактировать профиль",
        member_since: "Участник с",
        my_orders: "Мои заказы",
        wishlist: "Избранное",
        recent_activity: "Недавняя активность",
        no_recent_orders: "Нет недавних заказов",
        browse_parts: "Просмотр запчастей",
        loading_dashboard: "Загрузка панели...",
        not_set: "Не указано",
        zero_orders: "0 заказов",
        zero_items: "0 товаров",
        name_label: "Имя",
        total_orders: "Всего заказов",
        total_spent: "Всего потрачено",
        cart_items: "Товары в корзине",
        all_statuses: "Все",
        status_pending: "В ожидании",
        status_confirmed: "Подтверждён",
        status_shipped: "Отправлен",
        status_delivered: "Доставлен",
        status_cancelled: "Отменён",
        loading_orders: "Загрузка заказов...",
        no_orders_yet: "Пока нет заказов",
        no_orders_desc: "Ваши заказы появятся здесь после оформления.",
        start_shopping: "Начать покупки",
        quick_actions: "Быстрые действия",
        view_cart: "Корзина",
        contact_support: "Связаться с поддержкой",
        order_details: "Детали заказа",
        find_parts: "Поиск запчастей",

        // Product page
        product_title: "Товар | Inter Bus",
        product_not_found: "Товар не найден",
        product_not_found_desc: "Товар, который вы ищете, не существует или был удалён.",
        back_to_catalog: "Вернуться в каталог",
        specifications: "Характеристики",
        dimensions: "Размеры",
        weight: "Вес",
        quantity: "Количество",
        related_products: "Похожие товары",
        secure_ordering: "Безопасный заказ с оплатой при доставке",

        // Cart page
        cart: "Корзина",
        cart_page_title: "Корзина | Inter Bus",
        shopping_cart: "Корзина",
        cart_empty: "Ваша корзина пуста",
        cart_empty_desc: "Похоже, вы ещё не добавили товары в корзину.",
        explore_products: "Просмотреть товары",
        products_in_cart: "товаров в корзине",
        subtotal: "Подытог",
        discount: "Скидка",
        shipping: "Доставка",
        cart_total: "Итого",
        proceed_to_checkout: "Оформить заказ",
        add_promo_code: "Добавить промокод",
        apply: "Применить",
        free_shipping_notice: "Бесплатная доставка при заказе от €500",
        auth_notice_checkout: "Для оформления заказа необходимо войти в аккаунт",
        continue_shopping: "Продолжить покупки",
        explore_catalog: "Просмотреть каталог",
        promo_code_placeholder: "Промокод",

        // Checkout page
        checkout_page_title: "Оформление заказа | Inter Bus",
        secure_checkout: "Безопасное оформление",
        step_cart: "Корзина",
        step_order_details: "Данные заказа",
        step_payment: "Оплата",
        submit_order: "Отправить заказ",
        simplified_process_info: "Упрощённый процесс: Заполните только имя и адрес. Оплата при получении.",
        your_details: "Ваши данные",
        full_name_label: "Полное имя *",
        full_name_placeholder: "Например: Иван Петров",
        delivery_address: "Адрес доставки",
        full_address_label: "Полный адрес *",
        address_placeholder: "Например: ул. Цветочная 123, кв. 4Б, Кишинёв, Молдова",
        address_hint: "Укажите улицу, номер дома, город и район",
        payment_method: "Способ оплаты",
        cash_on_delivery: "Оплата при доставке (наложенный платёж)",
        cash_on_delivery_desc: "Оплата наличными при получении товара",
        payment_info_note: "Оплата производится непосредственно курьеру при получении посылки. Предоплата не требуется.",
        order_notes: "Примечания (необязательно)",
        order_notes_placeholder: "Особые инструкции по доставке...",
        accept_terms_label: "Я согласен получить этот заказ и оплатить при доставке *",
        order_summary: "Сводка заказа",

        // Index/Home page extras
        page_title: "Inter Bus - Редкие автобусные запчасти",
        meta_description: "Специализированный поставщик оригинальных запчастей Inter Bus",
        loading_categories: "Загрузка категорий...",
        loading_products: "Загрузка товаров...",
        view_all: "Смотреть все",
        footer_brakes: "Тормоза",
        footer_air_pressure: "Пневматика",
        footer_engine_extension: "Двигатель и комплектующие",
        footer_chassis_suspension: "Шасси и подвеска",
        interbus_categories: "Категории Inter Bus",
        find_parts: "Найдите нужные запчасти",
        browse_catalog: "Просмотреть каталог",
        get_started_today: "Начните сегодня",
        categories: "Категории",
        brake_system: "Тормозная система",
        electrical: "Электрика",
        engine: "Двигатель",
        engine_transmission: "Двигатель и трансмиссия",
        chassis_suspension: "Шасси и подвеска",
        air_pressure: "Пневматика",
        air_pressure_desc: "Пневматические системы и компоненты",
        body_interior: "Кузов и интерьер",
        body_interior_desc: "Кузовные панели и элементы интерьера",
        brake_system_desc: "Комплектующие тормозной системы",
        electrical_desc: "Электрические системы и проводка",
        engine_transmission_desc: "Запчасти двигателя и трансмиссии",
        chassis_suspension_desc: "Компоненты шасси и подвески",

        // Tags
        tag_247_support: "Поддержка 24/7",
        tag_50_countries: "50+ стран",
        tag_best_prices: "Лучшие цены",
        tag_brake_systems: "Тормозные системы",
        tag_bulk_discounts: "Оптовые скидки",
        tag_current_parts: "Актуальные запчасти",
        tag_customer_service: "Обслуживание клиентов",
        tag_electrical_parts: "Электрические запчасти",
        tag_expert_team: "Команда экспертов",
        tag_fast_delivery: "Быстрая доставка",
        tag_global_shipping: "Глобальная доставка",
        tag_installation_help: "Помощь в установке",
        tag_inventory: "Склад",
        tag_no_hidden_fees: "Без скрытых платежей",
        tag_oem_quality: "Качество OEM",
        tag_rare_components: "Редкие компоненты",
        tag_secure_packaging: "Надёжная упаковка",
        tag_technical_support: "Техническая поддержка",

        // About page
        about_page_title: "О нас | Inter Bus",
        about_meta_description: "Узнайте об Inter Bus - Ваш надёжный поставщик автобусных запчастей",
        about_hero_title: "О компании Inter Bus",
        about_hero_description: "Ваш надёжный партнёр по подлинным автобусным запчастям с 1998 года",
        our_story_title: "Наша история",
        our_story_p1: "Основанная в 1998 году, компания Inter Bus выросла из небольшого местного поставщика в мирового лидера в дистрибуции редких автобусных запчастей.",
        our_story_p2: "Мы специализируемся на труднодоступных компонентах для всех моделей автобусов, поддерживая обширный склад оригинальных запчастей.",
        our_story_p3: "Наша команда профессионалов гарантирует, что каждая деталь соответствует высочайшим стандартам качества.",
        our_values_title: "Наши ценности",
        our_values_description: "Принципы, которые направляют всё, что мы делаем",
        core_values: "Основные ценности",
        quality_title: "Качество",
        quality_description: "Мы не идём на компромиссы в качестве, поставляя только подлинные и сертифицированные запчасти.",
        quality_guaranteed: "Качество гарантировано",
        service_title: "Сервис",
        service_description: "Удовлетворение клиентов — в центре всего, что мы делаем.",
        expertise_title: "Экспертиза",
        expertise_description: "Наша команда привносит десятилетия совокупного опыта в индустрии автобусных запчастей.",
        our_team: "Наша команда",
        meet_team_title: "Познакомьтесь с нашей командой",
        team_description: "Преданные профессионалы за Inter Bus",
        team_member_1_name: "Александру Попеску",
        team_member_1_role: "Основатель и CEO",
        team_member_1_desc: "Более 25 лет опыта в индустрии автобусных запчастей",
        team_member_2_name: "Мария Ионеску",
        team_member_2_role: "Менеджер по операциям",
        team_member_2_desc: "Эксперт в логистике и управлении цепочками поставок",
        team_member_3_name: "Дмитрий Волков",
        team_member_3_role: "Технический директор",
        team_member_3_desc: "Специалист по инженерии автобусов и совместимости запчастей",
        by_numbers: "В цифрах",
        years_combined: "Лет совокупного опыта",
        parts_in_stock: "Запчастей на складе",
        satisfied_customers: "Довольных клиентов",
        orders_processed: "Обработанных заказов",
        trusted_worldwide: "Доверяют по всему миру",
        certified_dealer: "Сертифицированный дилер",
        customer_support: "Поддержка клиентов",
        contact_cta_title: "Готовы найти запчасти?",
        contact_cta_description: "Свяжитесь с нашей командой экспертов, чтобы найти нужные запчасти.",
        our_journey: "Наш путь",
        get_started: "Начать",
        since: "С",
        specializing_in: "Специализация на редких автобусных запчастях",
        trusted_since: "Надёжность с 1998 года",
        top_rated: "Высший рейтинг",
        customer_satisfaction: "Удовлетворённость клиентов",
        competitive_pricing: "Конкурентные цены",
        competitive_pricing_desc: "Лучшие цены на подлинные запчасти",
        extensive_inventory: "Обширный склад",
        extensive_inventory_desc: "Более 10 000 запчастей на складе",
        technical_support_desc: "Профессиональная техническая помощь",
        why_choose_title: "Почему Inter Bus",
        why_choose_subtitle: "Что делает нас особенными",
        why_us: "Почему мы",
        call_us: "Позвоните нам",
        email_us: "Напишите нам",
        chassis: "Шасси",
        trusted_by: "Нам доверяют"
    }
};

// Language functions
window.setLanguage = function(lang) {
    console.log('🌐 Setting language to:', lang);
    
    // Ensure InterBusApp is initialized
    if (!window.InterBusApp) {
        window.InterBusApp = {
            currentLanguage: 'en',
            currentUser: null,
            cart: [],
            categories: [],
            isAdmin: false
        };
        // Create alias for backward compatibility
        window.VanHoolApp = window.InterBusApp;
    }
    
    if (TRANSLATIONS[lang]) {
        window.InterBusApp.currentLanguage = lang;
        window.VanHoolApp.currentLanguage = lang; // Keep both in sync
        localStorage.setItem('interbus_language', lang);
        updateTranslations();
        updateLanguageDisplay();
        
        // Reload page content if needed
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof loadCategories === 'function') loadCategories();
        if (typeof loadCategoriesDropdown === 'function') loadCategoriesDropdown();
        
        console.log('✅ Language set successfully to:', lang);
    } else {
        console.error('❌ Translation not found for language:', lang);
    }
};

window.translate = function(key) {
    const lang = window.InterBusApp.currentLanguage;
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
    if (langElement && window.InterBusApp?.currentLanguage) {
        langElement.textContent = window.InterBusApp.currentLanguage.toUpperCase();
        console.log('🎌 Updated language display to:', window.InterBusApp.currentLanguage);
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
            window.InterBusApp.currentUser = session.user;
            
            // Check if admin
            const { data: profile } = await window.supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();
                
            window.InterBusApp.isAdmin = profile?.is_admin || false;
            
            updateNavbarForLoggedInUser(session.user);
            return session.user;
        } else {
            window.InterBusApp.currentUser = null;
            window.InterBusApp.isAdmin = false;
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
    if (window.InterBusApp.isAdmin) {
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
        <div class="px-2 py-1.5 text-sm font-medium text-gray-900 bg-red-50 rounded">
            <i class="fas fa-user-circle mr-2"></i>${capitalizedName}
        </div>
        <a href="dashboard.html" class="block px-2 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
            <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
        </a>
        ${window.InterBusApp.isAdmin ? `
            <a href="admin.html" class="block px-2 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors">
                <i class="fas fa-crown mr-2"></i>Admin
            </a>
        ` : ''}
        <button onclick="handleLogout()" class="w-full text-left block px-2 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
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
        <a href="login.html" class="block px-2 py-1.5 text-center text-sm text-gray-600 hover:text-red-600 border border-gray-300 rounded transition-colors">Login</a>
        <a href="register.html" class="block px-2 py-1.5 text-center text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium">Register</a>
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
        
        window.InterBusApp.currentUser = null;
        window.InterBusApp.isAdmin = false;
        window.InterBusApp.cart = [];
        localStorage.removeItem('interbus_cart');
        
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
    if (!window.InterBusApp.currentUser) {
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
            .eq('user_id', window.InterBusApp.currentUser.id)
            .eq('status', 'active')
            .single();
        
        if (error && error.code === 'PGRST116') {
            // Create new cart
            const { data: newCart, error: createError } = await window.supabase
                .from('carts')
                .insert({
                    user_id: window.InterBusApp.currentUser.id,
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
        
        // Update cart counter immediately
        updateCartCount();
        
        // Also update cart manager if it exists
        if (window.cartManager) {
            updateCartCountDisplay();
        }
        
    } catch (error) {
        console.error('Cart error:', error);
        showNotification('Failed to add to cart', 'error');
    }
};

// Get cart count from database and update display
async function updateCartCount() {
    if (!window.InterBusApp.currentUser) return;
    
    try {
        const { data: cart } = await window.supabase
            .from('carts')
            .select(`
                cart_items(quantity)
            `)
            .eq('user_id', window.InterBusApp.currentUser.id)
            .eq('status', 'active')
            .single();
            
        const totalItems = cart?.cart_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        
        // Update all cart counter elements
        const cartCountSelectors = [
            '#cart-count', '#cart-counter', '#mobile-cart-counter', '#cart-item-count', '.cart-count'
        ];
        
        cartCountSelectors.forEach(selector => {
            const cartCountEl = document.querySelector(selector);
            if (cartCountEl) {
                cartCountEl.textContent = totalItems;
                
                if (totalItems > 0) {
                    cartCountEl.classList.remove('hidden');
                } else {
                    cartCountEl.classList.add('hidden');
                }
            }
        });
        
        // Trigger custom event for other parts of the app
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { 
            detail: { count: totalItems } 
        }));
        
    } catch (error) {
        console.error('Cart count error:', error);
    }
}

// Global function to update cart counter from anywhere
window.updateGlobalCartCounter = function() {
    // Try both methods to ensure counter is updated
    updateCartCount();
    updateCartCountDisplay();
};

// Admin access function
window.becomeAdmin = async function() {
    if (!window.InterBusApp.currentUser) {
        alert('You must be logged in to access admin functions');
        return;
    }
    
    try {
        const { error } = await window.supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', window.InterBusApp.currentUser.id);
            
        if (error) throw error;
        
        window.InterBusApp.isAdmin = true;
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
            .order('name_en');
        
        if (error) {
            console.error('Error loading categories for mobile:', error);
            return;
        }
        
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu || !categories) return;
        
        // Find the mobile categories dropdown
        let mobileCategoriesSection = mobileMenu.querySelector('#mobile-categories-dropdown');
        
        if (mobileCategoriesSection && categories.length > 0) {
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
            
            mobileCategoriesSection.innerHTML = categories.slice(0, 8).map(category => {
                const icon = categoryIcons[category.slug] || 'fas fa-cog';
                return `
                    <a href="catalog.html?category=${category.slug}" class="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <i class="${icon} mr-2 w-3 text-xs"></i>${category.name}
                    </a>
                `;
            }).join('');
            
            // Add "View All" link if there are more categories
            if (categories.length > 8) {
                mobileCategoriesSection.innerHTML += `
                    <a href="catalog.html" class="flex items-center px-2 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition-colors border-t border-gray-100 mt-1 pt-2">
                        <i class="fas fa-arrow-right mr-2 w-3 text-xs"></i>View All Categories
                    </a>
                `;
            }
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
}

// Update cart count display
function updateCartCountDisplay() {
    if (window.cartManager) {
        const cart = window.cartManager.getCart();
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all possible cart counter elements across different pages
        const cartCountSelectors = [
            '#cart-count', '#cart-counter', '#mobile-cart-counter', '#cart-item-count', '.cart-count'
        ];
        
        cartCountSelectors.forEach(selector => {
            const cartCountEl = document.querySelector(selector);
            if (cartCountEl) {
                cartCountEl.textContent = totalItems;
                
                // Show or hide the counter based on item count
                if (totalItems > 0) {
                    cartCountEl.classList.remove('hidden');
                } else {
                    cartCountEl.classList.add('hidden');
                }
            }
        });
        
        // Trigger custom event for other parts of the app to listen to
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { 
            detail: { count: totalItems } 
        }));
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
                const authenticated = window.InterBusApp.currentUser !== null;
                console.log('🔐 Auth check:', authenticated, window.InterBusApp.currentUser?.email);
                return authenticated;
            },
            
            getUserId: () => {
                return window.InterBusApp.currentUser?.id || null;
            },
            
            getUser: () => {
                return window.InterBusApp.currentUser;
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
        try {
            const { cartManager } = await import('./cart.js');
            window.cartManager = cartManager;
        } catch (error) {
            console.warn('⚠️ Could not load cart manager:', error);
            // Create a basic cart manager fallback
            window.cartManager = {
                getCart: () => ({ items: [] }),
                getTotalItems: () => 0,
                isEmpty: () => true,
                on: () => {},
                clear: () => {}
            };
        }
        
        // Setup cart event listeners after cart manager is loaded
        if (window.cartManager && window.cartManager.on) {
            window.cartManager.on('cart_updated', function() {
                updateCartCountDisplay();
                updateCartCount();
            });
            
            window.cartManager.on('item_added', function() {
                updateCartCountDisplay();
                updateCartCount();
            });
            
            window.cartManager.on('item_removed', function() {
                updateCartCountDisplay();
                updateCartCount();
            });
            
            window.cartManager.on('cart_cleared', function() {
                updateCartCountDisplay();
                updateCartCount();
            });
        }
        
        console.log('📦 Loading Order Manager...');
        
        // Import OrderManager instance
        try {
            const { orderManager } = await import('./order-manager.js');
            window.orderManager = orderManager;
        } catch (error) {
            console.warn('⚠️ Could not load order manager:', error);
            // Create a basic order manager fallback
            window.orderManager = {
                createOrder: async () => ({ success: false, error: 'Order manager not available' }),
                getUserOrders: async () => ({ success: false, orders: [] })
            };
        }
        
        console.log('✅ All managers loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load managers:', error);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Universal Inter Bus App Initializing...');
    
    // Initialize managers first
    await initializeManagers();
    
    // Set initial language
    updateLanguageDisplay();
    updateTranslations();
    
    // Ensure language is set properly on page load
    const savedLanguage = localStorage.getItem('interbus_language') || 'en';
    if (savedLanguage !== window.InterBusApp.currentLanguage) {
        window.InterBusApp.currentLanguage = savedLanguage;
        window.VanHoolApp.currentLanguage = savedLanguage; // Keep both in sync
        updateLanguageDisplay();
        updateTranslations();
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

    // Secret admin access: triple-click logo
    (function() {
        var logoImg = document.querySelector('nav img[alt="Inter Bus"]');
        if (!logoImg) return;
        var logoLink = logoImg.closest('a');
        if (!logoLink) return;
        var clicks = 0;
        var timer = null;
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            clicks++;
            clearTimeout(timer);
            if (clicks >= 3) {
                clicks = 0;
                var email = (window.InterBusApp.currentUser && window.InterBusApp.currentUser.email) || '';
                if (email.toLowerCase().indexOf('admin') !== -1) {
                    window.location.href = 'admin.html';
                    return;
                }
                window.location.href = 'index.html';
                return;
            }
            timer = setTimeout(function() {
                clicks = 0;
                window.location.href = 'index.html';
            }, 600);
        });
    })();
    
    // Initial cart count display
    updateCartCountDisplay();
    
    // Listen for auth state changes
    window.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
            window.InterBusApp.currentUser = session.user;
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
            window.InterBusApp.currentUser = null;
            window.InterBusApp.isAdmin = false;
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
    console.log('Current user:', window.InterBusApp.currentUser?.email);
    console.log('Is admin:', window.InterBusApp.isAdmin);
    console.log('Language:', window.InterBusApp.currentLanguage);
    
    // Add console helpers
    if (window.InterBusApp.currentUser && !window.InterBusApp.isAdmin) {
        console.log('💡 To become admin, run: becomeAdmin()');
    }
    
    // Add debug helper
    window.checkAuth = () => {
        console.log('🔐 Auth status debug:');
        console.log('- InterBusApp.currentUser:', window.InterBusApp.currentUser);
        console.log('- authManager.isAuthenticated():', window.authManager?.isAuthenticated());
        console.log('- authManager.getUserId():', window.authManager?.getUserId());
    };
    
    console.log('💡 Debug authentication: run checkAuth() in console');
});

console.log('✅ Universal App System Loaded');