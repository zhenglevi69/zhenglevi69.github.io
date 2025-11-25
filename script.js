async function loadSongs() {
    const response = await fetch("songs.json");
    const songs = await response.json();

    // 最新翻譯：假設取最後 3 首
    const latest = songs.slice(-3).reverse();
    const latestContainer = document.getElementById("latest");
    latestContainer.innerHTML = latest.map(song => `
        <div class="song-card">
            <a href="${song.folder}/">
                <img src="${song.cover}" alt="${song.title}">
                <div>
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
            </a>
        </div>
    `).join("");

    // 所有翻譯
    const allContainer = document.getElementById("song-list");
    allContainer.innerHTML = songs.map(song => `
        <div class="song-card">
            <a href="${song.folder}/">
                <img src="${song.cover}" alt="${song.title}">
                <div>
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
            </a>
        </div>
    `).join("");
}

// 搜尋功能
document.getElementById("search").addEventListener("input", function() {
    const query = this.value.toLowerCase();
    const songCards = document.querySelectorAll("#song-list .song-card");
    songCards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const artist = card.querySelector("p").textContent.toLowerCase();
        card.style.display = (title.includes(query) || artist.includes(query)) ? "flex" : "none";
    });
});

loadSongs();
