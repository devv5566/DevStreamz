const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  try {
    const urls = ['https://uhdmovies.ink/search/Avengers%20Endgame', 'https://uhdmovies.ink/?s=Avengers%20Endgame'];
    for (const url of urls) {
      console.log('URL', url);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://google.com',
          'Connection': 'keep-alive'
        },
        timeout: 20000,
        validateStatus: () => true
      });
      console.log('status', response.status);
      console.log('len', response.data.length);
      const $ = cheerio.load(response.data);
      console.log('title', $('title').text());
      console.log('articles', $('article').length);
      console.log('download links', $('a[href*="/download-"]').length);
      console.log('---');
    }
  } catch (err) {
    console.error(err);
  }
})();