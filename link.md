# Van Hool Parts - Secret Admin Access

## Admin Access Information

**Secret Admin URL:** [admin.html](admin.html)

**Default Admin Credentials:**
- **Username:** admin@vanhoolparts.com
- **Password:** VanHool2024!

**Admin Features:**
- Product Management (Add, Edit, Remove products with images and specifications)
- Promo Code Management (Create codes with discount percentages and usage limits)
- Order Management (View order details, update status, track payments)
- User Management (View user registration data, manage admin privileges)
- Analytics Dashboard (Revenue statistics, payment history, performance reports)
- Category Management (Organize product categories and subcategories)

**Security Notes:**
- Admin access is protected by Row Level Security (RLS)
- All admin activities are logged for audit purposes
- Only authenticated users with `is_admin = true` can access admin functions

**Grant Admin Access:**
1. Register/Login as a normal user first
2. Go to [admin.html](admin.html)
3. Click "Grant Admin Access" button (for demo purposes)
4. Refresh the page to access full admin functionality

**Database Setup:**
Run the `admin-database-update.sql` file in your Supabase SQL editor to create all necessary tables and security policies.

---
*This is a confidential document. Do not share admin credentials.*