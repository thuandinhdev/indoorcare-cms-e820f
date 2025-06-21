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
  pattern: /^:::slider/,
  fromBlock: function (match, content) {
    const imageUrls = (content || "")
      .split("![](")
      .slice(1)
      .map(str => str.split(")")[0].trim());
    return {
      images: imageUrls
    };
  },
  toBlock: function (obj) {
    const imagesMarkdown = obj.images
      .map(img => `![](${img})`)
      .join("\n");
    return `:::slider\n\n${imagesMarkdown}\n\n:::\n`;
  },
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
