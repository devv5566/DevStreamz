const axios = require('axios');

function extractUrlsFromText(text) {
    if (!text || typeof text !== 'string') return [];
    const out = new Set();
    const patterns = [
        /https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/gi,
        /https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/gi
    ];
    for (const pattern of patterns) {
        const matches = text.match(pattern) || [];
        for (const m of matches) out.add(m);
    }
    return Array.from(out);
}

async function getVixsrcStreams(tmdbId, mediaType, seasonNum = null, episodeNum = null) {
    try {
        let url;
        if (mediaType === 'movie') {
            url = `https://vixsrc.to/movie/${tmdbId}`;
        } else {
            if (seasonNum === null || episodeNum === null) return [];
            url = `https://vixsrc.to/tv/${tmdbId}/${seasonNum}/${episodeNum}`;
        }

        const response = await axios.get(url, {
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const urls = extractUrlsFromText(String(response.data));
        return urls.map((streamUrl) => ({
            name: 'VixSrc',
            title: 'VixSrc Stream',
            url: streamUrl,
            quality: /2160|4k/i.test(streamUrl) ? '2160p' : (/1080/i.test(streamUrl) ? '1080p' : 'ORG'),
            behaviorHints: { notWebReady: true }
        }));
    } catch (error) {
        console.warn(`[VixSrc] Failed: ${error.message}`);
        return [];
    }
}

module.exports = { getVixsrcStreams };
