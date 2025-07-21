
import { useState, useEffect } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";

interface DistribuicaoTempoProps {
  value: {
    ativar: number;
    aplicar: number;
    avaliar: number;
  };
  onChange: (value: { ativar: number; aplicar: number; avaliar: number }) => void;
  error?: string;
}

export const DistribuicaoTempo = ({ value, onChange, error }: DistribuicaoTempoProps) => {
  const [valores, setValores] = useState(value);
  const [soma, setSoma] = useState(0);

  useEffect(() => {
    const novasoma = valores.ativar + valores.aplicar + valores.avaliar;
    setSoma(novasoma);
  }, [valores]);

  const handleChange = (fase: 'ativar' | 'aplicar' | 'avaliar', novoValor: string) => {
    const valor = Math.max(0, Math.min(100, parseInt(novoValor) || 0));
    const novosValores = { ...valores, [fase]: valor };
    setValores(novosValores);
    onChange(novosValores);
  };

  const ajustarAutomaticamente = () => {
    const total = valores.ativar + valores.aplicar + valores.avaliar;
    if (total === 0) return;

    const fator = 100 / total;
    const novosValores = {
      ativar: Math.round(valores.ativar * fator),
      aplicar: Math.round(valores.aplicar * fator),
      avaliar: Math.round(valores.avaliar * fator)
    };

    // Ajustar para garantir exatamente 100%
    const diferenca = 100 - (novosValores.ativar + novosValores.aplicar + novosValores.avaliar);
    if (diferenca !== 0) {
      novosValores.ativar += diferenca;
    }

    setValores(novosValores);
    onChange(novosValores);
  };

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <Clock className="w-4 h-4" />
        Distribuição do Tempo por Fase (%)
      </FormLabel>
      
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Ativar</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={valores.ativar}
              onChange={(e) => handleChange('ativar', e.target.value)}
              className="h-9 text-sm border border-gray-300 focus:border-indigo-500"
              placeholder="0"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Aplicar</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={valores.aplicar}
              onChange={(e) => handleChange('aplicar', e.target.value)}
              className="h-9 text-sm border border-gray-300 focus:border-indigo-500"
              placeholder="0"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Avaliar</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={valores.avaliar}
              onChange={(e) => handleChange('avaliar', e.target.value)}
              className="h-9 text-sm border border-gray-300 focus:border-indigo-500"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
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
        
        <div className="text-xs text-gray-500">
          <strong>Ativar:</strong> Despertar interesse e conhecimento prévio<br/>
          <strong>Aplicar:</strong> Prática e desenvolvimento de habilidades<br/>
          <strong>Avaliar:</strong> Verificação da aprendizagem
        </div>
      </div>
      
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};
