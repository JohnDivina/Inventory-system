<?php
/**
 * Dashboard Data API
 * Provides summary statistics and chart data
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/database.php';

// Require login
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Get daily sales (today)
    $dailySalesQuery = "SELECT COALESCE(SUM(total_price), 0) as total 
                        FROM sales 
                        WHERE sale_date = CURDATE()";
    $dailySales = fetchOne($dailySalesQuery)['total'];
    
    // Get weekly sales (last 7 days)
    $weeklySalesQuery = "SELECT COALESCE(SUM(total_price), 0) as total 
                         FROM sales 
                         WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    $weeklySales = fetchOne($weeklySalesQuery)['total'];
    
    // Get monthly sales (current month)
    $monthlySalesQuery = "SELECT COALESCE(SUM(total_price), 0) as total 
                          FROM sales 
                          WHERE MONTH(sale_date) = MONTH(CURDATE()) 
                          AND YEAR(sale_date) = YEAR(CURDATE())";
    $monthlySales = fetchOne($monthlySalesQuery)['total'];
    
    // Get low stock count (threshold: 10)
    $lowStockQuery = "SELECT COUNT(*) as count 
                      FROM ingredients 
                      WHERE stock_quantity < 10";
    $lowStockCount = fetchOne($lowStockQuery)['count'];
    
    // Get top selling ulam (last 30 days)
    $topSellingQuery = "SELECT u.name, COALESCE(SUM(s.total_price), 0) as total_sales, 
                        COALESCE(SUM(s.quantity_sold), 0) as total_quantity
                        FROM ulams u
                        LEFT JOIN sales s ON u.id = s.ulam_id 
                        AND s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                        WHERE u.status = 'active'
                        GROUP BY u.id, u.name
                        ORDER BY total_sales DESC
                        LIMIT 5";
    $topSellingUlam = fetchAll($topSellingQuery);
    
    // Get sales trend (last 7 days)
    $salesTrendQuery = "SELECT sale_date as date, COALESCE(SUM(total_price), 0) as total
                        FROM sales
                        WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                        GROUP BY sale_date
                        ORDER BY sale_date ASC";
    $salesTrend = fetchAll($salesTrendQuery);
    
    // Fill in missing dates with 0
    $fullSalesTrend = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $found = false;
        foreach ($salesTrend as $trend) {
            if ($trend['date'] === $date) {
                $fullSalesTrend[] = $trend;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $fullSalesTrend[] = ['date' => $date, 'total' => 0];
        }
    }
    
    // Get inventory by category
    $inventoryCategoryQuery = "SELECT category, 
                               COALESCE(SUM(stock_quantity * cost_per_unit), 0) as total_value
                               FROM ingredients
                               GROUP BY category
                               ORDER BY total_value DESC";
    $inventoryByCategory = fetchAll($inventoryCategoryQuery);
    
    // Return JSON response
    echo json_encode([
        'success' => true,
        'dailySales' => (float)$dailySales,
        'weeklySales' => (float)$weeklySales,
        'monthlySales' => (float)$monthlySales,
        'lowStockCount' => (int)$lowStockCount,
        'topSellingUlam' => $topSellingUlam,
        'salesTrend' => $fullSalesTrend,
        'inventoryByCategory' => $inventoryByCategory
    ]);
    
} catch (Exception $e) {
    error_log("Dashboard API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error loading dashboard data'
    ]);
}
?>
