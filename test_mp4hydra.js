const { getMP4HydraStreams } = require('./providers/MP4Hydra.js');

async function test() {
    console.log('Testing MP4Hydra with movie ID 550 (Fight Club)...');
    try {
        const streams = await getMP4HydraStreams('550', 'movie');
        console.log('Result:', streams.length, 'streams found');
        console.log(JSON.stringify(streams, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();