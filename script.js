async function loadSongs() {
    const latestDiv = document.getElementById("latest");
    const listDiv = document.getElementById("song-list");
    const searchInput = document.getElementById("search"); 

    const songFolders = [
        "hirata_shiho/heartbeat_heartbreak"
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

    // 推薦翻譯
    const latest = songs[0];
    latestDiv.innerHTML = `
        <div class="label">推薦翻譯</div>
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

    // 全頁背景層
    let bgLayer = document.getElementById("bg-layer");
    if (!bgLayer) {
        bgLayer = document.createElement("div");
        bgLayer.id = "bg-layer";
        document.body.appendChild(bgLayer);
    }

    let scrollX = 0;
    let speed = 0.3;
    let visible = false;

    function animate() {
        if (visible) {
            scrollX -= speed;
            if (scrollX <= -window.innerWidth) scrollX = 0; 
            bgLayer.style.transform = `translateX(${scrollX}px)`;
        }
        requestAnimationFrame(animate);
    }

    animate();

    const cards = document.querySelectorAll('.song-card');
    cards.forEach(card => {
        const cover = card.getAttribute('data-cover');
        const folder = card.getAttribute('href').replace('songs/', '').replace('/index.html','');
        const audioSrc = `songs/${folder}/audio.mp3`;
        let audio, hoverTimeout;

        card.addEventListener('mouseenter', () => {
            // 背景顯示
            bgLayer.style.backgroundImage = `url('${cover}')`;
            bgLayer.style.opacity = '1';
            visible = true;

            // 1 秒延遲播放
            hoverTimeout = setTimeout(() => {
                audio = new Audio(audioSrc);
                audio.volume = 0;
                audio.play();

                // fade in 0.5 秒
                let vol = 0;
                const fadeIn = setInterval(() => {
                    vol += 0.05;
                    if(vol >= 1) {
                        vol = 1;
                        clearInterval(fadeIn);
                    }
                    audio.volume = vol;
                }, 25);

                // 10 秒後 fade out 並停止
                setTimeout(() => {
                    const fadeOut = setInterval(() => {
                        vol -= 0.05;
                        if(vol <= 0) {
                            vol = 0;
                            audio.pause();
                            clearInterval(fadeOut);
                        }
                        audio.volume = vol;
                    }, 25);
                }, 10000);
            }, 1000);
        });

        card.addEventListener('mouseleave', () => {
            bgLayer.style.opacity = '0';
            visible = false;

            clearTimeout(hoverTimeout);

            if(audio && !audio.paused) {
                let vol = audio.volume;
                const fadeOut = setInterval(() => {
                    vol -= 0.05;
                    if(vol <= 0) {
                        vol = 0;
                        audio.pause();
                        clearInterval(fadeOut);
                    }
                    audio.volume = vol;
                }, 25);
            }
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
