const { get4KHDHubStreams } = require('./providers/4khdhub.js');

async function test() {
    console.log('Testing 4KHDHub with movie ID 550 (Fight Club)...');
    try {
        const streams = await get4KHDHubStreams('550', 'movie');
        console.log('Result:', streams.length, 'streams found');
        console.log(JSON.stringify(streams, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();