// ============================================
// Utility Functions
// Shared helper functions for the application
// ============================================

/**
 * Format currency in Philippine Peso
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
    return '₱' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Format date
 * @param {string|Date} date
 * @returns {string}
 */
function formatDate(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-PH', options);
}

/**
 * Format time
 * @param {string} time
 * @returns {string}
 */
function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Clear form inputs
 * @param {string} formId
 */
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

/**
 * Toast notification system
 */
const Toast = {
    success: function (message) {
        this.show(message, 'success');
    },
    error: function (message) {
        this.show(message, 'error');
    },
    info: function (message) {
        this.show(message, 'info');
    },
    show: function (message, type = 'info') {
        // Remove existing toasts
        const existing = document.querySelectorAll('.toast');
        existing.forEach(toast => toast.remove());

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add to body
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
};

/**
 * Confirmation modal
 */
const ConfirmModal = {
    show: function (message, onConfirm, onCancel) {
        // Remove existing modal
        const existing = document.getElementById('confirmModal');
        if (existing) {
            existing.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'confirmModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h3>Confirmation</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="confirmCancel">Cancel</button>
                    <button class="btn btn-danger" id="confirmOk">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Event listeners
        document.getElementById('confirmOk').addEventListener('click', () => {
            this.hide();
            if (onConfirm) onConfirm();
        });

        document.getElementById('confirmCancel').addEventListener('click', () => {
            this.hide();
            if (onCancel) onCancel();
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
                if (onCancel) onCancel();
            }
        });
    },
    hide: function () {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
};

/**
 * Show/hide loading spinner
 */
const Loading = {
    show: function () {
        let spinner = document.getElementById('loadingSpinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'loadingSpinner';
            spinner.className = 'loading-spinner';
            spinner.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(spinner);
        }
        spinner.classList.add('active');
    },
    hide: function () {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.remove('active');
        }
    }
};

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.utils = {
        formatCurrency,
        formatDate,
        formatTime,
        clearForm,
        debounce,
        escapeHtml
    };
    window.Toast = Toast;
    window.ConfirmModal = ConfirmModal;
    window.Loading = Loading;
}
