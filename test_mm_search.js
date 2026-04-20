const axios = require('axios');

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
        console.log('Status:', response.status);
        console.log('Data length:', response.data?.length);
        // Check if it has movie cards
        if (response.data && response.data.includes('movie-card')) {
            console.log('Found movie-card elements');
        } else {
            console.log('No movie-card found - checking response...');
            // Print first 2000 chars
            console.log(response.data.substring(0, 2000));
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testMoviesMod();