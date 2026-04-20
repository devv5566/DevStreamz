const { getStreamContent } = require('./providers/vidsrcextractor.js');

async function test() {
    console.log('Testing VidSrc with movie ID 550 (Fight Club)...');
    try {
        const streams = await getStreamContent('tt0137523', 'movie');
        console.log('Result:', streams.length, 'streams found');
        console.log(JSON.stringify(streams, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();