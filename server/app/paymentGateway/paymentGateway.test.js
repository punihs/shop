const puppeteer = require('puppeteer');
const assert = require('assert');
const { URLS_API } = require('../../config/environment');

const opts = { args: ['--no-sandbox'] };

const { log } = console;

describe('Website on Desktop View', async () => {
  let browser;
  let page;
  before(async () => {
    browser = await puppeteer.launch(opts);
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  it('Website Should Load Successfully', async () => {
    let response;
    try {
      response = await page.goto(`${URLS_API}/api/paymentGateways/`, {
        timeout: 0,
        waitUntil: 'domcontentloaded',
      });
      log(`Response Status: ${response.status()}`);
    } catch (err) {
      log('Website Failed: Taking a screenshot');
      await page.screenshot({
        path: './logs/FAILED-homepage_fullpage-desktop.jpeg',
        fullPage: true,
      });
      await browser.close();
    }
    assert.strictEqual(response.status(), 200);
  });

  after(async () => {
    await browser.close();
  });
});
