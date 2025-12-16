async function loadDatabase() {
    const res = await fetch("pages.json");
    const pages = await res.json();

    const gallery = document.getElementById("db-gallery");

    function hashToHSL(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash) % 360;
    const s = 40;      // saturation
    const l = 85;      // lightness

    return `hsl(${h}, ${s}%, ${l}%)`;
}

function applyAutoTagColors() {
    document.querySelectorAll(".tag.auto-color").forEach(tag => {
        const tagName = tag.textContent.trim();
        const className = tagName.replace(/\s+/g, '');

        const computed = getComputedStyle(tag);
        const isManual =
            computed.backgroundColor !== 'rgb(238, 238, 238)' &&
            computed.backgroundColor !== 'rgb(0, 0, 0)' &&
            !computed.backgroundColor.includes("rgba(0, 0, 0, 0)");

        if (isManual) return;

        tag.style.backgroundColor = hashToHSL(tagName);

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
            
            document.body.classList.add("modal-open");

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
            
            const modal = document.getElementById("db-modal");
            modal.style.display = "flex";
            modal.scrollTop = 0;

            applyAutoTagColors();

            history.pushState({ modalOpen: true, pageId: page.id }, "", ``);
        });

        applyAutoTagColors();

    });
}


function closeModal() {
    const modal = document.getElementById("db-modal");
    modal.style.display = "none";
    document.body.classList.remove("modal-open");

    history.replaceState({}, "", window.location.pathname);
}

document.getElementById("close-btn").onclick = () => {
    closeModal();
};


window.onclick = (e) => {
    if (e.target.id === "db-modal") {
        closeModal();
    }
};

window.addEventListener("popstate", (event) => {
    const modal = document.getElementById("db-modal");
    if (modal.style.display === "flex") {
        closeModal();
    }
});

loadDatabase();
