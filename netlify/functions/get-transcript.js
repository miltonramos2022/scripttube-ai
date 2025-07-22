// ARQUIVO: netlify/functions/get-transcript.js

// Importando a nova e mais poderosa biblioteca
const { Innertube } = require('youtubei.js');

exports.handler = async (event) => {
  const videoID = event.queryStringParameters.videoID;

  if (!videoID) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O ID do vídeo não foi fornecido.' }),
    };
  }

  try {
    // Inicia a nova biblioteca
    const youtube = await Innertube.create();

    // Pede a transcrição para o YouTube
    const transcript = await youtube.getTranscript(videoID);

    // Se não encontrar, lança um erro
    if (!transcript || !transcript.content || transcript.content.length === 0) {
      throw new Error("A biblioteca youtubei.js não retornou uma transcrição.");
    }

    // Formata o texto
    const fullText = transcript.content.map(item => item.text).join(' ');

    return {
      statusCode: 200,
      body: JSON.stringify({ text: fullText }),
    };

  } catch (error) {
    console.error(`ERRO com a biblioteca youtubei.js para o vídeo ${videoID}:`, error);
    return {
      statusCode: 200,
      body: JSON.stringify({
        text: `FALHA FINAL: A biblioteca alternativa (youtubei.js) também não conseguiu extrair a transcrição. O vídeo pode ter alguma proteção.`,
      }),
    };
  }
};
