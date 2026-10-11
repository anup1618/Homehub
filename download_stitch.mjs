import 'dotenv/config';
import { StitchToolClient } from '@google/stitch-sdk';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as cheerio from 'cheerio';

const PROJECT_ID = process.env.STITCH_PROJECT_ID || '15947445027309588228';
const API_KEY = process.argv[2] || process.env.STITCH_API_KEY || '';
const OUTPUT_DIR = process.env.STITCH_OUTPUT_DIR || path.resolve('./stitch_designs');

const SCREENS = [
  { id: '0462983b327f42168e2578a871d90710', title: 'Exquisite Estate Details | HomeHub' },
  { id: '1df3b1dc66fd4129bd8c12ce88b1546c', title: 'HomeHub | The Future of Human-Led Real Estate' },
  { id: '2268daab4ca247d78e3a8474f6cc0612', title: 'HomeHub | Digital Twin Property Experience' },
  { id: '3bdd5e927e714a688117ec30c036aeb6', title: 'HomeHub | Digital Twin Property Experience' },
  { id: '7b4509a9cf5940b8b76d80b4b72e3e6a', title: 'Browse Properties | HomeHub' },
  { id: '8805e7697a644137adc84aa09cc2875b', title: 'Three.js' },
  { id: '9f59d53685ac4eb2b659d8aaf4d37aa6', title: 'The Elite Advisors | HomeHub' },
  { id: 'asset-stub-assets_34dcdb0db40c4912ae435e6bed38285d', title: 'Design System' },
  { id: 'asset-stub-assets_9e38ab6f652e4ae590a78a72e3e95ea3', title: 'Design System' },
  { id: 'c0ae5443050c43429e2d1021b6b742b1', title: 'HomeHub | Human-Centric AI Property Experience' },
  { id: 'c8a8fb2f4fdc4a78ad3f0bd5f88a742c', title: 'Browse Luxury Estates | HomeHub' },
  { id: 'cc3010195f6943728425e154e203009d', title: 'Shader' },
  { id: 'd0aabec2ae344b8ca3031ff20d034335', title: 'HomeHub | Ultra-Modern Real Estate' },
  { id: 'e0253f23f0904ebe97162aa3d6c033d8', title: 'Meet the Team | HomeHub' },
  { id: 'ee3ba798148a4b3e95eeb63741d70bae', title: 'Property Details | HomeHub' },
  { id: 'ee77525130b94edb81922ba75be6e0d1', title: 'HomeHub | Future-Ready Real Estate' }
];

function slugify(title, id) {
  const cleanTitle = (title || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  const shortId = (id || '').slice(0, 8);
  return `${cleanTitle}_${shortId}`.replace(/_+/g, '_');
}

function sanitizeFilename(rawFilename, ext) {
  const base = path.basename(rawFilename, ext).slice(0, 100);
  const allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  return base
    .split('')
    .filter((c) => allowedChars.includes(c))
    .join('');
}

async function downloadAsset($, el, attr, url, assetsDir, relativePrefix) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const buffer = await res.arrayBuffer();
    const urlObj = new URL(url);
    const decodedPath = decodeURIComponent(urlObj.pathname);
    const rawFilename = path.basename(decodedPath);
    const ext = path.extname(rawFilename) || '.png';
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
    const sanitizedBase = sanitizeFilename(rawFilename, ext) || 'asset';
    const filename = `${sanitizedBase}-${hash}${ext}`;
    const fullPath = path.join(assetsDir, filename);

    await fs.writeFile(fullPath, Buffer.from(buffer));
    $(el).attr(attr, `${relativePrefix}/${filename}`);
  } catch (err) {
    console.warn(`    ⚠️ Failed to download asset ${url}: ${err.message}`);
  }
}

async function main() {
  if (!API_KEY) {
    console.error('❌ STITCH_API_KEY is missing!');
    console.error('\n📖 Instructions to set your Stitch API key:');
    console.error('1. Open your browser and go to: https://stitch.withgoogle.com/settings');
    console.error('2. Generate or copy your Stitch API Key.');
    console.error('3. Either:');
    console.error('   a) Provide it in the chat or set STITCH_API_KEY in a .env file: STITCH_API_KEY="your-api-key"');
    console.error('   b) Or run: npm run download -- <your-api-key>\n');
    process.exit(1);
  }

  console.log(`🚀 Connecting to Stitch MCP API for Project ID: ${PROJECT_ID}...`);
  console.log(`📁 Saving to: ${OUTPUT_DIR}\n`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const client = new StitchToolClient({
    apiKey: API_KEY,
    baseUrl: 'https://stitch.googleapis.com/mcp'
  });

  try {
    // 1. Fetch screens from project
    let projectScreens = [];
    try {
      console.log('📡 Listing screens from Stitch MCP...');
      const listResponse = await client.callTool('list_screens', { projectId: PROJECT_ID });
      projectScreens = listResponse?.screens || [];
      console.log(`✅ Retrieved ${projectScreens.length} screens metadata.`);
    } catch (err) {
      console.warn(`⚠️ list_screens note: ${err.message}. Using target screen IDs list.`);
    }

    const screensToProcess = projectScreens.length > 0
      ? projectScreens.map(s => ({
          id: s.id || (s.name ? s.name.split('/').pop() : ''),
          title: s.title || '',
          htmlCode: s.htmlCode,
          screenshot: s.screenshot
        }))
      : SCREENS;

    for (let i = 0; i < screensToProcess.length; i++) {
      const screenInfo = screensToProcess[i];
      const screenId = screenInfo.id;
      const title = screenInfo.title || `Screen ${i + 1}`;
      const slug = slugify(title, screenId);
      const screenDir = path.join(OUTPUT_DIR, slug);
      const screenAssetsDir = path.join(screenDir, 'assets');

      console.log(`\n[${i + 1}/${screensToProcess.length}] Screen: "${title}" (${screenId})`);

      let htmlUrl = screenInfo.htmlCode?.downloadUrl;
      let screenshotUrl = screenInfo.screenshot?.downloadUrl;

      if (!htmlUrl || !screenshotUrl) {
        try {
          const detail = await client.callTool('get_screen', {
            projectId: PROJECT_ID,
            screenId: screenId,
            name: `projects/${PROJECT_ID}/screens/${screenId}`
          });
          htmlUrl = htmlUrl || detail?.htmlCode?.downloadUrl;
          screenshotUrl = screenshotUrl || detail?.screenshot?.downloadUrl;
        } catch (err) {
          console.warn(`  ⚠️ Could not fetch details for ${screenId}: ${err.message}`);
        }
      }

      await fs.mkdir(screenAssetsDir, { recursive: true });

      // Download Screenshot
      if (screenshotUrl) {
        try {
          console.log(`  📸 Downloading screen screenshot (screen.png)...`);
          const res = await fetch(screenshotUrl);
          if (res.ok) {
            const buf = await res.arrayBuffer();
            await fs.writeFile(path.join(screenDir, 'screen.png'), Buffer.from(buf));
            console.log(`  ✅ Saved ${slug}/screen.png`);
          }
        } catch (err) {
          console.warn(`  ⚠️ Screenshot download error: ${err.message}`);
        }
      }

      // Download HTML & Assets
      if (htmlUrl) {
        try {
          console.log(`  📄 Downloading HTML code (code.html)...`);
          const res = await fetch(htmlUrl);
          const rawHtml = await res.text();
          const $ = cheerio.load(rawHtml);

          const assetPromises = [];
          $('img').each((_, el) => {
            const src = $(el).attr('src');
            if (src && src.startsWith('http')) {
              assetPromises.push(downloadAsset($, el, 'src', src, screenAssetsDir, 'assets'));
            }
          });

          $('link[rel="stylesheet"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('http')) {
              assetPromises.push(downloadAsset($, el, 'href', href, screenAssetsDir, 'assets'));
            }
          });

          if (assetPromises.length > 0) {
            console.log(`  📦 Downloading ${assetPromises.length} hosted images/assets...`);
            await Promise.all(assetPromises);
          }

          const rewrittenHtml = $.html();
          await fs.writeFile(path.join(screenDir, 'code.html'), rewrittenHtml, 'utf8');
          console.log(`  ✅ Saved ${slug}/code.html`);
        } catch (err) {
          console.warn(`  ⚠️ HTML download error: ${err.message}`);
        }
      }
    }

    // 2. Fetch Design Systems
    try {
      console.log('\n🎨 Fetching Design System tokens & DESIGN.md...');
      const dsRes = await client.callTool('list_design_systems', { projectId: PROJECT_ID });
      const systems = dsRes?.designSystems || [];
      if (systems.length > 0) {
        for (const ds of systems) {
          const dsName = ds.designSystem?.displayName
            ? ds.designSystem.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
            : 'design_system';
          const dsDir = path.join(OUTPUT_DIR, dsName);
          await fs.mkdir(dsDir, { recursive: true });
          if (ds.designSystem?.theme?.designMd) {
            await fs.writeFile(path.join(dsDir, 'DESIGN.md'), ds.designSystem.theme.designMd, 'utf8');
            console.log(`✅ Saved ${dsName}/DESIGN.md`);
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ Design systems fetch note: ${err.message}`);
    }

    console.log(`\n🎉 Success! All screens, screenshots, HTML, and assets are downloaded to:\n${OUTPUT_DIR}\n`);
  } catch (err) {
    console.error(`❌ Download failed: ${err.message}`);
  } finally {
    await client.close();
  }
}

main();
