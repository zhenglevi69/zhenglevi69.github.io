async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");
    const searchInput = document.getElementById("search");

    // 讀取 songs.json
    let songs = [];
    try {
        const res = await fetch('songs.json');
        songs = await res.json();
    } catch (err) {
        console.error('Failed to load songs.json', err);
        return;
    }

    if (!songs.length) return;

    // 日期排序
    songs.sort((a, b) => (a.date && b.date) ? new Date(b.date) - new Date(a.date) : 0);

    // 推薦翻譯（大卡片）
    const latest = songs[0];
    latestDiv.innerHTML = `
        <div class="label">推薦翻譯</div>
        <img src="${latest.cover}" alt="${latest.title}">
        <div>
            <h3>${latest.title}</h3>
            <p>${latest.artist}</p>
        </div>
    `;
    latestDiv.onclick = () => {
        window.location.href = `${latest.folder}/index.html`;
    };

    // 所有翻譯卡片
    const cardHTML = songs.map((song, index) => {
        // 第一首是推薦翻譯，不重複顯示
        if(index === 0) return '';
        return `
        <a class="song-card" href="${song.folder}/index.html"
           data-cover="${song.cover}"
           data-audio="${song.folder}/audio.mp3">
            <img src="${song.cover}" alt="${song.title}">
            <div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        </a>
        `;
    }).join('');
    listDiv.innerHTML = cardHTML;

    // 背景層滾動
    let bgLayer = document.getElementById("bg-layer");
    if (!bgLayer) {
        bgLayer = document.createElement("div");
        bgLayer.id = "bg-layer";
        document.body.appendChild(bgLayer);
    }

    let scrollX = 0;
    let visible = false;
    const speed = 0.3;

    function animate() {
        if (visible) {
            scrollX -= speed;
            if (scrollX <= -window.innerWidth) scrollX = 0;
            bgLayer.style.transform = `translateX(${scrollX}px)`;
        }
        requestAnimationFrame(animate);
    }
    animate();

    // hover 音效預覽
    const cards = document.querySelectorAll(".song-card");
    let currentAudio = null;
    const HOVER_DELAY = 200;
    let hoverTimeout = null;

    cards.forEach(card => {
        const cover = card.dataset.cover;
        const audioSrc = card.dataset.audio;

        card.addEventListener("pointerenter", () => {
            bgLayer.style.backgroundImage = `url('${cover}')`;
            bgLayer.style.opacity = "1";
            visible = true;

            clearTimeout(hoverTimeout);
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }

            hoverTimeout = setTimeout(() => {
                currentAudio = new Audio(audioSrc);
                currentAudio.volume = 0.1;
                currentAudio.play().catch(() => {});
            }, HOVER_DELAY);
        });

        card.addEventListener("pointerleave", () => {
            clearTimeout(hoverTimeout);
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            bgLayer.style.opacity = "0";
            visible = false;
        });
    });

    // 搜尋功能
    searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase();
        cards.forEach(card => {
            const title = card.querySelector("h3").textContent.toLowerCase();
            const artist = card.querySelector("p").textContent.toLowerCase();
            card.style.display = title.includes(term) || artist.includes(term) ? "flex" : "none";
        });
    });
}

loadSongs();