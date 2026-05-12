/**
 * seedJadwal.js — Seeder Lengkap Jadwal Perkuliahan Genap 2025/2026
 *
 * Struktur HTML (dari diagnostic):
 * - Row 4: Header jam  => cell[0]=blank, cell[1..18] = "HH:MM - HH:MM"
 * - Row 6+: Nama ruang (1 cell = "MG1.01.07")
 * - Row 7+: Data hari. 
 *   24 data cells, 1 to 1 mapping with the 24 cells in header (18 slots + 6 blank).
 *   Each cell directly contains the full activity string, e.g. "S1 Mnj | Bisnis Internasional | MN25A"
 *   Consecutive identical cells should be merged into one schedule.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Room, Schedule } = require('../models');

const HTML_FILE = path.join(__dirname, '../temp_jadwal/Sheet1.html');

const DAY_MAP = {
  'senin': 1, 'selasa': 2, 'rabu': 3, 'kamis': 4, 'jumat': 5, 'sabtu': 6,
};

// ==================== HTML HELPERS ====================
function parseCell(cellHtml) {
  return cellHtml
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function getColspan(cellHtml) {
  const m = cellHtml.match(/colspan="(\d+)"/i)
    || cellHtml.match(/colspan='(\d+)'/i)
    || cellHtml.match(/colspan=(\d+)/i);
  return m ? parseInt(m[1]) : 1;
}

function expandRow(rowHtml) {
  const cellMatches = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
  const expanded = [];
  for (const c of cellMatches) {
    const colspan = getColspan(c);
    const text = parseCell(c);
    for (let i = 0; i < colspan; i++) expanded.push(text);
  }
  return expanded;
}

// ==================== PARSE JAM HEADER ====================
function parseJamHeader(rows) {
  const headerRow = rows[4];
  if (!headerRow) return [];

  const expanded = expandRow(headerRow);
  
  // Header cells starting after the blank cell
  const jams = [];
  let started = false;
  
  for (let i = 0; i < expanded.length; i++) {
    const c = expanded[i];
    if (/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/.test(c)) {
      started = true;
      jams.push({ idx: i, text: c });
    } else if (started) {
      // Keep track of empty columns after jam as well to maintain exact 1:1 index mapping
      jams.push({ idx: i, text: '' });
    }
  }
  return jams; // returns array of {idx, text}
}

function parseJamSlot(jamStr) {
  const m = jamStr.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  if (!m) return null;
  return { start: m[1] + ':00', end: m[2] + ':00' };
}

// ==================== EXTRACT SCHEDULES ====================
function extractSchedules(expandedCells, dayOfWeek, jamHeader, dataStartCol) {
  const dataCells = expandedCells.slice(dataStartCol);

  const slots = [];
  for (let i = 0; i < jamHeader.length; i++) {
    if (!jamHeader[i].text) continue; // skip blank trailing columns
    
    const activity = dataCells[i] || '';
    slots.push({ activity, slotIdx: i });
  }

  const groups = [];
  let cur = null;

  for (const s of slots) {
    if (!s.activity) {
      if (cur) { groups.push(cur); cur = null; }
      continue;
    }

    if (cur && s.activity === cur.activity) {
      cur.endSlot = s.slotIdx;
    } else {
      if (cur) groups.push(cur);
      cur = { activity: s.activity, startSlot: s.slotIdx, endSlot: s.slotIdx };
    }
  }
  if (cur) groups.push(cur);

  const schedules = [];
  for (const g of groups) {
    if (!g.activity) continue;
    
    const startJam = parseJamSlot(jamHeader[g.startSlot].text);
    const endJam = parseJamSlot(jamHeader[g.endSlot].text);
    if (!startJam || !endJam) continue;

    // Clean up activity string (replace | with —)
    let cleanedActivity = g.activity.replace(/\s*\|\s*/g, ' — ').trim();

    schedules.push({
      dayOfWeek,
      startTime: startJam.start,
      endTime: endJam.end,
      activity: cleanedActivity,
      semester: 'Genap 2025/2026',
      status: 'aktif',
    });
  }

  return schedules;
}

// ==================== DETECT KOLOM START DATA ====================
function detectDataStart(expandedCells) {
  const first = expandedCells[0] ? expandedCells[0].toLowerCase().trim() : '';
  const second = expandedCells[1] ? expandedCells[1].toLowerCase().trim() : '';

  if (DAY_MAP[first] !== undefined) return 2;
  if (DAY_MAP[second] !== undefined) return 3;
  return 2;
}

// ==================== PARSE HTML ====================
function parseHTML(htmlPath, jamHeader) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const rowMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];

  const result = [];
  let currentRoom = null;
  let currentSchedules = [];

  for (const rowHtml of rowMatches) {
    const expanded = expandRow(rowHtml);
    const nonEmpty = expanded.filter(t => t);

    if (nonEmpty.length === 1 && /^MG\d/i.test(nonEmpty[0])) {
      if (currentRoom) result.push({ room: currentRoom, schedules: currentSchedules });
      const code = nonEmpty[0].trim();
      const isLab = /lab/i.test(code);
      currentRoom = {
        code,
        name: code,
        location: 'Kampus UNESA MG',
        capacity: isLab ? 25 : 40,
        status: 'available',
      };
      currentSchedules = [];
      continue;
    }

    if (currentRoom && expanded.length > 5) {
      let dayOfWeek = null;
      for (let i = 0; i < Math.min(3, expanded.length); i++) {
        const d = DAY_MAP[expanded[i].toLowerCase().trim()];
        if (d !== undefined) { dayOfWeek = d; break; }
      }
      if (dayOfWeek === null) continue;

      const dataStart = detectDataStart(expanded);
      const scheds = extractSchedules(expanded, dayOfWeek, jamHeader, dataStart);
      currentSchedules.push(...scheds);
    }
  }

  if (currentRoom) result.push({ room: currentRoom, schedules: currentSchedules });
  return result;
}

// ==================== MAIN ====================
async function main() {
  console.log('\n🎓 CLASSINFY — Seeder Jadwal Perkuliahan Genap 2025/2026');
  console.log('='.repeat(65));

  await sequelize.authenticate();
  console.log('✅ DB connected\n');

  const html = fs.readFileSync(HTML_FILE, 'utf8');
  const allRows = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  const jamHeader = parseJamHeader(allRows);
  
  console.log(`📅 Terdeteksi ${jamHeader.filter(j=>j.text).length} slot jam:`);
  console.log(`   Dari: ${jamHeader.find(j=>j.text).text}`);
  console.log(`   Sampai: ${jamHeader.filter(j=>j.text).pop().text}\n`);

  console.log('📂 Parsing HTML...');
  const entries = parseHTML(HTML_FILE, jamHeader);
  console.log(`✅ ${entries.length} ruangan ditemukan\n`);

  let totalExpected = 0;
  for (const e of entries) {
    totalExpected += e.schedules.length;
  }
  console.log(`Total jadwal diparse: ${totalExpected}\n`);

  console.log('🗑️  Hapus jadwal Genap 2025/2026 lama...');
  const deleted = await Schedule.destroy({ where: { semester: 'Genap 2025/2026' } });
  console.log(`   ${deleted} jadwal lama dihapus\n`);

  let totalRoomsNew = 0;
  let totalInserted = 0;
  let totalError = 0;

  for (const { room: roomData, schedules } of entries) {
    const [room, created] = await Room.findOrCreate({
      where: { code: roomData.code },
      defaults: {
        name: roomData.name,
        location: roomData.location,
        capacity: roomData.capacity,
        status: roomData.status,
      },
    });
    if (created) totalRoomsNew++;

    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const tag = created ? '🆕' : '  ';
    console.log(`${tag} ${room.code} (id:${room.id}) — ${schedules.length} jadwal`);

    for (const s of schedules) {
      try {
        await Schedule.create({ roomId: room.id, ...s });
        totalInserted++;
        console.log(`    ✔ ${days[s.dayOfWeek]} ${s.startTime.slice(0,5)}-${s.endTime.slice(0,5)} | ${s.activity.substring(0, 50)}`);
      } catch (err) {
        totalError++;
        console.error(`    ✗ ERR: ${err.message.substring(0, 80)}`);
      }
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log('✅ SELESAI SEEDING!');
  console.log(`   Ruang baru      : ${totalRoomsNew}`);
  console.log(`   Jadwal diinsert : ${totalInserted}`);
  console.log(`   Error           : ${totalError}`);
  console.log('='.repeat(65) + '\n');

  await sequelize.close();
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
