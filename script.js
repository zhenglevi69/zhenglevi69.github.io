async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");

    const songFolders = [
        "hirata_shiho/heartbeat_heartbreak",
        "hirata_shiho/another_song",
        // 依序列出其他歌曲資料夾
    ];

    const songs = [];

    for (const folder of songFolders) {
        try {
            const res = await fetch(`songs/${folder}/data.json`);
            const data = await res.json();
            data.folder = folder; // 保存資料夾路徑
            songs.push(data);
        } catch (err) {
            console.error(`Failed to load ${folder}`, err);
        }
    }

    if (!songs.length) return;

    // 依時間排序
    songs.sort((a, b) => {
        if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return 0;
    });

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

    // 所有歌曲列表
    listDiv.innerHTML = songs.map(song => `
        <a class="song-card" href="songs/${song.folder}/index.html" data-cover="songs/${song.folder}/${song.cover}">
            <img src="songs/${song.folder}/${song.cover}" alt="${song.title}">
            <div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        </a>
    `).join("");

    // 設置 hover 背景
    document.querySelectorAll('.song-card').forEach(card => {
        const cover = card.getAttribute('data-cover');
        card.style.setProperty('--cover', `url(${cover})`);
        card.querySelector('::before'); // 這是 CSS 裡的 ::before
        card.style.setProperty('--hover-bg', `url(${cover})`);
        card.style.setProperty('background-image', '');
    });
}
loadSongs();