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
  // 🧠 Nhận dạng shortcode Liquid {% slider "..." %}
  pattern: /^\{%\s*slider\s+"(.+?)"\s*%\}$/,
  fromBlock: function (match) {
    return {
      images: match[1].split(",").map((img) => img.trim())
    };
  },
  // ✅ Xuất ra cú pháp Liquid khi lưu Markdown
  toBlock: function (obj) {
    return `{{ "${obj.images.join(",")}" | slider | safe }}`;
  },
  
  // 👀 Hiển thị preview bên phải CMS
  toPreview: function (obj) {
    const items = obj.images
      .map(
        (img) =>
          `<div class="bg-home-80" style="background: url('${img}') no-repeat center center / cover;"></div>`
      )
      .join("");
    return `
      <div class="container-fluid px-0 mt-5 pt-md-4">
        <div class="slider single-item bg-home-custom slider-pc">
          ${items}
        </div>
      </div>
    `;
  }
});
