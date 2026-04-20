const axios = require('axios');

async function testMoviesMod() {
    const domain = 'https://moviesmod.farm';
    console.log('Testing MoviesMod domain reachability:', domain);
    try {
        const response = await axios.get(domain, { timeout: 10000, maxRedirects: 3 });
        console.log('Status:', response.status);
        console.log('Data length:', response.data?.length || 'N/A');
    } catch (e) {
        console.error('Error:', e.message);
        if (e.code === 'ENOTFOUND') console.error('Domain not found (DNS issue)');
        if (e.code === 'ECONNREFUSED') console.error('Connection refused');
        if (e.response) console.error('HTTP Status:', e.response.status);
    }
}

testMoviesMod();