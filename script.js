async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");

    const songFolders = [
        "hirata_shiho/heartbeat_heartbreak",
        "hirata_shiho/another_song",
        // 其他歌曲資料夾依序列出
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
        <div class="song-wrapper" style="--bg: url('songs/${song.folder}/${song.cover}')">
            <a class="song-card" href="songs/${song.folder}/index.html">
                <img src="songs/${song.folder}/${song.cover}" alt="${song.title}">
                <div>
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
            </a>
        </div>
    `).join("");
}

loadSongs();
