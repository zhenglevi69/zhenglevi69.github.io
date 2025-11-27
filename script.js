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

    // 排序
    songs.sort((a, b) => {
        if (a.date && b.date) return new Date(b.date) - new Date(a.date);
        return 0;
    });

    // 推薦翻譯
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

    // 歌曲卡片
    listDiv.innerHTML = songs.map(song => `
        <a class="song-card" href="songs/${song.folder}/index.html" 
            data-folder="${song.folder}"
            data-cover="songs/${song.folder}/${song.cover}">
            <img src="songs/${song.folder}/${song.cover}" alt="${song.title}">
            <div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        </a>
    `).join("");

    // 全頁背景層
    let bgLayer = document.getElementById("bg-layer");
    if (!bgLayer) {
        bgLayer = document.createElement("div");
        bgLayer.id = "bg-layer";
        document.body.appendChild(bgLayer);
    }

    let scrollX = 0;
    let speed = 0.3;
    let visible = false;

    function animate() {
        if (visible) {
            scrollX -= speed;
            if (scrollX <= -window.innerWidth) scrollX = 0; 
            bgLayer.style.transform = `translateX(${scrollX}px)`;
        }
        requestAnimationFrame(animate);
    }

    animate();

    //=============//
    // ★ 音效播放系統 ★
    //=============//

    let hoverTimeout = null;       // 延遲播放的計時器
    let fadeInterval = null;       // 淡入淡出的 interval
    let audio = null;              // 單一全域 audio
    let isPlayingPreview = false;  // 避免重複播放
    const HOVER_DELAY = 1000;      // 滑鼠停留多久後播放 (ms)
    const PREVIEW_DURATION = 10000; // 播放多久後淡出 (ms)
    const MAX_VOLUME = 0.4;        // 最大音量
    const FADE_STEP = 0.03;        // 每次調整音量幅度
    const FADE_INTERVAL = 30;      // 音量調整間隔 (ms)

    // 所有歌卡片
    const cards = document.querySelectorAll(".song-card");

    cards.forEach(card => {
        const cover = card.getAttribute("data-cover");
        const folder = card.getAttribute("data-folder");
        const audioSrc = `songs/${folder}/audio.mp3`;

        // pointerenter 比 mouseenter 穩定
        card.addEventListener("pointerenter", () => {

            // 背景顯示
            bgLayer.style.backgroundImage = `url('${cover}')`;
            bgLayer.style.opacity = "1";
            visible = true;

            // 如果正在播放預覽，不會再啟動
            if (isPlayingPreview) return;

            // 設定 1 秒延遲播放
            hoverTimeout = setTimeout(() => {
                isPlayingPreview = true;

                // 如果舊 audio 還在 fade out，強制停掉
                if (audio) {
                    audio.pause();
                }

                audio = new Audio(audioSrc);
                audio.currentTime = 0;
                audio.volume = 0;

                audio.play().catch(err => {
                    console.warn("Autoplay 被擋住", err);
                });

                // ---- fade in ----
                let vol = 0;
                fadeInterval = setInterval(() => {
                    vol += FADE_STEP;
                    if (vol >= MAX_VOLUME) {
                        vol = MAX_VOLUME;
                        clearInterval(fadeInterval);
                    }
                    audio.volume = vol;
                }, FADE_INTERVAL);

                // ---- 播放 10 秒後自動 fade out + 停止 ----
                setTimeout(() => {
                    if (!audio) return;
                    clearInterval(fadeInterval);

                    fadeInterval = setInterval(() => {
                        vol -= FADE_STEP;
                        if (vol <= 0) {
                            vol = 0;
                            audio.volume = 0;
                            audio.pause();
                            clearInterval(fadeInterval);
                            isPlayingPreview = false;
                        }
                        audio.volume = vol;
                    }, FADE_INTERVAL);

                }, PREVIEW_DURATION);

            }, HOVER_DELAY);
        });

        // pointerleave 比 mouseleave 穩定
        card.addEventListener("pointerleave", () => {

            // 背景淡出
            bgLayer.style.opacity = '0';
            visible = false;

            // 取消延遲播放（如果還沒開始）
            clearTimeout(hoverTimeout);

            // 如果還沒播就退出 → 不做事
            if (!isPlayingPreview) return;

            // 正在播 → 開始淡出
            if (audio) {
                clearInterval(fadeInterval);

                let vol = audio.volume;
                fadeInterval = setInterval(() => {
                    vol -= FADE_STEP;
                    if (vol <= 0) {
                        vol = 0;
                        audio.volume = 0;
                        audio.pause();
                        clearInterval(fadeInterval);
                        isPlayingPreview = false;
                    }
                    audio.volume = vol;
                }, FADE_INTERVAL);
            }
        });
    });

    // 搜尋功能
    searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".song-card");
        cards.forEach(card => {
            const title = card.querySelector("h3").textContent.toLowerCase();
            const artist = card.querySelector("p").textContent.toLowerCase();
            card.style.display = title.includes(term) || artist.includes(term) ? "flex" : "none";
        });
    });
}

loadSongs();
