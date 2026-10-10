import React, { useEffect, useRef, useState } from 'react';
import { Denomination } from '../types';
import { FellowshipLogo } from './FellowshipLogo';
import chapelImage from '../assets/images/_KFP1492-134.jpg';
import orbitBackground from '../assets/images/IMG_1990.jpg';
import sccLogo from '../assets/images/14cb4993-e679-4076-b672-52cf1de55bdb.jpg';
import {
  ShieldCheck,
  ArrowRight,
  UserPlus,
  User,
  Building2,
  Palette,
  CheckCircle2,
  MessageCircle,
  Clock
} from 'lucide-react';

interface LandingHeroProps {
  onStartRegistration: () => void;
  onOpenAdmin: () => void;
  onSelectFellowship: (denominationId: string) => void;
  denominations: Denomination[];
}

const FALLBACK_FELLOWSHIPS = [
  'AGCM', 'GHAMSU', 'PENSA', 'PAX ROMANA', 'NEW BREED', 'CCF',
  'CASA', 'NUPS-G', 'NUBS', 'GESAM', 'APOSA', 'DLCF', 'NUAS'
];

const FALLBACK_COLORS: [string, string][] = [
  ['#C62828', '#EF5350'],
  ['#1565C0', '#42A5F5'],
  ['#2E7D32', '#66BB6A'],
  ['#6A1B9A', '#AB47BC'],
  ['#E65100', '#FF7043'],
  ['#00695C', '#26A69A'],
  ['#4E1410', '#8D4440'],
  ['#1B5E20', '#43A047'],
  ['#1A237E', '#3949AB'],
  ['#B71C1C', '#E53935'],
  ['#283593', '#5C6BC0'],
  ['#0D47A1', '#1E88E5'],
  ['#37474F', '#78909C']
];

const buildFallbackFellowships = (): Denomination[] =>
  FALLBACK_FELLOWSHIPS.map((code, i) => ({
    id: code,
    name: code,
    campusFellowship: code,
    shortCode: code,
    color: FALLBACK_COLORS[i % FALLBACK_COLORS.length][0],
    accent: FALLBACK_COLORS[i % FALLBACK_COLORS.length][1],
    logoText: code.slice(0, 2).toUpperCase(),
    description: ''
  }));

const STEPS = [
  {
    num: '01',
    icon: <User className="w-5 h-5" />,
    title: 'Your details',
    body: 'Full name and WhatsApp number so your fellowship reps can personally welcome you.'
  },
  {
    num: '02',
    icon: <Building2 className="w-5 h-5" />,
    title: 'Program & residence',
    body: 'Your level, course of study, and hostel — so we know exactly where to find you.'
  },
  {
    num: '03',
    icon: <Palette className="w-5 h-5" />,
    title: 'Your fellowship',
    body: 'Pick your church tradition and we route you straight to the right campus fellowship.'
  }
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartRegistration,
  onOpenAdmin,
  onSelectFellowship,
  denominations
}) => {
  const fellowships: Denomination[] =
    denominations.length > 0 ? denominations : buildFallbackFellowships();
  const fellowshipCodes = fellowships.map((d) => d.shortCode);

  const outerRing = fellowships.slice(0, 7);
  const innerRing = fellowships.slice(7);

  const renderOrbitBadge = (
    d: Denomination,
    angle: number,
    radius: string,
    duration: string,
    dir: 'cw' | 'ccw'
  ) => (
    <div
      key={d.id}
      className="absolute left-1/2 top-1/2 w-0 h-0"
      style={{ transform: `rotate(${angle}deg) translateY(calc(-1 * ${radius}))` }}
    >
      <button
        type="button"
        onClick={() => onSelectFellowship(d.id)}
        aria-label={`Register under ${d.name}`}
        title={`Register under ${d.name}`}
        className={`orbit-badge orbit-badge-${dir} group rounded-full bg-white shadow-sanctuary-md hover:shadow-sanctuary-lg p-0.5 md:p-1 cursor-pointer`}
        style={
          {
            '--counter': `-${angle}deg`,
            animationDuration: duration,
            width: 'var(--chip)',
            height: 'var(--chip)'
          } as React.CSSProperties
        }
      >
        <FellowshipLogo
          denomination={d}
          size="lg"
          className="w-10! h-10! md:w-14! md:h-14! transition-transform duration-200 group-hover:scale-110"
        />
      </button>
    </div>
  );

  const renderOrbitDot = (
    key: string,
    angle: number,
    radius: string,
    color: string,
    size: number
  ) => (
    <div
      key={key}
      className="absolute left-1/2 top-1/2 w-0 h-0"
      style={{ transform: `rotate(${angle}deg) translateY(calc(-1 * ${radius}))` }}
    >
      <div
        className={`rounded-full ${color}`}
        style={{ width: `${size}px`, height: `${size}px`, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );

  const stepsRef = useRef<HTMLDivElement>(null);
  const [stepsRevealed, setStepsRevealed] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStepsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = pageRef.current;
    if (!root) return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-stack-panel]'));
    if (panels.length < 2) return;
    const inners = panels
      .map((p) => p.querySelector<HTMLElement>('[data-stack-inner]'))
      .filter((el): el is HTMLElement => el !== null);
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      panels.forEach((panel, i) => {
        const inner = inners[i];
        const next = panels[i + 1];
        if (!inner) return;
        if (!next) {
          inner.style.transform = '';
          inner.style.opacity = '';
          return;
        }
        const nextTop = next.getBoundingClientRect().top;
        const p = Math.min(Math.max(1 - nextTop / vh, 0), 1);
        if (p > 0) {
          inner.style.transform = `scale(${(1 - 0.05 * p).toFixed(4)})`;
          inner.style.opacity = (1 - 0.3 * p).toFixed(3);
        } else {
          inner.style.transform = '';
          inner.style.opacity = '';
        }
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={pageRef} className="bg-black">
      {/* ── Panel 1 — Hero ──────────────────────────────────────────────── */}
      <section className="relative z-10 sticky top-0" data-stack-panel>
        <div data-stack-inner className="relative flex flex-col min-h-svh overflow-hidden text-white">
        {/* Background Image in Motion */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={chapelImage}
            alt="Sanctuary Chapel Interior"
            className="w-full h-full object-cover animate-image-motion"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/78 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
          <div className="grain absolute inset-0 opacity-25" />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C59B4B]/15 blur-3xl pointer-events-none" />
        </div>

        {/* Center Hero Proposition */}
        <div className="relative z-10 flex-1 flex items-center px-5 sm:px-10 lg:px-16 py-10">
          <div className="mx-auto max-w-[1320px] w-full">
            {/* Standalone SCC Logo Medallion */}
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#C59B4B]/70 bg-white/10 backdrop-blur-md shadow-sanctuary-lg p-1"
              data-reveal
              style={{ animationDelay: '0.08s' }}
            >
              <img
                src={sccLogo}
                alt="Student Christian Council logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div
              className="mt-6 inline-flex items-center gap-2 border border-white/25 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-[#EDF7F1]"
              data-reveal
              style={{ animationDelay: '0.16s' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#2E7D56] animate-pulse" />
              <span>2026/2027 Campus Orientation & Intake</span>
            </div>

            <h1
              className="mt-6 font-heading text-[clamp(2.6rem,7.5vw,6.2rem)] leading-[0.92] tracking-[-0.045em] text-white text-balance"
              data-reveal
              style={{ animationDelay: '0.24s' }}
            >
              Unity and Service
              <br />
              <span className="text-[#E8CD96]">in Christ.</span>
            </h1>

            <p
              className="mt-6 text-base sm:text-lg text-[#EDF7F1]/85 leading-relaxed max-w-2xl"
              data-reveal
              style={{ animationDelay: '0.32s' }}
            >
              The Student Christian Council brings together all denominational fellowships.
              Register your campus contact, program, and residence in three quick steps —
              your fellowship leadership takes it from there.
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              data-reveal
              style={{ animationDelay: '0.4s' }}
            >
              <button
                onClick={onStartRegistration}
                className="px-7 py-3.5 bg-[#C59B4B] hover:bg-[#E8CD96] text-[#18221D] text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-colors cursor-pointer group"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register as New Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenAdmin}
                className="border border-white/30 hover:border-white/60 bg-white/5 backdrop-blur-md text-white/90 hover:text-white px-6 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#C59B4B]" />
                <span>SCC & Denomination Portals</span>
              </button>
            </div>

            <ul
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#EDF7F1]/65"
              data-reveal
              style={{ animationDelay: '0.48s' }}
            >
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C59B4B]" />
                <span>Takes under 2 minutes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C59B4B]" />
                <span>Free &amp; no account needed</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#C59B4B]" />
                <span>Direct WhatsApp to your campus rep</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Corner Marker */}
        <div className="absolute bottom-8 right-6 hidden lg:block text-right text-xs text-[#EDF7F1]/60 leading-relaxed">
          <span className="text-[#C59B4B] font-semibold tracking-[0.16em]">01</span>
          <br />
          Ghana campus register
        </div>
        </div>
      </section>

      {/* ── Panel 2 — Orbiting Fellowship Logos ───────────────────────── */}
      <section className="relative z-20 sticky top-0" data-stack-panel>
        <div
          data-stack-inner
          className="min-h-svh flex flex-col justify-center rounded-t-[2rem] md:rounded-t-[3rem] bg-black panel-lift overflow-hidden relative text-white"
        >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src={orbitBackground}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-10 lg:px-16 pt-8 sm:pt-16 pb-10 sm:pb-18">
          <div className="text-center space-y-2" data-reveal>
            <p className="font-heading text-sm font-semibold text-[#E8CD96]">The fellowships</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white">
              Every campus tradition, one council
            </h2>
          </div>

          <div className="orbit-stage relative mx-auto mt-8 sm:mt-10">
            {/* Solar glow behind the sun */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C59B4B]/25 blur-2xl pointer-events-none"
              style={{ width: 'calc(var(--center) * 1.8)', height: 'calc(var(--center) * 1.8)' }}
            />

            {/* Orbit guides */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/20"
              style={{ width: 'calc(var(--r-outer) * 2)', height: 'calc(var(--r-outer) * 2)' }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
              style={{ width: 'calc(var(--r-inner) * 2)', height: 'calc(var(--r-inner) * 2)' }}
            />

            {/* The sun: SCC crest */}
            <button
              type="button"
              onClick={onStartRegistration}
              aria-label="Start registration"
              title="Start registration"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-transform hover:scale-105"
              style={{ width: 'var(--center)', height: 'var(--center)' }}
            >
              <div className="w-full h-full rounded-full bg-white border-2 border-[#C59B4B] shadow-sanctuary-lg overflow-hidden p-1">
                <img
                  src={sccLogo}
                  alt="Student Christian Council logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </button>

            {/* Inner orbit — counter-clockwise, staggered against the outer ring */}
            {innerRing.length > 0 && (
              <div
                className="orbit-ring-ccw absolute inset-0"
                style={{ animationDuration: '44s' }}
              >
                {[0, 1, 2].map((k) =>
                  renderOrbitDot(
                    `inner-dot-${k}`,
                    (360 / innerRing.length) * k,
                    'var(--r-inner)',
                    'bg-[#2E7D56]/40',
                    6
                  )
                )}
                {innerRing.map((d, i) =>
                  renderOrbitBadge(
                    d,
                    (360 / innerRing.length) * i + 180 / innerRing.length,
                    'var(--r-inner)',
                    '44s',
                    'ccw'
                  )
                )}
              </div>
            )}

            {/* Outer orbit — clockwise */}
            <div className="orbit-ring-cw absolute inset-0" style={{ animationDuration: '60s' }}>
              {[0.5, 1.5, 2.5, 3.5].map((k, i) =>
                renderOrbitDot(
                  `outer-dot-${i}`,
                  (360 / outerRing.length) * k,
                  'var(--r-outer)',
                  'bg-[#C59B4B]/70',
                  7
                )
              )}
              {outerRing.map((d, i) =>
                renderOrbitBadge(
                  d,
                  (360 / outerRing.length) * i,
                  'var(--r-outer)',
                  '60s',
                  'cw'
                )
              )}
            </div>
          </div>

          <p className="text-center text-xs text-[#EDF7F1]/70 mt-8" data-reveal>
            <span className="font-bold text-[#E8CD96]">{fellowships.length}</span>{' '}
            fellowships orbiting one Student Christian Council
          </p>
        </div>
        </div>
      </section>

      {/* ── Panel 3 — How It Works ─────────────────────────────────────── */}
      <section className="relative z-30 sticky top-0" data-stack-panel>
        <div
          data-stack-inner
          className="min-h-svh flex flex-col justify-center rounded-t-[2rem] md:rounded-t-[3rem] bg-[#F5F1E8] panel-lift"
        >
        <div className="max-w-6xl mx-auto px-5 sm:px-10 lg:px-16 pt-10 sm:pt-20 pb-12 sm:pb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="font-heading text-sm font-semibold text-[#C59B4B]">How it works</p>
              <h2 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[0.96] text-[#18221D] max-w-xl text-balance">
                Three steps. <span className="text-[#2E7D56]">Two minutes.</span>
              </h2>
            </div>
            <p className="text-sm text-[#5C6861] max-w-xs leading-6">
              Your details go directly to the campus fellowship you choose — no forms to
              re-fill, no waiting in line.
            </p>
          </div>

          <div ref={stepsRef} className="mt-10 sm:mt-14 grid border-t border-[#18221D]/12">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`grid grid-cols-[64px_1fr] sm:grid-cols-[96px_1fr_1fr] items-center gap-4 sm:gap-8 border-b border-[#18221D]/12 py-5 sm:py-7 ${
                  stepsRevealed ? 'reveal-up' : 'opacity-0'
                }`}
                style={{ animationDelay: stepsRevealed ? `${i * 0.12}s` : undefined }}
              >
                <span className="flex h-14 w-14 rounded-full border border-[#18221D]/15 bg-white/60 items-center justify-center text-[#2E7D56]">
                  {step.icon}
                </span>
                <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#18221D]">
                  {step.title}
                </h3>
                <p className="col-start-2 mt-1 text-sm leading-6 text-[#5C6861] sm:col-start-3 sm:mt-0">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ── Panel 4 — Closing CTA ─────────────────────────────────────── */}
      <section className="relative z-40 md:sticky md:top-0 rounded-t-[2rem] md:rounded-t-[3rem] bg-black text-white panel-lift overflow-hidden">
        <img
          src={chapelImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/94 via-black/78 to-black/50" />
        <div className="grain absolute inset-0 opacity-25" />

        <div className="relative flex min-h-[80vh] items-center">
          <div className="mx-auto max-w-6xl w-full px-5 sm:px-10 lg:px-16 py-16 sm:py-20 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
            <div data-reveal>
              <p className="font-heading text-sm font-semibold text-[#C59B4B]">
                Freshers intake 2026/2027
              </p>
              <h2 className="mt-5 font-heading text-5xl sm:text-6xl font-semibold tracking-[-0.05em] leading-[0.92] text-balance">
                Come as you are.
                <br />
                <span className="text-[#E8CD96]">Leave with a family.</span>
              </h2>
              <p className="mt-6 max-w-md text-base text-[#EDF7F1]/75 leading-relaxed">
                Three short phases, one minute of your time — your campus fellowship leaders
                take it from there.
              </p>
            </div>

            <div
              className="rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-md p-7 sm:p-10 shadow-sanctuary-lg"
              data-reveal
              style={{ animationDelay: '0.15s' }}
            >
              <p className="text-xs text-[#EDF7F1]/60">Join the register</p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onStartRegistration}
                  className="inline-flex items-center justify-center gap-2 bg-[#C59B4B] hover:bg-[#E8CD96] text-[#18221D] px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer group"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register as a new student</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center justify-center gap-2 border border-white/25 text-white/90 hover:text-white hover:border-white/50 px-6 py-3.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C59B4B]" />
                  <span>Fellowship portal login</span>
                </button>
              </div>

              <p className="mt-5 text-xs leading-5 text-[#EDF7F1]/55">
                Free · no account needed · WhatsApp confirmation from your campus rep.
              </p>

              <div className="mt-6 pt-5 border-t border-white/15 text-xs">
                <span className="text-[#EDF7F1]/60">
                  One council · {fellowshipCodes.length} campus fellowships
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
