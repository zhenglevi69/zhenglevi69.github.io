async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");
    const searchInput = document.getElementById("search");

    // 讀取外層 songs.json  
    let songs = [];  
    try {  
        const res = await fetch('songs.json');  
        songs = await res.json();  
    } catch (err) {  
        console.error('Failed to load songs.json', err);  
        return;  
    }  

    if (!songs.length) return;  

    // 日期排序（若有 date 欄位）  
    songs.sort((a, b) => (a.date && b.date) ? new Date(b.date) - new Date(a.date) : 0);  

    // 推薦歌曲（第一首）  
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

    // 清單卡片  
    listDiv.innerHTML = songs.map(song => `  
        <a class="song-card" href="${song.folder}/index.html"  
           data-cover="${song.cover}"  
           data-audio="${song.folder}/audio.mp3">  
            <img src="${song.cover}" alt="${song.title}">  
            <div>  
                <h3>${song.title}</h3>  
                <p>${song.artist}</p>  
            </div>  
        </a>  
    `).join("");  

    // 背景層（如果不存在就建立）  
    let bgLayer = document.getElementById("bg-layer");  
    if (!bgLayer) {  
        bgLayer = document.createElement("div");  
        bgLayer.id = "bg-layer";  
        document.body.appendChild(bgLayer);  
    }  

    // 背景滾動動畫  
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

    // hover 音效預覽 (修改區域開始)
    const cards = document.querySelectorAll(".song-card");  
    let currentAudio = null;  
    const HOVER_DELAY = 200;  
    const PLAYBACK_DURATION = 10000; // 新增：10秒播放時長 (10000ms)
    let hoverTimeout = null;  
    let playbackTimer = null; // 新增：用於控制 10 秒播放的計時器

    cards.forEach(card => {  
        const cover = card.dataset.cover;  
        const audioSrc = card.dataset.audio;  

        card.addEventListener("pointerenter", () => {  
            // 視覺效果部分
            bgLayer.style.backgroundImage = `url('${cover}')`;  
            bgLayer.style.opacity = "1";  
            visible = true;  

            // 清除現有的計時器和音頻
            clearTimeout(hoverTimeout);  
            clearTimeout(playbackTimer); // 進入時清除播放計時器

            if (currentAudio) {  
                currentAudio.pause();  
                currentAudio = null;  
            }  

            // 啟動 Hover 延遲計時器
            hoverTimeout = setTimeout(() => {  
                currentAudio = new Audio(audioSrc);  
                currentAudio.volume = 0.1;  
                
                currentAudio.play().then(() => {
                    // 播放成功後，設置 10 秒後自動停止的計時器
                    playbackTimer = setTimeout(() => {
                        if (currentAudio) {
                            currentAudio.pause();
                            currentAudio = null;
                        }
                    }, PLAYBACK_DURATION);
                }).catch(() => {
                    // 處理播放錯誤 (例如文件不存在)
                    console.warn(`無法播放音頻: ${audioSrc}`);
                });

            }, HOVER_DELAY);  
        });  

        card.addEventListener("pointerleave", () => {  
            // 清除所有計時器
            clearTimeout(hoverTimeout);  
            clearTimeout(playbackTimer); // 離開時清除播放計時器

            // 停止音頻
            if (currentAudio) {  
                currentAudio.pause();  
                currentAudio = null;  
            }  
            
            // 視覺效果部分
            bgLayer.style.opacity = "0";  
            visible = false;  
        });  
    });  
    // hover 音效預覽 (修改區域結束)

    // 搜尋  
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
