import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileImage, Presentation } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'html' | 'pdf' | 'pptx', filename?: string) => void;
  isExporting: boolean;
}

const ExportModal = ({ isOpen, onClose, onExport, isExporting }: ExportModalProps) => {
  const exportOptions = [
    {
      format: 'html' as const,
      title: 'HTML5',
      description: 'Arquivo HTML completo e independente',
      icon: FileText,
      color: 'text-orange-600'
    },
    // {
    //   format: 'pdf' as const,
    //   title: 'PDF',
    //   description: 'Documento PDF para impressão',
    //   icon: FileImage,
    //   color: 'text-red-600'
    // },
    {
      format: 'pptx' as const,
      title: 'PowerPoint',
      description: 'Apresentação em PowerPoint',
      icon: Presentation,
      color: 'text-blue-600'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Roteiro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Escolha o formato para exportar seu roteiro de aula:
          </p>
          
          {exportOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.format}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => onExport(option.format, 'roteiro-aula')}
                disabled={isExporting}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className={`w-6 h-6 ${option.color} flex-shrink-0 mt-0.5`} />
                  <div className="text-left">
                    <div className="font-medium">{option.title}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
          
          {isExporting && (
            <div className="text-center py-4">
              <div className="text-sm text-gray-600">Preparando exportação...</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
