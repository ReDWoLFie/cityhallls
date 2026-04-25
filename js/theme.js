function initTheme() {
    const savedTheme = localStorage.getItem("site_theme");
    const themeToggle = document.getElementById("themeToggle");
    if (savedTheme === "gta") {
        document.body.classList.add("theme-gta");
        themeToggle.textContent = "🎨 GTA Theme";
    } else {
        themeToggle.textContent = "🎨 Default Theme";
    }
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("theme-gta");
        if (document.body.classList.contains("theme-gta")) {
            localStorage.setItem("site_theme", "gta");
            themeToggle.textContent = "🎨 GTA Theme";
        } else {
            localStorage.setItem("site_theme", "default");
            themeToggle.textContent = "🎨 Default Theme";
        }
    });
}