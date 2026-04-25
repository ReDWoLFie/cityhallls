function renderAll() {
    renderBusiness();
    renderReviews();
    renderNews();
    renderMeetings();
    renderDocuments();
    renderEmployees();
    updateStats();
}

function renderBusiness() {
    const grid = document.getElementById("businessGrid");
    if(!grid) return;
    
    let filteredBusinesses = businessesData;
    if (currentStatusFilter !== "all") filteredBusinesses = filteredBusinesses.filter(b => b.status === currentStatusFilter);
    if (currentTypeFilter !== "all") filteredBusinesses = filteredBusinesses.filter(b => b.type === currentTypeFilter);
    
    grid.innerHTML = filteredBusinesses.map(biz => {
        const statusUI = getStatusUI(biz.status);
        const typeDisplay = getTypeDisplay(biz.type);
        const imgHtml = biz.imgUrl ? `<img src="${biz.imgUrl}" alt="${biz.name}">` : `<div style="font-size: 3.5rem;">${biz.imgIcon || '🏢'}</div>`;
        return `<div class="business-card" data-id="${biz.id}">${isAdmin ? `<button class="delete-business-btn admin-only" data-id="${biz.id}" title="Удалить бизнес">✕</button>` : ''}<div class="business-img">${imgHtml}${isAdmin ? `<button class="change-image-btn admin-only" data-id="${biz.id}" title="Сменить картинку">🖼️ Сменить</button>` : ''}</div><div class="business-info"><h3>${escapeHtml(biz.name)}</h3><div class="business-address">📍 ${escapeHtml(biz.address)}</div><div class="business-type">${typeDisplay}</div><div class="rent-badge ${isAdmin ? 'editable-price' : ''}" data-id="${biz.id}">💰 Аренда: ${biz.price}</div><div class="status-badge ${statusUI.class}">${statusUI.text}</div>${isAdmin ? `<select class="status-select admin-only" data-id="${biz.id}"><option value="free" ${biz.status === "free" ? "selected" : ""}>🟢 Свободен для аренды</option><option value="occupied" ${biz.status === "occupied" ? "selected" : ""}>🔴 Занят</option><option value="pending" ${biz.status === "pending" ? "selected" : ""}>🟡 В обработке</option></select><div class="admin-only" style="margin-top: 0.5rem; font-size: 0.7rem; color: #718096;">${biz.mapX && biz.mapY ? `📍 Карта: ${biz.mapX.toFixed(1)}%, ${biz.mapY.toFixed(1)}%` : '📍 Координаты не заданы'}</div>` : ''}</div></div>`;
    }).join('');
    
    if(isAdmin) {
        document.querySelectorAll('.status-select').forEach(select => select.addEventListener('change', async (e) => { const bizId = select.dataset.id; const newStatus = select.value; await db.collection('businesses').doc(bizId).update({ status: newStatus }); loadAllData(); }));
        document.querySelectorAll('.editable-price').forEach(priceEl => priceEl.addEventListener('click', (e) => { currentBizId = priceEl.dataset.id; document.getElementById("priceInput").value = businessesData.find(b => b.id == currentBizId).price; document.getElementById("priceModal").style.display = "flex"; }));
        document.querySelectorAll('.change-image-btn').forEach(btn => btn.addEventListener('click', (e) => { 
            pendingImageBizId = btn.dataset.id;
            document.getElementById("imageUrlInput").value = "";
            document.getElementById("changeImageModal").style.display = "flex";
        }));
        document.querySelectorAll('.delete-business-btn').forEach(btn => btn.addEventListener('click', async (e) => { e.stopPropagation(); const bizId = btn.dataset.id; if(confirm("Удалить этот бизнес?")) { await db.collection('businesses').doc(bizId).delete(); loadAllData(); } }));
    }
}

function renderReviews() {
    const container = document.getElementById("reviewsContainer");
    if(!container) return;
    if(reviews.length === 0) { container.innerHTML = "<div class='review-item'>Пока нет отзывов. Будьте первым!</div>"; return; }
    container.innerHTML = reviews.map(r => `<div class="review-item"><div class="review-content"><div class="review-name">${escapeHtml(r.name)}</div><div class="review-date">${r.date}</div><p>${escapeHtml(r.text)}</p></div>${isAdmin ? `<button class="delete-review" data-id="${r.id}">🗑️ Удалить</button>` : ''}</div>`).join('');
    if(isAdmin) document.querySelectorAll('.delete-review').forEach(btn => btn.addEventListener('click', async (e) => { const id = btn.dataset.id; await db.collection('reviews').doc(id).delete(); loadAllData(); }));
}

function renderNews() {
    const container = document.getElementById("newsContainer");
    if(!container) return;
    if(news.length === 0) { container.innerHTML = "<div class='news-item'>Пока нет новостей. Следите за обновлениями!</div>"; return; }
    container.innerHTML = [...news].reverse().map(n => { 
        let videoHtml = ''; 
        if(n.videoUrl) { 
            const videoId = extractYouTubeId(n.videoUrl); 
            if(videoId) videoHtml = `<div class="news-video"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`; 
        } 
        return `<div class="news-item"><div class="news-date">📅 ${n.date}</div><div class="news-title">${escapeHtml(n.title)}</div>${n.imageUrl ? `<img src="${n.imageUrl}" class="news-image" alt="news image" loading="lazy">` : ''}${videoHtml}<div class="news-text">${escapeHtml(n.text)}</div>${isAdmin ? `<button class="delete-news" data-id="${n.id}">🗑️ Удалить новость</button>` : ''}</div>`; 
    }).join('');
    if(isAdmin) document.querySelectorAll('.delete-news').forEach(btn => btn.addEventListener('click', async (e) => { const id = btn.dataset.id; await db.collection('news').doc(id).delete(); loadAllData(); }));
}

function renderMeetings() {
    const container = document.getElementById("meetingsList");
    if(!container) return;
    if(meetings.length === 0) { container.innerHTML = "<div class='meeting-item'>Нет запланированных встреч.</div>"; return; }
    container.innerHTML = meetings.map(m => { 
        const statusUI = getMeetingStatusUI(m.status); 
        return `<div class="meeting-item"><div class="meeting-header"><div class="review-name">${escapeHtml(m.name)}</div><div class="meeting-status ${statusUI.class}">${statusUI.text}</div></div><div>📞 ${m.phone || '—'}</div><div>🪪 ID карта: ${m.cardId || '—'}</div><div>📌 ${escapeHtml(m.topic)}${m.customTopic ? `: ${escapeHtml(m.customTopic)}` : ''}</div><div class="review-date">📅 ${m.date}</div>${isAdmin ? `<div class="meeting-actions"><button class="status-btn" data-id="${m.id}" data-status="inwork">🟢 В работе</button><button class="status-btn" data-id="${m.id}" data-status="accepted">🟡 Принято</button><button class="status-btn" data-id="${m.id}" data-status="finished">🔵 Закончена</button>${m.status === "finished" ? `<button class="delete-finished-btn" data-id="${m.id}">🗑️ Удалить</button>` : ''}</div>` : ''}</div>`; 
    }).join('');
    if(isAdmin) {
        document.querySelectorAll('.status-btn').forEach(btn => btn.addEventListener('click', async (e) => { const id = btn.dataset.id; const newStatus = btn.dataset.status; await db.collection('meetings').doc(id).update({ status: newStatus }); loadAllData(); }));
        document.querySelectorAll('.delete-finished-btn').forEach(btn => btn.addEventListener('click', async (e) => { const id = btn.dataset.id; await db.collection('meetings').doc(id).delete(); loadAllData(); }));
    }
}

function renderDocuments() {
    const container = document.getElementById("documentsContainer");
    if(!container) return;
    if(documents.length === 0) { container.innerHTML = "<div class='doc-item'>Пока нет документов.</div>"; return; }
    container.innerHTML = [...documents].reverse().map(d => `<div class="doc-item"><div class="doc-date">📅 ${d.date}</div><div class="doc-title">${escapeHtml(d.title)}</div>${d.imageUrl ? `<img src="${d.imageUrl}" class="doc-image" alt="doc image" loading="lazy">` : ''}<div class="doc-text">${escapeHtml(d.text)}</div>${isAdmin ? `<button class="delete-doc" data-id="${d.id}">🗑️ Удалить документ</button>` : ''}</div>`).join('');
    if(isAdmin) document.querySelectorAll('.delete-doc').forEach(btn => btn.addEventListener('click', async (e) => { const id = btn.dataset.id; await db.collection('documents').doc(id).delete(); loadAllData(); }));
}

function renderEmployees() {
    const container = document.getElementById("employeesContainer");
    if(!container) return;
    if(employees.length === 0) { container.innerHTML = "<div class='employee-card'>Сотрудников пока нет.</div>"; return; }
    container.innerHTML = employees.map(emp => `<div class="employee-card"><div class="employee-photo">${emp.photoUrl ? `<img src="${emp.photoUrl}" alt="${emp.name}">` : `<div class="default-icon">${emp.icon || '👤'}</div>`}${isAdmin ? `<button class="change-employee-photo admin-only" data-id="${emp.id}">🖼️ Сменить фото</button>` : ''}</div><div class="employee-name">${escapeHtml(emp.name)}</div><div class="employee-position">${escapeHtml(emp.position)}</div>${isAdmin ? `<button class="delete-employee admin-only" data-id="${emp.id}">🗑️ Удалить</button>` : ''}</div>`).join('');
    if(isAdmin) {
        document.querySelectorAll('.delete-employee').forEach(btn => btn.addEventListener('click', async (e) => { const id = btn.dataset.id; await db.collection('employees').doc(id).delete(); loadAllData(); }));
        document.querySelectorAll('.change-employee-photo').forEach(btn => btn.addEventListener('click', (e) => { 
            pendingEmployeeId = btn.dataset.id;
            document.getElementById("employeePhotoUrlInput").value = "";
            document.getElementById("changeEmployeePhotoModal").style.display = "flex";
        }));
    }
}

function initFilters() {
    document.querySelectorAll('.status-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.status-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatusFilter = btn.dataset.status;
            renderBusiness();
        });
    });
    document.querySelectorAll('.type-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTypeFilter = btn.dataset.type;
            renderBusiness();
        });
    });
}