/**
 * tsParticles Configuration & State Management
 * Handles dynamic particle states for authentication pages
 */

// Particle state configurations
const particleStates = {
    idle: {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ["#7cb342", "#ff9800", "#ffffff"]
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#7cb342",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: false
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.3
                    }
                }
            }
        },
        retina_detect: true
    },

    focus: {
        particles: {
            color: {
                value: ["#8bc34a", "#ffa726", "#ffffff"]
            },
            opacity: {
                value: 0.6
            },
            line_linked: {
                color: "#8bc34a",
                opacity: 0.3
            }
        }
    },

    error: {
        particles: {
            color: {
                value: ["#f44336", "#ff5252", "#ffffff"]
            },
            opacity: {
                value: 0.7
            },
            line_linked: {
                color: "#f44336",
                opacity: 0.4
            }
        }
    },

    success: {
        particles: {
            opacity: {
                value: 0.3,
                anim: {
                    enable: true,
                    speed: 3,
                    opacity_min: 0,
                    sync: true
                }
            }
        }
    }
};

// Initialize particles
function initParticles() {
    if (typeof tsParticles === 'undefined') {
        console.error('tsParticles library not loaded');
        return;
    }

    tsParticles.load("tsparticles", particleStates.idle);
}

// Update particle state without reload
function updateParticleState(state) {
    if (typeof tsParticles === 'undefined') return;

    const container = tsParticles.domItem(0);
    if (!container) return;

    const stateConfig = particleStates[state];
    if (!stateConfig) return;

    // Update particles configuration
    if (stateConfig.particles) {
        if (stateConfig.particles.color) {
            container.options.particles.color = stateConfig.particles.color;
        }
        if (stateConfig.particles.opacity) {
            container.options.particles.opacity = stateConfig.particles.opacity;
        }
        if (stateConfig.particles.line_linked) {
            container.options.particles.line_linked = stateConfig.particles.line_linked;
        }
    }

    // Refresh particles
    container.refresh();
}

// Set up event listeners for form interactions
function setupParticleInteractions() {
    const formInputs = document.querySelectorAll('.form-control');
    const loginForm = document.querySelector('form');

    // Focus state
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            updateParticleState('focus');
        });

        input.addEventListener('blur', () => {
            updateParticleState('idle');
        });
    });

    // Error state (triggered by error message presence)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const errorAlert = document.querySelector('.alert-error');
                if (errorAlert) {
                    updateParticleState('error');
                    // Return to idle after 2 seconds
                    setTimeout(() => {
                        updateParticleState('idle');
                    }, 2000);
                }
            }
        });
    });

    // Observe the login card for error messages
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        observer.observe(loginCard, { childList: true, subtree: true });
    }

    // Success state (on form submit if no errors)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // Check if there are no validation errors
            const hasErrors = document.querySelector('.alert-error');
            if (!hasErrors) {
                updateParticleState('success');
            }
        });
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initParticles();
        setupParticleInteractions();
    });
} else {
    initParticles();
    setupParticleInteractions();
}
