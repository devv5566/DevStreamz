const axios = require('axios');

async function test() {
    console.log('Testing gdrivepro.xyz with redirects...');
    
    const url = 'https://gdrivepro.xyz/r.php?id=TTJvRHQwQU9CU0xwYzNqTGExS0I2RTJ6VjF5a28rRjlLRlFHM1VSL0V1QUlHSmZpOHUxOEx4aVV6V050OS9Vbw==';
    
    try {
        // Allow redirects and check all responses
        const response = await axios.get(url, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            maxRedirects: 10
        });
        
        console.log('Final URL:', response.request.res.responseUrl);
        console.log('Status:', response.status);
        console.log('Data length:', response.data?.length);
        
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.log('Status:', e.response.status);
            console.log('Final URL:', e.response.request?.res?.responseUrl);
        }
    }
}

test();