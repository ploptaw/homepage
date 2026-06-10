document.addEventListener("DOMContentLoaded", setupHandlers);

function setupHandlers() {
  const inputText = document.getElementById("input-text");
  const inputUnicode = document.getElementById("input-unicode");
  const sectionText = document.getElementById("section-text");
  const outputDiv = document.getElementById("output");
  const outputUnicodeDiv = document.getElementById("output-unicode");
  const resultDiv = document.getElementById("result");

  setupEnterHandlers([
    { textarea: inputText, buttonClass: ".convert-button" },
    { textarea: inputUnicode, buttonClass: ".reverse-button" },
    { textarea: sectionText, buttonClass: ".convert-andbutton" },
  ]);

  // ボタンの設定 (§ -> &はここで処理)
  setupButtonHandlers([
    {
      buttonClass: ".convert-button",
      handler: () => updateOutput(outputDiv, inputText.value, escapeText),
    },
    {
      buttonClass: ".reverse-button",
      handler: () =>
        updateOutput(outputUnicodeDiv, inputUnicode.value, unescapeText),
    },
    {
      buttonClass: ".convert-andbutton",
      handler: () =>
        updateOutput(resultDiv, sectionText.value, (text) =>
          text.replace(/§/g, "&")
        ),
    },
  ]);
}

// Enter キーのハンドラ
function setupEnterHandlers(handlers) {
  handlers.forEach(({ textarea, buttonClass }) => {
    const button = document.querySelector(buttonClass);
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        button.click();
      }
    });
  });
}

// ボタンのハンドラ
function setupButtonHandlers(handlers) {
  handlers.forEach(({ buttonClass, handler }) => {
    document.querySelector(buttonClass).addEventListener("click", handler);
  });
}

// 出力欄
function updateOutput(container, input, convert) {
  // 変換前の入力に対して文字数制限をチェック
  if (input.length > 2000) {
    container.textContent = "エラー: 変換できる文字数は2000文字までです。";
    return;
  }

  const text = convert(input);
  container.textContent = "";

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.classList.add("input");
  container.appendChild(textarea);

  // コピー機能
  const copyBtn = createButton("コピー", () =>
    navigator.clipboard.writeText(text)
  );
  copyBtn.classList.add("button");
  container.appendChild(copyBtn);

  // クリア機能
  const clearBtn = createButton("クリア", () => (container.textContent = ""));
  clearBtn.classList.add("button");
  container.appendChild(clearBtn);
}

function createButton(text, handler) {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", handler);
  return button;
}

// 変換関数
function escapeText(text) {
  return text.replace(
    /[^\x00-\x7F]/g,
    (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")
  );
}

// 逆変換関数
function unescapeText(text) {
  return text.replace(/\\u([\da-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}
