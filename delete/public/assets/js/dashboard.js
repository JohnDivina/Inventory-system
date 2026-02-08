// ============================================
// Dashboard JavaScript
// Fetch and display dashboard data from Supabase
// ============================================

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        Loading.show();

        // Fetch sales data for different time periods
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        // Daily sales
        const { data: dailySales, error: dailyError } = await supabase
            .from('sales')
            .select('total_price')
            .eq('sale_date', today);

        if (dailyError) throw dailyError;

        // Weekly sales
        const { data: weeklySales, error: weeklyError } = await supabase
            .from('sales')
            .select('total_price')
            .gte('sale_date', weekAgo);

        if (weeklyError) throw weeklyError;

        // Monthly sales
        const { data: monthlySales, error: monthlyError } = await supabase
            .from('sales')
            .select('total_price')
            .gte('sale_date', monthStart);

        if (monthlyError) throw monthlyError;

        // Low stock count
        const { data: settings } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'low_stock_threshold')
            .single();

        const threshold = settings ? parseFloat(settings.setting_value) : 10;

        const { data: lowStockItems, error: lowStockError } = await supabase
            .from('ingredients')
            .select('id')
            .lt('stock_quantity', threshold);

        if (lowStockError) throw lowStockError;

        // Calculate totals
        const dailyTotal = dailySales.reduce((sum, sale) => sum + parseFloat(sale.total_price), 0);
        const weeklyTotal = weeklySales.reduce((sum, sale) => sum + parseFloat(sale.total_price), 0);
        const monthlyTotal = monthlySales.reduce((sum, sale) => sum + parseFloat(sale.total_price), 0);

        // Update summary cards
        document.getElementById('dailySales').textContent = formatCurrency(dailyTotal);
        document.getElementById('weeklySales').textContent = formatCurrency(weeklyTotal);
        document.getElementById('monthlySales').textContent = formatCurrency(monthlyTotal);
        document.getElementById('lowStockCount').textContent = lowStockItems.length;

        // Fetch top selling ulams
        const { data: topSelling, error: topError } = await supabase
            .from('sales')
            .select('ulam_id, ulams(name), total_price')
            .gte('sale_date', weekAgo);

        if (topError) throw topError;

        // Aggregate by ulam
        const ulamSales = {};
        topSelling.forEach(sale => {
            const ulamName = sale.ulams.name;
            if (!ulamSales[ulamName]) {
                ulamSales[ulamName] = 0;
            }
            ulamSales[ulamName] += parseFloat(sale.total_price);
        });

        // Convert to array and sort
        const topSellingArray = Object.entries(ulamSales)
            .map(([name, total_sales]) => ({ name, total_sales }))
            .sort((a, b) => b.total_sales - a.total_sales)
            .slice(0, 5);

        // Fetch 7-day sales trend
        const { data: salesTrend, error: trendError } = await supabase
            .from('sales')
            .select('sale_date, total_price')
            .gte('sale_date', weekAgo)
            .order('sale_date', { ascending: true });

        if (trendError) throw trendError;

        // Aggregate by date
        const trendByDate = {};
        salesTrend.forEach(sale => {
            if (!trendByDate[sale.sale_date]) {
                trendByDate[sale.sale_date] = 0;
            }
            trendByDate[sale.sale_date] += parseFloat(sale.total_price);
        });

        const trendArray = Object.entries(trendByDate)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Fetch inventory by category
        const { data: inventory, error: invError } = await supabase
            .from('ingredients')
            .select('category, stock_quantity, cost_per_unit');

        if (invError) throw invError;

        // Aggregate by category
        const categoryValues = {};
        inventory.forEach(item => {
            if (!categoryValues[item.category]) {
                categoryValues[item.category] = 0;
            }
            categoryValues[item.category] += parseFloat(item.stock_quantity) * parseFloat(item.cost_per_unit);
        });

        const inventoryArray = Object.entries(categoryValues)
            .map(([category, total_value]) => ({ category, total_value }));

        // Initialize charts
        initSalesByUlamChart(topSellingArray);
        initSalesTrendChart(trendArray);
        initInventoryCategoryChart(inventoryArray);

        Loading.hide();
    } catch (error) {
        Loading.hide();
        console.error('Error loading dashboard:', error);
        Toast.error('Hindi ma-load ang dashboard data.');
    }
}

/**
 * Initialize Sales by Ulam Chart (Bar)
 */
function initSalesByUlamChart(data) {
    const ctx = document.getElementById('salesByUlamChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                label: 'Total Sales (₱)',
                data: data.map(item => item.total_sales),
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(168, 85, 247)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '₱' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialize Sales Trend Chart (Line)
 */
function initSalesTrendChart(data) {
    const ctx = document.getElementById('salesTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
                label: 'Daily Sales (₱)',
                data: data.map(item => item.total),
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '₱' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialize Inventory Category Chart (Pie)
 */
function initInventoryCategoryChart(data) {
    const ctx = document.getElementById('inventoryCategoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.category.charAt(0).toUpperCase() + item.category.slice(1)),
            datasets: [{
                data: data.map(item => item.total_value),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(34, 197, 94)',
                    'rgb(59, 130, 246)',
                    'rgb(245, 158, 11)',
                    'rgb(168, 85, 247)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.label + ': ₱' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!await auth.requireLogin()) return;

    // Load user info
    const user = await auth.getCurrentUser();
    if (user) {
        document.getElementById('currentUsername').textContent = user.username;

        // Show/hide admin menu
        if (user.role === 'admin') {
            document.getElementById('adminMenu').style.display = 'flex';
        }
    }

    // Load dashboard data
    loadDashboardData();
});
