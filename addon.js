require('dotenv').config();

const { addonBuilder } = require('stremio-addon-sdk');
const manifest = require('./manifest.json');
const {
    getStreamsFromTmdbId,
    convertImdbToTmdb,
    sortStreamsByQuality
} = require('./providers/Showbox.js');
let get4KHDHubStreams = null;
try {
    ({ get4KHDHubStreams } = require('./providers/4khdhub.js'));
} catch (_) {
    get4KHDHubStreams = null;
}

const builder = new addonBuilder(manifest);

const ENABLE_SHOWBOX_PROVIDER = process.env.ENABLE_SHOWBOX_PROVIDER !== 'false';
const ENABLE_4KHDHUB_PROVIDER = process.env.ENABLE_4KHDHUB_PROVIDER !== 'false' && typeof get4KHDHubStreams === 'function';

function getRequestConfig() {
    return (global.getRequestConfig ? global.getRequestConfig() : null) || global.currentRequestConfig || {};
}

function parseProviderSelection(rawProviders) {
    if (!rawProviders || typeof rawProviders !== 'string') {
        return null; // null = all enabled providers
    }
    return rawProviders
        .split(',')
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);
}

function shouldFetchProvider(selectedProviders, providerId) {
    if (!selectedProviders) return true;
    return selectedProviders.includes(providerId);
}

function normalizeShowboxStreams(streams) {
    return (streams || []).map((stream) => {
        const quality = stream.quality || 'ORG';
        const size = stream.size || 'Unknown';
        const titleLine = stream.title || 'ShowBox Stream';
        const detailParts = [];
        if (Array.isArray(stream.codecs) && stream.codecs.length > 0) {
            detailParts.push(stream.codecs.join(' • '));
        }
        detailParts.push(size);
        const detailLine = detailParts.join(' • ');

        return {
            name: `⚡ ShowBox ${quality}`,
            title: `${titleLine}\n${detailLine}`,
            url: stream.url,
            quality: stream.quality,
            size: stream.size,
            behaviorHints: stream.behaviorHints || { notWebReady: true }
        };
    });
}

function normalize4khdhubStreams(streams) {
    return (streams || []).map((stream) => ({
        name: stream.name || '4KHDHub',
        title: stream.title || '4KHDHub Stream',
        url: stream.url,
        quality: stream.quality,
        size: stream.size,
        behaviorHints: stream.behaviorHints || { notWebReady: true }
    }));
}

function toStremioStream(stream) {
    return {
        name: stream.name,
        title: stream.title,
        url: stream.url,
        type: 'url',
        availability: 2,
        behaviorHints: stream.behaviorHints || { notWebReady: true }
    };
}

builder.defineStreamHandler(async (args) => {
    const { type, id } = args;
    if (type !== 'movie' && type !== 'series' && type !== 'tv') {
        return { streams: [] };
    }

    const requestConfig = getRequestConfig();
    const selectedProviders = parseProviderSelection(requestConfig.providers);
    const userRegionPreference = requestConfig.region || null;
    const userCookie = requestConfig.cookie || null;
    const userScraperApiKey = requestConfig.scraper_api_key || null;
    const cookieArray = Array.isArray(requestConfig.cookies) ? requestConfig.cookies : [];
    const allCookies = [];

    if (userCookie && userCookie.trim()) {
        allCookies.push(userCookie.trim());
    }
    for (const c of cookieArray) {
        if (typeof c === 'string' && c.trim() && !allCookies.includes(c.trim())) {
            allCookies.push(c.trim());
        }
    }

    let tmdbId = null;
    let tmdbType = null;
    let seasonNum = null;
    let episodeNum = null;

    const idParts = String(id).split(':');
    if (idParts[0] === 'tmdb') {
        tmdbId = idParts[1];
        tmdbType = type === 'movie' ? 'movie' : 'tv';
        if (idParts.length >= 4 && (type === 'series' || type === 'tv')) {
            seasonNum = parseInt(idParts[2], 10);
            episodeNum = parseInt(idParts[3], 10);
        }
    } else if (String(id).startsWith('tt')) {
        let imdbId = String(id);
        if ((type === 'series' || type === 'tv') && idParts.length >= 3) {
            imdbId = idParts[0];
            seasonNum = parseInt(idParts[1], 10);
            episodeNum = parseInt(idParts[2], 10);
        }
        const converted = await convertImdbToTmdb(imdbId, userRegionPreference, type);
        if (!converted || !converted.tmdbId || !converted.tmdbType) {
            return { streams: [] };
        }
        tmdbId = converted.tmdbId;
        tmdbType = converted.tmdbType;
    } else {
        return { streams: [] };
    }

    const streamBuckets = [];

    if (ENABLE_SHOWBOX_PROVIDER && shouldFetchProvider(selectedProviders, 'showbox')) {
        try {
            const showboxStreams = await getStreamsFromTmdbId(
                tmdbType,
                tmdbId,
                seasonNum,
                episodeNum,
                userRegionPreference,
                allCookies,
                userScraperApiKey
            );
            const normalized = normalizeShowboxStreams(showboxStreams);
            streamBuckets.push(...normalized);
        } catch (error) {
            console.warn(`[ShowBox] Failed to fetch streams: ${error.message}`);
        }
    }

    if (ENABLE_4KHDHUB_PROVIDER && shouldFetchProvider(selectedProviders, '4khdhub')) {
        try {
            const hubStreams = await get4KHDHubStreams(tmdbId, tmdbType, seasonNum, episodeNum);
            const normalized = normalize4khdhubStreams(hubStreams);
            streamBuckets.push(...normalized);
        } catch (error) {
            console.warn(`[4KHDHub] Failed to fetch streams: ${error.message}`);
        }
    }

    if (streamBuckets.length === 0) {
        return { streams: [] };
    }

    const sorted = sortStreamsByQuality(streamBuckets);
    const stremioStreams = sorted.map(toStremioStream);
    return { streams: stremioStreams };
});

module.exports = builder.getInterface();
