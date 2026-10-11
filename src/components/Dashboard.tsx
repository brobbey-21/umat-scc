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
      color: '#141414',
      bg: '#f8f8f2',
    },
    {
      label: 'Admin Reps',
      value: admins.length,
      icon: <UserCheck className="w-5 h-5" />,
      color: '#7e6f00',
      bg: '#fffbe0',
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
    { key: 'Hostel Visited', label: 'Hostel Visited', color: '#7e6f00' },
    { key: 'Contacted & Welcomed', label: 'Contacted', color: '#141414' },
    { key: 'New / Pending', label: 'New / Pending', color: '#9b9b93' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold text-[#141414]">Dashboard</h2>
        <p className="text-sm text-[#61615b]">Overview of the SCC campus registry.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#e6e6e0] rounded-xl p-5 shadow-sanctuary-sm"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
            <div className="font-heading text-3xl font-bold text-[#141414] tabular-nums">
              {card.value}
            </div>
            <div className="text-xs text-[#61615b] mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outreach Progress */}
        <div className="bg-white border border-[#e6e6e0] rounded-xl p-5 shadow-sanctuary-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#141414]" />
            <h3 className="font-heading text-lg font-semibold text-[#141414]">Outreach Progress</h3>
          </div>
          <div className="space-y-3">
            {statusMeta.map((s) => {
              const count = stats.statusCounts[s.key];
              const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
              return (
                <div key={s.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#141414]">{s.label}</span>
                    <span className="text-[#61615b] tabular-nums">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-[#f4f4ee] rounded-full overflow-hidden">
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
        <div className="bg-white border border-[#e6e6e0] rounded-xl p-5 shadow-sanctuary-sm space-y-4">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#7e6f00]" />
            <h3 className="font-heading text-lg font-semibold text-[#141414]">Top Halls & Hostels</h3>
          </div>
          <div className="space-y-2">
            {stats.topHalls.map(([hall, count], i) => (
              <div key={hall} className="flex items-center justify-between text-xs py-1.5 border-b border-[#f0f0ea] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#f4f4ee] text-[#61615b] flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[#141414] font-semibold">{hall}</span>
                </div>
                <span className="font-mono font-bold text-[#141414]">{count}</span>
              </div>
            ))}
            {stats.topHalls.length === 0 && (
              <p className="text-xs text-[#61615b] text-center py-4">No students yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Fellowship Distribution */}
      <div className="bg-white border border-[#e6e6e0] rounded-xl p-5 shadow-sanctuary-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Church className="w-4 h-4 text-[#1565C0]" />
            <h3 className="font-heading text-lg font-semibold text-[#141414]">Fellowship Distribution</h3>
          </div>
          <button
            onClick={() => onNavigate('denominations')}
            className="text-xs font-semibold text-[#141414] hover:underline"
          >
            Manage Denominations →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {stats.denomCounts.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-[#e6e6e0] hover:border-[#f6eb6e] hover:bg-[#fbfbf9] transition-colors"
            >
              <FellowshipLogo denomination={d} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-[#141414] truncate">{d.shortCode}</div>
                <div className="text-[10px] text-[#61615b] tabular-nums">{d.count} students</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
