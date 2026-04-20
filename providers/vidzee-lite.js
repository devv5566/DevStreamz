const axios = require('axios');

function deepCollectUrls(node, urls) {
    if (!node) return;
    if (typeof node === 'string') {
        if (/^https?:\/\//i.test(node) && (node.includes('.m3u8') || node.includes('.mp4'))) {
            urls.add(node);
        }
        return;
    }
    if (Array.isArray(node)) {
        for (const item of node) deepCollectUrls(item, urls);
        return;
    }
    if (typeof node === 'object') {
        for (const value of Object.values(node)) deepCollectUrls(value, urls);
    }
}

async function getVidzeeLiteStreams(tmdbId) {
    const servers = [3, 4, 5];
    const collected = new Set();

    for (const sr of servers) {
        const url = `https://player.vidzee.wtf/api/server?id=${tmdbId}&sr=${sr}`;
        try {
            const response = await axios.get(url, {
                timeout: 20000,
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json,text/plain,*/*'
                }
            });
            deepCollectUrls(response.data, collected);
        } catch (error) {
            console.warn(`[VidZeeLite] Server ${sr} failed: ${error.message}`);
        }
    }

    return Array.from(collected).map((streamUrl) => ({
        name: 'VidZee',
        title: 'VidZee Stream',
        url: streamUrl,
        quality: /2160|4k/i.test(streamUrl) ? '2160p' : (/1080/i.test(streamUrl) ? '1080p' : 'ORG'),
        behaviorHints: { notWebReady: true }
    }));
}

module.exports = { getVidzeeLiteStreams };
