async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");
    const searchInput = document.getElementById("search");

    const songFolders = [
        "hirata_shiho/heartbeat_heartbreak"
    ];

    const songs = [];

    for (const folder of songFolders) {
        try {
            const res = await fetch(`songs/${folder}/data.json`);
            const data = await res.json();
            data.folder = folder;
            songs.push(data);
        } catch (err) {
            console.error(`Failed to load ${folder}`, err);
        }
    }

    if (!songs.length) return;

    // 按日期排序
    songs.sort((a, b) => (a.date && b.date) ? new Date(b.date) - new Date(a.date) : 0);

    // 推薦歌曲
    const latest = songs[0];
    latestDiv.innerHTML = `
        <div class="label">推薦翻譯</div>
        <img src="songs/${latest.folder}/${latest.cover}" alt="${latest.title}">
        <div>
            <h3>${latest.title}</h3>
            <p>${latest.artist}</p>
        </div>
    `;
    latestDiv.onclick = () => {
        window.location.href = `songs/${latest.folder}/index.html`;
    };

    // 生成歌曲卡片
    listDiv.innerHTML = songs.map(song => `
        <a class="song-card" href="songs/${song.folder}/index.html"
           data-cover="songs/${song.folder}/${song.cover}"
           data-audio="songs/${song.folder}/audio.mp3">
            <img src="songs/${song.folder}/${song.cover}" alt="${song.title}">
            <div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        </a>
    `).join("");

    // 背景層 + 滾動動畫
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

    // 音效預覽系統
    const cards = document.querySelectorAll(".song-card");
    let currentAudio = null;
    const HOVER_DELAY = 200;
    let hoverTimeout = null;
    let isMuted = false;

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
                if (!isMuted) {
                    currentAudio = new Audio(audioSrc);
                    currentAudio.volume = 0.2;
                    currentAudio.play().catch(() => {});
                }
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

    // ===== 單一音量按鈕 =====
    const topRight = document.getElementById("top-right");
    const avatar = document.getElementById("about-btn");

    const volumeToggle = document.createElement("img");
    volumeToggle.id = "volume-toggle";
    volumeToggle.src = "images/on.png"; // 預設開啟
    volumeToggle.style.width = "24px";
    volumeToggle.style.height = "24px";
    volumeToggle.style.cursor = "pointer";
    volumeToggle.style.verticalAlign = "middle";
    volumeToggle.style.marginRight = "8px"; // 預留間距

    // 插入頭像旁
    topRight.insertBefore(volumeToggle, avatar);

    volumeToggle.addEventListener("click", () => {
        isMuted = !isMuted;
        volumeToggle.src = isMuted ? "images/off.png" : "images/on.png";
        if (currentAudio) {
            if (isMuted) currentAudio.pause();
            else currentAudio.play().catch(() => {});
        }
    });
}

loadSongs();
