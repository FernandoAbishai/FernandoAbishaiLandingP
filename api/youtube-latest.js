// /api/youtube-latest.js (Vercel Serverless Function)
const fetch = require('node-fetch');

const YOUTUBE_CHANNEL_ID = 'UCScHfd5xGCYSLPKirOb_psg';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const MIN_DURATION_SECONDS = 180; // 3 minutos

function parseISODuration(iso) {
  // Solo soporta PT#M#S y PT#S
  const match = iso.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const min = parseInt(match[1] || '0', 10);
  const sec = parseInt(match[2] || '0', 10);
  return min * 60 + sec;
}

module.exports = async (req, res) => {
  try {
    // 1. Obtener hasta 25 videos recientes
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=25`;
    const videosRes = await fetch(searchUrl);
    const videosData = await videosRes.json();
    if (!videosData.items || videosData.items.length === 0) {
      return res.status(404).json({ error: 'No se encontraron videos recientes.' });
    }
    // Solo IDs de videos (no playlists, no canales)
    const videoIds = videosData.items
      .filter(item => item.id.kind === 'youtube#video')
      .map(item => item.id.videoId);
    if (videoIds.length === 0) {
      return res.status(404).json({ error: 'No se encontraron videos recientes.' });
    }

    // 2. Obtener detalles (duración) de estos videos
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds.join(',')}&part=snippet,contentDetails`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();
    if (!detailsData.items || detailsData.items.length === 0) {
      return res.status(404).json({ error: 'No se pudieron obtener detalles de los videos.' });
    }

    // 3. Filtrar solo videos largos (más de 3 minutos)
    const longVideos = detailsData.items.filter(item => {
      const duration = parseISODuration(item.contentDetails.duration);
      return duration > MIN_DURATION_SECONDS;
    }).slice(0, 3);

    if (longVideos.length === 0) {
      return res.status(404).json({ error: 'No se encontraron videos largos recientes.' });
    }

    // 4. Solo enviar los datos necesarios al frontend
    const result = longVideos.map(item => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id}`
    }));

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.status(200).json({ videos: result });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};
