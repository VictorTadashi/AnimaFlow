import PptxGenJS from "pptxgenjs";
import {
  SlideElement,
  ElementStyles,
  Position,
  Size,
  SlideConfig,
} from "./interfaces";

export class BrowserHTMLToPPTXConverter {
  private pptx: PptxGenJS;
  private slideConfig: SlideConfig;

  constructor() {
    this.pptx = new PptxGenJS();
    this.slideConfig = {
      width: 10, // 10 inches
      height: 5.625, // 5.625 inches
      background: "#FFFFFF",
    };

    // Configurar apresentação
    this.pptx.defineLayout({
      name: "CUSTOM",
      width: this.slideConfig.width,
      height: this.slideConfig.height,
    });
    this.pptx.layout = "CUSTOM";
  }

  /**
   * Converte HTML string para PPTX
   */
  async convertHTMLToPPTX(
    htmlContent: string,
    outputPath: string
  ): Promise<void> {
    try {
      console.log("🔄 Iniciando conversão HTML para PPTX...");

      const slides = this.parseHTMLSlides(htmlContent);
      for (const slideElements of slides) {
        await this.createSlide(slideElements);
      }

      // Salvar arquivo PPTX
      await this.pptx.writeFile({ fileName: outputPath });

      console.log(`✅ Conversão concluída: ${outputPath}`);
    } catch (error) {
      console.error("❌ Erro na conversão:", error);
      throw error;
    }
  }

  /**
   * Converte múltiplos HTMLs para uma apresentação PPTX
   */
  async convertMultipleHTMLToPPTX(
    htmlContents: string[],
    outputPath: string
  ): Promise<void> {
    try {
      console.log("🔄 Iniciando conversão múltipla HTML para PPTX...");

      for (let i = 0; i < htmlContents.length; i++) {
        console.log(`🔄 Processando slide ${i + 1}/${htmlContents.length}`);

        const slides = this.parseHTMLSlides(htmlContents[i]);
        for (const elements of slides) {
          await this.createSlide(elements);
        }
      }

      await this.pptx.writeFile({ fileName: outputPath });
      console.log(
        `✅ Apresentação criada com ${htmlContents.length} slides: ${outputPath}`
      );
    } catch (error) {
      console.error("❌ Erro na conversão múltipla:", error);
      throw error;
    }
  }

  /**
   * Faz parsing do HTML usando DOMParser do navegador
   */
  private parseHTMLSlides(htmlContent: string): SlideElement[][] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const containers = doc.querySelectorAll(".slide-container");
    const slides: SlideElement[][] = [];

    containers.forEach((container) => {
      const elements: SlideElement[] = [];

      const titleElement = container.querySelector("h1, .title");
      if (titleElement?.textContent) {
        elements.push({
          type: "text",
          content: titleElement.textContent,
          styles: this.extractStyles(titleElement as Element),
          position: { x: 0.5, y: 0.5 },
          size: { width: 9, height: 1 },
        });
      }

      const subtitles = container.querySelectorAll("h2, .subtitle");
      subtitles.forEach((subtitle, index) => {
        if (subtitle.textContent) {
          elements.push({
            type: "text",
            content: subtitle.textContent,
            styles: this.extractStyles(subtitle),
            position: { x: 0.5, y: 1.5 + index * 0.8 },
            size: { width: 9, height: 0.6 },
          });
        }
      });

      const paragraphs = container.querySelectorAll("p, .info-text");
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.textContent?.trim()) {
          elements.push({
            type: "text",
            content: paragraph.textContent,
            styles: this.extractStyles(paragraph),
            position: { x: 0.5, y: 2.5 + index * 0.5 },
            size: { width: 9, height: 0.4 },
          });
        }
      });

      const accentElements = container.querySelectorAll(".accent");
      accentElements.forEach((accent, index) => {
        if (accent.textContent?.trim()) {
          elements.push({
            type: "text",
            content: accent.textContent,
            styles: this.extractStyles(accent),
            position: { x: 0.5, y: 3.5 + index * 0.4 },
            size: { width: 9, height: 0.3 },
          });
        }
      });

      const otherHeadings = container.querySelectorAll("h3, h4, h5, h6");
      otherHeadings.forEach((heading, index) => {
        if (heading.textContent) {
          elements.push({
            type: "text",
            content: heading.textContent,
            styles: this.extractStyles(heading),
            position: { x: 0.5, y: 4.0 + index * 0.3 },
            size: { width: 9, height: 0.3 },
          });
        }
      });

      slides.push(elements);
    });

    return slides;
  }

  /**
   * Extrai estilos CSS de um elemento
   */
  private extractStyles(element: Element): ElementStyles {
    const computedStyle = window.getComputedStyle
      ? window.getComputedStyle(element)
      : null;
    const classList = Array.from(element.classList);
    const tagName = element.tagName.toLowerCase();

    const styles: ElementStyles = {
      fontSize: 16,
      fontFamily: "Segoe UI",
      color: "#333333",
      textAlign: "left",
    };

    // Extrair estilos computados se disponível
    if (computedStyle) {
      const fontSize = computedStyle.fontSize;
      if (fontSize) {
        styles.fontSize = parseInt(fontSize) || 16;
      }

      const color = computedStyle.color;
      if (color) {
        styles.color = this.rgbToHex(color);
      }

      const textAlign = computedStyle.textAlign;
      if (textAlign && ["left", "center", "right"].includes(textAlign)) {
        styles.textAlign = textAlign as "left" | "center" | "right";
      }

      const fontWeight = computedStyle.fontWeight;
      if (
        fontWeight &&
        (fontWeight === "bold" || parseInt(fontWeight) >= 600)
      ) {
        styles.fontWeight = "bold";
      }
    }

    // Mapear tags HTML para estilos
    switch (tagName) {
      case "h1":
        styles.fontSize = 36;
        styles.fontWeight = "bold";
        styles.color = "#0066CC";
        styles.textAlign = "center";
        break;
      case "h2":
        styles.fontSize = 28;
        styles.fontWeight = "bold";
        styles.color = "#333333";
        break;
      case "h3":
        styles.fontSize = 22;
        styles.fontWeight = "bold";
        break;
      case "h4":
        styles.fontSize = 18;
        styles.fontWeight = "bold";
        break;
      case "h5":
      case "h6":
        styles.fontSize = 16;
        styles.fontWeight = "bold";
        break;
    }

    // Mapear classes CSS para estilos
    if (classList.includes("title")) {
      styles.fontSize = 36;
      styles.fontWeight = "bold";
      styles.color = "#0066CC";
      styles.textAlign = "center";
    }

    if (classList.includes("subtitle")) {
      styles.fontSize = 24;
      styles.color = "#333333";
    }

    if (classList.includes("accent")) {
      styles.color = "#FF6600";
      styles.fontWeight = "bold";
    }

    if (classList.includes("text-center")) {
      styles.textAlign = "center";
    }

    if (classList.includes("text-right")) {
      styles.textAlign = "right";
    }

    return styles;
  }

  /**
   * Converte cor RGB para HEX
   */
  private rgbToHex(rgb: string): string {
    if (rgb.startsWith("#")) return rgb;

    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return "#333333";

    const [, r, g, b] = match;
    return `#${parseInt(r).toString(16).padStart(2, "0")}${parseInt(g)
      .toString(16)
      .padStart(2, "0")}${parseInt(b).toString(16).padStart(2, "0")}`;
  }

  /**
   * Cria um slide no PPTX com os elementos extraídos
   */
  private async createSlide(elements: SlideElement[]): Promise<void> {
    const slide = this.pptx.addSlide();

    // Adicionar fundo
    slide.background = { color: this.slideConfig.background };

    // Adicionar elementos extraídos
    for (const element of elements) {
      if (element.type === "text") {
        slide.addText(element.content, {
          x: element.position.x,
          y: element.position.y,
          w: element.size.width,
          h: element.size.height,
          fontSize: element.styles.fontSize,
          fontFace: element.styles.fontFamily,
          color: element.styles.color?.replace("#", "") || "333333",
          bold: element.styles.fontWeight === "bold",
          align: element.styles.textAlign || "left",
        });
      }
    }
  }
}
