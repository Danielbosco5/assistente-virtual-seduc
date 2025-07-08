const { ActivityHandler, MessageFactory, TurnContext, MicrosoftAppCredentials } = require('botbuilder');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const { askSeducAssistant } = require('./services/geminiService');

class SeducBot extends ActivityHandler {
    constructor() {
        super();

        this.chatHistories = new Map();
        this.learningSessions = new Map(); // For learning mode state per conversation
        this.knowledgeFilePath = path.resolve(__dirname, '..', 'knowledge_base.json'); // Path to shared knowledge file

        // Lida com a entrada de novos membros na conversa (boas-vindas)
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    const botName = context.activity.recipient.name || 'AssistenteTeams';
                    const welcomeText = `Olá! Sou o Assistente Virtual da SEDUC-GO. Estou aqui para ajudar com suas dúvidas sobre os sistemas e programas da Secretaria.\n\nComo posso te ajudar hoje? 😊\n\n_Para interagir em um grupo, por favor, me mencione (@${botName}) no início da sua pergunta._`;
                    await context.sendActivity(MessageFactory.text(welcomeText));
                }
            }
            await next();
        });

        // Lida com o recebimento de mensagens
        this.onMessage(async (context, next) => {
            const isMessage = context.activity.type === 'message';
            const hasContent = context.activity.text || (context.activity.attachments && context.activity.attachments.length > 0);

            if (!isMessage || !hasContent) {
                await next();
                return;
            }

            if (context.activity.conversation.isGroup) {
                const botMentioned = TurnContext.getMentions(context.activity)
                    .some(mention => mention.mentioned.id === context.activity.recipient.id);
                if (!botMentioned) {
                    await next();
                    return;
                }
            }
            
            await context.sendActivity({ type: 'typing' });

            const userInputRaw = TurnContext.removeRecipientMention(context.activity) || '';
            const userInput = userInputRaw.trim();
            const conversationId = context.activity.conversation.id;

            const learnCommand = process.env.LEARN_COMMAND;
            const cancelLearnCommand = process.env.CANCEL_LEARN_COMMAND || 'parar';

            // --- Learning Logic ---
            const isLearning = this.learningSessions.get(conversationId);

            if (isLearning) {
                this.learningSessions.delete(conversationId); // Exit learning mode after one message
                if (userInput.toLowerCase() === cancelLearnCommand.toLowerCase()) {
                    await context.sendActivity(MessageFactory.text('Modo de aprendizado cancelado.'));
                } else {
                    await this.learnNewInformation(context, userInput);
                }
                await next();
                return;
            }

            if (learnCommand && userInput.toLowerCase() === learnCommand.toLowerCase()) {
                this.learningSessions.set(conversationId, true);
                await context.sendActivity(MessageFactory.text(`Modo de aprendizado ativado. Por favor, insira a nova informação ou correção que devo aprender. Para sair, digite '${cancelLearnCommand}'.`));
                await next();
                return;
            }
            // --- End of Learning Logic ---

            if (!this.chatHistories.has(conversationId)) {
                this.chatHistories.set(conversationId, []);
            }
            const history = this.chatHistories.get(conversationId);

            let imagePart = null;
            if (context.activity.attachments && context.activity.attachments.length > 0) {
                const imageAttachment = context.activity.attachments.find(att => att.contentType?.startsWith('image'));
                if (imageAttachment) {
                    try {
                        imagePart = await this.downloadImageAsBase64(imageAttachment);
                    } catch (error) {
                        console.error("Erro ao baixar anexo de imagem:", error);
                        await context.sendActivity("Desculpe, não consegui processar a imagem que você enviou. Verifique se as credenciais do bot estão corretas e tente novamente.");
                    }
                }
            }
            
            const currentUserParts = [];
            if (imagePart) currentUserParts.push(imagePart);
            if (userInput) {
                currentUserParts.push({ text: userInput });
            } else if (imagePart) {
                currentUserParts.push({ text: "Pode me ajudar com esta imagem, por favor?" });
            }

            if (currentUserParts.length === 0) {
                await next();
                return;
            }

            const assistantResponse = await askSeducAssistant(history, currentUserParts);

            if (assistantResponse.error) {
                await context.sendActivity(MessageFactory.text(assistantResponse.error));
            } else {
                let finalMessage = assistantResponse.text;

                if (assistantResponse.sources && assistantResponse.sources.length > 0) {
                    const sourcesText = assistantResponse.sources
                        .map(source => `* [${source.title || source.uri}](${source.uri})`)
                        .join('\n');
                    finalMessage += `\n\n---\n**Fontes Consultadas:**\n${sourcesText}`;
                }

                history.push({ role: "user", parts: currentUserParts });
                history.push({ role: "model", parts: [{ text: assistantResponse.text }] });

                if (history.length > 20) { 
                    this.chatHistories.set(conversationId, history.slice(-20));
                }
                
                await context.sendActivity(MessageFactory.text(finalMessage));
            }
            
            await next();
        });
    }

    /**
     * Saves new information to the knowledge base file.
     * @param {import('botbuilder').TurnContext} context The bot context.
     * @param {string} newKnowledge The new piece of information to learn.
     */
    async learnNewInformation(context, newKnowledge) {
        if (!newKnowledge) return;

        try {
            let knowledgeData = { learnedEntries: [] };
            try {
                const fileContent = await fs.readFile(this.knowledgeFilePath, 'utf8');
                knowledgeData = JSON.parse(fileContent);
            } catch (error) {
                if (error.code !== 'ENOENT') { // ENOENT means file doesn't exist, which is fine, we'll create it.
                    throw error;
                }
            }
            
            knowledgeData.learnedEntries = knowledgeData.learnedEntries || [];
            knowledgeData.learnedEntries.push(newKnowledge);

            await fs.writeFile(this.knowledgeFilePath, JSON.stringify(knowledgeData, null, 2), 'utf8');

            const confirmationMessage = `Obrigado! Aprendi a seguinte informação e irei considerá-la em futuras conversas:\n\n*_"${newKnowledge}"_*`;
            await context.sendActivity(MessageFactory.text(confirmationMessage));

        } catch (error) {
            console.error("Erro ao salvar nova informação no arquivo de conhecimento:", error);
            await context.sendActivity(MessageFactory.text("Desculpe, ocorreu um erro e não consegui salvar a nova informação. Por favor, verifique os logs do servidor."));
        }
    }


    /**
     * Baixa uma imagem de um anexo do Teams e a converte para base64.
     * @param {import('botbuilder').Attachment} attachment O anexo da imagem.
     * @returns {Promise<object|null>} Uma parte de conteúdo para a API Gemini ou null em caso de erro.
     */
    async downloadImageAsBase64(attachment) {
        // As credenciais são necessárias para obter um token de autenticação para baixar o anexo
        const credentials = new MicrosoftAppCredentials(process.env.MicrosoftAppId, process.env.MicrosoftAppPassword);
        const token = await credentials.getToken();

        const imageResponse = await axios.get(attachment.contentUrl, {
            responseType: 'arraybuffer',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const imageBase64 = Buffer.from(imageResponse.data, 'binary').toString('base64');
        return { inlineData: { mimeType: attachment.contentType, data: imageBase64 } };
    }
}

module.exports.SeducBot = SeducBot;