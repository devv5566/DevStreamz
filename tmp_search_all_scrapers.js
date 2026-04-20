const { spawnSync } = require('child_process');
const scripts = [
  'scrapersdirect/4khdhub-extractor.js',
  'scrapersdirect/animeflix_scraper.js',
  'scrapersdirect/animepahe-scraper.js',
  'scrapersdirect/dramadrip_scraper.js',
  'scrapersdirect/hdhub4u-scraper.js',
  'scrapersdirect/moviesdrive-extractor.js',
  'scrapersdirect/moviesmod_scraper.js',
  'scrapersdirect/myflixer-extractor.js',
  'scrapersdirect/topmovies_scraper.js'
];
const query = 'Avengers Endgame';
for (const script of scripts) {
  console.log(`=== ${script} ===`);
  const result = spawnSync('node', [script, query], { stdio: 'inherit' });
  if (result.error) {
    console.error(`Error launching ${script}:`, result.error.message);
  }
  console.log('');
}
