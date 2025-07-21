// Interfaces para o módulo PPTX
export interface SlideElement {
  type: 'text' | 'image' | 'chart' | 'shape';
  content: string;
  styles: ElementStyles;
  position: Position;
  size: Size;
}

export interface ElementStyles {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderColor?: string;
  borderWidth?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ChartData {
  type: string;
  data: any;
  options: any;
}

export interface SlideConfig {
  width: number;
  height: number;
  background?: string;
}

export interface ConversionConfig {
  presentations: {
    name: string;
    slides: string[];
    output: string;
  }[];
}