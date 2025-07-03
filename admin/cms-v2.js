window.CMS.registerEditorComponent({
  id: "slider",
  label: "Image Slider",
  fields: [
    {
      name: "images",
      label: "Slider Images",
      widget: "list",
      field: {
        label: "Image",
        name: "image",
        widget: "image"
      }
    }
  ],
  pattern: /^:::slider\s*\n([\s\S]*?)\n:::$/, // ✅ match markdown block
  fromBlock: function (match) {
    const imageMarkdown = match[1].trim().split("\n");
    const images = imageMarkdown.map(line => {
      const match = /!\[[^\]]*\]\((.*?)\)/.exec(line);
      return match ? match[1] : null;
    }).filter(Boolean);
    return { images };
  },
  toBlock: (obj) =>
    `:::slider\n${obj.images.map(url => `![](${url})`).join("\n")}\n:::`  
  ,
  toPreview: function (obj) {
    const items = obj.images
      .map(
        (img) =>
          `<div class="bg-home-80" style="background: url('${img}') no-repeat center center / cover; height: 300px;"></div>`
      )
      .join("\n");

    return `
      <div class="container-fluid px-0 mt-5 pt-md-4">
        <div class="slider single-item bg-home-custom slider-pc">
          ${items}
        </div>
      </div>
    `;
  }
});
window.CMS.registerEditorComponent({
  id: "cardproducts",
  label: "Product Cards",
  fields: [
    {
      name: "products",
      label: "Products",
      widget: "list",
      fields: [
        { name: "image", label: "Image", widget: "image" },
        { name: "title", label: "Title", widget: "string" },
        { name: "link", label: "Link", widget: "string", default: "javascript:void(0)" }
      ]
    }
  ],
  pattern: /{%\s*cardproducts\s*"(.+?)"\s*%}/,
  fromBlock(match) {
    const raw = match[1];
    const products = raw.split(",").map(p => {
      const [image, title, link] = p.split("|").map(s => s.trim());
      return { image, title, link };
    });
    return { products };
  },
  toBlock(obj) {
    const str = obj.products
      .map(p => `${p.image}|${p.title}|${p.link}`)
      .join(",");
    return `{% cardproducts "${str}" %}`;
  },
  toPreview(obj) {
    return `
<section class="d-table w-100 mt-4 mb-5" id="home">
  <div class="container">
    <div class="row">
      ${obj.products.map(p => `
        <div class="col-lg-3 col-md-6 col-6 mt-4 pt-2">
          <div class="card blog rounded border-0 shadow-lg">
            <a href="${p.link}">
              <div class="position-relative">
                <img src="${p.image}" class="card-img-top rounded-top" alt="${p.title}">
                <div class="overlay rounded-top bg-dark"></div>
              </div>
            </a>
            <div class="card-body content p-2 p-lg-4">
              <h5 class="text-center">
                <a href="${p.link}" class="card-title title text-dark">${p.title}</a>
              </h5>
            </div>
          </div>
        </div>`).join("")}
    </div>
  </div>
</section>`;
  }
});

window.CMS.registerEditorComponent({
  id: "clientlogos",
  label: "Client Logos",
  fields: [
    { name: "title", label: "Title", widget: "string" },
    {
      name: "logos",
      label: "Logos",
      widget: "list",
      field: { name: "image", label: "Image", widget: "image" }
    }
  ],
  pattern: /{%\s*clientlogos\s*'(.+?)'\s*%}/,
  fromBlock(match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      return { title: "", logos: [] };
    }
  },

  toBlock(obj) {
    return `{% clientlogos '${JSON.stringify(obj)}' %}`;
  },

  toPreview(obj) {
    return `<section class="py-4 bg-lighter">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-12 mt-4">
        <div class="section-title mb-2 pb-2 text-center">
          <h1 class="title font-weight-bold">${obj.title}</h1>
        </div>
        <div id="customer-brand" class="owl-carousel owl-theme">
          ${obj.logos.map(l => `
            <div class="media customer-brand m-2">
              <img src="${l.image}" class="avatar avatar-small mr-3 rounded shadow bg-white" alt="">
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  </div>
</section>`;
  }
});

window.CMS.registerEditorComponent({
  id: "titlesection",
  label: "Title Section",
  fields: [
    {
      name: "tag",
      label: "Heading Level",
      widget: "select",
      default: "h2",
      options: ["h2", "h3", "h4", "h5"]
    },
    {
      name: "title",
      label: "Title",
      widget: "string"
    },
    {
      name: "description",
      label: "Description",
      widget: "string"
    }
  ],
  pattern: /{%\s*titlesection\s*"(.+?)"\s*%}/,
  fromBlock(match) {
    const [tag, title, description] = match[1].split("|").map(s => s.trim());
    return { tag, title, description };
  },
  toBlock(obj) {
    return `{% titlesection "${obj.tag}|${obj.title}|${obj.description}" %}`;
  },
  toPreview(obj) {
    return `
    <div class="container mt-100 mt-60">
      <div class="row justify-content-center">
        <div class="col-12 text-center">
          <div class="section-title mb-4 pb-2">
            <${obj.tag || "h2"} class="title mb-4 font-weight-bold">${obj.title}</${obj.tag}>
            <h2 class="display-4 font-weight-bold">${obj.description}</h2>
          </div>
        </div>
      </div>
    </div>`;
  }
});


window.CMS.registerEditorComponent({
  id: "textsection",
  label: "Text Section",
  fields: [
    {
      name: "text",
      label: "Text",
      widget: "text"
    }
  ],
  pattern: /^\{%\s*textsection\s+"([\s\S]*?)"\s*%\}$/,
  fromBlock: function (match) {
    return {
      text: match[1].trim()
    };
  },
  toBlock: function (obj) {
    return `{% textsection "${obj.text.replace(/"/g, '\\"')}" %}`;
  },
  toPreview: function (obj) {
    return `
      <div class="container pb-lg-4 mb-md-5 mb-4 mt-60">
        <div class="row justify-content-center">
          <div class="col-8">
            <div class="section-title">
              ${obj.text.replace(/\n/g, "<br>")}
            </div>
          </div>
        </div>
      </div>
    `;
  }
});

window.CMS.registerEditorComponent({
  id: "imagetextgroup",
  label: "Image + Text",
  fields: [
    {
      name: "size",
      label: "Size",
      widget: "select",
      default: "style1",
      options: [
        { label: "Style1", value: "style1" },
        { label: "Style2", value: "style2" },
        { label: "Style3", value: "style3" },
        { label: "Style4", value: "style4" }
      ]
    },
    {
      name: "blocks",
      label: "Blocks",
      widget: "list",
      fields: [
        {
          name: "image",
          label: "Image",
          widget: "image"
        },
        {
          name: "title",
          label: "Title",
          widget: "string"
        },
        {
          name: "description",
          label: "Description",
          widget: "text"
        }
      ]
    }
  ],
  pattern: /{%\s*imagetextgroup\s*"(.+?)"\s*%}/,
  fromBlock(match) {
    const fullStr = match[1];
    const firstSepIndex = fullStr.indexOf("|");
    const size = fullStr.substring(0, firstSepIndex).trim();
    const blockDataStr = fullStr.substring(firstSepIndex + 1);

    const blockParts = blockDataStr.split("@@");

    const blocks = blockParts.map(p => {
      const [image, title, ...descParts] = p.split("|").map(s => s.trim());
      return {
        image,
        title,
        description: descParts.join("|")
      };
    });

    return {
      size,
      blocks
    };
  },
  toBlock(obj) {
    const size = obj.size || "style1";
    const blockStr = (obj.blocks || [])
      .map(b => `${b.image}|${b.title}|${b.description}`)
      .join(" @@ "); // dùng @@ để phân cách block
    return `{% imagetextgroup "${size}|${blockStr}" %}`;
  },
  toPreview(obj) {
    return `
      <div class="image-text-group ${obj.size || "style1"}">
        ${(obj.blocks || [])
          .map(
            b => `
            <div class="block my-4">
              <img src="${b.image}" style="max-width: 100%; margin-bottom: 0.5rem;" />
              <h4>${b.title || ""}</h4>
              <p>${(b.description || "").replace(/\n/g, "<br>")}</p>
            </div>`
          )
          .join("")}
      </div>
    `;
  }
});


window.CMS.registerEditorComponent({
  id: "image",
  label: "Images",
  fields: [
    {
      name: "size",
      label: "Size",
      widget: "select",
      default: "small",
      options: [
        { label: "Small", value: "small" },
        // { label: "Medium", value: "medium" },
        { label: "Large", value: "large" }
      ]
    },
    {
      name: "images",
      label: "Images",
      widget: "list",
      field: {
        name: "image",
        label: "Image",
        widget: "image"
      }
    }
  ],
  pattern: /{%\s*image\s*"(.+?)"\s*%}/,
  fromBlock(match) {
    const [size, imageStr] = match[1].split("|");
    const images = imageStr.split(",").map(i => i.trim()).filter(Boolean);
    return { size: size.trim(), images };
  },
  toBlock(obj) {
    const size = obj.size || "small";
    const images = (obj.images || []).join(",");
    return `{% image "${size}|${images}" %}`;
  },
  toPreview(obj) {
    const imgStyle = obj.size === "large" ? "width: 100%;" : "width: 50%;";
    return `
      <div style="margin: 1rem 0;">
        ${(obj.images || [])
          .map(img => `<img src="${img}" style="${imgStyle}; margin-bottom: 10px;" />`)
          .join("")}
      </div>
    `;
  }
});
window.CMS.registerEditorComponent({
  id: "youtubeinfoblock",
  label: "YouTube",
  fields: [
    {
      name: "youtube",
      label: "YouTube Link",
      widget: "string"
    },
    {
      name: "infos",
      label: "Infos",
      widget: "list",
      fields: [
        {
          name: "info",
          label: "Info",
          widget: "string"
        }
      ]
    }
  ],
  pattern: /{%\s*youtubeinfoblock\s*"([\s\S]+?)"\s*%}/,
  fromBlock(match) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      console.error("JSON parse error in youtubeinfoblock:", e);
      return { youtube: "", infos: [] };
    }
  },
  toBlock(obj) {
    return `{% youtubeinfoblock "${JSON.stringify(obj).replace(/"/g, '\\"')}" %}`;
  },
  toPreview(obj) {
    const youtubeEmbed = (obj.youtube || "").replace("watch?v=", "embed/");
    return `
      <div class="youtube-info-preview my-4">
        <div class="embed-responsive embed-responsive-16by9 mb-3">
          <iframe class="embed-responsive-item" src="${youtubeEmbed}" allowfullscreen></iframe>
        </div>
        <ul>
          ${(obj.infos || []).map(info => `<li><strong>${info.label}</strong>: ${info.value}</li>`).join("")}
        </ul>
      </div>
    `;
  }
});
