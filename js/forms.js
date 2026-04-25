function initMeetingForm() {
    const topicSelect = document.getElementById("meetTopic");
    const customField = document.getElementById("customTopicField");
    if(topicSelect) topicSelect.addEventListener("change", () => { 
        if(topicSelect.value === "Другое") customField.classList.add("visible"); 
        else customField.classList.remove("visible"); 
    });
}

function setupForms() {
    // Feedback form
    document.getElementById("submitFeedback")?.addEventListener("click", async () => { 
        let name = document.getElementById("fbName").value.trim(); 
        let text = document.getElementById("fbText").value.trim(); 
        if(!text) { alert("Введите текст отзыва"); return; } 
        if(!name) name = "Гражданин"; 
        const newId = Date.now().toString(); 
        await db.collection('reviews').doc(newId).set({ name, text, date: new Date().toLocaleString() }); 
        document.getElementById("fbText").value = ""; 
        alert("✅ Отзыв опубликован!"); 
        loadAllData(); 
    });
    
    // Meeting form
    document.getElementById("submitMeeting")?.addEventListener("click", async () => { 
        let name = document.getElementById("meetName").value.trim(); 
        let phone = document.getElementById("meetPhone").value.trim(); 
        let cardId = document.getElementById("meetCardId").value.trim(); 
        let topic = document.getElementById("meetTopic").value; 
        let customTopic = ""; 
        
        if(topic === "Другое") { 
            customTopic = document.getElementById("meetCustomTopic").value.trim(); 
            if(!customTopic) { alert("Пожалуйста, укажите причину встречи"); return; } 
        } 
        if(!name || !phone || !cardId) { alert("Заполните все поля (имя, телефон, ID карта)"); return; } 
        if(phone.length !== 10 || !/^\d+$/.test(phone)) { alert("Телефон должен содержать 10 цифр"); return; } 
        
        const newId = Date.now().toString(); 
        await db.collection('meetings').doc(newId).set({ 
            name, phone, cardId, topic, 
            customTopic: customTopic || null, 
            status: "inwork", 
            date: new Date().toLocaleString() 
        }); 
        
        document.getElementById("meetName").value = ""; 
        document.getElementById("meetPhone").value = ""; 
        document.getElementById("meetCardId").value = ""; 
        document.getElementById("meetCustomTopic").value = ""; 
        document.getElementById("customTopicField").classList.remove("visible"); 
        document.getElementById("meetTopic").value = "Бизнес-вопрос"; 
        alert("📅 Заявка отправлена! Администратор рассмотрит её."); 
        loadAllData(); 
    });
    
    // News form
    document.getElementById("submitNews")?.addEventListener("click", async () => { 
        let title = document.getElementById("newsTitle").value.trim(); 
        let text = document.getElementById("newsText").value.trim(); 
        let imageUrl = document.getElementById("newsImageUrl").value.trim(); 
        let videoUrl = document.getElementById("newsVideoUrl").value.trim(); 
        if(!title || !text) { alert("Заполните заголовок и текст новости"); return; } 
        
        const newId = Date.now().toString(); 
        await db.collection('news').doc(newId).set({ 
            title, text, 
            imageUrl: imageUrl || null, 
            videoUrl: videoUrl || null, 
            date: new Date().toLocaleString() 
        }); 
        
        document.getElementById("newsTitle").value = ""; 
        document.getElementById("newsText").value = ""; 
        document.getElementById("newsImageUrl").value = ""; 
        document.getElementById("newsVideoUrl").value = ""; 
        document.getElementById("imagePreviewContainer").innerHTML = ""; 
        alert("✅ Новость опубликована!"); 
        loadAllData(); 
    });
    
    // Document form
    document.getElementById("submitDoc")?.addEventListener("click", async () => { 
        let title = document.getElementById("docTitle").value.trim(); 
        let text = document.getElementById("docText").value.trim(); 
        let imageUrl = document.getElementById("docImageUrl").value.trim(); 
        if(!title || !text) { alert("Заполните название и текст документа"); return; } 
        
        const newId = Date.now().toString(); 
        await db.collection('documents').doc(newId).set({ 
            title, text, 
            imageUrl: imageUrl || null, 
            date: new Date().toLocaleString() 
        }); 
        
        document.getElementById("docTitle").value = ""; 
        document.getElementById("docText").value = ""; 
        document.getElementById("docImageUrl").value = ""; 
        document.getElementById("docImagePreviewContainer").innerHTML = ""; 
        alert("✅ Документ опубликован!"); 
        loadAllData(); 
    });
    
    // Employee form
    document.getElementById("submitEmployee")?.addEventListener("click", async () => { 
        let name = document.getElementById("empName").value.trim(); 
        let position = document.getElementById("empPosition").value.trim(); 
        let photoUrl = document.getElementById("empPhotoUrl").value.trim(); 
        if(!name || !position) { alert("Заполните имя и должность сотрудника"); return; } 
        
        const newId = Date.now().toString(); 
        await db.collection('employees').doc(newId).set({ 
            name, position, 
            photoUrl: photoUrl || null, 
            icon: photoUrl ? null : "👤" 
        }); 
        
        document.getElementById("empName").value = ""; 
        document.getElementById("empPosition").value = ""; 
        document.getElementById("empPhotoUrl").value = ""; 
        document.getElementById("empPhotoPreview").innerHTML = ""; 
        alert("✅ Сотрудник добавлен!"); 
        loadAllData(); 
    });
    
    // Image previews
    document.getElementById("newsImageUrl")?.addEventListener("input", (e) => { 
        const previewContainer = document.getElementById("imagePreviewContainer"); 
        const url = e.target.value.trim(); 
        if(url) { previewContainer.innerHTML = `<img src="${url}" class="image-preview" alt="preview" style="max-width:100%; border-radius:12px;">`; } 
        else { previewContainer.innerHTML = ""; } 
    });
    
    document.getElementById("docImageUrl")?.addEventListener("input", (e) => { 
        const previewContainer = document.getElementById("docImagePreviewContainer"); 
        const url = e.target.value.trim(); 
        if(url) { previewContainer.innerHTML = `<img src="${url}" class