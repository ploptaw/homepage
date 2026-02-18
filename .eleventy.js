const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const eleventyPluginFilesMinifier = require("@codestitchofficial/eleventy-plugin-minify");
const lightningcss = require("lightningcss");
const fs = require("fs");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy({ "./src/public": "/" });
  eleventyConfig.addPassthroughCopy("./src/js/*.min.js");

  // CSS ビルド（lightningcss: nesting transpile + minify）
  eleventyConfig.on("eleventy.before", () => {
    const { code } = lightningcss.transform({
      filename: "src/style.css",
      code: fs.readFileSync("./src/style.css"),
      minify: true,
      sourceMap: false,
      targets: {
        chrome: 80 << 16,
        firefox: 78 << 16,
        safari: 14 << 16,
        edge: 80 << 16,
      },
    });
    fs.writeFileSync("./src/public/style.min.css", code);
  });

  // style.css の変更で自動リビルド
  eleventyConfig.addWatchTarget("./src/style.css");

  // シンタックスハイライト（@11ty公式 / Prism.js ベース）
  // 例: https://unpkg.com/prismjs@1.29.0/themes/prism-tomorrow.min.css
  eleventyConfig.addPlugin(syntaxHighlight);

  // HTML / CSS / JS ミニファイ
  eleventyConfig.addPlugin(eleventyPluginFilesMinifier);

  // ギャラリー（JSONから直接読み込み）
  eleventyConfig.addCollection("gallery", () =>
    require("./src/content/gallery_list/list.json")
  );

  // 記事
  eleventyConfig.addCollection("articles", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/post/article/**/*.md")
      .map((item) => {
        item.data.permalink = `post/articles/${item.fileSlug}/index.html`;
        return item;
      })
  );

  // ツール
  eleventyConfig.addCollection("tools", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/post/tool/**/*.html")
      .map((item) => {
        item.data.permalink = `post/tool/${item.fileSlug}/index.html`;
        return item;
      })
  );

  // タグ一覧
  eleventyConfig.addCollection("tags", (collectionApi) => {
    const tagSet = new Set();
    collectionApi.getAll().forEach((item) => {
      const tags = item.data.tags;
      if (Array.isArray(tags)) {
        tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return [...tagSet];
  });

  // 日本語フル表示: 2025年2月19日
  eleventyConfig.addFilter(
    "dateJP",
    (target) =>
      `${target.getFullYear()}年${target.getMonth() + 1}月${target.getDate()}日`
  );

  // 年月のみ表示: 2025年2月
  eleventyConfig.addFilter(
    "dateMIN",
    (target) => `${target.getFullYear()}年${target.getMonth() + 1}月`
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