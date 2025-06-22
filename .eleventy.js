const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-js");
const htmlmin = require("html-minifier");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItContainer = require("markdown-it-container");

module.exports = function (eleventyConfig) {
  // Plugin
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Merge data
  eleventyConfig.setDataDeepMerge(true);

  // Collection authors
  eleventyConfig.addCollection("authors", collection => {
    const blogs = collection.getFilteredByGlob("posts/*.md");
    return blogs.reduce((coll, post) => {
      const author = post.data.author;
      if (!author) return coll;
      if (!coll.hasOwnProperty(author)) coll[author] = [];
      coll[author].push(post.data);
      return coll;
    }, {});
  });

  // Filters
  eleventyConfig.addFilter("readableDate", dateObj => DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy"));
  eleventyConfig.addFilter("machineDate", dateObj => DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd"));
  eleventyConfig.addFilter("cssmin", code => new CleanCSS({}).minify(code).styles);
  eleventyConfig.addFilter("jsmin", code => {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log("UglifyJS error:", minified.error);
      return code;
    }
    return minified.code;
  });

  // HTML minify
  eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
    if (outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
    }
    return content;
  });

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("static/img");
  eleventyConfig.addPassthroughCopy("admin/");
  eleventyConfig.addPassthroughCopy("assets/");
  eleventyConfig.addPassthroughCopy("_includes/assets/css/inline.css");

  // Markdown config
  const options = {
    html: true,
    breaks: true,
    linkify: true
  };

  const mdLib = markdownIt(options)
    .use(markdownItAnchor, { permalink: false })
    .use(markdownItContainer, "slider", {
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          const contentTokens = [];

          for (let i = idx + 1; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === "container_slider_close") break;

            if (t.type === "inline") {
              contentTokens.push(...t.children);
              t.children = [];
            }

            if (t.type === "paragraph_open" || t.type === "paragraph_close") {
              t.type = "text";
              t.tag = "";
              t.content = "";
              t.hidden = true;
            }
          }

          const images = contentTokens
            .filter(t => t.type === "image")
            .map(t =>
              `<div class="bg-home-80" style="background: url('${t.attrGet("src")}') no-repeat center center / cover;"></div>`
            )
            .join("\n");

          return `<div class="container-fluid px-0 mt-5 pt-md-4">
                  <div class="slider single-item bg-home-custom slider-pc">
                ${images}
                `;
        } else {
          return `  </div>\n</div>\n`;
        }
      }
    })
    eleventyConfig.addShortcode("cardproducts", function (input) {
      const items = input.split(",").map(p => {
        const [image, title, link] = p.split("|").map(s => s.trim());
        return `<div class="col-lg-3 col-md-6 col-6 mt-4 pt-2">
          <div class="card blog rounded border-0 shadow-lg">
            <a href="${link}">
              <div class="position-relative">
                <img src="${image}" class="card-img-top rounded-top" alt="${title}">
                <div class="overlay rounded-top bg-dark"></div>
              </div>
            </a>
            <div class="card-body content p-2 p-lg-4">
              <h5 class="text-center">
                <a href="${link}" class="card-title title text-dark">${title}</a>
              </h5>
            </div>
          </div>
        </div>`;
      }).join("\n");
    
      return `<section class="d-table w-100 mt-4 mb-5" id="home">
      <div class="container">
        <div class="row">
          ${items}
        </div>
      </div>
    </section>`;
    });
        
  eleventyConfig.setLibrary("md", mdLib);

  return {
    templateFormats: ["md", "njk", "liquid"],
    pathPrefix: "/",
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
