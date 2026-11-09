'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import gsap from 'gsap';
import {
  PRESETS,
  STORAGE_KEY,
  Criterion,
  Alternative,
  WeightMode,
  HistoryEntry,
  computeTopsis,
  buildSummaryReport
} from '@/lib/topsis';
import {
  IconMatrix,
  IconTheorem,
  IconArchive,
  IconExport,
  IconPlus,
  IconScale,
  IconFolder,
  IconBranch,
  IconTheme,
  IconTrash,
  IconSmartphone,
  IconMonitor,
  IconChevron
} from '@/components/Icons';
import { TheoryView } from '@/components/TheoryView';
import { Modals, ActiveModal } from '@/components/Modals';
import { LiquidThreeBackground } from '@/components/LiquidThreeBackground';
import { LaptopDatabaseExplorer } from '@/components/LaptopDatabaseExplorer';
import {
  LAPTOP_CSV_CRITERIA,
  LaptopRecord,
  laptopToAlternative
} from '@/lib/laptopDatabase';

type ActiveTab = 'kalkulator' | 'penjelasan' | 'riwayat' | 'ekspor';

interface ToastItem {
  id: number;
  message: string;
}

export default function TopsisStudioPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('kalkulator');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState<boolean>(false);
  const [activePresetKey, setActivePresetKey] = useState<string>('laptop');
  const [criteria, setCriteria] = useState<Criterion[]>(() =>
    JSON.parse(JSON.stringify(PRESETS.laptop.criteria))
  );
  const [alternatives, setAlternatives] = useState<Alternative[]>(() =>
    JSON.parse(JSON.stringify(PRESETS.laptop.alternatives))
  );
  const [weightMode, setWeightMode] = useState<WeightMode>('point');
  const [sensitivityWeights, setSensitivityWeights] = useState<number[] | null>(null);
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({
    step1: true,
    step2: false,
    step3: false,
    step4: false
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const centerStageRef = useRef<HTMLElement | null>(null);

  const pushToast = useCallback((message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedTheme = localStorage.getItem('topsis_3d_liquid_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch {
      // Ignore storage access errors in restricted browsing modes.
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !centerStageRef.current) return;

    gsap.fromTo(
      centerStageRef.current,
      { opacity: 0.72, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.24,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      }
    );
  }, [activeTab, activePresetKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('topsis_3d_liquid_theme', next);
    } catch {
      // Ignore storage write errors.
    }
    pushToast(
      next === 'dark'
        ? 'Beralih ke Mode Abyssal Frost (Gelap).'
        : 'Beralih ke Mode Arctic Daylight (Terang).'
    );
  };

  const totalWeight = useMemo(
    () => criteria.reduce((acc, c) => acc + (Number(c.weight) || 0), 0),
    [criteria]
  );

  const totalPoint = useMemo(
    () => criteria.reduce((acc, c) => acc + (Number(c.point) || 0), 0),
    [criteria]
  );

  const isWeightBalanced = Math.abs(totalWeight - 1.0) <= 0.005;

  const calculationResult = useMemo(
    () => computeTopsis(criteria, alternatives, sensitivityWeights),
    [criteria, alternatives, sensitivityWeights]
  );

  const summaryReportText = useMemo(
    () => buildSummaryReport(criteria, calculationResult),
    [criteria, calculationResult]
  );

  const selectPreset = (key: string) => {
    setActivePresetKey(key);
    if (key === 'custom') {
      setCriteria([
        { id: 'C1', name: 'Kriteria 1', weight: 0.5, point: 50, type: 'benefit' },
        { id: 'C2', name: 'Kriteria 2', weight: 0.5, point: 50, type: 'cost' }
      ]);
      setAlternatives([
        { id: 'A1', name: 'Kandidat Alternatif 1', values: [75, 50] },
        { id: 'A2', name: 'Kandidat Alternatif 2', values: [60, 40] }
      ]);
      setSensitivityWeights(null);
      pushToast('Matriks Kustom 2x2 siap diisi.');
      return;
    }

    const preset = PRESETS[key];
    if (preset) {
      setCriteria(JSON.parse(JSON.stringify(preset.criteria)));
      setAlternatives(JSON.parse(JSON.stringify(preset.alternatives)));
      setSensitivityWeights(null);
      pushToast(`Template "${preset.name}" dimuat ke studio.`);
    }
  };

  const handleAutoNormalize = () => {
    if (criteria.length === 0) return;
    const sum = criteria.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
    const updated = criteria.map((c) => {
      const normalized = sum > 0 ? (Number(c.weight) || 0) / sum : 1 / criteria.length;
      const roundedWeight = Number(normalized.toFixed(4));
      return {
        ...c,
        weight: roundedWeight,
        point: Math.round(roundedWeight * 100)
      };
    });
    setCriteria(updated);
    setSensitivityWeights(null);
    pushToast('Seluruh bobot kriteria telah dinormalisasi (∑W = 1.00).');
  };

  const handleAddCriterion = () => {
    const nextNum = criteria.length + 1;
    const newCrit: Criterion = {
      id: `C${nextNum}`,
      name: `Kriteria Baru ${nextNum}`,
      weight: 0.1,
      point: 10,
      type: 'benefit'
    };
    setCriteria((prev) => [...prev, newCrit]);
    setAlternatives((prev) =>
      prev.map((alt) => ({
        ...alt,
        values: [...alt.values, 50]
      }))
    );
    setSensitivityWeights(null);
    pushToast(`Kriteria C${nextNum} berhasil ditambahkan.`);
  };

  const handleRemoveCriterion = (idx: number) => {
    if (criteria.length <= 1) {
      pushToast('Minimal harus terdapat 1 kriteria aktif.');
      return;
    }
    const nextCriteria = criteria
      .filter((_, i) => i !== idx)
      .map((c, i) => ({ ...c, id: `C${i + 1}` }));
    const nextAlternatives = alternatives.map((alt) => ({
      ...alt,
      values: alt.values.filter((_, i) => i !== idx)
    }));
    setCriteria(nextCriteria);
    setAlternatives(nextAlternatives);
    setSensitivityWeights(null);
    pushToast('Kriteria dihapus dan indeks diperbarui.');
  };

  const handleCriterionNameChange = (idx: number, name: string) => {
    setCriteria((prev) => prev.map((c, i) => (i === idx ? { ...c, name } : c)));
  };

  const handleCriterionPointChange = (idx: number, rawVal: string) => {
    const pt = Math.max(0, Number(rawVal) || 0);
    const w = Number((pt / 100).toFixed(4));
    setCriteria((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, point: pt, weight: w } : c))
    );
    setSensitivityWeights(null);
  };

  const handleCriterionWeightChange = (idx: number, rawVal: string) => {
    const w = Math.max(0, Number(rawVal) || 0);
    const pt = Math.round(w * 100);
    setCriteria((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, weight: w, point: pt } : c))
    );
    setSensitivityWeights(null);
  };

  const handleToggleCriterionType = (idx: number) => {
    setCriteria((prev) =>
      prev.map((c, i) =>
        i === idx ? { ...c, type: c.type === 'benefit' ? 'cost' : 'benefit' } : c
      )
    );
  };

  const handleAddAlternative = () => {
    const nextNum = alternatives.length + 1;
    const newAlt: Alternative = {
      id: `A${nextNum}`,
      name: `Kandidat Alternatif ${nextNum}`,
      values: criteria.map(() => 75)
    };
    setAlternatives((prev) => [...prev, newAlt]);
    pushToast(`Alternatif A${nextNum} ditambahkan ke matriks.`);
  };

  const handleRemoveAlternative = (idx: number) => {
    if (alternatives.length <= 2) {
      pushToast('Minimal dibutuhkan 2 alternatif untuk perangkingan TOPSIS.');
      return;
    }
    const nextAlts = alternatives
      .filter((_, i) => i !== idx)
      .map((a, i) => ({ ...a, id: `A${i + 1}` }));
    setAlternatives(nextAlts);
    pushToast('Alternatif dihapus dari matriks.');
  };

  const handleAlternativeNameChange = (idx: number, name: string) => {
    setAlternatives((prev) => prev.map((a, i) => (i === idx ? { ...a, name } : a)));
  };

  const handleMatrixCellChange = (rIdx: number, cIdx: number, rawVal: string) => {
    const numVal = Number(rawVal) || 0;
    setAlternatives((prev) =>
      prev.map((a, i) => {
        if (i !== rIdx) return a;
        const nextValues = [...a.values];
        nextValues[cIdx] = numVal;
        return { ...a, values: nextValues };
      })
    );
  };

  const handleSliderChange = (idx: number, rawVal: string) => {
    const val = Number(rawVal) || 0;
    setSensitivityWeights((prev) => {
      const base = prev ? [...prev] : criteria.map((c) => Number(c.weight) || 0);
      base[idx] = val;
      return base;
    });
  };

  const toggleAllSteps = () => {
    const anyClosed = Object.values(openSteps).some((v) => !v);
    setOpenSteps({
      step1: anyClosed,
      step2: anyClosed,
      step3: anyClosed,
      step4: anyClosed
    });
  };

  const handleSaveToHistory = (title: string) => {
    const topWinner = calculationResult?.ranking[0];
    const entry: HistoryEntry = {
      id: `session_${Date.now()}`,
      title,
      timestamp: new Date().toISOString(),
      winner: topWinner ? topWinner.name : 'N/A',
      winnerScore: topWinner ? topWinner.v.toFixed(4) : '0.0000',
      criteriaCount: criteria.length,
      altCount: alternatives.length,
      criteria: JSON.parse(JSON.stringify(criteria)),
      alternatives: JSON.parse(JSON.stringify(alternatives))
    };
    const nextHistory = [entry, ...history];
    setHistory(nextHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    } catch {
      // Ignore storage write errors.
    }
    pushToast(`Sesi "${title}" tersimpan di Riwayat.`);
  };

  const handleLoadHistoryEntry = (entry: HistoryEntry) => {
    setCriteria(JSON.parse(JSON.stringify(entry.criteria)));
    setAlternatives(JSON.parse(JSON.stringify(entry.alternatives)));
    setActivePresetKey('custom');
    setSensitivityWeights(null);
    setActiveTab('kalkulator');
    pushToast(`Sesi "${entry.title}" dimuat kembali ke studio.`);
  };

  const handleDeleteHistoryEntry = (id: string) => {
    const nextHistory = history.filter((item) => item.id !== id);
    setHistory(nextHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    } catch {
      // Ignore storage write errors.
    }
    pushToast('Sesi riwayat dihapus.');
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage write errors.
    }
    pushToast('Seluruh arsip riwayat dibersihkan.');
  };

  const downloadBlob = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportRankingsCSV = () => {
    if (!calculationResult) return;
    const rows: (string | number)[][] = [
      [
        'Peringkat',
        'Kode',
        'Nama Alternatif',
        'Jarak Ideal (+) D+',
        'Jarak Ideal (-) D-',
        'Nilai Preferensi (V)',
        'Persentase (%)',
        'Status'
      ]
    ];
    calculationResult.ranking.forEach((r, idx) => {
      rows.push([
        idx + 1,
        `"${r.id}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        r.dPlus.toFixed(6),
        r.dMinus.toFixed(6),
        r.v.toFixed(6),
        (r.v * 100).toFixed(2),
        idx === 0 ? 'Rekomendasi Utama' : 'Dipertimbangkan'
      ]);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    downloadBlob(csv, `topsis_ranking_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    pushToast('Berkas CSV Hasil Rangking berhasil diunduh.');
  };

  const exportMatrixCSV = () => {
    const head = [
      'Kode Alternatif',
      'Nama Alternatif',
      ...criteria.map((c) => `"${c.id} - ${c.name} (${c.type})"`)
    ];
    const rows: (string | number)[][] = [head];
    alternatives.forEach((alt) => {
      rows.push([
        `"${alt.id}"`,
        `"${alt.name.replace(/"/g, '""')}"`,
        ...criteria.map((_, cIdx) => alt.values[cIdx] ?? 0)
      ]);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    downloadBlob(csv, `topsis_matriks_keputusan_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    pushToast('Berkas CSV Matriks Keputusan (X) berhasil diunduh.');
  };

  const exportNormalizedCSV = () => {
    if (!calculationResult) return;
    const head = [
      'Kode Alternatif',
      'Nama Alternatif',
      ...criteria.map((c) => `"${c.id} (W=${c.weight})"`)
    ];
    const rows: (string | number)[][] = [head];
    alternatives.forEach((alt, i) => {
      rows.push([
        `"${alt.id}"`,
        `"${alt.name.replace(/"/g, '""')}"`,
        ...criteria.map((_, j) => calculationResult.Y[i][j].toFixed(6))
      ]);
    });
    const csv = rows.map((r) => r.join(',')).join('\n');
    downloadBlob(csv, `topsis_matriks_terbobot_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    pushToast('Berkas CSV Matriks Terbobot (Y) berhasil diunduh.');
  };

  const exportProjectJSON = () => {
    const payload = {
      app: 'Kalkulator TOPSIS Studio',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      criteria,
      alternatives
    };
    downloadBlob(
      JSON.stringify(payload, null, 2),
      `topsis_project_${Date.now()}.json`,
      'application/json'
    );
    pushToast('Cadangan proyek JSON berhasil diunduh.');
  };

  const scrollToSection = (elementId: string) => {
    const performScroll = () => {
      const target = document.getElementById(elementId);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (activeTab !== 'kalkulator') {
      setActiveTab('kalkulator');
      setTimeout(performScroll, 70);
    } else {
      performScroll();
    }
  };

  const handleAddSingleLaptopFromDb = (item: LaptopRecord) => {
    const isSixLaptopCriteria =
      criteria.length === 6 && criteria[0]?.name.toLowerCase().includes('harga');

    if (!isSixLaptopCriteria) {
      const nextCrit = JSON.parse(JSON.stringify(LAPTOP_CSV_CRITERIA));
      const firstAlt = laptopToAlternative(item, 0);
      const fallbackSecond = PRESETS.laptop.alternatives[1];
      setCriteria(nextCrit);
      setAlternatives([firstAlt, { ...fallbackSecond, id: 'A2' }]);
      setActivePresetKey('laptop');
      setSensitivityWeights(null);
      pushToast(
        `Skema diselaraskan ke 6 Kriteria CSV & "${item.company} ${item.product}" ditambahkan.`
      );
      return;
    }

    setAlternatives((prev) => {
      const nextAlt = laptopToAlternative(item, prev.length);
      return [...prev, nextAlt];
    });
    pushToast(`"${item.company} ${item.product}" ditambahkan ke Matriks Keputusan (A${alternatives.length + 1}).`);
  };

  const handleLoadBatchFromDb = (
    nextCriteria: Criterion[],
    nextAlternatives: Alternative[],
    label: string
  ) => {
    setCriteria(nextCriteria);
    setAlternatives(nextAlternatives);
    setActivePresetKey('laptop');
    setSensitivityWeights(null);
    pushToast(`Dimuat ke Matriks TOPSIS: ${label}.`);
    setTimeout(() => {
      const target = document.getElementById('sec-tahap-2');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const activePresetLabel =
    activePresetKey === 'custom'
      ? 'Matriks Kustom Mandiri'
      : PRESETS[activePresetKey]?.name || 'Pemilihan Laptop';

  const champion = calculationResult?.ranking[0];

  return (
    <div className={`studio-shell ${isMobilePreview ? 'mobile-sim-active' : ''}`}>
      <LiquidThreeBackground theme={theme} topScore={champion?.v ?? 0.74} />
      <div className="workspace-stage">
        <aside className="left-rail" aria-label="Bilah Samping Studio">
          <div className="floating-pod brand-pod">
            <div className="brand-row">
              <div className="brand-mark" aria-hidden="true">
                ∑
              </div>
              <div>
                <div className="brand-title">TOPSIS Studio</div>
                <div className="brand-caption">Metode Hwang &amp; Yoon (1981)</div>
              </div>
            </div>
            <button
              type="button"
              className="btn-amber-cta"
              onClick={() => selectPreset('custom')}
            >
              <IconPlus size={16} />
              <span>Matriks Baru (Kustom)</span>
            </button>
          </div>

          <nav className="floating-pod nav-pod-list desktop-nav-pod" aria-label="Menu Utama">
            <div className="nav-pod-label">Ruang Kerja</div>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'kalkulator' ? 'active' : ''}`}
              onClick={() => setActiveTab('kalkulator')}
            >
              <span className="nav-item-left">
                <IconMatrix size={18} />
                <span>Kalkulator Matriks</span>
              </span>
              <span className="nav-count-pill">{alternatives.length}×{criteria.length}</span>
            </button>

            <button
              type="button"
              className="nav-item-btn"
              onClick={() => scrollToSection('sec-database-csv')}
            >
              <span className="nav-item-left">
                <IconFolder size={18} />
                <span>Database CSV Laptop</span>
              </span>
              <span className="nav-count-pill">1.275</span>
            </button>

            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'penjelasan' ? 'active' : ''}`}
              onClick={() => setActiveTab('penjelasan')}
            >
              <span className="nav-item-left">
                <IconTheorem size={18} />
                <span>Rumus &amp; Teori</span>
              </span>
            </button>

            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'riwayat' ? 'active' : ''}`}
              onClick={() => setActiveTab('riwayat')}
            >
              <span className="nav-item-left">
                <IconArchive size={18} />
                <span>Riwayat Sesi</span>
              </span>
              <span className="nav-count-pill">{history.length}</span>
            </button>

            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'ekspor' ? 'active' : ''}`}
              onClick={() => setActiveTab('ekspor')}
            >
              <span className="nav-item-left">
                <IconExport size={18} />
                <span>Ekspor Laporan</span>
              </span>
            </button>

            <div className="nav-pod-label" style={{ marginTop: '0.6rem' }}>
              Referensi &amp; Alat
            </div>
            <button
              type="button"
              className="nav-item-btn"
              onClick={() => setActiveModal('weight-guide')}
            >
              <span className="nav-item-left">
                <IconScale size={18} />
                <span>Kaidah Bobot ∑W=1</span>
              </span>
            </button>
            <button
              type="button"
              className="nav-item-btn"
              onClick={() => setActiveModal('help')}
            >
              <span className="nav-item-left">
                <IconTheorem size={18} />
                <span>Panduan Studio</span>
              </span>
            </button>
          </nav>

          <div className="floating-pod nav-pod-list">
            <div className="nav-pod-label">Preferensi Sistem</div>
            <button type="button" className="nav-item-btn" onClick={toggleTheme}>
              <span className="nav-item-left">
                <IconTheme size={18} />
                <span>{theme === 'light' ? 'Mode Abyssal Frost (Gelap)' : 'Mode Arctic Frost (Terang)'}</span>
              </span>
            </button>
            <button
              type="button"
              className={`nav-item-btn ${isMobilePreview ? 'active' : ''}`}
              onClick={() => {
                setIsMobilePreview((prev) => !prev);
                pushToast(
                  !isMobilePreview
                    ? 'Menampilkan kerangka aplikasi Mobile (Rasio 9:16).'
                    : 'Kembali ke tampilan Web Desktop 3-Panel.'
                );
              }}
            >
              <span className="nav-item-left">
                <IconSmartphone size={18} />
                <span>Pratinjau Mobile 9:16</span>
              </span>
            </button>
            <button
              type="button"
              className="nav-item-btn"
              onClick={() => setActiveModal('reset')}
              style={{ color: 'var(--cost-text)' }}
            >
              <span className="nav-item-left">
                <IconTrash size={18} />
                <span>Reset Papan Matriks</span>
              </span>
            </button>
          </div>
        </aside>

        <main className="center-stage" ref={centerStageRef}>
          <div
            className="floating-pod mobile-utility-strip"
            style={{
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '0.875rem 1rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}
            >
              <div className="brand-row">
                <div className="brand-mark" style={{ width: '2.1rem', height: '2.1rem', fontSize: '1rem' }} aria-hidden="true">
                  ∑
                </div>
                <div>
                  <div className="brand-title" style={{ fontSize: '0.98rem' }}>TOPSIS Liquid Glass</div>
                  <div className="brand-caption">∑W = {totalWeight.toFixed(2)} • {alternatives.length}×{criteria.length}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {isMobilePreview && (
                  <button
                    type="button"
                    className="btn btn-amber"
                    onClick={() => setIsMobilePreview(false)}
                    title="Kembali ke Tampilan Web Penuh"
                  >
                    <IconMonitor size={15} />
                    <span>Mode Web</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-icon-only"
                  onClick={toggleTheme}
                  aria-label="Ubah Tema Frost"
                  title="Ubah Tema Frost"
                >
                  <IconTheme size={16} />
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setMobileInspectorOpen((prev) => !prev)}
                  aria-expanded={mobileInspectorOpen}
                >
                  <span>Inspektor</span>
                  <IconChevron size={15} open={mobileInspectorOpen} />
                </button>
              </div>
            </div>

            {mobileInspectorOpen && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  paddingTop: '0.65rem'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <button type="button" className="btn btn-amber" onClick={() => selectPreset('custom')}>
                    <IconPlus size={14} />
                    <span>Matriks Baru</span>
                  </button>
                  <button type="button" className="btn" onClick={() => setActiveModal('weight-guide')}>
                    <span>Kaidah ∑W=1</span>
                  </button>
                  <button type="button" className="btn" onClick={() => setActiveModal('help')}>
                    <span>Panduan</span>
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => setActiveModal('reset')}>
                    <span>Reset</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Peringkat Langsung (Skor V_i)
                  </span>
                  {calculationResult?.ranking.map((item, idx) => {
                    const pct = (item.v * 100).toFixed(1);
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.5rem 0.7rem',
                          borderRadius: '12px',
                          background: idx === 0 ? 'var(--amber-surface)' : 'var(--pod-elevated)',
                          boxShadow: 'var(--emboss-btn)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          fontSize: '0.78rem'
                        }}
                      >
                        <strong>
                          #{idx + 1} {item.id}: {item.name}
                        </strong>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {item.v.toFixed(3)} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <header className="stage-top-bar">
            <div className="stage-top-title-group">
              <span className="stage-top-eyebrow">
                SISTEM PENDUKUNG KEPUTUSAN MULTI-KRITERIA • {activePresetLabel.toUpperCase()}
              </span>
              <h1 className="stage-top-title">
                {activeTab === 'kalkulator' && 'Studio Kalkulasi & Perangkingan TOPSIS'}
                {activeTab === 'penjelasan' && 'Landasan Matematis & Derivasi Vektor TOPSIS'}
                {activeTab === 'riwayat' && 'Arsip Sesi Perhitungan Lokal'}
                {activeTab === 'ekspor' && 'Diseminasi Data & Ekspor Laporan Keputusan'}
              </h1>
            </div>
            <div className="stage-top-actions">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setIsMobilePreview((prev) => !prev);
                  pushToast(
                    !isMobilePreview
                      ? 'Mode Pratinjau Mobile 9:16 diaktifkan.'
                      : 'Mode Layar Web Penuh diaktifkan.'
                  );
                }}
                title="Beralih antara tampilan Web Desktop dan Mobile 9:16"
              >
                {isMobilePreview ? <IconMonitor size={16} /> : <IconSmartphone size={16} />}
                <span>{isMobilePreview ? 'Layar Web' : 'Mobile 9:16'}</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleAutoNormalize}
                title="Normalisasikan bobot agar total berjumlah 1.00"
              >
                <IconScale size={16} />
                <span>Normalisasi ∑W=1</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setActiveModal('save-history')}
              >
                <span>Simpan Snapshot</span>
              </button>
              <button type="button" className="btn btn-charcoal" onClick={exportRankingsCSV}>
                <IconExport size={16} />
                <span>Unduh CSV</span>
              </button>
            </div>
          </header>

          {!isHydrated ? (
            <section className="stage-card" aria-busy="true">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Memuat konfigurasi matriks dan menyinkronkan penyimpanan lokal...
              </p>
            </section>
          ) : null}

          {activeTab === 'kalkulator' && (
            <>
              <section className="stage-card" id="sec-langkah-0">
                <div className="stage-card-header">
                  <div className="stage-card-title-row">
                    <span className="step-tag step-tag-amber">LANGKAH 00</span>
                    <h2 className="stage-card-heading">Pilih Skenario Studi Kasus</h2>
                  </div>
                  <span className="meta-badge">Aktif: {activePresetLabel}</span>
                </div>

                <div className="template-grid">
                  {Object.values(PRESETS).map((preset) => {
                    const isActive = activePresetKey === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`template-item-card ${isActive ? 'active' : ''}`}
                        onClick={() => selectPreset(preset.id)}
                        aria-pressed={isActive}
                      >
                        <div>
                          <div className="template-item-top">
                            <span className="template-tag">{preset.tag}</span>
                            {isActive && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>AKTIF</span>
                            )}
                          </div>
                          <div className="template-item-title">{preset.name}</div>
                          <p className="template-item-desc">{preset.description}</p>
                        </div>
                        <div className="template-item-meta">
                          {preset.criteria.length} Kriteria • {preset.alternatives.length} Alternatif
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className={`template-item-card ${activePresetKey === 'custom' ? 'active' : ''}`}
                    onClick={() => selectPreset('custom')}
                    aria-pressed={activePresetKey === 'custom'}
                  >
                    <div>
                      <div className="template-item-top">
                        <span className="template-tag">KUSTOM</span>
                        {activePresetKey === 'custom' && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>AKTIF</span>
                        )}
                      </div>
                      <div className="template-item-title">Matriks Mandiri</div>
                      <p className="template-item-desc">
                        Susun kriteria, bobot preferensi, dan kandidat alternatif Anda sendiri dari awal.
                      </p>
                    </div>
                    <div className="template-item-meta">Konfigurasi Bebas</div>
                  </button>
                </div>
              </section>

              <LaptopDatabaseExplorer
                onAddSingleLaptop={handleAddSingleLaptopFromDb}
                onLoadBatchToMatrix={handleLoadBatchFromDb}
              />

              <section className="stage-card" id="sec-tahap-1">
                <div className="stage-card-header">
                  <div className="stage-card-title-row">
                    <span className="step-tag">TAHAP 01</span>
                    <h2 className="stage-card-heading">Kalibrasi Kriteria &amp; Bobot Preferensi (W)</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`meta-badge ${isWeightBalanced ? 'status-ok' : 'status-warn'}`}>
                      {weightMode === 'point'
                        ? `Total: ${totalPoint} Poin (${totalWeight.toFixed(2)})`
                        : `Total Bobot: ${totalWeight.toFixed(2)} ${isWeightBalanced ? '(Seimbang)' : '(Belum 1.00)'}`}
                    </span>
                    <button type="button" className="btn btn-amber" onClick={handleAddCriterion}>
                      <IconPlus size={15} />
                      <span>Tambah Kriteria</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.85rem 1.05rem',
                    borderRadius: '16px',
                    background: 'var(--pod-elevated)',
                    boxShadow: 'var(--emboss-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      SKALA INPUT BOBOT:
                    </span>
                    <button
                      type="button"
                      className={`btn ${weightMode === 'point' ? 'btn-charcoal' : ''}`}
                      onClick={() => setWeightMode('point')}
                    >
                      Metode 100 Poin
                    </button>
                    <button
                      type="button"
                      className={`btn ${weightMode === 'decimal' ? 'btn-charcoal' : ''}`}
                      onClick={() => setWeightMode('decimal')}
                    >
                      Mode Desimal (0.00 - 1.00)
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => setActiveModal('weight-guide')}
                  >
                    Panduan Penanganan ∑W ≠ 1
                  </button>
                </div>

                <div className="polarity-guide-grid">
                  <div className="polarity-box">
                    <span className="polarity-badge benefit">[+] BENEFIT</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-strong)', display: 'block' }}>
                        Semakin Besar Semakin Unggul
                      </strong>
                      Contoh: Kapasitas RAM, daya tahan baterai, capaian KPI, indeks kualitas.
                    </div>
                  </div>
                  <div className="polarity-box">
                    <span className="polarity-badge cost">[-] COST</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-strong)', display: 'block' }}>
                        Semakin Kecil Semakin Menguntungkan
                      </strong>
                      Contoh: Harga beli, biaya sewa tahunan, jumlah komplain, waktu pengiriman.
                    </div>
                  </div>
                </div>

                {!isWeightBalanced && (
                  <div className="charcoal-block" role="region" aria-label="Peringatan Normalisasi Bobot">
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--amber-primary)',
                            textTransform: 'uppercase'
                          }}
                        >
                          {totalWeight > 1
                            ? 'Kasus A: Total Bobot Lebih dari 1.00'
                            : 'Kasus B: Total Bobot Kurang dari 1.00'}
                        </span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.15rem' }}>
                          Total Bobot Saat Ini = {totalWeight.toFixed(2)} (Selisih{' '}
                          {Math.abs(totalWeight - 1).toFixed(2)})
                        </h3>
                      </div>
                      <button type="button" className="btn btn-amber" onClick={handleAutoNormalize}>
                        Normalisasikan Sekarang (w_j ÷ ∑w)
                      </button>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--charcoal-muted)' }}>
                      Sesuai kaidah standar TOPSIS, setiap bobot dibagi dengan total bobot saat ini agar berjumlah tepat 1.000 tanpa mengubah rasio kepentingan antar kriteria:
                    </p>
                    <div className="charcoal-inner-well">
                      {criteria.map((c) => {
                        const oldW = Number(c.weight) || 0;
                        const newW = totalWeight > 0 ? oldW / totalWeight : 1 / criteria.length;
                        return (
                          <div key={c.id}>
                            <span className="amber-code-highlight">{c.id}</span> ({c.name}): {oldW.toFixed(2)} ÷{' '}
                            {totalWeight.toFixed(2)} = <strong>{newW.toFixed(4)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="criteria-cards-grid">
                  {criteria.map((crit, idx) => (
                    <div key={crit.id} className="criterion-card">
                      <div className="criterion-card-top">
                        <span className="criterion-code">{crit.id}</span>
                        <button
                          type="button"
                          className="btn btn-icon-only"
                          onClick={() => handleRemoveCriterion(idx)}
                          title={`Hapus kriteria ${crit.id}`}
                          aria-label={`Hapus kriteria ${crit.id}`}
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>

                      <div className="field-group">
                        <label htmlFor={`crit-name-${idx}`} className="field-label">
                          Nama Kriteria
                        </label>
                        <input
                          id={`crit-name-${idx}`}
                          type="text"
                          className="input-control"
                          value={crit.name}
                          onChange={(e) => handleCriterionNameChange(idx, e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '0.6rem', alignItems: 'end' }}>
                        {weightMode === 'point' ? (
                          <div className="field-group">
                            <label htmlFor={`crit-pt-${idx}`} className="field-label">
                              Poin (0-100)
                            </label>
                            <input
                              id={`crit-pt-${idx}`}
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              className="input-control mono-num"
                              value={crit.point}
                              onChange={(e) => handleCriterionPointChange(idx, e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="field-group">
                            <label htmlFor={`crit-w-${idx}`} className="field-label">
                              Bobot (0-1)
                            </label>
                            <input
                              id={`crit-w-${idx}`}
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              className="input-control mono-num"
                              value={crit.weight}
                              onChange={(e) => handleCriterionWeightChange(idx, e.target.value)}
                            />
                          </div>
                        )}

                        <div className="field-group">
                          <span className="field-label">Atribut</span>
                          <button
                            type="button"
                            className={`polarity-toggle-btn ${crit.type}`}
                            onClick={() => handleToggleCriterionType(idx)}
                            title="Klik untuk mengganti antara Benefit dan Cost"
                          >
                            {crit.type === 'benefit' ? '[+] Benefit' : '[-] Cost'}
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          textAlign: 'right'
                        }}
                      >
                        Bobot Efektif: {(calculationResult?.weights[idx] ?? crit.weight).toFixed(3)} (
                        {Math.round((calculationResult?.weights[idx] ?? crit.weight) * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="stage-card" id="sec-tahap-2">
                <div className="stage-card-header">
                  <div className="stage-card-title-row">
                    <span className="step-tag">TAHAP 02</span>
                    <h2 className="stage-card-heading">Matriks Keputusan Alternatif (X)</h2>
                  </div>
                  <button type="button" className="btn btn-amber" onClick={handleAddAlternative}>
                    <IconPlus size={15} />
                    <span>Tambah Alternatif</span>
                  </button>
                </div>

                <div className="table-scroll-box">
                  <table className="studio-table">
                    <thead>
                      <tr>
                        <th style={{ width: '68px' }}>Kode</th>
                        <th style={{ minWidth: '185px' }}>Nama Kandidat Alternatif</th>
                        {criteria.map((c, cIdx) => (
                          <th key={c.id} style={{ textAlign: 'right', minWidth: '130px' }}>
                            <div>
                              {c.id}: {c.name}
                            </div>
                            <div
                              style={{
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-secondary)',
                                fontWeight: 500
                              }}
                            >
                              W={(calculationResult?.weights[cIdx] ?? c.weight).toFixed(2)} |{' '}
                              {c.type === 'benefit' ? '[+] Benefit' : '[-] Cost'}
                            </div>
                          </th>
                        ))}
                        <th style={{ width: '68px', textAlign: 'center' }}>Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alternatives.map((alt, rIdx) => (
                        <tr key={alt.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{alt.id}</td>
                          <td>
                            <input
                              type="text"
                              className="table-cell-input"
                              value={alt.name}
                              aria-label={`Nama alternatif ${alt.id}`}
                              onChange={(e) => handleAlternativeNameChange(rIdx, e.target.value)}
                            />
                          </td>
                          {criteria.map((c, cIdx) => (
                            <td key={c.id}>
                              <input
                                type="number"
                                step="any"
                                className="table-cell-input num"
                                value={alt.values[cIdx] ?? 0}
                                aria-label={`Nilai ${alt.name} untuk ${c.name}`}
                                onChange={(e) => handleMatrixCellChange(rIdx, cIdx, e.target.value)}
                              />
                            </td>
                          ))}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-icon-only"
                              onClick={() => handleRemoveAlternative(rIdx)}
                              title={`Hapus alternatif ${alt.id}`}
                              aria-label={`Hapus alternatif ${alt.id}`}
                            >
                              <IconTrash size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-amber"
                    onClick={() => {
                      scrollToSection('sec-tahap-3');
                      pushToast('Perhitungan matriks TOPSIS diperbarui dan disorot.');
                    }}
                  >
                    Sorot Hasil Perangkingan (Tahap 03)
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Setiap perubahan angka pada sel matriks otomatis memperbarui skor V_i secara langsung.
                  </span>
                </div>
              </section>

              <section className="stage-card" id="sec-tahap-3">
                <div className="stage-card-header">
                  <div className="stage-card-title-row">
                    <span className="step-tag step-tag-amber">TAHAP 03</span>
                    <h2 className="stage-card-heading">Peringkat Akhir &amp; Rekomendasi Solusi Terbaik</h2>
                  </div>
                  <span className="meta-badge status-ok">
                    {calculationResult?.ranking.length || 0} Kandidat Terurut
                  </span>
                </div>

                {champion && (
                  <div className="charcoal-block">
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: 'var(--amber-primary)'
                          }}
                        >
                          REKOMENDASI UTAMA (PERINGKAT #1)
                        </span>
                        <h3 style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.6rem)', fontWeight: 700, marginTop: '0.2rem' }}>
                          {champion.id}: {champion.name}
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: 'var(--charcoal-muted)', marginTop: '0.2rem' }}>
                          Memiliki rasio kedekatan tertinggi terhadap solusi ideal positif (D+ ={' '}
                          {champion.dPlus.toFixed(4)}) dan jarak terjauh dari solusi negatif (D- ={' '}
                          {champion.dMinus.toFixed(4)}).
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-muted)', textTransform: 'uppercase' }}>
                            Skor Preferensi (V_i)
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: 'var(--amber-primary)'
                            }}
                          >
                            {champion.v.toFixed(4)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-muted)', textTransform: 'uppercase' }}>
                            Indeks Kedekatan
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: 'var(--charcoal-text)'
                            }}
                          >
                            {(champion.v * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="charcoal-inner-well">
                      <div>
                        <span className="amber-code-highlight">const</span> solusiTerpilih = &#123; kode:{' '}
                        <span className="amber-code-highlight">&quot;{champion.id}&quot;</span>, kandidat:{' '}
                        <span className="amber-code-highlight">&quot;{champion.name}&quot;</span>, D_plus:{' '}
                        {champion.dPlus.toFixed(4)}, D_minus: {champion.dMinus.toFixed(4)}, V_score:{' '}
                        <span className="amber-code-highlight">{champion.v.toFixed(4)}</span> &#125;;
                      </div>
                    </div>
                  </div>
                )}

                <div className="table-scroll-box">
                  <table className="studio-table">
                    <thead>
                      <tr>
                        <th style={{ width: '90px', textAlign: 'center' }}>Peringkat</th>
                        <th style={{ width: '75px' }}>Kode</th>
                        <th>Nama Alternatif</th>
                        <th style={{ textAlign: 'right' }}>Jarak Ideal (+) D+</th>
                        <th style={{ textAlign: 'right' }}>Jarak Ideal (-) D-</th>
                        <th style={{ textAlign: 'right' }}>Nilai Preferensi (V)</th>
                        <th style={{ minWidth: '170px' }}>Visualisasi Kedekatan</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculationResult?.ranking.map((item, idx) => {
                        const rankNum = idx + 1;
                        const pct = (item.v * 100).toFixed(1);
                        return (
                          <tr key={item.id} className={rankNum === 1 ? 'winner-row' : ''}>
                            <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {rankNum === 1 ? 'JUARA 1' : `#${rankNum}`}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.id}</td>
                            <td>
                              <strong>{item.name}</strong>
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                              {item.dPlus.toFixed(4)}
                            </td>
                            <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                              {item.dMinus.toFixed(4)}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                fontSize: '0.95rem'
                              }}
                            >
                              {item.v.toFixed(4)}
                            </td>
                            <td>
                              <div className="rank-bar-wrap">
                                <div className="rank-bar-track">
                                  <div
                                    className={`rank-bar-fill ${rankNum === 1 ? 'is-champion' : ''}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    width: '46px',
                                    textAlign: 'right'
                                  }}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                              {rankNum === 1
                                ? 'Rekomendasi Utama'
                                : rankNum === 2
                                ? 'Cadangan Prioritas'
                                : 'Dipertimbangkan'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    padding: '1.15rem',
                    borderRadius: '18px',
                    background: 'var(--pod-muted)',
                    boxShadow: 'var(--deboss-input)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-strong)' }}>
                        Simulasi Sensitivitas Bobot Kriteria (What-If Analysis)
                      </strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Geser tuas bobot di bawah untuk menguji apakah perubahan prioritas kriteria menggeser kandidat Juara 1.
                      </p>
                    </div>
                    {sensitivityWeights && (
                      <button
                        type="button"
                        className="btn btn-charcoal"
                        onClick={() => {
                          setSensitivityWeights(null);
                          pushToast('Bobot simulasi dikembalikan ke kalibrasi Tahap 01.');
                        }}
                      >
                        Reset Simulasi ke Bobot Awal
                      </button>
                    )}
                  </div>

                  <div className="sliders-grid">
                    {criteria.map((crit, idx) => {
                      const currentW = sensitivityWeights
                        ? sensitivityWeights[idx]
                        : Number(crit.weight) || 0;
                      return (
                        <div key={crit.id} className="slider-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <strong>
                              {crit.id}: {crit.name}
                            </strong>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              W = {currentW.toFixed(2)}
                            </span>
                          </div>
                          <input
                            type="range"
                            className="range-slider"
                            min="0.01"
                            max="1.00"
                            step="0.01"
                            value={currentW}
                            aria-label={`Simulasi bobot ${crit.name}`}
                            onChange={(e) => handleSliderChange(idx, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="stage-card" id="sec-audit">
                <div className="stage-card-header">
                  <div className="stage-card-title-row">
                    <span className="step-tag">AUDIT</span>
                    <h2 className="stage-card-heading">Rincian Matriks Komputasi Lengkap (Langkah 01 s/d 05)</h2>
                  </div>
                  <button type="button" className="btn" onClick={toggleAllSteps}>
                    Buka / Tutup Semua Langkah
                  </button>
                </div>

                <div className="accordion-item">
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => setOpenSteps((p) => ({ ...p, step1: !p.step1 }))}
                    aria-expanded={openSteps.step1}
                  >
                    <span>Langkah 01: Matriks Keputusan Ternormalisasi (R)</span>
                    <IconChevron open={openSteps.step1} />
                  </button>
                  {openSteps.step1 && calculationResult && (
                    <div className="accordion-body">
                      <div className="charcoal-inner-well">
                        <span className="amber-code-highlight">Rumus Normalisasi Euclidean:</span> r_ij = x_ij / √(∑
                        x_kj²)
                        <br />
                        Pembagi Kolom:{' '}
                        {criteria
                          .map((c, j) => `${c.id} = ${calculationResult.divisors[j].toFixed(4)}`)
                          .join(' | ')}
                      </div>
                      <div className="table-scroll-box">
                        <table className="studio-table">
                          <thead>
                            <tr>
                              <th>Kode Alternatif</th>
                              {criteria.map((c) => (
                                <th key={c.id} style={{ textAlign: 'right' }}>
                                  {c.id} ({c.name})
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt, i) => (
                              <tr key={alt.id}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                  {alt.id}: {alt.name}
                                </td>
                                {calculationResult.R[i].map((val, j) => (
                                  <td key={j} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                    {val.toFixed(4)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="accordion-item">
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => setOpenSteps((p) => ({ ...p, step2: !p.step2 }))}
                    aria-expanded={openSteps.step2}
                  >
                    <span>Langkah 02: Matriks Ternormalisasi Terbobot (Y)</span>
                    <IconChevron open={openSteps.step2} />
                  </button>
                  {openSteps.step2 && calculationResult && (
                    <div className="accordion-body">
                      <div className="charcoal-inner-well">
                        <span className="amber-code-highlight">Rumus Matriks Terbobot:</span> y_ij = w_j · r_ij
                      </div>
                      <div className="table-scroll-box">
                        <table className="studio-table">
                          <thead>
                            <tr>
                              <th>Kode Alternatif</th>
                              {criteria.map((c, j) => (
                                <th key={c.id} style={{ textAlign: 'right' }}>
                                  {c.id} (W={calculationResult.weights[j].toFixed(3)})
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt, i) => (
                              <tr key={alt.id}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                  {alt.id}: {alt.name}
                                </td>
                                {calculationResult.Y[i].map((val, j) => (
                                  <td key={j} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                    {val.toFixed(4)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="accordion-item">
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => setOpenSteps((p) => ({ ...p, step3: !p.step3 }))}
                    aria-expanded={openSteps.step3}
                  >
                    <span>Langkah 03: Solusi Ideal Positif (A+) &amp; Solusi Ideal Negatif (A-)</span>
                    <IconChevron open={openSteps.step3} />
                  </button>
                  {openSteps.step3 && calculationResult && (
                    <div className="accordion-body">
                      <div className="charcoal-inner-well">
                        <span className="amber-code-highlight">Aturan Polaritas Ideal:</span> Benefit mengambil max
                        untuk A+ dan min untuk A-. Cost mengambil min untuk A+ dan max untuk A-.
                      </div>
                      <div className="table-scroll-box">
                        <table className="studio-table">
                          <thead>
                            <tr>
                              <th>Vektor Solusi Ideal</th>
                              {criteria.map((c) => (
                                <th key={c.id} style={{ textAlign: 'right' }}>
                                  {c.id} [{c.type.toUpperCase()}]
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ fontWeight: 700, color: 'var(--benefit-text)' }}>
                                [A+] Solusi Ideal Positif
                              </td>
                              {calculationResult.A_plus.map((val, j) => (
                                <td
                                  key={j}
                                  style={{
                                    textAlign: 'right',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    color: 'var(--benefit-text)'
                                  }}
                                >
                                  {val.toFixed(4)}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td style={{ fontWeight: 700, color: 'var(--cost-text)' }}>
                                [A-] Solusi Ideal Negatif
                              </td>
                              {calculationResult.A_minus.map((val, j) => (
                                <td
                                  key={j}
                                  style={{
                                    textAlign: 'right',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    color: 'var(--cost-text)'
                                  }}
                                >
                                  {val.toFixed(4)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="accordion-item">
                  <button
                    type="button"
                    className="accordion-trigger"
                    onClick={() => setOpenSteps((p) => ({ ...p, step4: !p.step4 }))}
                    aria-expanded={openSteps.step4}
                  >
                    <span>Langkah 04 &amp; 05: Jarak Euclidean (D+, D-) &amp; Kedekatan Relatif (V_i)</span>
                    <IconChevron open={openSteps.step4} />
                  </button>
                  {openSteps.step4 && calculationResult && (
                    <div className="accordion-body">
                      <div className="charcoal-inner-well">
                        D_i^+ = √(∑(y_ij - y_j^+)²) | D_i^- = √(∑(y_ij - y_j^-)²) |{' '}
                        <span className="amber-code-highlight">V_i = D_i^- / (D_i^+ + D_i^-)</span>
                      </div>
                      <div className="table-scroll-box">
                        <table className="studio-table">
                          <thead>
                            <tr>
                              <th>Alternatif</th>
                              <th style={{ textAlign: 'right' }}>Jarak Positif (D+)</th>
                              <th style={{ textAlign: 'right' }}>Jarak Negatif (D-)</th>
                              <th style={{ textAlign: 'right' }}>Nilai Preferensi (V_i)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt, i) => (
                              <tr key={alt.id}>
                                <td style={{ fontWeight: 700 }}>
                                  {alt.id}: {alt.name}
                                </td>
                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                  {calculationResult.D_plus[i].toFixed(4)}
                                </td>
                                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                                  {calculationResult.D_minus[i].toFixed(4)}
                                </td>
                                <td
                                  style={{
                                    textAlign: 'right',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700
                                  }}
                                >
                                  {calculationResult.V[i].toFixed(4)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'penjelasan' && (
            <TheoryView
              onLoadLaptopPreset={() => {
                selectPreset('laptop');
                setActiveTab('kalkulator');
              }}
              onBackToCalculator={() => setActiveTab('kalkulator')}
            />
          )}

          {activeTab === 'riwayat' && (
            <section className="stage-card">
              <div className="stage-card-header">
                <div className="stage-card-title-row">
                  <span className="step-tag step-tag-amber">ARSIP LOKAL</span>
                  <h2 className="stage-card-heading">Daftar Sesi Perhitungan Tersimpan</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-amber"
                    onClick={() => setActiveModal('save-history')}
                  >
                    <IconPlus size={15} />
                    <span>Simpan Sesi Saat Ini</span>
                  </button>
                  {history.length > 0 && (
                    <button type="button" className="btn btn-danger" onClick={handleClearAllHistory}>
                      Bersihkan Semua Riwayat
                    </button>
                  )}
                </div>
              </div>

              {history.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    borderRadius: '18px',
                    backgroundColor: 'var(--recessed-well)',
                    boxShadow: 'var(--deboss-input)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <strong style={{ fontSize: '1rem', color: 'var(--text-strong)' }}>
                    Belum Ada Sesi Perhitungan yang Diarsipkan
                  </strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px' }}>
                    Penyimpanan riwayat masih kosong karena Anda belum menyimpan snapshot matriks. Klik tombol di bawah untuk menyimpan matriks yang sedang aktif di kalkulator.
                  </p>
                  <button
                    type="button"
                    className="btn btn-amber"
                    onClick={() => setActiveModal('save-history')}
                  >
                    Simpan Snapshot Pertama Sekarang
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {history.map((item) => {
                    const formattedDate = new Date(item.timestamp).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    });
                    return (
                      <div
                        key={item.id}
                        className="criterion-card"
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-strong)' }}>
                            {item.title}
                          </strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {formattedDate} • {item.criteriaCount} Kriteria • {item.altCount} Alternatif •{' '}
                            <strong style={{ color: 'var(--text-strong)' }}>
                              Juara 1: {item.winner} (V = {item.winnerScore})
                            </strong>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-amber"
                            onClick={() => handleLoadHistoryEntry(item)}
                          >
                            Muat ke Kalkulator
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDeleteHistoryEntry(item.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'ekspor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <section className="stage-card">
                <div className="stage-card-header">
                  <div className="stage-card-title-row">
                    <span className="step-tag step-tag-amber">EKSPOR DATA</span>
                    <h2 className="stage-card-heading">Unduh Berkas CSV, JSON, atau Cetak Laporan</h2>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div className="criterion-card" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <span className="meta-badge">Format Spreadsheet</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}>
                        Ekspor Tabel CSV
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Unduh matriks dan tabel perangkingan untuk dibuka langsung di Microsoft Excel atau Google Sheets.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn-amber" onClick={exportRankingsCSV}>
                        Unduh CSV: Peringkat Akhir
                      </button>
                      <button type="button" className="btn" onClick={exportMatrixCSV}>
                        Unduh CSV: Matriks Keputusan (X)
                      </button>
                      <button type="button" className="btn" onClick={exportNormalizedCSV}>
                        Unduh CSV: Matriks Terbobot (Y)
                      </button>
                    </div>
                  </div>

                  <div className="criterion-card" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <span className="meta-badge">Cadangan Konfigurasi</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}>
                        Berkas Proyek JSON
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Simpan struktur kriteria, bobot, dan nilai alternatif dalam format JSON atau impor proyek yang sudah ada.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn-charcoal" onClick={exportProjectJSON}>
                        Unduh Proyek JSON
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setActiveModal('import-json')}
                      >
                        Impor Proyek dari JSON
                      </button>
                    </div>
                  </div>

                  <div className="criterion-card" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <span className="meta-badge">Dokumen Resmi</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}>
                        Cetak / Simpan PDF
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Cetak laporan keputusan dengan tata letak kertas bersih tanpa bilah navigasi samping.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-amber"
                      onClick={() => {
                        setActiveTab('kalkulator');
                        setTimeout(() => window.print(), 120);
                      }}
                    >
                      Cetak Laporan / Simpan PDF
                    </button>
                  </div>
                </div>
              </section>

              <section className="stage-card">
                <div className="stage-card-header">
                  <div className="stage-card-title-row">
                    <span className="step-tag">RINGKASAN TEKS</span>
                    <h2 className="stage-card-heading">Pratinjau Laporan Formal</h2>
                  </div>
                  <button
                    type="button"
                    className="btn btn-amber"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(summaryReportText)
                        .then(() => pushToast('Ringkasan laporan berhasil disalin ke clipboard.'))
                        .catch(() => pushToast('Gagal menyalin otomatis. Silakan salin manual dari kotak teks.'));
                    }}
                  >
                    Salin Ringkasan ke Clipboard
                  </button>
                </div>

                <textarea
                  readOnly
                  className="input-control"
                  style={{
                    minHeight: '280px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    lineHeight: 1.55
                  }}
                  value={summaryReportText}
                  aria-label="Pratinjau Ringkasan Teks Laporan"
                />
              </section>
            </div>
          )}
        </main>

        <aside className="right-rail" aria-label="Inspektor Matriks & Pohon Skenario">
          <div className="floating-pod inspector-header-pod">
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                Mesin Inti TOPSIS
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Inspektor Skenario &amp; Vektor
              </div>
            </div>
            <span className={`meta-badge ${isWeightBalanced ? 'status-ok' : 'status-warn'}`}>
              ∑W={totalWeight.toFixed(2)}
            </span>
          </div>

          <div className="floating-pod" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="tree-group">
              <div className="tree-folder-row">
                <IconFolder size={17} className="amber-code-highlight" />
                <span>preset-studi-kasus</span>
              </div>
              {Object.values(PRESETS).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`tree-branch-btn ${activePresetKey === preset.id ? 'active' : ''}`}
                  onClick={() => selectPreset(preset.id)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <IconBranch size={14} />
                    <span>{preset.name}</span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                    {preset.alternatives.length}A
                  </span>
                </button>
              ))}
              <button
                type="button"
                className={`tree-branch-btn ${activePresetKey === 'custom' ? 'active' : ''}`}
                onClick={() => selectPreset('custom')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <IconBranch size={14} />
                  <span>Matriks Kustom Mandiri</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Bebas</span>
              </button>
            </div>

            <div className="tree-group">
              <div className="tree-folder-row">
                <IconFolder size={17} className="amber-code-highlight" />
                <span>tahap-komputasi</span>
              </div>
              <button
                type="button"
                className="tree-branch-btn"
                onClick={() => scrollToSection('sec-database-csv')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <IconBranch size={14} />
                  <span>Katalog Database CSV</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  1.275
                </span>
              </button>
              <button
                type="button"
                className="tree-branch-btn"
                onClick={() => scrollToSection('sec-tahap-1')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <IconBranch size={14} />
                  <span>Tahap 01: Kriteria &amp; Bobot</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {criteria.length}K
                </span>
              </button>
              <button
                type="button"
                className="tree-branch-btn"
                onClick={() => scrollToSection('sec-tahap-2')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <IconBranch size={14} />
                  <span>Tahap 02: Matriks X</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {alternatives.length}×{criteria.length}
                </span>
              </button>
              <button
                type="button"
                className="tree-branch-btn"
                onClick={() => scrollToSection('sec-tahap-3')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <IconBranch size={14} />
                  <span>Tahap 03: Peringkat V_i</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Top 1</span>
              </button>
              <button
                type="button"
                className="tree-branch-btn"
                onClick={() => scrollToSection('sec-audit')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <IconBranch size={14} />
                  <span>Audit Langkah 01 - 05</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>R, Y, A±</span>
              </button>
            </div>

            <div className="tree-group">
              <div className="tree-folder-row">
                <IconFolder size={17} className="amber-code-highlight" />
                <span>peringkat-langsung</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.35rem' }}>
                {calculationResult?.ranking.map((item, idx) => {
                  const pct = (item.v * 100).toFixed(1);
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.65rem 0.8rem',
                        borderRadius: '14px',
                        background: idx === 0 ? 'var(--amber-surface)' : 'var(--pod-elevated)',
                        boxShadow: 'var(--emboss-card)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        <span>
                          #{idx + 1} {item.id} ({item.name})
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{item.v.toFixed(3)}</span>
                      </div>
                      <div className="rank-bar-track" style={{ height: '7px' }}>
                        <div
                          className={`rank-bar-fill ${idx === 0 ? 'is-champion' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Navigasi Bawah Seluler">
        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === 'kalkulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('kalkulator')}
        >
          <IconMatrix size={18} />
          <span>Kalkulator</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === 'penjelasan' ? 'active' : ''}`}
          onClick={() => setActiveTab('penjelasan')}
        >
          <IconTheorem size={18} />
          <span>Rumus</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === 'riwayat' ? 'active' : ''}`}
          onClick={() => setActiveTab('riwayat')}
        >
          <IconArchive size={18} />
          <span>Riwayat ({history.length})</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === 'ekspor' ? 'active' : ''}`}
          onClick={() => setActiveTab('ekspor')}
        >
          <IconExport size={18} />
          <span>Ekspor</span>
        </button>
      </nav>

      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onConfirmReset={() => selectPreset('custom')}
        onConfirmSaveHistory={handleSaveToHistory}
        onConfirmImportJson={(importedCriteria, importedAlternatives) => {
          setCriteria(importedCriteria);
          setAlternatives(importedAlternatives);
          setActivePresetKey('custom');
          setSensitivityWeights(null);
          setActiveTab('kalkulator');
          pushToast('Data proyek JSON berhasil diimpor ke kalkulator.');
        }}
        onToast={pushToast}
      />

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast-pill">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--amber-primary)',
                flexShrink: 0
              }}
            />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
