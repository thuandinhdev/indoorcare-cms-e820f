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
  toBlock: function (obj) {
    const imageMd = obj.images.map(img => `![](${img})`).join("\n");
    return `:::slider\n${imageMd}\n:::`;
  },
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
