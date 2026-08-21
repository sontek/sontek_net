const puppeteer = require('puppeteer');

(async () => {
  const host = process.env.HOST || 'https://sontek.net';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${host}/resume`, {waitUntil: 'networkidle2'});

  let div_selector_to_remove= ".grid";
  await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      elements[0].parentNode.removeChild(elements[0]);

      /*
       * Only want to delete first instance for now
      for(var i=0; i< elements.length; i++){
          elements[i].parentNode.removeChild(elements[i]);
      }
      */
  }, div_selector_to_remove)

  await page.pdf({
      path: 'public/sontek_resume.pdf',
      format: 'letter',
      printBackground: true,
      scale: 0.95,
  });

  await browser.close();
})();
