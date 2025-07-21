
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (html: string, filename: string = 'roteiro-aula') => {
  try {
    // Criar um elemento temporário para renderizar o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.width = '1000px'; // Largura maior para modo paisagem
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '20px';
    document.body.appendChild(tempDiv);

    // Criar PDF em modo paisagem
    const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' para landscape (paisagem)
    const pageWidth = 297; // A4 paisagem width em mm
    const pageHeight = 210; // A4 paisagem height em mm
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Encontrar todas as seções de slide
    const sections = tempDiv.querySelectorAll('section, .slide, .section');
    
    if (sections.length === 0) {
      // Se não há seções específicas, capturar todo o conteúdo
      const canvas = await html2canvas(tempDiv, {
        width: 1000,
        height: tempDiv.scrollHeight,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, contentHeight));
    } else {
      // Processar cada seção como uma página separada
      let isFirstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        // Pular seções vazias
        if (!section.textContent?.trim()) continue;

        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Criar um div temporário apenas para esta seção
        const sectionDiv = document.createElement('div');
        sectionDiv.innerHTML = section.outerHTML;
        sectionDiv.style.width = '1000px';
        sectionDiv.style.position = 'absolute';
        sectionDiv.style.left = '-9999px';
        sectionDiv.style.top = '0';
        sectionDiv.style.backgroundColor = 'white';
        sectionDiv.style.padding = '20px';
        sectionDiv.style.minHeight = '600px';
        document.body.appendChild(sectionDiv);

        try {
          // Capturar esta seção específica
          const canvas = await html2canvas(sectionDiv, {
            width: 1000,
            height: Math.max(600, sectionDiv.scrollHeight),
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Adicionar a imagem da seção na página
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, contentHeight));

          // Adicionar número da página
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(`${i + 1}`, pageWidth - 20, pageHeight - 10);

        } catch (error) {
          console.warn(`Erro ao processar seção ${i + 1}:`, error);
        } finally {
          // Remover o div temporário da seção
          document.body.removeChild(sectionDiv);
        }
      }
    }

    // Remover elemento temporário principal
    document.body.removeChild(tempDiv);

    // Salvar o PDF
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar PDF');
  }
};
