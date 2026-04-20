const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    console.log('Testing cloud.unblockedgames.world link resolution...');
    
    const url = 'https://cloud.unblockedgames.world/?sid=a3Y4azk3STZ5RVphb1c0d0pkeDllbjluV0NSTDRXNWlOSmJZTDFBU1RwM3AwTEJSbHhsejZLcmNYQzFsVGV2QkxMUmpsdURZR3hQNEo5c2g2UHhoMWRBNmt2dWQzZWx3ZjU1dkhTT3FySFNHK1EvNENEdUJia1ZtMmxuRjVPN1dHZ2FGVFc1R1pwdklNWG9VNnM0NHcrQXNGY0FCQUNWa0JGcGN3YmZUNThhb1NucGNldFVodEpsU0Y0VGkrY0tOaU1hTmllYWpHRlpSRFVDMk1ZUlc3OUlrRld5Q3AwL3llMm1HNDk4ZkZveDNoMmVFcTZBTEs1Z3dXbDRzeWZOMw==';
    
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('Status:', response.status);
        console.log('Data length:', response.data.length);
        
        const $ = cheerio.load(response.data);
        
        // Check for forms with _wp_http
        const form = $('#landing');
        console.log('Landing form found:', form.length);
        
        if (form.length > 0) {
            const action = form.attr('action');
            const wp_http = form.find('input[name="_wp_http"]').val();
            console.log('Action:', action);
            console.log('_wp_http:', wp_http);
        }
        
        // Check for meta refresh
        const metaRefresh = $('meta[http-equiv="refresh"]');
        console.log('Meta refresh found:', metaRefresh.length);
        
        // Check for JavaScript redirects
        const scripts = $('script');
        console.log('Scripts found:', scripts.length);
        
        // Check body content
        console.log('\nBody text (first 500 chars):');
        console.log($('body').text().substring(0, 500));
        
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();