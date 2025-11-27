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

    // ★ 正確生成歌曲卡片（加上 data-audio）
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


    //========================//
    //  背景層 + 滾動動畫
    //========================//

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


    //========================//
    //     ★ 音效預覽系統 ★
    //========================//

    const cards = document.querySelectorAll(".song-card");

    let hoverDelayTimer = null;
    let fadeInTimer = null;
    let fadeOutTimer = null;
    let autoStopTimer = null;

    let currentAudio = null;
    let isPreviewing = false;

    const HOVER_DELAY = 500;
    const MAX_VOLUME = 0.4;
    const FADE_STEP = 0.02;
    const FADE_INTERVAL = 25;
    const PREVIEW_DURATION = 5000;

    function clearAllAudioTimers() {
        clearTimeout(hoverDelayTimer);
        clearTimeout(autoStopTimer);
        clearInterval(fadeInTimer);
        clearInterval(fadeOutTimer);
    }

    function stopAudioImmediately() {
        clearAllAudioTimers();
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.volume = 0;
        }
        isPreviewing = false;
    }

    cards.forEach(card => {
        const cover = card.dataset.cover;
        const audioSrc = card.dataset.audio;

        card.addEventListener("mouseenter", () => {

            // 背景啟動
            bgLayer.style.backgroundImage = `url('${cover}')`;
            bgLayer.style.opacity = "1";
            visible = true;

            stopAudioImmediately();

            hoverDelayTimer = setTimeout(() => {

                currentAudio = new Audio(audioSrc);
                currentAudio.volume = 0;
                currentAudio.play().catch(() => {});

                isPreviewing = true;

                // fade in
                fadeInTimer = setInterval(() => {
                    if (!currentAudio) return;

                    currentAudio.volume += FADE_STEP;
                    if (currentAudio.volume >= MAX_VOLUME) {
                        currentAudio.volume = MAX_VOLUME;
                        clearInterval(fadeInTimer);
                    }
                }, FADE_INTERVAL);

                // 播五秒後淡出 + 停止
                autoStopTimer = setTimeout(() => {
                    clearInterval(fadeInTimer);

                    fadeOutTimer = setInterval(() => {
                        if (!currentAudio) return;

                        currentAudio.volume -= FADE_STEP;
                        if (currentAudio.volume <= 0) {
                            currentAudio.volume = 0;
                            currentAudio.pause();
                            clearInterval(fadeOutTimer);
                            isPreviewing = false;
                        }
                    }, FADE_INTERVAL);
                }, PREVIEW_DURATION);

            }, HOVER_DELAY);
        });

        card.addEventListener("mouseleave", () => {

            visible = false;
            bgLayer.style.opacity = "0";

            clearAllAudioTimers();

            if (currentAudio && isPreviewing) {
                fadeOutTimer = setInterval(() => {
                    currentAudio.volume -= FADE_STEP;

                    if (currentAudio.volume <= 0) {
                        currentAudio.volume = 0;
                        currentAudio.pause();
                        clearInterval(fadeOutTimer);
                        isPreviewing = false;
                    }
                }, FADE_INTERVAL);
            }
        });
    });


    //========================//
    //     ★ 搜尋功能
    //========================//

    searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".song-card");

        cards.forEach(card => {
            const title = card.querySelector("h3").textContent.toLowerCase();
            const artist = card.querySelector("p").textContent.toLowerCase();
            card.style.display =
                title.includes(term) || artist.includes(term)
                    ? "flex"
                    : "none";
        });
    });
}

loadSongs();
