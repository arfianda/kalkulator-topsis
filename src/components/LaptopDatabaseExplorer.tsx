'use client';

import React, { useState, useMemo } from 'react';
import {
  LAPTOP_DATABASE,
  LAPTOP_CSV_CRITERIA,
  LaptopRecord,
  laptopToAlternative
} from '@/lib/laptopDatabase';
import { Criterion, Alternative } from '@/lib/topsis';
import { IconPlus } from './Icons';

interface LaptopDatabaseExplorerProps {
  onAddSingleLaptop: (laptop: LaptopRecord) => void;
  onLoadBatchToMatrix: (criteria: Criterion[], alternatives: Alternative[], label: string) => void;
}

const PAGE_SIZE = 10;

export function LaptopDatabaseExplorer({
  onAddSingleLaptop,
  onLoadBatchToMatrix
}: LaptopDatabaseExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [minRam, setMinRam] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [page, setPage] = useState(1);

  const brands = useMemo(() => {
    const set = new Set<string>();
    LAPTOP_DATABASE.forEach((r) => set.add(r.company));
    return Array.from(set).sort();
  }, []);

  const types = useMemo(() => {
    const set = new Set<string>();
    LAPTOP_DATABASE.forEach((r) => set.add(r.typeName));
    return Array.from(set).sort();
  }, []);

  const filteredLaptops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LAPTOP_DATABASE.filter((item) => {
      if (selectedBrand !== 'ALL' && item.company !== selectedBrand) return false;
      if (selectedType !== 'ALL' && item.typeName !== selectedType) return false;
      if (minRam > 0 && item.ram < minRam) return false;
      if (maxPrice > 0 && item.priceEuros > maxPrice) return false;
      if (q) {
        const hay = `${item.id} ${item.company} ${item.product} ${item.cpuCompany} ${item.cpuModel} ${item.gpuCompany} ${item.gpuModel} ${item.os}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [searchQuery, selectedBrand, selectedType, minRam, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filteredLaptops.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedLaptops = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLaptops.slice(start, start + PAGE_SIZE);
  }, [filteredLaptops, currentPage]);

  const handleLoadTopN = (count: number) => {
    const slice = filteredLaptops.slice(0, count);
    if (slice.length < 2) return;
    const alts = slice.map((item, idx) => laptopToAlternative(item, idx));
    const clonedCriteria = JSON.parse(JSON.stringify(LAPTOP_CSV_CRITERIA));
    const filterDesc = [
      selectedBrand !== 'ALL' ? selectedBrand : 'Semua Brand',
      selectedType !== 'ALL' ? selectedType : 'Semua Tipe'
    ].join(' / ');
    onLoadBatchToMatrix(clonedCriteria, alts, `${slice.length} Laptop (${filterDesc})`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('ALL');
    setSelectedType('ALL');
    setMinRam(0);
    setMaxPrice(0);
    setPage(1);
  };

  return (
    <section className="stage-card" id="sec-database-csv">
      <div className="stage-card-header">
        <div className="stage-card-title-row">
          <span className="step-tag step-tag-amber">DATABASE CSV</span>
          <h2 className="stage-card-heading">
            Katalog Database Laptop Asli ({LAPTOP_DATABASE.length.toLocaleString('id-ID')} Unit)
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="meta-badge status-ok">
            Terfilter: {filteredLaptops.length.toLocaleString('id-ID')} / {LAPTOP_DATABASE.length.toLocaleString('id-ID')} Laptop
          </span>
          <a
            href="data/laptop_database.csv"
            download="laptop_database.csv"
            className="btn"
            style={{ minHeight: '36px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            Unduh Mentah CSV (1.275 Baris)
          </a>
        </div>
      </div>

      <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        Database ini memuat <strong>1.275 spesifikasi laptop riil</strong> (Harga Euro, RAM, Frekuensi CPU, Storage SSD/HDD, Resolusi Layar, dan Berat). Gunakan filter di bawah untuk menyaring kandidat lalu muat ke Matriks Keputusan TOPSIS (<strong>Tahap 02</strong>) dalam satu klik, atau tambahkan unit pilihan Anda satu per satu.
      </p>

      {/* Filter Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.75rem',
          padding: '1rem',
          borderRadius: 'var(--radius-card)',
          background: 'var(--pod-elevated)',
          boxShadow: 'var(--emboss-card)'
        }}
      >
        <div className="field-group">
          <label className="field-label" htmlFor="db-search">
            Cari Model / CPU / GPU
          </label>
          <input
            id="db-search"
            type="text"
            className="input-control"
            placeholder="Ketik MacBook, XPS, ROG, i7..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="db-brand">
            Brand ({brands.length})
          </label>
          <select
            id="db-brand"
            className="input-control"
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Semua Brand ({LAPTOP_DATABASE.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="db-type">
            Kategori Laptop
          </label>
          <select
            id="db-type"
            className="input-control"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">Semua Kategori</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="db-ram">
            Minimal RAM
          </label>
          <select
            id="db-ram"
            className="input-control"
            value={minRam}
            onChange={(e) => {
              setMinRam(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={0}>Semua Kapasitas RAM</option>
            <option value={8}>Minimal 8 GB</option>
            <option value={16}>Minimal 16 GB</option>
            <option value={32}>Minimal 32 GB</option>
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="db-price">
            Batas Harga (€)
          </label>
          <select
            id="db-price"
            className="input-control"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={0}>Semua Rentang Harga</option>
            <option value={500}>Maksimal €500 (Entry)</option>
            <option value={1000}>Maksimal €1.000 (Mid)</option>
            <option value={1500}>Maksimal €1.500 (High)</option>
            <option value={2500}>Maksimal €2.500 (Flagship)</option>
          </select>
        </div>
      </div>

      {/* Batch Action Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-item)',
          background: 'var(--recessed-well)',
          boxShadow: 'var(--deboss-input)'
        }}
      >
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-strong)' }}>
          Simulasi Cepat TOPSIS dari Hasil Filter ({filteredLaptops.length} unit tersedia):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-amber"
            disabled={filteredLaptops.length < 2}
            onClick={() => handleLoadTopN(6)}
            style={{ minHeight: '38px', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Muat 6 Laptop ke Matriks
          </button>
          <button
            type="button"
            className="btn btn-charcoal"
            disabled={filteredLaptops.length < 2}
            onClick={() => handleLoadTopN(12)}
            style={{ minHeight: '38px', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Muat 12 Laptop ke Matriks
          </button>
          <button
            type="button"
            className="btn"
            disabled={filteredLaptops.length < 2}
            onClick={() => handleLoadTopN(25)}
            style={{ minHeight: '38px', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Muat 25 Laptop ke Matriks
          </button>
          <button
            type="button"
            className="btn"
            onClick={resetFilters}
            style={{ minHeight: '38px', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Paginated Table */}
      <div className="table-scroll-box">
        <table className="studio-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Brand &amp; Produk</th>
              <th>Tipe &amp; OS</th>
              <th>CPU &amp; GPU</th>
              <th style={{ textAlign: 'right' }}>Harga (€) [C1]</th>
              <th style={{ textAlign: 'right' }}>RAM [C2]</th>
              <th style={{ textAlign: 'right' }}>CPU GHz [C3]</th>
              <th style={{ textAlign: 'right' }}>Storage [C4]</th>
              <th style={{ textAlign: 'right' }}>Layar [C5]</th>
              <th style={{ textAlign: 'right' }}>Berat [C6]</th>
              <th style={{ textAlign: 'center' }}>Aksi Matriks</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLaptops.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
                  Tidak ada laptop yang cocok dengan kombinasi filter saat ini.
                </td>
              </tr>
            ) : (
              paginatedLaptops.map((item) => {
                const totalStorage = item.primaryStorage + item.secondaryStorage;
                const mp = ((item.screenW * item.screenH) / 1000000).toFixed(2);
                return (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.76rem' }}>
                      {item.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-strong)' }}>
                        {item.company} {item.product}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {item.inches}&quot; {item.screen} ({item.screenW}x{item.screenH})
                      </div>
                    </td>
                    <td>
                      <span className="template-tag" style={{ display: 'inline-block', marginBottom: '0.2rem' }}>
                        {item.typeName}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.os}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                        {item.cpuCompany} {item.cpuModel}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {item.gpuCompany} {item.gpuModel}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 700 }}>
                      €{item.priceEuros.toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {item.ram} GB
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {item.cpuFreq} GHz
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {totalStorage} GB ({item.primaryStorageType})
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {mp} MP
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {item.weight} Kg
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-amber"
                        onClick={() => onAddSingleLaptop(item)}
                        style={{ minHeight: '36px', padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                        title="Tambahkan laptop ini ke Matriks Keputusan TOPSIS"
                      >
                        <IconPlus size={13} />
                        <span>Masuk Matriks</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          Halaman {currentPage} dari {totalPages} (Menampilkan {paginatedLaptops.length} dari{' '}
          {filteredLaptops.length} unit)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            type="button"
            className="btn"
            disabled={currentPage <= 1}
            onClick={() => setPage(1)}
            style={{ minHeight: '36px', padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
          >
            Awal
          </button>
          <button
            type="button"
            className="btn"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{ minHeight: '36px', padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
          >
            Sebelumnya
          </button>
          <button
            type="button"
            className="btn"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{ minHeight: '36px', padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
          >
            Berikutnya
          </button>
          <button
            type="button"
            className="btn"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(totalPages)}
            style={{ minHeight: '36px', padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
          >
            Akhir ({totalPages})
          </button>
        </div>
      </div>
    </section>
  );
}

