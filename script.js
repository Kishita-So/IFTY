const state = {
  folders: {},
  currentFolder: "default",
  words: [],
  index: 0,
  flipped: false
};

/* =========================
   INIT（即実行）
========================= */

load();

if(!state.folders["default"]){
  state.folders["default"] = [];
}

state.currentFolder = "default";
state.words = state.folders["default"];

bind();
render();

/* =========================
   DOM
========================= */

function el(id){
  return document.getElementById(id);
}

/* =========================
   BIND
========================= */

function bind(){

  el("createFolderBtn").onclick = createFolder;
  el("generateBtn").onclick = generate;

  el("nextBtn").onclick = next;
  el("prevBtn").onclick = prev;

  el("typingBtn").onclick = check;

  el("usBtn").onclick = () => speak("en-US");
  el("ukBtn").onclick = () => speak("en-GB");

  el("deleteCurrentBtn").onclick = deleteCurrent;
  el("deleteWordBtn").onclick = deleteByWord;
  el("clearAllBtn").onclick = clearAll;

  el("folderSelect").onchange = changeFolder;

  /* ENTER確実 */
  window.onkeydown = (e) => {
    if(e.key === "Enter") check();
  };

  window.flipCard = flipCard;
}

/* =========================
   FOLDER
========================= */

function createFolder(){
  const name = el("folderInput").value;
  if(!name) return;

  state.folders[name] = [];
  state.currentFolder = name;

  updateFolders();
  save();
  render();
}

function updateFolders(){
  const sel = el("folderSelect");
  sel.innerHTML = "";

  Object.keys(state.folders).forEach(f=>{
    const o = document.createElement("option");
    o.value = f;
    o.textContent = f;
    sel.appendChild(o);
  });

  sel.value = state.currentFolder;
}

/* =========================
   AI（安全版）
========================= */

async function generate(){
  const word = el("wordInput").value;
  if(!word) return;

  const ai = await fakeAI(word);

  const obj = {
    word,
    meaning: ai.meaning,
    example: ai.example
  };

  state.words.push(obj);
  state.folders[state.currentFolder] = state.words;

  save();
  render();
}

/* テスト用（まず動作確認優先） */
async function fakeAI(word){
  return {
    meaning: word + " の意味",
    example: "This is an example with " + word
  };
}

/* =========================
   RENDER（超重要）
========================= */

function render(){
  const w = state.words[state.index];

  if(!w){
    el("front").innerText = "No word";
    el("back").innerText = "";
    return;
  }

  el("front").innerText = w.word;

  el("back").innerText =
`${w.meaning}

${w.example}`;

  el("back").style.display = state.flipped ? "block" : "none";
}

/* =========================
   CARD
========================= */

function flipCard(){
  state.flipped = !state.flipped;
  render();
}

/* =========================
   NAV
========================= */

function next(){
  if(state.index < state.words.length-1) state.index++;
  render();
}

function prev(){
  if(state.index > 0) state.index--;
  render();
}

/* =========================
   TYPING
========================= */

function check(){
  const v = el("typingInput").value;
  const w = state.words[state.index];

  if(!w) return;

  if(v === w.word){
    state.index++;
    el("typingInput").value = "";
  } else {
    alert("NG");
  }

  render();
}

/* =========================
   AUDIO
========================= */

function speak(lang){
  const w = state.words[state.index];
  if(!w) return;

  const u = new SpeechSynthesisUtterance(w.word);
  u.lang = lang;
  speechSynthesis.speak(u);
}

/* =========================
   DELETE
========================= */

function deleteCurrent(){
  state.words.splice(state.index,1);
  state.index = 0;
  save();
  render();
}

function deleteByWord(){
  const v = el("deleteWordInput").value.toLowerCase();

  state.words = state.words.filter(
    w => w.word.toLowerCase() !== v
  );

  state.index = 0;
  save();
  render();
}

function clearAll(){
  if(!confirm("全削除？")) return;

  state.words = [];
  state.index = 0;
  save();
  render();
}

/* =========================
   STORAGE
========================= */

function save(){
  localStorage.setItem("ifty", JSON.stringify(state.folders));
}

function load(){
  const d = localStorage.getItem("ifty");
  if(d) state.folders = JSON.parse(d);
}