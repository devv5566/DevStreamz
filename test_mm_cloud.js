const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    console.log('Testing cloud.unblockedgames.world link resolution...');
    
    const url = 'https://cloud.unblockedgames.world/?sid=a3Y4azk3STZ5RVphb1c0d0pkeDllbjluV0NSTDRXNWlOSmJZTDFBU1RwM3AwTEJSbHhsejZLcmNYQzFsVGV2QkxMUmpsdURZR3hQNEo5c2g2UHhoMWRBNmt2dWQzZWx3ZjU1dkhTT3FySFNHK1EvNENEdUJia1ZtMmxuRjVPN1dHZ2FGVFc1R1pwdklNWG9VNnM0NHcrQXNGY0FCQUNWa0JGcGN3YmZUNThhb1NucGNldFVodEpsU0Y0VGkrY0tOaU1hTmllYWpHRlpSRFVDMk1ZUlc3OUlrRld5Q3AwL3llMm1HNDk4ZkZveDNoMmVFcTZBTEs1Z3dXbDRzeWZOMw==';
    
    console.log('Fetching URL:', url);
    
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });
        
        console.log('Status:', response.status);
        console.log('Headers:', JSON.stringify(response.headers, null, 2));
        
    } catch (e) {
        if (e.response) {
            console.log('Status:', e.response.status);
            console.log('Headers:', JSON.stringify(e.response.headers, null, 2));
            if (e.response.headers.location) {
                console.log('Redirect to:', e.response.headers.location);
            }
        } else {
            console.error('Error:', e.message);
        }
    }
}

test();