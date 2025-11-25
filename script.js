async function loadSongs() {
    // 先讀你的 songs/example/example.json
    const res = await fetch("songs/example/example.json");
    const song = await res.json();

    // 最新翻譯
    const latestDiv = document.getElementById("latest");
    latestDiv.innerHTML = `
        <div class="song-item">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        </div>
    `;

    // 歌曲列表
    const listDiv = document.getElementById("song-list");
    listDiv.innerHTML = `
        <div class="song-item">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        </div>
    `;
}

loadSongs();
