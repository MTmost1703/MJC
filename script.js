document.addEventListener('DOMContentLoaded', function() {
    // Elements - global references
    const burgerMenu = document.getElementById('burger-menu');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    
    // สร้าง overlay element สำหรับปิด sidebar เมื่อคลิกที่พื้นที่ว่าง
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
    
    // ตัวแปรสำหรับเก็บ timeout ของการปิด sidebar อัตโนมัติ
    let sidebarTimeout;
    
    // Check login status - ตรวจสอบสถานะล็อกอินก่อนแสดงแดชบอร์ด
    checkLoginStatus();
    
    // Initialize dashboard functionality
    initializeDashboard();
    
    // ======== LOGIN STATE MANAGEMENT ========
    // Function to check login status
    function checkLoginStatus() {
        const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
        const storedUsername = sessionStorage.getItem('username');
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        
        console.log("Checking login status:", isLoggedIn ? "Logged in" : "Not logged in");
        
        if (!isLoggedIn) {
            // Redirect to login page if not logged in
            window.location.href = 'login.html';
            return;
        }
        
        // Update username display
        if (usernameDisplay && storedUsername) {
            usernameDisplay.textContent = storedUsername.toUpperCase();
            usernameDisplay.title = storedUsername; // เพิ่ม title attribute เพื่อแสดงชื่อเต็มเมื่อ hover
        }
        
        // ไม่เปิด submenu ใดๆ โดยอัตโนมัติ เพื่อให้ผู้ใช้ต้องคลิกที่เมนูหลักก่อน
        
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
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
    
    // Function to close sidebar completely
    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove('active');
            sidebar.style.left = '-250px';
            sidebarOverlay.classList.remove('active');
        }
        
        if (burgerMenu) {
            burgerMenu.classList.remove('active');
        }
        
        // ยกเลิก timeout การปิดอัตโนมัติ
        clearTimeout(sidebarTimeout);
    }
    
    // Function to toggle sidebar
    function toggleSidebar(e) {
        if (e && e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
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
                sidebarOverlay.classList.add('active');
                
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
                    closeSidebar();
                }
            }, 60000); // 60 วินาที
        }
    }
    
    // Function to save menu state
    function saveMenuState() {
        // เก็บข้อมูลเมนูที่เปิดอยู่
        const activeMenus = [];
        
        document.querySelectorAll('.menu-item.active').forEach(menuItem => {
            activeMenus.push(menuItem.getAttribute('data-menu'));
        });
        
        // เก็บลงใน localStorage
        if (activeMenus.length > 0) {
            localStorage.setItem('activeMenus', JSON.stringify(activeMenus));
        }
    }
    
    // ฟังก์ชันนี้ถูกปรับเพื่อไม่โหลดสถานะเมนูเดิมเมื่อเริ่มต้น - ต้องการให้เริ่มต้นทุกครั้งโดยไม่เปิด submenu
    function loadMenuState() {
        // ฟังก์ชั่นนี้ถูกปรับให้ไม่ทำงานเพื่อไม่ให้โหลดสถานะเมนูเดิม
        return;
    }
    
    // ======== DASHBOARD INITIALIZATION ========
    // Function to initialize dashboard functionality
    function initializeDashboard() {
        // Toggle sidebar with burger menu - แก้ไขส่วนนี้
        if (burgerMenu && sidebar) {
            // ลบ event listener เดิมที่อาจมีปัญหา
            burgerMenu.removeEventListener('click', toggleSidebar);
            
            // เพิ่ม event listener ใหม่เพื่อความมั่นใจ
            ['click', 'touchstart'].forEach(eventType => {
                burgerMenu.addEventListener(eventType, function(e) {
                    // ป้องกันการทำงานซ้ำซ้อนและตรวจสอบว่า event สามารถยกเลิกได้หรือไม่
                    if (eventType === 'touchstart' && e.cancelable) {
                        e.preventDefault();
                    }
                    
                    toggleSidebar(e);
                }, { passive: false });
            });
        }
        
        // เพิ่ม event listener เพื่อปิด sidebar เมื่อคลิกที่ overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function(e) {
                if (e.cancelable) {
                    e.preventDefault();
                }
                
                if (sidebar && sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
            }, { passive: false });
        }
        
        // ปิด sidebar เมื่อคลิกที่พื้นที่ว่างนอก sidebar
        document.addEventListener('click', function(e) {
            // ตรวจสอบว่าคลิกที่พื้นที่นอก sidebar และ sidebar กำลังแสดงอยู่
            if (sidebar && burgerMenu && 
                !sidebar.contains(e.target) && 
                !burgerMenu.contains(e.target) && 
                sidebar.classList.contains('active') &&
                window.innerWidth <= 768) {
                
                toggleSidebar();
            }
        });
        
        // เพิ่ม event listener สำหรับการรีเซ็ตเวลาปิดอัตโนมัติเมื่อมีการใช้งาน
        document.addEventListener('mousemove', setupSidebarAutoClose);
        document.addEventListener('touchstart', setupSidebarAutoClose);
        document.addEventListener('click', setupSidebarAutoClose);
        
        // Toggle submenu on menu item click
        document.querySelectorAll('.menu-item').forEach(item => {
            // เพิ่ม event listener ทั้ง click และ touchstart
            ['click', 'touchstart'].forEach(eventType => {
                item.addEventListener(eventType, function(e) {
                    if (eventType === 'touchstart' && e.cancelable) {
                        e.preventDefault(); // ป้องกันการทำงานซ้ำซ้อนเฉพาะสำหรับ touchstart ที่ยกเลิกได้
                    }
                    
                    const menuName = this.getAttribute('data-menu');
                    const submenu = document.getElementById(`${menuName}-submenu`);
                    
                    if (!submenu) {
                        console.error(`Submenu element not found: ${menuName}-submenu`);
                        return;
                    }
                    
                    // ตรวจสอบว่า submenu นี้กำลังแสดงอยู่หรือไม่
                    const isActive = submenu.classList.contains('active');
                    
                    // ปิดทุก submenu และลบคลาส active จากทุกเมนู (ยกเว้นเมนูปัจจุบัน)
                    document.querySelectorAll('.submenu').forEach(menu => {
                        if (menu.id !== `${menuName}-submenu`) {
                            menu.classList.remove('active');
                            menu.style.maxHeight = '0';
                        }
                    });
                    
                    document.querySelectorAll('.menu-item').forEach(menuItem => {
                        if (menuItem !== this) {
                            menuItem.classList.remove('active');
                        }
                    });
                    
                    // สลับ active state ของ submenu ปัจจุบัน (เปิด/ปิด)
                    if (submenu) {
                        // รีเซ็ตสไตล์เพื่อรับรองว่า CSS ทำงานถูกต้อง
                        submenu.style.width = '100%';
                        submenu.style.position = 'relative';
                        submenu.style.left = '0';
                        submenu.style.right = '0';
                        
                        submenu.classList.toggle('active');
                        this.classList.toggle('active');
                        
                        if (submenu.classList.contains('active')) {
                            submenu.style.maxHeight = '2000px';
                        } else {
                            submenu.style.maxHeight = '0';
                        }
                        
                        // บันทึกสถานะเมนู
                        saveMenuState();
                        
                        // เพื่อตรวจสอบว่า submenu แสดงผลอย่างถูกต้อง
                        console.log(`Toggle menu: ${menuName}, active: ${submenu.classList.contains('active')}`);
                    }
                    
                    // ป้องกันการทำงานซ้ำซ้อนหลังจากเสร็จสิ้นการทำงาน
                    if (eventType === 'touchstart' && e.cancelable) {
                        e.stopPropagation(); 
                    }
                }, { passive: false });
            });
        });
        
        // Handle submenu item click
        document.querySelectorAll('.submenu-item').forEach(item => {
            // เพิ่ม event listener ทั้ง click และ touchstart
            ['click', 'touchstart'].forEach(eventType => {
                item.addEventListener(eventType, function(e) {
                    if (eventType === 'touchstart' && e.cancelable) {
                        e.preventDefault(); // ป้องกันการทำงานซ้ำซ้อนเฉพาะสำหรับ touchstart ที่ยกเลิกได้
                    }
                    
                    if (e.cancelable) {
                        e.stopPropagation(); // Prevent event bubbling to parent menu item
                    }
                    
                    // Highlight selected submenu item
                    document.querySelectorAll('.submenu-item').forEach(subItem => {
                        subItem.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    const parentMenu = this.closest('.submenu').id.replace('-submenu', '');
                    const itemName = this.textContent.trim();
                    
                    // For mobile, close the sidebar after selection
                    if (window.innerWidth <= 768 && sidebar) {
                        toggleSidebar(); // ใช้ฟังก์ชัน toggleSidebar แทนการเรียกใช้โค้ดซ้ำ
                    }
                    
                    // Load content
                    loadContent(parentMenu, itemName);
                    
                    // ป้องกันการทำงานซ้ำซ้อนหลังจากเสร็จสิ้นการทำงาน
                    if (eventType === 'touchstart' && e.cancelable) {
                        return false;
                    }
                }, { passive: false });
            });
        });
        
        // Add logout event listener
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
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
            checkScreenSize(); // เรียกใช้ฟังก์ชัน checkScreenSize เมื่อมีการปรับขนาดหน้าจอ
        }, 250)); // debounce 250ms
        
        // เรียกใช้ฟังก์ชัน checkScreenSize เมื่อโหลดหน้า
        checkScreenSize();
        
        // ปิดใช้งานการโหลดสถานะเมนูที่เคยบันทึกไว้เพื่อให้เริ่มต้นใหม่ทุกครั้ง
        // loadMenuState();
        
        // เรียกใช้ฟังก์ชันเพื่อปิด submenu ทั้งหมดเมื่อเริ่มต้น
        closeAllSubmenus();
    }
    
    // เพิ่มฟังก์ชันใหม่เพื่อปิด submenu ทั้งหมดเมื่อเริ่มต้น
    function closeAllSubmenus() {
        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.classList.remove('active');
            submenu.style.maxHeight = '0';
        });
        
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.classList.remove('active');
        });
    }
    
    // ฟังก์ชันเพื่อตรวจสอบขนาดหน้าจอและปรับแต่ง UI ตามขนาด
    function checkScreenSize() {
        const windowWidth = window.innerWidth;
        
        if (windowWidth > 768) {
            if (burgerMenu) burgerMenu.style.display = 'none';
            if (sidebar) {
                sidebar.style.removeProperty('left');
                sidebar.classList.remove('active');
            }
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        } else {
            if (burgerMenu) burgerMenu.style.display = 'block';
            if (sidebar && !sidebar.classList.contains('active')) {
                sidebar.style.left = '-250px';
            }
        }
    }
    
    // ======== CONTENT LOADING ========
    // Function to load content based on menu selection
    function loadContent(section, page) {
        if (!content) {
            console.error("Content element not found");
            return;
        }
        
        // Log the requested content for debugging
        console.log("Loading content for section:", section, "page:", page);
        
        // Display loading indicator
        content.innerHTML = '<div class="loading">Loading content...</div>';
        
        // Short delay to show loading indicator
        setTimeout(() => {
            try {
                // Check if it's the Branch page
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
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="pagination">
                                <button id="prev-page" class="page-btn" disabled>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <span id="page-info">หน้า 1 จาก 1</span>
                                <button id="next-page" class="page-btn" disabled>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    // Initialize branch table
                    setTimeout(() => {
                        try {
                            initBranchTable();
                        } catch (err) {
                            console.error("Error initializing branch table:", err);
                            document.querySelector('#branch-table tbody').innerHTML = '<tr><td colspan="14" style="text-align: center; padding: 20px;">เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง</td></tr>';
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
            } catch (err) {
                console.error("Error loading content:", err);
                content.innerHTML = `
                    <h2>Error</h2>
                    <div class="content-box">
                        <p>เกิดข้อผิดพลาดในการโหลดเนื้อหา กรุณาลองใหม่อีกครั้ง</p>
                        <p>รายละเอียดข้อผิดพลาด: ${err.message}</p>
                    </div>
                `;
            }
        }, 300); // เพิ่มเวลาดีเลย์เพื่อให้เห็นการโหลดชัดเจนขึ้น
    }
    
    // ======== BRANCH DATA MANAGEMENT ========
    // Function to initialize branch table
    function initBranchTable() {
        console.log("Initializing branch table...");
        
        // Branch data
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
        const rowsPerPage = 15;
        let filteredData = [...branchData];
        let sortField = 'id2';
        let sortDirection = 'asc';
        
        // Function to render table data
        function renderTable() {
            console.log("Rendering table with", filteredData.length, "branches");
            
            // Calculate total pages
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            
            // Reset table and add new data
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
            
            // Display data
            for (let i = startIndex; i < endIndex; i++) {
                const row = sortedData[i];
                const tr = document.createElement('tr');
                
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
                pageInfo.textContent = `หน้า ${currentPage} จาก ${totalPages || 1}`;
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
                noDataRow.innerHTML = '<td colspan="14" style="text-align: center; padding: 20px;">ไม่พบข้อมูล</td>';
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
        
        // Pagination buttons
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                }
            });
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredData.length / rowsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                }
            });
        }
        
        // Column sorting
        if (tableHeaders) {
            tableHeaders.forEach(th => {
                th.addEventListener('click', () => {
                    const field = th.getAttribute('data-sort');
                    
                    if (!field) return;
                    
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
        
        // Initialize table display
        renderTable();
    }

    // Fix the submenu display issue - added function to ensure submenus display correctly
    function fixSubmenuDisplay() {
        // Get all submenu elements
        const allSubmenus = document.querySelectorAll('.submenu');
        
        // Apply correct styles to ensure proper display
        allSubmenus.forEach(submenu => {
            // Ensure correct width and positioning
            submenu.style.width = '100%';
            submenu.style.position = 'relative';
            submenu.style.left = '0';
            submenu.style.right = '0';
            
            // Make sure all submenus are closed on start
            submenu.classList.remove('active');
            submenu.style.maxHeight = '0';
        });
    }
    
    // Call the fix function after a short delay to ensure DOM is fully loaded
    setTimeout(fixSubmenuDisplay, 300);
});
