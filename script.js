// script.js
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll('.song-card').forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const artist = card.querySelector('p').textContent.toLowerCase();
        card.style.display = (title.includes(query) || artist.includes(query)) ? '' : 'none';
    });
});

async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");

    // 讀取所有歌曲資料夾
    // 假設你有一個 songs.json 或手動列出資料夾
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
            data.folder = folder; // 保存資料夾路徑給連結用
            songs.push(data);
        } catch (err) {
            console.error(`Failed to load ${folder}`, err);
        }
    }

    if (!songs.length) return;

    // 依時間排序，如果有 date 欄位
    songs.sort((a, b) => {
        if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return 0; // 沒有 date 就保留原順序
    });

    // 最新翻譯（第一首）
    const latest = songs[0];
    latestDiv.innerHTML = `
        <img src="songs/${latest.folder}/${latest.cover}" alt="${latest.title}">
        <div>
            <h3>${latest.title}</h3>
            <p>${latest.artist}</p>
        </div>
    `;

    // 所有歌曲列表
    listDiv.innerHTML = songs.map(song => `
        <a class="song-card" href="songs/${song.folder}/index.html">
            <img src="songs/${song.folder}/${song.cover}" alt="${song.title}">
            <div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        </a>
    `).join("");
}

loadSongs();
