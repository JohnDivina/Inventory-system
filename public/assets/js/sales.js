// ============================================
// Sales JavaScript
// Record sales and manage transactions with Supabase
// ============================================

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

    loadUlamsForSale();
    loadTodaySales();
});

/**
 * Load ulams for sale dropdown
 */
async function loadUlamsForSale() {
    try {
        const { data: ulams, error } = await supabase
            .from('ulams')
            .select('id, name, selling_price, status')
            .eq('status', 'active')
            .order('name');

        if (error) throw error;

        const select = document.getElementById('saleUlam');
        select.innerHTML = '<option value="">-- Pumili ng Ulam --</option>' +
            ulams.map(ulam => `
                <option value="${ulam.id}" data-price="${ulam.selling_price}">
                    ${ulam.name} (₱${ulam.selling_price})
                </option>
            `).join('');
    } catch (error) {
        console.error('Error loading ulams:', error);
        Toast.error('Hindi ma-load ang mga ulam.');
    }
}

/**
 * Update price when ulam is selected
 */
function updateSalePrice() {
    const select = document.getElementById('saleUlam');
    const priceInput = document.getElementById('salePrice');
    const selectedOption = select.options[select.selectedIndex];

    if (selectedOption.value) {
        priceInput.value = selectedOption.dataset.price;
    } else {
        priceInput.value = '';
    }
}

/**
 * Record a sale
 */
async function recordSale() {
    const ulamId = document.getElementById('saleUlam').value;
    const quantity = document.getElementById('saleQuantity').value;
    const price = document.getElementById('salePrice').value;

    if (!ulamId || !quantity || !price) {
        Toast.error('Kumpletuhin ang lahat ng fields.');
        return;
    }

    try {
        Loading.show();

        // Use RPC function to record sale with stock deduction
        const { data, error } = await supabase.rpc('record_sale', {
            p_ulam_id: parseInt(ulamId),
            p_quantity_sold: parseInt(quantity),
            p_price_per_serving: parseFloat(price)
        });

        if (error) throw error;

        if (data && data.success === false) {
            Loading.hide();
            Toast.error(data.message || 'Hindi makapag-record ng sale.');
            return;
        }

        Loading.hide();
        Toast.success('Sale recorded successfully!');
        clearForm('salesForm');
        loadTodaySales();
    } catch (error) {
        Loading.hide();
        console.error('Error recording sale:', error);
        Toast.error('May error sa pag-record ng sale.');
    }
}

/**
 * Load today's sales
 */
async function loadTodaySales() {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data: sales, error } = await supabase
            .from('sales')
            .select(`
                id,
                sale_time,
                quantity_sold,
                price_per_serving,
                total_price,
                ulams (name)
            `)
            .eq('sale_date', today)
            .order('sale_time', { ascending: false });

        if (error) throw error;

        displayTodaySales(sales);
        updateSalesSummary(sales);
    } catch (error) {
        console.error('Error loading sales:', error);
        Toast.error('Hindi ma-load ang sales.');
    }
}

/**
 * Display today's sales in table
 */
function displayTodaySales(sales) {
    const tbody = document.getElementById('salesTableBody');

    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Walang sales pa ngayong araw.</td></tr>';
        return;
    }

    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${formatTime(sale.sale_time)}</td>
            <td><strong>${sale.ulams.name}</strong></td>
            <td>${sale.quantity_sold}</td>
            <td>${formatCurrency(sale.price_per_serving)}</td>
            <td><strong>${formatCurrency(sale.total_price)}</strong></td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteSale(${sale.id})">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Update sales summary
 */
function updateSalesSummary(sales) {
    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total_price), 0);
    const totalTransactions = sales.length;

    document.getElementById('totalSalesToday').textContent = formatCurrency(totalSales);
    document.getElementById('totalTransactions').textContent = totalTransactions;
}

/**
 * Delete a sale
 */
function deleteSale(saleId) {
    ConfirmModal.show(
        'Sigurado ka bang gusto mong tanggalin ang sale na ito? Ang stock ay ibabalik.',
        async () => {
            try {
                Loading.show();

                // Use RPC function to delete sale and restore stock
                const { data, error } = await supabase.rpc('delete_sale', {
                    p_sale_id: saleId
                });

                if (error) throw error;

                if (data && data.success === false) {
                    Loading.hide();
                    Toast.error(data.message || 'Hindi matanggal ang sale.');
                    return;
                }

                Loading.hide();
                Toast.success('Sale deleted and stock restored!');
                loadTodaySales();
            } catch (error) {
                Loading.hide();
                console.error('Error deleting sale:', error);
                Toast.error('May error sa pagtanggal ng sale.');
            }
        }
    );
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await auth.logout();
});
