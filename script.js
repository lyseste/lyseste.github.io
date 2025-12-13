async function loadDatabase() {
    const res = await fetch("pages.json");
    const pages = await res.json();

    const gallery = document.getElementById("db-gallery");

    function hashToHSL(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Notion-like: soft pastel hues, low saturation
    const h = Math.abs(hash) % 360;
    const s = 40;      // pastel saturation
    const l = 85;      // lightness

    return `hsl(${h}, ${s}%, ${l}%)`;
}

function applyAutoTagColors() {
    document.querySelectorAll(".tag.auto-color").forEach(tag => {
        const tagName = tag.textContent.trim();
        const className = tagName.replace(/\s+/g, '');

        // If manual override exists, skip
        const computed = getComputedStyle(tag);
        const isManual =
            computed.backgroundColor !== 'rgb(238, 238, 238)' && // default-bg
            computed.backgroundColor !== 'rgb(0, 0, 0)' &&
            !computed.backgroundColor.includes("rgba(0, 0, 0, 0)");

        if (isManual) return;

        // Apply automatic pastel color
        tag.style.backgroundColor = hashToHSL(tagName);

        // Automatic readable text color
        tag.style.color = "hsl(0, 0%, 20%)";
    });
}


    pages.forEach(page => {
        const card = document.createElement("div");
        card.className = "db-card";
        card.dataset.page = page.id;
        const tagHTML = page.tags
            .map(tag => `<span class="tag tag-small auto-color ${tag.replace(/\s+/g, '')}">${tag}</span>`)
            .join("");

        card.innerHTML = `
            <div class="thumb-wrapper">
                <img src="${page.thumbnail}" class="thumb">
            </div>
            <div class="db-meta">
                <img src="${page.icon}" class="icon">
                <span class="title">${page.title}</span>
                <div class="tag-container">${tagHTML}</div>
            </div>
        `;

        gallery.appendChild(card);

        // Open modal on click
        card.addEventListener("click", async () => {
            const md = await fetch(page.contentFile).then(r => r.text());
            const html = marked.parse(md);

            const tagsHTML = page.tags
                .map(tag => `<span class="tag tag-large auto-color ${tag.replace(/\s+/g, '')}">${tag}</span>`)
                .join("");

            document.getElementById("modal-body").innerHTML = `          
                    <div class="content-wrapper">  
                            <div class="modal-header-top">                            
                                <h1>${page.title}</h1>
                                <div class="tag-container">${tagsHTML}</div>
                            </div>
                        ${html}
                    </div>
            `;

            const bannerSrc = page.banner && page.banner.trim() !== "" ? page.banner : page.thumbnail;
            document.getElementById("modal-banner-img").src = bannerSrc;
            
            document.getElementById("modal-icon-img").src = page.icon;
            
            document.getElementById("db-modal").style.display = "flex";

            applyAutoTagColors();

        });

        applyAutoTagColors();

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
