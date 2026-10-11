import { Denomination, DenominationAdmin, StudentRegistration } from '../types';

export const DENOMINATIONS: Denomination[] = [
  {
    id: 'agcm',
    name: 'Assemblies of God',
    campusFellowship: 'AGCM (Assemblies of God Campus Ministry)',
    shortCode: 'AGCM',
    color: '#C62828',
    accent: '#EF5350',
    logoText: 'AG',
    description: 'Assemblies of God campus branch, youth fellowship and dawn prayers.'
  },
  {
    id: 'ghamsu',
    name: 'Methodist Church Ghana',
    campusFellowship: 'GHAMSU (Ghana Methodist Students Union)',
    shortCode: 'GHAMSU',
    color: '#1565C0',
    accent: '#42A5F5',
    logoText: 'GM',
    description: 'Methodist fellowship on campus, liturgical prayer, choral hymns and outreach.'
  },
  {
    id: 'pensa',
    name: 'The Church of Pentecost',
    campusFellowship: 'PENSA (Pentecost Students Association)',
    shortCode: 'PENSA',
    color: '#2E7D32',
    accent: '#66BB6A',
    logoText: 'PA',
    description: 'Pentecostal fellowship on campus, hall cells, and weekly prayer assemblies.'
  },
  {
    id: 'pax',
    name: 'Catholic Church',
    campusFellowship: 'PAX ROMANA (International Movement of Catholic Students)',
    shortCode: 'PAX ROMANA',
    color: '#6A1B9A',
    accent: '#AB47BC',
    logoText: 'PR',
    description: 'Catholic university chaplaincy, Holy Mass, sacraments, and rosary devotions.'
  },
  {
    id: 'newbreed',
    name: 'New Breed',
    campusFellowship: 'NEW BREED (New Breed Campus Fellowship)',
    shortCode: 'NEW BREED',
    color: '#E65100',
    accent: '#FF7043',
    logoText: 'NB',
    description: 'New Breed campus fellowship, vibrant youth worship and discipleship.'
  },
  {
    id: 'ccf',
    name: 'Campus Christian Family',
    campusFellowship: 'CCF (Campus Christian Family)',
    shortCode: 'CCF',
    color: '#00695C',
    accent: '#26A69A',
    logoText: 'CC',
    description: 'Campus Christian Family fellowship, inter-denominational worship and community.'
  },
  {
    id: 'casa',
    name: 'Christ Apostolic Church',
    campusFellowship: 'CASA (Christ Apostolic Students Association)',
    shortCode: 'CASA',
    color: '#4E1410',
    accent: '#8D4440',
    logoText: 'CA',
    description: 'Christ Apostolic Students Association, prayer meetings and campus evangelism.'
  },
  {
    id: 'nupsg',
    name: 'Presbyterian Church of Ghana',
    campusFellowship: 'NUPS-G (National Union of Presbyterian Students Ghana)',
    shortCode: 'NUPS-G',
    color: '#1B5E20',
    accent: '#43A047',
    logoText: 'PG',
    description: 'Presbyterian student fellowship, bible study and collegiate discipleship.'
  },
  {
    id: 'nubs',
    name: 'Baptist Convention',
    campusFellowship: 'NUBS (National Union of Baptist Students)',
    shortCode: 'NUBS',
    color: '#1A237E',
    accent: '#3949AB',
    logoText: 'NB',
    description: 'Baptist student fellowship, scripture exposition and mission outreach.'
  },
  {
    id: 'gesam',
    name: 'Global Evangelical Church',
    campusFellowship: 'GESAM (Global Evangelical Students and Associates Ministry)',
    shortCode: 'GESAM',
    color: '#B71C1C',
    accent: '#E53935',
    logoText: 'GE',
    description: 'Global Evangelical Students and Associates Ministry, evangelical discipleship.'
  },
  {
    id: 'apos',
    name: 'Apostolic Church',
    campusFellowship: 'APOSA (Apostolic Students Association)',
    shortCode: 'APOSA',
    color: '#283593',
    accent: '#5C6BC0',
    logoText: 'AS',
    description: 'Apostolic Students Association, prayer and apostolic witness on campus.'
  },
  {
    id: 'dlcf',
    name: 'Deeper Life Bible Church',
    campusFellowship: 'DLCF (Deeper Life Campus Fellowship)',
    shortCode: 'DLCF',
    color: '#0D47A1',
    accent: '#1E88E5',
    logoText: 'DL',
    description: 'Deeper Life Campus Fellowship, intensive bible study and holiness teaching.'
  },
  {
    id: 'nuas',
    name: 'Anglican Church of Ghana',
    campusFellowship: 'NUAS (National Union of Anglican Students)',
    shortCode: 'NUAS',
    color: '#37474F',
    accent: '#78909C',
    logoText: 'NA',
    description: 'National Union of Anglican Students, liturgy, prayer book fellowship and chapel care.'
  }
];

export const COMMON_PROGRAMS = [
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
  'Mechanical Engineering - Top-up',
  'Electrical and Electronic Engineering - Top-up'
];

export const COMMON_HALLS_AND_HOSTELS = [
  'KT Hall',
  'Chambers',
  'Gold Hall'
];

export const INITIAL_ADMINS: DenominationAdmin[] = [
  {
    id: 'admin-pensa-01',
    denominationId: 'pensa',
    denominationName: 'The Church of Pentecost',
    fellowshipCode: 'PENSA',
    adminName: 'Elder Kwabena Osei-Mensah',
    roleTitle: 'Campus President & Freshers Coordinator',
    phone: '+233 24 489 1204',
    email: 'k.oseimensah@pensa-campus.org',
    assignedHalls: 'All Halls & Hostels',
    dateAdded: '2026-09-01'
  },
  {
    id: 'admin-nupsg-01',
    denominationId: 'nupsg',
    denominationName: 'Presbyterian Church of Ghana',
    fellowshipCode: 'NUPS-G',
    adminName: 'Emmanuel Darko-Boateng',
    roleTitle: 'Freshers Welfare Secretary',
    phone: '+233 20 811 4432',
    email: 'e.darko@nupsg-umat.org',
    assignedHalls: 'Katanga & Unity Halls',
    dateAdded: '2026-09-02'
  },
  {
    id: 'admin-ghamsu-01',
    denominationId: 'ghamsu',
    denominationName: 'Methodist Church Ghana',
    fellowshipCode: 'GHAMSU',
    adminName: 'Sister Grace Abena Antwi',
    roleTitle: 'Visitation & Orientation Secretary',
    phone: '+233 55 312 9081',
    email: 'grace.antwi@ghamsu.edu.gh',
    assignedHalls: 'All Hostels',
    dateAdded: '2026-09-03'
  },
  {
    id: 'admin-pax-01',
    denominationId: 'pax',
    denominationName: 'Catholic Church',
    fellowshipCode: 'PAX ROMANA',
    adminName: 'Francis Baah Gyasi',
    roleTitle: 'Vice President (Freshers Affairs)',
    phone: '+233 24 991 3320',
    email: 'francis.gyasi@paxromana.org',
    assignedHalls: 'All Campus Halls',
    dateAdded: '2026-09-04'
  },
  {
    id: 'admin-agcm-01',
    denominationId: 'agcm',
    denominationName: 'Assemblies of God',
    fellowshipCode: 'AGCM',
    adminName: 'Samuel Osei-Tutu',
    roleTitle: 'Campus Evangelism Coordinator',
    phone: '+233 54 810 4429',
    email: 's.oseitutu@agcm-gh.org',
    assignedHalls: 'All Quads',
    dateAdded: '2026-09-05'
  }
];

export const INITIAL_STUDENTS: StudentRegistration[] = [
  {
    id: 'stud-001',
    fullName: 'Nana Kofi Brobbey',
    gender: 'Male',
    phone: '+233 27 642 3019',
    whatsappSameAsPhone: true,
    programOfStudy: 'BSc Petroleum Geosciences & Engineering',
    academicLevel: 'Level 100 (Freshman)',
    hallOrHostel: 'Unity Hall (Continental / Conti)',
    roomOrBlock: 'Block B, Rm 12',
    denominationId: 'nupsg',
    denominationName: 'Presbyterian Church of Ghana',
    fellowshipCode: 'NUPS-G',
    homeParishOrCity: 'Ebenezer Presby Church, Sunyani',
    prayerRequestOrNotes: 'Adjusting to campus life, looking for hostel roommate for prayer.',
    registeredAt: '2026-10-06T09:15:00Z',
    outreachStatus: 'Contacted & Welcomed',
    outreachNotes: ['Called him on WhatsApp, invited to Friday Welcome Night.'],
    contactedBy: 'Emmanuel Darko-Boateng',
    contactedAt: '2026-10-06T10:30:00Z'
  },
  {
    id: 'stud-002',
    fullName: 'Priscilla Akua Appiah',
    gender: 'Female',
    phone: '+233 55 312 9081',
    whatsappSameAsPhone: true,
    programOfStudy: 'BSc Computer Science & Engineering',
    academicLevel: 'Level 100 (Freshman)',
    hallOrHostel: 'Gold Refinery Hostel',
    roomOrBlock: 'Flat 4B, Room 2',
    denominationId: 'pensa',
    denominationName: 'The Church of Pentecost',
    fellowshipCode: 'PENSA',
    homeParishOrCity: 'PIWC Tarkwa Central',
    prayerRequestOrNotes: 'Wants to join the PENSA Choir / Sound team on campus.',
    registeredAt: '2026-10-06T08:40:00Z',
    outreachStatus: 'Added to Fellowship Group',
    outreachNotes: ['Welcomed by PENSA team and added to 2026 Freshers WhatsApp group.'],
    contactedBy: 'Elder Kwabena Osei-Mensah',
    contactedAt: '2026-10-06T09:00:00Z'
  },
  {
    id: 'stud-003',
    fullName: 'David Kwaku Kyeremeh',
    gender: 'Male',
    phone: '+233 26 781 2290',
    whatsappSameAsPhone: true,
    programOfStudy: 'BSc Renewable Energy Engineering',
    academicLevel: 'Level 100 (Freshman)',
    hallOrHostel: 'University Hall (Katanga)',
    roomOrBlock: 'Block C, Room 19',
    denominationId: 'ghamsu',
    denominationName: 'Methodist Church Ghana',
    fellowshipCode: 'GHAMSU',
    homeParishOrCity: 'Wesley Cathedral, Kumasi',
    prayerRequestOrNotes: 'Prayer for course registration and physics lab groupings.',
    registeredAt: '2026-10-06T11:05:00Z',
    outreachStatus: 'New / Pending',
    outreachNotes: []
  },
  {
    id: 'stud-004',
    fullName: 'Abena Serwaa Boateng',
    gender: 'Female',
    phone: '+233 20 449 0182',
    whatsappSameAsPhone: true,
    programOfStudy: 'BSc Geomatic Engineering',
    academicLevel: 'Level 100 (Freshman)',
    hallOrHostel: 'Grace Villa Hostel',
    roomOrBlock: 'Room 3',
    denominationId: 'pax',
    denominationName: 'Catholic Church',
    fellowshipCode: 'PAX ROMANA',
    homeParishOrCity: 'St. Peter Parish, Kumasi',
    prayerRequestOrNotes: 'Wants Sunday Mass schedule at the university chapel.',
    registeredAt: '2026-10-05T16:20:00Z',
    outreachStatus: 'Hostel Visited',
    outreachNotes: ['Visited by PAX ROMANA Katanga/Grace Villa wing reps.'],
    contactedBy: 'Francis Baah Gyasi',
    contactedAt: '2026-10-06T08:15:00Z'
  },
  {
    id: 'stud-005',
    fullName: 'Emmanuel Sena Addo',
    gender: 'Male',
    phone: '+233 54 810 4429',
    whatsappSameAsPhone: true,
    programOfStudy: 'BSc Mining Engineering',
    academicLevel: 'Level 100 (Freshman)',
    hallOrHostel: 'Independence Hall',
    roomOrBlock: 'Block A, Room 15',
    denominationId: 'agcm',
    denominationName: 'Assemblies of God',
    fellowshipCode: 'AGCM',
    homeParishOrCity: 'Living Waters Assembly, Takoradi',
    prayerRequestOrNotes: 'Interested in hall dawn prayer watchmen.',
    registeredAt: '2026-10-05T14:10:00Z',
    outreachStatus: 'Contacted & Welcomed',
    outreachNotes: ['Called and sent orientation brochure.'],
    contactedBy: 'Samuel Osei-Tutu',
    contactedAt: '2026-10-05T18:00:00Z'
  },
  {
    id: 'stud-006',
    fullName: 'Comfort Naa Dedei Tagoe',
    gender: 'Female',
    phone: '+233 55 120 7764',
    whatsappSameAsPhone: true,
    programOfStudy: 'BSc Mathematical Sciences',
    academicLevel: 'Level 100 (Freshman)',
    hallOrHostel: 'West End Private Hostel',
    roomOrBlock: 'Room 8',
    denominationId: 'pensa',
    denominationName: 'The Church of Pentecost',
    fellowshipCode: 'PENSA',
    homeParishOrCity: 'PIWC Atomic, Accra',
    prayerRequestOrNotes: 'Needs directions to Central Campus Chapel on Wednesday.',
    registeredAt: '2026-10-06T07:30:00Z',
    outreachStatus: 'New / Pending',
    outreachNotes: []
  },
  {
    id: 'stud-007',
    fullName: 'Michael Kwadwo Frimpong',
    gender: 'Male',
    phone: '+233 24 551 8822',
    whatsappSameAsPhone: true,
    programOfStudy: 'BSc Electrical & Electronic Engineering',
    academicLevel: 'Level 100 (Freshman)',
    hallOrHostel: 'University Hall (Katanga)',
    roomOrBlock: 'Block A, Room 34',
    denominationId: 'bsu',
    denominationName: 'Baptist Convention',
    fellowshipCode: 'BSU',
    homeParishOrCity: 'Grace Baptist, Amakom',
    prayerRequestOrNotes: 'Academic focus and fellowship connection.',
    registeredAt: '2026-10-06T10:00:00Z',
    outreachStatus: 'New / Pending',
    outreachNotes: []
  }
];

const STORAGE_KEY_STUDENTS = 'scc_fresh_students_registry_v2';
const STORAGE_KEY_ADMINS = 'scc_denomination_admins_v2';

export function loadStudents(): StudentRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading students:', e);
  }
  return INITIAL_STUDENTS;
}

export function saveStudents(students: StudentRegistration[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students:', e);
  }
}

export function loadDenominationAdmins(): DenominationAdmin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMINS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading admins:', e);
  }
  return INITIAL_ADMINS;
}

export function saveDenominationAdmins(admins: DenominationAdmin[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
  } catch (e) {
    console.error('Error saving admins:', e);
  }
}
