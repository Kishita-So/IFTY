const createBtn = document.getElementById("createBtn");
const deckNameInput = document.getElementById("deckName");
const decksContainer = document.getElementById("decksContainer");

let decks = JSON.parse(localStorage.getItem("decks")) || [];

renderDecks();

createBtn.addEventListener("click", () => {
    const name = deckNameInput.value.trim();

    if (name === "") {
        alert("単語帳名を入力してください");
        return;
    }

    const deck = {
        id: Date.now(),
        name: name,
        words: []
    };

    decks.push(deck);

    localStorage.setItem(
        "decks",
        JSON.stringify(decks)
    );

    deckNameInput.value = "";

    renderDecks();
});

function renderDecks() {
    decksContainer.innerHTML = "";

    decks.forEach(deck => {
        const card = document.createElement("div");

        card.classList.add("deck-card");

        card.innerHTML = `
            <h3>${deck.name}</h3>
            <p>単語数: ${deck.words.length}</p>
        `;

        decksContainer.appendChild(card);
    });
}
