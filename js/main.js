// Setup real-time listeners
function setupRealtimeListeners() {
    if (unsubscribeFunctions.length) {
        unsubscribeFunctions.forEach(unsub => unsub());
        unsubscribeFunctions = [];
    }
    unsubscribeFunctions.push(db.collection('businesses').onSnapshot(() => { loadAllData(); refreshMap(); }, (error) => { console.error("Businesses error:", error); }));
    unsubscribeFunctions.push(db.collection('employees').onSnapshot(() => loadAllData(), (error) => { console.error("Employees error:", error); }));
    unsubscribeFunctions.push(db.collection('reviews').onSnapshot(() => loadAllData(), (error) => { console.error("Reviews error:", error); }));
    unsubscribeFunctions.push(db.collection('meetings').onSnapshot(() => loadAllData(), (error) => { console.error("Meetings error:", error); }));
    unsubscribeFunctions.push(db.collection('news').onSnapshot(() => loadAllData(), (error) => { console.error("News error:", error); }));
    unsubscribeFunctions.push(db.collection('documents').onSnapshot(() => loadAllData(), (error) => { console.error("Documents error:", error); }));
}

// Load all data from Firestore
async function loadAllData() {
    try {
        const businessesSnapshot = await db.collection('businesses').get();
        businessesData = [];
        businessesSnapshot.forEach(doc => {
            const data = doc.data();
            businessesData.push({
                id: doc.id,
                name: data.name,
                address: data.address,
                type: data.type || "Остальное",
                imgIcon: data.imgIcon,
                imgUrl: data.imgUrl,
                price: data.price,
                status: data.status,
                mapX: data.mapX,
                mapY: data.mapY
            });
        });
        
        const employeesSnapshot = await db.collection('employees').get();
        employees = [];
        employeesSnapshot.forEach(doc => {
            const data = doc.data();
            employees.push({
                id: doc.id,
                name: data.name,
                position: data.position,
                photoUrl: data.photoUrl,
                icon: data.icon
            });
        });
        
        const reviewsSnapshot = await db.collection('reviews').get();
        reviews = [];
        reviewsSnapshot.forEach(doc => {
            const data = doc.data();
            reviews.push({
                id: doc.id,
                name: data.name,
                text: data.text,
                date: data.date
            });
        });
        
        const meetingsSnapshot = await db.collection('meetings').get();
        meetings = [];
        meetingsSnapshot.forEach(doc => {
            const data = doc.data();
            meetings.push({
                id: doc.id,
                name: data.name,
                phone: data.phone,
                cardId: data.cardId,
                topic: data.topic,
                customTopic: data.customTopic,
                status: data.status,
                date: data.date
            });
        });
        
        const newsSnapshot = await db.collection('news').get();
        news = [];
        newsSnapshot.forEach(doc => {
            const data = doc.data();
            news.push({
                id: doc.id,
                title: data.title,
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                date: data.date
            });
        });
        
        const docsSnapshot = await db.collection('documents').get();
        documents = [];
        docsSnapshot.forEach(doc => {
            const data = doc.data();
            documents.push({
                id: doc.id,
                title: data.title,
                text: data.text,
                imageUrl: data.imageUrl,
                date: data.date
            });
        });
        renderAll();
        refreshMap();
    } catch (error) {
        console.error("Error loading data:", error);
        showToast("Ошибка загрузки данных. Проверьте подключение к Firebase.");
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing...");
    
    // Проверяем что Firebase и db доступны
    if (typeof db === 'undefined') {
        console.error("Firebase not initialized!");
        showToast("Ошибка: Firebase не инициализирован");
        return;
    }
    
    setupRealtimeListeners();
    loadAllData();
    setupForms();
    initNavigation();
    initInfoModal();
    initPriceModal();
    initChangeImageModal();
    initChangeEmployeePhotoModal();
    initAddBusinessModal();
    initMeetingForm();
    initEnterLogin();
    initFilters();
    initTheme();
    loadAdminStatus();
    
    // Инициализируем карту после небольшой задержки
    setTimeout(() => {
        initMap();
        setupPickLocationButton();
    }, 100);
    
    // Login modal handlers
    const loginBtn = document.getElementById("loginModalBtn");
    if (loginBtn) loginBtn.addEventListener("click", showLoginModal);
    
    const confirmBtn = document.getElementById("confirmLogin");
    if (confirmBtn) confirmBtn.addEventListener("click", checkAdminLogin);
    
    const closeModalBtn = document.getElementById("closeModal");
    if (closeModalBtn) closeModalBtn.addEventListener("click", hideLoginModal);
    
    window.addEventListener("click", (e) => { 
        const loginModal = document.getElementById("loginModal");
        if(e.target === loginModal) hideLoginModal(); 
    });
    
    console.log("Initialization complete");
});