const express = require('express');
const router = express.Router();
const config = require('../../config/appConf');
let protocol = 'https';
if (!config.admin.onServer) {
  protocol = 'http';
}
const baseUrl = `${protocol}://${config.admin.hostname}:${config.admin.port}`;

function stripQuotes(str) {
  return str.replace(/^"(.*)"$/, '$1');
}
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
    htmlTable += `      <th>${stripQuotes(header.trim())}</th>\n`;
  });
  htmlTable += '    </tr>\n  </thead>\n';

  // Create the <tbody> with table rows
  htmlTable += '  <tbody>\n';
  rows.forEach((row) => {
    htmlTable += '    <tr>\n';
    row.forEach((cell) => {
      htmlTable += `      <td>${stripQuotes(cell.trim())}</td>\n`;
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

    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=dailyStats.csv'
      );
      res.send(csvData);
      return;
    }

    res.render('statsTable', {
      table: table,
      pageTitle: 'Daily Stats: Licenses in Use per Day',
      downloadLink: '/stats/daily?format=csv',
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

router.get('/summary', async (req, res) => {
  const reportStartDate = req.query.reportStartDate || '';
  const reportEndDate = req.query.reportEndDate || '';
  const queryString = new URLSearchParams({
    reportStartDate,
    reportEndDate,
  }).toString();
  try {
    const data = await fetch(`${baseUrl}/api/stats/summary?${queryString}`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    const csvData = await data.text();
    const table = csvToHtmlTable(csvData);

    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=summaryStats.csv'
      );
      res.send(csvData);
      return;
    }

    res.render('statsTable', {
      table: table,
      pageTitle: 'Summary Stats',
      showDateLimits: true,
      reportStartDate,
      reportEndDate,
      downloadLink: `/stats/summary?format=csv&${queryString}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

router.get('/eachCheckout', async (req, res) => {
  try {
    const data = await fetch(`${baseUrl}/api/stats/eachCheckout`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    const files = await data.json();
    res.render('eachCheckoutList', { files: files });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

router.get('/eachCheckout/:file', async (req, res) => {
  let fileStr = req.params.file.replace('.json', '');
  let downloadLink = `/stats/eachCheckout/${req.params.file}?format=csv`;
  try {
    const data = await fetch(
      `${baseUrl}/api/stats/eachCheckout/${req.params.file}`,
      {
        headers: { Authorization: `Bearer ${config.admin.apiKey}` },
      }
    );
    if (data.status !== 200) {
      res
        .status(data.status)
        .render('error', {
          message: 'Error fetching data',
          error: data.statusText,
          errorNumber: data.status,
        });
      return;
    }
    const csvData = await data.text();
    const table = csvToHtmlTable(csvData);
    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=eachCheckout-${fileStr}.csv`
      );
      res.send(table);
    } else {
      res.render('statsTable', {
        table: table,
        pageTitle: `Each Checkout: ${req.params.file}`,
        downloadLink,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

router.get('/adobeSavings', async (req, res) => {
  try {
    const data = await fetch(`${baseUrl}/api/stats/adobeSavings`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    const json = await data.json();
    res.render('adobeSavings', {
      data: json,
      pageTitle: `Estimated Adobe Savings on ${json.conf.dirname}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

module.exports = router;
