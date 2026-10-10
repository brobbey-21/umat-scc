import React, { useState } from 'react';
import { Hostel, Course } from '../api/client';
import {
  Plus, Trash2, X, Building2, GraduationCap, Search
} from 'lucide-react';

interface ReferenceDataManagerProps {
  hostels: Hostel[];
  courses: Course[];
  onAddHostel: (name: string) => Promise<void>;
  onDeleteHostel: (id: number) => Promise<void>;
  onAddCourse: (name: string) => Promise<void>;
  onDeleteCourse: (id: number) => Promise<void>;
}

export const ReferenceDataManager: React.FC<ReferenceDataManagerProps> = ({
  hostels,
  courses,
  onAddHostel,
  onDeleteHostel,
  onAddCourse,
  onDeleteCourse
}) => {
  const [activeTab, setActiveTab] = useState<'hostels' | 'courses'>('hostels');
  const [newHostelName, setNewHostelName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [searchHostels, setSearchHostels] = useState('');
  const [searchCourses, setSearchCourses] = useState('');
  const [deleteHostelConfirm, setDeleteHostelConfirm] = useState<number | null>(null);
  const [deleteCourseConfirm, setDeleteCourseConfirm] = useState<number | null>(null);

  const filteredHostels = hostels.filter((h) =>
    !searchHostels.trim() || h.name.toLowerCase().includes(searchHostels.toLowerCase())
  );

  const filteredCourses = courses.filter((c) =>
    !searchCourses.trim() || c.name.toLowerCase().includes(searchCourses.toLowerCase())
  );

  const handleAddHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostelName.trim()) return;
    await onAddHostel(newHostelName.trim());
    setNewHostelName('');
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    await onAddCourse(newCourseName.trim());
    setNewCourseName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-3xl font-bold text-[#18221D]">Hostels & Courses</h2>
        <p className="text-sm text-[#5C6861]">
          Manage the reference data used in the student registration form.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E2E5DC]">
        <button
          onClick={() => setActiveTab('hostels')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'hostels'
              ? 'border-[#1B3B2B] text-[#1B3B2B]'
              : 'border-transparent text-[#5C6861] hover:text-[#18221D]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hostels & Halls ({hostels.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'courses'
              ? 'border-[#1B3B2B] text-[#1B3B2B]'
              : 'border-transparent text-[#5C6861] hover:text-[#18221D]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Courses & Programs ({courses.length})</span>
        </button>
      </div>

      {/* Hostels Panel */}
      {activeTab === 'hostels' && (
        <div className="space-y-4">
          {/* Add Form */}
          <form onSubmit={handleAddHostel} className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={newHostelName}
              onChange={(e) => setNewHostelName(e.target.value)}
              placeholder="e.g. Unity Hall (Continental / Conti)"
              className="flex-1 h-11 px-4 text-xs bg-white border border-[#D2DDD6] rounded-xl focus:outline-none focus:border-[#2E7D56]"
            />
            <button
              type="submit"
              disabled={!newHostelName.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142C20] rounded-xl flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-[#C59B4B]" />
              <span>Add</span>
            </button>
          </form>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C6861]" />
            <input
              type="text"
              value={searchHostels}
              onChange={(e) => setSearchHostels(e.target.value)}
              placeholder="Search hostels..."
              className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-[#D2DDD6] rounded-xl focus:outline-none focus:border-[#2E7D56]"
            />
          </div>

          {/* List */}
          <div className="bg-white border border-[#E2E5DC] rounded-xl divide-y divide-[#EEF2EF] max-h-[500px] overflow-y-auto">
            {filteredHostels.map((hostel) => (
              <div key={hostel.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F9F9F6]">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#8C9790]" />
                  <span className="text-xs font-semibold text-[#18221D]">{hostel.name}</span>
                </div>
                {deleteHostelConfirm === hostel.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => { await onDeleteHostel(hostel.id); setDeleteHostelConfirm(null); }}
                      className="px-3 py-1 text-[11px] font-semibold text-white bg-[#BA1A1A] rounded-lg"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteHostelConfirm(null)}
                      className="px-3 py-1 text-[11px] font-semibold text-[#5C6861] bg-[#F3F4EE] rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteHostelConfirm(hostel.id)}
                    className="p-1.5 text-[#8C9790] hover:text-[#BA1A1A] hover:bg-[#FDF3F3] rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {filteredHostels.length === 0 && (
              <div className="p-8 text-center text-xs text-[#5C6861]">No hostels found.</div>
            )}
          </div>
        </div>
      )}

      {/* Courses Panel */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {/* Add Form */}
          <form onSubmit={handleAddCourse} className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="e.g. BSc Computer Science & Engineering"
              className="flex-1 h-11 px-4 text-xs bg-white border border-[#D2DDD6] rounded-xl focus:outline-none focus:border-[#2E7D56]"
            />
            <button
              type="submit"
              disabled={!newCourseName.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142C20] rounded-xl flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-[#C59B4B]" />
              <span>Add</span>
            </button>
          </form>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C6861]" />
            <input
              type="text"
              value={searchCourses}
              onChange={(e) => setSearchCourses(e.target.value)}
              placeholder="Search courses..."
              className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-[#D2DDD6] rounded-xl focus:outline-none focus:border-[#2E7D56]"
            />
          </div>

          {/* List */}
          <div className="bg-white border border-[#E2E5DC] rounded-xl divide-y divide-[#EEF2EF] max-h-[500px] overflow-y-auto">
            {filteredCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#F9F9F6]">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-[#8C9790]" />
                  <span className="text-xs font-semibold text-[#18221D]">{course.name}</span>
                </div>
                {deleteCourseConfirm === course.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => { await onDeleteCourse(course.id); setDeleteCourseConfirm(null); }}
                      className="px-3 py-1 text-[11px] font-semibold text-white bg-[#BA1A1A] rounded-lg"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteCourseConfirm(null)}
                      className="px-3 py-1 text-[11px] font-semibold text-[#5C6861] bg-[#F3F4EE] rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteCourseConfirm(course.id)}
                    className="p-1.5 text-[#8C9790] hover:text-[#BA1A1A] hover:bg-[#FDF3F3] rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {filteredCourses.length === 0 && (
              <div className="p-8 text-center text-xs text-[#5C6861]">No courses found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
