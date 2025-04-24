// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    // Check login status
    const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
    const username = sessionStorage.getItem('username');
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    // If not logged in, redirect to login page
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Add logout functionality
    setupLogoutButton();
    
    // Display username if available
    if (username) {
        const adminButton = document.querySelector('.nav-button');
        if (adminButton) {
            adminButton.textContent = username.toUpperCase();
        }
    }
    
    // If logged in but not admin, show limited access message
    if (!isAdmin) {
        const contentArea = document.querySelector('.content');
        if (contentArea) {
            contentArea.innerHTML = `
                <h2>Limited Access</h2>
                <div class="content-box">
                    <p>You are logged in as ${username}, but you don't have administrator privileges.</p>
                    <p>Please contact your system administrator for assistance.</p>
                </div>
            `;
        }
        
        // Hide sidebar for non-admin users
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        
        return;
    }
    
    // Initialize the portal for admin users
    initializePortal();
});

// Setup the logout button functionality
function setupLogoutButton() {
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear session data
            sessionStorage.removeItem('loggedIn');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('isAdmin');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
}

// Original portal functionality
function initializePortal() {
    // Toggle sidebar with burger menu
    const burgerMenu = document.getElementById('burger-menu');
    const sidebar = document.getElementById('sidebar');

    if (burgerMenu && sidebar) {
        burgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            sidebar.classList.toggle('active');
        });
    }

    // Toggle submenu on menu item click
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const menuName = this.getAttribute('data-menu');
            const submenu = document.getElementById(`${menuName}-submenu`);
            
            // First, close all submenus to prevent overlapping
            document.querySelectorAll('.submenu').forEach(menu => {
                menu.classList.remove('active');
            });
            
            document.querySelectorAll('.menu-item').forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Then toggle the clicked menu
            if (submenu) {
                submenu.classList.toggle('active');
                this.classList.toggle('active');
            }
        });
    });

    // Handle submenu item click
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling to parent menu item
            
            // Highlight selected submenu item
            document.querySelectorAll('.submenu-item').forEach(subItem => {
                subItem.classList.remove('selected');
            });
            this.classList.add('selected');
            
            const parentMenu = this.closest('.submenu').id.replace('-submenu', '');
            const itemName = this.textContent.trim();
            console.log(`Selected: ${parentMenu} > ${itemName}`);
            
            // For mobile, close the sidebar after selection
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('active');
                if (burgerMenu) burgerMenu.classList.remove('active');
            }
            
            // Load content
            loadContent(parentMenu, itemName);
        });
    });

    // Function to load content
    function loadContent(section, page) {
        const contentArea = document.querySelector('.content');
        
        if (!contentArea) return;
        
        // Display loading indicator
        contentArea.innerHTML = '<div class="loading">Loading content...</div>';
        
        // Simulate loading delay (remove in production)
        setTimeout(() => {
            contentArea.innerHTML = `
                <h2>${section.charAt(0).toUpperCase() + section.slice(1)} > ${page}</h2>
                <div class="content-box">
                    <p>Content for ${page} will be displayed here.</p>
                </div>
            `;
        }, 300);
    }

    // Show Master submenu by default
    const defaultMenu = document.querySelector('[data-menu="master"]');
    const defaultSubmenu = document.getElementById('master-submenu');
    
    if (defaultMenu && defaultSubmenu) {
        defaultMenu.classList.add('active');
        defaultSubmenu.classList.add('active');
    }
    
    // Initialize content area
    loadContent('master', 'Branch');

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (sidebar && 
            window.innerWidth <= 768 && 
            !e.target.closest('.sidebar') && 
            !e.target.closest('.burger-menu') && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            if (burgerMenu) burgerMenu.classList.remove('active');
        }
    });
}
