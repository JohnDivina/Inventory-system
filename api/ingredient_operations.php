<?php
/**
 * Ingredient Operations API
 * Handles CRUD operations for ingredients
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
        // List all ingredients
        try {
            $sql = "SELECT * FROM ingredients ORDER BY category, name";
            $ingredients = fetchAll($sql);
            
            echo json_encode(['success' => true, 'ingredients' => $ingredients]);
        } catch (Exception $e) {
            error_log("Error listing ingredients: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error loading ingredients']);
        }
    }
    elseif ($action === 'get') {
        // Get single ingredient
        $id = $_GET['id'] ?? 0;
        
        try {
            $sql = "SELECT * FROM ingredients WHERE id = ?";
            $ingredient = fetchOne($sql, [$id]);
            
            if ($ingredient) {
                echo json_encode(['success' => true, 'ingredient' => $ingredient]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Ingredient not found']);
            }
        } catch (Exception $e) {
            error_log("Error getting ingredient: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error loading ingredient']);
        }
    }
    exit;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    if ($action === 'create') {
        // Create new ingredient
        try {
            $sql = "INSERT INTO ingredients (name, unit, cost_per_unit, stock_quantity, category) 
                    VALUES (?, ?, ?, ?, ?)";
            executeQuery($sql, [
                $input['name'],
                $input['unit'],
                $input['cost_per_unit'],
                $input['stock_quantity'],
                $input['category']
            ]);
            
            $ingredientId = getLastInsertId();
            echo json_encode(['success' => true, 'ingredient_id' => $ingredientId]);
        } catch (Exception $e) {
            error_log("Error creating ingredient: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error creating ingredient']);
        }
    }
    elseif ($action === 'update') {
        // Update ingredient
        try {
            $sql = "UPDATE ingredients 
                    SET name = ?, unit = ?, cost_per_unit = ?, stock_quantity = ?, category = ?
                    WHERE id = ?";
            executeQuery($sql, [
                $input['name'],
                $input['unit'],
                $input['cost_per_unit'],
                $input['stock_quantity'],
                $input['category'],
                $input['ingredient_id']
            ]);
            
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Error updating ingredient: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error updating ingredient']);
        }
    }
    elseif ($action === 'delete') {
        // Delete ingredient (check if used in any ulam first)
        try {
            // Check if ingredient is used in any ulam
            $checkSql = "SELECT COUNT(*) as count FROM ulam_ingredients WHERE ingredient_id = ?";
            $result = fetchOne($checkSql, [$input['ingredient_id']]);
            
            if ($result['count'] > 0) {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Hindi pwedeng tanggalin. Ginagamit pa sa mga ulam.'
                ]);
                exit;
            }
            
            $sql = "DELETE FROM ingredients WHERE id = ?";
            executeQuery($sql, [$input['ingredient_id']]);
            
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Error deleting ingredient: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Error deleting ingredient']);
        }
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
?>
