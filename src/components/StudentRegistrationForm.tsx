import React, { useState, useRef } from 'react';
import {
  Denomination,
  StudentRegistration,
  DenominationAdmin,
  AcademicLevel
} from '../types';
import {
  COMMON_PROGRAMS,
  COMMON_HALLS_AND_HOSTELS
} from '../data/mockData';
import { FellowshipLogo } from './FellowshipLogo';
import { CountryFlag } from './CountryFlag';
import { COUNTRY_CODES } from '../constants/countries';
import {
  User,
  Phone,
  Building,
  GraduationCap,
  Church,
  Heart,
  CheckCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Sparkles,
  MapPin,
  ShieldCheck,
  Edit3,
  Clock
} from 'lucide-react';

const INPUT =
  'w-full h-13 px-5 bg-[#fdfdfb] border border-[#e6e6e0]/80 rounded-2xl text-sm text-[#141414] placeholder-[#9b9b93] shadow-[inset_0_1px_2px_rgba(20,20,20,0.04),0_1px_3px_rgba(20,20,20,0.03)] focus:outline-none focus:bg-white focus:border-[#141414]/60 focus:shadow-[inset_0_1px_2px_rgba(20,20,20,0.03),0_0_0_4px_rgba(20,20,20,0.08)] transition-all duration-200';

const SELECT =
  'select-ios w-full h-13 pl-5 pr-11 bg-[#fdfdfb] border border-[#e6e6e0]/80 rounded-2xl text-sm text-[#141414] shadow-[inset_0_1px_2px_rgba(20,20,20,0.04),0_1px_3px_rgba(20,20,20,0.03)] focus:outline-none focus:bg-white focus:border-[#141414]/60 focus:shadow-[inset_0_1px_2px_rgba(20,20,20,0.03),0_0_0_4px_rgba(20,20,20,0.08)] transition-all duration-200 cursor-pointer';

const PHASES = [
  { num: 1, label: 'Personal Details', hint: 'Name & phone' },
  { num: 2, label: 'Program & Residence', hint: 'Course & hostel' },
  { num: 3, label: 'Denomination', hint: 'Your fellowship' }
];

interface StudentRegistrationFormProps {
  onSuccess: (student: StudentRegistration) => void;
  onCancel: () => void;
  denominationAdmins: DenominationAdmin[];
  denominations: Denomination[];
  initialDenominationId?: string;
}

export const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  onSuccess,
  onCancel,
  denominationAdmins,
  denominations,
  initialDenominationId
}) => {
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3>(1);

  // Phase 1: Personal Information
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('+233');

  // Phase 2: Academic Program & Hostel Residence
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('Level 100 (Freshman)');
  const [programOfStudy, setProgramOfStudy] = useState(COMMON_PROGRAMS[0]);
  const [isCustomProgram, setIsCustomProgram] = useState(false);
  const [customProgram, setCustomProgram] = useState('');

  // Hostel selection & custom string input
  const [hallOrHostel, setHallOrHostel] = useState(COMMON_HALLS_AND_HOSTELS[0]);
  const [isCustomHostel, setIsCustomHostel] = useState(false);
  const [customHostelText, setCustomHostelText] = useState('');
  const [roomOrBlock, setRoomOrBlock] = useState('');

  // Phase 3: Denomination & Fellowship
  const [selectedDenominationId, setSelectedDenominationId] = useState(
    initialDenominationId || denominations[0]?.id || ''
  );

  // Result state
  const [submittedStudent, setSubmittedStudent] = useState<StudentRegistration | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () =>
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const fullPhone = phone.trim().startsWith('+')
    ? phone.trim()
    : `${phoneCountry} ${phone.trim()}`.trim();

  const validatePhase = (phase: number): boolean => {
    const err: Record<string, string> = {};

    if (phase === 1) {
      if (!fullName.trim()) err.fullName = 'Please enter your full legal name';
      if (!phone.trim()) {
        err.phone = 'Please enter your contact phone number';
      } else if (phone.trim().replace(/\s+/g, '').length < 9) {
        err.phone = 'Please enter a valid phone number';
      }
    } else if (phase === 2) {
      const finalProg = isCustomProgram ? customProgram : programOfStudy;
      if (!finalProg.trim()) err.program = 'Please specify your program of study';

      const finalHostel = isCustomHostel ? customHostelText : hallOrHostel;
      if (!finalHostel.trim()) err.hostel = 'Please specify your hostel or hall name';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validatePhase(currentPhase)) {
      setCurrentPhase((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3));
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (currentPhase > 1) {
      setCurrentPhase((prev) => (prev - 1) as 1 | 2 | 3);
      scrollToTop();
    } else {
      onCancel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhase(3)) return;

    const denom = denominations.find((d) => d.id === selectedDenominationId) || denominations[0];
    const finalProg = isCustomProgram ? customProgram.trim() : programOfStudy;
    const finalHostel = isCustomHostel ? customHostelText.trim() : hallOrHostel;

    const newStudent: StudentRegistration = {
      id: `stud-${Date.now()}`,
      fullName: fullName.trim(),
      gender,
      phone: fullPhone,
      whatsappSameAsPhone: true,
      programOfStudy: finalProg,
      academicLevel,
      hallOrHostel: finalHostel,
      roomOrBlock: roomOrBlock.trim() || undefined,
      denominationId: denom.id,
      denominationName: denom.name,
      fellowshipCode: denom.shortCode,
      registeredAt: new Date().toISOString(),
      outreachStatus: 'New / Pending',
      outreachNotes: []
    };

    onSuccess(newStudent);
    setSubmittedStudent(newStudent);
  };

  const handleRegisterAnother = () => {
    setFullName('');
    setPhone('');
    setRoomOrBlock('');
    setCustomHostelText('');
    setIsCustomHostel(false);
    setSubmittedStudent(null);
    setCurrentPhase(1);
  };

  // Find admin for this student's denomination
  const matchingAdmin = submittedStudent
    ? denominationAdmins.find((a) => a.denominationId === submittedStudent.denominationId)
    : null;

  const preselectedDenom = initialDenominationId
    ? denominations.find((d) => d.id === selectedDenominationId)
    : undefined;

  if (submittedStudent) {
    const submittedDenom = denominations.find((d) => d.id === submittedStudent.denominationId);

    return (
      <div className="max-w-xl mx-auto py-6 px-2 sm:px-0">
        <div className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(20,20,20,0.14)] ring-1 ring-inset ring-white/50 space-y-6 animate-fade-in">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f8f8f2] border border-[#f6eb6e] text-[#141414] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#141414] leading-tight">
                You're all set, {submittedStudent.fullName.split(' ')[0]}
              </h2>
              <p className="text-sm text-[#61615b] mt-0.5">
                We've received your details and routed them to your fellowship.
              </p>
            </div>
          </div>

          {/* Student summary card */}
          <div className="bg-[#fbfbf9] border border-[#e6e6e0] rounded-2xl overflow-hidden text-left">
            <div className="flex items-center gap-3.5 p-4 border-b border-[#e6e6e0]">
              {submittedDenom ? (
                <FellowshipLogo denomination={submittedDenom} size="md" />
              ) : (
                <span className="w-11 h-11 rounded-full bg-[#141414] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {submittedStudent.fellowshipCode}
                </span>
              )}
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#61615b]">
                  Your fellowship
                </div>
                <div className="font-heading text-base font-semibold text-[#141414] truncate">
                  {submittedStudent.denominationName}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {[
                { label: 'Program', value: submittedStudent.programOfStudy },
                {
                  label: 'Residence',
                  value: `${submittedStudent.hallOrHostel}${submittedStudent.roomOrBlock ? ` (${submittedStudent.roomOrBlock})` : ''}`
                },
                { label: 'Phone', value: submittedStudent.phone, mono: true }
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="text-[11px] text-[#9b9b93] shrink-0">{row.label}</span>
                  <span className="h-px flex-1 border-b border-dotted border-[#dbdbd4] translate-y-[-3px]" />
                  <span
                    className={`text-xs font-semibold text-[#141414] truncate text-right ${
                      row.mono ? 'font-mono' : ''
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Denomination Executive Contact */}
          {matchingAdmin ? (
            <div className="p-5 bg-[#f8f8f2]/80 border border-[#f6eb6e] rounded-2xl text-left space-y-3">
              <span className="text-xs font-semibold text-[#141414] uppercase tracking-wider block">
                Your campus rep
              </span>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-heading font-semibold text-base text-[#141414]">
                    {matchingAdmin.adminName}
                  </div>
                  <div className="text-xs text-[#61615b]">
                    {matchingAdmin.roleTitle} · {matchingAdmin.fellowshipCode}
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#141414] mt-1">
                    {matchingAdmin.phone}
                  </div>
                </div>

                <a
                  href={`https://wa.me/${matchingAdmin.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(matchingAdmin.adminName)},%20I%20am%20${encodeURIComponent(submittedStudent.fullName)},%20a%20new%20student%20at%20${encodeURIComponent(submittedStudent.hallOrHostel)}.%20I%20just%20registered%20via%20SCC!`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-sm transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 text-xs text-[#61615b] leading-relaxed">
              <Clock className="w-4 h-4 text-[#f5e11d] shrink-0 mt-0.5" />
              <span>
                Your {submittedStudent.fellowshipCode} reps on campus have been notified -
                expect a welcome message on WhatsApp soon.
              </span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRegisterAnother}
              className="flex-1 py-3 text-xs sm:text-sm font-semibold text-[#141414] bg-[#f4f4ee] hover:bg-[#e6e6e0] rounded-xl border border-[#dbdbd4] transition-colors"
            >
              Register Another Student
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-3 text-xs sm:text-sm font-semibold text-white bg-[#141414] hover:bg-[#050505] rounded-xl transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-2" ref={topRef}>

      {/* Pre-selected fellowship notice */}
      {preselectedDenom && (
        <div className="mb-6 flex items-center gap-2.5 w-fit max-w-full bg-[#f8f8f2] border border-[#f6eb6e] rounded-full pl-1 pr-3.5 py-1">
          <FellowshipLogo denomination={preselectedDenom} size="sm" />
          <span className="text-[11px] text-[#141414] truncate">
            Registering under{' '}
            <strong className="font-bold text-[#141414]">{preselectedDenom.shortCode}</strong>{' '}
            - changeable in the final step
          </span>
        </div>
      )}

      {/* Main Registration Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(20,20,20,0.14)] ring-1 ring-inset ring-white/50 space-y-6"
      >
        
        {/* PHASE 1: Personal Information */}
        {currentPhase === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-start gap-3.5 border-b border-[#f0f0ea] pb-4">
              <div className="w-11 h-11 rounded-xl bg-[#f8f8f2] text-[#141414] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#141414]">
                  Personal &amp; contact information
                </h2>
                <p className="text-sm text-[#61615b] mt-1 leading-relaxed">
                  Please enter your legal name and phone number for campus orientation outreach.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#141414] flex items-center justify-between">
                  <span>Full Legal Name <span className="text-[#BA1A1A]">*</span></span>
                  <span className="text-[11px] text-[#61615b] font-normal">First, Middle, Surname</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kwabena Mensah Osei"
                  className={INPUT}
                  autoFocus
                />
                {errors.fullName && <p className="text-xs text-[#BA1A1A]">{errors.fullName}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#141414]">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f4f4ee] border border-[#e6e6e0] rounded-2xl">
                  {(['Male', 'Female'] as const).map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setGender(option)}
                      className={`h-11 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        gender === option
                          ? 'bg-white text-[#141414] border-[#dbdbd4] shadow-sanctuary-sm'
                          : 'bg-transparent text-[#61615b] border-transparent hover:text-[#141414]'
                      }`}
                    >
                      {gender === option && <Check className="w-3.5 h-3.5 text-[#141414]" />}
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#141414] flex items-center justify-between">
                  <span>Phone Number (WhatsApp) <span className="text-[#BA1A1A]">*</span></span>
                  <span className="text-[11px] font-normal text-[#141414]">For orientation messages</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative w-[118px] shrink-0">
                    <CountryFlag
                      iso={
                        COUNTRY_CODES.find((c) => c.code === phoneCountry)?.iso ?? 'GH'
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-3.5 rounded-[2px] ring-1 ring-black/10 pointer-events-none z-10"
                    />
                  <select
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value)}
                    aria-label="Country code"
                    className="shrink-0 w-[136px] h-13 px-3.5 pr-8 bg-[#fdfdfb] border border-[#e6e6e0]/80 rounded-2xl text-sm font-semibold text-[#141414] shadow-[inset_0_1px_2px_rgba(20,20,20,0.04),0_1px_3px_rgba(20,20,20,0.03)] focus:outline-none focus:bg-white focus:border-[#141414]/60 transition-all duration-200 cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                    </select>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="244 891 204"
                    className="w-full min-w-0 flex-1 h-13 px-5 bg-[#fdfdfb] border border-[#e6e6e0]/80 rounded-2xl text-sm text-[#141414] font-mono placeholder-[#9b9b93] shadow-[inset_0_1px_2px_rgba(20,20,20,0.04),0_1px_3px_rgba(20,20,20,0.03)] focus:outline-none focus:bg-white focus:border-[#141414]/60 focus:shadow-[inset_0_1px_2px_rgba(20,20,20,0.03),0_0_0_4px_rgba(20,20,20,0.08)] transition-all duration-200"
                  />
                </div>
                {errors.phone && <p className="text-xs text-[#BA1A1A]">{errors.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: Program of Study & Residence */}
        {currentPhase === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-start gap-3.5 border-b border-[#f0f0ea] pb-4">
              <div className="w-11 h-11 rounded-xl bg-[#f8f8f2] text-[#141414] flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#141414]">
                  Academic program &amp; hostel residence
                </h2>
                <p className="text-sm text-[#61615b] mt-1 leading-relaxed">
                  Help fellowship reps locate and welcome you in your hall of residence.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Academic Level */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#141414]">
                  Academic Level / Year
                </label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                  className={SELECT}
                >
                  <option value="Level 100 (Freshman)">Level 100 (Freshman / First Year)</option>
                  <option value="Level 200">Level 200</option>
                  <option value="Level 300">Level 300</option>
                  <option value="Level 400">Level 400</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              {/* Program of Study */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#141414]">
                    Program of Study <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomProgram(!isCustomProgram)}
                    className="text-[11px] text-[#141414] hover:underline font-semibold"
                  >
                    {isCustomProgram ? 'Select from list' : 'Program not in list? Type manually'}
                  </button>
                </div>

                {!isCustomProgram ? (
                  <select
                    value={programOfStudy}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_PROG') {
                        setIsCustomProgram(true);
                      } else {
                        setProgramOfStudy(e.target.value);
                      }
                    }}
                    className={SELECT}
                  >
                    {COMMON_PROGRAMS.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                    <option value="CUSTOM_PROG">+ Other (Type my program)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customProgram}
                    onChange={(e) => setCustomProgram(e.target.value)}
                    placeholder="Type your degree program (e.g. BSc Chemical Engineering)..."
                    className={INPUT}
                    autoFocus
                  />
                )}
                {errors.program && <p className="text-xs text-[#BA1A1A]">{errors.program}</p>}
              </div>

              {/* Hostel / Hall Residence - WITH DIRECT STRING TYPING IF NOT IN LIST */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-[#141414]">
                    Hostel or Hall of Residence <span className="text-[#BA1A1A]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomHostel(!isCustomHostel)}
                    className="text-[11px] text-[#141414] hover:underline font-semibold flex items-center gap-1 shrink-0"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isCustomHostel ? 'Choose from known list' : 'Hostel not in list? Type it here'}</span>
                  </button>
                </div>

                {!isCustomHostel ? (
                  <select
                    value={hallOrHostel}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM_HOSTEL') {
                        setIsCustomHostel(true);
                      } else {
                        setHallOrHostel(e.target.value);
                      }
                    }}
                    className={SELECT}
                  >
                    {COMMON_HALLS_AND_HOSTELS.map((hall) => (
                      <option key={hall} value={hall}>
                        {hall}
                      </option>
                    ))}
                    <option value="CUSTOM_HOSTEL">+ My hostel is not listed (Type manually)</option>
                  </select>
                ) : (
                  <div className="space-y-1 animate-fade-in">
                    <input
                      type="text"
                      value={customHostelText}
                      onChange={(e) => setCustomHostelText(e.target.value)}
                      placeholder="Type your exact hostel name (e.g. Grace Haven, Victory Lodge, Ayeduase)..."
                      className={INPUT}
                      autoFocus
                    />
                    <p className="text-[11px] text-[#61615b]">
                      You can type any private hostel, homestay, or off-campus residence.
                    </p>
                  </div>
                )}
                {errors.hostel && <p className="text-xs text-[#BA1A1A]">{errors.hostel}</p>}
              </div>

              {/* Room / Block Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#141414] flex items-center justify-between gap-2">
                  <span>Room or Block Number (Optional)</span>
                  <span className="text-[11px] text-[#61615b] font-normal">For fellowship room visitation</span>
                </label>
                <input
                  type="text"
                  value={roomOrBlock}
                  onChange={(e) => setRoomOrBlock(e.target.value)}
                  placeholder="e.g. Block C Rm 12, Flat 4, Room 2B..."
                  className={INPUT}
                />
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: Denomination & Fellowship Choice */}
        {currentPhase === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-start gap-3.5 border-b border-[#f0f0ea] pb-4">
              <div className="w-11 h-11 rounded-xl bg-[#f8f8f2] text-[#141414] flex items-center justify-center shrink-0">
                <Church className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#141414]">
                  Which denomination are you part of?
                </h2>
                <p className="text-sm text-[#61615b] mt-1 leading-relaxed">
                  Select your church tradition so we can rightfully route your data to your campus fellowship reps.
                </p>
              </div>
            </div>

            {/* Denomination Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {denominations.map((denom) => {
                const isSelected = selectedDenominationId === denom.id;
                return (
                  <button
                    type="button"
                    key={denom.id}
                    onClick={() => setSelectedDenominationId(denom.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#f8f8f2] border-[#141414] shadow-sanctuary-sm ring-1 ring-[#141414]'
                        : 'bg-[#FFFFFF] border-[#dbdbd4] hover:bg-[#fbfbf9]'
                    }`}
                  >
                    <FellowshipLogo denomination={denom} size="md" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-[#141414] truncate">
                          {denom.name}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0">
                            <span className="text-[10px] leading-none">✓</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#61615b] mt-0.5 line-clamp-1">
                        {denom.campusFellowship}
                      </p>
                      <span
                        className="inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mt-1"
                        style={{ backgroundColor: `${denom.color}15`, color: denom.color }}
                      >
                        {denom.shortCode}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Final Confirmation Review Box */}
            <div className="p-4 sm:p-5 bg-[#fbfbf9] border border-[#e6e6e0] rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#141414]" />
                <span className="font-bold text-[11px] uppercase tracking-wider text-[#141414]">
                  Registration Summary
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'Name', value: fullName },
                  { label: 'Phone', value: fullPhone, mono: true },
                  { label: 'Program', value: isCustomProgram ? customProgram : programOfStudy },
                  { label: 'Hostel', value: isCustomHostel ? customHostelText : hallOrHostel }
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-3 bg-white border border-[#e6e6e0] rounded-lg px-3 py-2"
                  >
                    <span className="text-[11px] text-[#61615b] shrink-0">{row.label}</span>
                    <span
                      className={`text-xs font-semibold text-[#141414] truncate text-right ${
                        row.mono ? 'font-mono' : ''
                      }`}
                    >
                      {row.value || '-'}
                    </span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-3 bg-[#f8f8f2] border border-[#f6eb6e] rounded-lg px-3 py-2 sm:col-span-2">
                  <span className="text-[11px] text-[#141414] shrink-0">Routing to</span>
                  <span className="text-xs font-bold text-[#141414] truncate text-right">
                    {denominations.find((d) => d.id === selectedDenominationId)?.name || '-'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#61615b] leading-relaxed border-t border-[#e6e6e0] pt-2.5">
                Your details are shared only with the selected fellowship's campus leadership team.
              </p>
            </div>
          </div>
        )}

        {/* Phase Navigation Controls */}
        <div className="pt-5 border-t border-[#f0f0ea] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#61615b] hover:text-[#141414] bg-[#f4f4ee] hover:bg-[#e6e6e0] rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentPhase === 1 ? 'Cancel' : 'Previous'}</span>
          </button>

          {currentPhase < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#141414] hover:bg-[#2e2e2e] rounded-xl shadow-sanctuary-sm transition-all cursor-pointer group"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 text-[#f5e11d] group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#141414] hover:bg-[#2e2e2e] rounded-xl shadow-sanctuary-sm transition-all cursor-pointer group"
            >
              <ShieldCheck className="w-4 h-4 text-[#f5e11d]" />
              <span>Submit &amp; Route to Fellowship</span>
            </button>
          )}
        </div>
      </form>

      {/* Phase Dots beneath the card */}
      <div className="flex items-center justify-center gap-2 mt-4" aria-hidden="true">
        {PHASES.map((phase) => (
          <span
            key={phase.num}
            className={`w-2 h-2 rounded-full transition-colors ${
              phase.num === currentPhase
                ? 'bg-[#141414] w-5'
                : phase.num < currentPhase
                ? 'bg-[#141414]'
                : 'bg-[#dbdbd4]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
