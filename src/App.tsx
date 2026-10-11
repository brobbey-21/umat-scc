/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Home } from 'lucide-react';
import formBg from './assets/images/IMG_1963.jpg';
import { StudentRegistration, DenominationAdmin, Denomination, OutreachStatus } from './types';
import {
  fetchStudentCount, fetchStudents, createStudent, updateStudentStatus,
  fetchAdmins, createAdmin, deleteAdmin,
  fetchDenominations, createDenomination, updateDenomination, deleteDenomination,
  fetchHostels, createHostel, deleteHostel,
  fetchCourses, createCourse, deleteCourse,
  login, logout, isAuthenticated,
  Hostel, Course
} from './api/client';
import { Sidebar, MainNavTab, AdminView } from './components/Sidebar';
import { LandingHero } from './components/LandingHero';
import { StudentRegistrationForm } from './components/StudentRegistrationForm';
import { AdminPortal } from './components/AdminPortal';
import { AdminLogin } from './components/AdminLogin';
import { Dashboard } from './components/Dashboard';
import { DenominationManagement } from './components/DenominationManagement';
import { ReferenceDataManager } from './components/ReferenceDataManager';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainNavTab>(() => {
    const saved = sessionStorage.getItem('scc-tab');
    return (saved === 'register' || saved === 'admin' || saved === 'landing') ? saved : 'landing';
  });
  const [adminView, setAdminView] = useState<AdminView>(() => {
    const saved = sessionStorage.getItem('scc-admin-view');
    return (saved === 'dashboard' || saved === 'students' || saved === 'admins' || saved === 'denominations' || saved === 'reference') ? saved : 'dashboard';
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthenticated());
  const [students, setStudents] = useState<StudentRegistration[]>([]);
  const [admins, setAdmins] = useState<DenominationAdmin[]>([]);
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [registrationDenomId, setRegistrationDenomId] = useState<string | null>(null);

  const handleSelectFellowship = useCallback((denominationId: string) => {
    setRegistrationDenomId(denominationId);
    setCurrentTab('register');
  }, []);

  // Persist active page across refreshes
  useEffect(() => {
    sessionStorage.setItem('scc-tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    sessionStorage.setItem('scc-admin-view', adminView);
  }, [adminView]);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [count, denoms, hostelList, courseList] = await Promise.all([
          fetchStudentCount(),
          fetchDenominations(),
          fetchHostels(),
          fetchCourses()
        ]);
        if (!cancelled) {
          setStudentCount(count);
          setDenominations(denoms);
          setHostels(hostelList);
          setCourses(courseList);
        }
      } catch (e) {
        console.error('Failed to fetch initial data:', e);
      }

      if (isAuthenticated()) {
        try {
          const [studentsData, adminsData] = await Promise.all([
            fetchStudents(),
            fetchAdmins()
          ]);
          if (!cancelled) {
            setStudents(studentsData);
            setAdmins(adminsData);
          }
        } catch {
          logout();
          if (!cancelled) setIsAdmin(false);
        }
      }

      if (!cancelled) setIsLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = useCallback(async (password: string) => {
    await login(password);
    setIsAdmin(true);
    setAdminView('dashboard');
    const [studentsData, adminsData] = await Promise.all([fetchStudents(), fetchAdmins()]);
    setStudents(studentsData);
    setAdmins(adminsData);
    setStudentCount(studentsData.length);
    showToast('Welcome back, SCC Administrator!');
  }, [showToast]);

  const handleLogout = useCallback(() => {
    logout();
    setIsAdmin(false);
    setStudents([]);
    setAdmins([]);
    setCurrentTab('landing');
    showToast('Logged out successfully.');
  }, [showToast]);

  // ── Students ──────────────────────────────────────────────────────────────

  const handleRegisterSuccess = useCallback(async (newStudent: StudentRegistration) => {
    try {
      const saved = await createStudent(newStudent);
      setStudents((prev) => [saved, ...prev]);
      setStudentCount((prev) => prev + 1);
      showToast(`New student ${saved.fullName} registered under ${saved.fellowshipCode}!`);
    } catch (e) {
      console.error('Registration failed:', e);
      showToast('Registration failed. Please try again.');
    }
  }, [showToast]);

  const handleUpdateStudentStatus = useCallback(async (studentId: string, status: OutreachStatus, note?: string) => {
    try {
      const updated = await updateStudentStatus(studentId, status, note);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? updated : s)));
      showToast(`Outreach status updated to "${status}"`);
    } catch (e) {
      console.error('Status update failed:', e);
      showToast('Failed to update status.');
    }
  }, [showToast]);

  // ── Admins ────────────────────────────────────────────────────────────────

  const handleAddAdmin = useCallback(async (newAdmin: DenominationAdmin) => {
    try {
      const saved = await createAdmin(newAdmin);
      setAdmins((prev) => [saved, ...prev]);
      showToast(`Added ${saved.adminName} as admin for ${saved.fellowshipCode}`);
    } catch (e) {
      console.error('Add admin failed:', e);
      showToast('Failed to add admin.');
    }
  }, [showToast]);

  const handleDeleteAdmin = useCallback(async (adminId: string) => {
    try {
      await deleteAdmin(adminId);
      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
      showToast('Admin representative removed.');
    } catch (e) {
      console.error('Delete admin failed:', e);
      showToast('Failed to delete admin.');
    }
  }, [showToast]);

  // ── Denominations ─────────────────────────────────────────────────────────

  const handleCreateDenomination = useCallback(async (denom: Partial<Denomination>) => {
    try {
      const saved = await createDenomination(denom);
      setDenominations((prev) => [...prev, saved]);
      showToast(`Created ${saved.shortCode} fellowship.`);
    } catch (e: any) {
      showToast(e.message || 'Failed to create denomination.');
    }
  }, [showToast]);

  const handleUpdateDenomination = useCallback(async (denomId: string, updates: Partial<Denomination>) => {
    try {
      const updated = await updateDenomination(denomId, updates);
      setDenominations((prev) => prev.map((d) => (d.id === denomId ? updated : d)));
      showToast(`Updated ${updated.shortCode} fellowship.`);
    } catch (e: any) {
      showToast(e.message || 'Failed to update denomination.');
    }
  }, [showToast]);

  const handleDeleteDenomination = useCallback(async (denomId: string) => {
    try {
      await deleteDenomination(denomId);
      setDenominations((prev) => prev.filter((d) => d.id !== denomId));
      showToast('Fellowship removed.');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete denomination.');
    }
  }, [showToast]);

  // ── Hostels ───────────────────────────────────────────────────────────────

  const handleAddHostel = useCallback(async (name: string) => {
    try {
      const saved = await createHostel(name);
      setHostels((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`Added hostel "${name}"`);
    } catch (e: any) {
      showToast(e.message || 'Failed to add hostel.');
    }
  }, [showToast]);

  const handleDeleteHostel = useCallback(async (id: number) => {
    try {
      await deleteHostel(id);
      setHostels((prev) => prev.filter((h) => h.id !== id));
      showToast('Hostel removed.');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete hostel.');
    }
  }, [showToast]);

  // ── Courses ───────────────────────────────────────────────────────────────

  const handleAddCourse = useCallback(async (name: string) => {
    try {
      const saved = await createCourse(name);
      setCourses((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`Added course "${name}"`);
    } catch (e: any) {
      showToast(e.message || 'Failed to add course.');
    }
  }, [showToast]);

  const handleDeleteCourse = useCallback(async (id: number) => {
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      showToast('Course removed.');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete course.');
    }
  }, [showToast]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const studentCountsByDenom = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.denominationId] = (counts[s.denominationId] || 0) + 1;
    });
    return counts;
  }, [students]);

  // ── Render admin content ──────────────────────────────────────────────────

  const renderAdminContent = () => {
    if (isLoading) {
      return (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#61615b]">Loading registry data...</p>
        </div>
      );
    }

    switch (adminView) {
      case 'dashboard':
        return (
          <Dashboard
            students={students}
            admins={admins}
            denominations={denominations}
            onNavigate={(v) => setAdminView(v)}
          />
        );
      case 'students':
        return (
          <AdminPortal
            students={students}
            admins={admins}
            denominations={denominations}
            onUpdateStudentStatus={handleUpdateStudentStatus}
            onAddAdmin={handleAddAdmin}
            onDeleteAdmin={handleDeleteAdmin}
          />
        );
      case 'admins':
        return (
          <AdminPortal
            students={students}
            admins={admins}
            denominations={denominations}
            onUpdateStudentStatus={handleUpdateStudentStatus}
            onAddAdmin={handleAddAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            initialTab="admins"
          />
        );
      case 'denominations':
        return (
          <DenominationManagement
            denominations={denominations}
            studentCounts={studentCountsByDenom}
            onCreate={handleCreateDenomination}
            onUpdate={handleUpdateDenomination}
            onDelete={handleDeleteDenomination}
          />
        );
      case 'reference':
        return (
          <ReferenceDataManager
            hostels={hostels}
            courses={courses}
            onAddHostel={handleAddHostel}
            onDeleteHostel={handleDeleteHostel}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        );
      default:
        return null;
    }
  };

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#141414] font-sans selection:bg-[#f6eb6e] selection:text-[#141414]">
      
      {/* Admin portal layout: sidebar + content */}
      {currentTab === 'admin' && isAdmin ? (
        <div className="flex min-h-screen">
          <Sidebar
            currentTab={currentTab}
            adminView={adminView}
            onChangeTab={setCurrentTab}
            onChangeAdminView={setAdminView}
            totalStudentsCount={studentCount}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />
          <div className="flex-1 flex flex-col min-w-0">
            {notification && (
              <div className="fixed top-4 right-4 z-50 bg-[#141414] text-white px-4 py-2.5 rounded-xl shadow-sanctuary-md text-xs font-semibold flex items-center gap-2 animate-fade-in border border-[#f5e11d]">
                <span>{notification}</span>
              </div>
            )}
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {renderAdminContent()}
            </main>
          </div>
        </div>
      ) : (
        /* Public layout: standalone content */
        <div className="flex flex-col min-h-screen">
          {notification && (
            <div className="fixed top-20 right-4 z-50 bg-[#141414] text-white px-4 py-2.5 rounded-xl shadow-sanctuary-md text-xs font-semibold flex items-center gap-2 animate-fade-in border border-[#f5e11d]">
              <span>{notification}</span>
            </div>
          )}

          {/* Home shortcut - top-left corner of public screens (landing has its own nav) */}
          {currentTab !== 'landing' && (
            <button
              onClick={() => setCurrentTab('landing')}
              aria-label="Home"
              className="fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#e6e6e0] shadow-sanctuary-sm text-[#141414] hover:bg-[#f8f8f2] hover:text-[#050505] transition-colors flex items-center justify-center cursor-pointer"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          <main className={`flex-1 ${currentTab === 'landing' || (currentTab === 'admin' && !isAdmin) ? '' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}`}>
            {currentTab === 'register' && (
              <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <img
                  src={formBg}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
              </div>
            )}
            {currentTab === 'landing' && (
              <LandingHero
                onStartRegistration={() => setCurrentTab('register')}
                onOpenAdmin={() => setCurrentTab('admin')}
                onSelectFellowship={handleSelectFellowship}
                denominations={denominations}
              />
            )}

            {currentTab === 'register' && (
              <div className="relative z-10">
                <StudentRegistrationForm
                  onSuccess={handleRegisterSuccess}
                  onCancel={() => setCurrentTab('landing')}
                  denominationAdmins={admins}
                  denominations={denominations}
                  initialDenominationId={registrationDenomId ?? undefined}
                />
              </div>
            )}

            {currentTab === 'admin' && !isAdmin && (
              <AdminLogin onLogin={handleLogin} />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
