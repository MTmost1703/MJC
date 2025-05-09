document.addEventListener('DOMContentLoaded', function() {
    // Elements - global references
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const togglePassword = document.querySelector('.toggle-password');
    const touchFeedback = document.getElementById('touch-feedback');
    const pageTransition = document.querySelector('.page-transition');
    
    // อาเรย์ข้อมูลผู้ใช้งาน - เพิ่มผู้ใช้ใหม่ที่นี่ (ในความเป็นจริงควรอยู่ในฐานข้อมูล)
    const users = [
        { username: 'admin', password: 'admin123', isAdmin: true },
        { username: 'Tanapong@gmail.com', password: 'admin456', isAdmin: true }
    ];
    
    // Check if already logged in
    checkLoginStatus();
    
    // Initialize touch feedback
    initTouchFeedback();
    
    // เพิ่ม Background Effects ให้กับ Login Form
    addBackgroundEffects();
    
    // เพิ่มการเปิด-ปิดการแสดงรหัสผ่าน
    setupPasswordToggle();
    
    // Login form submission handler
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Function to check if already logged in
    function checkLoginStatus() {
        const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
        
        if (isLoggedIn) {
            // Already logged in, redirect to dashboard
            showPageTransition();
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 300);
        }
    }
    
    // Function to handle login
    function handleLogin() {
        // Create ripple effect on button
        createRippleEffect(loginBtn, {
            clientX: loginBtn.getBoundingClientRect().left + loginBtn.offsetWidth / 2,
            clientY: loginBtn.getBoundingClientRect().top + loginBtn.offsetHeight / 2
        });
        
        // Basic validation
        if (!usernameInput.value || !passwordInput.value) {
            showMessage('Please enter both username and password', 'error');
            
            // Shake animation for empty fields
            if (!usernameInput.value) {
                shakeElement(usernameInput);
            }
            if (!passwordInput.value) {
                shakeElement(passwordInput);
            }
            return;
        }
        
        // Remove any existing messages
        removeMessages();
        
        // Add loading effect to login button
        loginBtn.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>
                </svg>
                กำลังเข้าสู่ระบบ...
            </span>
        `;
        
        // Disable form elements during login
        setFormEnabled(false);
        
        console.log("Attempting login with:", usernameInput.value);
        
        // Check credentials with delay for better UX
        setTimeout(() => {
            // Find user from array
            const foundUser = users.find(user => 
                user.username === usernameInput.value && user.password === passwordInput.value
            );
            
            if (foundUser) {
                // User is valid - store login data
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('username', foundUser.username);
                sessionStorage.setItem('isAdmin', foundUser.isAdmin ? 'true' : 'false');
                
                console.log("Login successful! User found:", foundUser.username);
                
                // Show success message
                showMessage('Login successful! Redirecting to dashboard...', 'success');
                
                // Prepare for transition
                showPageTransition();
                
                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                console.log("Login failed. Invalid credentials.");
                
                // Reset login button
                resetLoginButton();
                
                // Show error message
                showMessage('Invalid username or password. Please try again.', 'error');
                
                // Clear password field
                passwordInput.value = '';
                passwordInput.focus();
                
                // Enable form
                setFormEnabled(true);
            }
        }, 800);
    }
    
    // Function to reset login button
    function resetLoginButton() {
        loginBtn.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                เข้าสู่ระบบ
            </span>
        `;
    }
    
    // Function to enable/disable form elements
    function setFormEnabled(enabled) {
        usernameInput.disabled = !enabled;
        passwordInput.disabled = !enabled;
        loginBtn.disabled = !enabled;
    }
    
    // Function to show messages (error or success)
    function showMessage(text, type) {
        removeMessages(); // Remove any existing messages
        
        const messageElement = document.createElement('div');
        messageElement.className = type === 'error' ? 'error-message' : 'login-message';
        messageElement.textContent = text;
        
        // Add icon to message
        if (type === 'error') {
            messageElement.innerHTML = `
                <span style="display: inline-flex; align-items: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    ${text}
                </span>
            `;
        } else {
            messageElement.innerHTML = `
                <span style="display: inline-flex; align-items: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    ${text}
                </span>
            `;
        }
        
        loginForm.appendChild(messageElement);
    }
    
    // Function to remove all messages
    function removeMessages() {
        const messages = document.querySelectorAll('.error-message, .login-message');
        messages.forEach(msg => msg.remove());
    }
    
    // Function to add background effects
    function addBackgroundEffects() {
        const loginForm = document.querySelector('.login-form');
        if (!loginForm) return;
        
        // Check if already enhanced
        if (loginForm.querySelector('.login-background-effect')) return;
        
        // Add background effects
        const backgroundEffect1 = document.createElement('div');
        backgroundEffect1.className = 'login-background-effect';
        
        const backgroundEffect2 = document.createElement('div');
        backgroundEffect2.className = 'login-background-effect';
        
        loginForm.appendChild(backgroundEffect1);
        loginForm.appendChild(backgroundEffect2);
    }
    
    // Function to setup password toggle
    function setupPasswordToggle() {
        if (!togglePassword) return;
        
        // Mouse click event
        togglePassword.addEventListener('click', togglePasswordVisibility);
        
        // Keyboard accessibility
        togglePassword.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePasswordVisibility();
            }
        });
        
        // Touch event
        togglePassword.addEventListener('touchstart', function(e) {
            createRippleEffect(this, e);
        });
    }
    
    // Function to toggle password visibility
    function togglePasswordVisibility() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
            togglePassword.setAttribute('aria-label', 'Hide password');
        } else {
            passwordInput.type = 'password';
            togglePassword.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            togglePassword.setAttribute('aria-label', 'Show password');
        }
        
        // Focus back on password input for better UX
        passwordInput.focus();
    }
    
    // Function to create ripple effect for touches/clicks
    function createRippleEffect(element, e) {
        if (!touchFeedback) return;
        
        // Get position coordinates
        const x = e.clientX || (e.touches && e.touches[0].clientX) || element.getBoundingClientRect().left + element.offsetWidth / 2;
        const y = e.clientY || (e.touches && e.touches[0].clientY) || element.getBoundingClientRect().top + element.offsetHeight / 2;
        
        // Position the element
        touchFeedback.style.left = `${x}px`;
        touchFeedback.style.top = `${y}px`;
        
        // Reset animation
        touchFeedback.classList.remove('active');
        void touchFeedback.offsetWidth; // Force reflow
        touchFeedback.classList.add('active');
        
        // Remove class after animation completes
        setTimeout(() => {
            touchFeedback.classList.remove('active');
        }, 600);
    }
    
    // Initialize touch feedback effects
    function initTouchFeedback() {
        if (!touchFeedback) return;
        
        // Listen for all relevant clicks/touches
        document.addEventListener('click', function(e) {
            // Only on mobile/tablet
            if (window.innerWidth <= 768) {
                const target = e.target;
                const isButton = 
                    target.classList.contains('login-btn') ||
                    target.classList.contains('toggle-password') ||
                    target.closest('.login-btn') ||
                    target.closest('.toggle-password');
                
                if (isButton) {
                    createRippleEffect(target, e);
                }
            }
        });
    }
    
    // Function to show page transition
    function showPageTransition() {
        if (!pageTransition) return;
        
        pageTransition.classList.add('active');
    }
    
    // Function to shake element (for validation errors)
    function shakeElement(element) {
        element.classList.add('shake-error');
        
        // Add shake animation
        element.style.animation = 'errorShake 0.5s ease';
        
        // Highlight field
        element.style.borderColor = '#dc3545';
        element.style.backgroundColor = 'rgba(220, 53, 69, 0.05)';
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
        
        // Add event listener to reset on focus
        element.addEventListener('focus', function onFocus() {
            element.style.borderColor = '';
            element.style.backgroundColor = '';
            element.removeEventListener('focus', onFocus);
        });
    }
    
    // Add focus and blur effects for inputs
    usernameInput.addEventListener('focus', function() {
        highlightInputGroup(this, true);
    });
    
    usernameInput.addEventListener('blur', function() {
        highlightInputGroup(this, false);
    });
    
    passwordInput.addEventListener('focus', function() {
        highlightInputGroup(this, true);
    });
    
    passwordInput.addEventListener('blur', function() {
        highlightInputGroup(this, false);
    });
    
    // Function to highlight input group
    function highlightInputGroup(input, isFocused) {
        const label = input.closest('.form-group').querySelector('label');
        
        if (isFocused) {
            label.style.color = '#00a2e8';
            label.style.transform = 'scale(1.05)';
            label.style.transformOrigin = 'left';
        } else {
            label.style.color = '';
            label.style.transform = '';
        }
    }
    
    // Add animation effects to the form elements on load
    function animateFormElements() {
        const heading = document.querySelector('.login-form h2');
        const formGroups = document.querySelectorAll('.form-group');
        const loginButton = document.querySelector('.login-btn');
        
        if (heading) {
            heading.style.opacity = '0';
            heading.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                heading.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                heading.style.opacity = '1';
                heading.style.transform = 'translateY(0)';
            }, 100);
        }
        
        formGroups.forEach((group, index) => {
            group.style.opacity = '0';
            group.style.transform = 'translateY(20px)';
            setTimeout(() => {
                group.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, 200 + (index * 100));
        });
        
        if (loginButton) {
            loginButton.style.opacity = '0';
            loginButton.style.transform = 'translateY(20px)';
            setTimeout(() => {
                loginButton.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                loginButton.style.opacity = '1';
                loginButton.style.transform = 'translateY(0)';
            }, 400 + (formGroups.length * 100));
        }
    }
    
    // Run animation on load
    animateFormElements();
    
    // Auto-focus on username field for better UX
    if (usernameInput && window.innerWidth > 768) {
        setTimeout(() => {
            usernameInput.focus();
        }, 500);
    }
    
    // Listen for escape key to clear fields
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Clear form fields
            if (document.activeElement === usernameInput || document.activeElement === passwordInput) {
                document.activeElement.value = '';
            }
        }
    });
    
    // Add styles for enhanced transitions
    document.head.insertAdjacentHTML('beforeend', `
    <style>
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes shake-error {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .shake-error {
        animation: shake-error 0.5s ease;
    }
    </style>
    `);
});
