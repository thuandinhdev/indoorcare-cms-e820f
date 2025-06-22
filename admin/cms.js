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
    { name: "description", label: "Description", widget: "string" },
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
      return { title: "", description: "", logos: [] };
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
          <p class="text-muted mx-auto mb-0">${obj.description}</p>
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
