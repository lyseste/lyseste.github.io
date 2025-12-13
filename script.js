async function loadDatabase() {
    const res = await fetch("pages.json");
    const pages = await res.json();

    const gallery = document.getElementById("db-gallery");

    pages.forEach(page => {
        const card = document.createElement("div");
        card.className = "db-card";
        card.dataset.page = page.id;

        card.innerHTML = `
            <div class="thumb-wrapper">
                <img src="${page.thumbnail}" class="thumb">
            </div>
            <div class="db-meta">
                <img src="${page.icon}" class="icon">
                <span class="title">${page.title}</span>
            </div>
        `;

        gallery.appendChild(card);

        // Open modal on click
        card.addEventListener("click", async () => {
            const md = await fetch(page.contentFile).then(r => r.text());
            const html = marked.parse(md);

            document.getElementById("modal-body").innerHTML = `          
                    <div class="content-wrapper">  
                        <h1>${page.title}</h1>
                        ${html}
                    </div>
            `;

            const bannerSrc = page.banner && page.banner.trim() !== "" ? page.banner : page.thumbnail;
            document.getElementById("modal-banner-img").src = bannerSrc;
            
            document.getElementById("modal-icon-img").src = page.icon;
            
            document.getElementById("db-modal").style.display = "flex";
        });
    });
}

// Close modal
document.getElementById("close-btn").onclick = () => {
    document.getElementById("db-modal").style.display = "none";
};

window.onclick = (e) => {
    if (e.target.id === "db-modal") {
        document.getElementById("db-modal").style.display = "none";
    }
};

loadDatabase();
