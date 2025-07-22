// ARQUIVO: netlify/functions/get-transcript.js

const { YouTubeTranscript } = require('youtube-transcript');

exports.handler = async (event) => {
  const videoID = event.queryStringParameters.videoID;

  if (!videoID) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O ID do vídeo não foi fornecido.' }),
    };
  }

  try {
    // Tenta buscar a transcrição sem especificar o idioma.
    // Isso força a biblioteca a procurar por qualquer transcrição disponível,
    // incluindo as geradas automaticamente.
    const transcriptArray = await YouTubeTranscript.fetchTranscript(videoID);

    // Se não encontrar nada, lança um erro.
    if (!transcriptArray || transcriptArray.length === 0) {
      throw new Error("A biblioteca não retornou nenhuma transcrição.");
    }

    // Junta o texto em um único parágrafo.
    const fullText = transcriptArray.map(item => item.text).join(' ');

    return {
      statusCode: 200,
      body: JSON.stringify({ text: fullText }),
    };

  } catch (error) {
    // Se, mesmo assim, falhar, retorna uma mensagem de erro clara.
    console.error(`ERRO FINAL na busca da transcrição para ${videoID}:`, error);
    return {
      statusCode: 200,
      body: JSON.stringify({
        text: `FALHA: Mesmo sabendo que a transcrição existe, a biblioteca não conseguiu extraí-la.`,
      }),
    };
  }
};
