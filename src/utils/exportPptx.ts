import pptxgen from "pptxgenjs";

export async function exportHtmlToPptx(
  html: string,
  bgImagesBase64: Record<string, string> = {}
): Promise<Blob> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const pptx = new pptxgen();
  const sections = doc.querySelectorAll(".slide-container");

  const SLIDE_HEIGHT_LIMIT = 6.0;
  const INITIAL_Y = 0.5;

  sections.forEach((section, index) => {
    let slide = pptx.addSlide();

    const applyBackground = (s: pptxgen.Slide) => {
      const style = section.getAttribute("style") || "";
      const bgMatch = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/);
      if (bgMatch && bgMatch[1]) {
        const imgPath = bgMatch[1].replace(/^\/+/g, "");
        const fileName = imgPath.split("/").pop()!;
        const base64 = bgImagesBase64[fileName];
        if (base64) {
          s.background = { data: base64, transparency: 0 };
        }
      }
    };

    applyBackground(slide);

    const elements = Array.from(section.querySelectorAll("h1, h2, p, li"));
    let yPos = INITIAL_Y;
    const seenTexts = new Set<string>();

    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (!text || seenTexts.has(text)) return;
      seenTexts.add(text);

      let color = "000000";
      let fontSize = 12;
      let bold = false;
      let align: pptxgen.HAlignType = "left";

      const tag = el.tagName.toLowerCase();

      if (tag === "h1") {
        color = "FF008C";
        fontSize = index === 0 ? 28 : 18;
        bold = true;
        if (index === 1) align = "center";
      } else if (tag === "h2") {
        fontSize = 14;
        color = index === 1 ? "FFFFFF" : "000000";
        if (index === 1) align = "center";
      } else if (tag === "p") {
        fontSize = 12;
        if (index === 1) {
          color = "FFFFFF";
          align = "center";
        }
      }

      let content = text;
      if (tag === "li") {
        content = "• " + content;
      }

      const numLines = Math.max(content.split(/\n/).length, Math.ceil(content.length / 80));
      const height = 0.6 + (numLines - 1) * 0.3;

      if (yPos + height > SLIDE_HEIGHT_LIMIT) {
        slide = pptx.addSlide();
        applyBackground(slide);
        yPos = INITIAL_Y;
      }

      slide.addText(content, {
        x: 0.5,
        y: yPos,
        w: 8.5,
        h: height,
        fontSize,
        color,
        bold,
        fontFace: "Arial",
        valign: "top",
        align,
        isTextBox: true,
        margin: 0,
      });

      const spacing = tag === "p" ? 0.1 : 0.2;
      yPos += height + spacing;
    });
  });

  const blob = (await pptx.write("blob" as any)) as Blob;
  return blob;
}
