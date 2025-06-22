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
        { name: "link", label: "Link", widget: "string", default: "javascript:void(0)" },
        { name: "title", label: "Title", widget: "string" }
      ]
    }
  ],
  pattern: /^:::cardproducts\s*([\s\S]*?):::/,
  fromBlock: function (match) {
    const lines = match[1].split("- image:").slice(1);
    return {
      products: lines.map(block => {
        const parts = block.trim().split("\n").map(l => l.trim());
        return {
          image: parts[0],
          link: (parts.find(l => l.startsWith("link:")) || "").replace("link:", "").trim(),
          title: (parts.find(l => l.startsWith("title:")) || "").replace("title:", "").trim()
        };
      })
    };
  },
  toBlock: function (obj) {
    return `:::cardproducts\n` + obj.products.map(p => 
      `- image: ${p.image}\n  link: ${p.link}\n  title: ${p.title}`
    ).join("\n\n") + `\n:::`;
  },
  toPreview: function (obj) {
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
            <h5 class="text-center"><a href="${p.link}" class="card-title title text-dark">${p.title}</a></h5>
          </div>
        </div>
      </div>
      `).join("")}
    </div>
  </div>
</section>`;
  }
});
