const localDictionary = {
  run: {
    meaning: "走る／経営する",
    ipa: "/rʌn/",
    example: "He runs every morning."
  }
};

// 無料辞書API（キー不要）
async function fetchFreeDictionary(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) return null;

    const data = await res.json();
    const entry = data[0];

    return {
      meaning: entry.meanings?.[0]?.definitions?.[0]?.definition || "No definition",
      ipa: entry.phonetic || "",
      example: entry.meanings?.[0]?.definitions?.[0]?.example || ""
    };

  } catch (e) {
    return null;
  }
}

// 最終フォールバック（単語分解用）
function fallbackAnalyze(word) {
  return {
    meaning: "No data found (fallback mode)",
    ipa: "",
    example: `Try breaking "${word}" into parts`
  };
}

// メイン処理
async function searchWord() {
  const word = document.getElementById("wordInput").value.trim().toLowerCase();
  const resultDiv = document.getElementById("result");

  if (!word) {
    resultDiv.innerHTML = "Enter a word";
    return;
  }

  resultDiv.innerHTML = "Loading...";

  let data = await fetchFreeDictionary(word);

  if (!data) {
    data = localDictionary[word];
  }

  if (!data) {
    data = fallbackAnalyze(word);
  }

  render(data, word);
}

// 表示
function render(data, word) {
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = `
    <h2>${word}</h2>
    <p><b>Meaning:</b> ${data.meaning}</p>
    <p><b>IPA:</b> ${data.ipa}</p>
    <p><b>Example:</b> ${data.example}</p>
  `;
}
