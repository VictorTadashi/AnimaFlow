import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatPanel from "@/components/ChatPanel";
import PreviewPanel from "@/components/PreviewPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code, Eye, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAssistantChat } from "@/hooks/useAssistantChat";
import { useToast } from "@/components/ui/use-toast";
export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}
const Editor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentHtml, setCurrentHtml] = useState<string>("");
  const { sendMessage, extractHtmlFromMessage, isLoading } = useAssistantChat();

  // Função para remover código HTML das mensagens do chat
  const cleanMessageForChat = (content: string): string => {
    // Remove blocos de código HTML (```html...```)
    let cleanContent = content.replace(/```html\n[\s\S]*?\n```/g, "");

    // Remove HTML direto (<!DOCTYPE html>...)</html>)
    cleanContent = cleanContent.replace(
      /<!DOCTYPE html>[\s\S]*?<\/html>/gi,
      ""
    );

    // Remove linhas vazias extras
    cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, "\n\n");

    // Se sobrou apenas espaços em branco, retorna uma mensagem padrão
    if (cleanContent.trim() === "") {
      return "Roteiro de aula gerado com sucesso! Você pode visualizar o resultado no painel à direita.";
    }
    return cleanContent.trim();
  };
  useEffect(() => {
    const initialPrompt = location.state?.initialPrompt;
    if (initialPrompt) {
      handleInitialPrompt(initialPrompt);
    }
  }, [location.state]);
  const handleInitialPrompt = async (prompt: string) => {
    const userMessage: Message = {
      id: "1",
      type: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages([userMessage]);
    try {
      console.log("Enviando prompt inicial:", prompt);
      const response = await sendMessage(prompt, 3); // 3 tentativas para prompt inicial
      if (response.status === "success") {
        // Extrair HTML primeiro
        const html = extractHtmlFromMessage(response.message);
        console.log("🧪 Prompt inicial - mensagem completa:", response.message);
        console.log("🧪 Prompt inicial - HTML extraído:", html);
        setCurrentHtml(html);

        // Limpar mensagem para o chat (sem HTML)
        const cleanMessage = cleanMessageForChat(response.message);
        const assistantMessage: Message = {
          id: "2",
          type: "assistant",
          content: cleanMessage,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        toast({
          title: "Roteiro criado com sucesso!",
          description: "O assistente gerou seu roteiro de aula.",
        });
      } else {
        throw new Error(response.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao processar prompt inicial:", error);
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        type: "assistant",
        content: `Desculpe, ocorreu um erro: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }. Verifique se a chave da API do OpenAI está configurada corretamente.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "Erro na comunicação",
        description: "Não foi possível conectar com o assistente.",
        variant: "destructive",
      });
    }
  };
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    try {
      console.log("Enviando mensagem:", content);
      const response = await sendMessage(content, 2); // 2 tentativas para mensagens do usuário
      if (response.status === "success") {
        // Extrair HTML primeiro
        const html = extractHtmlFromMessage(response.message);
        console.log(
          "🧪 Mensagem do usuário - mensagem completa:",
          response.message
        );
        console.log("🧪 Mensagem do usuário - HTML extraído:", html);

        if (html !== currentHtml) {
          setCurrentHtml(html);
        }

        // Limpar mensagem para o chat (sem HTML)
        const cleanMessage = cleanMessageForChat(response.message);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: cleanMessage,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        toast({
          title: "Resposta recebida!",
          description: "O assistente atualizou seu roteiro.",
        });
      } else {
        throw new Error(response.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage: Message = {
        id: "error-" + Date.now(),
        type: "assistant",
        content: `Desculpe, ocorreu um erro: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "Erro na comunicação",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-800">Ânima Flow</h1>
          </div>
        </div>

        <div className="flex items-center gap-2"></div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-1/2 border-r border-gray-200">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Preview Panel */}
        <div className="w-1/2">
          <PreviewPanel html={currentHtml} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
export default Editor;
