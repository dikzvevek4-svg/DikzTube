const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const results = document.getElementById("results");
const status = document.getElementById("status");

const homePage = document.getElementById("homePage");
const watchPage = document.getElementById("watchPage");

const videoPlayer = document.getElementById("videoPlayer");
const watchTitle = document.getElementById("watchTitle");
const watchChannel = document.getElementById("watchChannel");

const nextVideos = document.getElementById("nextVideos");
const backButton = document.getElementById("backButton");

let currentVideos = [];
let currentIndex = -1;


// ===============================
// SEARCH
// ===============================

async function searchVideos() {

    const query = searchInput.value.trim();

    if (!query) {
        status.textContent = "Masukkan kata pencarian.";
        return;
    }

    // tampilkan home
    watchPage.style.display = "none";
    homePage.style.display = "block";

    // matikan player
    videoPlayer.src = "";

    // bersihkan hasil lama
    results.innerHTML = "";
    nextVideos.innerHTML = "";

    currentVideos = [];
    currentIndex = -1;

    status.textContent = `Mencari "${query}"...`;

    searchButton.disabled = true;
    searchButton.textContent = "⏳";

    try {

        const response = await fetch(
            `/api/search?q=${encodeURIComponent(query)}&_=${Date.now()}`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Pencarian gagal."
            );
        }

        currentVideos = data.videos || [];

        if (currentVideos.length === 0) {

            status.textContent =
                `Video "${query}" tidak ditemukan.`;

            return;
        }

        status.textContent =
            `${currentVideos.length} video ditemukan`;

        renderResults();

    } catch (error) {

        console.error("SEARCH ERROR:", error);

        status.textContent =
            "Pencarian gagal. Coba lagi.";

    } finally {

        searchButton.disabled = false;
        searchButton.textContent = "🔍";

    }
}


// ===============================
// HASIL
// ===============================

function renderResults() {

    results.innerHTML = "";

    currentVideos.forEach((video, index) => {

        const card = document.createElement("article");

        card.className = "video-card";

        card.innerHTML = `
            <div class="thumbnail">

                <img
                    src="${escapeHTML(video.thumbnail)}"
                    alt=""
                    loading="lazy"
                >

                <div class="play-button">
                    ▶
                </div>

            </div>

            <div class="video-text">

                <h3>
                    ${escapeHTML(video.title)}
                </h3>

                <p>
                    ${escapeHTML(video.channel)}
                </p>

            </div>
        `;

        card.onclick = function () {
            openVideo(video, index);
        };

        results.appendChild(card);

    });
}


// ===============================
// OPEN VIDEO
// ===============================

function openVideo(video, index) {

    currentIndex = index;

    homePage.style.display = "none";
    watchPage.style.display = "block";

    watchTitle.textContent = video.title;
    watchChannel.textContent = video.channel;

    videoPlayer.src =
        `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;

    renderNextVideos();

    window.scrollTo(0, 0);
}


// ===============================
// NEXT VIDEO
// ===============================

function renderNextVideos() {

    nextVideos.innerHTML = "";

    currentVideos.forEach((video, index) => {

        if (index === currentIndex) {
            return;
        }

        const item = document.createElement("div");

        item.className = "next-video";

        item.innerHTML = `
            <img
                src="${escapeHTML(video.thumbnail)}"
                alt=""
                loading="lazy"
            >

            <div>

                <h3>
                    ${escapeHTML(video.title)}
                </h3>

                <p>
                    ${escapeHTML(video.channel)}
                </p>

            </div>
        `;

        item.onclick = function () {
            openVideo(video, index);
        };

        nextVideos.appendChild(item);

    });

}


// ===============================
// BACK
// ===============================

function closeVideo() {

    videoPlayer.src = "";

    watchPage.style.display = "none";
    homePage.style.display = "block";

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;
}


// ===============================
// EVENTS
// ===============================

searchButton.onclick = searchVideos;

searchInput.onkeydown = function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        searchVideos();

    }

};

backButton.onclick = closeVideo;