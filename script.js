const state = {
  folders: {},
  currentFolder: null,
  words: [],
  index: 0,
  flipped: false
};

/* ---------------- INIT ---------------- */
function init() {
  load();
  bind();
  renderFolders();
  render();
}

/* ---------------- FAKE AI ---------------- */
function fakeAI(word) {
  return {
    meaning: `${word} の意味（仮生成）`,
    example: `This is an example sentence using ${word}.`,
    ipa: ipaTable[word] || "/ˈunknown/",
    verb: verbTable[word] || "irregular: N/A"
  };
}

/* ---------------- TABLES ---------------- */
const ipaTable = {};
const verbTable = {};

/* ---------------- STORAGE ---------------- */
function save() {
  localStorage.setItem("ifty-data", JSON.stringify(state.folders));
}

function load() {
  const data = localStorage.getItem("ifty-data");
  if (data) state.folders = JSON.parse(data);
}

/* ---------------- BIND ---------------- */
function bind() {
  document.getElementById("createFolderBtn").onclick = createFolder;
  document.getElementById("generateBtn").onclick = generateWord;
  document.getElementById("folderSelect").onchange = switchFolder;

  document.getElementById("nextBtn").onclick = nextCard;
  document.getElementById("prevBtn").onclick = prevCard;

  document.getElementById("card").onclick = toggleCard;

  document.getElementById("checkBtn").onclick = checkTyping;

  document.getElementById("deleteBtn").onclick = deleteByWord;
  document.getElementById("deleteCurrentBtn").onclick = deleteCurrent;
  document.getElementById("clearBtn").onclick = clearAll;

  document.getElementById("speakUS").onclick = () => speak("US");
  document.getElementById("speakUK").onclick = () => speak("UK");

  // Enter support
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (input.id === "wordInput") generateWord();
        if (input.id === "typingInput") checkTyping();
        if (input.id === "folderName") createFolder();
        if (input.id === "deleteInput") deleteByWord();
      }
    });
  });
}

/* ---------------- FOLDERS ---------------- */
function createFolder() {
  const name = document.getElementById("folderName").value.trim();
  if (!name) return;

  state.folders[name] = [];
  state.currentFolder = name;
  state.words = state.folders[name];

  save();
  renderFolders();
  render();
}

function renderFolders() {
  const sel = document.getElementById("folderSelect");
  sel.innerHTML = "";

  Object.keys(state.folders).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });

  sel.value = state.currentFolder || "";
}

function switchFolder(e) {
  const name = e.target.value;
  state.currentFolder = name;
  state.words = state.folders[name] || [];
  state.index = 0;
  state.flipped = false;
  render();
}

/* ---------------- WORDS ---------------- */
async function generateWord() {
  const word = document.getElementById("wordInput").value.trim();
  if (!word || !state.currentFolder) return;

  const data = await fakeAI(word);

  const entry = { word, ...data };

  state.words.push(entry);
  state.folders[state.currentFolder] = state.words;

  save();
  state.index = state.words.length - 1;
  state.flipped = false;
  render();
}

/* ---------------- CARD ---------------- */
function render() {
  const card = state.words[state.index];

  if (!card) {
    document.getElementById("front").textContent = "NO WORD";
    document.getElementById("meaning").textContent = "";
    document.getElementById("example").textContent = "";
    document.getElementById("ipa").textContent = "";
    document.getElementById("verb").textContent = "";
    return;
  }

  document.getElementById("front").textContent = card.word;

  document.getElementById("meaning").textContent = card.meaning;
  document.getElementById("example").textContent = card.example;
  document.getElementById("ipa").textContent = card.ipa;
  document.getElementById("verb").textContent = card.verb;

  updateFlip();
}

function toggleCard() {
  state.flipped = !state.flipped;
  updateFlip();
}

function updateFlip() {
  document.getElementById("front").classList.toggle("hidden", state.flipped);
  document.getElementById("back").classList.toggle("hidden", !state.flipped);
}

/* ---------------- NAV ---------------- */
function nextCard() {
  if (state.index < state.words.length - 1) {
    state.index++;
    state.flipped = false;
    render();
  }
}

function prevCard() {
  if (state.index > 0) {
    state.index--;
    state.flipped = false;
    render();
  }
}

/* ---------------- TYPING ---------------- */
function checkTyping() {
  const input = document.getElementById("typingInput").value.trim();
  const current = state.words[state.index];

  if (!current) return;

  if (input === current.word) {
    alert("Correct!");
    nextCard();
  } else {
    alert("Wrong!");
  }
}

/* ---------------- DELETE ---------------- */
function deleteCurrent() {
  state.words.splice(state.index, 1);
  if (state.index > 0) state.index--;

  save();
  render();
}

function deleteByWord() {
  const target = document.getElementById("deleteInput").value.trim();
  state.words = state.words.filter(w => w.word !== target);
  state.folders[state.currentFolder] = state.words;

  save();
  state.index = 0;
  render();
}

function clearAll() {
  state.words = [];
  state.folders[state.currentFolder] = [];
  state.index = 0;

  save();
  render();
}

/* ---------------- SPEAK ---------------- */
function speak(type) {
  const card = state.words[state.index];
  if (!card) return;

  const utter = new SpeechSynthesisUtterance(card.word);
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
}

init();
