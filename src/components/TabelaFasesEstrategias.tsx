
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Brain, Target, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface EstrategiasPorEtapa {
  conectar: string[];
  explorar: string[];
  expandir: string[];
  efetivar: string[];
  emplacar: string[];
  interagir: string[];
  avaliar: string[];
}

interface TabelaFasesEstrategiasProps {
  distribuicaoTempo: {
    ativar: number;
    aplicar: number;
    avaliar: number;
  };
  onDistribuicaoChange: (value: { ativar: number; aplicar: number; avaliar: number }) => void;
  estrategias: EstrategiasPorEtapa;
  onEstrategiasChange: (value: EstrategiasPorEtapa) => void;
  errors?: {
    distribuicao?: string;
    estrategias?: string;
  };
}

const estrategiasDefinicoes = {
  conectar: ["Apresentação do Desafio", "Discussão Inicial", "Perguntas Provocantes"],
  explorar: ["Atividades de Pesquisa Rápida", "Compartilhamento de Insights"],
  expandir: ["Aula Expositiva", "Análise de Casos"],
  efetivar: ["Reflexão Individual", "Compartilhamento em Grupos"],
  emplacar: ["Desafio Prático", "Plano de Ação"],
  interagir: ["Discussão em Grupos", "Feedback entre Pares"],
  avaliar: ["Auto Avaliação", "Avaliação Formativa"]
};

const fasesPorEtapa = {
  ativar: ["conectar", "explorar"],
  aplicar: ["expandir", "efetivar", "emplacar"],
  avaliar: ["interagir", "avaliar"]
};

const configFases = {
  ativar: {
    titulo: "Fase Ativar",
    descricao: "Despertar interesse e conhecimento prévio",
    icon: Brain,
    cor: "border-blue-200 bg-blue-50"
  },
  aplicar: {
    titulo: "Fase Aplicar", 
    descricao: "Prática e desenvolvimento de habilidades",
    icon: Target,
    cor: "border-green-200 bg-green-50"
  },
  avaliar: {
    titulo: "Fase Avaliar",
    descricao: "Verificação da aprendizagem", 
    icon: CheckCircle,
    cor: "border-purple-200 bg-purple-50"
  }
};

export const TabelaFasesEstrategias = ({ 
  distribuicaoTempo, 
  onDistribuicaoChange, 
  estrategias, 
  onEstrategiasChange,
  errors 
}: TabelaFasesEstrategiasProps) => {
  const [valores, setValores] = useState(distribuicaoTempo);
  const [soma, setSoma] = useState(0);

  useEffect(() => {
    const novasoma = valores.ativar + valores.aplicar + valores.avaliar;
    setSoma(novasoma);
  }, [valores]);

  const handleTempoChange = (fase: 'ativar' | 'aplicar' | 'avaliar', novoValor: string) => {
    const valor = Math.max(1, Math.min(100, parseInt(novoValor) || 1));
    const novosValores = { ...valores, [fase]: valor };
    setValores(novosValores);
    onDistribuicaoChange(novosValores);
  };

  const ajustarAutomaticamente = () => {
    const total = valores.ativar + valores.aplicar + valores.avaliar;
    if (total === 0) return;

    const fator = 100 / total;
    let novosValores = {
      ativar: Math.max(1, Math.round(valores.ativar * fator)),
      aplicar: Math.max(1, Math.round(valores.aplicar * fator)),
      avaliar: Math.max(1, Math.round(valores.avaliar * fator))
    };

    // Garantir que a soma seja exatamente 100 e todos os valores sejam >= 1
    let diferenca = 100 - (novosValores.ativar + novosValores.aplicar + novosValores.avaliar);
    
    // Ajustar a diferença preferencialmente na fase com maior valor
    if (diferenca !== 0) {
      const faseComMaiorValor = Object.keys(novosValores).reduce((a, b) => 
        novosValores[a as keyof typeof novosValores] > novosValores[b as keyof typeof novosValores] ? a : b
      ) as keyof typeof novosValores;
      
      novosValores[faseComMaiorValor] = Math.max(1, novosValores[faseComMaiorValor] + diferenca);
    }

    setValores(novosValores);
    onDistribuicaoChange(novosValores);
  };

  const handleEstrategiaChange = (etapa: keyof EstrategiasPorEtapa, estrategia: string, checked: boolean) => {
    const novasEstrategias = { ...estrategias };
    
    if (checked) {
      novasEstrategias[etapa] = [...novasEstrategias[etapa], estrategia];
    } else {
      novasEstrategias[etapa] = novasEstrategias[etapa].filter(e => e !== estrategia);
    }
    
    onEstrategiasChange(novasEstrategias);
  };

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <Clock className="w-4 h-4" />
        Distribuição do Tempo e Estratégias por Fase
      </FormLabel>
      
      <div className="text-xs text-gray-500 mb-3">
        Configure o tempo (%) e selecione as estratégias para cada fase. Cada fase deve ter pelo menos 1%.
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(fasesPorEtapa) as Array<keyof typeof fasesPorEtapa>).map((fase) => {
          const config = configFases[fase];
          const IconeFase = config.icon;
          const etapas = fasesPorEtapa[fase];

          return (
            <Card key={fase} className={`${config.cor} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconeFase className="w-4 h-4" />
                  {config.titulo}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={valores[fase]}
                      onChange={(e) => handleTempoChange(fase, e.target.value)}
                      className="h-8 text-sm w-16"
                      placeholder="1"
                    />
                    <span className="text-xs text-gray-600">%</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {config.descricao}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-0">
                {etapas.map((etapa) => (
                  <div key={etapa} className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-700 capitalize border-b border-gray-200 pb-1">
                      {etapa}
                    </h4>
                    <div className="space-y-1.5">
                      {estrategiasDefinicoes[etapa as keyof typeof estrategiasDefinicoes].map((estrategia) => (
                        <div key={estrategia} className="flex items-start space-x-2">
                          <Checkbox
                            id={`${etapa}-${estrategia}`}
                            checked={estrategias[etapa as keyof EstrategiasPorEtapa].includes(estrategia)}
                            onCheckedChange={(checked) => 
                              handleEstrategiaChange(etapa as keyof EstrategiasPorEtapa, estrategia, checked as boolean)
                            }
                            className="h-3 w-3 mt-0.5"
                          />
                          <label 
                            htmlFor={`${etapa}-${estrategia}`}
                            className="text-xs text-gray-600 cursor-pointer leading-tight"
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
        })}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          Total: <span className={`font-medium ${soma === 100 ? 'text-green-600' : 'text-red-500'}`}>
            {soma}%
          </span>
        </div>
        
        {soma !== 100 && soma > 0 && (
          <button
            type="button"
            onClick={ajustarAutomaticamente}
            className="text-xs text-indigo-600 hover:text-indigo-700 underline"
          >
            Ajustar para 100%
          </button>
        )}
      </div>
      
      {errors?.distribuicao && <FormMessage>{errors.distribuicao}</FormMessage>}
      {errors?.estrategias && <FormMessage>{errors.estrategias}</FormMessage>}
    </FormItem>
  );
};
