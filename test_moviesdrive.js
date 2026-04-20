// Set debug before requiring
process.env.DEBUG = 'true';

const { getMoviesDriveStreams } = require('./providers/moviesdrive.js');

async function test() {
    console.log('Testing MoviesDrive with movie ID 550 (Fight Club)...');
    try {
        const streams = await getMoviesDriveStreams('550', 'movie');
        console.log('Result:', streams.length, 'streams found');
        console.log(JSON.stringify(streams, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
        console.error(e.stack);
    }
}

test();