const axios = require('axios');
const cheerio = require('cheerio');
const bytes = require('bytes');
const levenshtein = require('fast-levenshtein');
const rot13Cipher = require('rot13-cipher');
const { URL } = require('url');
const path = require('path');
const fs = require('fs').promises;
const RedisCache = require('../utils/redisCache');

// Debug logging flag - set DEBUG=true to enable verbose logging
const DEBUG = process.env.DEBUG === 'true' || process.env['4KHDHUB_DEBUG'] === 'true';
const log = DEBUG ? console.log : () => { };
const logWarn = DEBUG ? console.warn : () => { };

// Cache configuration
const CACHE_ENABLED = process.env.DISABLE_CACHE !== 'true';
const CACHE_DIR = process.env.VERCEL ? path.join('/tmp', '.4khdhub_cache') : path.join(__dirname, '.cache', '4khdhub');
const redisCache = new RedisCache('4KHDHub');

// Helper to ensure cache directory exists
const ensureCacheDir = async () => {
    if (!CACHE_ENABLED) return;
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error) {
        console.error(`[4KHDHub] Error creating cache directory: ${error.message}`);
    }
};
ensureCacheDir();

// Domain configuration
let baseUrl = 'https://4khdhub.dad'; // Updated fallback domain
let domainCacheTimestamp = 0;
const DOMAIN_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';

// Polyfill for atob if not available globally
const atob = (str) => Buffer.from(str, 'base64').toString('binary');

// Fetch latest domain from GitHub
async function get4KHDHubDomain() {
    const now = Date.now();
    if (now - domainCacheTimestamp < DOMAIN_CACHE_TTL) {
        return baseUrl;
    }

    try {
        log('[4KHDHub] Fetching latest domain...');
        const response = await axios.get('https://raw.githubusercontent.com/phisher98/TVVVV/refs/heads/main/domains.json', { timeout: 10000 });
        if (response.data && response.data['4khdhub']) {
            baseUrl = response.data['4khdhub'];
            domainCacheTimestamp = now;
            log(`[4KHDHub] Updated domain to: ${baseUrl}`);
        } else {
            logWarn('[4KHDHub] Domain JSON fetched, but "4khdhub" key was not found. Using fallback.');
        }
    } catch (error) {
        console.error(`[4KHDHub] Failed to fetch latest domain, using fallback. Error: ${error.message}`);
    }
    return baseUrl;
}

// Helper to fetch text content
async function fetchText(url, options = {}) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                ...options.headers
            },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error(`[4KHDHub] Request failed for ${url}: ${error.message}`);
        return null;
    }
}

// Fetch TMDB Details
async function getTmdbDetails(tmdbId, type) {
    try {
        const isSeries = type === 'series' || type === 'tv';
        const url = `https://api.themoviedb.org/3/${isSeries ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_API_KEY}`;
        log(`[4KHDHub] Fetching TMDB details from: ${url}`);
        const response = await axios.get(url);
        const data = response.data;
        // ...

        if (isSeries) {
            return {
                title: data.name,
                year: data.first_air_date ? parseInt(data.first_air_date.split('-')[0]) : 0
            };
        } else {
            return {
                title: data.title,
                year: data.release_date ? parseInt(data.release_date.split('-')[0]) : 0
            };
        }
    } catch (error) {
        console.error(`[4KHDHub] TMDB request failed: ${error.message}`);
        return null;
    }
}

// FourKHDHub Logic
async function fetchPageUrl(name, year, isSeries) {
    const cacheKey = `search_v2_${name.replace(/[^a-z0-9]/gi, '_')}_${year}`;
    // [4KHDHub] Checking cache for key: ${cacheKey} (Enabled: ${CACHE_ENABLED})

    if (CACHE_ENABLED) {
        const cached = await redisCache.getFromCache(cacheKey, '', CACHE_DIR);
        if (cached) {
            // [4KHDHub] Cache HIT for search: ${name}
            return cached.data || cached;
        } else {
            // [4KHDHub] Cache MISS for search: ${name}
        }
    }

    const baseUrl = await get4KHDHubDomain();
    const searchUrl = `${baseUrl}/?s=${encodeURIComponent(`${name} ${year}`)}`;
    const html = await fetchText(searchUrl);
    if (!html) return null;

    const $ = cheerio.load(html);
    const targetType = isSeries ? 'Series' : 'Movies';

    const normalizeTitle = (value) => String(value || '')
        .toLowerCase()
        .replace(/\[.*?\]/g, ' ')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const targetTitleNorm = normalizeTitle(name);

    // Rank cards instead of hard filtering to avoid missing valid entries when site labels vary.
    const scoredCards = $('.movie-card')
        .map((_i, el) => {
            const formatText = $(el).find('.movie-card-format').text().trim().toLowerCase();
            const metaText = $(el).find('.movie-card-meta').text().trim();
            const movieCardYear = parseInt(metaText, 10);
            const movieCardTitle = $(el).find('.movie-card-title').text().trim();
            const cardTitleNorm = normalizeTitle(movieCardTitle);

            // New markup may keep the URL on the card anchor, not always on .movie-card itself.
            let href = $(el).attr('href') || $(el).find('a').first().attr('href');
            if (href && !href.startsWith('http')) {
                href = baseUrl + (href.startsWith('/') ? '' : '/') + href;
            }

            // Skip unusable cards early.
            if (!href || !cardTitleNorm) return null;

            let score = 0;
            if (isSeries) {
                if (formatText.includes('series')) score += 3;
            } else {
                if (formatText.includes('movie')) score += 3;
            }

            if (!isNaN(movieCardYear) && year) {
                const yearDiff = Math.abs(movieCardYear - year);
                if (yearDiff === 0) score += 4;
                else if (yearDiff === 1) score += 2;
                else if (yearDiff >= 2) score -= 2;
            }

            // Blend strict fuzzy distance with practical title containment.
            const distance = levenshtein.get(cardTitleNorm, targetTitleNorm);
            const maxLen = Math.max(cardTitleNorm.length, targetTitleNorm.length) || 1;
            const similarity = 1 - (distance / maxLen);
            if (similarity >= 0.85) score += 6;
            else if (similarity >= 0.7) score += 3;
            else if (cardTitleNorm.includes(targetTitleNorm) || targetTitleNorm.includes(cardTitleNorm)) score += 2;

            return { href, score, title: movieCardTitle, year: movieCardYear, formatText };
        })
        .get()
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

    const result = scoredCards.length > 0 ? scoredCards[0].href : null;
    if (CACHE_ENABLED && result) {
        await redisCache.saveToCache(cacheKey, { data: result }, '', CACHE_DIR, 86400); // 1 day TTL
    }
    return result;
}

async function resolveRedirectUrl(redirectUrl) {
    const cacheKey = `redirect_v2_${redirectUrl.replace(/[^a-z0-9]/gi, '')}`;
    if (CACHE_ENABLED) {
        const cached = await redisCache.getFromCache(cacheKey, '', CACHE_DIR);
        if (cached) return cached.data || cached;
    }

    const redirectHtml = await fetchText(redirectUrl);
    if (!redirectHtml) return null;

    try {
        const redirectDataMatch = redirectHtml.match(/'o','(.*?)'/);
        if (!redirectDataMatch) return null;

        // JSON.parse(atob(rot13Cipher(atob(atob(redirectDataMatch[1] as string)))))
        const step1 = atob(redirectDataMatch[1]);
        const step2 = atob(step1);
        const step3 = rot13Cipher(step2);
        const step4 = atob(step3);
        const redirectData = JSON.parse(step4);

        if (redirectData && redirectData.o) {
            const resolved = atob(redirectData.o);
            if (CACHE_ENABLED) {
                await redisCache.saveToCache(cacheKey, { data: resolved }, '', CACHE_DIR, 86400 * 3); // 3 days
            }
            return resolved;
        }
    } catch (e) {
        console.error(`[4KHDHub] Error resolving redirect: ${e.message}`);
    }
    return null;
}

async function extractSourceResults($, el) {
    const localHtml = $(el).html();
    const sizeMatch = localHtml.match(/([\d.]+ ?[GM]B)/);
    let heightMatch = localHtml.match(/\d{3,}p/);

    const title = $(el).find('.file-title, .episode-file-title').text().trim();

    // If quality detection failed from HTML, try the title
    if (!heightMatch) {
        heightMatch = title.match(/(\d{3,4})p/i);
    }

    // Fallback for "4K"
    let height = heightMatch ? parseInt(heightMatch[0]) : 0;
    if (height === 0 && (title.includes('4K') || title.includes('4k') || localHtml.includes('4K') || localHtml.includes('4k'))) {
        height = 2160;
    }

    const meta = {
        bytes: sizeMatch ? bytes.parse(sizeMatch[1]) : 0,
        height: height,
        title: title
    };

    // Check for HubCloud link
    let hubCloudLink = $(el).find('a')
        .filter((_i, a) => $(a).text().includes('HubCloud'))
        .attr('href');

    if (hubCloudLink) {
        const resolved = await resolveRedirectUrl(hubCloudLink);
        return { url: resolved, meta };
    }

    // Check for HubDrive link
    let hubDriveLink = $(el).find('a')
        .filter((_i, a) => $(a).text().includes('HubDrive'))
        .attr('href');

    if (hubDriveLink) {
        const resolvedDrive = await resolveRedirectUrl(hubDriveLink);
        if (resolvedDrive) {
            const hubDriveHtml = await fetchText(resolvedDrive);
            if (hubDriveHtml) {
                const $2 = cheerio.load(hubDriveHtml);
                const innerCloudLink = $2('a:contains("HubCloud")').attr('href');
                if (innerCloudLink) {
                    return { url: innerCloudLink, meta };
                }
            }
        }
    }

    return null;
}

// HubCloud Extractor Logic
async function extractHubCloud(hubCloudUrl, baseMeta) {
    if (!hubCloudUrl) return [];

    const cacheKey = `hubcloud_v2_${hubCloudUrl.replace(/[^a-z0-9]/gi, '')}`;
    if (CACHE_ENABLED) {
        const cached = await redisCache.getFromCache(cacheKey, '', CACHE_DIR);
        if (cached) return cached.data || cached;
    }

    const headers = { Referer: hubCloudUrl }; // or should it be the previous page? User's code uses meta.referer ?? url.href. HubCloud.ts says Referer: meta.referer ?? url.href.
    // In extractInternal(ctx, url, meta): const headers = { Referer: meta.referer ?? url.href };
    // Then fetches redirectHtml.

    // We'll trust the url itself as referer if we don't have the parent page readily passed down, or just no referer.
    // Let's use the HubCloud URL itself as referer for the first request, that's usually safe or standard.

    const redirectHtml = await fetchText(hubCloudUrl, { headers: { Referer: hubCloudUrl } });
    if (!redirectHtml) return [];

    const redirectUrlMatch = redirectHtml.match(/var url ?= ?'(.*?)'/);
    if (!redirectUrlMatch) return [];

    const finalLinksUrl = redirectUrlMatch[1];
    const linksHtml = await fetchText(finalLinksUrl, { headers: { Referer: hubCloudUrl } });
    if (!linksHtml) return [];

    const $ = cheerio.load(linksHtml);
    const results = [];
    const sizeText = $('#size').text();
    const titleText = $('title').text().trim();

    // Combine meta from page with baseMeta (user's code does this)
    const currentMeta = {
        ...baseMeta,
        bytes: bytes.parse(sizeText) || baseMeta.bytes,
        title: titleText || baseMeta.title
    };

    // FSL Links
    $('a').each((_i, el) => {
        const text = $(el).text();
        const href = $(el).attr('href');
        if (!href) return;

        if (text.includes('FSL') || text.includes('Download File')) {
            results.push({
                source: 'FSL',
                url: href,
                meta: currentMeta
            });
        }
        else if (text.includes('PixelServer')) {
            const pixelUrl = href.replace('/u/', '/api/file/');
            results.push({
                source: 'PixelServer',
                url: pixelUrl,
                meta: currentMeta
            });
        }
    });

    if (CACHE_ENABLED && results.length > 0) {
        await redisCache.saveToCache(cacheKey, { data: results }, '', CACHE_DIR, 3600); // 1 hour TTL
    }

    return results;
}

async function get4KHDHubStreams(tmdbId, type, season = null, episode = null) {
    const tmdbDetails = await getTmdbDetails(tmdbId, type);
    if (!tmdbDetails) return [];

    const { title, year } = tmdbDetails;
    log(`[4KHDHub] Search: ${title} (${year})`);

    const isSeries = type === 'series' || type === 'tv';
    const pageUrl = await fetchPageUrl(title, year, isSeries);
    if (!pageUrl) {
        log(`[4KHDHub] Page not found`);
        return [];
    }
    log(`[4KHDHub] Found page: ${pageUrl}`);

    const html = await fetchText(pageUrl);
    if (!html) return [];
    const $ = cheerio.load(html);

    let itemsToProcess = [];

    if (isSeries && season && episode) { // Use isSeries here
        // Find specific season and episode
        const seasonStr = `S${String(season).padStart(2, '0')}`;
        const episodeStr = `Episode-${String(episode).padStart(2, '0')}`;

        $('.episode-item').each((_i, el) => {
            if ($('.episode-title', el).text().includes(seasonStr)) {
                const downloadItems = $('.episode-download-item', el)
                    .filter((_j, item) => $(item).text().includes(episodeStr));

                downloadItems.each((_k, item) => {
                    itemsToProcess.push(item);
                });
            }
        });
    } else {
        // Movies
        $('.download-item').each((_i, el) => {
            itemsToProcess.push(el);
        });
    }

    log(`[4KHDHub] Processing ${itemsToProcess.length} items`);

    const streams = [];

    for (const item of itemsToProcess) {
        try {
            const sourceResult = await extractSourceResults($, item);
            if (sourceResult && sourceResult.url) {
                log(`[4KHDHub] Extracting from HubCloud: ${sourceResult.url}`);
                const extractedLinks = await extractHubCloud(sourceResult.url, sourceResult.meta);

                for (const link of extractedLinks) {
                    streams.push({
                        name: `4KHDHub - ${link.source} ${sourceResult.meta.height ? sourceResult.meta.height + 'p' : ''}`,
                        title: `${link.meta.title}\n${bytes.format(link.meta.bytes || 0)}`,
                        url: link.url,
                        quality: sourceResult.meta.height ? `${sourceResult.meta.height}p` : undefined,
                        behaviorHints: {
                            bingeGroup: `4khdhub-${link.source}`
                        }
                    });
                }
            }
        } catch (err) {
            console.error(`[4KHDHub] Item processing error: ${err.message}`);
        }
    }

    return streams;
}

module.exports = { get4KHDHubStreams };