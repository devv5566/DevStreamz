const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    console.log('Testing MoviesMod intermediate link resolution...');
    
    const urls = [
        'https://links.modpro.blog/archives/7464',
        'https://links.modpro.blog/archives/7465', 
        'https://posts.modpro.blog/archives/30214'
    ];
    
    for (const url of urls) {
        console.log(`\n=== Testing: ${url} ===`);
        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            console.log('Status:', response.status);
            console.log('Data length:', response.data.length);
            
            const $ = cheerio.load(response.data);
            
            // Check for download links
            const links = $('a');
            console.log('Total links:', links.length);
            
            // Find links with actual hrefs
            $('a[href]').each((i, el) => {
                const href = $(el).attr('href');
                const text = $(el).text().trim();
                if (href && (href.includes('drive') || href.includes('cloud') || href.includes('drop'))) {
                    console.log(`Link ${i}:`, text, '->', href);
                }
            });
            
        } catch (e) {
            console.error('Error:', e.message);
        }
    }
}

test();