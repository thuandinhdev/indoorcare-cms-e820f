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

  eleventyConfig.addShortcode("clientlogos", function (jsonStr) {
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Invalid JSON passed to clientlogos:", jsonStr);
      return "";
    }
  
    const logosHtml = (data.logos || []).map(src => `<div class="media customer-brand m-2">
        <img src="${src}" class="avatar avatar-small mr-3 rounded shadow bg-white" alt="">
      </div>
    `).join("");
  
    return `<section class="py-4 bg-lighter">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-12 mt-4">
          <div class="section-title mb-2 pb-2 text-center">
            <h1 class="title font-weight-bold">${data.title || ""}</h1>
          </div>
          <div id="customer-brand" class="owl-carousel owl-theme">
            ${logosHtml}
          </div>
        </div>
      </div>
    </div>
  </section>`;
  });
  
  eleventyConfig.addShortcode("titlesection", function (input) {
    const [tag, title, description] = input.split("|").map(s => s.trim());
    return `
      <div class="container mt-100 mt-60">
        <div class="row justify-content-center">
          <div class="col-12 text-center">
            <div class="section-title mb-4 pb-2">
              <${tag || "h2"} class="lead text-muted font-weight-bold text-center">${description}</${tag}>
              <h2 class="display-4 font-weight-bold">${title}</h2>
            </div>
          </div>
        </div>
      </div>`;
  });
  
  eleventyConfig.addShortcode("image", function (input) {
    const [size, imagesRaw] = input.split("|").map(s => s.trim());
    const imgStyle = size === "large" ? "width: 100%;" : "width: 50%;";
    const images = (imagesRaw || "").split(",").filter(Boolean);
    if(size == "small"){
      return `
      ${images.map(img => `<section class="section">
            <div class="container">
                <div class="row d-flex justify-content-center">
                    <div class="col-lg-4 col-md-6 col-12 mt-4 pt-2">
                        <div class="card shop-list border-0 position-relative overflow-hidden">
                            <div class="shop-image  overflow-hidden rounded shadow">
                                <a href="javascript:void(0)"><img src="${img}" class="img-fluid" alt=""></a>
                                <a href="javascript:void(0)" class="overlay-work">
                                    <img src="${img}" class="img-fluid" alt="">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>`).join("")}`;
    } else {
      return `
        <div class="mb-4 mt-4">
          ${images.map(img => `<img src="${img}" alt="" class="img-fluid"/>`).join("")}
        </div>
      `;
    }
  });
eleventyConfig.addShortcode("imagetextgroup", function (input) {
  const firstSepIndex = input.indexOf("|");
  if (firstSepIndex === -1) return "";

  const size = input.substring(0, firstSepIndex).trim();
  const blocksRaw = input.substring(firstSepIndex + 1);

  const blocks = blocksRaw.split("@@").map(str => {
    const [image, title, ...descParts] = str.split("|").map(s => s.trim());
    return {
      image,
      title,
      description: descParts.join("|")
    };
  });

  // Tuỳ từng style xử lý
  if (size === "style1") {
    return `<section class="section pt-0">
      <div class="container">
        <div class="row mt-4 pt-2 justify-content-around">
          ${blocks.map(b => `
            <div class="col-md-1 col-6 mt-4 pt-2">
              <div class="counter-box text-center">
                <img src="${b.image}" class="avatar" alt="">
                <h5 class="counter-head text-muted mt-2">${b.title}</h5>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>`;
  }
  if (size === "style2") {
    return `
    ${blocks.map((b, i) => `
      <div class="container mt-100 mt-60">
          <div class="row align-items-center">
              <div class="col-lg-7 col-md-6 ${i % 2 === 0 ? 'order-md-1' : 'order-md-2'} order-2 mt-4 mt-sm-0 pt-2 pt-sm-0">
                  <div class="section-title mr-lg-5">
                      <h4 class="title mb-4">${b.title}</h4>
                      <p class="text-muted">${b.description}</p>
                  </div>
              </div>

              <div class="col-lg-5 col-md-6 order-1 ${i % 2 === 0 ? 'order-md-2' : 'order-md-1'} text-center">
                  <img src="${b.image}" alt="">
              </div>
          </div>
      </div>
      `).join("")}`;
  }

  if (size === "style3") {
    return `
      <div class="container mb-5 pb-5">
          <div class="row">
            ${blocks.map((b, i) => `
              <div class="col-lg-3 col-md-6 col-6 mt-4 pt-2 text-center">
                  <h6 class="lead font-weight-bold small">${b.title}</h6>
                  <p class="text-muted small">${b.description}</p>
                  <div class="card rounded border-0 shadow-lg">
                      <div class="position-relative">
                          <img src="${b.image}" class="card-img-top rounded-top" alt="...">
                          <div class="overlay rounded-top bg-dark"></div>
                      </div>
                  </div>
              </div>
            `).join("")}
          </div>
      </div>`;
  }

  if (size === "style4") {
    return `
    <div class="container pb-lg-4 mb-md-5 mb-4 mt-60">
        <div class="row justify-content-center">
        ${blocks.map((b, i) => `
            <div class="col-12 text-center">
                <div class="section-title">
                    <p class="text-muted mx-auto mb-0 font-weight-bold">${b.title}</p>
                </div>
                <div class="mb-4 mt-4">
                    <img src="${b.image}" alt="" class="img-fluid">
                </div>
            </div>
            `).join("")}
        </div>
    </div>`;
  }

  // Default render cho các style khác
  return `
    <div class="image-text-group ${size}">
      ${blocks.map(b => `
        <div class="block my-4">
          <img src="${b.image}" style="max-width: 100%; margin-bottom: 0.5rem;" />
          <h4>${b.title}</h4>
          <p>${b.description.replace(/\n/g, "<br>")}</p>
        </div>
      `).join("")}
    </div>
  `;
});

eleventyConfig.addShortcode("youtubeinfoblock", function (jsonStr) {
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Invalid JSON passed to youtubeinfoblock:", jsonStr);
    return "";
  }

  const youtubeEmbed = (data.youtube || "").replace("watch?v=", "embed/");

  return `
    <div class="rounded mt-4">
        <div class="row">
            <div class="container">
                <div class="row align-items-center">
                    <div class="embed-responsive embed-responsive-16by9 col-lg-6 col-md-6 col-12 mt-4 pt-2 rounded">
                        <iframe class="embed-responsive-item" src="${youtubeEmbed}" allowfullscreen></iframe>
                    </div>

                    <div class="col-lg-6 col-md-6 col-12 mt-4 pt-2">
                        <div class="section-title ml-lg-5">
                            <ul class="font-weight-bold">
                            ${(data.infos || []).map(i => `<li class="mb-0"><span class="text-primary h5 mr-2"><i class="uim uim-check-circle"></i></span>${i.info}</li>`).join("")}
                            </ul>
                            <div class="d-flex flex-row-reverse mt-2">
                                <a href="javascript:void(0)" class="btn btn-primary mr-5">XEM CHI TIẾT</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
});



  eleventyConfig.addShortcode("textsection", function (text) {
  return `
    <div class="container pb-lg-4 mb-md-5 mb-4 mt-60">
      <div class="row justify-content-center">
        <div class="col-8">
          <div class="section-title">
            ${text}
          </div>
        </div>
      </div>
    </div>`;
  });
  
  
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
