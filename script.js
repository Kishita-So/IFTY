const foldersContainer =
document.getElementById("folders");

const createFolderBtn =
document.getElementById("createFolderBtn");

const folderNameInput =
document.getElementById("folderName");

let folders =
JSON.parse(localStorage.getItem("folders"))
|| [];

renderFolders();

createFolderBtn.addEventListener(
    "click",
    createFolder
);

folderNameInput.addEventListener(
    "keydown",
    e=>{
        if(e.key==="Enter"){
            createFolder();
        }
    }
);

function createFolder(){

    const name =
    folderNameInput.value.trim();

    if(!name) return;

    folders.push({
        id:Date.now(),
        name,
        words:[]
    });

    save();

    folderNameInput.value="";

    renderFolders();
}

function deleteFolder(id){

    folders =
    folders.filter(
        folder=>folder.id!==id
    );

    save();

    renderFolders();
}

async function addWord(
    folderId,
    word
){

    if(!word) return;

    try{

        const res =
        await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );

        const data =
        await res.json();

        const entry = data[0];

        const phonetic =
        entry.phonetic || "";

        const audio =
        entry.phonetics.find(
            p=>p.audio
        )?.audio || "";

        const meanings =
        entry.meanings
            .map(m=>
                `[${m.partOfSpeech}] ${
                    m.definitions[0]?.definition || ""
                }`
            )
            .join("<br>");

        const folder =
        folders.find(
            f=>f.id===folderId
        );

        folder.words.push({

            word,

            phonetic,

            meaning:meanings,

            audio,

            past:"?",
            pastParticiple:"?",
            presentParticiple:"?"

        });

        save();

        renderFolders();

    }catch(err){

        alert("単語取得失敗");

    }
}

function save(){

    localStorage.setItem(
        "folders",
        JSON.stringify(folders)
    );
}

function renderFolders(){

    foldersContainer.innerHTML="";

    folders.forEach(folder=>{

        const div =
        document.createElement("div");

        div.className="folder";

        div.innerHTML=`

        <div class="folder-header">

            <h2>📁 ${folder.name}</h2>

            <button
            onclick="deleteFolder(${folder.id})">
            🗑️
            </button>

        </div>

        <input
        class="wordInput"
        data-id="${folder.id}"
        placeholder="単語を入力してEnter">

        <div>

        ${folder.words.map(word=>`

            <div class="word-card">

                <div class="word">
                ${word.word}
                </div>

                <div class="phonetic">
                ${word.phonetic}
                </div>

                <div>
                ${word.word}
                -
                ${word.past}
                -
                ${word.pastParticiple}
                -
                ${word.presentParticiple}
                </div>

                <div>
                ${word.meaning}
                </div>

                ${
                    word.audio
                    ?
                    `<div class="audio-buttons">

                        <button
                        onclick="
                        new Audio(
                        '${word.audio}'
                        ).play()
                        ">
                        🔊 発音
                        </button>

                    </div>`
                    :
                    ""
                }

            </div>

        `).join("")}

        </div>
        `;

        foldersContainer.appendChild(div);
    });

    document
    .querySelectorAll(".wordInput")
    .forEach(input=>{

        input.addEventListener(
            "keydown",
            e=>{

                if(
                    e.key==="Enter"
                ){

                    addWord(
                        Number(
                            e.target.dataset.id
                        ),
                        e.target.value.trim()
                    );

                    e.target.value="";
                }
            }
        );
    });
}
