/**
 * Inventory Page JavaScript
 */

let allIngredients = [];
let selectedIngredients = {};

// Load all data on page load
document.addEventListener('DOMContentLoaded', function () {
    loadUlams();
    loadIngredients();
});

// ============================================
// ULAM Functions
// ============================================

async function loadUlams() {
    try {
        const response = await fetch('/Cinventory/api/ulam_operations.php?action=list');
        const data = await response.json();

        if (data.success) {
            displayUlams(data.ulams);
        } else {
            Toast.error('Hindi ma-load ang mga ulam.');
        }
    } catch (error) {
        console.error('Error loading ulams:', error);
        Toast.error('May error sa pag-load ng ulam.');
    }
}

function displayUlams(ulams) {
    const tbody = document.getElementById('ulamTableBody');

    if (ulams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Walang ulam pa.</td></tr>';
        return;
    }

    tbody.innerHTML = ulams.map(ulam => `
        <tr>
            <td><strong>${ulam.name}</strong></td>
            <td>${formatCurrency(ulam.selling_price)}</td>
            <td>
                <small>${ulam.ingredients.map(ing =>
        `${ing.name} (${ing.quantity_per_serving}${ing.unit})`
    ).join(', ')}</small>
            </td>
            <td><strong>${ulam.available_servings}</strong></td>
            <td>
                <span class="badge ${ulam.available_servings > 10 ? 'badge-success' : 'badge-warning'}">
                    ${ulam.available_servings > 10 ? 'OK' : 'Low Stock'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editUlam(${ulam.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUlam(${ulam.id}, '${ulam.name}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showUlamModal(ulamId = null) {
    document.getElementById('ulamModalTitle').textContent = ulamId ? 'Edit Ulam' : 'Bagong Ulam';
    document.getElementById('ulamId').value = ulamId || '';

    if (!ulamId) {
        clearForm('ulamForm');
        selectedIngredients = {};
    }

    loadIngredientsForUlam(ulamId);
    document.getElementById('ulamModal').classList.add('show');
}

function hideUlamModal() {
    document.getElementById('ulamModal').classList.remove('show');
    clearForm('ulamForm');
    selectedIngredients = {};
}

async function loadIngredientsForUlam(ulamId = null) {
    try {
        const response = await fetch('/Cinventory/api/ingredient_operations.php?action=list');
        const data = await response.json();

        if (data.success) {
            allIngredients = data.ingredients;

            // If editing, load ulam ingredients
            if (ulamId) {
                const ulamResponse = await fetch(`/Cinventory/api/ulam_operations.php?action=get&id=${ulamId}`);
                const ulamData = await ulamResponse.json();

                if (ulamData.success) {
                    document.getElementById('ulamName').value = ulamData.ulam.name;
                    document.getElementById('ulamPrice').value = ulamData.ulam.selling_price;

                    // Set selected ingredients
                    ulamData.ulam.ingredients.forEach(ing => {
                        selectedIngredients[ing.ingredient_id] = ing.quantity_per_serving;
                    });
                }
            }

            displayIngredientsCheckboxes();
        }
    } catch (error) {
        console.error('Error loading ingredients:', error);
    }
}

function displayIngredientsCheckboxes() {
    const container = document.getElementById('ingredientsList');

    container.innerHTML = allIngredients.map(ing => `
        <div style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input 
                    type="checkbox" 
                    value="${ing.id}"
                    ${selectedIngredients[ing.id] ? 'checked' : ''}
                    onchange="toggleIngredient(${ing.id})"
                >
                <span style="flex: 1;">${ing.name} (${ing.stock_quantity}${ing.unit})</span>
                <input 
                    type="number" 
                    id="qty_${ing.id}"
                    placeholder="Qty"
                    step="0.01"
                    min="0"
                    value="${selectedIngredients[ing.id] || ''}"
                    style="width: 80px; padding: 0.25rem; border: 1px solid var(--border-color); border-radius: 4px;"
                    ${!selectedIngredients[ing.id] ? 'disabled' : ''}
                    onchange="updateIngredientQty(${ing.id}, this.value)"
                >
            </label>
        </div>
    `).join('');
}

function toggleIngredient(ingredientId) {
    const qtyInput = document.getElementById(`qty_${ingredientId}`);

    if (selectedIngredients[ingredientId]) {
        delete selectedIngredients[ingredientId];
        qtyInput.disabled = true;
        qtyInput.value = '';
    } else {
        selectedIngredients[ingredientId] = 0;
        qtyInput.disabled = false;
        qtyInput.focus();
    }
}

function updateIngredientQty(ingredientId, qty) {
    selectedIngredients[ingredientId] = parseFloat(qty) || 0;
}

async function saveUlam() {
    const ulamId = document.getElementById('ulamId').value;
    const name = document.getElementById('ulamName').value.trim();
    const sellingPrice = document.getElementById('ulamPrice').value;

    if (!name || !sellingPrice) {
        Toast.error('Kumpletuhin ang lahat ng fields.');
        return;
    }

    const ingredients = Object.entries(selectedIngredients)
        .filter(([id, qty]) => qty > 0)
        .map(([id, qty]) => ({ ingredient_id: parseInt(id), quantity_per_serving: parseFloat(qty) }));

    if (ingredients.length === 0) {
        Toast.error('Magdagdag ng kahit isang sangkap.');
        return;
    }

    try {
        const response = await fetch('/Cinventory/api/ulam_operations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: ulamId ? 'update' : 'create',
                ulam_id: ulamId || undefined,
                name: name,
                selling_price: parseFloat(sellingPrice),
                ingredients: ingredients
            })
        });

        const data = await response.json();

        if (data.success) {
            Toast.success(ulamId ? 'Ulam updated!' : 'Bagong ulam naidagdag!');
            hideUlamModal();
            loadUlams();
        } else {
            Toast.error(data.message || 'May error sa pag-save.');
        }
    } catch (error) {
        console.error('Error saving ulam:', error);
        Toast.error('May error sa pag-save.');
    }
}

function editUlam(ulamId) {
    showUlamModal(ulamId);
}

function deleteUlam(ulamId, ulamName) {
    ConfirmModal.show(
        `Sigurado ka bang gusto mong tanggalin ang "${ulamName}"?`,
        'Tanggalin ang Ulam',
        async () => {
            try {
                const response = await fetch('/Cinventory/api/ulam_operations.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'delete',
                        ulam_id: ulamId
                    })
                });

                const data = await response.json();

                if (data.success) {
                    Toast.success('Ulam tinanggal!');
                    loadUlams();
                } else {
                    Toast.error(data.message || 'Hindi matanggal ang ulam.');
                }
            } catch (error) {
                console.error('Error deleting ulam:', error);
                Toast.error('May error sa pagtanggal.');
            }
        }
    );
}

// ============================================
// INGREDIENT Functions
// ============================================

async function loadIngredients() {
    try {
        const response = await fetch('/Cinventory/api/ingredient_operations.php?action=list');
        const data = await response.json();

        if (data.success) {
            displayIngredients(data.ingredients);
        } else {
            Toast.error('Hindi ma-load ang mga sangkap.');
        }
    } catch (error) {
        console.error('Error loading ingredients:', error);
        Toast.error('May error sa pag-load ng sangkap.');
    }
}

function displayIngredients(ingredients) {
    const tbody = document.getElementById('ingredientTableBody');

    if (ingredients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Walang sangkap pa.</td></tr>';
        return;
    }

    tbody.innerHTML = ingredients.map(ing => {
        const totalValue = ing.stock_quantity * ing.cost_per_unit;
        const isLowStock = ing.stock_quantity < 10;

        return `
            <tr>
                <td><strong>${ing.name}</strong></td>
                <td><span class="badge badge-info">${ing.category}</span></td>
                <td>${ing.stock_quantity}</td>
                <td>${ing.unit}</td>
                <td>${formatCurrency(ing.cost_per_unit)}</td>
                <td>${formatCurrency(totalValue)}</td>
                <td>
                    <span class="badge ${isLowStock ? 'badge-danger' : 'badge-success'}">
                        ${isLowStock ? 'Low Stock' : 'OK'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="editIngredient(${ing.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteIngredient(${ing.id}, '${ing.name}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function showIngredientModal(ingredientId = null) {
    document.getElementById('ingredientModalTitle').textContent = ingredientId ? 'Edit Sangkap' : 'Bagong Sangkap';
    document.getElementById('ingredientId').value = ingredientId || '';

    if (!ingredientId) {
        clearForm('ingredientForm');
    }

    document.getElementById('ingredientModal').classList.add('show');
}

function hideIngredientModal() {
    document.getElementById('ingredientModal').classList.remove('show');
    clearForm('ingredientForm');
}

async function editIngredient(ingredientId) {
    try {
        const response = await fetch(`/Cinventory/api/ingredient_operations.php?action=get&id=${ingredientId}`);
        const data = await response.json();

        if (data.success) {
            const ing = data.ingredient;
            document.getElementById('ingredientId').value = ing.id;
            document.getElementById('ingredientName').value = ing.name;
            document.getElementById('ingredientCategory').value = ing.category;
            document.getElementById('ingredientUnit').value = ing.unit;
            document.getElementById('ingredientStock').value = ing.stock_quantity;
            document.getElementById('ingredientCost').value = ing.cost_per_unit;

            showIngredientModal(ingredientId);
        }
    } catch (error) {
        console.error('Error loading ingredient:', error);
        Toast.error('May error sa pag-load ng sangkap.');
    }
}

async function saveIngredient() {
    const ingredientId = document.getElementById('ingredientId').value;
    const name = document.getElementById('ingredientName').value.trim();
    const category = document.getElementById('ingredientCategory').value;
    const unit = document.getElementById('ingredientUnit').value;
    const stockQuantity = document.getElementById('ingredientStock').value;
    const costPerUnit = document.getElementById('ingredientCost').value;

    if (!name || !category || !unit || !stockQuantity || !costPerUnit) {
        Toast.error('Kumpletuhin ang lahat ng fields.');
        return;
    }

    try {
        const response = await fetch('/Cinventory/api/ingredient_operations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: ingredientId ? 'update' : 'create',
                ingredient_id: ingredientId || undefined,
                name: name,
                category: category,
                unit: unit,
                stock_quantity: parseFloat(stockQuantity),
                cost_per_unit: parseFloat(costPerUnit)
            })
        });

        const data = await response.json();

        if (data.success) {
            Toast.success(ingredientId ? 'Sangkap updated!' : 'Bagong sangkap naidagdag!');
            hideIngredientModal();
            loadIngredients();
        } else {
            Toast.error(data.message || 'May error sa pag-save.');
        }
    } catch (error) {
        console.error('Error saving ingredient:', error);
        Toast.error('May error sa pag-save.');
    }
}

function deleteIngredient(ingredientId, ingredientName) {
    ConfirmModal.show(
        `Sigurado ka bang gusto mong tanggalin ang "${ingredientName}"?`,
        'Tanggalin ang Sangkap',
        async () => {
            try {
                const response = await fetch('/Cinventory/api/ingredient_operations.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'delete',
                        ingredient_id: ingredientId
                    })
                });

                const data = await response.json();

                if (data.success) {
                    Toast.success('Sangkap tinanggal!');
                    loadIngredients();
                } else {
                    Toast.error(data.message || 'Hindi matanggal ang sangkap.');
                }
            } catch (error) {
                console.error('Error deleting ingredient:', error);
                Toast.error('May error sa pagtanggal.');
            }
        }
    );
}
