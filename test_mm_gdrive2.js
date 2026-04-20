const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    console.log('Testing gdrivepro.xyz link resolution...');
    
    const url = 'https://gdrivepro.xyz/r.php?id=TTJvRHQwQU9CU0xwYzNqTGExS0I2RTJ6VjF5a28rRjlLRlFHM1VSL0V1QUlHSmZpOHUxOEx4aVV6V050OS9Vbw==';
    
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
        
        // Check for forms
        const form = $('form');
        console.log('Forms found:', form.length);
        
        if (form.length > 0) {
            const action = form.attr('action');
            const inputs = form.find('input');
            console.log('Form action:', action);
            console.log('Input count:', inputs.length);
            form.find('input').each((i, el) => {
                console.log(`Input ${i}:`, $(el).attr('name'), '=', $(el).attr('value')?.substring(0, 30));
            });
        }
        
        // Check meta refresh
        const meta = $('meta[http-equiv="refresh"]');
        console.log('Meta refresh:', meta.length);
        
        // Check for JavaScript
        const scripts = $('script');
        console.log('Scripts:', scripts.length);
        
        // Check for iframe
        const iframe = $('iframe');
        console.log('Iframes:', iframe.length);
        if (iframe.length > 0) {
            console.log('Iframe src:', iframe.attr('src'));
        }
        
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();