
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, CheckCircle } from "lucide-react";

interface EstrategiasPorEtapa {
  conectar: string[];
  explorar: string[];
  expandir: string[];
  evocar: string[];
  emplacar: string[];
  interagir: string[];
  avaliar: string[];
}

interface TaxonomiaEstrategiasProps {
  value: EstrategiasPorEtapa;
  onChange: (value: EstrategiasPorEtapa) => void;
  error?: string;
}

const estrategiasDefinicoes = {
  conectar: ["Apresentação do Desafio", "Discussão Inicial", "Perguntas Provocantes"],
  explorar: ["Atividades de Pesquisa Rápida", "Compartilhamento de Insights"],
  expandir: ["Aula Expositiva", "Análise de Casos"],
  evocar: ["Reflexão Individual", "Compartilhamento em Grupos"],
  emplacar: ["Desafio Prático", "Plano de Ação"],
  interagir: ["Discussão em Grupos", "Feedback entre Pares"],
  avaliar: ["Auto Avaliação", "Avaliação Formativa"]
};

const fasesPorEtapa = {
  ativar: ["conectar", "explorar"],
  aplicar: ["expandir", "evocar", "emplacar"],
  avaliar: ["interagir", "avaliar"]
};

const iconesPorFase = {
  ativar: Brain,
  aplicar: Target,
  avaliar: CheckCircle
};

const coresPorFase = {
  ativar: "border-blue-200 bg-blue-50",
  aplicar: "border-green-200 bg-green-50",
  avaliar: "border-purple-200 bg-purple-50"
};

export const TaxonomiaStrategias = ({ value, onChange, error }: TaxonomiaEstrategiasProps) => {
  const handleEstrategiaChange = (etapa: keyof EstrategiasPorEtapa, estrategia: string, checked: boolean) => {
    const novasEstrategias = { ...value };
    
    if (checked) {
      novasEstrategias[etapa] = [...novasEstrategias[etapa], estrategia];
    } else {
      novasEstrategias[etapa] = novasEstrategias[etapa].filter(e => e !== estrategia);
    }
    
    onChange(novasEstrategias);
  };

  const renderFase = (fase: keyof typeof fasesPorEtapa, titulo: string) => {
    const IconeFase = iconesPorFase[fase];
    const corFase = coresPorFase[fase];
    const etapas = fasesPorEtapa[fase];

    return (
      <Card key={fase} className={`${corFase} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IconeFase className="w-5 h-5" />
            {titulo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {etapas.map((etapa) => (
            <div key={etapa} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 capitalize">
                {etapa}
              </h4>
              <div className="space-y-2 ml-2">
                {estrategiasDefinicoes[etapa as keyof typeof estrategiasDefinicoes].map((estrategia) => (
                  <div key={estrategia} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${etapa}-${estrategia}`}
                      checked={value[etapa as keyof EstrategiasPorEtapa].includes(estrategia)}
                      onCheckedChange={(checked) => 
                        handleEstrategiaChange(etapa as keyof EstrategiasPorEtapa, estrategia, checked as boolean)
                      }
                      className="h-4 w-4"
                    />
                    <label 
                      htmlFor={`${etapa}-${estrategia}`}
                      className="text-xs text-gray-600 cursor-pointer"
                    >
                      {estrategia}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <Brain className="w-4 h-4" />
        Estratégias por Etapa da Taxonomia
      </FormLabel>
      
      <div className="text-xs text-gray-500 mb-3">
        Selecione ao menos uma estratégia para cada etapa
      </div>
      
      <div className="space-y-4">
        {renderFase("ativar", "Fase Ativar")}
        {renderFase("aplicar", "Fase Aplicar")}
        {renderFase("avaliar", "Fase Avaliar")}
      </div>
      
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};
