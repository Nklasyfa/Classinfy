// diagnostic.js - cek colspan struktur HTML
const fs = require('fs');
const html = fs.readFileSync('d:/CLASSIFY/temp_jadwal/Sheet1.html', 'utf8');
const rows = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

function parseCell(c) {
  return c.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function getColspan(c) {
  const m = c.match(/colspan="(\d+)"/i) || c.match(/colspan='(\d+)'/i) || c.match(/colspan=(\d+)/i);
  return m ? parseInt(m[1]) : 1;
}

// Analisis row 7 (MG1.01.07 Senin) - full colspan expand
console.log('\n=== ROW 7 (MG1.01.07 Senin) dengan colspan expand ===');
const r7 = rows[7];
const cells7 = r7.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
console.log('Raw cell count:', cells7.length);

let expandedCells = [];
cells7.forEach((c, i) => {
  const colspan = getColspan(c);
  const text = parseCell(c);
  // Expand: repeat content for colspan times
  for (let j = 0; j < colspan; j++) {
    expandedCells.push(text);
  }
});

console.log('Expanded cell count:', expandedCells.length);
console.log('Sample expanded cells:', expandedCells.slice(0, 50).join(' | '));

// Cek baris waktu (row 4)
console.log('\n=== ROW 4 (Header Jam) dengan colspan expand ===');
const r4 = rows[4];
const cells4 = r4.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
let expanded4 = [];
cells4.forEach(c => {
  const colspan = getColspan(c);
  const text = parseCell(c);
  for (let j = 0; j < colspan; j++) expanded4.push(text);
});
console.log('Expanded jam cells count:', expanded4.length);
console.log('Jam cells:', expanded4.join(' | '));

// Analisis row 14 (MG1.02.02 Senin)
console.log('\n=== ROW 14 (MG1.02.02 Senin) dengan colspan expand ===');
const r14 = rows[14];
const cells14 = r14.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
let expanded14 = [];
cells14.forEach(c => {
  const colspan = getColspan(c);
  const text = parseCell(c);
  for (let j = 0; j < colspan; j++) expanded14.push(text);
});
console.log('Raw cells:', cells14.length, '| Expanded:', expanded14.length);
console.log('Cells:', expanded14.slice(0, 50).join(' | '));

// Cek semua baris hari untuk max colspan-expanded width
console.log('\n=== MAX WIDTH PER ROW ===');
const DAY_MAP = { 'senin': 1, 'selasa': 2, 'rabu': 3, 'kamis': 4, 'jumat': 5, 'sabtu': 6 };
let maxWidth = 0;
rows.forEach((r, i) => {
  const cells = r.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
  let expW = 0;
  cells.forEach(c => { expW += getColspan(c); });
  const texts = cells.map(parseCell).filter(t => t);
  const first = texts[0] ? texts[0].toLowerCase().trim() : '';
  if (DAY_MAP[first] !== undefined) {
    if (expW > maxWidth) maxWidth = expW;
    if (expW > 10) console.log('Row', i, '| raw:', cells.length, '| expanded:', expW, '| hari:', texts[0]);
  }
});
console.log('Max expanded width:', maxWidth);
