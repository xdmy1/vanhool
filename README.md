# Van Hool Parts - Complete E-commerce Application

A complete e-commerce application specifically designed for selling rare Van Hool bus parts and components. Features multi-language support (English, Romanian, Russian), SEO optimization for part codes, and complete user management.

## ✨ Features

### Core Features
- 🛒 **Complete E-commerce Functionality**: Product catalog, shopping cart, checkout
- 🌍 **Multi-language Support**: English, Romanian, Russian
- 🔍 **SEO Optimized**: Part codes in URLs for Google discoverability  
- 🚌 **Van Hool Specific Categories**: Brake systems, air pressure, chassis, etc.
- 👤 **User Authentication**: Registration, login, profile management
- 📱 **Responsive Design**: Works perfectly on mobile, tablet, and desktop

### Van Hool Categories
- **Brake System**: Brake pads, discs, drums, calipers, lines, valves
- **Air Pressure**: Compressors, tanks, dryers, regulators, lines
- **Chassis & Suspension**: Shock absorbers, springs, stabilizers, bushings
- **Axles & Transmission**: Drive axles, differentials, gearboxes, clutches
- **Body & Interior**: Doors, windows, seats, panels, mirrors
- **Engine & Cooling**: Radiators, fans, pumps, thermostats, filters
- **Electrical System**: Lighting, wiring, switches, batteries, sensors

### Technical Features
- 🔐 **Secure Authentication**: Supabase Auth with social login options
- 🛡️ **Row Level Security**: Database protection with RLS policies
- 💳 **Payment Integration**: Paynet payment gateway ready
- 🎯 **Admin Panel**: Comprehensive management interface
- 📊 **Analytics Ready**: Track conversions and user behavior
- ⚡ **Performance Optimized**: Fast loading with caching

## 🚀 Setup Instructions

### 1. Supabase Configuration

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your Project URL and API Key

2. **Configure Database**
   - In your Supabase dashboard, go to SQL Editor
   - Run the commands from `supabase-schema.sql` to create all tables
   - Run the commands from `initial-data.sql` to populate with sample data

3. **Setup Storage**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `product-images`
   - Make it public for product image access

4. **Configure Application**
   - Open `js/config.js`
   - Replace `SUPABASE_URL` with your project URL
   - Replace `SUPABASE_ANON_KEY` with your anon/public key

### 2. Admin Access

- The admin panel is accessible at `/admin/index.html`
- First user to register can be made admin by updating the database:
  ```sql
  UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@example.com';
  ```

### 3. Development Setup

1. **Local Development**
   - Use a local server (Live Server extension in VS Code recommended)
   - All features work offline with demo data if Supabase isn't configured

2. **Production Deployment**
   - Upload all files to your web server
   - Ensure HTTPS is enabled for Supabase authentication
   - Update the site URL in Supabase dashboard settings

## 📊 Database Schema

### Core Tables
- **products**: Product information with multi-language support
- **categories**: Hierarchical category structure  
- **profiles**: User profiles extending Supabase auth
- **orders**: Order management with status tracking
- **cart_items**: Shopping cart persistence
- **reviews**: Product reviews and ratings
- **promo_codes**: Discount code system

## 🔧 Configuration Options

### Payment Methods (in `js/config.js`)
- **Paynet**: Primary payment gateway
- **Cash on Delivery**: For local orders  
- **Bank Transfer**: For larger orders

### Languages
Supported languages with complete translations:
- **English** (en) - Default
- **Romanian** (ro) - Complete translations
- **Russian** (ru) - Complete translations

## 🔐 Security Features

- **Authentication**: Supabase Auth with social login
- **Row Level Security**: Database-level access control
- **Input Validation**: Frontend and backend validation
- **CSRF Protection**: Built-in Supabase protection

## 📈 SEO Optimization

- Part codes included in product URLs for Google discoverability
- Sitemap.xml for search engine indexing
- Meta tags optimized for Van Hool parts
- Mobile-first responsive design

## 🔧 Troubleshooting

### Common Issues

1. **Supabase Connection Fails**
   - Check your project URL and API key in config.js
   - Verify your project is not paused in Supabase dashboard

2. **Products Not Loading**
   - Ensure database schema is properly created
   - Check if sample data is inserted
   - Verify RLS policies are correctly set

3. **Authentication Issues**
   - Check Supabase Auth settings
   - Verify site URL is configured correctly
   - Ensure HTTPS is used in production

## 📞 Support

For questions or issues with this Van Hool Parts application:

- **Email**: contact@vanhoolparts.com
- **Phone**: +31 20 123 4567
- **Address**: Bernard Connellystraat 86, 2500 Lier, Belgium

---

**Built with**: Supabase, Tailwind CSS, Vanilla JavaScript
**Optimized for**: Van Hool bus parts, Multi-language support, SEO performance