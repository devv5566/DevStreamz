const axios = require('axios');
const cheerio = require('cheerio');

async function testMoviesMod() {
    const domain = 'https://moviesmod.farm';
    const searchUrl = `${domain}/?s=Fight%20Club%201999`;
    console.log('Testing MoviesMod search:', searchUrl);
    try {
        const response = await axios.get(searchUrl, { 
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        // Check for the selector used in the code
        console.log('.latestPost found:', $('.latestPost').length);
        
        // Check what's actually there
        console.log('\nChecking article elements:');
        $('article').each((i, el) => {
            const title = $(el).find('h2, h3, .entry-title').first().text().trim();
            const link = $(el).find('a').first().attr('href');
            if (title || link) console.log(`Article ${i}:`, title?.substring(0, 50), link?.substring(0, 50));
        });
        
        console.log('\nChecking for .post- elements:');
        $('.post').each((i, el) => {
            const title = $(el).find('h2').first().text().trim();
            const link = $(el).find('a').first().attr('href');
            if (title) console.log(`Post ${i}:`, title?.substring(0, 80));
        });
        
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testMoviesMod();