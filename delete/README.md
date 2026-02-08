# Karinderya Inventory & Sales Management System (Supabase Version)

A modern, cloud-based inventory and sales management system designed for Filipino karinderya businesses. Built with HTML/CSS/JavaScript and Supabase (PostgreSQL), deployable on Vercel.

## 🌟 Features

### 📊 Dashboard
- Daily, weekly, and monthly sales summaries
- Low stock alerts
- Interactive charts (sales by ulam, sales trends, inventory categories)
- Real-time business overview

### 📦 Inventory Management
- Manage ulam (dishes) with recipes
- Track ingredients with stock levels
- Automatic available servings calculation
- Low stock indicators
- Category-based organization

### 🛒 Sales Manager
- Quick sales recording
- Automatic stock deduction via PostgreSQL stored procedures
- Daily sales summary
- Sales history with delete and restore functionality

### 👥 Admin Accounts (Admin Only)
- User management
- Role-based access control (Admin/Staff)
- Supabase Auth integration

### ⚙️ Settings
- Change username
- Change password
- User profile management

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla ES6+)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Authentication**: Supabase Auth (JWT-based)
- **Charts**: Chart.js 4.4.0
- **Deployment**: Vercel (Static Site)

## 📋 Prerequisites

- Supabase account (free tier available)
- Vercel account (optional, for deployment)
- Modern web browser
- Git (for version control)

## 🛠️ Installation & Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be provisioned (takes ~2 minutes)

### Step 2: Set Up Database

1. In your Supabase project, go to the SQL Editor
2. Run the following SQL files in order:
   - `supabase/schema.sql` - Creates tables, indexes, and stored procedures
   - `supabase/policies.sql` - Sets up Row Level Security policies
   - `supabase/seed.sql` - Inserts sample data (optional)

### Step 3: Configure Application

1. Open `public/assets/js/config.js`
2. Replace the placeholders with your Supabase credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_URL', // From Project Settings > API
       anonKey: 'YOUR_SUPABASE_ANON_KEY' // From Project Settings > API
   };
   ```

### Step 4: Create Admin User

Since users are managed via Supabase Auth, you need to create the first admin user manually:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" and create a user with email: `admin@karinderya.local` and password of your choice
3. Note the user's UUID
4. Go to SQL Editor and run:
   ```sql
   INSERT INTO users (auth_id, username, role)
   VALUES ('USER_UUID_HERE', 'admin', 'admin');
   ```

### Step 5: Run Locally

1. Open `public/index.html` in a web browser
2. Or use a local server:
   ```bash
   # Using Python
   cd public
   python -m http.server 8000
   
   # Using Node.js
   npx serve public
   ```
3. Access at `http://localhost:8000`

### Step 6: Deploy to Vercel (Optional)

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the project root
3. Follow the prompts
4. Your app will be deployed!

Alternatively, connect your GitHub repository to Vercel for automatic deployments.

## 📁 Project Structure

```
Cinventory-Supabase/
├── public/
│   ├── index.html                  # Login page
│   ├── register.html               # Registration page
│   ├── dashboard.html              # Dashboard
│   ├── inventory.html              # Inventory management
│   ├── sales.html                  # Sales manager
│   ├── admin-accounts.html         # User management (admin only)
│   ├── settings.html               # User settings
│   └── assets/
│       ├── css/
│       │   └── style.css           # Main stylesheet
│       └── js/
│           ├── config.js           # Supabase configuration
│           ├── supabase-client.js  # Supabase client init
│           ├── auth.js             # Authentication utilities
│           ├── utils.js            # Helper functions
│           ├── dashboard.js        # Dashboard logic
│           ├── inventory.js        # Inventory logic
│           ├── sales.js            # Sales logic
│           ├── admin-accounts.js   # User management logic
│           ├── settings.js         # Settings logic
│           ├── dark-mode.js        # Dark mode toggle
│           ├── mobile-menu.js      # Mobile navigation
│           ├── tsparticles.min.js  # Particle effects
│           └── particles-config.js # Particle configuration
├── supabase/
│   ├── schema.sql                  # PostgreSQL schema
│   ├── policies.sql                # Row Level Security policies
│   └── seed.sql                    # Sample data
├── docs/
│   ├── supabase-setup.md           # Detailed Supabase setup guide
│   ├── migration-notes.md          # Migration from PHP version
│   └── api-mapping.md              # API endpoint mappings
├── vercel.json                     # Vercel configuration
└── README.md                       # This file
```

## 🔐 Default Login Credentials

After setting up, create users via the registration page or Supabase Dashboard.

**First Admin User** (create manually as described above):
- Username: `admin`
- Password: (set during creation)

## 🗄️ Database Schema

### Tables
- **users** - User accounts linked to Supabase Auth
- **ulams** - Food items/dishes
- **ingredients** - Stock inventory
- **ulam_ingredients** - Recipe relationships
- **sales** - Sales transactions
- **settings** - System settings

### Key Features
- **Automatic Stock Deduction**: PostgreSQL stored procedure `record_sale()`
- **Stock Restoration**: PostgreSQL stored procedure `delete_sale()`
- **Available Servings**: PostgreSQL function `get_available_servings()`
- **Row Level Security**: Fine-grained access control

## 🔒 Security Features

- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) policies
- Role-based access control (Admin/Staff)
- SQL injection prevention (Supabase handles this)
- XSS protection (input sanitization)
- Secure password hashing (handled by Supabase Auth)

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari

## 📱 Responsive Design

- Mobile-friendly interface
- Hamburger menu for mobile navigation
- Touch-optimized controls
- Responsive charts and tables

## 🎨 Features

- **Dark Mode**: Toggle between light and dark themes
- **Animated Background**: tsParticles on login page
- **Real-time Updates**: Powered by Supabase
- **Interactive Charts**: Chart.js visualizations
- **Toast Notifications**: User-friendly feedback

## 🆚 Differences from PHP Version

| Feature | PHP Version | Supabase Version |
|---------|-------------|------------------|
| Backend | PHP + MySQL | Supabase (PostgreSQL) |
| Auth | PHP Sessions | Supabase Auth (JWT) |
| Deployment | XAMPP (Local) | Vercel (Cloud) |
| Database | MySQL | PostgreSQL |
| API | Custom PHP endpoints | Supabase Auto-generated API |
| Real-time | No | Yes (Supabase Realtime) |

## 🐛 Troubleshooting

### Login Issues
- Ensure Supabase credentials are correct in `config.js`
- Check browser console for errors
- Verify user exists in Supabase Auth and `users` table

### Database Errors
- Ensure all SQL files were run successfully
- Check RLS policies are enabled
- Verify foreign key relationships

### Deployment Issues
- Ensure `vercel.json` is in the project root
- Check environment variables in Vercel dashboard
- Verify build logs for errors

## 📚 Documentation

- [Supabase Setup Guide](docs/supabase-setup.md)
- [Migration Notes](docs/migration-notes.md)
- [API Mapping](docs/api-mapping.md)

## 📄 License

This is an MVP (Minimum Viable Product) for educational and small business use.

## 👨‍💻 Author

Created by JRDivina

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- Chart.js for beautiful charts
- tsParticles for animated backgrounds

## 📞 Support

For issues or questions:
1. Check the documentation in the `docs/` folder
2. Review Supabase project settings
3. Check browser console for errors
4. Verify database schema is properly set up

## 🔄 Version

2.0.0 - Supabase Migration (Cloud-Ready)

---

**Note**: This is a migration of the original PHP/MySQL version to a modern, cloud-based stack. The core functionality remains the same, but with improved scalability, security, and deployment options.
