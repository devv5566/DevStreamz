const axios = require('axios');

async function test() {
    // Try the old tech.unblockedgames.world domain to see if it still works
    const oldUrl = 'https://tech.unblockedgames.world/?sid=test123';
    console.log('Testing tech.unblockedgames.world...');
    
    try {
        const response = await axios.get(oldUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        console.log('Status:', response.status);
        console.log('Data length:', response.data?.length);
    } catch (e) {
        console.log('Error:', e.message);
    }
}

test();