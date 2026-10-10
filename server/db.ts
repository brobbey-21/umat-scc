import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'scc.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS denominations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    campusFellowship TEXT NOT NULL,
    shortCode TEXT NOT NULL,
    color TEXT NOT NULL,
    accent TEXT NOT NULL DEFAULT '#888888',
    logoText TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    gender TEXT,
    phone TEXT NOT NULL,
    whatsappSameAsPhone INTEGER DEFAULT 1,
    programOfStudy TEXT NOT NULL,
    academicLevel TEXT NOT NULL,
    hallOrHostel TEXT NOT NULL,
    roomOrBlock TEXT,
    denominationId TEXT NOT NULL REFERENCES denominations(id),
    denominationName TEXT NOT NULL,
    fellowshipCode TEXT NOT NULL,
    homeParishOrCity TEXT,
    prayerRequestOrNotes TEXT,
    registeredAt TEXT NOT NULL,
    outreachStatus TEXT NOT NULL DEFAULT 'New / Pending',
    outreachNotes TEXT DEFAULT '[]',
    contactedBy TEXT,
    contactedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS denomination_admins (
    id TEXT PRIMARY KEY,
    denominationId TEXT NOT NULL REFERENCES denominations(id),
    denominationName TEXT NOT NULL,
    fellowshipCode TEXT NOT NULL,
    adminName TEXT NOT NULL,
    roleTitle TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    assignedHalls TEXT,
    dateAdded TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hostels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE INDEX IF NOT EXISTS idx_students_denomination ON students(denominationId);
  CREATE INDEX IF NOT EXISTS idx_students_status ON students(outreachStatus);
  CREATE INDEX IF NOT EXISTS idx_admins_denomination ON denomination_admins(denominationId);
`);

// ── Migrations: add columns to existing denominations table ────────────────

function columnExists(table: string, column: string): boolean {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some((c) => c.name === column);
}

if (!columnExists('denominations', 'accent')) {
  db.exec(`ALTER TABLE denominations ADD COLUMN accent TEXT NOT NULL DEFAULT '#888888'`);
}
if (!columnExists('denominations', 'logoText')) {
  db.exec(`ALTER TABLE denominations ADD COLUMN logoText TEXT NOT NULL DEFAULT ''`);
}
if (!columnExists('denominations', 'logoImage')) {
  db.exec(`ALTER TABLE denominations ADD COLUMN logoImage TEXT`);
}

// ── Seed denominations (idempotent) ─────────────────────────────────────────

const SEED_DENOMINATIONS = [
  { id: 'agcm', name: 'Assemblies of God', campusFellowship: 'AGCM (Assemblies of God Campus Ministry)', shortCode: 'AGCM', color: '#C62828', accent: '#EF5350', logoText: 'AG', description: 'Assemblies of God campus branch, youth fellowship and dawn prayers.' },
  { id: 'ghamsu', name: 'Methodist Church Ghana', campusFellowship: 'GHAMSU (Ghana Methodist Students Union)', shortCode: 'GHAMSU', color: '#1565C0', accent: '#42A5F5', logoText: 'GM', description: 'Methodist fellowship on campus, liturgical prayer, choral hymns and outreach.' },
  { id: 'pensa', name: 'The Church of Pentecost', campusFellowship: 'PENSA (Pentecost Students Association)', shortCode: 'PENSA', color: '#2E7D32', accent: '#66BB6A', logoText: 'PA', description: 'Pentecostal fellowship on campus, hall cells, and weekly prayer assemblies.' },
  { id: 'pax', name: 'Catholic Church', campusFellowship: 'PAX ROMANA (International Movement of Catholic Students)', shortCode: 'PAX ROMANA', color: '#6A1B9A', accent: '#AB47BC', logoText: 'PR', description: 'Catholic university chaplaincy, Holy Mass, sacraments, and rosary devotions.' },
  { id: 'newbreed', name: 'New Breed', campusFellowship: 'NEW BREED (New Breed Campus Fellowship)', shortCode: 'NEW BREED', color: '#E65100', accent: '#FF7043', logoText: 'NB', description: 'New Breed campus fellowship, vibrant youth worship and discipleship.' },
  { id: 'ccf', name: 'Campus Christian Family', campusFellowship: 'CCF (Campus Christian Family)', shortCode: 'CCF', color: '#00695C', accent: '#26A69A', logoText: 'CC', description: 'Campus Christian Family fellowship, inter-denominational worship and community.' },
  { id: 'casa', name: 'Christ Apostolic Church', campusFellowship: 'CASA (Christ Apostolic Students Association)', shortCode: 'CASA', color: '#4E1410', accent: '#8D4440', logoText: 'CA', description: 'Christ Apostolic Students Association, prayer meetings and campus evangelism.' },
  { id: 'nupsg', name: 'Presbyterian Church of Ghana', campusFellowship: 'NUPS-G (National Union of Presbyterian Students Ghana)', shortCode: 'NUPS-G', color: '#1B5E20', accent: '#43A047', logoText: 'PG', description: 'Presbyterian student fellowship, bible study and collegiate discipleship.' },
  { id: 'nubs', name: 'Baptist Convention', campusFellowship: 'NUBS (National Union of Baptist Students)', shortCode: 'NUBS', color: '#1A237E', accent: '#3949AB', logoText: 'NB', description: 'Baptist student fellowship, scripture exposition and mission outreach.' },
  { id: 'gesam', name: 'Global Evangelical Church', campusFellowship: 'GESAM (Global Evangelical Students and Associates Ministry)', shortCode: 'GESAM', color: '#B71C1C', accent: '#E53935', logoText: 'GE', description: 'Global Evangelical Students and Associates Ministry, evangelical discipleship.' },
  { id: 'apos', name: 'Apostolic Church', campusFellowship: 'APOSA (Apostolic Students Association)', shortCode: 'APOSA', color: '#283593', accent: '#5C6BC0', logoText: 'AS', description: 'Apostolic Students Association, prayer and apostolic witness on campus.' },
  { id: 'dlcf', name: 'Deeper Life Bible Church', campusFellowship: 'DLCF (Deeper Life Campus Fellowship)', shortCode: 'DLCF', color: '#0D47A1', accent: '#1E88E5', logoText: 'DL', description: 'Deeper Life Campus Fellowship, intensive bible study and holiness teaching.' },
  { id: 'nuas', name: 'Anglican Church of Ghana', campusFellowship: 'NUAS (National Union of Anglican Students)', shortCode: 'NUAS', color: '#37474F', accent: '#78909C', logoText: 'NA', description: 'National Union of Anglican Students, liturgy, prayer book fellowship and chapel care.' },
];

// ── Seed denominations (replaces stale rows) ────────────────────────────────

// Remove old denominations that are no longer in the current list
const validIds = SEED_DENOMINATIONS.map((d) => d.id);
const allExisting = db.prepare('SELECT id FROM denominations').all() as { id: string }[];
for (const row of allExisting) {
  if (!validIds.includes(row.id)) {
    db.prepare('DELETE FROM denominations WHERE id = ?').run(row.id);
  }
}

const seedDenoms = db.prepare(`
  INSERT INTO denominations (id, name, campusFellowship, shortCode, color, accent, logoText, description)
  VALUES (@id, @name, @campusFellowship, @shortCode, @color, @accent, @logoText, @description)
  ON CONFLICT(id) DO UPDATE SET
    name=excluded.name, campusFellowship=excluded.campusFellowship,
    shortCode=excluded.shortCode, color=excluded.color,
    accent=excluded.accent, logoText=excluded.logoText,
    description=excluded.description
`);

for (const denom of SEED_DENOMINATIONS) {
  seedDenoms.run(denom);
}

// ── Seed hostels and courses (idempotent) ───────────────────────────────────

const SEED_HOSTELS = [
  'University Hall (Katanga)',
  'Unity Hall (Continental / Conti)',
  'Independence Hall',
  'Gold Refinery Hostel',
  'Chancellor Hall',
  'Queen Elizabeth Hall',
  'West End Private Hostel',
  'Grace Villa Hostel',
  'Peace Hostel (Off-Campus)',
  'Premier Hostel',
  'Royal Gate Hostel',
  'Non-Resident / Commuter from town'
];

const SEED_COURSES = [
  'Mining Engineering',
  'Minerals Engineering',
  'Mechanical Engineering',
  'Electrical and Electronic Engineering',
  'Renewable Energy Engineering',
  'Telecommunication Engineering',
  'Cyber Security',
  'Computer Science and Engineering',
  'Information Systems and Technology',
  'Mathematics',
  'Statistical Data Science',
  'Robotics Engineering and Artificial Intelligence',
  'Logistics and Transport Management',
  'Economics and Industrial Organisation',
  'Finance and Data Science',
  'Geomatic Engineering',
  'Geological Engineering',
  'Spatial Planning',
  'Environmental and Safety Engineering',
  'Land Administration and Information Systems',
  'Petroleum Engineering',
  'Natural Gas Engineering',
  'Petroleum Geosciences and Engineering',
  'Petroleum Refining and Petrochemical Engineering',
  'Chemical Engineering',
  'Civil Engineering',
  'Data Science and Analytics',
  'Transport Planning and Management',
  'Mathematics with Finance',
  'Engineering Mathematics',
  'Mechanical Engineering — Top-up',
  'Electrical and Electronic Engineering — Top-up'
];

const seedHostel = db.prepare('INSERT OR IGNORE INTO hostels (name) VALUES (?)');
for (const h of SEED_HOSTELS) seedHostel.run(h);

// Remove old courses not in the new list, then seed new ones
const validCourseNames = new Set(SEED_COURSES);
const allCourses = db.prepare('SELECT id, name FROM courses').all() as { id: number; name: string }[];
for (const c of allCourses) {
  if (!validCourseNames.has(c.name)) {
    db.prepare('DELETE FROM courses WHERE id = ?').run(c.id);
  }
}

const seedCourse = db.prepare('INSERT OR IGNORE INTO courses (name) VALUES (?)');
for (const c of SEED_COURSES) seedCourse.run(c);

export default db;
