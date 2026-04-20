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
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });
        
        console.log('Status:', response.status);
        console.log('Location:', response.headers.location);
        
    } catch (e) {
        if (e.response) {
            console.log('Status:', e.response.status);
            console.log('Location:', e.response.headers?.location);
        } else {
            console.error('Error:', e.message);
        }
    }
}

test();