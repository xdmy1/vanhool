// Multi-language support system for Van Hool Parts
const TRANSLATIONS = {
    en: {
        // Navigation
        categories: "Categories",
        search_parts: "Search parts by code or name...",
        login: "Login",
        register: "Register",
        cart: "Cart",
        
        // Hero section
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
        
        // Van Hool Categories
        brake_system: "Brake System",
        brake_pads: "Brake Pads",
        brake_discs: "Brake Discs",
        brake_calipers: "Brake Calipers",
        brake_calipers_accessories: "Brake Calipers & Accessories",
        wear_indicators: "Wear Indicators",
        brake_cylinders: "Brake Cylinders",
        brake_drums: "Brake Drums",
        brake_shoes_accessories: "Brake Shoes & Accessories",
        
        air_pressure: "Air Pressure",
        compressors_accessories: "Compressors & Accessories",
        valves: "Valves",
        air_couplings: "Air Couplings",
        air_treatment: "Air Treatment",
        abs_ebs: "ABS-EBS",
        
        chassis_suspension: "Chassis & Suspension",
        shock_absorbers: "Shock Absorbers",
        reaction_rod: "Reaction Rod",
        leaf_spring: "Leaf Spring",
        air_suspension: "Air Suspension",
        stabilizer_triangle: "Stabilizer Triangle",
        connection_stabilizer_bar: "Connection – Stabilizer Bar",
        
        electrical: "Electrical",
        alternators: "Alternators",
        starters: "Starters",
        batteries: "Batteries",
        exterior_lighting: "Exterior Lighting",
        interior_lighting: "Interior Lighting",
        electrical_accessories: "Electrical Accessories",
        
        cooling: "Cooling",
        distribution: "Distribution",
        filters: "Filters",
        turbo_intercoolers: "Turbo & Intercoolers",
        exhaust: "Exhaust",
        adblue: "AdBlue",
        engine: "Engine",
        original_man_filters: "Original MAN Filters",
        
        clutch_gearbox: "Clutch & Gearbox",
        clutch: "Clutch",
        clutch_control: "Clutch Control",
        gearbox: "Gearbox",
        transmission: "Transmission",
        
        steering_axles: "Steering & Axles",
        steering_dampers: "Steering Dampers",
        steering_knuckle: "Steering Knuckle",
        steering_rods: "Steering Rods",
        track_rods: "Track Rods",
        hubs_accessories: "Hubs & Accessories",
        steering_gearboxes: "Steering Gearboxes",
        
        bodywork: "Bodywork",
        mirrors: "Mirrors",
        wipers: "Wipers",
        bumpers_side_panels: "Bumpers & Side Panels",
        sheet_metal: "Sheet Metal",
        windows: "Windows",
        roof_hatches: "Roof Hatches",
        wheels_rims: "Wheels & Rims",
        
        hvac: "HVAC",
        air_conditioning: "Air Conditioning",
        heating: "Heating",
        
        interior: "Interior",
        seatbelts: "Seatbelts",
        seats: "Seats",
        sanitary: "Sanitary",
        
        silicone_hose: "Silicone Hose",
        silicone_hose_straight: "Silicone Hose Straight",
        silicone_hose_90: "Silicone Hose 90°",
        silicone_hose_135: "Silicone Hose 135°",
        silicone_hose_coupler: "Silicone Hose Coupler",
        silicone_hose_special_shape: "Silicone Hose Special Shape",
        silicone_hose_straight_reducer: "Silicone Hose Straight Reducer",
        silicone_hose_elbow_reducer: "Silicone Hose Elbow Reducer",
        clamp: "Clamp",
        
        abc_raufoss_air_couplings: "ABC Raufoss Air Couplings",
        push_in_new_line: "Push-In New Line",
        push_in_wireless: "Push-In Wireless",
        bulkhead_coupling: "Bulkhead Coupling",
        swivel: "Swivel",
        rotolock: "Rotolock",
        push_in_90_abc: "Push-In 90° ABC",
        connector: "Connector",
        coupling_45: "45° Coupling",
        
        // Product page
        part_code: "Part Code",
        availability: "Availability",
        in_stock: "In Stock",
        out_of_stock: "Out of Stock",
        add_to_cart: "Add to Cart",
        description: "Description",
        specifications: "Specifications",
        weight: "Weight",
        dimensions: "Dimensions",
        
        // Cart
        cart_empty: "Your cart is empty",
        cart_total: "Total",
        checkout: "Checkout",
        continue_shopping: "Continue Shopping",
        
        // Footer
        about_us: "About Us",
        shipping_returns: "Shipping & Returns",
        warranty: "Warranty",
        privacy_policy: "Privacy Policy",

        // Catalog
        catalog: "Catalog",
        price_min: "Min",
        price_max: "Max"
    },

    ro: {
        // Navigation
        categories: "Categorii",
        search_parts: "Căutați piese după cod sau nume...",
        login: "Autentificare",
        register: "Înregistrare",
        cart: "Coș",
        
        // Hero section
        hero_title: "Piese Rare Van Hool",
        hero_subtitle: "Furnizor specializat de piese Van Hool autentice. Componente greu de găsit pentru toate modelele de autobuze Van Hool cu livrare în toată lumea.",
        view_catalog: "Vezi Catalogul",
        contact_us: "Contactează-ne",
        parts_available: "Piese Disponibile",
        countries_served: "Țări Deservite",
        years_experience: "Ani de Experiență",
        
        // Categories
        popular_categories: "Categorii Populare",
        featured_parts: "Piese Recomandate",
        featured_parts_desc: "Descoperă cele mai populare piese Van Hool. Toate piesele vin cu specificații detaliate și numere de piese autentice.",
        see_all_parts: "Vezi Toate Piesele",
        
        // Van Hool Categories
        brake_system: "Sistem Frânare",
        brake_pads: "Placuțe Frână",
        brake_discs: "Discuri Frână",
        brake_calipers: "Etriere Frână",
        brake_calipers_accessories: "Etriere Frână și Accesorii",
        wear_indicators: "Indicatori Uzură",
        brake_cylinders: "Cilindri Frână",
        brake_drums: "Tobe Frână",
        brake_shoes_accessories: "Saboti Frână și Accesorii",
        
        air_pressure: "Presiune Aer",
        compressors_accessories: "Compresoare și Accesorii",
        valves: "Supape",
        air_couplings: "Cuplaje Aer",
        air_treatment: "Tratarea Aerului",
        abs_ebs: "ABS-EBS",
        
        chassis_suspension: "Șasiu și Suspensie",
        shock_absorbers: "Amortizoare",
        reaction_rod: "Bară Reacție",
        leaf_spring: "Arc Lamă",
        air_suspension: "Suspensie Pneumatică",
        stabilizer_triangle: "Triunghi Stabilizator",
        connection_stabilizer_bar: "Conexiune – Bară Stabilizatoare",
        
        electrical: "Sistem Electric",
        alternators: "Alternatoare",
        starters: "Startere",
        batteries: "Baterii",
        exterior_lighting: "Iluminat Exterior",
        interior_lighting: "Iluminat Interior",
        electrical_accessories: "Accesorii Electrice",
        
        cooling: "Răcire",
        distribution: "Distribuție",
        filters: "Filtre",
        turbo_intercoolers: "Turbo și Intercoolers",
        exhaust: "Eșapament",
        adblue: "AdBlue",
        engine: "Motor",
        original_man_filters: "Filtre Originale MAN",
        
        clutch_gearbox: "Ambreiaj și Cutie Viteze",
        clutch: "Ambreiaj",
        clutch_control: "Control Ambreiaj",
        gearbox: "Cutie Viteze",
        transmission: "Transmisie",
        
        steering_axles: "Direcție și Punți",
        steering_dampers: "Amortizoare Direcție",
        steering_knuckle: "Fuzeta Direcție",
        steering_rods: "Bare Direcție",
        track_rods: "Bare Tăvălugire",
        hubs_accessories: "Butuc și Accesorii",
        steering_gearboxes: "Cutii Direcție",
        
        bodywork: "Caroserie",
        mirrors: "Oglinzi",
        wipers: "Ștergătoare",
        bumpers_side_panels: "Tampon și Panouri Laterale",
        sheet_metal: "Tablă",
        windows: "Ferestre",
        roof_hatches: "Capac Plafon",
        wheels_rims: "Roți și Jante",
        
        hvac: "HVAC",
        air_conditioning: "Aer Condiționat",
        heating: "Încălzire",
        
        interior: "Interior",
        seatbelts: "Centuri Siguranță",
        seats: "Scaune",
        sanitary: "Sanitar",
        
        silicone_hose: "Furtun Siliconic",
        silicone_hose_straight: "Furtun Siliconic Drept",
        silicone_hose_90: "Furtun Siliconic 90°",
        silicone_hose_135: "Furtun Siliconic 135°",
        silicone_hose_coupler: "Cuplor Furtun Siliconic",
        silicone_hose_special_shape: "Furtun Siliconic Formă Specială",
        silicone_hose_straight_reducer: "Reducție Furtun Siliconic Drept",
        silicone_hose_elbow_reducer: "Reducție Furtun Siliconic Cot",
        clamp: "Colier",
        
        abc_raufoss_air_couplings: "Cuplaje Aer ABC Raufoss",
        push_in_new_line: "Push-In New Line",
        push_in_wireless: "Push-In Wireless",
        bulkhead_coupling: "Cuplaj Perete",
        swivel: "Rotativ",
        rotolock: "Rotolock",
        push_in_90_abc: "Push-In 90° ABC",
        connector: "Conector",
        coupling_45: "Cuplaj 45°",
        
        // Product page
        part_code: "Cod Piesă",
        availability: "Disponibilitate",
        in_stock: "În Stoc",
        out_of_stock: "Stoc Epuizat",
        add_to_cart: "Adaugă în Coș",
        description: "Descriere",
        specifications: "Specificații",
        weight: "Greutate",
        dimensions: "Dimensiuni",
        
        // Cart
        cart_empty: "Coșul este gol",
        cart_total: "Total",
        checkout: "Finalizare",
        continue_shopping: "Continuă Cumpărăturile",
        
        // Footer
        about_us: "Despre Noi",
        shipping_returns: "Livrare și Returnări",
        warranty: "Garanție",
        privacy_policy: "Politica de Confidențialitate",

        // Catalog
        catalog: "Catalog",
        price_min: "Min",
        price_max: "Max"
    },

    ru: {
        // Navigation
        categories: "Категории",
        search_parts: "Поиск запчастей по коду или названию...",
        login: "Войти",
        register: "Регистрация",
        cart: "Корзина",
        
        // Hero section
        hero_title: "Редкие запчасти Van Hool",
        hero_subtitle: "Специализированный поставщик оригинальных запчастей Van Hool. Труднодоступные компоненты для всех моделей автобусов Van Hool с доставкой по всему миру.",
        view_catalog: "Посмотреть каталог",
        contact_us: "Связаться с нами",
        parts_available: "Доступных запчастей",
        countries_served: "Обслуживаемых стран",
        years_experience: "Лет опыта",
        
        // Categories
        popular_categories: "Популярные категории",
        featured_parts: "Рекомендуемые запчасти",
        featured_parts_desc: "Откройте для себя самые популярные запчасти Van Hool. Все запчасти поставляются с подробными характеристиками и подлинными номерами запчастей.",
        see_all_parts: "Смотреть все запчасти",
        
        // Van Hool Categories
        brake_system: "Тормозная система",
        brake_pads: "Тормозные колодки",
        brake_discs: "Тормозные диски",
        brake_calipers: "Тормозные суппорты",
        brake_calipers_accessories: "Тормозные суппорты и аксессуары",
        wear_indicators: "Индикаторы износа",
        brake_cylinders: "Тормозные цилиндры",
        brake_drums: "Тормозные барабаны",
        brake_shoes_accessories: "Тормозные колодки и аксессуары",
        
        air_pressure: "Пневматика",
        compressors_accessories: "Компрессоры и аксессуары",
        valves: "Клапаны",
        air_couplings: "Пневмосоединения",
        air_treatment: "Обработка воздуха",
        abs_ebs: "АБС-ЕБС",
        
        chassis_suspension: "Шасси и подвеска",
        shock_absorbers: "Амортизаторы",
        reaction_rod: "Реактивная тяга",
        leaf_spring: "Рессора",
        air_suspension: "Пневмоподвеска",
        stabilizer_triangle: "Треугольник стабилизатора",
        connection_stabilizer_bar: "Соединение – стабилизатор",
        
        electrical: "Электрооборудование",
        alternators: "Генераторы",
        starters: "Стартеры",
        batteries: "Батареи",
        exterior_lighting: "Наружное освещение",
        interior_lighting: "Внутреннее освещение",
        electrical_accessories: "Электрические аксессуары",
        
        cooling: "Охлаждение",
        distribution: "Газораспределение",
        filters: "Фильтры",
        turbo_intercoolers: "Турбо и интеркулеры",
        exhaust: "Выхлопная система",
        adblue: "AdBlue",
        engine: "Двигатель",
        original_man_filters: "Оригинальные фильтры MAN",
        
        clutch_gearbox: "Сцепление и КПП",
        clutch: "Сцепление",
        clutch_control: "Управление сцеплением",
        gearbox: "Коробка передач",
        transmission: "Трансмиссия",
        
        steering_axles: "Рулевое управление и оси",
        steering_dampers: "Демпферы рулевого управления",
        steering_knuckle: "Поворотный кулак",
        steering_rods: "Рулевые тяги",
        track_rods: "Продольные тяги",
        hubs_accessories: "Ступицы и аксессуары",
        steering_gearboxes: "Рулевые редукторы",
        
        bodywork: "Кузов",
        mirrors: "Зеркала",
        wipers: "Стеклоочистители",
        bumpers_side_panels: "Бамперы и боковые панели",
        sheet_metal: "Листовой металл",
        windows: "Стекла",
        roof_hatches: "Люки крыши",
        wheels_rims: "Колеса и диски",
        
        hvac: "HVAC",
        air_conditioning: "Кондиционирование",
        heating: "Отопление",
        
        interior: "Интерьер",
        seatbelts: "Ремни безопасности",
        seats: "Сиденья",
        sanitary: "Санитария",
        
        silicone_hose: "Силиконовый шланг",
        silicone_hose_straight: "Прямой силиконовый шланг",
        silicone_hose_90: "Силиконовый шланг 90°",
        silicone_hose_135: "Силиконовый шланг 135°",
        silicone_hose_coupler: "Соединитель силиконового шланга",
        silicone_hose_special_shape: "Силиконовый шланг специальной формы",
        silicone_hose_straight_reducer: "Прямой переходник силиконового шланга",
        silicone_hose_elbow_reducer: "Угловой переходник силиконового шланга",
        clamp: "Хомут",
        
        abc_raufoss_air_couplings: "Пневмосоединения ABC Raufoss",
        push_in_new_line: "Push-In New Line",
        push_in_wireless: "Push-In Wireless",
        bulkhead_coupling: "Переборочное соединение",
        swivel: "Поворотное",
        rotolock: "Rotolock",
        push_in_90_abc: "Push-In 90° ABC",
        connector: "Соединитель",
        coupling_45: "Соединение 45°",
        
        // Product page
        part_code: "Код запчасти",
        availability: "Наличие",
        in_stock: "В наличии",
        out_of_stock: "Нет в наличии",
        add_to_cart: "В корзину",
        description: "Описание",
        specifications: "Характеристики",
        weight: "Вес",
        dimensions: "Размеры",
        
        // Cart
        cart_empty: "Корзина пуста",
        cart_total: "Итого",
        checkout: "Оформить",
        continue_shopping: "Продолжить покупки",
        
        // Footer
        about_us: "О нас",
        shipping_returns: "Доставка и возврат",
        warranty: "Гарантия",
        privacy_policy: "Политика конфиденциальности",

        // Catalog
        catalog: "Каталог",
        price_min: "Мин",
        price_max: "Макс"
    }
};

// Translation system class
class TranslationManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.translations = TRANSLATIONS;
    }
    
    getStoredLanguage() {
        return localStorage.getItem('van_hool_language');
    }
    
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            localStorage.setItem('van_hool_language', language);
            this.updatePageTranslations();
            this.updateLanguageDisplay();
        }
    }
    
    translate(key) {
        const translation = this.translations[this.currentLanguage];
        return translation[key] || this.translations['en'][key] || key;
    }
    
    updatePageTranslations() {
        // Update elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = this.translate(key);
        });
        
        // Update placeholder attributes
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            element.placeholder = this.translate(key);
        });
    }
    
    updateLanguageDisplay() {
        const langDisplay = document.getElementById('current-lang');
        if (langDisplay) {
            langDisplay.textContent = this.currentLanguage.toUpperCase();
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }
    
    init() {
        this.updatePageTranslations();
        this.updateLanguageDisplay();
    }
}

// Create global instance
const translationManager = new TranslationManager();

// Global functions for language switching
window.setLanguage = (language) => {
    translationManager.setLanguage(language);
};

window.translate = (key) => {
    return translationManager.translate(key);
};

// Initialize translations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 Initializing translations...');
    translationManager.init();
});

// Make globally available
window.translationManager = translationManager;