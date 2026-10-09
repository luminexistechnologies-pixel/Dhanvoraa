const fs = require('fs');
const pdf = require('pdf-parse/lib/pdf-parse.js');
pdf(fs.readFileSync('C:/Users/Akash/Downloads/Untitled.pdf')).then(result => {
  fs.writeFileSync('tools/pdf-content.txt', result.text);
  console.log(result.text);
});
