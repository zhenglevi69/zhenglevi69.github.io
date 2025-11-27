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
// ★ 音效播放系統（穩定升級版）★
//=============//

let hoverDelayTimer = null;     // 延遲播放
let fadeInTimer = null;         // 淡入
let fadeOutTimer = null;        // 淡出
let autoStopTimer = null;       // 自動停止
let currentAudio = null;        // 單一音效
let isPreviewing = false;       // 是否正在預覽音效

const HOVER_DELAY = 500;        // 滑鼠停留多久後播放
const MAX_VOLUME = 0.4;         // 最終音量
const FADE_STEP = 0.02;         // 每次音量變動
const FADE_INTERVAL = 25;       // 音量變動間隔
const PREVIEW_DURATION = 5000;  // 播放多長後自動淡出（建議 3~5 秒）

function clearAllAudioTimers() {
    clearTimeout(hoverDelayTimer);
    clearTimeout(autoStopTimer);
    clearInterval(fadeInTimer);
    clearInterval(fadeOutTimer);
}

cards.forEach(card => {
    const cover = card.getAttribute("data-cover");
    const folder = card.getAttribute("data-folder");
    const audioSrc = `songs/${folder}/audio.mp3`;

    card.addEventListener("pointerenter", () => {

        // 背景顯示
        bgLayer.style.backgroundImage = `url('${cover}')`;
        bgLayer.style.opacity = "1";
        visible = true;

        // 任何舊的播放流程都停掉
        clearAllAudioTimers();

        hoverDelayTimer = setTimeout(() => {

            // 防止重複啟動
            if (isPreviewing) return;
            isPreviewing = true;

            // 如果舊 audio 還沒完全停掉 → 強制關閉
            if (currentAudio) {
                currentAudio.pause();
            }

            currentAudio = new Audio(audioSrc);
            currentAudio.volume = 0;
            currentAudio.currentTime = 0;

            currentAudio.play().catch(() => {});

            // ---- 淡入 ----
            fadeInTimer = setInterval(() => {
                if (currentAudio.volume >= MAX_VOLUME) {
                    currentAudio.volume = MAX_VOLUME;
                    clearInterval(fadeInTimer);
                } else {
                    currentAudio.volume += FADE_STEP;
                }
            }, FADE_INTERVAL);

            // ---- 自動停止（避免背景計時器干擾） ----
            autoStopTimer = setTimeout(() => {
                clearInterval(fadeInTimer);
                fadeOutTimer = setInterval(() => {
                    if (currentAudio.volume <= 0) {
                        currentAudio.volume = 0;
                        currentAudio.pause();
                        clearInterval(fadeOutTimer);
                        isPreviewing = false;
                    } else {
                        currentAudio.volume -= FADE_STEP;
                    }
                }, FADE_INTERVAL);
            }, PREVIEW_DURATION);

        }, HOVER_DELAY);
    });

    card.addEventListener("pointerleave", () => {

        bgLayer.style.opacity = "0";
        visible = false;

        clearTimeout(hoverDelayTimer);

        // 尚未啟動 → 結束
        if (!isPreviewing) return;

        clearInterval(fadeInTimer);
        clearTimeout(autoStopTimer);

        // ---- 滑鼠離開 → 淡出 ----
        fadeOutTimer = setInterval(() => {
            if (!currentAudio) return;
            if (currentAudio.volume <= 0) {
                currentAudio.volume = 0;
                currentAudio.pause();
                clearInterval(fadeOutTimer);
                isPreviewing = false;
            } else {
                currentAudio.volume -= FADE_STEP;
            }
        }, FADE_INTERVAL);
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
