# Assistente Virtual SEDUC-GO - Bot para Microsoft Teams

Este documento é um guia completo para configurar, executar e depurar o bot do Assistente Virtual da SEDUC-GO para Microsoft Teams utilizando o Visual Studio.

## Pré-requisitos

Antes de começar, certifique-se de que você possui:

1.  **Visual Studio**: Com a carga de trabalho **"Desenvolvimento de Node.js"** instalada.
2.  **Node.js**: Instalado em seu sistema (geralmente incluído na carga de trabalho do Node.js no VS).
3.  **ngrok**: Ferramenta para criar um túnel seguro para seu ambiente de desenvolvimento local. [Faça o download aqui](https://ngrok.com/download).
4.  **Conta do Azure**: Necessária para registrar o bot e obter as credenciais de autenticação.
5.  **Chave de API do Google Gemini**: Necessária para que o bot possa acessar o modelo de linguagem.

---

## Estrutura do Projeto

Entender a organização dos arquivos ajuda na manutenção do código:

-   `index.js`: Ponto de entrada da aplicação. Configura o servidor Express e o adaptador do Bot Framework.
-   `bot.js`: O coração do bot. Contém a classe `SeducBot` que lida com os eventos (mensagens, membros adicionados) e gerencia o fluxo da conversa.
-   `constants.js`: Armazena todas as constantes do projeto, como URLs, nome do modelo de IA e a instrução de sistema (prompt principal).
-   `/services/geminiService.js`: Um serviço isolado responsável por toda a comunicação com a API do Google Gemini.
-   `package.json`: Define as dependências do projeto e scripts.
-   `.env`: Arquivo local (não versionado) para armazenar chaves e segredos.
-   `knowledge_base.json`: Arquivo que armazena de forma persistente as informações ensinadas ao bot através do comando de aprendizado.

---

## Passo 1: Configuração do Projeto no Visual Studio

#### a. Abrir o Projeto

Abra o arquivo da solução (`.sln`) ou a pasta do projeto no Visual Studio.

#### b. Instalar Dependências

1.  No **Gerenciador de Soluções** (painel à direita), clique com o botão direito no arquivo `package.json`.
2.  Selecione **"Restaurar Pacotes"** (ou "Instalar Pacotes npm").
3.  Aguarde o Visual Studio baixar todas as dependências listadas no `package.json`. O progresso pode ser acompanhado na janela de Saída (Output).

#### c. Configurar Variáveis de Ambiente

Chaves secretas devem ser armazenadas em um arquivo `.env` para segurança.

1.  No **Gerenciador de Soluções**, clique com o botão direito no projeto (`AssistenteTeams`).
2.  Vá em **Adicionar > Novo Item...**.
3.  Escolha **"Arquivo de Texto"** e nomeie-o exatamente como **`.env`**.
    > **Atenção:** O nome do arquivo deve ser `.env`, sem extensão `.txt`. Se necessário, renomeie-o manualmente.
4.  Abra o arquivo `.env` e cole o seguinte conteúdo:

    ```env
    # Chave da API do Google Gemini (obrigatório)
    API_KEY="SUA_CHAVE_DA_API_DO_GEMINI_AQUI"

    # Credenciais do Bot do Azure (obrigatório para integração com o Teams)
    MicrosoftAppId=""
    MicrosoftAppPassword=""

    # Comando secreto para ativar o modo de aprendizado do bot (obrigatório)
    LEARN_COMMAND="AprendaSeduc-GO-2024"

    # Comando para cancelar/parar o modo de aprendizado (obrigatório)
    CANCEL_LEARN_COMMAND="parar"

    # Porta do servidor local do bot (opcional, padrão: 3978)
    PORT=3978
    ```

5.  Substitua `"SUA_CHAVE_DA_API_DO_GEMINI_AQUI"` pela sua chave real da API do Google Gemini. As credenciais da Microsoft serão preenchidas no Passo 3. Você pode alterar os valores de `LEARN_COMMAND` e `CANCEL_LEARN_COMMAND` se desejar.

---

## Passo 2: Execução Local e Exposição com ngrok

#### a. Iniciar o Bot Localmente

Na barra de ferramentas do Visual Studio, clique no botão "Iniciar" (ícone de triângulo verde). Isso iniciará o servidor Node.js. Uma janela de console aparecerá, confirmando que o bot está rodando (geralmente em `http://localhost:3978`).

#### b. Expor o Bot para a Internet com ngrok

O Microsoft Teams precisa de um endereço público (HTTPS) para se comunicar com seu bot. O `ngrok` cria esse endereço temporário.

1.  Abra um terminal (Prompt de Comando, PowerShell, etc.).
2.  Execute o comando para direcionar o tráfego do `ngrok` para a porta do seu bot:
    ```bash
    ngrok http 3978
    ```
3.  O `ngrok` exibirá algumas informações. Copie a URL **HTTPS** que ele fornecer (ex: `https://xxxx-xxxx.ngrok-free.app`).
    
4.  **Mantenha o `ngrok` e o bot em execução durante todo o processo.** Se o `ngrok` for reiniciado, a URL mudará e você precisará atualizá-la no Portal do Azure.

---

## Passo 3: Registro do Bot no Microsoft Azure

#### a. Criar o Recurso "Azure Bot"

1.  Faça login no [Portal do Azure](https://portal.azure.com).
2.  Clique em **"Criar um recurso"**, pesquise por **"Azure Bot"** e clique em **"Criar"**.
3.  Preencha as informações:
    *   **Identificador do Bot:** Um nome exclusivo para o seu bot.
    *   **Assinatura / Grupo de Recursos:** Escolha os apropriados.
    *   **Tipo de Aplicativo:** Selecione **"Multilocatário"**.

#### b. Configurar o Endpoint de Mensagens

Aqui conectamos o Azure ao seu bot local via `ngrok`.

1.  No recurso "Azure Bot" recém-criado, vá para a seção **"Configuração"**.
2.  No campo **"Endpoint de mensagens"**, cole a URL HTTPS do `ngrok` e adicione `/api/messages` ao final.
    *   Exemplo: `https://xxxx-xxxx.ngrok-free.app/api/messages`
3.  Clique em **"Aplicar"** para salvar.

#### c. Obter as Credenciais (App ID e Senha)

1.  Ainda na página de **"Configuração"**, copie o **"ID do Aplicativo Microsoft" (`MicrosoftAppId`)**.
2.  Ao lado, clique em **"Gerenciar Senha"**.
3.  Na tela de "Certificados e segredos", clique em **"+ Nova senha do cliente"**. Dê uma descrição e clique em **"Adicionar"**.
4.  **IMPORTANTE:** Copie imediatamente o **Valor** da senha gerada. Esta é sua `MicrosoftAppPassword` e ela **só é exibida uma vez**.

#### d. Atualizar o Arquivo `.env`

1.  Volte ao seu projeto no Visual Studio.
2.  Abra o arquivo `.env`.
3.  Cole o `MicrosoftAppId` e a `MicrosoftAppPassword` nos campos correspondentes.
4.  Salve o arquivo `.env`.
5.  **Reinicie o bot** no Visual Studio (clique em "Parar" e depois em "Iniciar") para carregar as novas credenciais.

---

## Passo 4: Adicionar o Canal do Teams e Testar

#### a. Adicionar o Canal do Microsoft Teams

1.  No seu recurso "Azure Bot" no Azure, vá para a seção **"Canais"**.
2.  Clique no ícone do **"Microsoft Teams"**.
3.  Aceite os termos e clique em "Aplicar". O canal será provisionado e adicionado à lista.

#### b. Testar o Bot no Teams

1.  Após adicionar o canal, clique novamente nele na lista de canais.
2.  Você verá um link para **"Abrir no Teams"**. Clique nele para iniciar uma conversa privada com o bot.
3.  Envie uma mensagem para testar a conversa.
4.  Para testar o modo de aprendizado, envie o comando secreto que você definiu no arquivo `.env` (ex: `AprendaSeduc-GO-2024`) e siga as instruções.
5.  Para testar em um grupo, adicione o bot a uma equipe e mencione-o usando `@NomeDoBot` seguido da sua pergunta.

Se tudo foi configurado corretamente, o bot responderá às suas mensagens no Microsoft Teams. Parabéns!