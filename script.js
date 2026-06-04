const STORAGE_KEY = "ifty-data";
const state = {
  folders: {},
  currentFolder: "",
  words: [],
  index: 0,
  flipped: false
};
const irregularVerbs = {
  run:{
    past:"ran",
    pp:"run",
    ing:"running"
  },
  write:{
    past:"wrote",
    pp:"written",
    ing:"writing"
  },
  go:{
    past:"went",
    pp:"gone",
    ing:"going"
  },
  eat:{
    past:"ate",
    pp:"eaten",
    ing:"eating"
  }
};
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
    state.folders =
      data.folders || {};
    state.currentFolder =
      data.currentFolder || "";
    if (
      state.currentFolder &&
      state.folders[state.currentFolder]
    ) {
      state.words =
        state.folders[state.currentFolder];
    }
  } catch(e) {
    console.error(e);
  }
}
async function fetchWord(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const entry = data[0];
    const meanings = [];
    entry.meanings?.forEach(m => {
      const pos =
        m.partOfSpeech || "";
      m.definitions?.forEach(d => {
        meanings.push(
          `(${pos}) ${d.definition}`
        );
      });
    });
    const audio =
      entry.phonetics?.find(
        p => p.audio
      )?.audio || "";
    return {
      word,
      ipa:
        entry.phonetic ||
        entry.phonetics?.[0]?.text ||
        "",
      meaning:
        meanings.join("<br>"),
      example:
        entry.meanings?.[0]
        ?.definitions?.[0]
        ?.example || "",
      audio
    };
  } catch {
    return null;
  }
}
function getVerbForms(word) {
  const v =
    irregularVerbs[
      word.toLowerCase()
    ];
  if (v) {
    return `${word}-${v.past}-${v.pp}-${v.ing}`;
  }
  return `${word}-${word}ed-${word}ed-${word}ing`;
}
function createFolder() {
  const input =
    document.getElementById(
      "folderName"
    );
  const name =
    input.value.trim();
  if (!name) return;
  if (!state.folders[name]) {
    state.folders[name] = [];
  }
  state.currentFolder = name;
  state.words =
    state.folders[name];
  state.index = 0;
  input.value = "";
  save();
  renderFolders();
  renderCard();
}
function deleteFolder() {
  if (!state.currentFolder)
    return;
  delete state.folders[
    state.currentFolder
  ];
  const keys =
    Object.keys(
      state.folders
    );
  if (keys.length) {
    state.currentFolder =
      keys[0];
    state.words =
      state.folders[
        keys[0]
      ];
  } else {
    state.currentFolder = "";
    state.words = [];
  }
  state.index = 0;
  save();
  renderFolders();
  renderCard();
}

async function addWord() {
  const input =
    document.getElementById(
      "wordInput"
    );
  const word =
    input.value
    .trim()
    .toLowerCase();
  if (!word) return;
  if (!state.currentFolder) {
    alert(
      "Create a folder first"
    );
    return;
  }
  const data =
    await fetchWord(word);
  if (!data) {
    alert(
      "Word not found"
    );
    return;
  }
  state.words.push(data);
  state.folders[
    state.currentFolder
  ] = state.words;
  state.index =
    state.words.length - 1;
  state.flipped = false;
  input.value = "";
  save();
  renderCard();
}
function renderFolders() {
  const select =
    document.getElementById(
      "folderSelect"
    );
  select.innerHTML = "";
  Object.keys(
    state.folders
  ).forEach(name => {
    const option =
      document.createElement(
        "option"
      );
    option.value = name;
    option.textContent = name;
    select.appendChild(
      option
    );
  });
  if (
    state.currentFolder
  ) {
    select.value =
      state.currentFolder;
  }
}
function switchFolder(e) {
  state.currentFolder =
    e.target.value;
  state.words =
    state.folders[
      state.currentFolder
    ] || [];
  state.index = 0;
  state.flipped = false;
  save();
  renderCard();
}
function renderCard() {
  const front =
    document.getElementById(
      "front"
    );
  const back =
    document.getElementById(
      "back"
    );
  const card =
    state.words[
      state.index
    ];
  if (!card) {
    front.textContent =
      "NO WORD";
    document
      .getElementById(
        "typingMeaning"
      )
      .textContent =
      "No Word";
    return;
  }
  front.textContent =
    card.word;
  document
    .getElementById(
      "meaning"
    )
    .innerHTML =
    card.meaning;
  document
    .getElementById(
      "ipa"
    )
    .textContent =
    card.ipa;
  document
    .getElementById(
      "verbForms"
    )
    .textContent =
    getVerbForms(
      card.word
    );
  document
    .getElementById(
      "example"
    )
    .textContent =
    card.example || "";
  document
    .getElementById(
      "typingMeaning"
    )
    .innerHTML =
    card.meaning;
  front.classList.toggle(
    "hidden",
    state.flipped
  );
  back.classList.toggle(
    "hidden",
    !state.flipped
  );
}
function flipCard() {
  if (
    !state.words.length
  ) return;
  state.flipped =
    !state.flipped;
  renderCard();
}
function nextCard() {
  if (
    state.index <
    state.words.length - 1
  ) {
    state.index++;
  }
  state.flipped = false;
  renderCard();
}
function prevCard() {
  if (
    state.index > 0
  ) {
    state.index--;
  }
  state.flipped = false;
  renderCard();
}
function speakUS() {
  const card =
    state.words[
      state.index
    ];
  if (!card) return;
  speechSynthesis.cancel();
  const utter =
    new SpeechSynthesisUtterance(
      card.word
    );
  utter.lang =
    "en-US";
  speechSynthesis.speak(
    utter
  );
}
function speakUK() {
  const card =
    state.words[
      state.index
    ];
  if (!card) return;
  speechSynthesis.cancel();
  const utter =
    new SpeechSynthesisUtterance(
      card.word
    );
  utter.lang =
    "en-GB";
  speechSynthesis.speak(
    utter
  );
}
function checkTyping() {
  const card =
    state.words[
      state.index
    ];
  if (!card) return;
  const answer =
    document
    .getElementById(
      "typingInput"
    )
    .value
    .trim()
    .toLowerCase();
  if (
    answer ===
    card.word
      .toLowerCase()
  ) {
    alert(
      "Correct"
    );
    document
      .getElementById(
        "typingInput"
      )
      .value = "";
    nextCard();
  } else {
    alert(
      `Wrong : ${card.word}`
    );
  }
}
function bind() {
  document
  .getElementById(
    "createFolderBtn"
  )
  .onclick =
  createFolder;
  document
  .getElementById(
    "deleteFolderBtn"
  )
  .onclick =
  deleteFolder;
  document
  .getElementById(
    "addWordBtn"
  )
  .onclick =
  addWord;
  document
  .getElementById(
    "folderSelect"
  )
  .onchange =
  switchFolder;
  document
  .getElementById(
    "card"
  )
  .onclick =
  flipCard;
  document
  .getElementById(
    "nextBtn"
  )
  .onclick =
  nextCard;
  document
  .getElementById(
    "prevBtn"
  )
  .onclick =
  prevCard;
  document
  .getElementById(
    "speakUS"
  )
  .onclick =
  speakUS;
  document
  .getElementById(
    "speakUK"
  )
  .onclick =
  speakUK;
  document
  .getElementById(
    "checkBtn"
  )
  .onclick =
  checkTyping;
  [
    "folderName",
    "wordInput",
    "typingInput"
  ].forEach(id => {
    const el =
      document
      .getElementById(id);
    if (!el) return;
    el.addEventListener(
      "keydown",
      e => {
      if (
        e.key !==
        "Enter"
      ) return;
      e.preventDefault();
      if (
        id ===
        "folderName"
      )
        createFolder();
      if (
        id ===
        "wordInput"
      )
        addWord();
      if (
        id ===
        "typingInput"
      )
        checkTyping();
    });
  });
}
load();
bind();
renderFolders();
renderCard();
