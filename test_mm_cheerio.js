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
        
        // Try different selectors
        console.log('Checking for different elements...');
        console.log('.search-page found:', $('.search-page').length);
        console.log('.result-found found:', $('.result-found').length);
        console.log('.page-content found:', $('.page-content').length);
        console.log('h2 titles:', $('h2').length);
        
        // Print all h2 elements
        $('h2').each((i, el) => {
            const text = $(el).text().trim();
            if (text) console.log(`H2[${i}]:`, text.substring(0, 100));
        });
        
        // Check for any links that might be movie links
        const links = $('a');
        console.log('Total links:', links.length);
        
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testMoviesMod();