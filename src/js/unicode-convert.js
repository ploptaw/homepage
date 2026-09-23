const MAX_LENGTH = 2000;

// data-mode ごとの変換関数
const CONVERTERS = {
  escape: (text) =>
    text.replace(
      /[^\x00-\x7F]/g,
      (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0"),
    ),
  unescape: (text) =>
    text.replace(/\\u([\da-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    ),
  section: (text) => text.replace(/§/g, "&"),
};

document.querySelectorAll(".converter").forEach((section) => {
  const input = section.querySelector("textarea");
  const button = section.querySelector(".run");
  const output = section.querySelector(".result");
  const convert = CONVERTERS[section.dataset.mode];

  button.addEventListener("click", () =>
    updateOutput(output, input.value, convert),
  );

  // Enter で変換 / Shift+Enter で改行
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      button.click();
    }
  });
});

function updateOutput(container, input, convert) {
  // 変換前の入力に対して文字数制限をチェック
  if (input.length > MAX_LENGTH) {
    container.textContent = `エラー: 変換できる文字数は${MAX_LENGTH}文字までです。`;
    return;
  }

  const text = convert(input);
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.className = "input";
  textarea.readOnly = true;

  const copyBtn = createButton("コピー", async () => {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "コピーしました";
    setTimeout(() => (copyBtn.textContent = "コピー"), 1500);
  });
  const clearBtn = createButton("クリア", () => container.replaceChildren());

  container.replaceChildren(textarea, copyBtn, clearBtn);
}

function createButton(text, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", handler);
  return button;
}
