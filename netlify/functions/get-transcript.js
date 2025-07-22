// ARQUIVO: netlify/functions/get-transcript.js

const { YouTubeTranscript } = require('youtube-transcript' );

exports.handler = async (event) => {
  const videoID = event.queryStringParameters.videoID;

  if (!videoID) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O ID do vídeo não foi fornecido.' }),
    };
  }

  try {
    // Tenta buscar a transcrição, priorizando Português e depois Inglês
    const transcriptArray = await YouTubeTranscript.fetchTranscript(videoID, {
      lang: 'pt',
      country: 'BR',
    });

    if (!transcriptArray || transcriptArray.length === 0) {
      throw new Error("A transcrição retornada está vazia.");
    }

    const fullText = transcriptArray.map(item => item.text).join(' ');

    return {
      statusCode: 200,
      body: JSON.stringify({ text: fullText }),
    };

  } catch (error) {
    // Se falhar (ex: pt não existe), loga o erro e retorna uma mensagem clara
    console.error(`Não foi possível obter a transcrição para o vídeo ${videoID}:`, error);
    return {
      statusCode: 200, // Mantemos 200 para não quebrar o front-end
      body: JSON.stringify({
        text: `INFO: Este vídeo não possui uma transcrição que eu consiga ler.`,
      }),
    };
  }
};
