// Helper functions
function escapeHtml(str) { 
    if(!str) return ""; 
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); 
}

function extractYouTubeId(url) { 
    if(!url) return null; 
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/; 
    const match = url.match(regExp); 
    return match ? match[1] : null; 
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2000);
}

function getStatusUI(status) {
    if(status === "free") return { class: "status-free", text: "🟢 СВОБОДЕН" };
    if(status === "occupied") return { class: "status-occupied", text: "🔴 ЗАНЯТ" };
    return { class: "status-pending", text: "🟡 В ОБРАБОТКЕ" };
}

function getTypeDisplay(type) {
    if(type === "СТО") return "🔧 СТО";
    if(type === "Клуб") return "🎧 Клуб";
    if(type === "Ресторан/Кафе") return "🍽️ Ресторан/Кафе";
    return "🏪 Остальное";
}

function getMeetingStatusUI(status) {
    if(status === "inwork") return { class: "status-inwork", text: "🟢 В работе" };
    if(status === "accepted") return { class: "status-accepted", text: "🟡 Принято" };
    if(status === "finished") return { class: "status-finished", text: "🔵 Закончена" };
    return { class: "status-inwork", text: "🟢 В работе" };
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function updateStats() { 
    document.getElementById("reviewCount").innerText = reviews.length; 
    updateBusinessStats(); 
}

function updateBusinessStats() { 
    const total = businessesData.length; 
    const freeCount = businessesData.filter(b => b.status === "free").length; 
    document.getElementById("totalBusiness").innerText = total; 
    document.getElementById("freeBusinessCount").innerText = freeCount; 
}