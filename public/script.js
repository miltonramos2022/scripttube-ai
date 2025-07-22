// CÓDIGO COMPLETO E CORRIGIDO PARA script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuração Principal ---
    const API_KEY = 'AIzaSyBuzJR-5bqoefZYmVaTmWiQTVSR-4POefM'; 

    // --- Seleção dos Elementos do HTML ---
    const generateButton = document.getElementById('generate-button');
    const resultsContainer = document.getElementById('results-container');
    const downloadAllButton = document.getElementById('download-all-button');
    const urlInput = document.getElementById('url-input');
    const videoCountInput = document.getElementById('video-count-input');
    const orderSelect = document.getElementById('order-select');

    // --- Variável para guardar os dados da busca ---
    let currentVideosData = [];

    // --- Estado Inicial da Página ---
    downloadAllButton.style.display = 'none';
    resultsContainer.innerHTML = '';

    // --- Função Auxiliar: Extrai o ID do vídeo de diferentes formatos de URL ---
    function getYouTubeVideoId(url) {
        let videoId = null;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('www.youtube.com')) {
                videoId = urlObj.searchParams.get('v');
            } else if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.substring(1);
            }
        } catch (e) { return null; }
        return videoId;
    }

    // --- Função Principal: Orquestra toda a busca ---
    async function fetchTopVideos() {
        // 1. Prepara a tela para uma nova busca
        resultsContainer.innerHTML = '<div class="spinner"></div>';
        downloadAllButton.style.display = 'none';
        currentVideosData = [];

        try {
            // 2. Valida a URL e extrai o ID do vídeo
            const videoUrl = urlInput.value;
            const videoId = getYouTubeVideoId(videoUrl);
            if (!videoId) { throw new Error('URL do vídeo inválida ou formato não suportado.'); }

            // 3. Busca o ID do Canal usando a API do YouTube
            const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}` );
            const channelData = await channelResponse.json();
            if (!channelData.items || channelData.items.length === 0) { throw new Error('Não foi possível encontrar o vídeo. Verifique o link ou a Chave de API.'); }
            const channelId = channelData.items[0].snippet.channelId;

            // 4. Busca a lista de vídeos do canal (Populares ou Recentes)
            const videoCount = videoCountInput.value;
            const selectedOrder = orderSelect.value;
            const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${videoCount}&order=${selectedOrder}&type=video&key=${API_KEY}` );
            const searchData = await searchResponse.json();

            // 5. Limpa a tela e prepara para mostrar os resultados
            resultsContainer.innerHTML = ''; 
            if (searchData.items.length > 0) {
                downloadAllButton.style.display = 'block';
                urlInput.value = '';
            } else {
                resultsContainer.innerHTML = '<p>Nenhum vídeo encontrado para este canal.</p>';
                return;
            }

            // 6. Para cada vídeo, mostra um placeholder e busca a transcrição
            for (const item of searchData.items) {
                const video = {
                    id: item.id.videoId,
                    title: item.snippet.title,
                    link: `http://googleusercontent.com/youtube.com/watch?v=${item.id.videoId}`,
                    transcription: 'Buscando transcrição...'
                };
                currentVideosData.push(video );

                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <h3>${video.title}</h3>
                    <p>Link: <a href="${video.link}" target="_blank">${video.link}</a></p>
                    <textarea readonly id="transcript-${video.id}">${video.transcription}</textarea>
                    <button class="copy-button">Copiar Transcrição</button>
                `;
                resultsContainer.appendChild(resultItem);
                
                // 7. Chama nosso "especialista" (Função Serverless) para pegar a transcrição
                fetch(`/.netlify/functions/get-transcript?videoID=${video.id}`)
                  .then(response => response.json())
                  .then(data => {
                    if (data.error) {
                      throw new Error(data.error);
                    }
                    const fullTranscript = data.text;
                    video.transcription = fullTranscript || 'Transcrição não disponível.';
                    document.getElementById(`transcript-${video.id}`).value = video.transcription;
                  })
                  .catch(error => {
                    console.error('Erro ao buscar transcrição:', error);
                    const errorMessage = `Erro: ${error.message}`;
                    video.transcription = errorMessage;
                    document.getElementById(`transcript-${video.id}`).value = errorMessage;
                  });
            }
        } catch (error) {
            // Em caso de qualquer erro na busca, mostra a mensagem na tela
            resultsContainer.innerHTML = `<p style="color: red;">Ocorreu um erro: ${error.message}</p>`;
            console.error('Detalhes do erro:', error);
        }
    }

    // --- Event Listeners para os botões ---
    generateButton.addEventListener('click', fetchTopVideos);

    resultsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-button')) {
            const button = event.target;
            const resultItem = button.closest('.result-item');
            const textarea = resultItem.querySelector('textarea');
            navigator.clipboard.writeText(textarea.value).then(() => {
                button.textContent = 'Copiado!';
                setTimeout(() => { button.textContent = 'Copiar Transcrição'; }, 2000);
            });
        }
    });

    downloadAllButton.addEventListener('click', () => {
        let allText = '';
        currentVideosData.forEach(video => {
            allText += `${video.title}\nLink: ${video.link}\n\n${video.transcription}\n\n--------------------------------------------------\n\n`;
        });
        navigator.clipboard.writeText(allText).then(() => {
            const originalText = downloadAllButton.textContent;
            downloadAllButton.textContent = 'Tudo Copiado com Sucesso!';
            setTimeout(() => { downloadAllButton.textContent = originalText; }, 3000);
        });
    });
});
