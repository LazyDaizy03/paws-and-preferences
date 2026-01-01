const API ="https://api.thecatapi.com/v1/images/search?limit=10&mime_types=jpg,png";

const cardContainer = document.getElementById("card-container");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");

const music = new Audio("meow_bgm.mp3");
music.loop = true;
music.volume = 0.4;

const likeSound = new Audio("like.mp3");
const dislikeSound = new Audio("dislike.mp3");

let cats = [];
let current = 0;
let liked = [];
let disliked = [];

fetch(API)
  .then(res => res.json())
  .then(data => {
    cats = data;
    showCard();
  });

function preloadNext() {
  if (cats[current + 1]) {
    const img = new Image();
    img.src = cats[current + 1].url;
  }
}

function showCard() {
  music.play();
  if (current >= cats.length) {
    showResult();
    return;
  }

  const card = document.createElement("div");
  card.className = "card";
  card.style.backgroundImage = `url(${cats[current].url})`;

  let startX = 0;
  card.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  card.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    if (diff > 80) swipe("right");
    else if (diff < -80) swipe("left");
  });

  cardContainer.appendChild(card);

  preloadNext();
}


function swipe(direction) {
  const card = document.querySelector(".card");
  if (!card) return;

  if (direction === "right") {
    likeSound.currentTime = 0;
    likeSound.play();
    liked.push(cats[current]);
    card.style.transform = "translateX(300px) rotate(15deg)";
  } else {
    dislikeSound.currentTime = 0;
    dislikeSound.play();
    disliked.push(cats[current]);
    card.style.transform = "translateX(-300px) rotate(-15deg)";
  }

  card.style.opacity = "0";

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
}
