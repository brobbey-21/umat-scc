// server/app.ts
import { config } from "dotenv";
import express from "express";

// server/db.ts
import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var localDbPath = path.join(__dirname, "..", "data", "scc.db").replace(/\\/g, "/");
var bootError = null;
var db;
try {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (process.env.VERCEL && !tursoUrl) {
    throw new Error("TURSO_DATABASE_URL is not set in the Vercel environment");
  }
  if (!tursoUrl) {
    const dataDir = path.dirname(localDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
  db = createClient({
    url: tursoUrl || `file:${localDbPath}`,
    authToken: process.env.TURSO_AUTH_TOKEN
  });
} catch (e) {
  bootError = e instanceof Error ? e.message : String(e);
  console.error("DB client creation failed:", e);
  db = createClient({ url: `file:${localDbPath}` });
}
try {
  await db.executeMultiple(`
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
  async function columnExists(table, column) {
    const result = await db.execute(`PRAGMA table_info(${table})`);
    return result.rows.some((c) => c.name === column);
  }
  if (!await columnExists("denominations", "accent")) {
    await db.executeMultiple(`ALTER TABLE denominations ADD COLUMN accent TEXT NOT NULL DEFAULT '#888888'`);
  }
  if (!await columnExists("denominations", "logoText")) {
    await db.executeMultiple(`ALTER TABLE denominations ADD COLUMN logoText TEXT NOT NULL DEFAULT ''`);
  }
  if (!await columnExists("denominations", "logoImage")) {
    await db.executeMultiple(`ALTER TABLE denominations ADD COLUMN logoImage TEXT`);
  }
  const SEED_DENOMINATIONS = [
    { id: "agcm", name: "Assemblies of God", campusFellowship: "AGCM (Assemblies of God Campus Ministry)", shortCode: "AGCM", color: "#C62828", accent: "#EF5350", logoText: "AG", description: "Assemblies of God campus branch, youth fellowship and dawn prayers." },
    { id: "ghamsu", name: "Methodist Church Ghana", campusFellowship: "GHAMSU (Ghana Methodist Students Union)", shortCode: "GHAMSU", color: "#1565C0", accent: "#42A5F5", logoText: "GM", description: "Methodist fellowship on campus, liturgical prayer, choral hymns and outreach." },
    { id: "pensa", name: "The Church of Pentecost", campusFellowship: "PENSA (Pentecost Students Association)", shortCode: "PENSA", color: "#2E7D32", accent: "#66BB6A", logoText: "PA", description: "Pentecostal fellowship on campus, hall cells, and weekly prayer assemblies." },
    { id: "pax", name: "Catholic Church", campusFellowship: "PAX ROMANA (International Movement of Catholic Students)", shortCode: "PAX ROMANA", color: "#6A1B9A", accent: "#AB47BC", logoText: "PR", description: "Catholic university chaplaincy, Holy Mass, sacraments, and rosary devotions." },
    { id: "newbreed", name: "New Breed", campusFellowship: "NEW BREED (New Breed Campus Fellowship)", shortCode: "NEW BREED", color: "#E65100", accent: "#FF7043", logoText: "NB", description: "New Breed campus fellowship, vibrant youth worship and discipleship." },
    { id: "ccf", name: "Campus Christian Family", campusFellowship: "CCF (Campus Christian Family)", shortCode: "CCF", color: "#00695C", accent: "#26A69A", logoText: "CC", description: "Campus Christian Family fellowship, inter-denominational worship and community." },
    { id: "casa", name: "Christ Apostolic Church", campusFellowship: "CASA (Christ Apostolic Students Association)", shortCode: "CASA", color: "#4E1410", accent: "#8D4440", logoText: "CA", description: "Christ Apostolic Students Association, prayer meetings and campus evangelism." },
    { id: "nupsg", name: "Presbyterian Church of Ghana", campusFellowship: "NUPS-G (National Union of Presbyterian Students Ghana)", shortCode: "NUPS-G", color: "#1B5E20", accent: "#43A047", logoText: "PG", description: "Presbyterian student fellowship, bible study and collegiate discipleship." },
    { id: "nubs", name: "Baptist Convention", campusFellowship: "NUBS (National Union of Baptist Students)", shortCode: "NUBS", color: "#1A237E", accent: "#3949AB", logoText: "NB", description: "Baptist student fellowship, scripture exposition and mission outreach." },
    { id: "gesam", name: "Global Evangelical Church", campusFellowship: "GESAM (Global Evangelical Students and Associates Ministry)", shortCode: "GESAM", color: "#B71C1C", accent: "#E53935", logoText: "GE", description: "Global Evangelical Students and Associates Ministry, evangelical discipleship." },
    { id: "apos", name: "Apostolic Church", campusFellowship: "APOSA (Apostolic Students Association)", shortCode: "APOSA", color: "#283593", accent: "#5C6BC0", logoText: "AS", description: "Apostolic Students Association, prayer and apostolic witness on campus." },
    { id: "dlcf", name: "Deeper Life Bible Church", campusFellowship: "DLCF (Deeper Life Campus Fellowship)", shortCode: "DLCF", color: "#0D47A1", accent: "#1E88E5", logoText: "DL", description: "Deeper Life Campus Fellowship, intensive bible study and holiness teaching." },
    { id: "nuas", name: "Anglican Church of Ghana", campusFellowship: "NUAS (National Union of Anglican Students)", shortCode: "NUAS", color: "#37474F", accent: "#78909C", logoText: "NA", description: "National Union of Anglican Students, liturgy, prayer book fellowship and chapel care." }
  ];
  const validIds = SEED_DENOMINATIONS.map((d) => d.id);
  const allExisting = await db.execute("SELECT id FROM denominations");
  for (const row of allExisting.rows) {
    if (!validIds.includes(String(row.id))) {
      await db.execute({ sql: "DELETE FROM denominations WHERE id = ?", args: [String(row.id)] });
    }
  }
  for (const denom of SEED_DENOMINATIONS) {
    await db.execute({
      sql: `INSERT INTO denominations (id, name, campusFellowship, shortCode, color, accent, logoText, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, campusFellowship=excluded.campusFellowship,
            shortCode=excluded.shortCode, color=excluded.color,
            accent=excluded.accent, logoText=excluded.logoText,
            description=excluded.description`,
      args: [denom.id, denom.name, denom.campusFellowship, denom.shortCode, denom.color, denom.accent, denom.logoText, denom.description]
    });
  }
  const SEED_HOSTELS = [
    "KT Hall",
    "Chambers",
    "Gold Hall"
  ];
  const validHostelNames = new Set(SEED_HOSTELS);
  const allHostels = await db.execute("SELECT id, name FROM hostels");
  for (const h of allHostels.rows) {
    if (!validHostelNames.has(String(h.name))) {
      await db.execute({ sql: "DELETE FROM hostels WHERE id = ?", args: [Number(h.id)] });
    }
  }
  const SEED_COURSES = [
    "Mining Engineering",
    "Minerals Engineering",
    "Mechanical Engineering",
    "Electrical and Electronic Engineering",
    "Renewable Energy Engineering",
    "Telecommunication Engineering",
    "Cyber Security",
    "Computer Science and Engineering",
    "Information Systems and Technology",
    "Mathematics",
    "Statistical Data Science",
    "Robotics Engineering and Artificial Intelligence",
    "Logistics and Transport Management",
    "Economics and Industrial Organisation",
    "Finance and Data Science",
    "Geomatic Engineering",
    "Geological Engineering",
    "Spatial Planning",
    "Environmental and Safety Engineering",
    "Land Administration and Information Systems",
    "Petroleum Engineering",
    "Natural Gas Engineering",
    "Petroleum Geosciences and Engineering",
    "Petroleum Refining and Petrochemical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Data Science and Analytics",
    "Transport Planning and Management",
    "Mathematics with Finance",
    "Engineering Mathematics",
    "Mechanical Engineering - Top-up",
    "Electrical and Electronic Engineering - Top-up"
  ];
  for (const h of SEED_HOSTELS) {
    await db.execute({ sql: "INSERT OR IGNORE INTO hostels (name) VALUES (?)", args: [h] });
  }
  const validCourseNames = new Set(SEED_COURSES);
  const allCourses = await db.execute("SELECT id, name FROM courses");
  for (const c of allCourses.rows) {
    if (!validCourseNames.has(String(c.name))) {
      await db.execute({ sql: "DELETE FROM courses WHERE id = ?", args: [Number(c.id)] });
    }
  }
  for (const c of SEED_COURSES) {
    await db.execute({ sql: "INSERT OR IGNORE INTO courses (name) VALUES (?)", args: [c] });
  }
} catch (e) {
  console.error("DB initialization failed:", e);
}
var db_default = db;

// server/routes/auth.ts
import { Router } from "express";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "scc-sanctuary-ledger-secret-change-in-production";
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.adminPassword = payload.adminPassword;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
function signToken(adminPassword) {
  return jwt.sign({ adminPassword }, JWT_SECRET, { expiresIn: "12h" });
}

// server/routes/auth.ts
var router = Router();
router.post("/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  const adminPassword = process.env.ADMIN_PASSWORD || "scc-admin-2026";
  if (password !== adminPassword) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = signToken(adminPassword);
  return res.json({ token, message: "Login successful" });
});
var auth_default = router;

// server/routes/students.ts
import { Router as Router2 } from "express";
import { randomUUID } from "crypto";
var router2 = Router2();
router2.get("/count", async (_req, res) => {
  const result = await db_default.execute("SELECT COUNT(*) as count FROM students");
  res.json({ count: Number(result.rows[0].count) });
});
router2.get("/", requireAuth, async (_req, res) => {
  const result = await db_default.execute("SELECT * FROM students ORDER BY registeredAt DESC");
  res.json(result.rows.map(parseStudentRow));
});
router2.get("/:id", requireAuth, async (req, res) => {
  const result = await db_default.execute({ sql: "SELECT * FROM students WHERE id = ?", args: [req.params.id] });
  const row = result.rows[0];
  if (!row) return res.status(404).json({ error: "Student not found" });
  res.json(parseStudentRow(row));
});
router2.post("/", async (req, res) => {
  const {
    fullName,
    gender,
    phone,
    whatsappSameAsPhone,
    programOfStudy,
    academicLevel,
    hallOrHostel,
    roomOrBlock,
    denominationId,
    homeParishOrCity,
    prayerRequestOrNotes
  } = req.body;
  if (!fullName || !phone || !programOfStudy || !academicLevel || !hallOrHostel || !denominationId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const denomResult = await db_default.execute({ sql: "SELECT * FROM denominations WHERE id = ?", args: [denominationId] });
  const denom = denomResult.rows[0];
  if (!denom) return res.status(400).json({ error: "Invalid denomination" });
  const id = `stud-${randomUUID().slice(0, 8)}`;
  const registeredAt = (/* @__PURE__ */ new Date()).toISOString();
  await db_default.execute({
    sql: `INSERT INTO students (id, fullName, gender, phone, whatsappSameAsPhone, programOfStudy,
      academicLevel, hallOrHostel, roomOrBlock, denominationId, denominationName, fellowshipCode,
      homeParishOrCity, prayerRequestOrNotes, registeredAt, outreachStatus, outreachNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New / Pending', '[]')`,
    args: [
      id,
      fullName,
      gender || null,
      phone,
      whatsappSameAsPhone ? 1 : 0,
      programOfStudy,
      academicLevel,
      hallOrHostel,
      roomOrBlock || null,
      denominationId,
      String(denom.name),
      String(denom.shortCode),
      homeParishOrCity || null,
      prayerRequestOrNotes || null,
      registeredAt
    ]
  });
  const rowResult = await db_default.execute({ sql: "SELECT * FROM students WHERE id = ?", args: [id] });
  res.status(201).json(parseStudentRow(rowResult.rows[0]));
});
router2.patch("/:id/status", requireAuth, async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ["New / Pending", "Contacted & Welcomed", "Hostel Visited", "Added to Fellowship Group"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const existingResult = await db_default.execute({ sql: "SELECT * FROM students WHERE id = ?", args: [req.params.id] });
  const existing = existingResult.rows[0];
  if (!existing) return res.status(404).json({ error: "Student not found" });
  const existingNotes = JSON.parse(String(existing.outreachNotes || "[]"));
  if (note) existingNotes.unshift(note);
  const contactedAt = (/* @__PURE__ */ new Date()).toISOString();
  await db_default.execute({
    sql: "UPDATE students SET outreachStatus = ?, outreachNotes = ?, contactedAt = ? WHERE id = ?",
    args: [status, JSON.stringify(existingNotes), contactedAt, req.params.id]
  });
  const rowResult = await db_default.execute({ sql: "SELECT * FROM students WHERE id = ?", args: [req.params.id] });
  res.json(parseStudentRow(rowResult.rows[0]));
});
function parseStudentRow(row) {
  if (!row) return null;
  return {
    ...row,
    whatsappSameAsPhone: !!row.whatsappSameAsPhone,
    outreachNotes: JSON.parse(String(row.outreachNotes || "[]"))
  };
}
var students_default = router2;

// server/routes/admins.ts
import { Router as Router3 } from "express";
import { randomUUID as randomUUID2 } from "crypto";
var router3 = Router3();
router3.use(requireAuth);
router3.get("/", async (_req, res) => {
  const result = await db_default.execute("SELECT * FROM denomination_admins ORDER BY dateAdded DESC");
  res.json(result.rows);
});
router3.post("/", async (req, res) => {
  const { denominationId, adminName, roleTitle, phone, email, assignedHalls } = req.body;
  if (!denominationId || !adminName || !roleTitle || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const denomResult = await db_default.execute({ sql: "SELECT * FROM denominations WHERE id = ?", args: [denominationId] });
  const denom = denomResult.rows[0];
  if (!denom) return res.status(400).json({ error: "Invalid denomination" });
  const id = `admin-${denominationId}-${randomUUID2().slice(0, 8)}`;
  const dateAdded = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  await db_default.execute({
    sql: `INSERT INTO denomination_admins (id, denominationId, denominationName, fellowshipCode,
      adminName, roleTitle, phone, email, assignedHalls, dateAdded)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      denominationId,
      String(denom.name),
      String(denom.shortCode),
      adminName,
      roleTitle,
      phone,
      email || `${denominationId}.admin@campus.org`,
      assignedHalls || null,
      dateAdded
    ]
  });
  const rowResult = await db_default.execute({ sql: "SELECT * FROM denomination_admins WHERE id = ?", args: [id] });
  res.status(201).json(rowResult.rows[0]);
});
router3.delete("/:id", async (req, res) => {
  const result = await db_default.execute({ sql: "DELETE FROM denomination_admins WHERE id = ?", args: [req.params.id] });
  if (result.rowsAffected === 0) {
    return res.status(404).json({ error: "Admin not found" });
  }
  res.json({ message: "Admin deleted" });
});
var admins_default = router3;

// server/routes/denominations.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/", async (_req, res) => {
  const result = await db_default.execute("SELECT * FROM denominations");
  res.json(result.rows);
});
router4.post("/", requireAuth, async (req, res) => {
  const { id, name, campusFellowship, shortCode, color, accent, logoText, description, logoImage } = req.body;
  if (!name || !shortCode) {
    return res.status(400).json({ error: "Name and short code are required" });
  }
  const denomId = id || shortCode.toLowerCase().replace(/[^a-z0-9]/g, "");
  try {
    await db_default.execute({
      sql: `INSERT INTO denominations (id, name, campusFellowship, shortCode, color, accent, logoText, description, logoImage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        denomId,
        name,
        campusFellowship || name,
        shortCode,
        color || "#5C6861",
        accent || "#8C9790",
        logoText || shortCode.slice(0, 2).toUpperCase(),
        description || "",
        logoImage || null
      ]
    });
    const rowResult = await db_default.execute({ sql: "SELECT * FROM denominations WHERE id = ?", args: [denomId] });
    res.status(201).json(rowResult.rows[0]);
  } catch (e) {
    if (e.message?.includes("UNIQUE")) {
      return res.status(409).json({ error: "Denomination already exists" });
    }
    throw e;
  }
});
router4.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, campusFellowship, shortCode, color, accent, logoText, description, logoImage } = req.body;
  const existingResult = await db_default.execute({ sql: "SELECT * FROM denominations WHERE id = ?", args: [id] });
  const existing = existingResult.rows[0];
  if (!existing) return res.status(404).json({ error: "Denomination not found" });
  await db_default.execute({
    sql: `UPDATE denominations SET
      name = ?, campusFellowship = ?, shortCode = ?,
      color = ?, accent = ?, logoText = ?, description = ?,
      logoImage = ?
      WHERE id = ?`,
    args: [
      name ?? existing.name,
      campusFellowship ?? existing.campusFellowship,
      shortCode ?? existing.shortCode,
      color ?? existing.color,
      accent ?? existing.accent,
      logoText ?? existing.logoText,
      description ?? existing.description,
      logoImage !== void 0 ? logoImage : existing.logoImage,
      id
    ]
  });
  const rowResult = await db_default.execute({ sql: "SELECT * FROM denominations WHERE id = ?", args: [id] });
  res.json(rowResult.rows[0]);
});
router4.delete("/:id", requireAuth, async (req, res) => {
  const studentCount = await db_default.execute({ sql: "SELECT COUNT(*) as c FROM students WHERE denominationId = ?", args: [req.params.id] });
  const studentC = Number(studentCount.rows[0].c);
  if (studentC > 0) {
    return res.status(409).json({ error: `Cannot delete: ${studentC} students are registered under this fellowship` });
  }
  const adminCount = await db_default.execute({ sql: "SELECT COUNT(*) as c FROM denomination_admins WHERE denominationId = ?", args: [req.params.id] });
  const adminC = Number(adminCount.rows[0].c);
  if (adminC > 0) {
    return res.status(409).json({ error: `Cannot delete: ${adminC} admins are assigned to this fellowship` });
  }
  const result = await db_default.execute({ sql: "DELETE FROM denominations WHERE id = ?", args: [req.params.id] });
  if (result.rowsAffected === 0) return res.status(404).json({ error: "Denomination not found" });
  res.json({ message: "Denomination deleted" });
});
var denominations_default = router4;

// server/routes/hostels.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/", async (_req, res) => {
  const result = await db_default.execute("SELECT * FROM hostels ORDER BY name");
  res.json(result.rows);
});
router5.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });
  try {
    const result = await db_default.execute({ sql: "INSERT INTO hostels (name) VALUES (?)", args: [name.trim()] });
    const rowResult = await db_default.execute({ sql: "SELECT * FROM hostels WHERE id = ?", args: [Number(result.lastInsertRowid)] });
    res.status(201).json(rowResult.rows[0]);
  } catch (e) {
    if (e.message?.includes("UNIQUE")) {
      return res.status(409).json({ error: "Hostel already exists" });
    }
    throw e;
  }
});
router5.delete("/:id", requireAuth, async (req, res) => {
  const result = await db_default.execute({ sql: "DELETE FROM hostels WHERE id = ?", args: [Number(req.params.id)] });
  if (result.rowsAffected === 0) return res.status(404).json({ error: "Hostel not found" });
  res.json({ message: "Hostel deleted" });
});
var hostels_default = router5;

// server/routes/courses.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/", async (_req, res) => {
  const result = await db_default.execute("SELECT * FROM courses ORDER BY name");
  res.json(result.rows);
});
router6.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });
  try {
    const result = await db_default.execute({ sql: "INSERT INTO courses (name) VALUES (?)", args: [name.trim()] });
    const rowResult = await db_default.execute({ sql: "SELECT * FROM courses WHERE id = ?", args: [Number(result.lastInsertRowid)] });
    res.status(201).json(rowResult.rows[0]);
  } catch (e) {
    if (e.message?.includes("UNIQUE")) {
      return res.status(409).json({ error: "Course already exists" });
    }
    throw e;
  }
});
router6.delete("/:id", requireAuth, async (req, res) => {
  const result = await db_default.execute({ sql: "DELETE FROM courses WHERE id = ?", args: [Number(req.params.id)] });
  if (result.rowsAffected === 0) return res.status(404).json({ error: "Course not found" });
  res.json({ message: "Course deleted" });
});
var courses_default = router6;

// server/app.ts
config({ path: [".env.local", ".env"] });
var app = express();
app.use(express.json({ limit: "10mb" }));
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });
}
app.use("/api/auth", auth_default);
app.use("/api/students", students_default);
app.use("/api/admins", admins_default);
app.use("/api/denominations", denominations_default);
app.use("/api/hostels", hostels_default);
app.use("/api/courses", courses_default);
app.get("/api/health", async (_req, res) => {
  if (bootError) {
    return res.status(503).json({
      status: "error",
      database: bootError,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  try {
    await db_default.execute("SELECT 1");
    res.json({ status: "ok", database: "connected", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (e) {
    res.status(503).json({ status: "error", database: e?.message || "unreachable", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  }
});
app.use((err, _req, res, _next) => {
  console.error("API error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: err?.message || "Internal server error" });
});
var app_default = app;

// server/vercel.ts
var vercel_default = app_default;
export {
  vercel_default as default
};
