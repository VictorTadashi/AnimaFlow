import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/pages/Editor";

export interface AssistantResponse {
  threadId: string;
  message: string;
  status: "success" | "error";
  error?: string;
  errorType?: string;
  timestamp?: string;
}

export const useAssistantChat = () => {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (
    message: string,
    retries: number = 1
  ): Promise<AssistantResponse> => {
    setIsLoading(true);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log("=== USEASSISTANTCHAT - INÍCIO ===");
        console.log(
          `Enviando mensagem para o assistente (tentativa ${attempt}/${retries}):`,
          message
        );
        console.log("Thread ID atual:", threadId);

        const { data, error } = await supabase.functions.invoke(
          "chat-with-assistant",
          {
            body: {
              message,
              threadId,
            },
          }
        );

        if (error) {
          console.error("❌ Erro na função Supabase:", error);

          // Tratamento específico para diferentes tipos de erro
          let userFriendlyMessage = "Erro de comunicação com o assistente";
          let shouldRetry = false;

          if (error.message.includes("OPENAI_API_KEY")) {
            userFriendlyMessage =
              "Chave da API do OpenAI não configurada. Entre em contato com o administrador.";
          } else if (
            error.message.includes("invalid") &&
            error.message.includes("key")
          ) {
            userFriendlyMessage =
              "Chave da API do OpenAI é inválida. Verifique a configuração.";
          } else if (error.message.includes("timeout")) {
            userFriendlyMessage =
              "O assistente está demorando para responder. Tente novamente.";
            shouldRetry = true;
          } else if (error.message.includes("rate limit")) {
            userFriendlyMessage =
              "Muitas solicitações. Aguarde um momento antes de tentar novamente.";
            shouldRetry = true;
          } else if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            userFriendlyMessage =
              "Erro de conexão. Verifique sua internet e tente novamente.";
            shouldRetry = true;
          }

          const errorObj = new Error(userFriendlyMessage);
          lastError = errorObj;

          // Retry para erros específicos
          if (shouldRetry && attempt < retries) {
            console.log(
              `⏳ Tentando novamente em 2 segundos... (tentativa ${
                attempt + 1
              }/${retries})`
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }

          throw errorObj;
        }

        console.log("✅ Resposta da função Supabase recebida:", data);

        if (data.status === "error") {
          console.error("❌ Erro retornado pela função:", data);

          // Tratamento específico baseado no tipo de erro
          let userFriendlyMessage =
            data.error || "Erro desconhecido do assistente";
          let shouldRetry = false;

          switch (data.errorType) {
            case "missing_api_key":
              userFriendlyMessage =
                "Configuração da API não encontrada. Entre em contato com o suporte.";
              break;
            case "invalid_api_key":
            case "invalid_api_key_format":
              userFriendlyMessage =
                "Problema de autenticação com o OpenAI. Verifique a configuração.";
              break;
            case "timeout":
            case "timeout_error":
              userFriendlyMessage =
                data.error || "O assistente está demorando para responder.";
              // Adicionar sugestões do servidor se disponíveis
              if (data.details?.suggestions) {
                userFriendlyMessage +=
                  "\n\nSugestões:\n" +
                  data.details.suggestions.map((s) => `• ${s}`).join("\n");
              }
              shouldRetry = true;
              break;
            case "rate_limit_error":
              userFriendlyMessage =
                "Limite de uso atingido. Aguarde alguns minutos antes de tentar novamente.";
              shouldRetry = true;
              break;
            case "execution_failed":
              userFriendlyMessage =
                data.error || "Falha na execução do assistente.";
              if (data.details?.suggestions) {
                userFriendlyMessage +=
                  "\n\nSugestões:\n" +
                  data.details.suggestions.map((s) => `• ${s}`).join("\n");
              }
              break;
            case "execution_cancelled":
              userFriendlyMessage =
                "A execução foi cancelada. Tente novamente.";
              shouldRetry = true;
              break;
            case "execution_expired":
              userFriendlyMessage =
                "A execução expirou. Tente com uma pergunta mais específica.";
              break;
            default:
              userFriendlyMessage = data.error;
          }

          const errorObj = new Error(userFriendlyMessage);
          lastError = errorObj;

          // Retry para erros específicos
          if (shouldRetry && attempt < retries) {
            console.log(
              `⏳ Tentando novamente em 3 segundos... (tentativa ${
                attempt + 1
              }/${retries})`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
            continue;
          }

          throw errorObj;
        }

        if (data.status === "success") {
          console.log("✅ Sucesso! Atualizando thread ID:", data.threadId);
          setThreadId(data.threadId);
        }

        console.log("=== USEASSISTANTCHAT - SUCESSO ===");
        setIsLoading(false);
        return data;
      } catch (error) {
        console.error("=== USEASSISTANTCHAT - ERRO ===");
        console.error(
          `Erro capturado (tentativa ${attempt}/${retries}):`,
          error
        );
        console.error("Tipo do erro:", typeof error);

        let errorMessage = "Erro de comunicação com o assistente";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        lastError = error instanceof Error ? error : new Error(errorMessage);

        // Log detalhado para debugging
        console.error("Detalhes do erro:");
        console.error("- Mensagem:", errorMessage);
        console.error("- Thread ID:", threadId);
        console.error("- Tentativa:", `${attempt}/${retries}`);
        console.error("- Timestamp:", new Date().toISOString());

        // Se é a última tentativa, sai do loop
        if (attempt === retries) {
          break;
        }

        // Caso contrário, aguarda e tenta novamente
        console.log(
          `⏳ Tentando novamente em 2 segundos... (tentativa ${
            attempt + 1
          }/${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Chegou aqui porque todas as tentativas falharam
    setIsLoading(false);
    return {
      threadId: threadId || "",
      message: "",
      status: "error",
      error: lastError?.message || "Erro inesperado após todas as tentativas",
      errorType: "client_error",
      timestamp: new Date().toISOString(),
    };
  };

  const extractHtmlFromMessage = (message: string): string => {
    console.log(
      "🔍 Extraindo HTML da mensagem:",
      message?.substring(0, 100) + "..."
    );

    // Extrair HTML da resposta do assistente
    const htmlMatches = message.match(/```html\n([\s\S]*?)```/g);
    if (htmlMatches && htmlMatches.length > 0) {
      const fullHtml = htmlMatches
        .map((block) => block.replace(/```html\n|```/g, ""))
        .join("\n");
      return fullHtml;
    }

    // Se não encontrar HTML em markdown, procurar por tags HTML diretas
    const directHtmlMatch = message.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    if (directHtmlMatch) {
      console.log("✅ HTML direto encontrado");
      return directHtmlMatch[0];
    }

    // Se não encontrar HTML, gerar um HTML básico com o conteúdo
    console.log("⚠️ HTML não encontrado, gerando HTML básico");
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Roteiro de Aula</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background: #f8f9fa;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #333;
            margin-bottom: 1rem;
        }
        .section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border-left: 4px solid #007bff;
            background: #f8f9ff;
        }
        .activity {
            background: #e8f5e8;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 5px;
        }
        .time-block {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .error-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-notice">
            <h3>⚠️ Conteúdo Parcial</h3>
            <p>O HTML completo não foi encontrado na resposta. Exibindo conteúdo disponível:</p>
        </div>
        <h1>🎓 Roteiro de Aula</h1>
        <div class="content">
            ${message.replace(/\n/g, "<br>")}
        </div>
    </div>
</body>
</html>`;
  };

  return {
    sendMessage,
    extractHtmlFromMessage,
    isLoading,
    threadId,
  };
};
