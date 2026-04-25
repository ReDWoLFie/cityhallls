function showBusinessInfoModal(business) {
    currentBusinessForDelete = business;
    const modal = document.getElementById('businessInfoModal');
    const imgContainer = document.getElementById('businessInfoImg');
    const nameEl = document.getElementById('businessInfoName');
    const addressEl = document.getElementById('businessInfoAddress');
    const typeEl = document.getElementById('businessInfoType');
    const priceEl = document.getElementById('businessInfoPrice');
    const statusEl = document.getElementById('businessInfoStatus');
    
    const typeDisplay = getTypeDisplay(business.type);
    const statusUI = getStatusUI(business.status);
    
    imgContainer.innerHTML = business.imgUrl ? `<img src="${business.imgUrl}" alt="${business.name}">` : `<div style="font-size: 4rem;">${business.imgIcon || '🏢'}</div>`;
    nameEl.textContent = business.name;
    addressEl.textContent = business.address;
    typeEl.textContent = typeDisplay;
    priceEl.textContent = `💰 Аренда: ${business.price}`;
    statusEl.textContent = statusUI.text;
    statusEl.className = `business-info-status ${statusUI.class}`;
    
    modal.style.display = 'flex';
    
    document.getElementById('closeInfoModalBtn').onclick = () => {
        modal.style.display = 'none';
        currentBusinessForDelete = null;
    };
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            currentBusinessForDelete = null;
        }
    };
    
    const deleteBtn = document.getElementById('deleteMarkerBtn');
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (confirm(`Удалить маркер у бизнеса "${business.name}"?`)) {
                await db.collection('businesses').doc(business.id).update({
                    mapX: null,
                    mapY: null
                });
                modal.style.display = 'none';
                currentBusinessForDelete = null;
                showToast(`🗑️ Маркер бизнеса "${business.name}" удалён с карты`);
                loadAllData();
            }
        };
    }
}

function showBusinessSelectModal(coords) {
    if (!isAdmin) return;
    pendingCoords = coords;
    const modal = document.getElementById('businessSelectModal');
    const listContainer = document.getElementById('businessSelectList');
    
    listContainer.innerHTML = '';
    businessesData.forEach(business => {
        const item = document.createElement('div');
        item.className = 'business-select-item';
        item.innerHTML = `<strong>${escapeHtml(business.name)}</strong><small>${escapeHtml(business.address)} | ${getTypeDisplay(business.type)}</small>`;
        item.addEventListener('click', async () => {
            await db.collection('businesses').doc(business.id).update({
                mapX: pendingCoords.x,
                mapY: pendingCoords.y
            });
            modal.style.display = 'none';
            pickLocationMode = false;
            const btn = document.getElementById('pickLocationBtn');
            if (btn) btn.classList.remove('active');
            showToast(`✅ Бизнес "${business.name}" привязан к выбранному месту на карте!`);
            loadAllData();
        });
        listContainer.appendChild(item);
    });
    
    if (businessesData.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Нет бизнесов для привязки. Сначала создайте бизнес.</div>';
    }
    
    modal.style.display = 'flex';
}

function initInfoModal() {
    const modal = document.getElementById("infoModal");
    const modalBody = document.getElementById("infoModalBody");
    const closeBtn = modal.querySelector(".close-info-modal");
    
    document.querySelectorAll('.info-link').forEach(link => link.addEventListener("click", () => {
        const infoKey = link.dataset.info;
        if(infoKey && INFO_TEXTS[infoKey]) {
            modalBody.innerHTML = INFO_TEXTS[infoKey];
            modal.style.display = "flex";
        }
    }));
    
    closeBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", (e) => {
        if(e.target === modal) modal.style.display = "none";
    });
    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape" && modal.style.display === "flex") modal.style.display = "none";
    });
}

function initPriceModal() {
    const modal = document.getElementById("priceModal");
    const saveBtn = document.getElementById("priceModalSave");
    const cancelBtn = document.getElementById("priceModalCancel");
    
    saveBtn.addEventListener("click", async () => {
        const newPrice = document.getElementById("priceInput").value.trim();
        if(newPrice) {
            await db.collection('businesses').doc(currentBizId).update({ price: newPrice });
            loadAllData();
        }
        modal.style.display = "none";
    });
    cancelBtn.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => {
        if(e.target === modal) modal.style.display = "none";
    });
}

function initChangeImageModal() {
    const modal = document.getElementById("changeImageModal");
    const saveBtn = document.getElementById("changeImageSave");
    const cancelBtn = document.getElementById("changeImageCancel");
    
    saveBtn.addEventListener("click", async () => {
        const url = document.getElementById("imageUrlInput").value.trim();
        if (url) {
            await db.collection('businesses').doc(pendingImageBizId).update({ imgUrl: url, imgIcon: null });
            loadAllData();
            modal.style.display = "none";
        }
    });
    cancelBtn.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => {
        if(e.target === modal) modal.style.display = "none";
    });
}

function initChangeEmployeePhotoModal() {
    const modal = document.getElementById("changeEmployeePhotoModal");
    const saveBtn = document.getElementById("employeePhotoSave");
    const cancelBtn = document.getElementById("employeePhotoCancel");
    
    saveBtn.addEventListener("click", async () => {
        const url = document.getElementById("employeePhotoUrlInput").value.trim();
        if (url) {
            await db.collection('employees').doc(pendingEmployeeId).update({ photoUrl: url, icon: null });
            loadAllData();
            modal.style.display = "none";
        }
    });
    cancelBtn.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => {
        if(e.target === modal) modal.style.display = "none";
    });
}

function initAddBusinessModal() {
    const modal = document.getElementById("addBusinessModal");
    const saveBtn = document.getElementById("addBizSave");
    const cancelBtn = document.getElementById("addBizCancel");
    
    saveBtn.addEventListener("click", async () => { 
        const name = document.getElementById("newBizName").value.trim();
        const address = document.getElementById("newBizAddress").value.trim();
        const price = document.getElementById("newBizPrice").value.trim();
        const type = document.getElementById("newBizType").value;
        const status = document.getElementById("newBizStatus").value;
        
        if(!name || !address || !price) { alert("Заполните все поля"); return; } 
        const newId = Date.now().toString(); 
        await db.collection('businesses').doc(newId).set({ name, address, price, type, status, imgIcon: "🏢", imgUrl: null }); 
        
        document.getElementById("newBizName").value = ""; 
        document.getElementById("newBizAddress").value = ""; 
        document.getElementById("newBizPrice").value = ""; 
        modal.style.display = "none"; 
        loadAllData(); 
    });
    
    cancelBtn.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => {
        if(e.target === modal) modal.style.display = "none";
    });
    document.getElementById("addBusinessBtn")?.addEventListener("click", () => modal.style.display = "flex");
}

function setupPickLocationButton() {
    const btn = document.getElementById('pickLocationBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            if (pickLocationMode) {
                disablePickLocationMode();
                showToast('📍 Режим привязки бизнеса отключён');
            } else {
                enablePickLocationMode();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pickLocationMode) {
            disablePickLocationMode();
            showToast('📍 Режим привязки бизнеса отключён');
        }
    });
    
    const cancelBtn = document.getElementById('cancelBusinessSelect');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('businessSelectModal').style.display = 'none';
            pendingCoords = null;
        });
    }
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('businessSelectModal');
        if (e.target === modal) {
            modal.style.display = 'none';
            pendingCoords = null;
        }
    });
}