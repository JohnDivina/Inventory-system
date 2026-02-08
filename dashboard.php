<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pageTitle = 'Dashboard - Karinderya Management System';
include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
?>

<main class="main-content">
    <div class="page-header">
        <h1>Dashboard</h1>
        <p>Overall Sales, Stocks and Trends</p>
    </div>
    
    <!-- Summary Cards -->
    <div class="summary-cards">
        <div class="summary-card success">
            <div class="summary-card-header">
                <span class="summary-card-title">Sales Today</span>
                <span class="summary-card-icon">💰</span>
            </div>
            <div class="summary-card-value" id="dailySales">₱0.00</div>
            <div class="summary-card-footer">Today</div>
        </div>
        
        <div class="summary-card success">
            <div class="summary-card-header">
                <span class="summary-card-title">Weekly Sales</span>
                <span class="summary-card-icon">📈</span>
            </div>
            <div class="summary-card-value" id="weeklySales">₱0.00</div>
            <div class="summary-card-footer">Last 7 days</div>
        </div>
        
        <div class="summary-card success">
            <div class="summary-card-header">
                <span class="summary-card-title">Monthly Sales</span>
                <span class="summary-card-icon">📊</span>
            </div>
            <div class="summary-card-value" id="monthlySales">₱0.00</div>
            <div class="summary-card-footer">This month</div>
        </div>
        
        <div class="summary-card danger">
            <div class="summary-card-header">
                <span class="summary-card-title">Low Stock Items</span>
                <span class="summary-card-icon">⚠️</span>
            </div>
            <div class="summary-card-value" id="lowStockCount">0</div>
            <div class="summary-card-footer">Need restock</div>
        </div>
    </div>
    
    <!-- Charts -->
    <div class="charts-grid">
        <div class="chart-container">
            <h3 style="margin-bottom: 1rem;">Top Selling Items</h3>
            <canvas id="salesByUlamChart"></canvas>
        </div>
        
        <div class="chart-container">
            <h3 style="margin-bottom: 1rem;">7-Day Sales Trend</h3>
            <canvas id="salesTrendChart"></canvas>
        </div>
    </div>
    
    <div class="chart-container" style="max-width: 600px; margin: 0 auto;">
        <h3 style="margin-bottom: 1rem;">Inventory by Category</h3>
        <canvas id="inventoryCategoryChart"></canvas>
    </div>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/Cinventory/api/dashboard_data.php');
        const data = await response.json();
        
        if (data.success) {
            // Update summary cards
            document.getElementById('dailySales').textContent = formatCurrency(data.dailySales);
            document.getElementById('weeklySales').textContent = formatCurrency(data.weeklySales);
            document.getElementById('monthlySales').textContent = formatCurrency(data.monthlySales);
            document.getElementById('lowStockCount').textContent = data.lowStockCount;
            
            // Initialize charts
            initSalesByUlamChart(data.topSellingUlam);
            initSalesTrendChart(data.salesTrend);
            initInventoryCategoryChart(data.inventoryByCategory);
        } else {
            Toast.error('Hindi ma-load ang dashboard data.');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        Toast.error('May error sa pag-load ng data.');
    }
}

// Sales by Ulam Chart (Bar)
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
                        callback: function(value) {
                            return '₱' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Sales Trend Chart (Line)
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
                        callback: function(value) {
                            return '₱' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Inventory Category Chart (Pie)
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
                        label: function(context) {
                            return context.label + ': ₱' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadDashboardData);
</script>
