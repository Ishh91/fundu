import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  ChevronRight,
  RotateCcw,
  BadgeIndianRupee,
  Layers,
  ArrowRight,
  Eye,
  Tv,
} from 'lucide-react';
import { formatINR } from '../lib/db';
import { isAmoledDisplay, getBrokenScreenDeductionRate } from '../lib/deviceSpecs';

interface QuestionState {
  // 1. Screen
  screenMinorScratches: boolean;
  screenMajorScratches: boolean;
  screenCracked: boolean;

  // 2. Display Spots & Issues
  displayMinorSpotsWhite: boolean;
  displayMajorSpots: boolean;
  displayMinorLines: boolean;
  displayMajorLines: boolean;
  displayMinorDiscolouration: boolean;
  displayMajorDiscolouration: boolean;

  // 3. Body
  bodyMinorSideScratches: boolean;
  bodyMajorSideScratches: boolean;
  bodyMinorDents: boolean;
  bodyMajorDents: boolean;
  bodyCrackedOrBroken: boolean;
}

const INITIAL_STATE: QuestionState = {
  screenMinorScratches: false,
  screenMajorScratches: false,
  screenCracked: false,
  displayMinorSpotsWhite: false,
  displayMajorSpots: false,
  displayMinorLines: false,
  displayMajorLines: false,
  displayMinorDiscolouration: false,
  displayMajorDiscolouration: false,
  bodyMinorSideScratches: false,
  bodyMajorSideScratches: false,
  bodyMinorDents: false,
  bodyMajorDents: false,
  bodyCrackedOrBroken: false,
};

interface DemoPreset {
  name: string;
  brand: string;
  model: string;
  basePrice: number;
  displayType: 'amoled' | 'normal';
  displayLabel: string;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    name: 'Apple iPhone 14 (128GB)',
    brand: 'Apple',
    model: 'iPhone 14',
    basePrice: 36500,
    displayType: 'amoled',
    displayLabel: 'Super Retina XDR OLED (AMOLED)',
  },
  {
    name: 'Samsung Galaxy S24 (256GB)',
    brand: 'Samsung',
    model: 'Galaxy S24',
    basePrice: 46000,
    displayType: 'amoled',
    displayLabel: 'Dynamic AMOLED 2X 120Hz',
  },
  {
    name: 'Apple iPhone 11 (128GB)',
    brand: 'Apple',
    model: 'iPhone 11',
    basePrice: 16500,
    displayType: 'normal',
    displayLabel: 'Liquid Retina IPS (Normal LCD)',
  },
  {
    name: 'Xiaomi Redmi 12 (128GB)',
    brand: 'Xiaomi',
    model: 'Redmi 12',
    basePrice: 6200,
    displayType: 'normal',
    displayLabel: 'FHD+ IPS LCD (Normal LCD)',
  },
];

export default function DemoConditionFilter() {
  const [answers, setAnswers] = useState<QuestionState>(INITIAL_STATE);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [displayOverride, setDisplayOverride] = useState<'amoled' | 'normal' | 'auto'>('auto');

  const currentPreset = DEMO_PRESETS[selectedPresetIndex];
  const effectiveDisplayType: 'amoled' | 'normal' =
    displayOverride === 'auto' ? currentPreset.displayType : displayOverride;

  const basePrice = currentPreset.basePrice;

  // Exact broken screen deduction rule:
  // if phone have amoled display then 45% direct deduction for broken screen and normal the 40%
  const brokenScreenRate = effectiveDisplayType === 'amoled' ? 0.45 : 0.40;

  const toggle = (key: keyof QuestionState, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  // Calculate live dynamic deductions based on questions
  const valuation = useMemo(() => {
    let deduction = 0;
    const notes: string[] = [];

    // 1. Screen
    if (answers.screenCracked) {
      const d = Math.round(basePrice * brokenScreenRate);
      deduction += d;
      const ratePct = Math.round(brokenScreenRate * 100);
      notes.push(`Broken Screen (-${formatINR(d)} / ${ratePct}% ${effectiveDisplayType.toUpperCase()})`);
    } else if (answers.screenMajorScratches) {
      const d = Math.round(basePrice * 0.12);
      deduction += d;
      notes.push(`Deep Screen Scratches (-${formatINR(d)})`);
    } else if (answers.screenMinorScratches) {
      const d = Math.round(basePrice * 0.05);
      deduction += d;
      notes.push(`Light Screen Scratches (-${formatINR(d)})`);
    }

    // 2. Display
    if (answers.displayMajorLines || answers.displayMajorSpots) {
      const d = Math.round(basePrice * 0.28);
      deduction += d;
      notes.push(`Major Display Lines/Spots (-${formatINR(d)})`);
    } else if (answers.displayMinorLines || answers.displayMinorSpotsWhite) {
      const d = Math.round(basePrice * 0.10);
      deduction += d;
      notes.push(`Minor Display Lines/Spots (-${formatINR(d)})`);
    }

    if (answers.displayMajorDiscolouration) {
      const d = Math.round(basePrice * 0.15);
      deduction += d;
      notes.push(`Major Display Discolouration (-${formatINR(d)})`);
    } else if (answers.displayMinorDiscolouration) {
      const d = Math.round(basePrice * 0.06);
      deduction += d;
      notes.push(`Slight Display Tint (-${formatINR(d)})`);
    }

    // 3. Body
    if (answers.bodyCrackedOrBroken) {
      const d = Math.round(basePrice * 0.20);
      deduction += d;
      notes.push(`Cracked Body/Frame (-${formatINR(d)})`);
    } else if (answers.bodyMajorDents) {
      const d = Math.round(basePrice * 0.12);
      deduction += d;
      notes.push(`Major Body Dents (-${formatINR(d)})`);
    } else if (answers.bodyMinorDents) {
      const d = Math.round(basePrice * 0.05);
      deduction += d;
      notes.push(`Minor Body Dents (-${formatINR(d)})`);
    }

    if (answers.bodyMajorSideScratches) {
      const d = Math.round(basePrice * 0.08);
      deduction += d;
      notes.push(`Deep Side Panel Scratches (-${formatINR(d)})`);
    } else if (answers.bodyMinorSideScratches) {
      const d = Math.round(basePrice * 0.03);
      deduction += d;
      notes.push(`Minor Side Scratches (-${formatINR(d)})`);
    }

    const finalOffer = Math.max(800, basePrice - deduction);
    const hasDefects = deduction > 0;
    const grade = deduction === 0 ? 'Flawless (Grade A+)' : deduction < 6000 ? 'Good (Grade B)' : 'Fair (Grade C)';
    const gradeColor = deduction === 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : deduction < 6000 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

    return {
      finalOffer,
      deduction,
      hasDefects,
      notes,
      grade,
      gradeColor,
    };
  }, [answers, basePrice, brokenScreenRate, effectiveDisplayType]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER BADGE */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4" /> Live Interactive Demo Preview
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Phone Condition Filter Questions
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Questions for assessing the physical condition of a phone: Screen, Display, and Body with smart AMOLED (45%) vs Normal LCD (40%) broken screen rule.
          </p>
        </div>

        {/* DEVICE SELECTOR & AMOLED / LCD TOGGLE BAR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                1. Select Demo Phone Preset:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_PRESETS.map((preset, idx) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setSelectedPresetIndex(idx);
                    setDisplayOverride('auto');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedPresetIndex === idx
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                  2. Active Display Technology & Deduction Rule:
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentPreset.displayLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDisplayOverride('amoled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                  effectiveDisplayType === 'amoled'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>AMOLED / OLED</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-white font-extrabold">
                  45% Broken
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayOverride('normal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                  effectiveDisplayType === 'normal'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Normal LCD</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-white font-extrabold">
                  40% Broken
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* STICKY LIVE VALUATION BAR */}
        <div className="sticky top-4 z-40 p-5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{currentPreset.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  effectiveDisplayType === 'amoled'
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                    : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                }`}>
                  {effectiveDisplayType === 'amoled' ? 'AMOLED (45% Broken Screen)' : 'Normal LCD (40% Broken Screen)'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${valuation.gradeColor}`}>
                  {valuation.grade}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xs text-slate-400">Base Flawless: {formatINR(basePrice)}</span>
                {valuation.deduction > 0 && (
                  <span className="text-xs text-rose-400 font-semibold">
                    (-{formatINR(valuation.deduction)} total deductions)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Live Doorstep Quote
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {formatINR(valuation.finalOffer)}
              </span>
            </div>
            <button
              onClick={() => setAnswers(INITIAL_STATE)}
              title="Reset all questions to No"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. SCREEN SECTION */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Screen</h2>
                <p className="text-xs text-slate-400">Outer front glass surface physical condition</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">3 Questions</span>
          </div>

          <div className="space-y-3">
            {/* Minor Scratches */}
            <QuestionCard
              title="Minor Scratches"
              question="Does the screen have light scratches that are hard to see?"
              selected={answers.screenMinorScratches}
              onSelect={(val) => toggle('screenMinorScratches', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.05))} (5%)`}
            />

            {/* Major Scratches */}
            <QuestionCard
              title="Major Scratches"
              question="Does the screen have deep scratches that are easy to see or feel?"
              selected={answers.screenMajorScratches}
              onSelect={(val) => toggle('screenMajorScratches', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.12))} (12%)`}
            />

            {/* Cracked or Broken (AMOLED vs Normal LCD rule) */}
            <QuestionCard
              title="Cracked or Broken"
              question="Is the screen cracked or broken?"
              selected={answers.screenCracked}
              onSelect={(val) => toggle('screenCracked', val)}
              highlightDanger
              customBadge={
                effectiveDisplayType === 'amoled'
                  ? `AMOLED Screen: 45% Direct Deduction (-${formatINR(Math.round(basePrice * 0.45))})`
                  : `Normal LCD Screen: 40% Direct Deduction (-${formatINR(Math.round(basePrice * 0.40))})`
              }
              customBadgeColor={
                effectiveDisplayType === 'amoled'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
              }
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. DISPLAY SPOTS & ISSUES SECTION */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Display Spots & Issues</h2>
                <p className="text-xs text-slate-400">Internal OLED / LCD panel health, lines, and color accuracy</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">6 Questions</span>
          </div>

          {/* Subcategory: Spots */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Spots
            </h3>
            <QuestionCard
              title="Minor Spots (White)"
              question="Are there any small white spots on the display?"
              selected={answers.displayMinorSpotsWhite}
              onSelect={(val) => toggle('displayMinorSpotsWhite', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.10))} (10%)`}
            />
            <QuestionCard
              title="Major Spots (Black / Green / Other)"
              question="Are there any black, green, or other coloured spots on the display?"
              selected={answers.displayMajorSpots}
              onSelect={(val) => toggle('displayMajorSpots', val)}
              highlightDanger
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.28))} (28%)`}
            />
          </div>

          {/* Subcategory: Lines */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Lines
            </h3>
            <QuestionCard
              title="Minor Lines"
              question="Are there any thin or faint lines that show up only sometimes?"
              selected={answers.displayMinorLines}
              onSelect={(val) => toggle('displayMinorLines', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.10))} (10%)`}
            />
            <QuestionCard
              title="Major Lines"
              question="Are there any bold lines that are always visible on the display?"
              selected={answers.displayMajorLines}
              onSelect={(val) => toggle('displayMajorLines', val)}
              highlightDanger
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.28))} (28%)`}
            />
          </div>

          {/* Subcategory: Discolouration */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Discolouration
            </h3>
            <QuestionCard
              title="Minor Discolouration"
              question="Does the display have a slight colour tint that you can notice only when you look closely?"
              selected={answers.displayMinorDiscolouration}
              onSelect={(val) => toggle('displayMinorDiscolouration', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.06))} (6%)`}
            />
            <QuestionCard
              title="Major Discolouration"
              question="Does the display have a strong colour patch or tint that is easy to see?"
              selected={answers.displayMajorDiscolouration}
              onSelect={(val) => toggle('displayMajorDiscolouration', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.15))} (15%)`}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. BODY SECTION */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Body</h2>
                <p className="text-xs text-slate-400">Side panels, metal frame, corners, and back glass</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">5 Questions</span>
          </div>

          {/* Subcategory: Side Panel Scratches */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Side Panel Scratches
            </h3>
            <QuestionCard
              title="Minor Side Panel Scratches"
              question="Are there any light scratches on the side panels of the phone?"
              selected={answers.bodyMinorSideScratches}
              onSelect={(val) => toggle('bodyMinorSideScratches', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.03))} (3%)`}
            />
            <QuestionCard
              title="Major Side Panel Scratches"
              question="Are there any deep scratches on the side panels that are easy to see or feel?"
              selected={answers.bodyMajorSideScratches}
              onSelect={(val) => toggle('bodyMajorSideScratches', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.08))} (8%)`}
            />
          </div>

          {/* Subcategory: Dents */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Dents
            </h3>
            <QuestionCard
              title="Minor Dents"
              question="Are there any small dents on the phone, such as on the corners or edges?"
              selected={answers.bodyMinorDents}
              onSelect={(val) => toggle('bodyMinorDents', val)}
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.05))} (5%)`}
            />
            <QuestionCard
              title="Major Dents"
              question="Are there any large or deep dents that change the shape of the phone?"
              selected={answers.bodyMajorDents}
              onSelect={(val) => toggle('bodyMajorDents', val)}
              highlightDanger
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.12))} (12%)`}
            />
          </div>

          {/* Subcategory: Cracked or Broken Body */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Back & Frame Integrity
            </h3>
            <QuestionCard
              title="Cracked or Broken Body"
              question="Is the back panel or frame of the phone cracked or broken?"
              selected={answers.bodyCrackedOrBroken}
              onSelect={(val) => toggle('bodyCrackedOrBroken', val)}
              highlightDanger
              deductionBadge={`-${formatINR(Math.round(basePrice * 0.20))} (20%)`}
            />
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Active Valuation Summary
            </h3>
            <span className="text-xs text-slate-400">
              {valuation.notes.length === 0 ? 'Zero defects declared' : `${valuation.notes.length} issues declared`}
            </span>
          </div>

          {valuation.notes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {valuation.notes.map((note, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  {note}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              ✨ 100% Flawless Benchmark Qualified! You receive the maximum guaranteed spot payout.
            </p>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Ready to deploy into production sell flow?</span>
            <div className="flex gap-2">
              <a
                href="/sell"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                Back to Current Sell Flow
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for each question row
function QuestionCard({
  title,
  question,
  selected,
  onSelect,
  highlightDanger = false,
  deductionBadge,
  customBadge,
  customBadgeColor,
}: {
  title: string;
  question: string;
  selected: boolean;
  onSelect: (val: boolean) => void;
  highlightDanger?: boolean;
  deductionBadge?: string;
  customBadge?: string;
  customBadgeColor?: string;
}) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        selected
          ? highlightDanger
            ? 'bg-rose-950/30 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
            : 'bg-amber-950/20 border-amber-500/40 shadow-sm'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-white">{title}</span>
          {customBadge && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                customBadgeColor || 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}
            >
              {customBadge}
            </span>
          )}
          {deductionBadge && (
            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {deductionBadge}
            </span>
          )}
          {selected && (
            <span
              className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                highlightDanger
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              Issue Declared
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-snug">{question}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={() => onSelect(false)}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            !selected
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onSelect(true)}
          className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            selected
              ? highlightDanger
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          Yes
        </button>
      </div>
    </div>
  );
}
