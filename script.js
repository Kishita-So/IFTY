const STORAGE_KEY = "ifty-data";

const state = {
  folders: {},
  currentFolder: "",
  words: [],
  index: 0,
  flipped: false
};

const ipaTable = {};
const verbTable = {};

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      folders: state.folders,
      currentFolder: state.currentFolder
    })
  );
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    state.folders = data.folders || {};
    state.currentFolder = data.currentFolder || "";

    if (
      state.currentFolder &&
      state.folders[state.currentFolder]
    ) {
      state.words = state.folders[state.currentFolder];
    }
  } catch {
    state.folders = {};
  }
}

function fakeAI(word) {
  return {
    meaning: `${word} の意味`,
    example: `This is an example sentence with ${word}.`,
    ipa: ipaTable[word] || "/unknown/",
    verb: verbTable[word] || "-"
  };
}

function bind() {

  document.getElementById("createFolderBtn")
    .addEventListener("click", createFolder);

  document.getElementById("generateBtn")
    .addEventListener("click", generateWord);

  document.getElementById("folderSelect")
    .addEventListener("change", switchFolder);

  document.getElementById("nextBtn")
    .addEventListener("click", nextCard);

  document.getElementById("prevBtn")
    .addEventListener("click", prevCard);

  document.getElementById("card")
    .addEventListener("click", flipCard);

  document.getElementById("checkBtn")
    .addEventListener("click", checkTyping);

  document.getElementById("deleteBtn")
    .addEventListener("click", deleteByWord);

  document.getElementById("deleteCurrentBtn")
    .addEventListener("click", deleteCurrent);

  document.getElementById("clearBtn")
    .addEventListener("click", clearAll);

  document.getElementById("speakUS")
    .addEventListener("click", () => speak());

  document.getElementById("speakUK")
    .addEventListener("click", () => speak());

  setupEnter();
}

function setupEnter() {

  const map = {
    folderName: createFolder,
    wordInput: generateWord,
    typingInput: checkTyping,
    deleteInput: deleteByWord
  };

  Object.keys(map).forEach(id => {

    const el = document.getElementById(id);

    if (!el) return;

    el.addEventListener("keydown", e => {

      if (e.key !== "Enter") return;

      e.preventDefault();

      map[id]();
    });
  });
}

function createFolder() {

  const input =
    document.getElementById("folderName");

  const name = input.value.trim();

  if (!name) return;

  if (!state.folders[name]) {
    state.folders[name] = [];
  }

  state.currentFolder = name;
  state.words = state.folders[name];
  state.index = 0;
  state.flipped = false;

  input.value = "";

  save();
  renderFolders();
  render();
}

function renderFolders() {

  const select =
    document.getElementById("folderSelect");

  select.innerHTML = "";

  Object.keys(state.folders).forEach(name => {

    const option =
      document.createElement("option");

    option.value = name;
    option.textContent = name;

    select.appendChild(option);
  });

  if (state.currentFolder) {
    select.value = state.currentFolder;
  }
}

function switchFolder(e) {

  state.currentFolder = e.target.value;

  state.words =
    state.folders[state.currentFolder] || [];

  state.index = 0;
  state.flipped = false;

  render();
  save();
}

async function generateWord() {

  const input =
    document.getElementById("wordInput");

  const word = input.value.trim();

  if (!word) return;

  if (!state.currentFolder) {
    alert("Create a folder first");
    return;
  }

  const data = await fakeAI(word);

  state.words.push({
    word,
    ...data
  });

  state.folders[state.currentFolder] =
    state.words;

  state.index = state.words.length - 1;

  state.flipped = false;

  input.value = "";

  save();
  render();
}

function render() {

  const card =
    state.words[state.index];

  const front =
    document.getElementById("front");

  const back =
    document.getElementById("back");

  if (!card) {

    front.textContent = "NO WORD";

    document.getElementById("meaning").textContent = "";
    document.getElementById("example").textContent = "";
    document.getElementById("ipa").textContent = "";
    document.getElementById("verb").textContent = "";

    front.classList.remove("hidden");
    back.classList.add("hidden");

    return;
  }

  front.textContent = card.word;

  document.getElementById("meaning").textContent =
    card.meaning;

  document.getElementById("example").textContent =
    card.example;

  document.getElementById("ipa").textContent =
    card.ipa;

  document.getElementById("verb").textContent =
    card.verb;

  updateCard();
}

function flipCard() {

  if (!state.words.length) return;

  state.flipped = !state.flipped;

  updateCard();
}

function updateCard() {

  const front =
    document.getElementById("front");

  const back =
    document.getElementById("back");

  front.classList.toggle(
    "hidden",
    state.flipped
  );

  back.classList.toggle(
    "hidden",
    !state.flipped
  );
}

function nextCard() {

  if (
    state.index <
    state.words.length - 1
  ) {
    state.index++;
  }

  state.flipped = false;

  render();
}

function prevCard() {

  if (state.index > 0) {
    state.index--;
  }

  state.flipped = false;

  render();
}

function checkTyping() {

  const current =
    state.words[state.index];

  if (!current) return;

  const value =
    document.getElementById("typingInput")
    .value
    .trim();

  if (
    value.toLowerCase() ===
    current.word.toLowerCase()
  ) {

    alert("Correct");

    document.getElementById(
      "typingInput"
    ).value = "";

    nextCard();

  } else {

    alert("Wrong");
  }
}

function deleteCurrent() {

  if (!state.words.length) return;

  state.words.splice(
    state.index,
    1
  );

  if (
    state.index >=
    state.words.length
  ) {
    state.index =
      Math.max(
        0,
        state.words.length - 1
      );
  }

  save();
  render();
}

function deleteByWord() {

  const target =
    document.getElementById(
      "deleteInput"
    )
    .value
    .trim();

  if (!target) return;

  state.words =
    state.words.filter(
      w => w.word !== target
    );

  state.folders[
    state.currentFolder
  ] = state.words;

  document.getElementById(
    "deleteInput"
  ).value = "";

  state.index = 0;

  save();
  render();
}

function clearAll() {

  if (!state.currentFolder) return;

  state.words = [];

  state.folders[
    state.currentFolder
  ] = [];

  state.index = 0;

  save();
  render();
}

function speak() {

  const card =
    state.words[state.index];

  if (!card) return;

  speechSynthesis.cancel();

  const utter =
    new SpeechSynthesisUtterance(
      card.word
    );

  utter.lang = "en-US";

  speechSynthesis.speak(utter);
}

load();
bind();
renderFolders();
render();
