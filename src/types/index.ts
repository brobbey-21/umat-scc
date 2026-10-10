export type AcademicLevel = 'Level 100 (Freshman)' | 'Level 200' | 'Level 300' | 'Level 400' | 'Postgraduate';

export type OutreachStatus = 'New / Pending' | 'Contacted & Welcomed' | 'Hostel Visited' | 'Added to Fellowship Group';

export interface Denomination {
  id: string;
  name: string;
  campusFellowship: string;
  shortCode: string;
  color: string;
  accent: string;
  logoText: string;
  logoImage?: string | null;
  description: string;
}

export interface DenominationAdmin {
  id: string;
  denominationId: string;
  denominationName: string;
  fellowshipCode: string;
  adminName: string;
  roleTitle: string; // e.g. "Campus President", "Welfare Secretary", "Freshers Coordinator"
  phone: string;
  email: string;
  assignedHalls?: string;
  dateAdded: string;
}

export interface StudentRegistration {
  id: string;
  fullName: string;
  gender?: 'Male' | 'Female';
  phone: string;
  whatsappSameAsPhone?: boolean;
  programOfStudy: string;
  academicLevel: AcademicLevel;
  hallOrHostel: string;
  roomOrBlock?: string;
  denominationId: string;
  denominationName: string;
  fellowshipCode: string;
  homeParishOrCity?: string;
  prayerRequestOrNotes?: string;
  registeredAt: string;
  outreachStatus: OutreachStatus;
  outreachNotes?: string[];
  contactedBy?: string;
  contactedAt?: string;
}
