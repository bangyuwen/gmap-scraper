/* eslint no-await-in-loop: off */

import * as puppeteer from 'puppeteer';
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

// const MAPURL = 'https://goo.gl/maps/eRkY297cRburaFAs8'; // 湖水灣
// const MAPURL = 'https://goo.gl/maps/B58qq7QoojvoE11Q6'; // 約翰紅茶
const MAPURL = 'https://goo.gl/maps/a1jXFbfcmBhGSLU97'; // 沐光良食

const parse = async (page: puppeteer.Page) => {
  const reviews: puppeteer.ElementHandle[] = await page.$$eval(
    '.ml-reviews-page-user-review-container',
    (rs) =>
      rs.map((r) =>
        JSON.stringify({
          name: r.querySelector('.ml-reviews-page-user-review-name')
            .textContent,
          time: r.querySelector('.ml-reviews-page-user-review-publish-date')
            .textContent,
          rating: r.querySelector('.ml-rating-stars-container').textContent,
          content: r.querySelector('.ml-reviews-page-user-review-text')
            .textContent,
        }),
      ),
  );
  logger.info(reviews);
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  });
  const page = (await browser.pages())[0];
  await page.emulate(puppeteer.devices['iPhone 6']);
  // await page.goto('https://goo.gl/maps/eGBbczWuNGQc5SDu5'); // 隨義坊
  await page.goto(MAPURL);
  await page.waitForNavigation();

  await page.click(
    '.ml-promotion-action-button.ml-promotion-no-button.ml-promotion-no-thanks',
  );
  await page.waitForNavigation();

  await page.click('.section-hero-header-title');
  await page.waitForNavigation();

  await page.click('button[aria-label="查看所有評論"]');
  await page.waitForNavigation();

  let tempHeight = 0;
  let boxHeight = 0;
  do {
    tempHeight = boxHeight;
    const container = await page.$(
      '.ml-reviews-page-white-background div:nth-of-type(2)',
    );
    const box = await container.boundingBox();
    await page.mouse.wheel({ deltaY: +2000 });
    await page.waitFor(1000);

    boxHeight = box.height;
    logger.info(`previous height: ${tempHeight}`);
    logger.info(`current height: ${boxHeight}`);
  } while (tempHeight !== boxHeight);
  await parse(page);
  await browser.close();
})();
