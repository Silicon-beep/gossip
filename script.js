const STORAGE_KEY = "spillr-posts-v1";
const aliases = [
  "Anonymous Apricot",
  "Sneaky Scone",
  "Lowkey Latte",
  "Secret Sprout",
  "Mystery Muffin",
  "Quiet Croissant",
];

const starterPosts = [
  {
    id: crypto.randomUUID(),
    author: "Lowkey Latte",
    category: "Work",
    text: "The intern guessed the Wi-Fi password on the first try and now everyone thinks they're psychic.",
    tea: 12,
    eyeroll: 2,
    createdAt: Date.now() - 1000 * 60 * 18,
  },
  {
    id: crypto.randomUUID(),
    author: "Anonymous Apricot",
    category: "Dating",
    text: "Someone took a hinge match to trivia night and introduced them as a 'networking opportunity.'",
    tea: 19,
    eyeroll: 4,
    createdAt: Date.now() - 1000 * 60 * 55,
  },
  {
    id: crypto.randomUUID(),
    author: "Mystery Muffin",
    category: "School",
    text: "A professor accidentally uploaded the answer key and half the class suddenly became very spiritual about honesty.",
    tea: 9,
    eyeroll: 1,
    createdAt: Date.now() - 1000 * 60 * 90,
  },
];

const form = document.querySelector("#gossip-form");
const gossipInput = document.querySelector("#gossip-input");
const authorInput = document.querySelector("#author-input");
const categoryInput = document.querySelector("#category-input");
const charCount = document.querySelector("#char-count");
const searchInput = document.querySelector("#search-input");
const sortInput = document.querySelector("#sort-input");
const filterButtons = document.querySelector("#filter-buttons");
const feedList = document.querySelector("#feed-list");
const template = document.querySelector("#post-template");

const state = {
  posts: loadPosts(),
  filter: "All",
  search: "",
  sort: "recent",
};

function loadPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : starterPosts;
  } catch {
    return starterPosts;
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
}

function formatTime(timestamp) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

function score(post) {
  return post.tea * 2 - post.eyeroll;
}

function filteredPosts() {
  const search = state.search.trim().toLowerCase();

  return [...state.posts]
    .filter((post) => state.filter === "All" || post.category === state.filter)
    .filter((post) => {
      if (!search) return true;
      return `${post.text} ${post.author} ${post.category}`.toLowerCase().includes(search);
    })
    .sort((a, b) => {
      if (state.sort === "hot") return score(b) - score(a) || b.createdAt - a.createdAt;
      return b.createdAt - a.createdAt;
    });
}

function render() {
  const posts = filteredPosts();
  feedList.innerHTML = "";

  if (!posts.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state card";
    empty.textContent = "No gossip matches that filter yet. Be the first to stir the pot.";
    feedList.append(empty);
    return;
  }

  posts.forEach((post) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = post.id;
    node.querySelector(".post-author").textContent = post.author;
    node.querySelector(".post-category").textContent = post.category;
    node.querySelector(".post-time").textContent = formatTime(post.createdAt);
    node.querySelector(".post-text").textContent = post.text;
    node.querySelector('[data-reaction="tea"] span').textContent = post.tea;
    node.querySelector('[data-reaction="eyeroll"] span').textContent = post.eyeroll;
    feedList.append(node);
  });
}

gossipInput.addEventListener("input", () => {
  charCount.textContent = `${gossipInput.value.length} / 280`;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = gossipInput.value.trim();
  if (!text) return;

  state.posts.unshift({
    id: crypto.randomUUID(),
    author: authorInput.value.trim() || aliases[Math.floor(Math.random() * aliases.length)],
    category: categoryInput.value,
    text,
    tea: 0,
    eyeroll: 0,
    createdAt: Date.now(),
  });

  savePosts();
  render();
  form.reset();
  charCount.textContent = "0 / 280";
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

sortInput.addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});

filterButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;

  state.filter = button.dataset.filter;
  [...filterButtons.querySelectorAll(".chip")].forEach((chip) => {
    chip.classList.toggle("active", chip === button);
  });
  render();
});

feedList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-reaction]");
  if (!button) return;

  const card = event.target.closest("[data-id]");
  const post = state.posts.find((item) => item.id === card.dataset.id);
  if (!post) return;

  if (button.dataset.reaction === "tea") {
    post.tea += 1;
  } else {
    post.eyeroll += 1;
  }

  savePosts();
  render();
});

render();
