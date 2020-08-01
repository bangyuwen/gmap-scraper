/* eslint no-await-in-loop: off */

import * as puppeteer from 'puppeteer';
import * as winston from 'winston';
import * as moment from 'moment';
import * as fs from 'fs';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

const store = process.env.STORE;
const url = process.env.URL;

const parse = async (page: puppeteer.Page) => {
  const reviewElements: puppeteer.ElementHandle[] = await page.$$(
    '.ml-reviews-page-user-review-container',
  );
  const tasks = reviewElements.map(async (review) => ({
    name: await review
      .$('.ml-reviews-page-user-review-name')
      .then((el) => el.getProperty('textContent'))
      .then((jsObject) => jsObject.jsonValue()),
    time: await review
      .$('.ml-reviews-page-user-review-publish-date')
      .then((el) => el.getProperty('textContent'))
      .then((jsObject) => jsObject.jsonValue()),
    rating: await review
      .$('.ml-rating-stars-container')
      .then((el) => el.getProperty('ariaLabel'))
      .then((jsObject) => jsObject.jsonValue()),
    text: await review
      .$('.ml-reviews-page-user-review-text')
      .then((el) => el.getProperty('textContent'))
      .then((jsObject) => jsObject.jsonValue()),
  }));
  const reviews = await Promise.all(tasks);

  const date = moment().format('YYYY-MM-DD');
  fs.writeFile(
    `/root/data/${store}-${date}.json`,
    JSON.stringify(reviews, null, 2),
    (err) => {
      if (err) throw err;
      logger.info('Done writing');
    },
  );
};

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    // devtools: true,
    args: ['--no-sandbox'],
  });
  const page = (await browser.pages())[0];
  await page.emulate(puppeteer.devices['iPhone 6']);
  await page.goto(url);
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
    logger.debug(`previous height: ${tempHeight}`);
    logger.debug(`current height: ${boxHeight}`);
  } while (tempHeight !== boxHeight);

  await parse(page);
  await browser.close();
})();
