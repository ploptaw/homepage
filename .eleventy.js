const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const lightningcss = require("lightningcss");
const { minify } = require("terser");
const fs = require("fs");

const LCSS_TARGETS = {
  chrome: 80 << 16,
  firefox: 78 << 16,
  safari: 14 << 16,
  edge: 80 << 16,
};

// src/css/*.css と src/js/*.js を圧縮してメモリに保持し、
// ショートコードで各ページに必要な分だけインライン展開する（追加リクエスト 0）
const assets = { css: {}, js: {} };
const sources = (dir, ext) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => [f.slice(0, -ext.length), `${dir}/${f}`]);

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/images/*.webp");
  eleventyConfig.addPassthroughCopy({ "./src/public": "/" });

  eleventyConfig.on("eleventy.before", async () => {
    // CSS: lightningcss（nesting transpile + minify）
    for (const [name, file] of sources("./src/css", ".css")) {
      assets.css[name] = lightningcss
        .transform({
          filename: file,
          code: fs.readFileSync(file),
          minify: true,
          targets: LCSS_TARGETS,
        })
        .code.toString();
    }
    // JS: terser
    for (const [name, file] of sources("./src/js", ".js")) {
      ({ code: assets.js[name] } = await minify(fs.readFileSync(file, "utf8")));
    }
  });

  // {% css "base", "tool" %} / {% js "lottery" %}
  eleventyConfig.addShortcode("css", (...names) =>
    names.map((n) => assets.css[n]).join(""),
  );
  eleventyConfig.addShortcode("js", (name) => assets.js[name]);

  // HTML minify（<pre>/<script>/<style> 内は保護）
  eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
    if (!outputPath?.endsWith(".html")) return content;
    const preserved = [];
    let out = content.replace(
      /<(pre|script|style|textarea)[\s\S]*?<\/\1>/gi,
      (m) => { preserved.push(m); return `\x00${preserved.length - 1}\x00`; }
    );
    out = out
      .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/> </g, "><")
      .trim();
    return out.replace(/\x00(\d+)\x00/g, (_, i) => preserved[+i]);
  });

  // CSS / JS の変更で自動リビルド
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./src/js/");

  // シンタックスハイライト（@11ty公式 / Prism.js ベース、配色は src/css/prism.css）
  eleventyConfig.addPlugin(syntaxHighlight);

  // 記事・ツール（layout は各ディレクトリの *.11tydata.json で指定）
  eleventyConfig.addCollection("articles", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/post/article/*.md"),
  );
  eleventyConfig.addCollection("tools", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/post/tool/*.html"),
  );

  // タグ一覧
  eleventyConfig.addCollection("tags", (collectionApi) => [
    ...new Set(collectionApi.getAll().flatMap((item) => item.data.tags ?? [])),
  ]);

  // 日本語フル表示: 2025年2月19日
  eleventyConfig.addFilter(
    "dateJP",
    (target) =>
      `${target.getFullYear()}年${target.getMonth() + 1}月${target.getDate()}日`,
  );

  // ドット区切り: 2025.02.19
  const pad = (n) => String(n).padStart(2, "0");
  eleventyConfig.addFilter(
    "dateDot",
    (target) =>
      `${target.getFullYear()}.${pad(target.getMonth() + 1)}.${pad(target.getDate())}`,
  );

  // datetime 属性用: 2025-02-19
  eleventyConfig.addFilter("dateISO", (target) =>
    target.toISOString().slice(0, 10),
  );


  return {
    dir: {
      input: "src",
      output: "docs",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
