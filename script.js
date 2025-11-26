async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");

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

    songs.sort((a, b) => (a.date && b.date) ? new Date(b.date) - new Date(a.date) : 0);

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

    const cards = document.querySelectorAll('.song-card');

    cards.forEach(card => {
        const cover = card.getAttribute('data-cover');

        card.addEventListener('mouseenter', () => {
            bgLayer.style.backgroundImage = `url('${cover}')`;
            bgLayer.style.opacity = '1';
            bgLayer.style.backgroundSize = 'contain';
            bgLayer.style.animation = 'scroll-bg 30s linear infinite';
        });

        card.addEventListener('mouseleave', () => {
            // 邊滾邊淡出
            bgLayer.style.transition = 'opacity 0.6s ease';
            bgLayer.style.opacity = '0';
            // 不停止動畫，保持滾動
        });
    });
}

loadSongs();
