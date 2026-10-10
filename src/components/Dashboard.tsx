import React, { useMemo } from 'react';
import { StudentRegistration, DenominationAdmin, Denomination } from '../types';
import { FellowshipLogo } from './FellowshipLogo';
import {
  Users, UserCheck, Church, Clock,
  CheckCircle2, Home, TrendingUp, AlertCircle
} from 'lucide-react';

interface DashboardProps {
  students: StudentRegistration[];
  admins: DenominationAdmin[];
  denominations: Denomination[];
  onNavigate: (view: 'students' | 'denominations' | 'reference') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  admins,
  denominations,
  onNavigate
}) => {
  const stats = useMemo(() => {
    const statusCounts = {
      'New / Pending': 0,
      'Contacted & Welcomed': 0,
      'Hostel Visited': 0,
      'Added to Fellowship Group': 0,
    };
    students.forEach((s) => {
      if (s.outreachStatus in statusCounts) {
        statusCounts[s.outreachStatus as keyof typeof statusCounts]++;
      }
    });

    const denomCounts = denominations.map((d) => ({
      ...d,
      count: students.filter((s) => s.denominationId === d.id).length,
    })).sort((a, b) => b.count - a.count);

    const hallCounts: Record<string, number> = {};
    students.forEach((s) => {
      hallCounts[s.hallOrHostel] = (hallCounts[s.hallOrHostel] || 0) + 1;
    });
    const topHalls = Object.entries(hallCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { statusCounts, denomCounts, topHalls };
  }, [students, denominations]);

  const cards = [
    {
      label: 'Total Students',
      value: students.length,
      icon: <Users className="w-5 h-5" />,
      color: '#1B3B2B',
      bg: '#EDF7F1',
    },
    {
      label: 'Admin Reps',
      value: admins.length,
      icon: <UserCheck className="w-5 h-5" />,
      color: '#8A6218',
      bg: '#FCF6E9',
    },
    {
      label: 'Fellowships',
      value: denominations.length,
      icon: <Church className="w-5 h-5" />,
      color: '#1565C0',
      bg: '#E3F2FD',
    },
    {
      label: 'Fully Connected',
      value: stats.statusCounts['Added to Fellowship Group'],
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: '#2E7D32',
      bg: '#E8F5E9',
    },
  ];

  const statusMeta: { key: keyof typeof stats.statusCounts; label: string; color: string }[] = [
    { key: 'Added to Fellowship Group', label: 'Added to Fellowship', color: '#2E7D32' },
    { key: 'Hostel Visited', label: 'Hostel Visited', color: '#8A6218' },
    { key: 'Contacted & Welcomed', label: 'Contacted', color: '#1B3B2B' },
    { key: 'New / Pending', label: 'New / Pending', color: '#8C9790' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold text-[#18221D]">Dashboard</h2>
        <p className="text-sm text-[#5C6861]">Overview of the SCC campus registry.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#E2E5DC] rounded-xl p-5 shadow-sanctuary-sm"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
            <div className="font-heading text-3xl font-bold text-[#18221D] tabular-nums">
              {card.value}
            </div>
            <div className="text-xs text-[#5C6861] mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outreach Progress */}
        <div className="bg-white border border-[#E2E5DC] rounded-xl p-5 shadow-sanctuary-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2E7D56]" />
            <h3 className="font-heading text-lg font-semibold text-[#18221D]">Outreach Progress</h3>
          </div>
          <div className="space-y-3">
            {statusMeta.map((s) => {
              const count = stats.statusCounts[s.key];
              const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
              return (
                <div key={s.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#18221D]">{s.label}</span>
                    <span className="text-[#5C6861] tabular-nums">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-[#F3F4EE] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Halls */}
        <div className="bg-white border border-[#E2E5DC] rounded-xl p-5 shadow-sanctuary-sm space-y-4">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#8A6218]" />
            <h3 className="font-heading text-lg font-semibold text-[#18221D]">Top Halls & Hostels</h3>
          </div>
          <div className="space-y-2">
            {stats.topHalls.map(([hall, count], i) => (
              <div key={hall} className="flex items-center justify-between text-xs py-1.5 border-b border-[#EEF2EF] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#F3F4EE] text-[#5C6861] flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[#18221D] font-semibold">{hall}</span>
                </div>
                <span className="font-mono font-bold text-[#1B3B2B]">{count}</span>
              </div>
            ))}
            {stats.topHalls.length === 0 && (
              <p className="text-xs text-[#5C6861] text-center py-4">No students yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Fellowship Distribution */}
      <div className="bg-white border border-[#E2E5DC] rounded-xl p-5 shadow-sanctuary-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Church className="w-4 h-4 text-[#1565C0]" />
            <h3 className="font-heading text-lg font-semibold text-[#18221D]">Fellowship Distribution</h3>
          </div>
          <button
            onClick={() => onNavigate('denominations')}
            className="text-xs font-semibold text-[#2E7D56] hover:underline"
          >
            Manage Denominations →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {stats.denomCounts.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E5DC] hover:border-[#BEE5CE] hover:bg-[#F9F9F6] transition-colors"
            >
              <FellowshipLogo denomination={d} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-[#18221D] truncate">{d.shortCode}</div>
                <div className="text-[10px] text-[#5C6861] tabular-nums">{d.count} students</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
