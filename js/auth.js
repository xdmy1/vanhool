// Authentication Manager
class AuthManager {
    constructor() {
        this.user = null;
        this.session = null;
        this.listeners = [];
        this.redirectAfterLogin = '/';
        this.isInitialized = false;
        
        this.init();
    }
    
    async waitForSupabase(maxAttempts = 50) {
        return new Promise((resolve) => {
            let attempts = 0;
            const checkSupabase = () => {
                if (supabase && supabase.auth) {
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkSupabase, 100);
                } else {
                    console.warn('Supabase client not available after maximum attempts');
                    resolve();
                }
            };
            checkSupabase();
        });
    }
    
    async init() {
        try {
            // Wait for Supabase to be initialized
            if (!supabase) {
                await this.waitForSupabase();
            }
            
            // Check for existing session
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Error getting session:', error);
            }
            
            await this.handleAuthState(session);
            
            // Listen for auth state changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth state changed:', event);
                await this.handleAuthState(session);
                
                // Handle specific events
                if (event === 'SIGNED_IN') {
                    this.onSignIn();
                } else if (event === 'SIGNED_OUT') {
                    this.onSignOut();
                }
            });
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Auth initialization error:', error);
        }
    }
    
    async handleAuthState(session) {
        this.session = session;
        
        if (session?.user) {
            // User is signed in - load profile
            await this.loadUserProfile(session.user.id);
        } else {
            // User is signed out
            this.user = null;
        }
        
        this.notifyListeners();
        this.updateUI();
    }
    
    async loadUserProfile(userId) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error) {
                // Profile doesn't exist - create one
                if (error.code === 'PGRST116') {
                    await this.createUserProfile(userId);
                    return;
                }
                throw error;
            }
            
            this.user = {
                id: userId,
                email: this.session.user.email,
                ...profile
            };
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Continue with basic user info even if profile loading fails
            this.user = {
                id: userId,
                email: this.session.user.email,
                full_name: this.session.user.user_metadata?.full_name || '',
                phone: this.session.user.user_metadata?.phone || '',
                is_admin: false
            };
        }
    }
    
    async createUserProfile(userId) {
        try {
            const profileData = {
                id: userId,
                email: this.session.user.email,
                full_name: this.session.user.user_metadata?.full_name || '',
                phone: this.session.user.user_metadata?.phone || '',
                is_admin: false
            };
            
            const { data, error } = await supabase
                .from('profiles')
                .insert(profileData)
                .select()
                .single();
                
            if (error) throw error;
            
            this.user = {
                id: userId,
                email: this.session.user.email,
                ...data
            };
            
        } catch (error) {
            console.error('Error creating user profile:', error);
            // Fallback to basic user info
            this.user = {
                id: userId,
                email: this.session.user.email,
                full_name: this.session.user.user_metadata?.full_name || '',
                phone: this.session.user.user_metadata?.phone || '',
                is_admin: false
            };
        }
    }
    
    async login(email, password, rememberMe = false) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password
            });
            
            if (error) throw error;
            
            // Store remember preference
            if (rememberMe) {
                UTILS.storage.set('remember_me', true);
            }
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error)
            };
        }
    }
    
    async register(userData) {
        try {
            // Validate data
            const validation = this.validateRegistrationData(userData);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }
            
            const { data, error } = await supabase.auth.signUp({
                email: userData.email.trim().toLowerCase(),
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.fullName.trim(),
                        phone: userData.phone?.trim() || ''
                    }
                }
            });
            
            if (error) throw error;
            
            return {
                success: true,
                data,
                message: 'Contul a fost creat cu succes. Verificați email-ul pentru confirmare.'
            };
            
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error)
            };
        }
    }
    
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Clear local data on logout
            this.clearUserData();
            
            return { success: true };
            
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }
    
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Link de resetare trimis pe email'
            };
            
        } catch (error) {
            console.error('Password reset error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error)
            };
        }
    }
    
    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Parola a fost actualizată cu succes'
            };
            
        } catch (error) {
            console.error('Password update error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error)
            };
        }
    }
    
    async updateProfile(profileData) {
        try {
            if (!this.user) {
                throw new Error('User not authenticated');
            }
            
            // Update auth metadata if needed
            const authUpdates = {};
            if (profileData.fullName && profileData.fullName !== this.user.full_name) {
                authUpdates.data = { full_name: profileData.fullName };
            }
            
            if (Object.keys(authUpdates).length > 0) {
                const { error: authError } = await supabase.auth.updateUser(authUpdates);
                if (authError) throw authError;
            }
            
            // Update profile table
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    full_name: profileData.fullName,
                    phone: profileData.phone,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.user.id)
                .select()
                .single();
                
            if (error) throw error;
            
            // Update local user data
            this.user = {
                ...this.user,
                ...data
            };
            
            this.notifyListeners();
            this.updateUI();
            
            return {
                success: true,
                message: 'Profilul a fost actualizat cu succes',
                data
            };
            
        } catch (error) {
            console.error('Profile update error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error)
            };
        }
    }
    
    validateRegistrationData(userData) {
        const errors = [];
        
        // Email validation
        if (!userData.email || !UTILS.isValidEmail(userData.email)) {
            errors.push('Email invalid');
        }
        
        // Password validation
        if (!userData.password || userData.password.length < CONFIG.minPasswordLength) {
            errors.push(`Parola trebuie să aibă minim ${CONFIG.minPasswordLength} caractere`);
        }
        
        if (userData.password !== userData.confirmPassword) {
            errors.push('Parolele nu se potrivesc');
        }
        
        // Name validation
        if (!userData.fullName || userData.fullName.trim().length < 2) {
            errors.push('Numele complet este obligatoriu');
        }
        
        // Phone validation (optional)
        if (userData.phone && !UTILS.isValidPhone(userData.phone)) {
            errors.push('Numărul de telefon nu este valid');
        }
        
        // Terms acceptance
        if (!userData.acceptTerms) {
            errors.push('Trebuie să acceptați termenii și condițiile');
        }
        
        return {
            valid: errors.length === 0,
            error: errors.join(', ')
        };
    }
    
    getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'Email sau parolă incorectă',
            'Email not confirmed': 'Email-ul nu a fost confirmat. Verificați inbox-ul.',
            'User already registered': 'Un cont cu acest email există deja',
            'Password should be at least 6 characters': 'Parola trebuie să aibă minim 6 caractere',
            'Unable to validate email address: invalid format': 'Format email invalid',
            'Signup is disabled': 'Înregistrarea este temporar dezactivată'
        };
        
        return errorMessages[error.message] || error.message || 'A apărut o eroare neașteptată';
    }
    
    // Admin protection
    requireAdmin() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        
        if (!this.isAdmin()) {
            window.location.href = '/';
            return false;
        }
        
        return true;
    }
    
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }
    
    redirectToLogin(returnUrl = null) {
        const redirect = returnUrl || window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`;
    }
    
    clearUserData() {
        // Clear cart if it belongs to logged-in user
        if (window.cartManager && this.user) {
            window.cartManager.clear();
        }
        
        // Clear other user-specific data
        UTILS.storage.remove('recently_viewed');
        UTILS.storage.remove('user_preferences');
        UTILS.storage.remove('remember_me');
    }
    
    onSignIn() {
        // Handle successful sign in
        const redirect = UTILS.getQueryParam('redirect');
        if (redirect && redirect !== '/login' && redirect !== '/register') {
            window.location.href = decodeURIComponent(redirect);
        } else {
            window.location.href = this.redirectAfterLogin;
        }
    }
    
    onSignOut() {
        // Handle sign out
        if (window.location.pathname.includes('admin.html') || 
            window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
    }
    
    // UI Updates
    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        if (!authButtons) return;
        
        if (this.user) {
            authButtons.innerHTML = this.getAuthenticatedUserUI();
        } else {
            authButtons.innerHTML = this.getGuestUserUI();
        }
        
        // Update mobile menu if exists
        this.updateMobileAuthUI();
    }
    
    getAuthenticatedUserUI() {
        const userName = this.user.full_name || this.user.email.split('@')[0];
        return `
            <div class="relative group">
                <button class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-md">
                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        ${userName.charAt(0).toUpperCase()}
                    </div>
                    <span class="hidden sm:block">${userName}</span>
                    <svg class="w-4 h-4 transform group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                
                <div class="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md hidden group-hover:block z-50">
                    <div class="py-2">
                        <a href="dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Contul Meu
                        </a>
                        <a href="dashboard.html#orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                            Comenzile Mele
                        </a>
                        ${this.isAdmin() ? `
                            <hr class="my-1">
                            <a href="admin.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Administrare
                            </a>
                        ` : ''}
                        <hr class="my-1">
                        <button onclick="authManager.logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                            Deconectare
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getGuestUserUI() {
        return `
            <div class="flex items-center space-x-2">
                <a href="login.html" class="text-gray-700 hover:text-blue-600 text-sm py-2 px-3 rounded-md transition-colors">
                    Login
                </a>
                <a href="register.html" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                    Înregistrare
                </a>
            </div>
        `;
    }
    
    updateMobileAuthUI() {
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu) return;
        
        const authSection = mobileMenu.querySelector('.auth-section');
        if (authSection) {
            authSection.remove();
        }
        
        const authDiv = document.createElement('div');
        authDiv.className = 'auth-section border-t pt-2 mt-2';
        
        if (this.user) {
            authDiv.innerHTML = `
                <div class="px-3 py-2">
                    <div class="text-sm font-semibold text-gray-900">${this.user.full_name || this.user.email}</div>
                    <div class="text-xs text-gray-500">${this.user.email}</div>
                </div>
                <a href="dashboard.html" class="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-md">Contul Meu</a>
                <a href="dashboard.html#orders" class="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-md">Comenzile Mele</a>
                ${this.isAdmin() ? '<a href="admin.html" class="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-md">Administrare</a>' : ''}
                <button onclick="authManager.logout()" class="block w-full text-left py-2 px-3 text-red-600 hover:bg-red-50 rounded-md">Deconectare</button>
            `;
        } else {
            authDiv.innerHTML = `
                <a href="login.html" class="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-md">Login</a>
                <a href="register.html" class="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded-md">Înregistrare</a>
            `;
        }
        
        mobileMenu.appendChild(authDiv);
    }
    
    // Event listeners
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.user, this.session);
            } catch (error) {
                console.error('Auth listener error:', error);
            }
        });
    }
    
    // Getters
    isAuthenticated() {
        return !!this.session && !!this.user;
    }
    
    isAdmin() {
        return this.user?.is_admin || false;
    }
    
    getUser() {
        return this.user;
    }
    
    getSession() {
        return this.session;
    }
    
    getUserId() {
        return this.user?.id || null;
    }
    
    getUserEmail() {
        return this.user?.email || null;
    }
    
    getIsInitialized() {
        return this.isInitialized;
    }
}

// Make AuthManager available globally
window.AuthManager = AuthManager;