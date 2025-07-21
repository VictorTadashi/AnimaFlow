
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const ASSISTANT_ID = 'asst_x73uyEtK0Ye5upLjW63hbA7A';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, threadId } = await req.json();
    
    console.log('=== CHAT WITH ASSISTANT - INÍCIO ===');
    console.log('Mensagem recebida:', message);
    console.log('Thread ID recebido:', threadId);

    // Verificar se a API key está configurada
    if (!openAIApiKey) {
      console.error('❌ ERRO CRÍTICO: OPENAI_API_KEY não encontrada nas variáveis de ambiente');
      return new Response(JSON.stringify({ 
        error: 'Chave da API do OpenAI não configurada. Por favor, configure a variável OPENAI_API_KEY no Supabase.',
        status: 'error',
        errorType: 'missing_api_key'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar se a API key parece válida
    if (!openAIApiKey.startsWith('sk-')) {
      console.error('❌ ERRO: API key parece ser inválida (não começa com sk-)');
      return new Response(JSON.stringify({ 
        error: 'Chave da API do OpenAI parece ser inválida. Verifique se está no formato correto.',
        status: 'error',
        errorType: 'invalid_api_key_format'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ API key encontrada e parece válida');

    let currentThreadId = threadId;

    // Criar thread se não existir
    if (!currentThreadId) {
      console.log('🔄 Criando nova thread...');
      try {
        const threadResponse = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        
        if (!threadResponse.ok) {
          const errorText = await threadResponse.text();
          console.error('❌ Erro ao criar thread:', threadResponse.status, errorText);
          
          if (threadResponse.status === 401) {
            return new Response(JSON.stringify({ 
              error: 'Chave da API do OpenAI é inválida ou expirou. Verifique suas credenciais.',
              status: 'error',
              errorType: 'invalid_api_key'
            }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          throw new Error(`Falha ao criar thread: ${threadResponse.status} - ${errorText}`);
        }
        
        const threadData = await threadResponse.json();
        currentThreadId = threadData.id;
        console.log('✅ Thread criada com sucesso:', currentThreadId);
      } catch (error) {
        console.error('❌ Erro ao criar thread:', error);
        throw error;
      }
    }

    // Adicionar mensagem à thread
    console.log('📝 Adicionando mensagem à thread...');
    try {
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: message
        })
      });

      if (!messageResponse.ok) {
        const errorText = await messageResponse.text();
        console.error('❌ Erro ao adicionar mensagem:', messageResponse.status, errorText);
        throw new Error(`Falha ao adicionar mensagem: ${messageResponse.status} - ${errorText}`);
      }

      console.log('✅ Mensagem adicionada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao adicionar mensagem:', error);
      throw error;
    }

    // Executar o assistente
    console.log('🤖 Executando assistente...');
    try {
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID
        })
      });

      if (!runResponse.ok) {
        const errorText = await runResponse.text();
        console.error('❌ Erro ao executar assistente:', runResponse.status, errorText);
        throw new Error(`Falha ao executar assistente: ${runResponse.status} - ${errorText}`);
      }

      const runData = await runResponse.json();
      const runId = runData.id;
      console.log('✅ Execução iniciada:', runId);

      // Aguardar conclusão com timeout aumentado
      let run = runData;
      let attempts = 0;
      const maxAttempts = 120; // Aumentado para 120 segundos (2 minutos)
      
      while ((run.status === 'queued' || run.status === 'in_progress') && attempts < maxAttempts) {
        console.log(`⏳ Status da execução: ${run.status} (tentativa ${attempts + 1}/${maxAttempts})`);
        
        // Intervalo progressivo: 1s primeiros 30s, depois 2s
        const interval = attempts < 30 ? 1000 : 2000;
        await new Promise(resolve => setTimeout(resolve, interval));
        
        try {
          const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'OpenAI-Beta': 'assistants=v2'
            }
          });
          
          if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            console.error('❌ Erro ao verificar status:', statusResponse.status, errorText);
            throw new Error(`Falha ao verificar status: ${statusResponse.status} - ${errorText}`);
          }
          
          run = await statusResponse.json();
          attempts++;
        } catch (error) {
          console.error('❌ Erro ao verificar status da execução:', error);
          throw error;
        }
      }

      console.log(`🔍 Status final da execução: ${run.status}`);

      if (run.status !== 'completed') {
        if (attempts >= maxAttempts) {
          console.error('❌ Timeout: Execução demorou mais que o esperado');
          return new Response(JSON.stringify({ 
            error: 'O assistente está processando sua solicitação há mais de 2 minutos. Isso pode indicar uma consulta complexa. Tente reformular sua pergunta de forma mais específica ou aguarde alguns minutos antes de tentar novamente.',
            status: 'error',
            errorType: 'timeout',
            details: {
              attempts: attempts,
              maxAttempts: maxAttempts,
              lastStatus: run.status,
              suggestions: [
                'Tente reformular sua pergunta de forma mais específica',
                'Divida consultas complexas em partes menores',
                'Aguarde alguns minutos antes de tentar novamente'
              ]
            }
          }), {
            status: 408,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (run.status === 'failed') {
          console.error('❌ Execução falhou:', run.last_error);
          return new Response(JSON.stringify({ 
            error: `Falha na execução do assistente: ${run.last_error?.message || 'Erro desconhecido'}`,
            status: 'error',
            errorType: 'execution_failed',
            details: {
              runId: runId,
              lastError: run.last_error,
              suggestions: [
                'Tente reformular sua pergunta',
                'Verifique se sua solicitação está clara e específica',
                'Aguarde alguns minutos antes de tentar novamente'
              ]
            }
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (run.status === 'cancelled') {
          console.error('❌ Execução foi cancelada');
          return new Response(JSON.stringify({ 
            error: 'A execução foi cancelada. Tente novamente.',
            status: 'error',
            errorType: 'execution_cancelled'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (run.status === 'expired') {
          console.error('❌ Execução expirou');
          return new Response(JSON.stringify({ 
            error: 'A execução expirou. Tente novamente com uma pergunta mais específica.',
            status: 'error',
            errorType: 'execution_expired'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        console.error('❌ Execução em estado inesperado:', run.status);
        return new Response(JSON.stringify({ 
          error: `Execução em estado inesperado: ${run.status}`,
          status: 'error',
          errorType: 'execution_unexpected',
          details: {
            runStatus: run.status,
            runId: runId
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('✅ Execução concluída com sucesso, buscando mensagens...');

      // Buscar mensagens da thread
      try {
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!messagesResponse.ok) {
          const errorText = await messagesResponse.text();
          console.error('❌ Erro ao buscar mensagens:', messagesResponse.status, errorText);
          throw new Error(`Falha ao buscar mensagens: ${messagesResponse.status} - ${errorText}`);
        }

        const messagesData = await messagesResponse.json();
        const assistantMessage = messagesData.data[0];
        
        if (!assistantMessage || !assistantMessage.content || !assistantMessage.content[0]) {
          console.error('❌ Resposta do assistente vazia ou mal formada');
          throw new Error('Resposta do assistente está vazia');
        }

        console.log('✅ Resposta do assistente obtida com sucesso');
        console.log('=== CHAT WITH ASSISTANT - SUCESSO ===');

        return new Response(JSON.stringify({
          threadId: currentThreadId,
          message: assistantMessage.content[0].text.value,
          status: 'success'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('❌ Erro ao buscar mensagens:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Erro na execução do assistente:', error);
      throw error;
    }

  } catch (error) {
    console.error('=== CHAT WITH ASSISTANT - ERRO ===');
    console.error('Tipo do erro:', typeof error);
    console.error('Erro completo:', error);
    console.error('Stack trace:', error.stack);
    
    let errorMessage = 'Erro interno do servidor';
    let errorType = 'internal_error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Categorizar diferentes tipos de erro
      if (error.message.includes('API key')) {
        errorType = 'api_key_error';
        statusCode = 401;
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        errorType = 'timeout_error';
        statusCode = 408;
      } else if (error.message.includes('rate limit')) {
        errorType = 'rate_limit_error';
        statusCode = 429;
      } else if (error.message.includes('thread') || error.message.includes('Thread')) {
        errorType = 'thread_error';
        statusCode = 400;
      }
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      status: 'error',
      errorType: errorType,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
