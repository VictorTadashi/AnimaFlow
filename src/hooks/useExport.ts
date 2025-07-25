import { useState } from 'react';
import { exportToHTML } from '@/utils/exportHtml';
import { exportToPDF } from '@/utils/exportPdf';
import { exportHtmlToPptx } from '@/utils/exportPptx';

const imageFilenames = [
  "Imagem2.jpg",
  "ImagemFundo02.jpg",
  "Imagem4.jpg",
  "AnimaFuturoAcademico.jpg",
  "AnimaFuturoAcademico.png",
  "EcossistemaAnima.jpg",
  "FuturoAcademicoAnima.png",
  "HomeCapa.jpg",
  "HomeText02.jpg",
  "ImagemFundoEncerramento.jpg",

];

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportContent = async (
    format: 'html' | 'pdf' | 'pptx',
    html: string,
    filename: string = 'roteiro-aula'
  ) => {
    try {
      switch (format) {
        case 'html':
          exportToHTML(html, filename);
          break;
        case 'pdf':
          setIsExporting(true);
          await exportToPDF(html, filename);
          break;
        case 'pptx':
          setIsExporting(true);
          const bgImagesBase64 = await loadImagesAsBase64(imageFilenames);
          const blob = await exportHtmlToPptx(html, bgImagesBase64);
          downloadBlob(blob, `${filename}.pptx`);
          break;
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      throw error;
    } finally {
      if (format !== 'html') {
        setIsExporting(false);
      }
    }
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return {
    exportContent,
    isExporting
  };
};

async function loadImagesAsBase64(
  filenames: string[]
): Promise<Record<string, string>> {
  const base64Images: Record<string, string> = {};

  for (const filename of filenames) {
    const response = await fetch(`/images/${filename}`);
    const blob = await response.blob();

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    base64Images[filename] = base64;
  }

  return base64Images;
}
