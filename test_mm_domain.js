const axios = require('axios');

// Test MoviesMod domain fetch
async function testMoviesMod() {
    console.log('Testing MoviesMod domain fetch...');
    try {
        const response = await axios.get('https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json', { timeout: 10000 });
        console.log('Domain JSON:', response.data);
    } catch (e) {
        console.error('Error fetching domains:', e.message);
    }
}

testMoviesMod();