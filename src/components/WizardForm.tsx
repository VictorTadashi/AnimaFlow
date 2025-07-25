import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowRight, Clock, Users, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  formSchema,
  duracaoOptions,
  quantidadeAlunosOptions,
} from "@/utils/formSchema";
import { TabelaFasesEstrategias } from "@/components/TabelaFasesEstrategias";

export const WizardForm = () => {
  const navigate = useNavigate();

  const defaultDistribuicaoTempo = {
    ativar: 30,
    aplicar: 50,
    avaliar: 20,
  };

  const defaultEstrategias = {
    conectar: [],
    explorar: [],
    expandir: [],
    efetivar: [],
    emplacar: [],
    interagir: [],
    avaliar: [],
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tema: "",
      duracao: "",
      quantidadeAlunos: "",
      distribuicaoTempo: defaultDistribuicaoTempo,
      estrategias: defaultEstrategias,
      estrategiasFake: "",
      interatividade: "",
    },
    mode: "onSubmit",
  });

  // Corrigir dependências do useEffect
  useEffect(() => {
    if (!form.formState.isSubmitted) return;

    const estrategias = form.getValues("estrategias");

    const fasesPorEtapa = {
      ativar: ["conectar", "explorar"],
      aplicar: ["expandir", "efetivar", "emplacar"],
      avaliar: ["interagir", "avaliar"],
    };

    const todasFasesValidas = Object.entries(fasesPorEtapa).every(
      ([, etapas]) => etapas.some((etapa) => estrategias[etapa]?.length > 0)
    );

    if (!todasFasesValidas) {
      form.setError("estrategiasFake", {
        type: "manual",
        message:
          "Selecione pelo menos uma estratégia em cada fase: Ativar, Aplicar e Avaliar.",
      });
    } else {
      form.clearErrors("estrategiasFake");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isSubmitted, form.getValues("estrategias")]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const estrategias = values.estrategias;
    const distribuicaoTempo = values.distribuicaoTempo;

    const fasesPorEtapa = {
      ativar: ["conectar", "explorar"],
      aplicar: ["expandir", "efetivar", "emplacar"],
      avaliar: ["interagir", "avaliar"],
    };

    const todasFasesValidas = Object.entries(fasesPorEtapa).every(
      ([, etapas]) => etapas.some((etapa) => estrategias[etapa]?.length > 0)
    );

    if (!todasFasesValidas) {
      form.setError("estrategiasFake", {
        type: "manual",
        message:
          "Selecione pelo menos uma estratégia em cada fase: Ativar, Aplicar e Avaliar.",
      });
      return;
    } else {
      form.clearErrors("estrategiasFake");
    }

    const estrategiasTexto = Object.entries(estrategias)
      .filter(([, strategies]) => strategies.length > 0)
      .map(([etapa, strategies]) => `${etapa}: ${strategies.join(", ")}`)
      .join("\n");

    const prompt = `Crie um roteiro para uma aula online com ${
      values.quantidadeAlunos
    } duração de ${
      values.duracao
    } com interatividade ${values.interatividade?.toLowerCase() || ""} com o tema: ${
      values.tema
    }. 

Distribua o tempo da seguinte forma:
- Fase Ativar (despertar interesse e conhecimento prévio): ${
      distribuicaoTempo.ativar
    }%
- Fase Aplicar (prática e desenvolvimento de habilidades): ${
      distribuicaoTempo.aplicar
    }%
- Fase Avaliar (verificação da aprendizagem): ${distribuicaoTempo.avaliar}%

Estratégias selecionadas por etapa:
${estrategiasTexto}

Use a taxonomia de neuroaprendizagem para estruturar o conteúdo de cada fase.`;

    navigate("/editor", {
      state: {
        initialPrompt: prompt,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 border border-gray-200 bg-white shadow-lg">
        <div className="flex justify-center mb-4">
          <img
            src="/lovable-uploads/2e89f522-102d-4611-8139-9bf8c6aa50fc.png"
            alt="Ânima Educação Logo"
            className="h-12 w-auto"
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Crie um roteiro de aula dinâmico utilizando a taxonomia de
            Neuroaprendizagem
          </h2>
          <p className="text-sm text-gray-600">
            Preencha as informações abaixo para gerar o seu roteiro com nossa IA
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="tema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Tema da Aula
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Introdução ao Marketing Digital"
                      {...field}
                      className="h-10 text-sm border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duracao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duração da Aula
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 text-sm border border-gray-300 focus:border-indigo-500">
                        <SelectValue placeholder="Selecione a duração" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border shadow-lg">
                      {duracaoOptions.map((duracao) => (
                        <SelectItem
                          key={duracao}
                          value={duracao}
                          className="text-sm"
                        >
                          {duracao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantidadeAlunos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Quantidade de Alunos
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 text-sm border border-gray-300 focus:border-indigo-500">
                        <SelectValue placeholder="Selecione a quantidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border shadow-lg">
                      {quantidadeAlunosOptions.map((quantidade) => (
                        <SelectItem
                          key={quantidade}
                          value={quantidade}
                          className="text-sm"
                        >
                          {quantidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estrategias"
              render={() => (
                <FormItem>
                  <TabelaFasesEstrategias
                    distribuicaoTempo={
                      form.watch("distribuicaoTempo") ||
                      defaultDistribuicaoTempo
                    }
                    onDistribuicaoChange={(value) =>
                      form.setValue("distribuicaoTempo", value)
                    }
                    estrategias={
                      form.watch("estrategias") || defaultEstrategias
                    }
                    onEstrategiasChange={(value) =>
                      form.setValue("estrategias", value)
                    }
                    errors={{
                      distribuicao:
                        form.formState.errors.distribuicaoTempo?.message,
                      estrategias: form.formState.errors.estrategias?.message,
                    }}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estrategiasFake"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interatividade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Nível de Interatividade
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Baixa" id="baixa" />
                        <Label
                          htmlFor="baixa"
                          className="text-sm cursor-pointer font-normal"
                        >
                          Baixa
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Média" id="media" />
                        <Label
                          htmlFor="media"
                          className="text-sm cursor-pointer font-normal"
                        >
                          Média
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Alta" id="alta" />
                        <Label
                          htmlFor="alta"
                          className="text-sm cursor-pointer font-normal"
                        >
                          Alta
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-[1.02]"
            >
              Criar roteiro
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};
