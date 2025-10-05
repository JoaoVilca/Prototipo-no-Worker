// Script Node.js para dividir cities.json
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src/assets/cities.json');
const output100 = path.join(__dirname, 'src/assets/cities-100.json');
const output1000 = path.join(__dirname, 'src/assets/cities-1000.json');

const raw = fs.readFileSync(inputPath, 'utf8');
const cities = JSON.parse(raw);

fs.writeFileSync(output100, JSON.stringify(cities.slice(0, 100), null, 2));
fs.writeFileSync(output1000, JSON.stringify(cities.slice(0, 1000), null, 2));

console.log('Archivos generados: cities-10000.json y cities-100000.json');
