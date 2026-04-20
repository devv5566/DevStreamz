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
        
        // Check the .latestPost element
        console.log('.latestPost found:', $('.latestPost').length);
        
        $('.latestPost').each((i, el) => {
            const linkElement = $(el).find('a');
            const title = linkElement.attr('title');
            const url = linkElement.attr('href');
            console.log(`LatestPost ${i}:`);
            console.log('  Title:', title);
            console.log('  URL:', url);
        });
        
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testMoviesMod();