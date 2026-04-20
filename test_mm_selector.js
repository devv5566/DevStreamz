const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const url = 'https://links.modpro.blog/archives/7465';
    console.log('Testing:', url);
    
    const response = await axios.get(url, {
        timeout: 15000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    
    const $ = cheerio.load(response.data);
    
    // Test what the current code is looking for
    console.log('\n--- Current code selectors (tech.unblockedgames.world) ---');
    console.log('.entry-content a[href*="tech.unblockedgames.world"]:', $('.entry-content a[href*="tech.unblockedgames.world"]').length);
    console.log('article a[href*="tech.unblockedgames.world"]:', $('article a[href*="tech.unblockedgames.world"]').length);
    
    // Test what SHOULD be looked for (cloud.unblockedgames.world)
    console.log('\n--- Updated selectors (cloud.unblockedgames.world) ---');
    console.log('.entry-content a[href*="cloud.unblockedgames.world"]:', $('.entry-content a[href*="cloud.unblockedgames.world"]').length);
    console.log('article a[href*="cloud.unblockedgames.world"]:', $('article a[href*="cloud.unblockedgames.world"]').length);
    
    // Show all relevant links
    console.log('\n--- All download-type links found ---');
    $('a').each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        if (href.includes('unblockedgames') || href.includes('gdrive') || href.includes('onedrive')) {
            console.log(`Link: "${text}" -> ${href}`);
        }
    });
}

test();