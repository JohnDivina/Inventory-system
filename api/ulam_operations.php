<?php
/**
 * Ulam Operations API
 * Handles CRUD operations for ulam (dishes)
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
    
    if ($action === 'list') {
        // List all ulams with ingredients and available servings
        try {
            $sql = "SELECT u.id, u.name, u.selling_price, u.status
                    FROM ulams u
                    WHERE u.status = 'active'
                    ORDER BY u.name";
            $ulams = fetchAll($sql);
            
            // Get ingredients for each ulam
            foreach ($ulams as &$ulam) {
                $ingredientsSql = "SELECT i.id as ingredient_id, i.name, i.unit, i.stock_quantity,
                                   ui.quantity_per_serving
                                   FROM ulam_ingredients ui
                                   JOIN ingredients i ON ui.ingredient_id = i.id
                                   WHERE ui.ulam_id = ?";
                $ingredients = fetchAll($ingredientsSql, [$ulam['id']]);
                $ulam['ingredients'] = $ingredients;
                
                // Calculate available servings (minimum based on ingredients)
                $availableServings = PHP_INT_MAX;
                foreach ($ingredients as $ing) {
                    if ($ing['quantity_per_serving'] > 0) {
                        $possibleServings = floor($ing['stock_quantity'] / $ing['quantity_per_serving']);
                        $availableServings = min($availableServings, $possibleServings);
                    }
                }
                $ulam['available_servings'] = $availableServings === PHP_INT_MAX ? 0 : $availableServings;
            }
            
            echo json_encode(['success' => true, 'ulams' => $ulams]);
        } catch (Exception $e) {
            error_log("Error listing ulams: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error loading ulams']);
        }
    }
    elseif ($action === 'get') {
        // Get single ulam
        $id = $_GET['id'] ?? 0;
        
        try {
            $sql = "SELECT * FROM ulams WHERE id = ?";
            $ulam = fetchOne($sql, [$id]);
            
            if ($ulam) {
                $ingredientsSql = "SELECT ui.ingredient_id, ui.quantity_per_serving, i.name, i.unit
                                   FROM ulam_ingredients ui
                                   JOIN ingredients i ON ui.ingredient_id = i.id
                                   WHERE ui.ulam_id = ?";
                $ulam['ingredients'] = fetchAll($ingredientsSql, [$id]);
                
                echo json_encode(['success' => true, 'ulam' => $ulam]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Ulam not found']);
            }
        } catch (Exception $e) {
            error_log("Error getting ulam: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error loading ulam']);
        }
    }
    exit;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'create') {
        // Create new ulam
        try {
            $pdo->beginTransaction();
            
            $sql = "INSERT INTO ulams (name, selling_price, status) VALUES (?, ?, 'active')";
            executeQuery($sql, [$input['name'], $input['selling_price']]);
            $ulamId = getLastInsertId();
            
            // Insert ingredients
            if (!empty($input['ingredients'])) {
                $ingredientSql = "INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) 
                                  VALUES (?, ?, ?)";
                foreach ($input['ingredients'] as $ing) {
                    executeQuery($ingredientSql, [$ulamId, $ing['ingredient_id'], $ing['quantity_per_serving']]);
                }
            }
            
            $pdo->commit();
            echo json_encode(['success' => true, 'ulam_id' => $ulamId]);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Error creating ulam: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error creating ulam']);
        }
    }
    elseif ($action === 'update') {
        // Update ulam
        try {
            $pdo->beginTransaction();
            
            $sql = "UPDATE ulams SET name = ?, selling_price = ? WHERE id = ?";
            executeQuery($sql, [$input['name'], $input['selling_price'], $input['ulam_id']]);
            
            // Delete existing ingredients
            $deleteSql = "DELETE FROM ulam_ingredients WHERE ulam_id = ?";
            executeQuery($deleteSql, [$input['ulam_id']]);
            
            // Insert new ingredients
            if (!empty($input['ingredients'])) {
                $ingredientSql = "INSERT INTO ulam_ingredients (ulam_id, ingredient_id, quantity_per_serving) 
                                  VALUES (?, ?, ?)";
                foreach ($input['ingredients'] as $ing) {
                    executeQuery($ingredientSql, [$input['ulam_id'], $ing['ingredient_id'], $ing['quantity_per_serving']]);
                }
            }
            
            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Error updating ulam: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error updating ulam']);
        }
    }
    elseif ($action === 'delete') {
        // Delete ulam
        try {
            $sql = "UPDATE ulams SET status = 'inactive' WHERE id = ?";
            executeQuery($sql, [$input['ulam_id']]);
            
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Error deleting ulam: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error deleting ulam']);
        }
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
?>
