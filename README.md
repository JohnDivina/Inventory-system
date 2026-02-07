# Karinderya Inventory & Sales Management System

A modern, web-based inventory and sales management system designed specifically for Filipino karinderya businesses. Built with PHP and MySQL, this system runs locally on XAMPP.

## Features

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
- Automatic stock deduction
- Daily sales summary
- Top and low seller tracking
- Sales history

### 👥 Admin Accounts (Admin Only)
- User management
- Role-based access control (Admin/Staff)
- Password reset functionality

### ⚙️ Settings
- Change username
- Change password
- System information display

## Installation

### Prerequisites
- XAMPP (PHP 7.4+ and MySQL)
- Web browser

### Setup Instructions

1. **Start XAMPP**
   - Start Apache and MySQL services

2. **Create Database**
   ```bash
   # Open phpMyAdmin or MySQL command line
   # Navigate to: http://localhost/phpmyadmin
   # Import the database schema
   ```
   - Create a new database named `cinventory`
   - Import `database_schema.sql`

3. **Configure Database Connection**
   - Open `config/database.php`
   - Update credentials if needed (default: root with no password)

4. **Access the System**
   - Open browser and navigate to: `http://localhost/Cinventory/login.php`

## Default Login Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Staff Account:**
- Username: `staff1`
- Password: `admin123`

## File Structure

```
Cinventory/
├── api/                          # Backend API endpoints
│   ├── dashboard_data.php
│   ├── ulam_operations.php
│   ├── ingredient_operations.php
│   ├── sales_operations.php
│   └── user_operations.php
├── assets/
│   ├── css/
│   │   └── style.css            # Main stylesheet
│   └── js/
│       ├── main.js              # Common utilities
│       └── inventory.js         # Inventory page scripts
├── config/
│   └── database.php             # Database configuration
├── includes/
│   ├── auth.php                 # Authentication functions
│   ├── header.php               # Common header
│   ├── sidebar.php              # Navigation sidebar
│   └── footer.php               # Common footer
├── dashboard.php                # Dashboard page
├── inventory.php                # Inventory management
├── sales.php                    # Sales manager
├── admin_accounts.php           # User management (admin only)
├── settings.php                 # Settings page
├── login.php                    # Login page
├── logout.php                   # Logout handler
├── database_schema.sql          # Database schema
└── .htaccess                    # Security configuration
```

## Database Schema

### Tables
- **users** - User accounts and authentication
- **ulams** - Food items/dishes
- **ingredients** - Stock inventory
- **ulam_ingredients** - Recipe relationships
- **sales** - Sales transactions
- **settings** - System settings

## Key Features Explained

### Automatic Stock Deduction
When a sale is recorded, the system automatically:
1. Checks if enough ingredients are available
2. Deducts the required quantity from each ingredient
3. Records the sale transaction
4. Updates available servings for all ulam

### Available Servings Calculation
The system calculates how many servings of each ulam can be made based on:
- Current ingredient stock levels
- Recipe requirements (quantity per serving)
- Returns the minimum possible servings across all ingredients

### Role-Based Access
- **Admin**: Full access to all features including user management
- **Staff**: Access to dashboard, inventory, sales, and settings (no user management)

## Security Features

- Password hashing using PHP's `password_hash()`
- Session-based authentication
- CSRF protection
- SQL injection prevention (PDO prepared statements)
- XSS protection (input sanitization)
- Directory listing disabled
- Sensitive files protected via .htaccess

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Technology Stack

- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js 4.4.0
- **Server**: Apache (XAMPP)

## Support

For issues or questions, please check:
1. Database connection settings in `config/database.php`
2. XAMPP services are running
3. Database schema is properly imported
4. Browser console for JavaScript errors

## License

This is an MVP (Minimum Viable Product) for educational and small business use.

## Version

1.0.0 MVP - Initial Release
