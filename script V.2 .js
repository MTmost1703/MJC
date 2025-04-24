// Toggle sidebar with burger menu
const burgerMenu = document.getElementById('burger-menu');
const sidebar = document.getElementById('sidebar');

burgerMenu.addEventListener('click', function() {
    this.classList.toggle('active');
    sidebar.classList.toggle('active');
});

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
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            burgerMenu.classList.remove('active');
        }
        
        // Load content
        loadContent(parentMenu, itemName);
    });
});

// Function to load content
function loadContent(section, page) {
    const contentArea = document.querySelector('.content');
    
    // Display loading indicator
    contentArea.innerHTML = '<div class="loading">Loading content...</div>';
    
    // Simulate loading delay (remove in production)
    setTimeout(() => {
        contentArea.innerHTML = `
            <h2>${section.charAt(0).toUpperCase() + section.slice(1)} - ${page}</h2>
            <div class="content-box">
                <p>Content for ${page} will be displayed here.</p>
            </div>
        `;
    }, 300);
}

// Show Master submenu by default
document.addEventListener('DOMContentLoaded', function() {
    // Show Master menu by default
    const defaultMenu = document.querySelector('[data-menu="master"]');
    const defaultSubmenu = document.getElementById('master-submenu');
    
    if (defaultMenu && defaultSubmenu) {
        defaultMenu.classList.add('active');
        defaultSubmenu.classList.add('active');
    }
    
    // Initialize content area
    loadContent('master', 'Branch');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768 && 
        !e.target.closest('.sidebar') && 
        !e.target.closest('.burger-menu') && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        burgerMenu.classList.remove('active');
    }
});
