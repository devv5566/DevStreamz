// Set DEBUG environment BEFORE requiring the module
process.env.DEBUG = 'true';
process.env.MOVIESMOD_DEBUG = 'true';

const { getMoviesModStreams } = require('./providers/moviesmod.js');

async function test() {
    console.log('Testing MoviesMod with movie ID 550 (Fight Club)...');
    try {
        // Clear cache by passing a unique query param or just run fresh
        const streams = await getMoviesModStreams('550', 'movie');
        console.log('\n\n=== FINAL RESULT ===');
        console.log('Result:', streams.length, 'streams found');
        console.log(JSON.stringify(streams, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
        console.error(e.stack);
    }
}

test();