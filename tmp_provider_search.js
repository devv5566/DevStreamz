const axios = require('axios');
const cheerio = require('cheerio');

const query = 'Avengers Endgame';
const encoded = encodeURIComponent(query);
const providers = [
  {
    name: '4KHDHub',
    type: 'html',
    url: `https://4khdhub.dad/?s=${encoded}`,
    parse: html => {
      const $ = cheerio.load(html);
      const results = [];
      $('div.card-grid a, .movie-card a, a[href*="/movie/"]').each((i, el) => {
        const title = $(el).find('h3').text().trim() || $(el).text().trim();
        const url = $(el).attr('href');
        if (url && title) results.push({ title, url });
      });
      return [...new Map(results.map(r => [r.url, r])).values()];
    }
  },
  {
    name: 'HDHub4u',
    type: 'html',
    url: `https://hdhub4u.frl/?s=${encoded}`,
    parse: html => {
      const $ = cheerio.load(html);
      const results = [];
      $('figcaption, .thumbnail-wrapper, .post, .result-item').each((i, el) => {
        const link = $(el).find('a').first();
        const title = link.find('p').text().trim() || link.text().trim();
        const url = link.attr('href');
        if (url && title) results.push({ title, url });
      });
      return [...new Map(results.map(r => [r.url, r])).values()];
    }
  },
  {
    name: 'MoviesMod',
    type: 'html',
    url: `https://moviesmod.build/?s=${encoded}`,
    parse: html => {
      const $ = cheerio.load(html);
      const results = [];
      $('.latestPost').each((i, el) => {
        const link = $(el).find('a').first();
        const title = link.attr('title') || link.text().trim();
        const url = link.attr('href');
        if (url && title) results.push({ title, url });
      });
      return results;
    }
  },
  {
    name: 'TopMovies',
    type: 'html',
    url: `https://topmovies.rodeo/search/${encoded}`,
    parse: html => {
      const $ = cheerio.load(html);
      const results = [];
      $('.latestPost').each((i, el) => {
        const link = $(el).find('a').first();
        const title = link.attr('title') || link.text().trim();
        const url = link.attr('href');
        if (url && title) results.push({ title, url });
      });
      return results;
    }
  },
  {
    name: 'UHDMovies',
    type: 'html',
    url: `https://uhdmovies.ink/search/${encoded}`,
    parse: html => {
      const $ = cheerio.load(html);
      const results = [];
      $('article.gridlove-post').each((i, el) => {
        const link = $(el).find('a[href*="/download-"]').first();
        const title = link.attr('title') || $(el).find('h1.sanket').text().trim() || link.text().trim();
        const url = link.attr('href');
        if (url && title) results.push({ title, url });
      });
      if (results.length === 0) {
        $('article, .post, .search-result').each((i, el) => {
          const link = $(el).find('a').first();
          const title = link.text().trim();
          const url = link.attr('href');
          if (url && title) results.push({ title, url });
        });
      }
      return results;
    }
  },
  {
    name: 'MoviesDrive',
    type: 'html',
    url: `https://moviesdrive.design/page/1/?s=${encoded}`,
    parse: html => {
      const $ = cheerio.load(html);
      const results = [];
      $('ul.recent-movies > li').each((i, el) => {
        const link = $(el).find('figure > a').first();
        const title = $(el).find('figure > img').attr('title') || $(el).find('figure > img').attr('alt') || link.attr('title') || link.text().trim();
        const url = link.attr('href');
        if (url && title) results.push({ title, url });
      });
      return results;
    }
  },
  {
    name: 'DramaDrip',
    type: 'html',
    url: `https://dramadrip.com/?s=${encoded}`,
    parse: html => {
      const $ = cheerio.load(html);
      const results = [];
      $('article, .post, .result-item, .search-result').each((i, el) => {
        const link = $(el).find('a').first();
        const title = link.text().trim() || $(el).find('h3, h2').first().text().trim();
        const url = link.attr('href');
        if (url && title) results.push({ title, url });
      });
      return results;
    }
  },
  {
    name: 'SoaperTV',
    type: 'html',
    url: `https://soaper.cc/search.html?keyword=${encoded}`,
    parse: html => {
      const $ = cheerio.load(html);
      const results = [];
      $('.thumbnail').each((i, el) => {
        const link = $(el).find('h5 a').first();
        const title = link.text().trim();
        const url = link.attr('href');
        if (url && title) results.push({ title, url });
      });
      return results;
    }
  },
  {
    name: 'MovieBox',
    type: 'json',
    url: 'https://api.inmoviebox.com/wefeed-mobile-bff/subject-api/search/v2',
    method: 'post',
    body: { page: 1, perPage: 10, keyword: query },
    parse: data => {
      const results = [];
      const subjects = (data.data?.results || []).flatMap(result => result.subjects || []);
      for (const item of subjects) {
        if (item.subjectId || item.title) {
          results.push({ title: item.title || item.subjectName || '', id: item.subjectId || item.id || '' });
        }
      }
      return results;
    }
  }
];

(async () => {
  const out = [];
  for (const provider of providers) {
    process.stdout.write(`Checking ${provider.name}... `);
    try {
      const options = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 20000 };
      let response;
      if (provider.type === 'json') {
        response = await axios.post(provider.url, provider.body, { ...options, headers: { ...options.headers, 'Content-Type': 'application/json' } });
      } else {
        response = await axios.get(provider.url, options);
      }
      const results = provider.parse(response.data);
      console.log(`done (${results.length} found)`);
      out.push({ name: provider.name, success: results.length > 0, count: results.length, results: results.slice(0, 5) });
    } catch (error) {
      console.log(`ERROR: ${error.message}`);
      out.push({ name: provider.name, success: false, error: error.message, count: 0, results: [] });
    }
  }
  console.log('\n=== SUMMARY ===');
  for (const item of out) {
    console.log(`${item.name}: ${item.success ? 'RESULTS' : 'NO RESULTS'} (${item.count})${item.error ? ' - ' + item.error : ''}`);
    if (item.success) {
      item.results.forEach((r, i) => console.log(`  ${i + 1}. ${r.title} ${r.url ? '- '+r.url : ''}`));
    }
  }
})();
