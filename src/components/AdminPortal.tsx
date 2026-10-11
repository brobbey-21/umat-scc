import React, { useState, useMemo } from 'react';
import {
  StudentRegistration,
  DenominationAdmin,
  Denomination,
  OutreachStatus
} from '../types';
import { COMMON_HALLS_AND_HOSTELS } from '../data/mockData';
import { FellowshipLogo } from './FellowshipLogo';
import { CountryFlag } from './CountryFlag';
import { COUNTRY_CODES } from '../constants/countries';
import {
  Shield,
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Home,
  UserCheck,
  Building,
  GraduationCap,
  X,
  Mail,
  Edit,
  Trash2,
  ChevronDown,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Palette,
  Image as ImageIcon
} from 'lucide-react';

interface AdminPortalProps {
  students: StudentRegistration[];
  admins: DenominationAdmin[];
  denominations: Denomination[];
  onUpdateStudentStatus: (studentId: string, status: OutreachStatus, note?: string) => void;
  onAddAdmin: (newAdmin: DenominationAdmin) => void;
  onDeleteAdmin: (adminId: string) => void;
  onUpdateDenomination?: (denomId: string, updates: Partial<Denomination>) => void;
  initialTab?: 'students' | 'admins';
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  students,
  admins,
  denominations,
  onUpdateStudentStatus,
  onAddAdmin,
  onDeleteAdmin,
  onUpdateDenomination,
  initialTab = 'students'
}) => {
  // Portal Scope: 'central' or a denominationId
  const [selectedScope, setSelectedScope] = useState<string>('central');
  const activeTab = initialTab;

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHall, setFilterHall] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Add Admin Modal State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminDenominationId, setNewAdminDenominationId] = useState(denominations[0]?.id || '');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Campus President');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPhoneCountry, setNewAdminPhoneCountry] = useState('+233');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminHalls, setNewAdminHalls] = useState('All Halls & Hostels');

  // Add Outreach Note Modal
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<StudentRegistration | null>(null);
  const [newOutreachNote, setNewOutreachNote] = useState('');
  const [newOutreachStatus, setNewOutreachStatus] = useState<OutreachStatus>('Contacted & Welcomed');

  const currentDenom = denominations.find((d) => d.id === selectedScope);
  const isCentralView = selectedScope === 'central';

  // Filter students based on scope, search, and dropdowns
  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      // Scope filter
      if (!isCentralView && s.denominationId !== selectedScope) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.fullName.toLowerCase().includes(q);
        const matchesPhone = s.phone.toLowerCase().includes(q);
        const matchesProgram = s.programOfStudy.toLowerCase().includes(q);
        const matchesHall = s.hallOrHostel.toLowerCase().includes(q);
        const matchesDenom = s.denominationName.toLowerCase().includes(q) || s.fellowshipCode.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesProgram && !matchesHall && !matchesDenom) {
          return false;
        }
      }

      // Hall filter
      if (filterHall !== 'ALL' && s.hallOrHostel !== filterHall) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'ALL' && s.outreachStatus !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [students, selectedScope, isCentralView, searchQuery, filterHall, filterStatus]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const filename = isCentralView
      ? `SCC_All_Registered_Students_${new Date().toISOString().slice(0, 10)}.csv`
      : `${currentDenom?.shortCode || 'Denomination'}_Students_${new Date().toISOString().slice(0, 10)}.csv`;

    const headers = [
      'Full Name',
      'Gender',
      'Phone',
      'Program of Study',
      'Academic Level',
      'Hall or Hostel',
      'Room or Block',
      'Denomination',
      'Fellowship Code',
      'Home Parish',
      'Outreach Status',
      'Registered Date'
    ];

    const rows = visibleStudents.map((s) => [
      `"${s.fullName}"`,
      s.gender || '-',
      `"${s.phone}"`,
      `"${s.programOfStudy}"`,
      s.academicLevel,
      `"${s.hallOrHostel}"`,
      `"${s.roomOrBlock || '-'}"`,
      `"${s.denominationName}"`,
      s.fellowshipCode,
      `"${s.homeParishOrCity || '-'}"`,
      s.outreachStatus,
      new Date(s.registeredAt).toLocaleDateString()
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminPhone.trim()) return;

    const targetDenom = denominations.find((d) => d.id === newAdminDenominationId) || denominations[0];

    const newAdminObj: DenominationAdmin = {
      id: `admin-${targetDenom.id}-${Date.now()}`,
      denominationId: targetDenom.id,
      denominationName: targetDenom.name,
      fellowshipCode: targetDenom.shortCode,
      adminName: newAdminName.trim(),
      roleTitle: newAdminRole.trim(),
      phone: newAdminPhone.trim().startsWith('+')
        ? newAdminPhone.trim()
        : `${newAdminPhoneCountry} ${newAdminPhone.trim()}`.trim(),
      email: newAdminEmail.trim() || `${targetDenom.id}.admin@campus.org`,
      assignedHalls: newAdminHalls.trim(),
      dateAdded: new Date().toISOString().slice(0, 10)
    };

    onAddAdmin(newAdminObj);
    setNewAdminName('');
    setNewAdminPhone('');
    setNewAdminEmail('');
    setIsAddAdminOpen(false);
  };

  const handleSaveOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForNote) return;

    onUpdateStudentStatus(
      selectedStudentForNote.id,
      newOutreachStatus,
      newOutreachNote.trim() || undefined
    );
    setSelectedStudentForNote(null);
    setNewOutreachNote('');
  };

  // Distinct halls present in registered students
  const activeHalls = useMemo(() => {
    const set = new Set(students.map((s) => s.hallOrHostel));
    return Array.from(set).sort();
  }, [students]);

  // Denominations with admin status
  const denominationStats = useMemo(() => {
    return denominations.map((d) => {
      const count = students.filter((s) => s.denominationId === d.id).length;
      const denomAdmins = admins.filter((a) => a.denominationId === d.id);
      return {
        ...d,
        studentCount: count,
        admins: denomAdmins
      };
    });
  }, [students, admins]);

  return (
    <div className="space-y-6">
      
      {/* Main Content Area */}
      <div className="bg-[#FFFFFF] border border-[#e6e6e0] rounded-2xl shadow-sanctuary-sm overflow-hidden">
        
        {/* SUB-VIEW: STUDENTS LEDGER */}
        {(activeTab === 'students' || !isCentralView) && (
          <div>
            {/* Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-[#e6e6e0] space-y-3">
              
              {/* Search + Export Row */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#61615b]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student by name, phone, program, hall..."
                    className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-[#FFFFFF] border border-[#dbdbd4] rounded-xl text-[#141414] placeholder-[#9b9b93] focus:outline-none focus:border-[#141414]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#61615b]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleExportCSV}
                  className="h-11 px-3.5 text-xs font-semibold text-[#141414] bg-[#f4f4ee] hover:bg-[#e6e6e0] border border-[#dbdbd4] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Filter Selectors Row */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#61615b]" />
                  <select
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value)}
                    className="h-9 pl-2 pr-3 bg-[#FFFFFF] border border-[#dbdbd4] rounded-lg text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#141414]"
                  >
                    <option value="central">All Fellowships ({students.length})</option>
                    {denominationStats.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.shortCode} - {d.name} ({d.studentCount})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#61615b]" />
                  <select
                    value={filterHall}
                    onChange={(e) => setFilterHall(e.target.value)}
                    className="h-9 pl-2 pr-3 bg-[#FFFFFF] border border-[#dbdbd4] rounded-lg text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#141414]"
                  >
                    <option value="ALL">All Halls & Hostels</option>
                    {activeHalls.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#61615b]" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-9 pl-2 pr-3 bg-[#FFFFFF] border border-[#dbdbd4] rounded-lg text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#141414]"
                  >
                    <option value="ALL">All Outreach Statuses</option>
                    <option value="New / Pending">New / Pending</option>
                    <option value="Contacted & Welcomed">Contacted & Welcomed</option>
                    <option value="Hostel Visited">Hostel Visited</option>
                    <option value="Added to Fellowship Group">Added to Fellowship Group</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students Table */}
            {visibleStudents.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 text-[#9b9b93] mx-auto" />
                <h3 className="font-heading text-lg text-[#141414]">No student records found</h3>
                <p className="text-xs text-[#61615b] max-w-sm mx-auto">
                  No registered students match your current search criteria or filter scope.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fbfbf9] border-b border-[#e6e6e0] text-[11px] uppercase tracking-wider text-[#61615b] font-semibold">
                      <th className="py-3 px-4">Student & Contact</th>
                      <th className="py-3 px-4">Program & Level</th>
                      <th className="py-3 px-4">Hall / Hostel</th>
                      {isCentralView && <th className="py-3 px-4">Denomination</th>}
                      <th className="py-3 px-4">Outreach Status</th>
                      <th className="py-3 pr-4 pl-3 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0ea] text-xs">
                    {visibleStudents.map((student) => {
                      const cleanPhone = student.phone.replace(/[^0-9]/g, '');

                      return (
                        <tr key={student.id} className="hover:bg-[#fbfbf9] transition-colors">
                          {/* Student & Contact */}
                          <td className="py-3.5 px-4">
                            <div className="font-heading font-semibold text-sm text-[#141414]">
                              {student.fullName}
                            </div>
                            <div className="font-mono text-[11px] text-[#141414] mt-0.5 font-semibold">
                              {student.phone}
                            </div>
                            {student.homeParishOrCity && (
                              <div className="text-[10px] text-[#9b9b93] truncate max-w-[180px]">
                                From: {student.homeParishOrCity}
                              </div>
                            )}
                          </td>

                          {/* Program & Level */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#141414]">{student.programOfStudy}</div>
                            <div className="text-[11px] text-[#61615b]">{student.academicLevel}</div>
                          </td>

                          {/* Hall / Hostel */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#141414]">{student.hallOrHostel}</div>
                            <div className="text-[11px] text-[#9b9b93]">
                              {student.roomOrBlock ? `Room: ${student.roomOrBlock}` : 'No room specified'}
                            </div>
                          </td>

                          {/* Denomination (Central view only) */}
                          {isCentralView && (
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const sDenom = denominations.find((d) => d.id === student.denominationId);
                                  return sDenom ? <FellowshipLogo denomination={sDenom} size="sm" /> : null;
                                })()}
                                <div>
                                  <span className="font-bold text-[11px] text-[#141414]">
                                    {student.fellowshipCode}
                                  </span>
                                  <div className="text-[10px] text-[#61615b] truncate max-w-[130px]">
                                    {student.denominationName}
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Outreach Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                                student.outreachStatus === 'Added to Fellowship Group'
                                  ? 'bg-[#f8f8f2] text-[#141414] border-[#f6eb6e]'
                                  : student.outreachStatus === 'Hostel Visited'
                                  ? 'bg-[#fffbe0] text-[#7e6f00] border-[#f0e35e]'
                                  : student.outreachStatus === 'Contacted & Welcomed'
                                  ? 'bg-[#f0f0ea] text-[#141414] border-[#dbdbd4]'
                                  : 'bg-[#fbfbf9] text-[#61615b] border-[#e6e6e0]'
                              }`}
                            >
                              {student.outreachStatus}
                            </span>
                            {student.outreachNotes && student.outreachNotes.length > 0 && (
                              <div className="text-[10px] text-[#61615b] mt-1 italic truncate max-w-[160px]" title={student.outreachNotes[0]}>
                                "{student.outreachNotes[0]}"
                              </div>
                            )}
                          </td>

                          {/* Actions: Direct WhatsApp & Update Status */}
                          <td className="py-3.5 pr-4 pl-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Direct WhatsApp link */}
                              <a
                                href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(student.fullName)},%20welcome%20to%20campus!%20This%20is%20from%20${encodeURIComponent(student.fellowshipCode)}%20fellowship%20under%20the%20Student%20Christian%20Council.`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="p-2 text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>

                              {/* Direct Phone Call */}
                              <a
                                href={`tel:${student.phone}`}
                                title="Call Student"
                                className="p-2 text-[#141414] hover:bg-[#f4f4ee] rounded-lg transition-colors"
                              >
                                <Phone className="w-4 h-4" />
                              </a>

                              {/* Update Status Button */}
                              <button
                                onClick={() => {
                                  setSelectedStudentForNote(student);
                                  setNewOutreachStatus(student.outreachStatus);
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#141414] bg-[#f8f8f2] hover:bg-[#f6eb6e]/60 rounded-lg border border-[#f6eb6e] transition-colors"
                              >
                                Update Status
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUB-VIEW 2: MANAGE DENOMINATION ADMINS */}
        {activeTab === 'admins' && isCentralView && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-semibold text-[#141414]">
                  Denominational Representatives & Fellowship Admins
                </h3>
                <p className="text-xs text-[#61615b]">
                  Each denomination rep has designated access to view and minister to their students.
                </p>
              </div>

              <button
                onClick={() => setIsAddAdminOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#141414] hover:bg-[#050505] rounded-xl shadow-sanctuary-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#f5e11d]" />
                <span>Add Denomination Admin</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins.map((admin) => {
                const adminDenom = denominations.find((d) => d.id === admin.denominationId);
                return (
                <div
                  key={admin.id}
                  className="bg-[#FFFFFF] border border-[#e6e6e0] rounded-xl p-5 shadow-sanctuary-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {adminDenom ? (
                        <FellowshipLogo denomination={adminDenom} size="sm" />
                      ) : (
                        <span className="font-bold text-xs bg-[#141414] text-white px-2 py-0.5 rounded">
                          {admin.fellowshipCode}
                        </span>
                      )}
                      <button
                        onClick={() => onDeleteAdmin(admin.id)}
                        title="Remove Admin"
                        className="text-[#9b9b93] hover:text-[#BA1A1A] p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-heading font-semibold text-base text-[#141414]">
                        {admin.adminName}
                      </h4>
                      <div className="text-xs text-[#141414] font-semibold">
                        {admin.roleTitle}
                      </div>
                      <div className="text-[11px] text-[#61615b]">
                        {admin.fellowshipCode} - {admin.denominationName}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#f0f0ea] text-xs text-[#61615b] space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#9b9b93]" />
                        <span className="font-mono text-[#141414]">{admin.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#9b9b93]" />
                        <span className="truncate">{admin.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-[#9b9b93]" />
                        <span className="truncate">{admin.assignedHalls}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f0f0ea]">
                    <button
                      onClick={() => setSelectedScope(admin.denominationId)}
                      className="w-full py-1.5 text-xs font-semibold text-[#141414] bg-[#f8f8f2] hover:bg-[#f6eb6e]/60 rounded-lg border border-[#f6eb6e] transition-colors"
                    >
                      Open {admin.fellowshipCode} Portal View
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD DENOMINATION ADMIN */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 bg-[#141414]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#e6e6e0] rounded-2xl max-w-md w-full p-6 shadow-sanctuary-lg space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#f0f0ea] pb-3">
              <h3 className="font-heading text-xl font-semibold text-[#141414]">
                Add Denomination Admin
              </h3>
              <button
                onClick={() => setIsAddAdminOpen(false)}
                className="text-[#61615b] hover:text-[#141414]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              {/* Select Denomination */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414]">
                  Denomination / Fellowship <span className="text-[#BA1A1A]">*</span>
                </label>
                <select
                  value={newAdminDenominationId}
                  onChange={(e) => setNewAdminDenominationId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs"
                >
                  {denominations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.shortCode} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414]">
                  Admin Full Name <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Elder Kwabena Osei-Mensah"
                  className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs"
                  required
                />
              </div>

              {/* Role Title */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414]">
                  Role / Title <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  type="text"
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  placeholder="e.g. Campus President, Freshers Coordinator"
                  className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414]">
                  Phone (WhatsApp) <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative w-[112px] shrink-0">
                    <CountryFlag
                      iso={
                        COUNTRY_CODES.find((c) => c.code === newAdminPhoneCountry)
                          ?.iso ?? 'GH'
                      }
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-3.5 rounded-[2px] ring-1 ring-black/10 pointer-events-none z-10"
                    />
                  <select
                    value={newAdminPhoneCountry}
                    onChange={(e) => setNewAdminPhoneCountry(e.target.value)}
                    aria-label="Country code"
                    className="w-[124px] shrink-0 h-11 px-2.5 pr-7 bg-white border border-[#dbdbd4] rounded-xl text-xs font-semibold text-[#141414]"
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
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    placeholder="24 000 0000"
                    className="flex-1 h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414]">Email Address</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@campus-fellowship.org"
                  className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs"
                />
              </div>

              {/* Assigned Halls */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#141414]">Assigned Halls / Quads</label>
                <input
                  type="text"
                  value={newAdminHalls}
                  onChange={(e) => setNewAdminHalls(e.target.value)}
                  placeholder="e.g. Katanga, Conti, All Hostels"
                  className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="px-4 py-2 font-semibold text-[#61615b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#141414] hover:bg-[#050505] rounded-xl"
                >
                  Save Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE OUTREACH STATUS & NOTE */}
      {selectedStudentForNote && (
        <div className="fixed inset-0 z-50 bg-[#141414]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#e6e6e0] rounded-2xl max-w-md w-full p-6 shadow-sanctuary-lg space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#f0f0ea] pb-3">
              <div>
                <h3 className="font-heading text-lg font-semibold text-[#141414]">
                  Update Student Outreach
                </h3>
                <p className="text-xs text-[#61615b]">{selectedStudentForNote.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedStudentForNote(null)}
                className="text-[#61615b] hover:text-[#141414]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOutreach} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#141414]">Outreach Status</label>
                <select
                  value={newOutreachStatus}
                  onChange={(e) => setNewOutreachStatus(e.target.value as OutreachStatus)}
                  className="w-full h-11 px-3 bg-white border border-[#dbdbd4] rounded-xl text-xs"
                >
                  <option value="New / Pending">New / Pending Contact</option>
                  <option value="Contacted & Welcomed">Contacted & Welcomed via Call/WhatsApp</option>
                  <option value="Hostel Visited">Hostel Visited in person</option>
                  <option value="Added to Fellowship Group">Added to Fellowship WhatsApp Group</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#141414]">Add Fellowship Care Note</label>
                <textarea
                  rows={3}
                  value={newOutreachNote}
                  onChange={(e) => setNewOutreachNote(e.target.value)}
                  placeholder="e.g. Visited Room 24 at Katanga, invited to Friday welcome service..."
                  className="w-full p-3 bg-white border border-[#dbdbd4] rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForNote(null)}
                  className="px-4 py-2 font-semibold text-[#61615b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#141414] hover:bg-[#050505] rounded-xl"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
