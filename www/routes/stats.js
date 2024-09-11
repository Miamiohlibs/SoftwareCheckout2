const express = require('express');
const router = express.Router();
const config = require('../../config/appConf');
const baseUrl = `${config.admin.host}:${config.admin.port}`;

function csvToHtmlTable(csvData) {
  // Split the CSV data into lines
  const lines = csvData.trim().split('\n');

  // Extract headers from the first line
  const headers = lines[0].split(',');

  // Extract rows from the remaining lines
  const rows = lines.slice(1).map((line) => line.split(','));

  // Generate the HTML table
  let htmlTable = '<table class="table">\n';

  // Create the <thead> with table headers
  htmlTable += '  <thead>\n    <tr>\n';
  headers.forEach((header) => {
    htmlTable += `      <th>${header.trim()}</th>\n`;
  });
  htmlTable += '    </tr>\n  </thead>\n';

  // Create the <tbody> with table rows
  htmlTable += '  <tbody>\n';
  rows.forEach((row) => {
    htmlTable += '    <tr>\n';
    row.forEach((cell) => {
      htmlTable += `      <td>${cell.trim()}</td>\n`;
    });
    htmlTable += '    </tr>\n';
  });
  htmlTable += '  </tbody>\n';

  // Close the table tag
  htmlTable += '</table>';

  return htmlTable;
}

router.get('/daily', async (req, res) => {
  try {
    const data = await fetch(`${baseUrl}/api/stats/daily`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    const csvData = await data.text();
    const table = csvToHtmlTable(csvData);
    res.render('statsTable', { table: table, pageTitle: 'Daily Stats' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

module.exports = router;
