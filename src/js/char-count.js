const input = document.getElementById("count-input");
const clearButton = document.getElementById("clearButton");
const outputs = Object.fromEntries(
  [...document.querySelectorAll("[data-stat]")].map((el) => [
    el.dataset.stat,
    el,
  ]),
);

// 絵文字や結合文字を 1 文字として数える
const graphemes =
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("ja", { granularity: "grapheme" })
    : null;
const encoder = new TextEncoder();

function countChars(text) {
  if (!graphemes) return [...text].length;
  let n = 0;
  for (const _ of graphemes.segment(text)) n++;
  return n;
}

function stats(text) {
  const normalized = text.replace(/\r\n?/g, "\n");
  return {
    chars: countChars(normalized),
    noSpace: countChars(normalized.replace(/\s/g, "")),
    lines: normalized === "" ? 0 : normalized.split("\n").length,
    bytes: encoder.encode(normalized).length,
  };
}

function update() {
  for (const [key, value] of Object.entries(stats(input.value))) {
    outputs[key].textContent = value.toLocaleString();
  }
}

input.addEventListener("input", update);
clearButton.addEventListener("click", () => {
  input.value = "";
  update();
  input.focus();
});
update();

// 整形
const formatButton = document.getElementById("formatButton");
const undoButton = document.getElementById("undoButton");
const formatResult = document.getElementById("format-result");
let previousText = null;

function toHalfwidthAlnum(text) {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  );
}

function toFullwidthAlnum(text) {
  return text.replace(/[A-Za-z0-9]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 0xfee0),
  );
}

function unifyPunct(text, [comma, period]) {
  return text.replace(/[、，]/g, comma).replace(/[。．]/g, period);
}

formatButton.addEventListener("click", () => {
  const before = input.value.replace(/\r\n?/g, "\n");
  let text = before;
  const option = (name) =>
    document.querySelector(`input[name="${name}"]:checked`).value;
  const punct = option("punct");
  const alnum = option("alnum");
  if (alnum === "half") text = toHalfwidthAlnum(text);
  if (alnum === "full") text = toFullwidthAlnum(text);
  if (punct) text = unifyPunct(text, punct);

  if (text === before) {
    formatResult.textContent = "変更はありません";
    return;
  }
  previousText = input.value;
  input.value = text;
  undoButton.disabled = false;
  formatResult.textContent = "整形しました";
  update();
});

undoButton.addEventListener("click", () => {
  if (previousText === null) return;
  input.value = previousText;
  previousText = null;
  undoButton.disabled = true;
  formatResult.textContent = "";
  update();
});

// 手入力したら元に戻す対象を破棄
input.addEventListener("input", () => {
  previousText = null;
  undoButton.disabled = true;
  formatResult.textContent = "";
});
