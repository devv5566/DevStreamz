const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    console.log('Testing tech.unblockedgames.world with a real SID...');
    
    // Use a real SID from the moviesmod result
    const url = 'https://tech.unblockedgames.world/?sid=a3Y4azk3STZ5RVphb1c0d0pkeDllbjluV0NSTDRXNWlOSmJZTDFBU1RwM3AwTEJSbHhsejZLcmNYQzFsVGV2QkxMUmpsdURZR3hQNEo5c2g2UHhoMWRBNmt2dWQzZWx3ZjU1dkhTT3FySFNHK1EvNENEdUJia1ZtMmxuRjVPN1dHZ2FGVFc1R1pwdklNWG9VNnM0NHcrQXNGY0FCQUNWa0JGcGN3YmZUNThhb1NucGNldFVodEpsU0Y0VGkrY0tOaU1hTmllYWpHRlpSRFVDMk1ZUlc3OUlrRld5Q3AwL3llMm1HNDk4ZkZveDNoMmVFcTZBTEs1Z3dXbDRzeWZOMw==';
    
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Data length:', response.data?.length);
        
        const $ = cheerio.load(response.data);
        
        // Check for landing form
        const form = $('#landing');
        console.log('Landing form:', form.length);
        
        if (form.length > 0) {
            const action = form.attr('action');
            const wp_http = form.find('input[name="_wp_http"]').val();
            console.log('Action:', action);
            console.log('_wp_http value present:', !!wp_http);
        }
        
    } catch (e) {
        console.log('Error:', e.message);
    }
}

test();