// Login page script
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const loginBtn = document.querySelector('.login-btn');
    
    // Handle login button click
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        // Check against admin credentials
        if (username === 'admin' && password === 'admin123') {
            // Set login data in sessionStorage
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('isAdmin', 'true');
            
            // Show login success message
            const loginMessage = document.createElement('div');
            loginMessage.className = 'login-message';
            loginMessage.textContent = 'Login successful! Redirecting to admin page...';
            document.querySelector('.login-form').appendChild(loginMessage);
            
            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to main page
            }, 1000);
        } else {
            // Show error message
            let errorMessage = document.querySelector('.error-message');
            
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                document.querySelector('.login-form').appendChild(errorMessage);
            }
            
            errorMessage.textContent = 'Invalid username or password. Please try again.';
            
            // Clear password field
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    });
    
    // Handle Enter key press
    loginForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Focus on username field when page loads
    document.getElementById('username').focus();
});
