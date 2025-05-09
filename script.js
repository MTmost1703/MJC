document.addEventListener('DOMContentLoaded', function() {
    // Elements - global references
    const burgerMenu = document.getElementById('burger-menu');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const touchFeedback = document.getElementById('touch-feedback');
    
    // สร้างตัวแปรสำหรับเก็บ timeout ของการปิด sidebar อัตโนมัติ
    let sidebarTimeout;
    // ตัวแปรสำหรับอนิเมชั่น
    let isContentTransitioning = false;
    
    // Mark document as loaded for transition effects
    document.body.classList.add('loaded');
    
    // Check login status - ตรวจสอบสถานะล็อกอินก่อนแสดงแดชบอร์ด
    checkLoginStatus();
    
    // Initialize touch feedback effects
    initTouchFeedback();
    
    // Initialize dashboard functionality
    initializeDashboard();
    
    // Function to check login status
    function checkLoginStatus() {
        const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
        const storedUsername = sessionStorage.getItem('username');
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        
        console.log("Checking login status:", isLoggedIn ? "Logged in" : "Not logged in");
        
        if (!isLoggedIn) {
            // Add transition effect
            showPageTransition();
            
            // Redirect to login page if not logged in
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 300); // Delay for transition
            return;
        }
        
        // Update username display
        if (usernameDisplay && storedUsername) {
            usernameDisplay.textContent = storedUsername.toUpperCase();
            usernameDisplay.title = storedUsername; // เพิ่ม title attribute เพื่อแสดงชื่อเต็มเมื่อ hover
        }
        
        // หากไม่ใช่ admin แสดงข้อความแจ้งเตือน
        if (!isAdmin) {
            if (content) {
                content.innerHTML = `
                    <h2>Limited Access</h2>
                    <div class="content-box">
                        <p>You are logged in as ${storedUsername}, but you don't have administrator privileges.</p>
                        <p>Please contact your system administrator for assistance.</p>
                    </div>
                `;
            }
        }
    }
    
    // Function to handle logout
    function handleLogout(e) {
        if (e && e.cancelable) e.preventDefault();
        
        console.log("Logging out...");
        
        // Clear session data
        sessionStorage.removeItem('loggedIn');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('isAdmin');
        
        // Clear menu state
        localStorage.removeItem('activeMenus');
        
        // Add transition
        showPageTransition();
        
        // Redirect to login page after animation
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 300); // Delay to show transition
    }
    
    // Function to close sidebar completely
    function closeSidebar() {
        if (!sidebar) return;
        
        // Add closing animation class
        sidebar.classList.add('closing');
        
        // Change state after animation
        setTimeout(() => {
            sidebar.classList.remove('active');
            sidebar.classList.remove('closing');
            sidebar.style.left = '-250px';
            
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
            
            if (burgerMenu) {
                burgerMenu.classList.remove('active');
            }
            
            // Re-enable body scrolling
            document.body.style.overflow = '';
        }, 50); // Short timeout for smoother animation
        
        // ยกเลิก timeout การปิดอัตโนมัติ
        clearTimeout(sidebarTimeout);
    }
    
    // Function to toggle sidebar
    function toggleSidebar(e) {
        if (e && e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Create ripple effect if clicked
        if (e && e.type === 'click' && burgerMenu) {
            createRippleEffect(burgerMenu, e);
        }
        
        if (burgerMenu) {
            burgerMenu.classList.toggle('active');
        }
        
        if (sidebar) {
            const isActive = sidebar.classList.contains('active');
            
            if (isActive) {
                // ถ้า sidebar กำลังเปิดอยู่ ให้ปิด
                closeSidebar();
            } else {
                // ถ้า sidebar กำลังปิดอยู่ ให้เปิด
                sidebar.classList.add('active');
                sidebar.style.left = '0';
                
                if (sidebarOverlay) {
                    sidebarOverlay.classList.add('active');
                }
                
                // ล็อค scrolling เมื่อเปิด sidebar บนมือถือ
                if (window.innerWidth <= 768) {
                    document.body.style.overflow = 'hidden';
                }
                
                // ตั้งเวลาปิดอัตโนมัติหลังจากไม่ได้ใช้งาน
                setupSidebarAutoClose();
            }
        }
        
        console.log("Toggled sidebar, active:", sidebar ? sidebar.classList.contains('active') : 'sidebar not found');
    }
    
    // Function to setup auto-close for sidebar
    function setupSidebarAutoClose() {
        if (window.innerWidth <= 768) {
            // ตั้งเวลาปิด sidebar หลังจากไม่ได้ใช้งาน 60 วินาที (บนมือถือเท่านั้น)
            clearTimeout(sidebarTimeout);
            
            sidebarTimeout = setTimeout(() => {
                if (sidebar && sidebar.classList.contains('active')) {
                    // แสดงการแจ้งเตือนว่ากำลังจะปิด sidebar
                    showSidebarCloseNotification().then(() => {
                        closeSidebar();
                    });
                }
            }, 60000); // 60 วินาที
        }
    }
    
    // Show countdown notification before auto-closing
    function showSidebarCloseNotification() {
        return new Promise((resolve) => {
            // Remove any existing notifications
            const existingNotification = document.querySelector('.sidebar-notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            // Create notification
            const notification = document.createElement('div');
            notification.className = 'sidebar-notification';
            notification.textContent = 'Menu will close automatically in 5 seconds...';
            
            // Add to DOM
            document.body.appendChild(notification);
            
            // Resolve after 5 seconds
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    notification.remove();
                    resolve();
                }, 300);
            }, 5000);
        });
    }
    
    // Initialize touch feedback
    function initTouchFeedback() {
        if (!touchFeedback) return;
        
        // Listen for touches/clicks on menu items and buttons
        document.addEventListener('click', function(e) {
            // Only on mobile/tablet
            if (window.innerWidth <= 768) {
                const target = e.target;
                const isMenuOrButton = 
                    target.classList.contains('menu-item') || 
                    target.classList.contains('submenu-item') ||
                    target.classList.contains('logout-btn') ||
                    target.classList.contains('nav-button') ||
                    target.classList.contains('burger-menu') ||
                    target.closest('.menu-item') ||
                    target.closest('.submenu-item') ||
                    target.closest('.logout-btn') ||
                    target.closest('.nav-button') ||
                    target.closest('.burger-menu');
                
                if (isMenuOrButton) {
                    createRippleEffect(target, e);
                }
            }
        });
    }
    
    // Create ripple effect for touch/click feedback
    function createRippleEffect(target, e) {
        if (!touchFeedback) return;
        
        // Get position
        const x = e.clientX || (e.touches && e.touches[0].clientX) || target.getBoundingClientRect().left + target.offsetWidth / 2;
        const y = e.clientY || (e.touches && e.touches[0].clientY) || target.getBoundingClientRect().top + target.offsetHeight / 2;
        
        // Position the feedback element
        touchFeedback.style.left = `${x}px`;
        touchFeedback.style.top = `${y}px`;
        
        // Trigger animation
        touchFeedback.classList.remove('active');
        void touchFeedback.offsetWidth; // Force reflow
        touchFeedback.classList.add('active');
        
        // Remove class after animation completes
        setTimeout(() => {
            touchFeedback.classList.remove('active');
        }, 600);
    }
    
    // Function to initialize dashboard functionality
    function initializeDashboard() {
        // Toggle sidebar with burger menu
        if (burgerMenu) {
            burgerMenu.addEventListener('click', toggleSidebar);
            
            // Keyboard accessibility
            burgerMenu.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSidebar(e);
                }
            });
        }
        
        // Close sidebar when overlay is clicked
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function(e) {
                if (e.target === sidebarOverlay) {
                    closeSidebar();
                }
            });
        }
        
        // Toggle submenu on menu item click
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const menuName = this.getAttribute('data-menu');
                const submenu = document.getElementById(`${menuName}-submenu`);
                
                if (!submenu) {
                    console.error(`Submenu element not found: ${menuName}-submenu`);
                    return;
                }
                
                // Create ripple effect
                createRippleEffect(this, e);
                
                // ปิดทุก submenu ก่อน (ยกเว้นเมนูปัจจุบัน)
                document.querySelectorAll('.submenu').forEach(menu => {
                    if (menu.id !== `${menuName}-submenu`) {
                        menu.classList.remove('active');
                        menu.style.maxHeight = '0';
                    }
                });
                
                document.querySelectorAll('.menu-item').forEach(menuItem => {
                    if (menuItem !== this) {
                        menuItem.classList.remove('active');
                        menuItem.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // สลับ active state (เปิด/ปิด submenu ปัจจุบัน)
                this.classList.toggle('active');
                submenu.classList.toggle('active');
                
                // อัปเดต aria-expanded สำหรับการเข้าถึง
                this.setAttribute('aria-expanded', this.classList.contains('active') ? 'true' : 'false');
                
                if (submenu.classList.contains('active')) {
                    submenu.style.maxHeight = '2000px';
                    
                    // Smooth scroll to ensure menu item is visible
                    if (window.innerWidth <= 768) {
                        const itemPosition = this.getBoundingClientRect().top;
                        const offset = itemPosition - 60; // ให้มีพื้นที่ด้านบน
                        
                        if (offset < 0) {
                            sidebar.scrollBy({
                                top: offset,
                                behavior: 'smooth'
                            });
                        }
                    }
                } else {
                    submenu.style.maxHeight = '0';
                }
                
                // รีเซ็ตเวลาปิดอัตโนมัติ (ถ้ามี)
                setupSidebarAutoClose();
                
                // บันทึกสถานะเมนู
                saveMenuState();
            });
            
            // Keyboard accessibility for menu items
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
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
                
                // Create ripple effect
                createRippleEffect(this, e);
                
                // Get menu and item name
                const parentMenu = this.closest('.submenu').id.replace('-submenu', '');
                const itemName = this.textContent.trim();
                
                // For mobile, close the sidebar after selection
                if (window.innerWidth <= 768 && sidebar) {
                    // Small delay to show selection before closing
                    setTimeout(() => {
                        closeSidebar();
                    }, 300);
                }
                
                // Load content with transition
                loadContent(parentMenu, itemName);
                
                // Reset auto-close timer
                setupSidebarAutoClose();
            });
            
            // Keyboard accessibility for submenu items
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
        
        // Add logout event listener
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
            
            // Keyboard accessibility
            logoutBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLogout(e);
                }
            });
        }
        
        // Handle window resize for responsive sidebar
        const debounce = (func, delay) => {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        };
        
        window.addEventListener('resize', debounce(function() {
            checkScreenSize();
        }, 250));
        
        // Close sidebar with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
                closeSidebar();
            }
        });
        
        // เรียกใช้ฟังก์ชัน checkScreenSize เมื่อโหลดหน้า
        checkScreenSize();
        
        // ปิด submenu ทั้งหมดเมื่อเริ่มต้น
        closeAllSubmenus();
    }
    
    // Function to close all submenus
    function closeAllSubmenus() {
        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.classList.remove('active');
            submenu.style.maxHeight = '0';
        });
        
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.classList.remove('active');
            menuItem.setAttribute('aria-expanded', 'false');
        });
    }
    
    // Function to save menu state
    function saveMenuState() {
        const activeMenus = [];
        
        document.querySelectorAll('.menu-item.active').forEach(menuItem => {
            activeMenus.push(menuItem.getAttribute('data-menu'));
        });
        
        if (activeMenus.length > 0) {
            localStorage.setItem('activeMenus', JSON.stringify(activeMenus));
        } else {
            localStorage.removeItem('activeMenus');
        }
    }
    
    // Function to check screen size and adjust UI
    function checkScreenSize() {
        const windowWidth = window.innerWidth;
        
        if (windowWidth > 768) {
            if (sidebar) {
                sidebar.style.removeProperty('left');
                sidebar.classList.remove('active');
            }
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            if (sidebar && !sidebar.classList.contains('active')) {
                sidebar.style.left = '-250px';
            }
        }
    }
    
    // Function to show page transition
    function showPageTransition() {
        let transition = document.querySelector('.page-transition');
        
        if (!transition) {
            transition = document.createElement('div');
            transition.className = 'page-transition';
            document.body.appendChild(transition);
        }
        
        // Trigger animation
        setTimeout(() => {
            transition.classList.add('active');
        }, 10);
    }
    
    // Function to load content based on menu selection
    function loadContent(section, page) {
        if (!content) {
            console.error("Content element not found");
            return;
        }
        
        // Prevent multiple simultaneous transitions
        if (isContentTransitioning) return;
        isContentTransitioning = true;
        
        // Log the requested content for debugging
        console.log("Loading content for section:", section, "page:", page);
        
        // Add transition out class
        content.style.opacity = '0';
        content.style.transform = 'translateY(10px)';
        
        // Display loading indicator after short delay
        setTimeout(() => {
            try {
                // Determine which content to load
                if (section === 'master' && page === 'Branch') {
                    content.innerHTML = `
                        <h2>${section.charAt(0).toUpperCase() + section.slice(1)} > ${page}</h2>
                        <div class="content-box">
                            <div class="table-container">
                                <table id="branch-table" class="data-table">
                                    <thead>
                                        <tr>
                                            <th data-sort="id2">ID (2)</th>
                                            <th data-sort="id3">ID (3)</th>
                                            <th data-sort="id4">ID (4)</th>
                                            <th data-sort="branchNameEN">Branch Name (EN)</th>
                                            <th data-sort="branchNameTH">Branch Name (TH)</th>
                                            <th data-sort="serverIPApp">ServerIP (APP)</th>
                                            <th data-sort="serverNameApp">Server Name (APP)</th>
                                            <th data-sort="serverIPDB">ServerIP (DB)</th>
                                            <th data-sort="serverNameDB">Server Name (DB)</th>
                                            <th data-sort="screen">Screen</th>
                                            <th data-sort="kiosk">Kiosk</th>
                                            <th data-sort="seat">Seat</th>
                                            <th data-sort="openDate">Open Date</th>
                                            <th data-sort="status">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- ข้อมูลจะถูกเพิ่มด้วย JavaScript -->
                                        <tr>
                                            <td colspan="14" class="loading">Loading branch data...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="pagination">
                                <button id="prev-page" class="page-btn" disabled>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <span id="page-info">Page 1 of 1</span>
                                <button id="next-page" class="page-btn" disabled>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    // Initialize branch table with animation
                    setTimeout(() => {
                        try {
                            initBranchTable();
                        } catch (err) {
                            console.error("Error initializing branch table:", err);
                            document.querySelector('#branch-table tbody').innerHTML = '<tr><td colspan="14" style="text-align: center; padding: 20px;">An error occurred while loading data. Please try again.</td></tr>';
                        }
                    }, 100);
                } else {
                    // For other pages, show placeholder content
                    content.innerHTML = `
                        <h2>${section.charAt(0).toUpperCase() + section.slice(1)} > ${page}</h2>
                        <div class="content-box">
                            <p>Content for ${page} will be displayed here.</p>
                            <p>This is a placeholder for future functionality.</p>
                        </div>
                    `;
                }
                
                // Fade in content after data is loaded
                setTimeout(() => {
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                    isContentTransitioning = false;
                }, 100);
            } catch (err) {
                console.error("Error loading content:", err);
                content.innerHTML = `
                    <h2>Error</h2>
                    <div class="content-box">
                        <p>An error occurred while loading content. Please try again.</p>
                        <p>Error details: ${err.message}</p>
                    </div>
                `;
                
                // Restore visibility
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
                isContentTransitioning = false;
            }
        }, 200);
    }
    
    // Function to initialize branch table
    function initBranchTable() {
        console.log("Initializing branch table...");
        
        // Branch data - would come from API in real implementation
        const branchData = [
            {id2: "BK", id3: "BKE", id4: "3001", branchNameEN: "Bangkae", branchNameTH: "บางแค", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.32.49", serverNameDB: "bkap-vbrapp02", screen: 10, kiosk: 0, seat: 18806, openDate: "19940616", status: "Active"},
            {id2: "SC", id3: "SCS", id4: "3003", branchNameEN: "Seacon", branchNameTH: "ซีคอน", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.33.52", serverNameDB: "scsp-vbrapp02", screen: 12, kiosk: 0, seat: 20047, openDate: "19940907", status: "Active"},
            {id2: "PK", id3: "PKE", id4: "3008", branchNameEN: "Central Pinklao", branchNameTH: "เซ็นทรัลปิ่นเกล้า", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.32.32", serverNameDB: "pksp-vbrapp02", screen: 12, kiosk: 0, seat: 17925, openDate: "19941001", status: "Active"},
            {id2: "RS", id3: "RSE", id4: "3004", branchNameEN: "Future Rangsit", branchNameTH: "ฟิวเจอร์รังสิต", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.32.71", serverNameDB: "rssp-vbrapp02", screen: 10, kiosk: 0, seat: 15617, openDate: "19950603", status: "Active"},
            {id2: "PN", id3: "PIN", id4: "1003", branchNameEN: "Pinklao", branchNameTH: "ปิ่นเกล้า", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.32.80", serverNameDB: "pinp-vbrapp01", screen: 13, kiosk: 0, seat: 25756, openDate: "19951128", status: "Active"},
            {id2: "SK", id3: "SUK", id4: "1002", branchNameEN: "Sukhumvit", branchNameTH: "สุขุมวิท", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.33.87", serverNameDB: "sukp-vbrapp02", screen: 8, kiosk: 0, seat: 16487, openDate: "19971207", status: "Active"},
            {id2: "RY", id3: "RAT", id4: "1001", branchNameEN: "Ratchayothin", branchNameTH: "รัชโยธิน", serverIPApp: "10.24.32.156", serverNameApp: "ratp-vbrapp02", serverIPDB: "10.24.32.103", serverNameDB: "ratp-vbrdb02", screen: 15, kiosk: 0, seat: 48238, openDate: "19981126", status: "Active"},
            {id2: "KR", id3: "KRT", id4: "3011", branchNameEN: "Korat", branchNameTH: "โคราช", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.33.31", serverNameDB: "krtvb01", screen: 10, kiosk: 0, seat: 13530, openDate: "20000810", status: "Active"},
            {id2: "RT", id3: "RST", id4: "1004", branchNameEN: "Rangsit", branchNameTH: "รังสิต", serverIPApp: "10.24.32.50", serverNameApp: "rstp-vbrapp02", serverIPDB: "10.24.32.9", serverNameDB: "rstp-vbrdb02", screen: 16, kiosk: 0, seat: 30399, openDate: "20020308", status: "Active"},
            {id2: "RA", id3: "RM3", id4: "1005", branchNameEN: "Rama III", branchNameTH: "พระราม 3", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.33.183", serverNameDB: "rm3p-vbrapp02", screen: 9, kiosk: 0, seat: 14389, openDate: "20020501", status: "Active"},
            {id2: "BN", id3: "BNA", id4: "1006", branchNameEN: "Bangna", branchNameTH: "บางนา", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.33.116", serverNameDB: "bnap-vbrapp02", screen: 10, kiosk: 0, seat: 8962, openDate: "20020727", status: "Active"},
            {id2: "SN", id3: "SRG", id4: "1023", branchNameEN: "Samrong", branchNameTH: "สำโรง", serverIPApp: "", serverNameApp: "", serverIPDB: "10.24.33.219", serverNameDB: "srgp-vbrapp02", screen: 8, kiosk: 0, seat: 10709, openDate: "20020914", status: "Active"},
            {id2: "BP", id3: "BKP", id4: "1007", branchNameEN: "Bangkapi", branchNameTH: "บางกะปิ", serverIPApp: "10.24.33.64", serverNameApp: "bkpp-vbrapp02", serverIPDB: "10.24.33.251", serverNameDB: "bkpp-vbrdb02", screen: 10, kiosk: 0, seat: 9465, openDate: "20021002", status: "Active"}
        ];
        
        // Get element references
        const tableBody = document.querySelector('#branch-table tbody');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');
        const tableHeaders = document.querySelectorAll('#branch-table th');
        
        // Check if table elements exist
        if (!tableBody) {
            console.error("Cannot find table body element");
            return;
        }
        
        // Set initial values
        let currentPage = 1;
        const rowsPerPage = 10; // Reduced for better mobile viewing
        let filteredData = [...branchData];
        let sortField = 'id2';
        let sortDirection = 'asc';
        
        // Function to render table data with animation
        function renderTable() {
            console.log("Rendering table with", filteredData.length, "branches");
            
            // Calculate total pages
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            
            // Reset table
            tableBody.innerHTML = '';
            
            // Calculate rows to display
            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
            
            // Sort data
            const sortedData = [...filteredData].sort((a, b) => {
                const valueA = a[sortField];
                const valueB = b[sortField];
                
                // Sort numerically if values are numbers
                if (!isNaN(valueA) && !isNaN(valueB)) {
                    if (sortDirection === 'asc') {
                        return Number(valueA) - Number(valueB);
                    } else {
                        return Number(valueB) - Number(valueA);
                    }
                } else {
                    // Sort alphabetically for text
                    if (sortDirection === 'asc') {
                        return String(valueA).localeCompare(String(valueB));
                    } else {
                        return String(valueB).localeCompare(String(valueA));
                    }
                }
            });
            
            // Display data with staggered animation
            for (let i = startIndex; i < endIndex; i++) {
                const row = sortedData[i];
                const tr = document.createElement('tr');
                
                // Add staggered animation
                tr.style.opacity = '0';
                tr.style.animation = `fadeIn 0.3s ease forwards ${(i - startIndex) * 0.05}s`;
                
                tr.innerHTML = `
                    <td>${row.id2}</td>
                    <td>${row.id3}</td>
                    <td>${row.id4}</td>
                    <td>${row.branchNameEN}</td>
                    <td>${row.branchNameTH}</td>
                    <td>${row.serverIPApp || ''}</td>
                    <td>${row.serverNameApp || ''}</td>
                    <td>${row.serverIPDB || ''}</td>
                    <td>${row.serverNameDB || ''}</td>
                    <td>${row.screen}</td>
                    <td>${row.kiosk}</td>
                    <td>${row.seat}</td>
                    <td>${formatDate(row.openDate)}</td>
                    <td class="status-${row.status.toLowerCase()}">${row.status}</td>
                `;
                
                tableBody.appendChild(tr);
            }
            
            // Update page info
            if (pageInfo) {
                pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
            }
            
            // Update button states
            if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
            if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
            
            // Update sort icons
            if (tableHeaders) {
                tableHeaders.forEach(th => {
                    const field = th.getAttribute('data-sort');
                    th.classList.remove('sort-asc', 'sort-desc');
                    
                    if (field === sortField) {
                        th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
                    }
                });
            }
            
            // Show message if no data found
            if (filteredData.length === 0) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = '<td colspan="14" style="text-align: center; padding: 20px;">No data found</td>';
                tableBody.appendChild(noDataRow);
            }
        }
        
        // Function to format date
        function formatDate(dateStr) {
            if (!dateStr) return '-';
            
            try {
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                const day = dateStr.substring(6, 8);
                
                return `${day}/${month}/${year}`;
            } catch (err) {
                console.error("Error formatting date:", err);
                return dateStr;
            }
        }
        
        // Pagination buttons with visual feedback
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function(e) {
                if (currentPage > 1) {
                    createRippleEffect(this, e);
                    currentPage--;
                    renderTable();
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function(e) {
                const totalPages = Math.ceil(filteredData.length / rowsPerPage);
                if (currentPage < totalPages) {
                    createRippleEffect(this, e);
                    currentPage++;
                    renderTable();
                }
            });
        }
        
        // Column sorting with visual feedback
        if (tableHeaders) {
            tableHeaders.forEach(th => {
                th.addEventListener('click', function(e) {
                    const field = this.getAttribute('data-sort');
                    
                    if (!field) return;
                    
                    // Create ripple effect
                    createRippleEffect(this, e);
                    
                    if (field === sortField) {
                        // Toggle sort direction if same column clicked
                        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        // Change sort column and reset direction
                        sortField = field;
                        sortDirection = 'asc';
                    }
                    
                    renderTable();
                });
            });
        }
        
        // Initialize table display with short delay for animation
        setTimeout(() => {
            renderTable();
        }, 100);
    }
});

// Add transition styles for content
document.head.insertAdjacentHTML('beforeend', `
<style>
    .content {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
</style>
`);

// Add fade effect to page load
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});
