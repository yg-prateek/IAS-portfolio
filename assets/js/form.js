/**
 * FORM.JS
 * Contact Form Validation (Client-side only)
 * Dr. M. R. Ravi, IAS Portfolio
 */

(function () {
    'use strict';

    // ========================================
    // Form Validator
    // ========================================

    class FormValidator {
        constructor(form) {
            this.form = form;
            this.fields = {};
            this.init();
        }

        init() {
            // Collect form fields
            const inputs = this.form.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                if (input.name) {
                    this.fields[input.name] = {
                        element: input,
                        rules: this.getValidationRules(input)
                    };
                }
            });

            // Form submit handler
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Real-time validation on blur
            Object.values(this.fields).forEach(field => {
                field.element.addEventListener('blur', () => {
                    this.validateField(field);
                });

                // Clear error on input
                field.element.addEventListener('input', () => {
                    this.clearFieldError(field);
                });
            });
        }

        getValidationRules(input) {
            const rules = [];

            if (input.required) {
                rules.push({
                    test: (value) => value.trim() !== '',
                    message: 'This field is required'
                });
            }

            if (input.type === 'email') {
                rules.push({
                    test: (value) => {
                        if (!value) return true; // Let required rule handle empty
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return emailRegex.test(value);
                    },
                    message: 'Please enter a valid email address'
                });
            }

            if (input.minLength > 0) {
                rules.push({
                    test: (value) => {
                        if (!value) return true;
                        return value.length >= input.minLength;
                    },
                    message: `Must be at least ${input.minLength} characters`
                });
            }

            if (input.maxLength > 0 && input.maxLength < 524288) {
                rules.push({
                    test: (value) => value.length <= input.maxLength,
                    message: `Must be no more than ${input.maxLength} characters`
                });
            }

            if (input.pattern) {
                rules.push({
                    test: (value) => {
                        if (!value) return true;
                        const regex = new RegExp(input.pattern);
                        return regex.test(value);
                    },
                    message: input.title || 'Please match the required format'
                });
            }

            return rules;
        }

        validateField(field) {
            const value = field.element.value;

            for (const rule of field.rules) {
                if (!rule.test(value)) {
                    this.showFieldError(field, rule.message);
                    return false;
                }
            }

            this.clearFieldError(field);
            return true;
        }

        validateAll() {
            let isValid = true;

            Object.values(this.fields).forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        showFieldError(field, message) {
            const input = field.element;
            const formGroup = input.closest('.form-group');

            // Add error class
            input.classList.add('error');

            // Remove existing error message
            const existingError = formGroup.querySelector('.form-error');
            if (existingError) {
                existingError.remove();
            }

            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.setAttribute('role', 'alert');
            errorDiv.textContent = message;

            formGroup.appendChild(errorDiv);

            // Set ARIA invalid
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', `${input.name}-error`);
            errorDiv.id = `${input.name}-error`;
        }

        clearFieldError(field) {
            const input = field.element;
            const formGroup = input.closest('.form-group');

            // Remove error class
            input.classList.remove('error');

            // Remove error message
            const existingError = formGroup.querySelector('.form-error');
            if (existingError) {
                existingError.remove();
            }

            // Remove ARIA invalid
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        }

        handleSubmit(e) {
            e.preventDefault();

            if (this.validateAll()) {
                this.showSuccess();
            } else {
                // Focus first invalid field
                const firstError = this.form.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                }
            }
        }

        showSuccess() {
            // Create success message
            const successDiv = document.createElement('div');
            successDiv.className = 'form-success';
            successDiv.setAttribute('role', 'alert');
            successDiv.innerHTML = `
                <strong>Thank you for your message!</strong>
                <p>Your message has been received. We will get back to you soon.</p>
            `;

            // Replace form with success message
            this.form.innerHTML = '';
            this.form.appendChild(successDiv);

            // Focus success message
            successDiv.setAttribute('tabindex', '-1');
            successDiv.focus();
        }
    }

    // ========================================
    // Initialize Forms
    // ========================================

    function initForms() {
        const forms = document.querySelectorAll('form[data-validate]');

        forms.forEach(form => {
            new FormValidator(form);
        });
    }

    // ========================================
    // Initialize on DOM Ready
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForms);
    } else {
        initForms();
    }

})();
