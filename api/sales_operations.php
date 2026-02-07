<?php
/**
 * Sales Operations API
 * Handles sales recording with automatic stock deduction
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/database.php';

// Require login
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$pdo = getDBConnection();

// Handle GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'today') {
        // Get today's sales
        try {
            $sql = "SELECT s.*, u.name as ulam_name
                    FROM sales s
                    JOIN ulams u ON s.ulam_id = u.id
                    WHERE s.sale_date = CURDATE()
                    ORDER BY s.sale_time DESC";
            $sales = fetchAll($sql);
            
            // Calculate summary
            $totalSales = array_sum(array_column($sales, 'total_price'));
            
            // Get top and low sellers for today
            $topSellerSql = "SELECT u.name, SUM(s.quantity_sold) as total_qty
                            FROM sales s
                            JOIN ulams u ON s.ulam_id = u.id
                            WHERE s.sale_date = CURDATE()
                            GROUP BY s.ulam_id, u.name
                            ORDER BY total_qty DESC
                            LIMIT 1";
            $topSeller = fetchOne($topSellerSql);
            
            $lowSellerSql = "SELECT u.name, SUM(s.quantity_sold) as total_qty
                            FROM sales s
                            JOIN ulams u ON s.ulam_id = u.id
                            WHERE s.sale_date = CURDATE()
                            GROUP BY s.ulam_id, u.name
                            ORDER BY total_qty ASC
                            LIMIT 1";
            $lowSeller = fetchOne($lowSellerSql);
            
            echo json_encode([
                'success' => true,
                'sales' => $sales,
                'summary' => [
                    'total_sales' => $totalSales,
                    'top_seller' => $topSeller['name'] ?? null,
                    'low_seller' => $lowSeller['name'] ?? null
                ]
            ]);
        } catch (Exception $e) {
            error_log("Error loading today's sales: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error loading sales']);
        }
    }
    exit;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'create') {
        // Record new sale with stock deduction
        try {
            $pdo->beginTransaction();
            
            $ulamId = $input['ulam_id'];
            $quantitySold = $input['quantity_sold'];
            $pricePerServing = $input['price_per_serving'];
            $saleDate = $input['sale_date'];
            $totalPrice = $quantitySold * $pricePerServing;
            
            // Get ingredients for this ulam
            $ingredientsSql = "SELECT ingredient_id, quantity_per_serving
                              FROM ulam_ingredients
                              WHERE ulam_id = ?";
            $ingredients = fetchAll($ingredientsSql, [$ulamId]);
            
            // Check if enough stock is available
            foreach ($ingredients as $ing) {
                $requiredQty = $ing['quantity_per_serving'] * $quantitySold;
                
                $stockSql = "SELECT stock_quantity FROM ingredients WHERE id = ?";
                $stock = fetchOne($stockSql, [$ing['ingredient_id']]);
                
                if ($stock['stock_quantity'] < $requiredQty) {
                    $pdo->rollBack();
                    echo json_encode([
                        'success' => false,
                        'message' => 'Kulang ang stock para sa order na ito!'
                    ]);
                    exit;
                }
            }
            
            // Deduct stock
            foreach ($ingredients as $ing) {
                $requiredQty = $ing['quantity_per_serving'] * $quantitySold;
                
                $updateStockSql = "UPDATE ingredients 
                                  SET stock_quantity = stock_quantity - ?
                                  WHERE id = ?";
                executeQuery($updateStockSql, [$requiredQty, $ing['ingredient_id']]);
            }
            
            // Record sale
            $saleSql = "INSERT INTO sales (sale_date, sale_time, ulam_id, quantity_sold, price_per_serving, total_price)
                       VALUES (?, CURTIME(), ?, ?, ?, ?)";
            executeQuery($saleSql, [$saleDate, $ulamId, $quantitySold, $pricePerServing, $totalPrice]);
            
            $pdo->commit();
            echo json_encode(['success' => true, 'sale_id' => getLastInsertId()]);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Error recording sale: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error recording sale']);
        }
    }
    elseif ($action === 'delete') {
        // Delete sale and restore stock
        try {
            $pdo->beginTransaction();
            
            $saleId = $input['sale_id'];
            
            // Get sale details
            $saleSql = "SELECT * FROM sales WHERE id = ?";
            $sale = fetchOne($saleSql, [$saleId]);
            
            if (!$sale) {
                $pdo->rollBack();
                echo json_encode(['success' => false, 'message' => 'Sale not found']);
                exit;
            }
            
            // Get ingredients for this ulam
            $ingredientsSql = "SELECT ingredient_id, quantity_per_serving
                              FROM ulam_ingredients
                              WHERE ulam_id = ?";
            $ingredients = fetchAll($ingredientsSql, [$sale['ulam_id']]);
            
            // Restore stock
            foreach ($ingredients as $ing) {
                $restoreQty = $ing['quantity_per_serving'] * $sale['quantity_sold'];
                
                $updateStockSql = "UPDATE ingredients 
                                  SET stock_quantity = stock_quantity + ?
                                  WHERE id = ?";
                executeQuery($updateStockSql, [$restoreQty, $ing['ingredient_id']]);
            }
            
            // Delete sale
            $deleteSql = "DELETE FROM sales WHERE id = ?";
            executeQuery($deleteSql, [$saleId]);
            
            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Error deleting sale: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error deleting sale']);
        }
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
?>
