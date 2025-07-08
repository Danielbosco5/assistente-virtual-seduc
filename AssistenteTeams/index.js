// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const { BotFrameworkAdapter } = require('botbuilder');
const { SeducBot } = require('./bot');

// Cria o servidor Express
const app = express();
// Middleware para entender JSON no corpo das requisições
app.use(express.json());

// Define a porta do servidor
const port = process.env.PORT || 3978;

// Inicia o servidor para escutar na porta definida
app.listen(port, () => {
    console.log(`\nServidor do bot rodando em http://localhost:${port}`);
    console.log('Endpoint de mensagens: /api/messages');
    console.log('Pressione CTRL+C ou o botão de Parar no Visual Studio para encerrar.');
});

// Configura o adaptador do Bot Framework com as credenciais do Azure
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Define um manipulador de erros para capturar falhas durante o processamento
adapter.onTurnError = async (context, error) => {
    console.error(`\n[onTurnError] Erro não tratado: ${error}`);
    // Envia uma notificação de erro para o Bot Framework Emulator (se estiver em uso)
    await context.sendTraceActivity('OnTurnError Trace', `${error}`, 'https://www.botframework.com/schemas/error', 'TurnError');
    // Envia uma mensagem de erro para o usuário
    await context.sendActivity('Ocorreu um erro interno no bot. Por favor, tente novamente.');
};

// Cria uma instância do nosso bot
const bot = new SeducBot();

// Define a rota principal que receberá as mensagens do Microsoft Teams
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Envia a atividade para o bot processar
        await bot.run(context);
    });
});
