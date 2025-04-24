// Toggle sidebar with burger menu
const burgerMenu = document.getElementById('burger-menu');
const sidebar = document.getElementById('sidebar');

burgerMenu.addEventListener('click', function() {
    this.classList.toggle('active');
    sidebar.classList.toggle('active');
    // Add overlay when sidebar is open on mobile
    toggleOverlay();
});

// Create and toggle overlay for mobile sidebar
function toggleOverlay() {
    let overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar.classList.contains('active') && window.innerWidth <= 768) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '50px';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = 'calc(100% - 50px)';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = '800';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('active');
                burgerMenu.classList.remove('active');
                this.remove();
            });
        }
    } else if (overlay) {
        overlay.remove();
    }
}

// Toggle submenu on menu item click with smooth animation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const menuName = this.getAttribute('data-menu');
        const submenu = document.getElementById(`${menuName}-submenu`);
        
        // Toggle active class for this submenu
        submenu.classList.toggle('active');
        this.classList.toggle('active');
        
        // Close other submenus
        document.querySelectorAll('.submenu').forEach(menu => {
            if (menu.id !== `${menuName}-submenu`) {
                menu.classList.remove('active');
            }
        });
        
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            if (menuItem !== this && menuItem.getAttribute('data-menu') !== menuName) {
                menuItem.classList.remove('active');
            }
        });

        // Adjust submenu max-height for animation
        if (submenu.classList.contains('active')) {
            const submenuHeight = Array.from(submenu.children).reduce((height, item) => {
                return height + item.offsetHeight;
            }, 0);
            submenu.style.maxHeight = submenuHeight + 'px';
        } else {
            submenu.style.maxHeight = '0px';
        }
    });
});

// Modified submenu item click to completely remove page title display
document.addEventListener('DOMContentLoaded', function() {
    // Ensure all .current-page elements are hidden in case there are any in the HTML
    const currentPageElements = document.querySelectorAll('.current-page');
    currentPageElements.forEach(el => {
        el.style.display = 'none';
    });
    
    // Make sure all .submenu-item click handlers don't try to update current page
    document.querySelectorAll('.submenu-item').forEach(item => {
        const originalClickHandler = item.onclick;
        item.onclick = function(e) {
            e.stopPropagation();
            
            // Highlight selected submenu item
            document.querySelectorAll('.submenu-item').forEach(subItem => {
                subItem.classList.remove('selected');
            });
            this.classList.add('selected');
            
            const parentMenu = this.closest('.submenu').id.replace('-submenu', '');
            const itemName = this.textContent.trim();
            
            // For mobile, close the sidebar after selection
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                burgerMenu.classList.remove('active');
                const overlay = document.getElementById('sidebar-overlay');
                if (overlay) overlay.remove();
            }
            
            // Load content without updating any breadcrumb
            loadContent(parentMenu, itemName);
        };
    });
});

// Function to load content (placeholder - replace with actual implementation)
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

// Add resize event listener to handle responsive behavior
window.addEventListener('resize', function() {
    // Close the sidebar on window resize if in mobile view
    if (window.innerWidth > 768) {
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.remove();
    } else if (!sidebar.classList.contains('active')) {
        // Remove overlay if sidebar is closed
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.remove();
    }
    
    // Reset submenu max-heights on resize
    adjustSubmenuHeights();
});

// Function to adjust submenu heights
function adjustSubmenuHeights() {
    document.querySelectorAll('.submenu.active').forEach(submenu => {
        const submenuHeight = Array.from(submenu.children).reduce((height, item) => {
            return height + item.offsetHeight;
        }, 0);
        submenu.style.maxHeight = submenuHeight + 'px';
    });
}

// Show Master submenu by default and adjust height
document.addEventListener('DOMContentLoaded', function() {
    // Hide all submenus initially - to match the image where all menus are collapsed
    document.querySelectorAll('.submenu').forEach(submenu => {
        submenu.classList.remove('active');
        submenu.style.maxHeight = '0';
    });
    
    document.querySelectorAll('.menu-item').forEach(menuItem => {
        menuItem.classList.remove('active');
    });
    
    // Add scroll indicator to sidebar if needed
    addSidebarScrollIndicator();
});

// Add scroll indicator to sidebar
function addSidebarScrollIndicator() {
    const sidebar = document.getElementById('sidebar');
    
    sidebar.addEventListener('scroll', function() {
        if (this.scrollTop > 20) {
            this.classList.add('scrolled');
        } else {
            this.classList.remove('scrolled');
        }
        
        // Check if reached bottom
        if (this.scrollHeight - this.scrollTop - this.clientHeight < 20) {
            this.classList.add('at-bottom');
        } else {
            this.classList.remove('at-bottom');
        }
    });
}

// Handle keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        burgerMenu.classList.remove('active');
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.remove();
    }
});
