<?php
require_once __DIR__ . '/includes/auth.php';
requireLogin();

$pageTitle = 'Sales Manager - Karinderya Management System';
include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
?>

<main class="main-content">
    <div class="page-header">
        <h1>Sales Manager</h1>
        <p>I-record ang Benta Araw-araw</p>
    </div>
    
    <div class="sales-grid">
        <!-- Sales Input Form -->
        <div class="card">
            <div class="card-header">
                <h3>New Sale</h3>
            </div>
            <div class="card-body">
                <form id="salesForm">
                    <div class="form-group">
                        <label for="saleDate">Date *</label>
                        <input type="date" id="saleDate" name="sale_date" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="saleUlam">Ulam *</label>
                        <select id="saleUlam" name="ulam_id" class="form-control" required onchange="updatePrice()">
                            <option value="">Select an ulam...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="saleQuantity">Quantity (ilang order) *</label>
                        <input type="number" id="saleQuantity" name="quantity_sold" class="form-control" min="1" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="salePrice">Presyo bawat isa (₱) *</label>
                        <input type="number" id="salePrice" name="price_per_serving" class="form-control" step="0.01" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Total</label>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);" id="totalPrice">
                            ₱0.00
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-primary" onclick="recordSale()" style="width: 100%;">
                        Record Sale
                    </button>
                </form>
            </div>
        </div>
        
        <!-- Daily Summary -->
        <div class="card">
            <div class="card-header">
                <h3>Today's Summary</h3>
            </div>
            <div class="card-body">
                <div style="text-align: center; padding: 1rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                            Total Sales Today
                        </div>
                        <div style="font-size: 2.5rem; font-weight: bold; color: var(--success-color);" id="todayTotal">
                            ₱0.00
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
                        <div style="padding: 1rem; background: var(--bg-color); border-radius: var(--radius-md);">
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                Top Seller
                            </div>
                            <div style="font-weight: bold;" id="topSeller">-</div>
                        </div>
                        
                        <div style="padding: 1rem; background: var(--bg-color); border-radius: var(--radius-md);">
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                Pinakamababa
                            </div>
                            <div style="font-weight: bold;" id="lowSeller">-</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Today's Sales Table -->
    <div class="card">
        <div class="card-header">
            <h3>Today's Sales</h3>
        </div>
        <div class="card-body">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Ulam</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="salesTableBody">
                        <tr>
                            <td colspan="6" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>

<script>
let ulamsData = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    document.getElementById('saleDate').valueAsDate = new Date();
    
    loadUlams();
    loadTodaySales();
    
    // Auto-calculate total
    document.getElementById('saleQuantity').addEventListener('input', calculateTotal);
    document.getElementById('salePrice').addEventListener('input', calculateTotal);
});

async function loadUlams() {
    try {
        const response = await fetch('/Cinventory/api/ulam_operations.php?action=list');
        const data = await response.json();
        
        if (data.success) {
            ulamsData = data.ulams;
            const select = document.getElementById('saleUlam');
            
            select.innerHTML = '<option value="">Pumili ng ulam...</option>' +
                data.ulams.map(ulam => 
                    `<option value="${ulam.id}" data-price="${ulam.selling_price}">${ulam.name} (${ulam.available_servings} available)</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error loading ulams:', error);
    }
}

function updatePrice() {
    const select = document.getElementById('saleUlam');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.price) {
        document.getElementById('salePrice').value = selectedOption.dataset.price;
        calculateTotal();
    }
}

function calculateTotal() {
    const quantity = parseFloat(document.getElementById('saleQuantity').value) || 0;
    const price = parseFloat(document.getElementById('salePrice').value) || 0;
    const total = quantity * price;
    
    document.getElementById('totalPrice').textContent = formatCurrency(total);
}

async function recordSale() {
    const saleDate = document.getElementById('saleDate').value;
    const ulamId = document.getElementById('saleUlam').value;
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    const price = parseFloat(document.getElementById('salePrice').value);
    
    if (!saleDate || !ulamId || !quantity || !price) {
        Toast.error('Kumpletuhin ang lahat ng fields.');
        return;
    }
    
    try {
        const response = await fetch('/Cinventory/api/sales_operations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                sale_date: saleDate,
                ulam_id: parseInt(ulamId),
                quantity_sold: quantity,
                price_per_serving: price
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            Toast.success('Benta nai-record na!');
            
            // Reset form
            document.getElementById('saleQuantity').value = '';
            document.getElementById('saleUlam').selectedIndex = 0;
            document.getElementById('salePrice').value = '';
            document.getElementById('totalPrice').textContent = '₱0.00';
            
            // Reload data
            loadTodaySales();
            loadUlams(); // Refresh available servings
        } else {
            Toast.error(data.message || 'May error sa pag-record.');
        }
    } catch (error) {
        console.error('Error recording sale:', error);
        Toast.error('May error sa pag-record.');
    }
}

async function loadTodaySales() {
    try {
        const response = await fetch('/Cinventory/api/sales_operations.php?action=today');
        const data = await response.json();
        
        if (data.success) {
            displaySales(data.sales);
            updateSummary(data.summary);
        }
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

function displaySales(sales) {
    const tbody = document.getElementById('salesTableBody');
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Walang benta pa ngayon.</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${formatTime(sale.sale_time)}</td>
            <td><strong>${sale.ulam_name}</strong></td>
            <td>${sale.quantity_sold}</td>
            <td>${formatCurrency(sale.price_per_serving)}</td>
            <td><strong>${formatCurrency(sale.total_price)}</strong></td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteSale(${sale.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateSummary(summary) {
    document.getElementById('todayTotal').textContent = formatCurrency(summary.total_sales);
    document.getElementById('topSeller').textContent = summary.top_seller || '-';
    document.getElementById('lowSeller').textContent = summary.low_seller || '-';
}

function deleteSale(saleId) {
    ConfirmModal.show(
        'Sigurado ka bang gusto mong tanggalin ang benta na ito? Ibabalik ang stock.',
        'Tanggalin ang Benta',
        async () => {
            try {
                const response = await fetch('/Cinventory/api/sales_operations.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'delete',
                        sale_id: saleId
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Toast.success('Benta tinanggal at stock na-restore!');
                    loadTodaySales();
                    loadUlams();
                } else {
                    Toast.error(data.message || 'Hindi matanggal ang benta.');
                }
            } catch (error) {
                console.error('Error deleting sale:', error);
                Toast.error('May error sa pagtanggal.');
            }
        }
    );
}
</script>
