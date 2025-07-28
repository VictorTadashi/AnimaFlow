import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporta cada slide HTML como uma página do PDF.
 */
export const exportToPDF = async (html: string, filename: string = 'roteiro-aula') => {
  try {
    // Criar iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '1123px'; // A4 landscape @96dpi
    iframe.style.height = '794px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) throw new Error('Não foi possível acessar o documento do iframe.');

    // Injetar o HTML completo no iframe
    doc.open();
    doc.write(html);
    doc.close();

    // Esperar a renderização completa
    await new Promise(resolve => setTimeout(resolve, 500));

    const sections = Array.from(doc.querySelectorAll('.slide-container'));
    if (sections.length === 0) throw new Error('Nenhuma seção .slide-container encontrada.');

    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    let isFirstPage = true;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;

      // Criar container temporário no iframe
      const slideWrapper = doc.createElement('div');
      slideWrapper.style.width = '1123px';
      slideWrapper.style.height = '794px';
      slideWrapper.style.display = 'flex';
      slideWrapper.style.alignItems = 'center';
      slideWrapper.style.justifyContent = 'center';
      slideWrapper.style.backgroundColor = 'white';
      slideWrapper.appendChild(section.cloneNode(true));

      doc.body.innerHTML = ''; // limpa e insere apenas o slide atual
      doc.body.appendChild(slideWrapper);

      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(slideWrapper, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2
      });

      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      if (!isFirstPage) pdf.addPage();
      isFirstPage = false;

      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, Math.min(imgHeight, pageHeight - margin * 2));

      // Número da página
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`${i + 1}`, pageWidth - 20, pageHeight - 10);
    }

    // Limpeza final
    document.body.removeChild(iframe);

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar PDF');
  }
};
