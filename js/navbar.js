// Universal navbar authentication system
console.log('🔗 Loading navbar authentication...');

// Initialize Supabase
const supabase = window.supabase.createClient(
    'https://iqsfmofoezkdnmhbxwbn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2Ztb2ZvZXprZG5taGJ4d2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTA3MTksImV4cCI6MjA3OTEyNjcxOX0.w6BinbOGMZPTxyQ2e65bnSuEeQ59NQOPOtDW56I'
);

let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Navbar: DOM loaded, checking auth status');
    setTimeout(() => {
        checkUserAuth();
    }, 500);
});

async function checkUserAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
            console.log('✅ Navbar: User is logged in:', session.user.email);
            currentUser = session.user;
            updateNavbarForLoggedInUser(session.user);
        } else {
            console.log('❌ Navbar: User not logged in');
            updateNavbarForGuest();
        }
    } catch (error) {
        console.error('Navbar auth check error:', error);
        updateNavbarForGuest();
    }
}

function updateNavbarForLoggedInUser(user) {
    // Get the first name from email
    const firstName = user.email.split('@')[0].split('.')[0];
    const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    
    // Find login/register links and replace them
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const registerLinks = document.querySelectorAll('a[href="register.html"]');
    
    // Replace login link with user menu
    loginLinks.forEach(link => {
        const userMenu = document.createElement('div');
        userMenu.className = 'relative';
        userMenu.innerHTML = `
            <button class="flex items-center space-x-2 text-gray-700 hover:text-blue-600" onclick="toggleUserDropdown()">
                <i class="fas fa-user-circle text-xl"></i>
                <span>${capitalizedName}</span>
                <i class="fas fa-chevron-down text-sm"></i>
            </button>
            <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <a href="dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                </a>
                <a href="catalog.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fas fa-shopping-bag mr-2"></i>Shop
                </a>
                <div class="border-t border-gray-100"></div>
                <button onclick="handleLogout()" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        `;
        link.parentNode.replaceChild(userMenu, link);
    });
    
    // Hide register links
    registerLinks.forEach(link => {
        link.style.display = 'none';
    });
}

function updateNavbarForGuest() {
    // Nothing to do - keep default login/register links
    console.log('🔄 Navbar: Keeping guest navigation');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown && !event.target.closest('[onclick="toggleUserDropdown()"]')) {
        dropdown.classList.add('hidden');
    }
});

async function handleLogout() {
    try {
        console.log('🚪 Logging out user...');
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Logout error:', error);
            alert('Error logging out: ' + error.message);
        } else {
            console.log('✅ Successfully logged out');
            // Redirect to home
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out');
    }
}