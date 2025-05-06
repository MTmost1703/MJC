document.addEventListener('DOMContentLoaded', function() {
    // Elements - global references
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    
    // อาเรย์ข้อมูลผู้ใช้งาน - เพิ่มผู้ใช้ใหม่ที่นี่
    const users = [
        { username: 'admin', password: 'admin123', isAdmin: true },
        { username: 'Tanapong@gmail.com', password: 'admin456', isAdmin: true }
    ];
    
    // เพิ่ม Background Effects ให้กับ Login Form
    addBackgroundEffects();
    
    // เพิ่มการเปิด-ปิดการแสดงรหัสผ่าน
    setupPasswordToggle();
    
    // Login form submission handler
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Function to handle login
    function handleLogin() {
        // Basic validation
        if (!usernameInput.value || !passwordInput.value) {
            showMessage('Please enter both username and password', 'error');
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
        
        console.log("Attempting login with:", usernameInput.value, "and password:", "***");
        
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
                
                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html'; // เปลี่ยนเป็น index.html
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
    
    // Function to show messages (error or success)
    function showMessage(text, type) {
        removeMessages(); // Remove any existing messages
        
        const messageElement = document.createElement('div');
        messageElement.className = type === 'error' ? 'error-message' : 'login-message';
        messageElement.textContent = text;
        
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
        const togglePassword = document.querySelector('.toggle-password');
        if (!togglePassword) return;
        
        togglePassword.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            }
        });
    }
});
