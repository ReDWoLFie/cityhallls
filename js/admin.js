function setAdminMode(admin) {
    isAdmin = admin;
    saveAdminStatus(admin);
    const body = document.body;
    const adminBlock = document.getElementById("adminMeetingsBlock");
    const adminNewsBlock = document.getElementById("adminNewsBlock");
    const adminDocumentsBlock = document.getElementById("adminDocumentsBlock");
    const adminEmployeesBlock = document.getElementById("adminEmployeesBlock");
    
    if(isAdmin) {
        body.classList.add('admin-mode');
        const authArea = document.getElementById("authArea");
        authArea.innerHTML = `<div class="admin-panel"><span class="admin-badge">👑 АДМИН</span><button id="logoutBtn" class="admin-btn logout-btn">Выйти</button></div>`;
        document.getElementById("logoutBtn")?.addEventListener("click", () => setAdminMode(false));
        renderAll();
        if(adminBlock) adminBlock.style.display = "block";
        if(adminNewsBlock) adminNewsBlock.style.display = "block";
        if(adminDocumentsBlock) adminDocumentsBlock.style.display = "block";
        if(adminEmployeesBlock) adminEmployeesBlock.style.display = "block";
        setActiveSection("meeting");
        setupMapClicks();
        refreshMap();
    } else {
        body.classList.remove('admin-mode');
        const authArea = document.getElementById("authArea");
        authArea.innerHTML = `<button id="loginModalBtn" class="nav-btn login-btn">🔐 Вход для админа</button>`;
        document.getElementById("loginModalBtn")?.addEventListener("click", showLoginModal);
        if(adminBlock) adminBlock.style.display = "none";
        if(adminNewsBlock) adminNewsBlock.style.display = "none";
        if(adminDocumentsBlock) adminDocumentsBlock.style.display = "none";
        if(adminEmployeesBlock) adminEmployeesBlock.style.display = "none";
        renderAll();
    }
    updateMapMarkers();
}

function saveAdminStatus(admin) { 
    sessionStorage.setItem("adminMode", admin ? "true" : "false"); 
}

function loadAdminStatus() { 
    const saved = sessionStorage.getItem("adminMode"); 
    if (saved === "true") { setAdminMode(true); } 
}

function showLoginModal() { 
    document.getElementById("loginModal").style.display = "flex"; 
}

function hideLoginModal() { 
    document.getElementById("loginModal").style.display = "none"; 
    document.getElementById("adminPassword").value = ""; 
}

async function checkAdminLogin() { 
    const pass = document.getElementById("adminPassword").value; 
    const hashedPass = await hashPassword(pass);
    if (hashedPass === ADMIN_PASSWORD_HASH) { 
        setAdminMode(true); 
        hideLoginModal(); 
    } else { 
        alert("Неверный пароль!"); 
    } 
}

function initEnterLogin() {
    const passwordInput = document.getElementById("adminPassword");
    if(passwordInput) { 
        passwordInput.addEventListener("keypress", (e) => { 
            if(e.key === "Enter") checkAdminLogin(); 
        }); 
    }
}