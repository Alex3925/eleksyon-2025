const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Scrape endpoint
app.get('/api/results', async (req, res) => {
  try {
    const url = 'https://www.gmanetwork.com/news/eleksyon/2025/results/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Assumed HTML structure: Adjust selectors based on actual page
    const senatorial = [];
    const partyList = [];

    // Example: Senatorial results in a table with class 'senatorial-results'
    $('table.senatorial-results tbody tr').each((i, row) => {
      const candidate = $(row).find('td').eq(0).text().trim();
      const party = $(row).find('td').eq(1).text().trim();
      const votes = parseInt($(row).find('td').eq(2).text().trim().replace(/,/g, '')) || 0;
      const percentage = parseFloat($(row).find('td').eq(3).text().trim().replace('%', '')) || 0;
      senatorial.push({ candidate, party, votes, percentage });
    });

    // Example: Party-list results in a table with class 'party-list-results'
    $('table.party-list-results tbody tr').each((i, row) => {
      const party = $(row).find('td').eq(0).text().trim();
      const votes = parseInt($(row).find('td').eq(1).text().trim().replace(/,/g, '')) || 0;
      const percentage = parseFloat($(row).find('td').eq(2).text().trim().replace('%', '')) || 0;
      partyList.push({ party, votes, percentage });
    });

    res.json({ senatorial, partyList });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to scrape results' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
