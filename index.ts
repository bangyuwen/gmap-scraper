import * as puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://goo.gl/maps/B58qq7QoojvoE11Q6');
    // await page.screenshot({ path: 'example.png' });

    // await browser.close();
})();