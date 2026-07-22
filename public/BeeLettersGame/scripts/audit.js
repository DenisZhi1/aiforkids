'use strict';

/**
 * Bee Collector release audit.
 *
 * This script intentionally uses only Node.js built-ins so the repository can
 * be checked on GitHub Actions without installing packages or using a network.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const requested = process.argv[2];
const defaultIndex = path.resolve(__dirname, '..', 'index.html');
const developmentBuild = path.resolve(__dirname, '..', 'outputs', 'Bee Collector.html');
const target = requested ? path.resolve(process.cwd(), requested) : (fs.existsSync(defaultIndex) ? defaultIndex : developmentBuild);

const errors = [];
const warnings = [];
const passed = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);
const check = (condition, message) => condition ? passed.push(message) : fail(message);
const unique = (values) => [...new Set(values)];
const matches = (source, expression, group = 1) => [...source.matchAll(expression)].map(match => match[group]);

if (!fs.existsSync(target)) {
  console.error(`ERROR: File not found: ${target}`);
  process.exit(1);
}

const html = fs.readFileSync(target, 'utf8');
const sizeMiB = fs.statSync(target).size / 1024 / 1024;
const documentMarkup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

/* Document and metadata -------------------------------------------------- */
check(/^<!doctype html>/i.test(html), 'HTML5 doctype is present');
check(/<html\b[^>]*\blang="en"/i.test(html), 'Document language is English');
check(/<meta\b[^>]*charset="utf-8"/i.test(html), 'UTF-8 charset is declared');
check(/<meta\b[^>]*name="viewport"/i.test(html), 'Responsive viewport metadata is present');
check(/<meta\b[^>]*name="description"\s+content="[^"]{30,}"/i.test(html), 'Search description is present');
check(/<meta\b[^>]*name="theme-color"/i.test(html), 'Browser theme color is present');
check(/<meta\b[^>]*property="og:title"/i.test(html) && /<meta\b[^>]*property="og:description"/i.test(html), 'Social sharing metadata is present');
check(/<title>Bee Collector<\/title>/i.test(html), 'Page title is correct');
check(/<link\b[^>]*rel="icon"[^>]*href="data:image\//i.test(html), 'Favicon is embedded');
check(!/[\uFFFD]|(?:Ã.|Â.|â€|Ð.|Ñ.)/u.test(html), 'No obvious broken UTF-8 text was found');
if (sizeMiB > 10) warn(`Large single-file build: ${sizeMiB.toFixed(2)} MiB`);

/* HTML structure and accessibility ------------------------------------- */
const ids = matches(documentMarkup, /\bid="([^"]+)"/gi);
const duplicateIds = unique(ids.filter((id, index) => ids.indexOf(id) !== index));
check(duplicateIds.length === 0, `No duplicate HTML ids${duplicateIds.length ? `: ${duplicateIds.join(', ')}` : ''}`);

for (const reference of matches(documentMarkup, /\baria-labelledby="([^"]+)"/gi).flatMap(value => value.split(/\s+/))) {
  if (!ids.includes(reference)) fail(`aria-labelledby points to missing id: ${reference}`);
}

const images = matches(documentMarkup, /(<img\b[^>]*>)/gi);
const imagesWithoutAlt = images.filter(tag => !/\balt="[^"]*"/i.test(tag));
check(imagesWithoutAlt.length === 0, `${images.length} image elements have alt attributes`);

const buttons = matches(documentMarkup, /(<button\b[^>]*>[\s\S]*?<\/button>)/gi);
const inaccessibleButtons = buttons.filter(button => {
  const opening = button.match(/^<button\b[^>]*>/i)?.[0] || '';
  if (/\baria-label="[^"]+"/i.test(opening)) return false;
  const readable = button
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, 'x')
    .trim();
  return readable.length === 0;
});
check(inaccessibleButtons.length === 0, `${buttons.length} buttons have accessible names`);

for (const anchor of matches(documentMarkup, /(<a\b[^>]*>)/gi)) {
  if (/\btarget="_blank"/i.test(anchor) && !/\brel="[^"]*noopener[^"]*"/i.test(anchor)) {
    fail('A target="_blank" link is missing rel="noopener"');
  }
}

/* Autonomous build and embedded media ---------------------------------- */
const externalScripts = matches(html, /<script\b[^>]*\bsrc="([^"]+)"/gi);
const externalStyles = matches(html, /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/gi);
check(externalScripts.length === 0, 'No external JavaScript dependencies');
check(externalStyles.length === 0, 'No external stylesheet or font dependencies');

const resourceUrls = [];
for (const tag of matches(documentMarkup, /(<(?:img|audio|source|script|link)\b[^>]*>)/gi)) {
  const url = tag.match(/\b(?:src|href)="([^"]+)"/i)?.[1];
  if (url) resourceUrls.push(url);
}
const nonEmbeddedResources = resourceUrls.filter(url => !url.startsWith('data:') && !url.startsWith('#'));
check(nonEmbeddedResources.length === 0, `All game resources are embedded${nonEmbeddedResources.length ? `; external: ${unique(nonEmbeddedResources).join(', ')}` : ''}`);

const webpPayloads = matches(html, /data:image\/webp;base64,([A-Za-z0-9+/=]+)/g);
const invalidWebp = webpPayloads.filter(payload => {
  const bytes = Buffer.from(payload, 'base64');
  return bytes.length < 16 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP';
});
check(webpPayloads.length >= 80, `${webpPayloads.length} embedded WebP illustrations found`);
check(invalidWebp.length === 0, 'Embedded WebP headers are valid');

const audioPayloads = matches(html, /data:audio\/mpeg;base64,([A-Za-z0-9+/=]+)/g);
const invalidAudio = audioPayloads.filter(payload => {
  const bytes = Buffer.from(payload, 'base64');
  return bytes.length < 1024 || !(bytes.toString('ascii', 0, 3) === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0));
});
check(audioPayloads.length === 2, 'Menu and gameplay music tracks are embedded');
check(invalidAudio.length === 0, 'Embedded MP3 headers are valid');

const styleBlocks = matches(html, /<style\b[^>]*>([\s\S]*?)<\/style>/gi);
check(styleBlocks.length === 1, 'Exactly one self-contained stylesheet is present');
check(/@media\s*\([^)]*max-width/i.test(styleBlocks[0] || ''), 'Responsive mobile layouts are present');
check(/prefers-reduced-motion\s*:\s*reduce/i.test(styleBlocks[0] || ''), 'Reduced-motion accessibility is supported');
check(/:focus-visible/i.test(styleBlocks[0] || ''), 'Keyboard focus styling is present');

/* JavaScript syntax and content integrity ------------------------------- */
const scriptBlocks = matches(html, /<script\b[^>]*>([\s\S]*?)<\/script>/gi);
check(scriptBlocks.length === 1, 'Exactly one self-contained game script is present');
if (scriptBlocks[0]) {
  try {
    new vm.Script(scriptBlocks[0], { filename: path.basename(target) });
    passed.push('JavaScript syntax is valid');
  } catch (error) {
    fail(`JavaScript syntax error: ${error.message}`);
  }
}

const script = scriptBlocks[0] || '';
const wordSection = script.match(/const WORDS\s*=\s*\{([\s\S]*?)\n\s*\};\s*\n\s*const makeLevel/)?.[1] || '';
const words = matches(wordSection, /^\s{4}([A-Z]+):/gm);
const imageKeys = matches(wordSection, /image:'([^']+)'/g);
const wordRows = [...wordSection.matchAll(/^\s{4}([A-Z]+):\s*\{\s*image:'([^']+)',\s*translation:'([^']+)',\s*definition:'([^']+)',\s*phonics:'([^']+)'\s*\},?$/gm)];
const levelSection = script.match(/const LEVELS\s*=\s*\{([\s\S]*?)\n\s*\};\s*\n\s*const THEMES/)?.[1] || '';
const levelWords = matches(levelSection, /'([A-Z]+)'/g);
const unknownWords = unique(levelWords.filter(word => !words.includes(word)));
check(words.length >= 40, `${words.length} vocabulary entries found`);
check(wordRows.length === words.length, 'Every vocabulary entry has image, translation, definition and phonics data');
check(words.every(word => /^[A-Z]{2,8}$/.test(word)), 'Vocabulary words fit the letter-garden layout');
check(wordRows.every(row => /[А-Яа-яЁё]/u.test(row[3])), 'Every vocabulary entry has a Russian translation');
check(unknownWords.length === 0, `Every level word has vocabulary data${unknownWords.length ? `; missing: ${unknownWords.join(', ')}` : ''}`);
check(unique(imageKeys).length === words.length, 'Every vocabulary entry has a picture key');
check((html.match(/class="mode-card"/g) || []).length === 5, 'All five educational modes are available');
check((levelSection.match(/\.map\(makeLevel\)/g) || []).length === 5, 'All five word themes are populated');

const assetStart = script.indexOf('const ASSETS');
const assetEnd = script.indexOf('const LEVEL_RESULT_ART');
const assetSection = assetStart >= 0 && assetEnd > assetStart ? script.slice(assetStart, assetEnd) : '';
const assetKeys = matches(assetSection, /^\s{4}([A-Za-z][A-Za-z0-9]*):/gm);
const assetReferences = unique([
  ...matches(html, /\bdata-asset="([A-Za-z][A-Za-z0-9]*)"/g),
  ...matches(script.replace(assetSection, ''), /\bASSETS\.([A-Za-z][A-Za-z0-9]*)/g),
]);
const missingAssets = assetReferences.filter(key => !assetKeys.includes(key));
check(assetKeys.length >= 40, `${assetKeys.length} reusable interface art assets are registered`);
check(missingAssets.length === 0, `Every named art reference resolves${missingAssets.length ? `; missing: ${missingAssets.join(', ')}` : ''}`);

const generatedSection = script.match(/const GENERATED_PICTURES\s*=\s*(\{[\s\S]*?\});\s*\/\* GENERATED_PICTURE_DATA_END/)?.[1] || '';
const generatedKeys = matches(generatedSection, /"([a-z]+)":"data:image\/webp;base64,/g);
const missingPictures = unique(imageKeys.filter(key => !generatedKeys.includes(key)));
check(generatedKeys.length === words.length, `${generatedKeys.length} generated word illustrations are embedded`);
check(missingPictures.length === 0, `Every vocabulary picture resolves${missingPictures.length ? `; missing: ${missingPictures.join(', ')}` : ''}`);

const resultArtSection = script.slice(script.indexOf('const LEVEL_RESULT_ART'), script.indexOf('const DEFAULT_SAVE'));
check((resultArtSection.match(/\{\s*title:/g) || []).length >= 5, 'A distinct celebration illustration is available for every level');

check(/try\s*\{[\s\S]*localStorage\.getItem/.test(script), 'Save loading is protected against unavailable storage');
check(/try\s*\{\s*localStorage\.setItem/.test(script), 'Save writing is protected against unavailable storage');
check(/function\s+sanitizeSave\s*\(/.test(script), 'Stored progress is validated before use');
check(/game\.current\.word\.slice\(game\.progress\)/.test(script), 'Resize preserves already collected letters');
check(/document\.addEventListener\('visibilitychange'/.test(script), 'Background-tab pause handling is present');
check(/window\.addEventListener\('resize'/.test(script), 'Responsive resize handling is present');
check(/document\.addEventListener\('keydown'/.test(script), 'Keyboard controls are present');
check(/clearInterval\(game\.timer\)/.test(script), 'Gameplay timer cleanup is present');
check(/cancelAnimationFrame/.test(script), 'Particle animation cleanup is present');
check(/speechSynthesis/.test(script), 'Offline word pronunciation is available');

/* Release-safety checks ------------------------------------------------- */
check(!/\b(?:TODO|FIXME|HACK)\b/.test(html), 'No unfinished-work markers');
check(!/\bconsole\.(?:log|debug|warn|error)\s*\(/.test(script), 'No debug console output in production');
check(!/\beval\s*\(|new\s+Function\s*\(/.test(script), 'No dynamic code execution');
check(!/document\.write\s*\(/.test(script), 'No document.write usage');
check(!/user-scalable\s*=\s*no/i.test(html), 'Browser zoom is not disabled');

const summary = {
  file: path.relative(process.cwd(), target),
  sizeMiB: Number(sizeMiB.toFixed(2)),
  checksPassed: passed.length,
  warnings,
  errors,
};

console.log(JSON.stringify(summary, null, 2));
process.exitCode = errors.length ? 1 : 0;
