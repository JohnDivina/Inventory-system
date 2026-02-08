<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pageTitle = 'Inventory - Karinderya Management System';
include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
?>

<main class="main-content">
    <div class="page-header">
        <div class="flex-between">
            <div>
                <h1>Inventory Management</h1>
                <p>Pamahalaan ang Ulam at Sangkap</p>
            </div>
            <div class="flex gap-1">
                <button class="btn btn-success" onclick="showUlamModal()">+ New Ulam</button>
                <button class="btn btn-primary" onclick="showIngredientModal()">+ New Ingredient</button>
            </div>
        </div>
    </div>
    
    <!-- Ulam Table -->
    <div class="card">
        <div class="card-header">
            <h3>Ulams</h3>
        </div>
        <div class="card-body">
            <div class="table-container">
                <table class="table" id="ulamTable">
                    <thead>
                        <tr>
                            <th>Ulam</th>
                            <th>Price</th>
                            <th>Ingredients</th>
                            <th>Available Servings</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="ulamTableBody">
                        <tr>
                            <td colspan="6" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Ingredients Table -->
    <div class="card">
        <div class="card-header">
            <h3>Mga Sangkap (Ingredients)</h3>
        </div>
        <div class="card-body">
            <div class="table-container">
                <table class="table" id="ingredientTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Stock Quantity</th>
                            <th>Unit</th>
                            <th>Cost per Unit</th>
                            <th>Total Value</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="ingredientTableBody">
                        <tr>
                            <td colspan="8" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<!-- Ulam Modal -->
<div class="modal" id="ulamModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="ulamModalTitle">New Ulam</h3>
        </div>
        <div class="modal-body">
            <form id="ulamForm">
                <input type="hidden" id="ulamId" name="ulam_id">
                
                <div class="form-group">
                    <label for="ulamName">Name of Ulam*</label>
                    <input type="text" id="ulamName" name="name" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="ulamPrice">Price (₱) *</label>
                    <input type="number" id="ulamPrice" name="selling_price" class="form-control" step="0.01" min="0" required>
                </div>
                
                <div class="form-group">
                    <label>Mga Sangkap *</label>
                    <div id="ingredientsList" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.5rem;">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="hideUlamModal()">Cancel</button>
            <button class="btn btn-primary" onclick="saveUlam()">Save</button>
        </div>
    </div>
</div>

<!-- Ingredient Modal -->
<div class="modal" id="ingredientModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="ingredientModalTitle">New Ingredient</h3>
        </div>
        <div class="modal-body">
            <form id="ingredientForm">
                <input type="hidden" id="ingredientId" name="ingredient_id">
                
                <div class="form-group">
                    <label for="ingredientName">Name of Ingredient *</label>
                    <input type="text" id="ingredientName" name="name" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="ingredientCategory">Category *</label>
                    <select id="ingredientCategory" name="category" class="form-control" required>
                        <option value="karne">Karne (Meat)</option>
                        <option value="gulay">Gulay (Vegetables)</option>
                        <option value="bigas">Bigas (Rice)</option>
                        <option value="others">Others</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="ingredientUnit">Unit *</label>
                    <select id="ingredientUnit" name="unit" class="form-control" required>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="liter">Liter</option>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="bundle">Bundle</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="ingredientStock">Stock Quantity *</label>
                    <input type="number" id="ingredientStock" name="stock_quantity" class="form-control" step="0.01" min="0" required>
                </div>
                
                <div class="form-group">
                    <label for="ingredientCost">Cost per Unit (₱) *</label>
                    <input type="number" id="ingredientCost" name="cost_per_unit" class="form-control" step="0.01" min="0" required>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="hideIngredientModal()">Cancel</button>
            <button class="btn btn-primary" onclick="saveIngredient()">Save</button>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script src="/Cinventory/assets/js/inventory.js"></script>
