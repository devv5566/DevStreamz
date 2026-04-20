const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    console.log('Testing resolveIntermediateLink manually...');
    
    const url = 'https://links.modpro.blog/archives/7465';
    const refererUrl = 'https://moviesmod.farm/download-fight-club-1999-hindi-480p-720p-1080p/';
    
    const response = await axios.get(url, {
        timeout: 15000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': refererUrl
        }
    });
    
    const $ = cheerio.load(response.data);
    const finalLinks = [];
    
    // This is the new selector
    $('.entry-content a[href*="driveseed.org"], .entry-content a[href*="cloud.unblockedgames.world"], .entry-content a[href*="tech.unblockedgames.world"], .entry-content a[href*="tech.creativeexpressionsblog.com"], .entry-content a[href*="tech.examzculture.in"], article a[href*="driveseed.org"], article a[href*="cloud.unblockedgames.world"], article a[href*="tech.unblockedgames.world"], article a[href*="tech.creativeexpressionsblog.com"], article a[href*="tech.examzculture.in"]').each((i, el) => {
        const link = $(el).attr('href');
        const text = $(el).text().trim();
        if (link && text && 
            !text.toLowerCase().includes('batch') && 
            !text.toLowerCase().includes('comment') &&
            !text.toLowerCase().includes('our comment')) {
            finalLinks.push({
                server: text.replace(/\s+/g, ' '),
                url: link,
            });
        }
    });
    
    console.log('Final links found:', finalLinks.length);
    console.log(JSON.stringify(finalLinks, null, 2));
}

test();