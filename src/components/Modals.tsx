import React, { useState } from 'react';
import { Criterion, Alternative } from '@/lib/topsis';

export type ActiveModal =
  | null
  | 'reset'
  | 'save-history'
  | 'import-json'
  | 'help'
  | 'weight-guide';

interface ModalsProps {
  activeModal: ActiveModal;
  onClose: () => void;
  onConfirmReset: () => void;
  onConfirmSaveHistory: (title: string) => void;
  onConfirmImportJson: (criteria: Criterion[], alternatives: Alternative[]) => void;
  onToast: (msg: string) => void;
}

export function Modals({
  activeModal,
  onClose,
  onConfirmReset,
  onConfirmSaveHistory,
  onConfirmImportJson,
  onToast
}: ModalsProps) {
  const [sessionTitle, setSessionTitle] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!activeModal) return null;

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle =
      sessionTitle.trim() || `Sesi Analisis ${new Date().toLocaleTimeString('id-ID')}`;
    onConfirmSaveHistory(cleanTitle);
    setSessionTitle('');
    onClose();
  };

  const parseAndApplyJson = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.criteria) || !Array.isArray(parsed.alternatives)) {
        setImportError('Format berkas tidak valid: wajib memuat array "criteria" dan "alternatives".');
        return;
      }
      if (parsed.criteria.length === 0 || parsed.alternatives.length < 2) {
        setImportError('Data minimal harus memiliki 1 kriteria dan 2 alternatif.');
        return;
      }
      setImportError(null);
      setJsonText('');
      onConfirmImportJson(parsed.criteria, parsed.alternatives);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Format JSON tidak dapat dibaca.';
      setImportError(`Gagal mengurai JSON: ${message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      parseAndApplyJson(content);
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!jsonText.trim()) {
      setImportError('Silakan pilih berkas JSON atau tempelkan teks JSON terlebih dahulu.');
      return;
    }
    parseAndApplyJson(jsonText.trim());
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setImportError(null);
          onClose();
        }
      }}
    >
      {activeModal === 'reset' && (
        <div className="modal-dialog">
          <div className="modal-top">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Konfirmasi Reset Matriks</h3>
            <button type="button" className="btn btn-icon-only" onClick={onClose} aria-label="Tutup dialog">
              ✕
            </button>
          </div>
          <div className="modal-content-scroll">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Apakah Anda yakin ingin mengosongkan kriteria dan alternatif saat ini? Data akan dikembalikan ke matriks dasar 2x2 agar Anda dapat menyusun kasus baru dari awal.
            </p>
          </div>
          <div className="modal-bottom">
            <button type="button" className="btn" onClick={onClose}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onConfirmReset();
                onClose();
              }}
            >
              Ya, Reset ke Matriks 2x2
            </button>
          </div>
        </div>
      )}

      {activeModal === 'save-history' && (
        <form className="modal-dialog" onSubmit={handleSaveSubmit}>
          <div className="modal-top">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Simpan Snapshot Perhitungan</h3>
            <button type="button" className="btn btn-icon-only" onClick={onClose} aria-label="Tutup dialog">
              ✕
            </button>
          </div>
          <div className="modal-content-scroll">
            <div className="field-group">
              <label htmlFor="session-title-input" className="field-label">
                Judul Sesi / Nama Studi Kasus
              </label>
              <input
                id="session-title-input"
                type="text"
                className="input-control"
                placeholder="Contoh: Evaluasi Vendor Logistik Q4"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                autoFocus
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Sesi ini akan disimpan di penyimpanan lokal peramban (Local Storage) beserta seluruh nilai matriks dan bobotnya.
            </p>
          </div>
          <div className="modal-bottom">
            <button type="button" className="btn" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-amber">
              Simpan ke Riwayat
            </button>
          </div>
        </form>
      )}

      {activeModal === 'import-json' && (
        <div className="modal-dialog">
          <div className="modal-top">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Impor Proyek TOPSIS dari JSON</h3>
            <button
              type="button"
              className="btn btn-icon-only"
              onClick={() => {
                setImportError(null);
                onClose();
              }}
              aria-label="Tutup dialog"
            >
              ✕
            </button>
          </div>
          <div className="modal-content-scroll">
            <div className="field-group">
              <label htmlFor="json-upload-input" className="field-label">
                Unggah Berkas .JSON
              </label>
              <input
                id="json-upload-input"
                type="file"
                accept=".json"
                className="input-control"
                onChange={handleFileUpload}
              />
            </div>
            <div className="field-group">
              <label htmlFor="json-paste-textarea" className="field-label">
                Atau Tempel Struktur JSON Secara Langsung
              </label>
              <textarea
                id="json-paste-textarea"
                className="input-control"
                style={{ minHeight: '130px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                placeholder='{"criteria": [...], "alternatives": [...]}'
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  if (importError) setImportError(null);
                }}
              />
            </div>
            {importError && (
              <div
                role="alert"
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--cost-bg)',
                  color: 'var(--cost-text)',
                  boxShadow: 'var(--emboss-btn)',
                  fontSize: '0.825rem',
                  fontWeight: 600
                }}
              >
                Status Kesalahan Impor: {importError}
              </div>
            )}
          </div>
          <div className="modal-bottom">
            <button
              type="button"
              className="btn"
              onClick={() => {
                setImportError(null);
                onClose();
              }}
            >
              Batal
            </button>
            <button type="button" className="btn btn-amber" onClick={handlePasteImport}>
              Terapkan Data JSON
            </button>
          </div>
        </div>
      )}

      {activeModal === 'help' && (
        <div className="modal-dialog wide">
          <div className="modal-top">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Panduan Penggunaan Studio Keputusan TOPSIS</h3>
            <button type="button" className="btn btn-icon-only" onClick={onClose} aria-label="Tutup dialog">
              ✕
            </button>
          </div>
          <div className="modal-content-scroll">
            <div className="criterion-card">
              <strong>1. Pilih Template Kasus atau Buat Matriks Baru (Langkah 0)</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Gunakan daftar skenario di kartu Langkah 0 atau melalui panel pohon kanan untuk memuat contoh studi kasus nyata (Laptop, Karyawan, Supplier, Lokasi Cabang), atau pilih Matriks Mandiri untuk menyusun dari nol.
              </p>
            </div>
            <div className="criterion-card">
              <strong>2. Kalibrasi Kriteria &amp; Jenis Atribut (Tahap 01)</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Tentukan bobot dengan <strong>Metode 100 Poin</strong> atau <strong>Mode Desimal</strong>. Pastikan polaritas tepat: <strong>[+] Benefit</strong> bila nilai semakin tinggi semakin bagus, atau <strong>[-] Cost</strong> bila nilai semakin rendah semakin menguntungkan.
              </p>
            </div>
            <div className="criterion-card">
              <strong>3. Isi Matriks Keputusan &amp; Uji Sensitivitas (Tahap 02 &amp; 03)</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Masukkan nilai riil tiap kandidat pada tabel matriks. Sistem menghitung skor preferensi (V_i) secara langsung. Anda juga dapat menggeser tuas Simulasi Sensitivitas untuk menguji ketahanan peringkat.
              </p>
            </div>
          </div>
          <div className="modal-bottom">
            <button type="button" className="btn btn-charcoal" onClick={onClose}>
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}

      {activeModal === 'weight-guide' && (
        <div className="modal-dialog wide">
          <div className="modal-top">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Kaidah Matematis Bobot &amp; Penanganan Total Bobot ≠ 1
            </h3>
            <button type="button" className="btn btn-icon-only" onClick={onClose} aria-label="Tutup dialog">
              ✕
            </button>
          </div>
          <div className="modal-content-scroll">
            <div className="charcoal-block">
              <strong style={{ color: 'var(--amber-primary)', fontSize: '0.9rem' }}>
                Mengapa Total Bobot Standar Harus Sama Dengan 1 (∑ w_j = 1)?
              </strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--charcoal-text)' }}>
                Dalam metode TOPSIS, bobot merepresentasikan proporsi kepentingan relatif tiap kriteria (setara dengan 100%). Jika total bobot yang dimasukkan lebih dari 1 (misal 1.20) atau kurang dari 1 (misal 0.80), setiap bobot dinormalisasi secara proporsional:
              </p>
              <div className="charcoal-inner-well">
                <span className="amber-code-highlight">w_j&apos; = w_j ÷ ∑ w_j</span> (Bobot lama dibagi total seluruh bobot lama)
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.875rem' }}>
              <div className="criterion-card">
                <strong>Kasus A: Total Lebih dari 1 (Contoh ∑W = 1.20)</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Harga (0.5 ÷ 1.2 = 0.417), RAM (0.4 ÷ 1.2 = 0.333), Baterai (0.3 ÷ 1.2 = 0.250). Total kembali menjadi 1.000 tanpa mengubah rasio antar kriteria.
                </p>
              </div>
              <div className="criterion-card">
                <strong>Kasus B: Total Kurang dari 1 (Contoh ∑W = 0.80)</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Harga (0.3 ÷ 0.8 = 0.375), RAM (0.2 ÷ 0.8 = 0.250), Baterai (0.3 ÷ 0.8 = 0.375). Nilai bobot terangkat secara proporsional hingga berjumlah 1.000.
                </p>
              </div>
            </div>
          </div>
          <div className="modal-bottom">
            <button
              type="button"
              className="btn btn-amber"
              onClick={() => {
                onToast('Panduan bobot selesai ditinjau.');
                onClose();
              }}
            >
              Tutup Panduan Bobot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

