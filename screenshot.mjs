import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const outDir = join(__dirname, 'temporary screenshots');
await mkdir(outDir, { recursive: true });

const WAIT_MS = 6500; // preloader exit + settle

// ── Responsive viewport matrix ──────────────────────────────
const DEVICES = {
  'mobile-sm': { width: 360, height: 800,  dpr: 3, touch: true  }, // worst-case hero fit
  'mobile':    { width: 390, height: 844,  dpr: 3, touch: true  }, // iPhone 12/13/14
  'tablet':    { width: 768, height: 1024, dpr: 2, touch: true  }, // iPad portrait
  'tablet-lg': { width: 834, height: 1112, dpr: 2, touch: true  }, // iPad Air
  'desktop':   { width: 1440, height: 900, dpr: 1, touch: false }, // baseline parity
};

const PAGES = {
  index:   'http://localhost:3000/',
  service: 'http://localhost:3000/service-experience.html',
  gallery: 'http://localhost:3000/gallery.html',
};

async function shoot(browser, url, dev, name, fullPage = true) {
  const page = await browser.newPage();
  await page.setViewport({
    width: dev.width, height: dev.height, deviceScaleFactor: dev.dpr,
    isMobile: dev.touch, hasTouch: dev.touch,
  });
  // 'domcontentloaded' (not 'load') — autoplaying videos can keep 'load' pending forever.
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, WAIT_MS));
  // Pause videos before capture — continuous playback can stall captureScreenshot.
  await page.evaluate(() => document.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (e) {} }));
  await new Promise(r => setTimeout(r, 250));

  // Overflow assertion — cheapest responsive regression signal.
  // On mobile the layout viewport expands to fit an overflowing element instead
  // of showing a scrollbar, so compare against the INTENDED device width too.
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    return { scrollW: de.scrollWidth, innerW: window.innerWidth };
  });
  const bad = overflow.scrollW > overflow.innerW + 1 || overflow.innerW > dev.width + 1;
  const file = join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage });
  await page.close();
  console.log(`${bad ? '⚠ OVERFLOW' : 'ok      '} ${name}  (scrollW ${overflow.scrollW} / innerW ${overflow.innerW})  → ${file}`);
  return !bad;
}

const [, , arg1, arg2, arg3] = process.argv;

const browser = await puppeteer.launch({
  headless: 'shell',  // old headless — new headless can stall captureScreenshot on animated pages
  protocolTimeout: 180000,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
});

if (arg1 === 'check') {
  // Overflow-only sweep (no screenshots — reliable on tall animated pages):
  // node screenshot.mjs check [pageKey] [deviceKey]
  const pages = arg2 && PAGES[arg2] ? { [arg2]: PAGES[arg2] } : PAGES;
  const devs  = arg3 && DEVICES[arg3] ? { [arg3]: DEVICES[arg3] } : DEVICES;
  let allOk = true;
  for (const [pk, url] of Object.entries(pages)) {
    for (const [dk, dev] of Object.entries(devs)) {
      const page = await browser.newPage();
      await page.setViewport({ width: dev.width, height: dev.height, deviceScaleFactor: dev.dpr, isMobile: dev.touch, hasTouch: dev.touch });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 5500));
      const o = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth }));
      const bad = o.scrollW > o.innerW + 1 || o.innerW > dev.width + 1;
      allOk = allOk && !bad;
      console.log(`${bad ? '⚠ OVERFLOW' : 'ok      '} ${pk}-${dk}  (scrollW ${o.scrollW} / innerW ${o.innerW} / target ${dev.width})`);
      await page.close();
    }
  }
  console.log(allOk ? '\nAll clear — no horizontal overflow.' : '\n⚠ Overflow detected.');
} else if (arg1 === 'view') {
  // Viewport-only (above-the-fold) shot: node screenshot.mjs view <pageKey> <deviceKey>
  const url = PAGES[arg2] || PAGES.index;
  const dev = DEVICES[arg3] || DEVICES.mobile;
  await shoot(browser, url, dev, `view-${arg2 || 'index'}-${arg3 || 'mobile'}`, false);
} else if (arg1 === 'matrix') {
  // node screenshot.mjs matrix [pageKey] [deviceKey]
  const pages = arg2 && PAGES[arg2] ? { [arg2]: PAGES[arg2] } : PAGES;
  const devs  = arg3 && DEVICES[arg3] ? { [arg3]: DEVICES[arg3] } : DEVICES;
  let allOk = true;
  for (const [pk, url] of Object.entries(pages)) {
    for (const [dk, dev] of Object.entries(devs)) {
      const ok = await shoot(browser, url, dev, `screenshot-${pk}-${dk}`);
      allOk = allOk && ok;
    }
  }
  console.log(allOk ? '\nAll clear — no horizontal overflow.' : '\n⚠ Overflow detected on one or more captures.');
} else {
  // Legacy single-shot: node screenshot.mjs <url> [label]  (defaults to desktop 1440x900)
  const url   = arg1 || 'http://localhost:3000';
  const label = arg2 ? `-${arg2}` : '';
  const existing = existsSync(outDir)
    ? readdirSync(outDir).filter(f => f.endsWith('.png')).length
    : 0;
  await shoot(browser, url, DEVICES.desktop, `screenshot-${existing + 1}${label}`);
}

await browser.close();
