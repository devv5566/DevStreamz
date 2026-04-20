const { getVidZeeStreams } = require('./providers/VidZee.js');

async function test() {
    console.log('Testing VidZee with movie ID 550 (Fight Club)...');
    try {
        const streams = await getVidZeeStreams('550', 'movie');
        console.log('Result:', streams.length, 'streams found');
        console.log(JSON.stringify(streams, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();