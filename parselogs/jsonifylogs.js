const fs = require('fs');

// assign arguments to variables
var file = process.argv[2];

// read file one line at a time
fs.readFile(file, 'utf8', function (err, data) {
  if (err) throw err;
  var lines = data.split('\n');
  console.log('[');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.length > 0) {
      var key = line.split('=')[0];
      var value = line.split('=')[1];
      if (i < lines.length - 2) {
        line += ',';
      }
      console.log(line);
    }
  }
  console.log(']');
});
