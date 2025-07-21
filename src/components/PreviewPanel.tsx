
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Monitor, Code, Download, Maximize, Loader2 } from "lucide-react";
import ExportModal from "./ExportModal";
import { useExport } from "@/hooks/useExport";
import { useToast } from "@/components/ui/use-toast";

interface PreviewPanelProps {
  html: string;
  isLoading: boolean;
}

const PreviewPanel = ({
  html,
  isLoading
}: PreviewPanelProps) => {
  const [showCode, setShowCode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const {
    exportContent,
    isExporting
  } = useExport();
  const {
    toast
  } = useToast();

  const handleDownload = () => {
    const blob = new Blob([html], {
      type: "text/html"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roteiro-aula.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExpandWindow = () => {
    const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  const handleExport = (format: 'html' | 'pdf' | 'pptx') => {
    const filename = `roteiro-aula-${new Date().toISOString().split('T')[0]}`;
    exportContent(format, html, filename).then(() => {
      toast({
        title: "Exportação concluída!",
        description: `Roteiro exportado em formato ${format.toUpperCase()} com sucesso.`
      });
      setShowExportModal(false);
    }).catch(error => {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: `Não foi possível exportar em formato ${format.toUpperCase()}. Tente novamente.`,
        variant: "destructive"
      });
    });
  };

  return <div className="flex flex-col h-full bg-gray-50">
      {/* Preview Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botão Expandir */}
            <Button variant="outline" size="sm" onClick={handleExpandWindow} disabled={!html}>
              <Maximize className="w-4 h-4 mr-1" />
              Expandir
            </Button>

            {/* Botão Exportar */}
            <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)} disabled={!html || isExporting}>
              <Download className="w-4 h-4 mr-1" />
              {isExporting ? "Exportando..." : "Exportar"}
            </Button>

            {/* Botão Código/Preview */}
            <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
              <Code className="w-4 h-4 mr-1" />
              {showCode ? "Preview" : "Código"}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? <div className="flex items-center justify-center h-full">
            <Card className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Gerando sua apresentação...
              </h3>
              <p className="text-gray-600">
                Isso pode levar alguns segundos
              </p>
            </Card>
          </div> : !html ? <div className="flex items-center justify-center h-full">
            <Card className="p-12 text-center">
              <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aguardando Comando</h3>
              <p className="text-gray-600">Converse com o assistente para gerar seu roteiro</p>
            </Card>
          </div> : showCode ? <Card className="h-full p-4">
            <pre className="text-sm overflow-auto h-full bg-gray-900 text-green-400 p-4 rounded">
              <code>{html}</code>
            </pre>
          </Card> : <div className="flex justify-center items-start h-full">
            <div className="w-full h-full transition-all duration-300">
              <Card className="h-full border-2 border-gray-300 overflow-hidden">
                <iframe srcDoc={html} className="w-full h-full border-none" title="Preview" sandbox="allow-scripts allow-same-origin" />
              </Card>
            </div>
          </div>}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Grupo Ânima</span>
          <span>
            {html ? `${Math.round(html.length / 1024)}KB` : "0KB"}
          </span>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} isExporting={isExporting} />
    </div>;
};

export default PreviewPanel;
