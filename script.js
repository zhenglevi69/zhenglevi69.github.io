async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");
    const bgLayer = document.getElementById("bg-layer");

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

    songs.sort((a,b) => a.date && b.date ? new Date(b.date)-new Date(a.date) : 0);

    // 最新翻譯公告
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

    // 生成卡片
    listDiv.innerHTML = songs.map(song => `
        <a class="song-card" href="songs/${song.folder}/index.html" data-cover="songs/${song.folder}/${song.cover}">
            <img src="songs/${song.folder}/${song.cover}" alt="${song.title}">
            <div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        </a>
    `).join("");

    const cards = document.querySelectorAll('.song-card');

    cards.forEach(card => {
        const cover = card.getAttribute('data-cover');

        card.addEventListener('mouseenter', () => {
            bgLayer.style.backgroundImage = `url('${cover}')`;
            bgLayer.style.opacity = 1;  // 顯示背景
        });

        card.addEventListener('mouseleave', () => {
            bgLayer.style.opacity = 0;  // 隱藏背景
        });
    });
}

loadSongs();
