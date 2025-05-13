const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Scrape endpoint
app.get('/api/results', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });
    const page = await browser.newPage();
    await page.goto('https://www.gmanetwork.com/news/eleksyon/2025/results/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for results container (adjust selector if needed)
    await page.waitForSelector('.results-container', { timeout: 10000 }).catch(() => {
      console.warn('Results container not found, proceeding with available data');
    });

    const data = await page.evaluate(() => {
      const senatorial = [];
      const partyList = [];
      const congressional = [];
      const gubernatorial = [];
      const mayoral = [];

      // Senatorial: Update selector based on actual page
      document.querySelectorAll('.senatorial-results tbody tr').forEach(row => {
        senatorial.push({
          candidate: row.cells[0]?.innerText.trim() || 'N/A',
          party: row.cells[1]?.innerText.trim() || 'N/A',
          votes: parseInt(row.cells[2]?.innerText.trim().replace(/,/g, '')) || 0,
          percentage: parseFloat(row.cells[3]?.innerText.trim().replace('%', '')) || 0
        });
      });

      // Party-List
      document.querySelectorAll('.party-list-results tbody tr').forEach(row => {
        partyList.push({
          party: row.cells[0]?.innerText.trim() || 'N/A',
          votes: parseInt(row.cells[1]?.innerText.trim().replace(/,/g, '')) || 0,
          percentage: parseFloat(row.cells[2]?.innerText.trim().replace('%', '')) || 0
        });
      });

      // Congressional
      document.querySelectorAll('.congressional-results tbody tr').forEach(row => {
        congressional.push({
          district: row.cells[0]?.innerText.trim() || 'N/A',
          candidate: row.cells[1]?.innerText.trim() || 'N/A',
          party: row.cells[2]?.innerText.trim() || 'N/A',
          votes: parseInt(row.cells[3]?.innerText.trim().replace(/,/g, '')) || 0
        });
      });

      // Gubernatorial
      document.querySelectorAll('.gubernatorial-results tbody tr').forEach(row => {
        gubernatorial.push({
          province: row.cells[0]?.innerText.trim() || 'N/A',
          candidate: row.cells[1]?.innerText.trim() || 'N/A',
          party: row.cells[2]?.innerText.trim() || 'N/A',
          votes: parseInt(row.cells[3]?.innerText.trim().replace(/,/g, '')) || 0
        });
      });

      // Mayoral
      document.querySelectorAll('.mayoral-results tbody tr').forEach(row => {
        mayoral.push({
          city: row.cells[0]?.innerText.trim() || 'N/A',
          candidate: row.cells[1]?.innerText.trim() || 'N/A',
          party: row.cells[2]?.innerText.trim() || 'N/A',
          votes: parseInt(row.cells[3]?.innerText.trim().replace(/,/g, '')) || 0
        });
      });

      return { senatorial, partyList, congressional, gubernatorial, mayoral };
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error('Scraping error:', error);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Failed to scrape results' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
