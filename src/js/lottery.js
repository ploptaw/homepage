document.getElementById("drawButton").addEventListener("click", handleDraw);

function handleDraw() {
  const numN = parseInt(document.getElementById("numN").value, 10);
  const numX = parseInt(document.getElementById("numX").value, 10);
  const allowDup = document.getElementById("allowDup").checked;

  if (!isValidInput(numN, numX, allowDup)) {
    displayMessage(
      allowDup
        ? "無効な入力です。1〜100 の範囲で正しい数を入力してください。"
        : "無効な入力です。選択数は母数以下にしてください。",
      true,
    );
    return;
  }

  const result = allowDup ? drawWithDup(numN, numX) : drawLottery(numN, numX);
  displayMessage(`選ばれた番号: ${result.join(", ")}`);
}

function isValidInput(N, X, allowDup) {
  return (
    Number.isInteger(N) &&
    Number.isInteger(X) &&
    N >= 1 &&
    N <= 100 &&
    X >= 1 &&
    X <= 100 &&
    (allowDup || X <= N)
  );
}

// シャッフル → 先頭 X 個を返す（重複なし）
function drawLottery(N, X) {
  const arr = Array.from({ length: N }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, X);
}

// 重複あり
function drawWithDup(N, X) {
  return Array.from({ length: X }, () => Math.floor(Math.random() * N) + 1);
}

function displayMessage(message, isError = false) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerText = message;
  resultDiv.style.color = isError ? "red" : "";
}
