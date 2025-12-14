/********************
 * CONFIG
 ********************/
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-k2ayzX84HXYv3C-ckTARlNZNAlFpC2mbBEvY7lw8KORHPehsvgQFhoZr6UcMdMVj-F_E5abNVG3r/pub?output=csv";

const CARD_HEIGHT = 80;
const BUFFER = 5;

/********************
 * ELEMENTS
 ********************/
const viewport = document.getElementById("viewport");
const spacer = document.getElementById("spacer");
const items = document.getElementById("items");
const searchInput = document.getElementById("search");

/********************
 * DATA
 ********************/
let data = [];
let filtered = [];

/********************
 * LOAD GOOGLE SHEET
 ********************/
async function loadData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const rows = text.trim().split("\n").map(r => r.split(","));
  const [, ...body] = rows; // skip header row

  data = body.map(row => ({
    title: row[0] || "",
    subtitle: row[1] || "",
    searchText: (row[0] + " " + row[1]).toLowerCase()
  }));

  filtered = data;
  updateSpacer();
  render();
}

/********************
 * VIRTUALIZATION
 ********************/
function updateSpacer() {
  spacer.style.height = filtered.length * CARD_HEIGHT + "px";
}

function render() {
  const scrollTop = viewport.scrollTop;

  const start = Math.max(
    0,
    Math.floor(scrollTop / CARD_HEIGHT) - BUFFER
  );

  const end = Math.min(
    filtered.length,
    start +
      Math.ceil(viewport.clientHeight / CARD_HEIGHT) +
      BUFFER * 2
  );

  items.style.transform = `translateY(${start * CARD_HEIGHT}px)`;
  items.innerHTML = "";

  for (let i = start; i < end; i++) {
    items.appendChild(createCard(filtered[i]));
  }
}

function createCard(item) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <div class="title">${item.title}</div>
    <div class="subtitle">${item.subtitle}</div>
  `;
  return div;
}

/********************
 * SEARCH (DEBOUNCED)
 ********************/
let timer;
searchInput.addEventListener("input", e => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const q = e.target.value.toLowerCase().trim();

    filtered = q
      ? data.filter(d => d.searchText.includes(q))
      : data;

    viewport.scrollTop = 0;
    updateSpacer();
    render();
  }, 150);
});

/********************
 * EVENTS
 ********************/
viewport.addEventListener("scroll", render);

/********************
 * INIT
 ********************/
loadData();