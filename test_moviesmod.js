const { getMoviesModStreams } = require('./providers/moviesmod.js');

async function test() {
    console.log('Testing MoviesMod with movie ID 550 (Fight Club)...');
    try {
        const streams = await getMoviesModStreams('550', 'movie');
        console.log('Result:', streams.length, 'streams found');
        console.log(JSON.stringify(streams, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();