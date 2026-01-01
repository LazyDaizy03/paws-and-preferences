const API ="https://api.thecatapi.com/v1/images/search?limit=10&mime_types=jpg,png";

const cardContainer = document.getElementById("card-container");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const bar = document.getElementById("bar");
const counter = document.getElementById("counter");
const muteBtn = document.getElementById("mute");

const likeSound = new Audio("like.mp3");
const dislikeSound = new Audio("dislike.mp3");

const bgm = new Audio("meow_bgm.mp3");
bgm.loop = true;
bgm.volume = 0.25;
bgm.muted = true;
bgm.play().catch(() => {});

let audioUnlocked = false;
let muted = false;

let cats = [];
let current = 0;
let liked = [];
let disliked = [];

function unlockAudio() {
  if (!audioUnlocked) {
    bgm.muted = false; // unmute BGM
    audioUnlocked = true;
  }
}

function playSfx(sound) {
  if (muted) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

muteBtn.addEventListener("click", () => {
  muted = !muted;
  // mute affects BGM + SFX
  bgm.muted = muted || !audioUnlocked;
  muteBtn.textContent = muted ? "🔇" : "🔈";
});

fetch(API)
  .then(res => res.json())
  .then(data => {
    cats = data
      .filter((item) => /\.(jpg|jpeg|png)$/i.test(item.url))
      .slice(0, 10);
    updateProgress();
    showCard();
  })
  .catch((err) => {
    console.error("Failed to fetch cats:", err);
  });

function updateProgress() {
  const total = cats.length || 0;
  const pct = total ? (current / total) * 100 : 0;
  bar.style.width = `${pct}%`;
  counter.textContent = `${Math.min(current, total)} / ${total}`;
}

function preloadNext() {
  const next = cats[current + 1];
  if (!next) return;
  const img = new Image();
  img.src = next.url;
}

function showCard() {
  if (current >= cats.length) {
    showResult();
    return;
  }

  updateProgress();
  cardContainer.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card";
  card.style.backgroundImage = `url(${cats[current].url})`;

   const likeBadge = document.createElement("div");
  likeBadge.className = "badge like-badge";
  likeBadge.textContent = "LIKE";

  const nopeBadge = document.createElement("div");
  nopeBadge.className = "badge nope-badge";
  nopeBadge.textContent = "NOPE";

  card.appendChild(likeBadge);
  card.appendChild(nopeBadge);

  addSwipe(card);
  cardContainer.appendChild(card);

  preloadNext();
}

function addSwipe(card) {
  let startX = 0;

  card.addEventListener("touchstart", (e) => {
    unlockAudio();
    if (muted) bgm.muted = true;
    startX = e.touches[0].clientX;
  });

  card.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (diff > 80) swipe("right");
    else if (diff < -80) swipe("left");
  });
}

function swipe(direction) {
  unlockAudio();
  if (!muted) bgm.muted = false;

  const card = document.querySelector(".card");
  if (!card) return;

  const likeBadge = card.querySelector(".like-badge");
  const nopeBadge = card.querySelector(".nope-badge");

  // fade out after choosing
  card.style.opacity = "0";

  if (direction === "right") {
    likeBadge.style.opacity = "1";
    playSfx(likeSound);
    liked.push(cats[current]);
    card.style.transform = "translateX(320px) rotate(15deg)";
  } else {
    nopeBadge.style.opacity = "1";
    playSfx(dislikeSound);
    disliked.push(cats[current]);
    card.style.transform = "translateX(-320px) rotate(-15deg)";
  }

  // keep it snappy
  setTimeout(() => {
    card.remove();
    current++;
    showCard();
    preloadNext();
  }, 300);
}

likeBtn.addEventListener("click", () => swipe("right"));
dislikeBtn.addEventListener("click", () => swipe("left"));

function showResult() {
  document.getElementById("card-container").style.display = "none"; // ✅ 关键：不占位
  document.querySelector(".buttons").classList.add("hidden");
  
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("like-count").innerText = liked.length;
  document.getElementById("dislike-count").innerText = disliked.length;

  liked.forEach((cat) => {
    const item = document.createElement("div");
    item.className = "scroll-item";
    const img = document.createElement("img");
    img.src = cat.url;
    item.appendChild(img);
    document.getElementById("liked-cats").appendChild(item);
  });
  
  disliked.forEach((cat) => {
    const item = document.createElement("div");
    item.className = "scroll-item";
    const img = document.createElement("img");
    img.src = cat.url;
    item.appendChild(img);
    document.getElementById("disliked-cats").appendChild(item);
  });

  liked.scrollLeft = 0;
  disliked.scrollLeft = 0;

  bar.style.width = "100%";
  counter.textContent = `${cats.length} / ${cats.length}`;

  document.getElementById("restart").addEventListener("click", () => {
    location.reload();
  });
}
