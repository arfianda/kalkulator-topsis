export type CriterionType = 'benefit' | 'cost';
export type WeightMode = 'point' | 'decimal';

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  point: number;
  type: CriterionType;
}

export interface Alternative {
  id: string;
  name: string;
  values: number[];
}

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  tag: string;
  criteria: Criterion[];
  alternatives: Alternative[];
}

export interface RankingItem {
  index: number;
  id: string;
  name: string;
  dPlus: number;
  dMinus: number;
  v: number;
}

export interface TopsisResult {
  weights: number[];
  X: number[][];
  divisors: number[];
  R: number[][];
  Y: number[][];
  A_plus: number[];
  A_minus: number[];
  D_plus: number[];
  D_minus: number[];
  V: number[];
  ranking: RankingItem[];
}

export interface HistoryEntry {
  id: string;
  title: string;
  timestamp: string;
  winner: string;
  winnerScore: string;
  criteriaCount: number;
  altCount: number;
  criteria: Criterion[];
  alternatives: Alternative[];
}

export const PRESETS: Record<string, PresetConfig> = {
  laptop: {
    id: 'laptop',
    name: 'Pemilihan Laptop (Dataset CSV)',
    description: 'Sampel unggulan dari 1.275 baris CSV: Harga (€), RAM, CPU GHz, Storage, Resolusi MP, dan Berat.',
    tag: 'DATASET CSV UTAMA',
    criteria: [
      { id: 'C1', name: 'Harga (Euro €)', weight: 0.25, point: 25, type: 'cost' },
      { id: 'C2', name: 'Kapasitas RAM (GB)', weight: 0.20, point: 20, type: 'benefit' },
      { id: 'C3', name: 'Frekuensi CPU (GHz)', weight: 0.20, point: 20, type: 'benefit' },
      { id: 'C4', name: 'Total Storage (GB)', weight: 0.15, point: 15, type: 'benefit' },
      { id: 'C5', name: 'Resolusi Layar (MP)', weight: 0.10, point: 10, type: 'benefit' },
      { id: 'C6', name: 'Berat Fisik (Kg)', weight: 0.10, point: 10, type: 'cost' }
    ],
    alternatives: [
      { id: 'A1', name: 'Apple MacBook Pro 13 (Core i5, 8GB)', values: [1339.69, 8, 2.3, 128, 4.10, 1.37] },
      { id: 'A2', name: 'Asus ZenBook UX430UN (Core i7 8550U, 16GB)', values: [1495.0, 16, 1.8, 512, 2.07, 1.3] },
      { id: 'A3', name: 'Acer Swift 3 (Core i5 8250U, 8GB)', values: [770.0, 8, 1.6, 256, 2.07, 1.6] },
      { id: 'A4', name: 'Dell XPS 13 (Core i5 8250U, 8GB)', values: [979.0, 8, 1.6, 128, 2.07, 1.22] },
      { id: 'A5', name: 'Lenovo Legion Y520 (Core i5 7300HQ, 8GB)', values: [999.0, 8, 2.5, 1152, 2.07, 2.5] },
      { id: 'A6', name: 'HP ProBook 450 (Core i5 8250U, 8GB)', values: [879.0, 8, 1.6, 256, 2.07, 2.1] }
    ]
  },
  laptop_gaming: {
    id: 'laptop_gaming',
    name: 'Laptop Gaming (Dataset CSV)',
    description: 'Komparasi 6 laptop seri Gaming dari database CSV (MSI, Dell, Asus ROG, Legion, Nitro, Omen).',
    tag: 'SEGMEN GAMING CSV',
    criteria: [
      { id: 'C1', name: 'Harga (Euro €)', weight: 0.25, point: 25, type: 'cost' },
      { id: 'C2', name: 'Kapasitas RAM (GB)', weight: 0.20, point: 20, type: 'benefit' },
      { id: 'C3', name: 'Frekuensi CPU (GHz)', weight: 0.20, point: 20, type: 'benefit' },
      { id: 'C4', name: 'Total Storage (GB)', weight: 0.15, point: 15, type: 'benefit' },
      { id: 'C5', name: 'Resolusi Layar (MP)', weight: 0.10, point: 10, type: 'benefit' },
      { id: 'C6', name: 'Berat Fisik (Kg)', weight: 0.10, point: 10, type: 'cost' }
    ],
    alternatives: [
      { id: 'A1', name: 'Dell Inspiron 7577 (i7 7700HQ, GTX 1060)', values: [1499.0, 16, 2.8, 1280, 2.07, 2.65] },
      { id: 'A2', name: 'Asus ROG Strix (Ryzen 1700, RX 580)', values: [1299.0, 8, 3.0, 1280, 2.07, 3.2] },
      { id: 'A3', name: 'MSI GS73VR 7RG (i7 7700HQ, GTX 1070)', values: [2449.0, 16, 2.8, 2304, 2.07, 2.43] },
      { id: 'A4', name: 'HP Omen 15-ce007nv (i7 7700HQ, GTX 1050)', values: [1249.0, 12, 2.8, 1152, 2.07, 2.62] },
      { id: 'A5', name: 'Lenovo Legion Y720 (i7 7700HQ, GTX 1060)', values: [1499.0, 16, 2.8, 1280, 2.07, 3.2] },
      { id: 'A6', name: 'Acer Nitro AN515-51 (i5 7300HQ, GTX 1050)', values: [846.0, 8, 2.5, 256, 2.07, 2.5] }
    ]
  },
  laptop_ultrabook: {
    id: 'laptop_ultrabook',
    name: 'Ultrabook Portabel (Dataset CSV)',
    description: 'Komparasi 6 Ultrabook tipis & ringan dari database CSV dengan fokus mobilitas dan layar tajam.',
    tag: 'SEGMEN ULTRABOOK CSV',
    criteria: [
      { id: 'C1', name: 'Harga (Euro €)', weight: 0.25, point: 25, type: 'cost' },
      { id: 'C2', name: 'Kapasitas RAM (GB)', weight: 0.20, point: 20, type: 'benefit' },
      { id: 'C3', name: 'Frekuensi CPU (GHz)', weight: 0.20, point: 20, type: 'benefit' },
      { id: 'C4', name: 'Total Storage (GB)', weight: 0.15, point: 15, type: 'benefit' },
      { id: 'C5', name: 'Resolusi Layar (MP)', weight: 0.10, point: 10, type: 'benefit' },
      { id: 'C6', name: 'Berat Fisik (Kg)', weight: 0.10, point: 10, type: 'cost' }
    ],
    alternatives: [
      { id: 'A1', name: 'Dell XPS 13 QHD+ (Core i7 8550U, 16GB)', values: [1869.0, 16, 1.8, 512, 5.76, 1.2] },
      { id: 'A2', name: 'Apple MacBook Air 13 (Core i5, 8GB)', values: [998.0, 8, 1.6, 256, 1.30, 1.35] },
      { id: 'A3', name: 'Microsoft Surface Laptop (Core i5 7200U, 8GB)', values: [1340.0, 8, 2.5, 256, 3.39, 1.252] },
      { id: 'A4', name: 'Huawei MateBook X (Core i5 7200U, 8GB)', values: [1349.0, 8, 2.5, 256, 3.11, 1.05] },
      { id: 'A5', name: 'LG Gram 15Z975 (Core i7 8550U, 8GB)', values: [2299.0, 8, 1.8, 512, 2.07, 1.09] },
      { id: 'A6', name: 'Asus ZenBook UX430UA (Core i7 8550U, 8GB)', values: [1099.0, 8, 1.8, 256, 2.07, 1.25] }
    ]
  },
  karyawan: {
    id: 'karyawan',
    name: 'Evaluasi Karyawan Terbaik',
    description: 'Penilaian kinerja staf: Disiplin, KPI, Komplain, Kerjasama.',
    tag: 'SDM & HRD',
    criteria: [
      { id: 'C1', name: 'Disiplin & Kehadiran', weight: 0.30, point: 30, type: 'benefit' },
      { id: 'C2', name: 'Pencapaian KPI Target', weight: 0.30, point: 30, type: 'benefit' },
      { id: 'C3', name: 'Komplain Pelanggan', weight: 0.20, point: 20, type: 'cost' },
      { id: 'C4', name: 'Kerjasama Tim (Peer)', weight: 0.20, point: 20, type: 'benefit' }
    ],
    alternatives: [
      { id: 'A1', name: 'Budi Santoso', values: [90, 85, 2, 88] },
      { id: 'A2', name: 'Siti Rahmawati', values: [95, 92, 1, 94] },
      { id: 'A3', name: 'Eko Prasetyo', values: [80, 78, 5, 82] },
      { id: 'A4', name: 'Dewi Lestari', values: [88, 90, 3, 90] }
    ]
  },
  supplier: {
    id: 'supplier',
    name: 'Pemilihan Vendor Supplier',
    description: 'Pengadaan logistik: Harga, Kualitas, Kecepatan Kirim, Garansi.',
    tag: 'PENGADAAN BISNIS',
    criteria: [
      { id: 'C1', name: 'Harga Bahan Baku (Juta)', weight: 0.35, point: 35, type: 'cost' },
      { id: 'C2', name: 'Indeks Kualitas (1-100)', weight: 0.30, point: 30, type: 'benefit' },
      { id: 'C3', name: 'Waktu Pengiriman (Hari)', weight: 0.15, point: 15, type: 'cost' },
      { id: 'C4', name: 'Layanan & Garansi (1-10)', weight: 0.20, point: 20, type: 'benefit' }
    ],
    alternatives: [
      { id: 'A1', name: 'PT Mitra Sukses', values: [45, 90, 4, 8] },
      { id: 'A2', name: 'CV Logistik Prima', values: [40, 82, 6, 7] },
      { id: 'A3', name: 'PT Sentosa Abadi', values: [52, 96, 3, 9] },
      { id: 'A4', name: 'UD Sumber Makmur', values: [38, 75, 7, 6] }
    ]
  },
  lokasi: {
    id: 'lokasi',
    name: 'Penentuan Lokasi Cabang',
    description: 'Ekspansi cabang: Biaya Sewa, Kepadatan, Aksesibilitas, Kompetitor.',
    tag: 'STRATEGI PROPERTI',
    criteria: [
      { id: 'C1', name: 'Biaya Sewa Tahunan (Juta)', weight: 0.30, point: 30, type: 'cost' },
      { id: 'C2', name: 'Kepadatan Penduduk', weight: 0.30, point: 30, type: 'benefit' },
      { id: 'C3', name: 'Aksesibilitas (1-10)', weight: 0.20, point: 20, type: 'benefit' },
      { id: 'C4', name: 'Kompetitor Radius 1km', weight: 0.20, point: 20, type: 'cost' }
    ],
    alternatives: [
      { id: 'A1', name: 'Kawasan Sudirman Core', values: [150, 95, 9, 7] },
      { id: 'A2', name: 'Kawasan Kalibata Point', values: [85, 80, 7, 3] },
      { id: 'A3', name: 'Kawasan BSD Boulevard', values: [110, 85, 8, 4] },
      { id: 'A4', name: 'Kawasan Cibubur Junction', values: [70, 70, 6, 2] }
    ]
  }
};

export const STORAGE_KEY = 'topsis_academic_history_v1';

export function computeTopsis(
  criteria: Criterion[],
  alternatives: Alternative[],
  overrideWeights?: number[] | null
): TopsisResult | null {
  const m = alternatives.length;
  const n = criteria.length;

  if (m === 0 || n === 0) {
    return null;
  }

  let rawWeights = overrideWeights
    ? [...overrideWeights]
    : criteria.map((c) => Number(c.weight) || 0);

  const sumW = rawWeights.reduce((acc, v) => acc + v, 0);
  // Normalize weights proportionally so total weight always equals 1 during matrix computation.
  const weights = sumW > 0 ? rawWeights.map((w) => w / sumW) : rawWeights.map(() => 1 / n);

  const X = alternatives.map((a) => {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(Number(a.values[j]) || 0);
    }
    return row;
  });

  const divisors: number[] = [];
  for (let j = 0; j < n; j++) {
    let sumSq = 0;
    for (let i = 0; i < m; i++) {
      sumSq += Math.pow(X[i][j], 2);
    }
    // Fall back to 1 when a column contains all zeros to prevent division by zero.
    divisors.push(Math.sqrt(sumSq) || 1);
  }

  const R: number[][] = [];
  for (let i = 0; i < m; i++) {
    R[i] = [];
    for (let j = 0; j < n; j++) {
      R[i][j] = X[i][j] / divisors[j];
    }
  }

  const Y: number[][] = [];
  for (let i = 0; i < m; i++) {
    Y[i] = [];
    for (let j = 0; j < n; j++) {
      Y[i][j] = R[i][j] * weights[j];
    }
  }

  const A_plus: number[] = [];
  const A_minus: number[] = [];
  for (let j = 0; j < n; j++) {
    const colValues = Y.map((row) => row[j]);
    const maxVal = Math.max(...colValues);
    const minVal = Math.min(...colValues);

    // Cost criteria invert ideal polarity: lowest cost is positive ideal, highest is negative ideal.
    if (criteria[j].type === 'benefit') {
      A_plus.push(maxVal);
      A_minus.push(minVal);
    } else {
      A_plus.push(minVal);
      A_minus.push(maxVal);
    }
  }

  const D_plus: number[] = [];
  const D_minus: number[] = [];
  const V: number[] = [];

  for (let i = 0; i < m; i++) {
    let sumDistPlus = 0;
    let sumDistMinus = 0;
    for (let j = 0; j < n; j++) {
      sumDistPlus += Math.pow(Y[i][j] - A_plus[j], 2);
      sumDistMinus += Math.pow(Y[i][j] - A_minus[j], 2);
    }
    const dP = Math.sqrt(sumDistPlus);
    const dM = Math.sqrt(sumDistMinus);
    D_plus.push(dP);
    D_minus.push(dM);

    const vi = dP + dM === 0 ? 0 : dM / (dP + dM);
    V.push(vi);
  }

  const ranking: RankingItem[] = alternatives.map((alt, i) => ({
    index: i,
    id: alt.id,
    name: alt.name,
    dPlus: D_plus[i],
    dMinus: D_minus[i],
    v: V[i]
  }));

  ranking.sort((a, b) => b.v - a.v);

  return {
    weights,
    X,
    divisors,
    R,
    Y,
    A_plus,
    A_minus,
    D_plus,
    D_minus,
    V,
    ranking
  };
}

export function buildSummaryReport(
  criteria: Criterion[],
  result: TopsisResult | null
): string {
  if (!result || result.ranking.length === 0) {
    return 'Data belum cukup untuk membuat ringkasan laporan.';
  }

  const dateStr = new Date().toLocaleString('id-ID');
  const { ranking } = result;

  let text = `LAPORAN KEPUTUSAN METODE TOPSIS (HWANG & YOON 1981)\n`;
  text += `Waktu Komputasi: ${dateStr}\n\n`;

  text += `1. KRITERIA DAN BOBOT PREFERENSI:\n`;
  criteria.forEach((c) => {
    text += `   [${c.id}] ${c.name} | Bobot: ${c.weight} | Tipe: ${c.type.toUpperCase()}\n`;
  });

  text += `\n2. REKOMENDASI TERBAIK (PERINGKAT 1):\n`;
  const champion = ranking[0];
  text += `   Nama Alternatif : ${champion.id} (${champion.name})\n`;
  text += `   Skor Preferensi : V = ${champion.v.toFixed(6)} (${(champion.v * 100).toFixed(2)}%)\n`;
  text += `   Jarak Geometris : D+ = ${champion.dPlus.toFixed(6)} | D- = ${champion.dMinus.toFixed(6)}\n`;

  text += `\n3. TABEL LENGKAP PERANGKINGAN ALTERNATIF:\n`;
  text += `   Rank | Kode | Nama Alternatif         | D+       | D-       | Nilai V   | Status\n`;
  ranking.forEach((r, idx) => {
    const rankPad = String(idx + 1).padEnd(4);
    const codePad = r.id.padEnd(4);
    const namePad = r.name.substring(0, 23).padEnd(23);
    const dpPad = r.dPlus.toFixed(4).padEnd(8);
    const dmPad = r.dMinus.toFixed(4).padEnd(8);
    const vPad = r.v.toFixed(4).padEnd(9);
    const stat = idx === 0 ? '[REKOMENDASI]' : 'Cadangan';
    text += `   #${rankPad} | ${codePad} | ${namePad} | ${dpPad} | ${dmPad} | ${vPad} | ${stat}\n`;
  });

  return text;
}

