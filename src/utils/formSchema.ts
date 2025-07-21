
import * as z from "zod";

// Validação customizada para garantir que a soma seja 100% e todos os valores sejam > 0
const distribuicaoValidator = z.object({
  ativar: z.number().min(1, "A fase Ativar deve ter pelo menos 1%").max(100),
  aplicar: z.number().min(1, "A fase Aplicar deve ter pelo menos 1%").max(100),
  avaliar: z.number().min(1, "A fase Avaliar deve ter pelo menos 1%").max(100)
}).refine((data) => {
  const soma = data.ativar + data.aplicar + data.avaliar;
  return soma === 100;
}, {
  message: "A distribuição deve somar exatamente 100%",
  path: ["distribuicao"]
});

// Validação para estratégias - deve ter ao menos uma estratégia por etapa
const estrategiasValidator = z.object({
  conectar: z.array(z.string()),
  explorar: z.array(z.string()),
  expandir: z.array(z.string()),
  efetivar: z.array(z.string()),
  emplacar: z.array(z.string()),
  interagir: z.array(z.string()),
  avaliar: z.array(z.string())
}).refine((data) => {
  const etapas = Object.keys(data) as (keyof typeof data)[];
  return etapas.every(etapa => data[etapa].length > 0);
}, {
  message: "É necessário selecionar ao menos uma estratégia para cada etapa",
  path: ["estrategias"]
});

export const formSchema = z.object({
  tema: z.string().min(1, "O tema da aula é obrigatório"),
  duracao: z.string().min(1, "A duração da aula é obrigatória"),
  quantidadeAlunos: z.string().min(1, "A quantidade de alunos é obrigatória"),
  distribuicaoTempo: distribuicaoValidator,
  estrategias: estrategiasValidator,
  interatividade: z.string().min(1, "O nível de interatividade é obrigatório"),
});

export const duracaoOptions = [
  "60 minutos",
  "120 minutos",
  "150 minutos",
  "180 minutos"
];

export const quantidadeAlunosOptions = [
  "Menos de 50 alunos",
  "Entre 50 e 100 alunos",
  "Entre 100 e 150 alunos",
  "Acima de 150 alunos"
];
