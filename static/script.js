// ==========================================
// DIKZTUBE - GITHUB PAGES
// ==========================================

// MASUKKAN API KEY YOUTUBE KHUSUS DI SINI
const API_KEY = "AIzaSyCOybJW58nNIFZatWtoHYZ9hZJTAlmLr9w";

const API_URL =
  "https://www.googleapis.com/youtube/v3/search";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const startBtn = document.getElementById("startBtn");

const results = document.getElementById("results");
const statusBox = document.getElementById("status");
const sectionTitle = document.getElementById("sectionTitle");

const watchPage = document.getElementById("watchPage");
const player = document.getElementById("player");
const watchTitle = document.getElementById("watchTitle");
const watchChannel = document.getElementById("watchChannel");
const backBtn = document.getElementById("backBtn");


// ==========================================
// HELPERS
// ==========================================

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}


function setStatus(text, isError = false) {
  statusBox.textContent = text;
  statusBox.className = isError ? "error" : "";
}


// ==========================================
// SEARCH YOUTUBE
// ==========================================

async function searchVideos() {

  const query = searchInput.value.trim();

  if (!query) {
    setStatus("Masukkan kata pencarian.");
    return;
  }

  if (
    !API_KEY ||
    API_KEY === "MASUKKAN_API_KEY_DI_SINI"
  ) {
    setStatus("API key belum dipasang.", true);
    return;
  }

  setStatus("Mencari...");

  results.innerHTML = `
    <div class="empty">
      Sedang mencari video...
    </div>
  `;

  try {

    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "24",
      key: API_KEY
    });

    const response = await fetch(
      `${API_URL}?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {

      console.error(data);

      throw new Error(
        data?.error?.message ||
        "Gagal mengambil data YouTube."
      );
    }

    if (!data.items || data.items.length === 0) {

      results.innerHTML = `
        <div class="empty">
          Video tidak ditemukan.
        </div>
      `;

      setStatus("");
      return;
    }

    renderVideos(data.items);

    sectionTitle.textContent =
      `Hasil: ${query}`;

    setStatus(
      `${data.items.length} video ditemukan`
    );

  } catch (error) {

    console.error(error);

    results.innerHTML = `
      <div class="empty error">
        ${escapeHTML(error.message)}
      </div>
    `;

    setStatus("Terjadi kesalahan.", true);
  }
}


// ==========================================
// RENDER VIDEO
// ==========================================

function renderVideos(items) {

  results.innerHTML = "";

  items.forEach(item => {

    const videoId =
      item?.id?.videoId;

    if (!videoId) return;

    const snippet =
      item.snippet || {};

    const title =
      snippet.title || "Tanpa judul";

    const channel =
      snippet.channelTitle || "Unknown";

    const thumbnail =
      snippet?.thumbnails?.high?.url ||
      snippet?.thumbnails?.medium?.url ||
      snippet?.thumbnails?.default?.url ||
      "";

    const card =
      document.createElement("article");

    card.className = "video-card";

    card.innerHTML = `
      <div class="thumbnail">

        <img
          src="${escapeHTML(thumbnail)}"
          alt="${escapeHTML(title)}"
          loading="lazy"
        >

        <div class="play-icon">
          ▶
        </div>

      </div>

      <div class="video-info">

        <div class="video-title">
          ${escapeHTML(title)}
        </div>

        <div class="video-channel">
          ${escapeHTML(channel)}
        </div>

      </div>
    `;

    card.addEventListener(
      "click",
      () => openVideo(
        videoId,
        title,
        channel
      )
    );

    results.appendChild(card);
  });
}


// ==========================================
// OPEN VIDEO
// ==========================================

function openVideo(
  videoId,
  title,
  channel
) {

  if (!videoId) return;

  watchPage.classList.remove("hidden");

  document
    .querySelector("main")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  player.src =
    "https://www.youtube.com/embed/" +
    encodeURIComponent(videoId) +
    "?autoplay=1&rel=0";

  watchTitle.textContent =
    title || "Video";

  watchChannel.textContent =
    channel || "";

  window.scrollTo({
    top: watchPage.offsetTop - 20,
    behavior: "smooth"
  });
}


// ==========================================
// CLOSE PLAYER
// ==========================================

function closePlayer() {

  player.src = "";

  watchPage.classList.add("hidden");
}


// ==========================================
// EVENTS
// ==========================================

searchBtn.addEventListener(
  "click",
  searchVideos
);

startBtn.addEventListener(
  "click",
  () => {
    searchInput.focus();
  }
);

backBtn.addEventListener(
  "click",
  closePlayer
);

searchInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      searchVideos();
    }

  }
);


// ==========================================
// INITIAL STATE
// ==========================================

results.innerHTML = `
  <div class="empty">
    Ketik sesuatu di kolom pencarian untuk mulai.
  </div>
`;
