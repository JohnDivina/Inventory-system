// ============================================
// Inventory JavaScript
// Manage Ulams and Ingredients with Supabase
// ============================================

let allIngredients = [];
let selectedIngredients = {};

// Load all data on page load
document.addEventListener('DOMContentLoaded', async function () {
    // Check authentication
    if (!await auth.requireLogin()) return;

    // Load user info
    const user = await auth.getCurrentUser();
    if (user) {
        document.getElementById('currentUsername').textContent = user.username;
        if (user.role === 'admin') {
            document.getElementById('adminMenu').style.display = 'flex';
        }
    }

    loadUlams();
    loadIngredients();
});

// ============================================
// ULAM Functions
// ============================================

async function loadUlams() {
    try {
        Loading.show();

        const { data: ulams, error } = await supabase
            .from('ulams')
            .select(`
                id,
                name,
                selling_price,
                status,
                ulam_ingredients (
                    quantity_per_serving,
                    ingredients (
                        id,
                        name,
                        unit,
                        stock_quantity
                    )
                )
            `)
            .order('name');

        if (error) throw error;

        // Calculate available servings for each ulam
        const ulamsWithServings = await Promise.all(ulams.map(async (ulam) => {
            const { data: servings } = await supabase.rpc('get_available_servings', {
                p_ulam_id: ulam.id
            });

            return {
                ...ulam,
                ingredients: ulam.ulam_ingredients.map(ui => ({
                    ...ui.ingredients,
                    quantity_per_serving: ui.quantity_per_serving
                })),
                available_servings: servings || 0
            };
        }));

        displayUlams(ulamsWithServings);
        Loading.hide();
    } catch (error) {
        Loading.hide();
        console.error('Error loading ulams:', error);
        Toast.error('Hindi ma-load ang mga ulam.');
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
        const { data: ingredients, error } = await supabase
            .from('ingredients')
            .select('*')
            .order('name');

        if (error) throw error;

        allIngredients = ingredients;

        // If editing, load ulam ingredients
        if (ulamId) {
            const { data: ulam, error: ulamError } = await supabase
                .from('ulams')
                .select(`
                    *,
                    ulam_ingredients (
                        ingredient_id,
                        quantity_per_serving
                    )
                `)
                .eq('id', ulamId)
                .single();

            if (ulamError) throw ulamError;

            document.getElementById('ulamName').value = ulam.name;
            document.getElementById('ulamPrice').value = ulam.selling_price;

            // Set selected ingredients
            ulam.ulam_ingredients.forEach(ui => {
                selectedIngredients[ui.ingredient_id] = ui.quantity_per_serving;
            });
        }

        displayIngredientsCheckboxes();
    } catch (error) {
        console.error('Error loading ingredients:', error);
        Toast.error('May error sa pag-load ng sangkap.');
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
        Loading.show();

        if (ulamId) {
            // Update ulam
            const { error: updateError } = await supabase
                .from('ulams')
                .update({
                    name: name,
                    selling_price: parseFloat(sellingPrice)
                })
                .eq('id', ulamId);

            if (updateError) throw updateError;

            // Delete old ingredients
            const { error: deleteError } = await supabase
                .from('ulam_ingredients')
                .delete()
                .eq('ulam_id', ulamId);

            if (deleteError) throw deleteError;

            // Insert new ingredients
            const { error: insertError } = await supabase
                .from('ulam_ingredients')
                .insert(ingredients.map(ing => ({
                    ulam_id: parseInt(ulamId),
                    ...ing
                })));

            if (insertError) throw insertError;

            Toast.success('Ulam updated!');
        } else {
            // Create new ulam
            const { data: newUlam, error: createError } = await supabase
                .from('ulams')
                .insert([{
                    name: name,
                    selling_price: parseFloat(sellingPrice)
                }])
                .select()
                .single();

            if (createError) throw createError;

            // Insert ingredients
            const { error: insertError } = await supabase
                .from('ulam_ingredients')
                .insert(ingredients.map(ing => ({
                    ulam_id: newUlam.id,
                    ...ing
                })));

            if (insertError) throw insertError;

            Toast.success('Bagong ulam naidagdag!');
        }

        Loading.hide();
        hideUlamModal();
        loadUlams();
    } catch (error) {
        Loading.hide();
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
        async () => {
            try {
                Loading.show();

                const { error } = await supabase
                    .from('ulams')
                    .delete()
                    .eq('id', ulamId);

                if (error) throw error;

                Loading.hide();
                Toast.success('Ulam tinanggal!');
                loadUlams();
            } catch (error) {
                Loading.hide();
                console.error('Error deleting ulam:', error);
                Toast.error('Hindi matanggal ang ulam.');
            }
        }
    );
}

// ============================================
// INGREDIENT Functions
// ============================================

async function loadIngredients() {
    try {
        Loading.show();

        const { data: ingredients, error } = await supabase
            .from('ingredients')
            .select('*')
            .order('name');

        if (error) throw error;

        displayIngredients(ingredients);
        Loading.hide();
    } catch (error) {
        Loading.hide();
        console.error('Error loading ingredients:', error);
        Toast.error('Hindi ma-load ang mga sangkap.');
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
        const { data: ing, error } = await supabase
            .from('ingredients')
            .select('*')
            .eq('id', ingredientId)
            .single();

        if (error) throw error;

        document.getElementById('ingredientId').value = ing.id;
        document.getElementById('ingredientName').value = ing.name;
        document.getElementById('ingredientCategory').value = ing.category;
        document.getElementById('ingredientUnit').value = ing.unit;
        document.getElementById('ingredientStock').value = ing.stock_quantity;
        document.getElementById('ingredientCost').value = ing.cost_per_unit;

        showIngredientModal(ingredientId);
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
        Loading.show();

        const ingredientData = {
            name: name,
            category: category,
            unit: unit,
            stock_quantity: parseFloat(stockQuantity),
            cost_per_unit: parseFloat(costPerUnit)
        };

        if (ingredientId) {
            const { error } = await supabase
                .from('ingredients')
                .update(ingredientData)
                .eq('id', ingredientId);

            if (error) throw error;

            Toast.success('Sangkap updated!');
        } else {
            const { error } = await supabase
                .from('ingredients')
                .insert([ingredientData]);

            if (error) throw error;

            Toast.success('Bagong sangkap naidagdag!');
        }

        Loading.hide();
        hideIngredientModal();
        loadIngredients();
    } catch (error) {
        Loading.hide();
        console.error('Error saving ingredient:', error);
        Toast.error('May error sa pag-save.');
    }
}

function deleteIngredient(ingredientId, ingredientName) {
    ConfirmModal.show(
        `Sigurado ka bang gusto mong tanggalin ang "${ingredientName}"?`,
        async () => {
            try {
                Loading.show();

                const { error } = await supabase
                    .from('ingredients')
                    .delete()
                    .eq('id', ingredientId);

                if (error) throw error;

                Loading.hide();
                Toast.success('Sangkap tinanggal!');
                loadIngredients();
            } catch (error) {
                Loading.hide();
                console.error('Error deleting ingredient:', error);
                Toast.error('Hindi matanggal ang sangkap.');
            }
        }
    );
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await auth.logout();
});
