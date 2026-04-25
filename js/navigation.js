function setActiveSection(sectionId) {
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active-section"));
    document.getElementById(sectionId)?.classList.add("active-section");
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if(activeBtn) activeBtn.classList.add("active");
    localStorage.setItem("activeSection", sectionId);
    if (sectionId === "map") {
        setTimeout(() => {
            updateMapMarkers();
            if (isAdmin) setupMapClicks();
        }, 200);
    }
}

function initNavigation() {
    document.querySelectorAll(".nav-btn").forEach(btn => btn.addEventListener("click", () => { 
        const sectionId = btn.getAttribute("data-section"); 
        if(sectionId) { 
            setActiveSection(sectionId); 
            window.scrollTo({ top: 0, behavior: "smooth" }); 
        } 
    }));
    const savedSection = localStorage.getItem("activeSection");
    if(savedSection && document.getElementById(savedSection)) setActiveSection(savedSection);
    else setActiveSection("home");
}