import React from 'react';

interface TheoryViewProps {
  onLoadLaptopPreset: () => void;
  onBackToCalculator: () => void;
}

export function TheoryView({ onLoadLaptopPreset, onBackToCalculator }: TheoryViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      <section className="stage-card">
        <div className="stage-card-header">
          <div className="stage-card-title-row">
            <span className="step-tag step-tag-amber">TEORI MCDM</span>
            <h2 className="stage-card-heading">Prinsip Dasar &amp; Rumus Metode TOPSIS (Hwang &amp; Yoon, 1981)</h2>
          </div>
          <span className="meta-badge">Ruang Geometris Euclidean</span>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          Metode TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) mengevaluasi alternatif
          berdasarkan prinsip bahwa kandidat terbaik harus memiliki jarak geometris terpendek dari{' '}
          <strong style={{ color: 'var(--text-strong)' }}>Solusi Ideal Positif (A+)</strong> sekaligus jarak terjauh dari{' '}
          <strong style={{ color: 'var(--text-strong)' }}>Solusi Ideal Negatif (A-)</strong>.
        </p>

        <div className="charcoal-block">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--amber-primary)' }}>
              KUTIPAN TEOREMA DASAR (HWANG &amp; YOON, 1981)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--charcoal-muted)', fontFamily: 'var(--font-mono)' }}>
              Multiple Attribute Decision Making
            </span>
          </div>
          <div className="charcoal-inner-well">
            &quot;The chosen alternative should have the shortest geometric distance from the positive ideal solution
            and the longest geometric distance from the negative ideal solution in an Euclidean space.&quot;
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="criterion-card">
            <div className="criterion-card-top">
              <span className="criterion-code">LANGKAH 01</span>
              <span className="meta-badge">Normalisasi Vektor (R)</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Mengubah berbagai skala satuan kriteria (rupiah, GB, jam, poin) menjadi nilai tanpa dimensi dalam rentang [0, 1].
            </p>
            <div className="charcoal-inner-well">
              <span className="amber-code-highlight">r_ij</span> = x_ij / √( ∑_&#123;k=1&#125;^m x_kj² )
            </div>
          </div>

          <div className="criterion-card">
            <div className="criterion-card-top">
              <span className="criterion-code">LANGKAH 02</span>
              <span className="meta-badge">Matriks Terbobot (Y)</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Mengalikan matriks ternormalisasi dengan bobot preferensi kriteria (w_j) yang telah dikalibrasi hingga ∑ w_j = 1.00.
            </p>
            <div className="charcoal-inner-well">
              <span className="amber-code-highlight">y_ij</span> = w_j · r_ij
            </div>
          </div>

          <div className="criterion-card">
            <div className="criterion-card-top">
              <span className="criterion-code">LANGKAH 03</span>
              <span className="meta-badge">Solusi Ideal (A+ &amp; A-)</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Menentukan titik acuan terbaik (A+) dan titik acuan terburuk (A-) sesuai sifat Benefit atau Cost tiap kriteria.
            </p>
            <div className="charcoal-inner-well">
              <span className="amber-code-highlight">Benefit:</span> y_j^+ = max(y_ij), y_j^- = min(y_ij)
              <br />
              <span className="amber-code-highlight">Cost:</span> y_j^+ = min(y_ij), y_j^- = max(y_ij)
            </div>
          </div>

          <div className="criterion-card">
            <div className="criterion-card-top">
              <span className="criterion-code">LANGKAH 04 &amp; 05</span>
              <span className="meta-badge">Jarak D+, D- &amp; Skor V_i</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Menghitung jarak Euclidean tiap alternatif dan menentukan kedekatan relatif V_i (semakin mendekati 1 semakin unggul).
            </p>
            <div className="charcoal-inner-well">
              D_i^+ = √( ∑ (y_ij - y_j^+)² ) | D_i^- = √( ∑ (y_ij - y_j^-)² )
              <br />
              <span className="amber-code-highlight">V_i</span> = D_i^- / ( D_i^+ + D_i^- )
            </div>
          </div>
        </div>
      </section>

      <section className="stage-card">
        <div className="stage-card-header">
          <div className="stage-card-title-row">
            <span className="step-tag">STUDI KASUS</span>
            <h2 className="stage-card-heading">Bedah Perhitungan Manual: Kasus Pemilihan Laptop</h2>
          </div>
          <button type="button" className="btn btn-amber" onClick={onLoadLaptopPreset}>
            Muat Kasus Laptop ke Kalkulator
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Bobot Kriteria: Harga = 0.40 (Cost), RAM = 0.30 (Benefit), Baterai = 0.30 (Benefit). Total bobot = 1.00.
        </p>

        <div className="table-scroll-box">
          <table className="studio-table">
            <thead>
              <tr>
                <th>Kandidat</th>
                <th style={{ textAlign: 'right' }}>Harga (Juta) [Cost]</th>
                <th style={{ textAlign: 'right' }}>RAM (GB) [Benefit]</th>
                <th style={{ textAlign: 'right' }}>Baterai (Jam) [Benefit]</th>
                <th style={{ textAlign: 'right' }}>Jarak D+</th>
                <th style={{ textAlign: 'right' }}>Jarak D-</th>
                <th style={{ textAlign: 'right' }}>Skor V_i</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>A1 (Laptop A1)</strong></td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>8</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>8</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>10</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>0.1057</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>0.0974</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>0.4796 (#2)</td>
              </tr>
              <tr>
                <td><strong>A2 (Laptop A2)</strong></td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>12</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>16</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>8</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>0.1140</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>0.1000</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>0.4673 (#3)</td>
              </tr>
              <tr className="winner-row">
                <td><strong>A3 (Laptop A3)</strong></td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>10</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>16</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>12</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>0.0456</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>0.1295</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>0.7395 (Juara 1)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="charcoal-block">
          <strong style={{ color: 'var(--amber-primary)', fontSize: '0.875rem' }}>
            Interpretasi Logika Keputusan (Mengapa A3 Unggul)
          </strong>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.84375rem', color: 'var(--charcoal-text)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>A1</strong> unggul pada harga paling murah (8 juta), tetapi tertinggal jauh pada kapasitas RAM (8 GB).</li>
            <li><strong>A2</strong> memiliki RAM besar (16 GB), namun harganya paling mahal (12 juta) dan daya tahan baterai paling singkat (8 jam).</li>
            <li><strong>A3</strong> menyeimbangkan harga menengah (10 juta) dengan RAM maksimal (16 GB) dan baterai terawet (12 jam), sehingga jaraknya ke solusi ideal positif paling rapat (D+ = 0.0456).</li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-charcoal" onClick={onBackToCalculator}>
            Kembali ke Kalkulator Matriks
          </button>
        </div>
      </section>
    </div>
  );
}

