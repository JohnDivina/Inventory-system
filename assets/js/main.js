/**
 * Main JavaScript Utilities
 * Common functions for the Karinderya Management System
 */

// Toast Notification System
const Toast = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 3000) {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.25rem;">${this.getIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'error');
    },
    
    warning(message) {
        this.show(message, 'warning');
    },
    
    info(message) {
        this.show(message, 'info');
    }
};

// Confirmation Modal
const ConfirmModal = {
    modal: null,
    callback: null,
    
    init() {
        if (!this.modal) {
            this.modal = document.createElement('div');
            this.modal.className = 'modal';
            this.modal.id = 'confirmModal';
            this.modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="confirmModalTitle">Confirm Action</h3>
                    </div>
                    <div class="modal-body">
                        <p id="confirmModalMessage"></p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ConfirmModal.hide()">Kanselahin</button>
                        <button class="btn btn-danger" onclick="ConfirmModal.confirm()">Kumpirmahin</button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.modal);
        }
    },
    
    show(message, title = 'Kumpirmahin ang Aksyon', callback) {
        this.init();
        this.callback = callback;
        
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        
        this.modal.classList.add('show');
    },
    
    hide() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
        this.callback = null;
    },
    
    confirm() {
        if (this.callback && typeof this.callback === 'function') {
            this.callback();
        }
        this.hide();
    }
};

// AJAX Helper Functions
const Ajax = {
    async request(url, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            const result = await response.json();
            
            return result;
        } catch (error) {
            console.error('AJAX Error:', error);
            Toast.error('May error sa koneksyon. Subukan ulit.');
            throw error;
        }
    },
    
    async get(url) {
        return this.request(url, 'GET');
    },
    
    async post(url, data) {
        return this.request(url, 'POST', data);
    },
    
    async put(url, data) {
        return this.request(url, 'PUT', data);
    },
    
    async delete(url) {
        return this.request(url, 'DELETE');
    }
};

// Number Formatting (Philippine Peso)
function formatCurrency(amount) {
    return '₱' + parseFloat(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Date Formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });
    
    if (!isValid) {
        Toast.error('Kumpletuhin ang lahat ng required fields.');
    }
    
    return isValid;
}

// Clear Form
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Reset border colors
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.borderColor = 'var(--border-color)';
        });
    }
}

// Debounce function for search
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize toast container
    Toast.init();
    
    // Add active class to current nav item
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
            item.classList.add('active');
        }
    });
});
