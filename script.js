async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");
    const searchInput = document.getElementById("search"); // 搜尋欄

    const songFolders = [
        "hirata_shiho/heartbeat_heartbreak",
        "hirata_shiho/another_song"
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

    // 最新翻譯
    const latest = songs[0];
    latestDiv.innerHTML = `
        <img src="songs/${latest.folder}/${latest.cover}" alt="${latest.title}">
        <div>
            <h3>${latest.title}</h3>
            <p>${latest.artist}</p>
        </div>
    `;
    latestDiv.onclick = () => {
        window.location.href = `songs/${latest.folder}/index.html`;
    };

    // 卡片
    listDiv.innerHTML = songs.map(song => `
        <a class="song-card" href="songs/${song.folder}/index.html" data-cover="songs/${song.folder}/${song.cover}">
            <img src="songs/${song.folder}/${song.cover}" alt="${song.title}">
            <div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        </a>
    `).join("");

    // 建立全頁背景層
    let bgLayer = document.getElementById("bg-layer");
    if (!bgLayer) {
        bgLayer = document.createElement("div");
        bgLayer.id = "bg-layer";
        document.body.appendChild(bgLayer);
    }

    let scrollX = 0;           // 背景 X 位置
    let speed = 0.3;           // 滾動速度 px/frame
    let visible = false;       // 是否顯示背景
    let requestId;

    function animate() {
        if (visible) {
            scrollX -= speed;
            if (scrollX <= -window.innerWidth) scrollX = 0; // 循環
            bgLayer.style.transform = `translateX(${scrollX}px)`;
        }
        requestId = requestAnimationFrame(animate);
    }

    animate(); // 開始動畫

    const cards = document.querySelectorAll('.song-card');
    cards.forEach(card => {
        const cover = card.getAttribute('data-cover');

        card.addEventListener('mouseenter', () => {
            bgLayer.style.backgroundImage = `url('${cover}')`;
            bgLayer.style.opacity = '1';
            visible = true;
        });

        card.addEventListener('mouseleave', () => {
            bgLayer.style.opacity = '0';
            visible = false;
        });
    });

    // 搜尋功能
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll('.song-card');
        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const artist = card.querySelector('p').textContent.toLowerCase();
            card.style.display = title.includes(term) || artist.includes(term) ? 'flex' : 'none';
        });
    });
}

loadSongs();
