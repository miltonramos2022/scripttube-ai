// ARQUIVO: netlify/functions/get-transcript.js

const { YouTubeTranscript } = require('youtube-transcript');
const axios = require('axios'); // Importamos o axios

// Criamos uma instância do axios com um "disfarce" de navegador
const customAxios = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
  }
});

// A biblioteca youtube-transcript nos permite usar nosso próprio cliente http (o axios )
YouTubeTranscript.prototype.defaultClient = customAxios;

exports.handler = async (event) => {
  const videoID = event.queryStringParameters.videoID;

  if (!videoID) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O ID do vídeo não foi fornecido.' }),
    };
  }

  try {
    const transcriptArray = await YouTubeTranscript.fetchTranscript(videoID);

    if (!transcriptArray || transcriptArray.length === 0) {
      throw new Error("A transcrição retornada está vazia.");
    }

    const fullText = transcriptArray.map(item => item.text).join(' ');

    return {
      statusCode: 200,
      body: JSON.stringify({ text: fullText }),
    };

  } catch (error) {
    console.error(`Erro na função para o vídeo ${videoID}:`, error);
    return {
      statusCode: 200,
      body: JSON.stringify({
        text: `ERRO DO ESPECIALISTA: Não foi possível obter a transcrição. Verifique se o vídeo realmente possui uma.`,
      }),
    };
  }
};
