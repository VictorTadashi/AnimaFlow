import { BrowserHTMLToPPTXConverter } from './BrowserHTMLToPPTXConverter';
import { ConversionConfig } from './interfaces';

export class BrowserBatchProcessor {
  private converter: BrowserHTMLToPPTXConverter;

  constructor() {
    this.converter = new BrowserHTMLToPPTXConverter();
  }

  /**
   * Processa múltiplos conteúdos HTML
   */
  async processMultipleHTML(htmlContents: string[], outputPath: string): Promise<void> {
    if (htmlContents.length === 0) {
      throw new Error('Nenhum conteúdo HTML fornecido');
    }

    console.log(`📁 Processando ${htmlContents.length} conteúdos HTML`);
    await this.converter.convertMultipleHTMLToPPTX(htmlContents, outputPath);
  }

  /**
   * Processa arquivo de configuração JSON
   */
  async processFromConfig(config: ConversionConfig): Promise<void> {
    for (const presentation of config.presentations) {
      console.log(`🎯 Processando apresentação: ${presentation.name}`);
      await this.converter.convertMultipleHTMLToPPTX(
        presentation.slides,
        presentation.output
      );
    }
  }
}