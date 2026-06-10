document.getElementById("parseButton").addEventListener("click", handleParse);

function handleParse() {
  const input = document.getElementById("nbt-input").value.trim();
  const result = parseNBT(input);
  const wrap = document.getElementById("output-wrap");
  const errorEl = document.getElementById("output-error");

  if (!result) {
    wrap.classList.remove("visible");
    errorEl.style.display = "block";
    errorEl.textContent = "display セクションが見つかりませんでした。";
    return;
  }

  errorEl.style.display = "none";
  wrap.classList.add("visible");

  const plainLines = [];
  const nbtLines = [];

  if (result.name !== null) {
    plainLines.push(result.name);
    nbtLines.push(`nbt.display.Name=${result.name}`);
  }

  for (let i = 0; i < result.loreLines.length; i++) {
    const line = result.loreLines[i];
    plainLines.push(line);
    if (line !== "") nbtLines.push(`nbt.display.Lore.${i}=${line}`);
  }

  document.getElementById("output-plain").textContent = plainLines.join("\n");
  document.getElementById("output-nbt").textContent = nbtLines.join("\n");
}

function parseNBT(input) {
  let snbt = input;
  const firstNewline = input.indexOf("\n");
  if (firstNewline !== -1 && !input.trimStart().startsWith("{")) {
    snbt = input.slice(firstNewline + 1).trim();
  }

  const displayBlock = extractDisplayBlock(snbt);
  if (!displayBlock) return null;

  const nameJson = extractSingleQuotedValue(displayBlock, "Name");
  const loreJsons = extractLoreArray(displayBlock);

  return {
    name: nameJson !== null ? extractPlainText(nameJson) : null,
    loreLines: loreJsons.map(extractPlainText),
  };
}

function extractPlainText(jsonStr) {
  try {
    const obj = JSON.parse(jsonStr);
    let text = obj.text || "";
    if (obj.extra) {
      for (const comp of obj.extra) text += comp.text || "";
    }
    return text;
  } catch {
    return jsonStr;
  }
}

function extractDisplayBlock(snbt) {
  const idx = snbt.indexOf("display:{");
  if (idx === -1) return null;
  return extractBlock(snbt, idx + "display:".length);
}

function extractBlock(str, start) {
  const open = str[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;

  for (let i = start; i < str.length; i++) {
    const c = str[i];
    if (inSingle) {
      if (c === "\\") i++;
      else if (c === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (c === "\\") i++;
      else if (c === '"') inDouble = false;
      continue;
    }
    if (c === "'") inSingle = true;
    else if (c === '"') inDouble = true;
    else if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return str.substring(start, i + 1);
    }
  }
  return null;
}

function extractSingleQuotedValue(str, key) {
  const marker = key + ":'";
  const idx = str.indexOf(marker);
  if (idx === -1) return null;

  let i = idx + marker.length;
  let result = "";
  while (i < str.length) {
    if (str[i] === "\\") {
      result += str[i + 1];
      i += 2;
    } else if (str[i] === "'") {
      return result;
    } else {
      result += str[i++];
    }
  }
  return null;
}

function extractLoreArray(displayBlock) {
  const idx = displayBlock.indexOf("Lore:[");
  if (idx === -1) return [];

  const arrayStr = extractBlock(displayBlock, idx + "Lore:".length);
  if (!arrayStr) return [];

  const items = [];
  let i = 1;
  while (i < arrayStr.length - 1) {
    if (arrayStr[i] === "'") {
      i++;
      let item = "";
      while (i < arrayStr.length) {
        if (arrayStr[i] === "\\") {
          item += arrayStr[i + 1];
          i += 2;
        } else if (arrayStr[i] === "'") {
          items.push(item);
          i++;
          break;
        } else {
          item += arrayStr[i++];
        }
      }
    } else {
      i++;
    }
  }
  return items;
}
