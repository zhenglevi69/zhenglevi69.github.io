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

    songs.sort((a,b) => {
        if (a.date && b.date) return new Date(b.date) - new Date(a.date);
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

    // 歌曲卡片
    listDiv.innerHTML = songs.map(song => `
        <a class="song-card" href="songs/${song.folder}/index.html" data-cover="songs/${song.folder}/${song.cover}">
            <img src="songs/${song.folder}/${song.cover}" alt="${song.title}">
            <div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        </a>
    `).join("");

    // 初始背景
    let currentBG = 1;
    document.body.style.setProperty('--bg-all-1', `url('songs/${songs[0].folder}/${songs[0].cover}')`);
    document.body.style.setProperty('--bg-all-2', `url('songs/${songs[0].folder}/${songs[0].cover}')`);

    const cards = document.querySelectorAll('.song-card');
    cards.forEach(card => {
        const cover = card.getAttribute('data-cover');
        card.addEventListener('mouseenter', () => {
            // 切換另一個背景圖
            const nextBG = currentBG === 1 ? '--bg-all-2' : '--bg-all-1';
            document.body.style.setProperty(nextBG, `url('${cover}')`);
            // 淡入淡出
            document.body.style.setProperty('--fade-bg-1', currentBG === 1 ? 1 : 0);
            document.body.style.setProperty('--fade-bg-2', currentBG === 2 ? 1 : 0);
            // 交換 current
            currentBG = currentBG === 1 ? 2 : 1;
            // 控制透明度
            if (currentBG === 1) {
                document.body.style.setProperty('opacity', ''); // 保持 body 透明度不干擾
            }
        });
        card.addEventListener('mouseleave', () => {
            // 回到第一首歌封面
            const firstCover = `url('songs/${songs[0].folder}/${songs[0].cover}')`;
            if (currentBG === 1) {
                document.body.style.setProperty('--bg-all-2', firstCover);
            } else {
                document.body.style.setProperty('--bg-all-1', firstCover);
            }
        });
    });
}

loadSongs();
