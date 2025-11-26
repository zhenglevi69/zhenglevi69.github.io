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

    // 按日期排序
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

    // 設定初始背景
    let currentBG = 1;
    document.body.style.setProperty('--bg-all-1', `url('songs/${songs[0].folder}/${songs[0].cover}')`);
    document.body.style.setProperty('--bg-all-2', `url('songs/${songs[0].folder}/${songs[0].cover}')`);
    document.body.style.setProperty('--fade-bg-1', 1);
    document.body.style.setProperty('--fade-bg-2', 0);

    const cards = document.querySelectorAll('.song-card');
    cards.forEach(card => {
        const cover = card.getAttribute('data-cover');

        card.addEventListener('mouseenter', () => {
            const nextBG = currentBG === 1 ? '--bg-all-2' : '--bg-all-1';
            const fade1 = currentBG === 1 ? 0 : 1;
            const fade2 = currentBG === 1 ? 1 : 0;

            document.body.style.setProperty(nextBG, `url('${cover}')`);
            document.body.style.setProperty('--fade-bg-1', fade1);
            document.body.style.setProperty('--fade-bg-2', fade2);

            currentBG = currentBG === 1 ? 2 : 1;
        });

        card.addEventListener('mouseleave', () => {
            const firstCover = `url('songs/${songs[0].folder}/${songs[0].cover}')`;
            if (currentBG === 1) {
                document.body.style.setProperty('--bg-all-2', firstCover);
                document.body.style.setProperty('--fade-bg-1', 1);
                document.body.style.setProperty('--fade-bg-2', 0);
            } else {
                document.body.style.setProperty('--bg-all-1', firstCover);
                document.body.style.setProperty('--fade-bg-1', 0);
                document.body.style.setProperty('--fade-bg-2', 1);
            }
        });
    });
}

loadSongs();
