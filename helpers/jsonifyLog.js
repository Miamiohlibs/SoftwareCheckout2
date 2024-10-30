const fs = require('fs');
const logger = require('../services/logger');

const jsonifyLog = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');

  // Split the content into individual objects using '}\n{' as a delimiter
  const entries = data.split(/\}\s*\n\s*\{/).map((entry, index, array) => {
    // Ensure each entry has correct JSON object format
    if (index === 0) {
      // Add closing brace to first entry
      entry = entry + '}';
    } else if (index === array.length - 1) {
      // Add opening brace to last entry
      entry = '{' + entry;
    } else {
      // Add both braces for the rest
      entry = '{' + entry + '}';
    }

    // Parse the entry into a JSON object
    try {
      return JSON.parse(entry);
    } catch (err) {
      console.error(
        `Error parsing JSON object (${filePath}) for web admin console:`,
        err
      );
      return {
        message: 'Error parsing JSON object: unable to display this log entry',
      };
    }
  });
  return { entries };
};

module.exports = jsonifyLog;
