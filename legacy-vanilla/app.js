/**
 * Kalkulator TOPSIS - Papan Tulis Keputusan & Rumus Kapur
 * Metodologi: Technique for Order of Preference by Similarity to Ideal Solution
 * Standar: Hwang & Yoon (1981)
 */

(() => {
  'use strict';

  // --- PRESETS DATASET ---
  const PRESETS = {
    laptop: {
      id: 'laptop',
      name: 'Pemilihan Laptop',
      description: 'Studi kasus standar: 3 kriteria (Harga, RAM, Baterai) dan 3 kandidat laptop.',
      tag: 'ELEKTRONIK & GADGET',
      criteria: [
        { id: 'C1', name: 'Harga (Juta Rp)', weight: 0.40, point: 40, type: 'cost' },
        { id: 'C2', name: 'RAM (GB)', weight: 0.30, point: 30, type: 'benefit' },
        { id: 'C3', name: 'Baterai (Jam)', weight: 0.30, point: 30, type: 'benefit' }
      ],
      alternatives: [
        { id: 'A1', name: 'Laptop A1', values: [8, 8, 10] },
        { id: 'A2', name: 'Laptop A2', values: [12, 16, 8] },
        { id: 'A3', name: 'Laptop A3', values: [10, 16, 12] }
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

  // --- STATE ---
  let activePresetKey = 'laptop';
  let criteria = JSON.parse(JSON.stringify(PRESETS.laptop.criteria));
  let alternatives = JSON.parse(JSON.stringify(PRESETS.laptop.alternatives));
  let weightMode = 'point'; // 'point' (Metode 100 Poin) or 'decimal' (0 - 1.00)
  let calculationResult = null;
  let sensitivityWeights = null;

  // --- DOM REFERENCES ---
  const templateCardsContainer = document.getElementById('template-cards-container');
  const activeTemplateBadge = document.getElementById('active-template-badge');
  const btnModePoint = document.getElementById('btn-mode-point');
  const btnModeDecimal = document.getElementById('btn-mode-decimal');
  const weightWarningCallout = document.getElementById('weight-warning-callout');
  const criteriaContainer = document.getElementById('criteria-container');
  const weightSumBadge = document.getElementById('weight-sum-badge');
  const weightSumText = document.getElementById('weight-sum-text');
  const matrixHeadRow = document.getElementById('matrix-head-row');
  const matrixBodyRows = document.getElementById('matrix-body-rows');
  const rankingTableBody = document.getElementById('ranking-table-body');
  const rankingStatusChip = document.getElementById('ranking-status-chip');
  const winnerName = document.getElementById('winner-name');
  const winnerScore = document.getElementById('winner-score');
  const winnerPct = document.getElementById('winner-pct');
  const winnerReason = document.getElementById('winner-reason');
  const presetSelect = document.getElementById('preset-select');
  const toastContainer = document.getElementById('toast-container');
  const sensitivitySlidersContainer = document.getElementById('sensitivity-sliders-container');
  const summaryTextPreview = document.getElementById('summary-text-preview');
  const historyListContainer = document.getElementById('history-list-container');
  const historyCountBadge = document.getElementById('history-count-badge');

  // --- TOAST UTILITY ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'warn') icon = 'warning';
    if (type === 'error') icon = 'error';

    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:18px;">${icon}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- TAB NAVIGATION ---
  function initTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');
        
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabPanes.forEach(pane => {
          if (pane.id === targetTabId) {
            pane.style.display = 'block';
            pane.classList.add('active');
          } else {
            pane.style.display = 'none';
            pane.classList.remove('active');
          }
        });

        if (targetTabId === 'tab-ekspor') {
          updateSummaryText();
        } else if (targetTabId === 'tab-riwayat') {
          renderHistory();
        }
      });
    });

    const backToCalcBtn = document.getElementById('btn-back-to-calc');
    if (backToCalcBtn) {
      backToCalcBtn.addEventListener('click', () => {
        const calcNavBtn = document.getElementById('nav-btn-kalkulator');
        if (calcNavBtn) calcNavBtn.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const loadLaptopCaseBtn = document.getElementById('btn-load-laptop-case');
    if (loadLaptopCaseBtn) {
      loadLaptopCaseBtn.addEventListener('click', () => {
        selectPreset('laptop');
        const calcNavBtn = document.getElementById('nav-btn-kalkulator');
        if (calcNavBtn) calcNavBtn.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Template Pemilihan Laptop berhasil dimuat ke kalkulator!', 'success');
      });
    }
  }

  // --- MODAL DIALOGS ---
  function setupModals() {
    // Open modal buttons
    const helpBtn = document.getElementById('btn-open-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => openModal('modal-help'));
    }

    const weightPresentationBtn = document.getElementById('btn-open-weight-presentation');
    if (weightPresentationBtn) {
      weightPresentationBtn.addEventListener('click', () => openModal('modal-weight-presentation'));
    }

    const headerResetBtn = document.getElementById('btn-header-reset');
    if (headerResetBtn) {
      headerResetBtn.addEventListener('click', () => openModal('modal-reset'));
    }

    const saveCurrentBtn = document.getElementById('btn-save-current-modal');
    if (saveCurrentBtn) {
      saveCurrentBtn.addEventListener('click', () => openModal('modal-save-history'));
    }

    const saveSnapshotBtn = document.getElementById('btn-save-snapshot');
    if (saveSnapshotBtn) {
      saveSnapshotBtn.addEventListener('click', () => openModal('modal-save-history'));
    }

    const openImportBtn = document.getElementById('btn-open-import-modal');
    if (openImportBtn) {
      openImportBtn.addEventListener('click', () => openModal('modal-import'));
    }

    // Close buttons on all modals
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    // Close when clicking modal backdrop
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Keyboard Escape key to close open modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Confirm Reset Action
    const confirmResetBtn = document.getElementById('btn-confirm-reset');
    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', () => {
        criteria = [
          { id: 'C1', name: 'Kriteria 1', weight: 0.50, point: 50, type: 'benefit' },
          { id: 'C2', name: 'Kriteria 2', weight: 0.50, point: 50, type: 'cost' }
        ];
        alternatives = [
          { id: 'A1', name: 'Kandidat Alternatif 1', values: [50, 50] },
          { id: 'A2', name: 'Kandidat Alternatif 2', values: [50, 50] }
        ];
        activePresetKey = 'custom';
        sensitivityWeights = null;
        if (presetSelect) presetSelect.value = '';
        renderAll();
        closeModal('modal-reset');
        showToast('Papan tulis berhasil dibersihkan ke kondisi awal.', 'info');
      });
    }

    // Confirm Save History Action
    const confirmSaveHistoryBtn = document.getElementById('btn-confirm-save-history');
    if (confirmSaveHistoryBtn) {
      confirmSaveHistoryBtn.addEventListener('click', () => {
        const titleInput = document.getElementById('history-session-title');
        const title = (titleInput.value || '').trim() || `Sesi Analisis ${new Date().toLocaleTimeString('id-ID')}`;
        saveToHistory(title);
        titleInput.value = '';
        closeModal('modal-save-history');
      });
    }

    // Confirm Import JSON Action
    const confirmImportBtn = document.getElementById('btn-confirm-import');
    if (confirmImportBtn) {
      confirmImportBtn.addEventListener('click', handleImportJSON);
    }
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      const firstInput = modal.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // --- TEMPLATE SELECTION (LANGKAH 0) ---
  function renderTemplateCards() {
    if (!templateCardsContainer) return;
    const presetsList = [
      PRESETS.laptop,
      PRESETS.karyawan,
      PRESETS.supplier,
      PRESETS.lokasi
    ];

    templateCardsContainer.innerHTML = presetsList.map(p => {
      const isActive = activePresetKey === p.id;
      return `
        <div class="template-card ${isActive ? 'active' : ''}" data-preset-card="${p.id}" tabindex="0" role="button" aria-pressed="${isActive}">
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">
              <span class="template-card-badge">${p.tag}</span>
              ${isActive ? '<span style="font-size:0.6875rem; color:var(--chalk-white); font-weight:700;">[AKTIF]</span>' : ''}
            </div>
            <h3 class="template-card-title">${escapeHtml(p.name)}</h3>
            <p class="template-card-desc">${escapeHtml(p.description)}</p>
          </div>
          <div style="font-size:0.6875rem; color:var(--chalk-secondary); border-top:1px dashed var(--chalk-border); padding-top:0.4rem;">
            ${p.criteria.length} Kriteria • ${p.alternatives.length} Alternatif
          </div>
        </div>
      `;
    }).join('') + `
      <div class="template-card ${activePresetKey === 'custom' ? 'active' : ''}" data-preset-card="custom" tabindex="0" role="button" aria-pressed="${activePresetKey === 'custom'}">
        <div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">
            <span class="template-card-badge">KUSTOM</span>
            ${activePresetKey === 'custom' ? '<span style="font-size:0.6875rem; color:var(--chalk-white); font-weight:700;">[AKTIF]</span>' : ''}
          </div>
          <h3 class="template-card-title">Matriks Mandiri / Baru</h3>
          <p class="template-card-desc">Mulai input kriteria dan alternatif kustom sendiri dari awal secara bebas.</p>
        </div>
        <div style="font-size:0.6875rem; color:var(--chalk-secondary); border-top:1px dashed var(--chalk-border); padding-top:0.4rem;">
          Data Bebas Ditentukan
        </div>
      </div>
    `;

    if (activeTemplateBadge) {
      if (activePresetKey === 'custom') {
        activeTemplateBadge.textContent = 'Matriks Kustom / Mandiri';
      } else if (PRESETS[activePresetKey]) {
        activeTemplateBadge.textContent = PRESETS[activePresetKey].name;
      }
    }
  }

  function selectPreset(key) {
    activePresetKey = key;
    if (key === 'custom') {
      criteria = [
        { id: 'C1', name: 'Kriteria 1', weight: 0.50, point: 50, type: 'benefit' },
        { id: 'C2', name: 'Kriteria 2', weight: 0.50, point: 50, type: 'cost' }
      ];
      alternatives = [
        { id: 'A1', name: 'Kandidat Alternatif 1', values: [50, 50] },
        { id: 'A2', name: 'Kandidat Alternatif 2', values: [50, 50] }
      ];
    } else if (PRESETS[key]) {
      const p = PRESETS[key];
      criteria = JSON.parse(JSON.stringify(p.criteria));
      alternatives = JSON.parse(JSON.stringify(p.alternatives));
      if (presetSelect) presetSelect.value = key;
    }
    sensitivityWeights = null;
    renderAll();
    showToast(`Template "${activeTemplateBadge.textContent}" aktif digunakan!`, 'success');
  }

  // --- CRITERIA MANAGEMENT & WEIGHT MODES ---
  function renderCriteria() {
    criteriaContainer.innerHTML = '';
    let totalWeight = 0;
    let totalPoint = 0;

    criteria.forEach((crit, idx) => {
      // Ensure point and weight coherence
      if (crit.point === undefined) {
        crit.point = Math.round((parseFloat(crit.weight) || 0) * 100);
      }
      const weightNum = parseFloat(crit.weight) || 0;
      const pointNum = parseFloat(crit.point) || 0;
      totalWeight += weightNum;
      totalPoint += pointNum;

      const card = document.createElement('div');
      card.className = 'criteria-card';

      let weightInputBlock = '';
      if (weightMode === 'point') {
        weightInputBlock = `
          <div class="criteria-input-group">
            <label class="criteria-label" for="crit-point-${idx}">Poin Kepentingan (0-100)</label>
            <input type="number" id="crit-point-${idx}" step="1" min="0" max="100" class="input-field text-right" data-crit-point="${idx}" value="${pointNum}">
            <span style="font-size:0.6875rem; color:var(--chalk-secondary); text-align:right;">Bobot: ${weightNum.toFixed(2)} (${pointNum}%)</span>
          </div>
        `;
      } else {
        weightInputBlock = `
          <div class="criteria-input-group">
            <label class="criteria-label" for="crit-weight-${idx}">Bobot Desimal (W)</label>
            <input type="number" id="crit-weight-${idx}" step="0.01" min="0" max="1" class="input-field text-right" data-crit-weight="${idx}" value="${weightNum}">
            <span style="font-size:0.6875rem; color:var(--chalk-secondary); text-align:right;">Setara ${pointNum} Poin</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="criteria-card-header">
          <span class="criteria-id-badge">${crit.id}</span>
          <button type="button" class="btn btn-outline btn-sm" data-action="del-crit" data-index="${idx}" title="Hapus Kriteria">
            <span class="material-symbols-outlined" style="font-size:16px;">close</span>
          </button>
        </div>
        <div class="criteria-input-group">
          <label class="criteria-label" for="crit-name-${idx}">Nama Kriteria</label>
          <input type="text" id="crit-name-${idx}" class="input-field" data-crit-name="${idx}" value="${escapeHtml(crit.name)}">
        </div>
        <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:0.5rem; align-items:flex-end;">
          ${weightInputBlock}
          <div class="criteria-input-group">
            <label class="criteria-label">Jenis Atribut</label>
            <button type="button" class="type-toggle-btn ${crit.type}" data-action="toggle-type" data-index="${idx}" title="Klik untuk beralih antara Benefit dan Cost">
              ${crit.type === 'benefit' ? '[+] Benefit' : '[-] Cost'}
            </button>
          </div>
        </div>
      `;
      criteriaContainer.appendChild(card);
    });

    // Update Weight Sum Display
    const isSumOk = Math.abs(totalWeight - 1.0) <= 0.005;
    if (weightMode === 'point') {
      weightSumText.textContent = `Total Poin: ${totalPoint} Poin (Bobot: ${totalWeight.toFixed(2)})`;
      if (!isSumOk) {
        weightSumBadge.innerHTML = `<span class="meta-chip weight-status-warn">Total: ${totalPoint} Poin (Harus 100 Poin)</span>`;
      } else {
        weightSumBadge.innerHTML = `<span class="meta-chip weight-status-ok">Total: 100 Poin (Ideal 1.00 ✓)</span>`;
      }
    } else {
      weightSumText.textContent = `Total Bobot: ${totalWeight.toFixed(2)}`;
      if (!isSumOk) {
        weightSumBadge.innerHTML = `<span class="meta-chip weight-status-warn">Total Bobot: ${totalWeight.toFixed(2)} (Perlu Dinormalisasi)</span>`;
      } else {
        weightSumBadge.innerHTML = `<span class="meta-chip weight-status-ok">Total Bobot: ${totalWeight.toFixed(2)} (Seimbang 1.00 ✓)</span>`;
      }
    }

    renderWeightWarningCallout(totalWeight, totalPoint);
  }

  // --- WEIGHT WARNING CALLOUT (PENANGANAN TOTAL BOBOT ≠ 1) ---
  function renderWeightWarningCallout(totalWeight, totalPoint) {
    if (!weightWarningCallout) return;

    if (Math.abs(totalWeight - 1.0) <= 0.005) {
      weightWarningCallout.style.display = 'none';
      return;
    }

    weightWarningCallout.style.display = 'flex';
    const isOver = totalWeight > 1.0;
    const diff = Math.abs(totalWeight - 1.0).toFixed(2);
    const caseName = isOver ? 'Kasus A: Total LEBIH dari 1' : 'Kasus B: Total KURANG dari 1';

    let tableRows = criteria.map(c => {
      const oldW = parseFloat(c.weight) || 0;
      const newW = totalWeight > 0 ? (oldW / totalWeight) : (1 / criteria.length);
      return `
        <tr>
          <td><strong>${c.id}</strong> - ${escapeHtml(c.name)}</td>
          <td class="text-right">${oldW.toFixed(2)}</td>
          <td class="text-right">${oldW.toFixed(2)} ÷ ${totalWeight.toFixed(2)}</td>
          <td class="text-right" style="color:var(--benefit-color); font-weight:700;">${newW.toFixed(3)}</td>
        </tr>
      `;
    }).join('');

    weightWarningCallout.innerHTML = `
      <div class="weight-callout-header">
        <div class="weight-callout-title">
          <span class="material-symbols-outlined">warning</span>
          <span>Perhatian: Total Bobot Saat Ini = ${totalWeight.toFixed(2)} (${isOver ? `Lebih ${diff}` : `Kurang ${diff}`})</span>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button type="button" class="btn btn-primary btn-sm" data-callout-action="normalize">
            Normalisasikan Sekarang (w_j ÷ ∑w)
          </button>
          <button type="button" class="btn btn-outline btn-sm" data-callout-action="learn">
            Lihat Panduan Bobot
          </button>
        </div>
      </div>
      <div class="weight-callout-body">
        <strong>Penjelasan Matematis (${caseName}):</strong><br>
        Berdasarkan kaidah standar metode TOPSIS, jika total bobot belum tepat 1, gunakan rumus: 
        <code style="background:var(--panel-slate-high); padding:0.1rem 0.4rem; color:var(--chalk-white);">w_j' = w_j ÷ ∑ w_j</code>
        (bobot lama dibagi total seluruh bobot lama). Nilai bobot akan disesuaikan secara proporsional tanpa mengubah rasio kepentingan relatif antar kriteria.
      </div>
      <table class="weight-comparison-table">
        <thead>
          <tr>
            <th>Kriteria</th>
            <th class="text-right">Bobot Lama</th>
            <th class="text-right">Dibagi Total</th>
            <th class="text-right">Bobot Baru (Ternormalisasi)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr style="font-weight:700; background-color:rgba(255,255,255,0.05);">
            <td>Total</td>
            <td class="text-right">${totalWeight.toFixed(2)}</td>
            <td class="text-right"></td>
            <td class="text-right" style="color:var(--benefit-color);">1,000 ✓</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function autoNormalizeWeights() {
    let sum = criteria.reduce((acc, c) => acc + (parseFloat(c.weight) || 0), 0);
    if (sum === 0) {
      const equalWeight = parseFloat((1 / criteria.length).toFixed(4));
      criteria.forEach(c => {
        c.weight = equalWeight;
        c.point = Math.round(equalWeight * 100);
      });
    } else {
      criteria.forEach(c => {
        const normalized = (parseFloat(c.weight) || 0) / sum;
        c.weight = parseFloat(normalized.toFixed(4));
        c.point = Math.round(c.weight * 100);
      });
    }
    renderCriteria();
    renderMatrixTable();
    calculateTOPSIS();
    renderSensitivitySliders();
    showToast('Seluruh bobot kriteria telah dinormalisasi otomatis (∑ W = 1.00)', 'success');
  }

  // --- MATRIX TABLE MANAGEMENT ---
  function renderMatrixTable() {
    // Header Row
    matrixHeadRow.innerHTML = `
      <th style="width:70px;">Kode</th>
      <th style="min-width:180px;">Nama Alternatif</th>
      ${criteria.map(c => `
        <th class="th-crit text-right">
          <div>${c.id}</div>
          <div style="font-size:0.6875rem; color:var(--chalk-secondary); font-weight:normal;">
            W=${c.weight} | ${c.type === 'benefit' ? '[+]' : '[-]'}
          </div>
        </th>
      `).join('')}
      <th style="width:70px;" class="text-center">Aksi</th>
    `;

    // Body Rows
    matrixBodyRows.innerHTML = '';
    alternatives.forEach((alt, rIdx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--chalk-white);">${alt.id}</td>
        <td>
          <input type="text" class="table-input" data-alt-name="${rIdx}" value="${escapeHtml(alt.name)}" aria-label="Nama Alternatif ${alt.id}">
        </td>
        ${criteria.map((c, cIdx) => {
          const val = (alt.values && alt.values[cIdx] !== undefined) ? alt.values[cIdx] : 0;
          return `
            <td>
              <input type="number" step="any" class="table-input text-right" data-cell="${rIdx},${cIdx}" value="${val}" aria-label="Nilai ${alt.id} pada ${c.id}">
            </td>
          `;
        }).join('')}
        <td class="text-center">
          <button type="button" class="btn btn-outline btn-sm" data-action="del-alt" data-index="${rIdx}" title="Hapus Alternatif">
            <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
          </button>
        </td>
      `;
      matrixBodyRows.appendChild(tr);
    });
  }

  // --- MATHEMATICAL ENGINE (TOPSIS) ---
  function calculateTOPSIS() {
    const m = alternatives.length;
    const n = criteria.length;

    if (m === 0 || n === 0) {
      rankingTableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:2rem;">Data kriteria atau alternatif belum cukup untuk dihitung.</td></tr>`;
      return;
    }

    // 1. Ambil bobot (dukung bobot sensitivitas bila sedang diuji)
    let weights = sensitivityWeights || criteria.map(c => parseFloat(c.weight) || 0);
    const sumW = weights.reduce((acc, v) => acc + v, 0);
    if (sumW > 0) {
      weights = weights.map(w => w / sumW);
    } else {
      weights = weights.map(() => 1 / n);
    }

    // 2. Siapkan Matriks Keputusan X
    const X = alternatives.map(a => {
      const row = [];
      for (let j = 0; j < n; j++) {
        row.push(parseFloat(a.values[j]) || 0);
      }
      return row;
    });

    // 3. Hitung Pembagi Euclidean per Kriteria (Langkah 1)
    const divisors = [];
    for (let j = 0; j < n; j++) {
      let sumSq = 0;
      for (let i = 0; i < m; i++) {
        sumSq += Math.pow(X[i][j], 2);
      }
      divisors.push(Math.sqrt(sumSq) || 1);
    }

    // 4. Hitung Matriks Ternormalisasi R
    const R = [];
    for (let i = 0; i < m; i++) {
      R[i] = [];
      for (let j = 0; j < n; j++) {
        R[i][j] = X[i][j] / divisors[j];
      }
    }

    // 5. Hitung Matriks Ternormalisasi Terbobot Y (Langkah 2)
    const Y = [];
    for (let i = 0; i < m; i++) {
      Y[i] = [];
      for (let j = 0; j < n; j++) {
        Y[i][j] = R[i][j] * weights[j];
      }
    }

    // 6. Tentukan Solusi Ideal Positif (A+) dan Solusi Ideal Negatif (A-) (Langkah 3)
    const A_plus = [];
    const A_minus = [];
    for (let j = 0; j < n; j++) {
      const colValues = Y.map(row => row[j]);
      const maxVal = Math.max(...colValues);
      const minVal = Math.min(...colValues);

      if (criteria[j].type === 'benefit') {
        A_plus.push(maxVal);
        A_minus.push(minVal);
      } else {
        // Cost criterion: minimum is positive ideal, maximum is negative ideal
        A_plus.push(minVal);
        A_minus.push(maxVal);
      }
    }

    // 7. Hitung Jarak Euclidean D+ dan D- (Langkah 4) & Nilai Preferensi V (Langkah 5)
    const D_plus = [];
    const D_minus = [];
    const V = [];

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

      const vi = (dP + dM) === 0 ? 0 : dM / (dP + dM);
      V.push(vi);
    }

    // 8. Susun Rangking
    const ranking = alternatives.map((alt, i) => ({
      index: i,
      id: alt.id,
      name: alt.name,
      dPlus: D_plus[i],
      dMinus: D_minus[i],
      v: V[i]
    }));

    ranking.sort((a, b) => b.v - a.v);

    calculationResult = {
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

    renderRankingOutput();
    renderStepAccordions();
  }

  // --- RENDER RANKING OUTPUT ---
  function renderRankingOutput() {
    if (!calculationResult || !calculationResult.ranking || calculationResult.ranking.length === 0) return;

    const ranking = calculationResult.ranking;
    const topAlt = ranking[0];

    // Winner spotlight
    winnerName.textContent = `${topAlt.id} : ${topAlt.name}`;
    winnerScore.textContent = topAlt.v.toFixed(4);
    winnerPct.textContent = `${(topAlt.v * 100).toFixed(1)}%`;
    winnerReason.textContent = `Memperoleh skor preferensi tertinggi (${topAlt.v.toFixed(4)}) dengan jarak terdekat ke solusi ideal positif (D+ = ${topAlt.dPlus.toFixed(4)}).`;

    rankingStatusChip.textContent = `STATUS: ${ranking.length} ALTERNATIF TERURUT`;

    // Table rows
    rankingTableBody.innerHTML = ranking.map((item, idx) => {
      const rankNum = idx + 1;
      let badgeClass = 'rank-badge-3';
      let badgeText = `#${rankNum}`;
      let rowBg = '';
      let statusDec = '<span style="color:var(--chalk-secondary);">Dipertimbangkan</span>';

      if (rankNum === 1) {
        badgeClass = 'rank-badge-1';
        badgeText = '★ JUARA 1';
        rowBg = 'style="background-color:rgba(255,255,255,0.06);"';
        statusDec = '<strong style="color:var(--chalk-white);">[REKOMENDASI UTAMA]</strong>';
      } else if (rankNum === 2) {
        badgeClass = 'rank-badge-2';
        badgeText = 'RANK 2';
        statusDec = '<span style="color:var(--chalk-primary);">Kandidat Cadangan 1</span>';
      } else if (rankNum === 3) {
        badgeClass = 'rank-badge-3';
        badgeText = 'RANK 3';
      }

      const pct = (item.v * 100).toFixed(1);

      return `
        <tr ${rowBg}>
          <td class="text-center">
            <span class="rank-badge ${badgeClass}">${badgeText}</span>
          </td>
          <td style="font-weight:700; color:var(--chalk-white);">${item.id}</td>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td class="text-right" style="color:var(--chalk-secondary);">${item.dPlus.toFixed(4)}</td>
          <td class="text-right" style="color:var(--chalk-secondary);">${item.dMinus.toFixed(4)}</td>
          <td class="text-right" style="font-weight:700; font-size:0.9375rem; color:var(--chalk-white);">${item.v.toFixed(4)}</td>
          <td>
            <div class="score-progress-wrapper">
              <div class="score-bar-bg">
                <div class="score-bar-fill ${rankNum === 1 ? 'rank-1' : ''}" style="width: ${pct}%;"></div>
              </div>
              <span style="font-size:0.75rem; width:45px; text-align:right;">${pct}%</span>
            </div>
          </td>
          <td class="text-center">${statusDec}</td>
        </tr>
      `;
    }).join('');
  }

  // --- RENDER STEP ACCORDIONS (MATHEMATICAL AUDIT) ---
  function renderStepAccordions() {
    if (!calculationResult) return;
    const { divisors, R, Y, A_plus, A_minus, D_plus, D_minus, V } = calculationResult;

    // Langkah 1
    const s1Divisors = document.getElementById('step-1-divisors');
    s1Divisors.innerHTML = `<strong>Akar Jumlah Kuadrat (Pembagi Euclidean):</strong> ` +
      criteria.map((c, j) => `${c.id} = ${divisors[j].toFixed(4)}`).join(' | ');

    const s1Head = document.getElementById('step-1-head');
    s1Head.innerHTML = `<th>Kode Alternatif</th>` + criteria.map(c => `<th class="text-right">${c.id}</th>`).join('');

    const s1Body = document.getElementById('step-1-body');
    s1Body.innerHTML = alternatives.map((a, i) => `
      <tr>
        <td style="font-weight:700; color:var(--chalk-white);">${a.id}</td>
        ${R[i].map(val => `<td class="text-right">${val.toFixed(4)}</td>`).join('')}
      </tr>
    `).join('');

    // Langkah 2
    const s2Head = document.getElementById('step-2-head');
    s2Head.innerHTML = `<th>Kode Alternatif</th>` + criteria.map((c, j) => `<th class="text-right">${c.id} (W=${calculationResult.weights[j].toFixed(2)})</th>`).join('');

    const s2Body = document.getElementById('step-2-body');
    s2Body.innerHTML = alternatives.map((a, i) => `
      <tr>
        <td style="font-weight:700; color:var(--chalk-white);">${a.id}</td>
        ${Y[i].map(val => `<td class="text-right" style="color:var(--chalk-white);">${val.toFixed(4)}</td>`).join('')}
      </tr>
    `).join('');

    // Langkah 3
    const s3Head = document.getElementById('step-3-head');
    s3Head.innerHTML = `<th>Vektor Solusi Ideal</th>` + criteria.map(c => `<th class="text-right">${c.id} [${c.type.toUpperCase()}]</th>`).join('');

    const s3Body = document.getElementById('step-3-body');
    s3Body.innerHTML = `
      <tr style="background-color:rgba(134, 239, 172, 0.08);">
        <td style="font-weight:700; color:var(--benefit-color);">[A+] Solusi Ideal Positif</td>
        ${A_plus.map(v => `<td class="text-right" style="font-weight:700; color:var(--benefit-color);">${v.toFixed(4)}</td>`).join('')}
      </tr>
      <tr style="background-color:rgba(252, 165, 165, 0.08);">
        <td style="font-weight:700; color:var(--cost-color);">[A-] Solusi Ideal Negatif</td>
        ${A_minus.map(v => `<td class="text-right" style="font-weight:700; color:var(--cost-color);">${v.toFixed(4)}</td>`).join('')}
      </tr>
    `;

    // Langkah 4 & 5
    const s4Body = document.getElementById('step-4-body');
    s4Body.innerHTML = alternatives.map((a, i) => {
      const pct = (V[i] * 100).toFixed(1);
      return `
        <tr>
          <td style="font-weight:700; color:var(--chalk-white);">${a.id} : ${escapeHtml(a.name)}</td>
          <td class="text-right">${D_plus[i].toFixed(4)}</td>
          <td class="text-right">${D_minus[i].toFixed(4)}</td>
          <td class="text-right" style="font-weight:700; color:var(--chalk-white);">${V[i].toFixed(4)}</td>
          <td>
            <div class="score-progress-wrapper">
              <div class="score-bar-bg">
                <div class="score-bar-fill" style="width:${pct}%;"></div>
              </div>
              <span style="font-size:0.75rem; width:45px; text-align:right;">${pct}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- SENSITIVITY SLIDERS ---
  function renderSensitivitySliders() {
    sensitivitySlidersContainer.innerHTML = '';
    criteria.forEach((crit, idx) => {
      const item = document.createElement('div');
      item.className = 'slider-item';
      const currentW = (sensitivityWeights ? sensitivityWeights[idx] : crit.weight) || 0;
      item.innerHTML = `
        <div class="slider-meta">
          <span style="color:var(--chalk-white); font-weight:600;">${crit.id} : ${escapeHtml(crit.name)}</span>
          <span id="slider-val-${idx}" style="color:var(--chalk-secondary);">W = ${parseFloat(currentW).toFixed(2)}</span>
        </div>
        <input type="range" class="custom-range" min="0.01" max="1.0" step="0.01" value="${currentW}" data-slider-crit="${idx}" aria-label="Simulasi Bobot ${crit.id}">
      `;
      sensitivitySlidersContainer.appendChild(item);
    });
  }

  function setupSensitivityListeners() {
    sensitivitySlidersContainer.addEventListener('input', (e) => {
      const slider = e.target.closest('[data-slider-crit]');
      if (!slider) return;

      const idx = parseInt(slider.getAttribute('data-slider-crit'), 10);
      const val = parseFloat(slider.value) || 0;

      if (!sensitivityWeights) {
        sensitivityWeights = criteria.map(c => parseFloat(c.weight) || 0);
      }
      sensitivityWeights[idx] = val;

      const label = document.getElementById(`slider-val-${idx}`);
      if (label) label.textContent = `W = ${val.toFixed(2)}`;

      calculateTOPSIS();
    });

    const resetSensBtn = document.getElementById('btn-reset-sensitivity');
    if (resetSensBtn) {
      resetSensBtn.addEventListener('click', () => {
        sensitivityWeights = null;
        renderSensitivitySliders();
        calculateTOPSIS();
        showToast('Simulasi bobot dikembalikan ke nilai kalibrasi kriteria asli.', 'info');
      });
    }
  }

  // --- EVENT LISTENERS FOR CRITERIA & MATRIX ---
  function setupInteractiveListeners() {
    // Criteria container interactions
    criteriaContainer.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-action="del-crit"]');
      if (delBtn) {
        const idx = parseInt(delBtn.getAttribute('data-index'), 10);
        if (criteria.length <= 1) {
          showToast('Jumlah kriteria minimal harus ada 1!', 'warn');
          return;
        }
        criteria.splice(idx, 1);
        alternatives.forEach(alt => {
          if (alt.values) alt.values.splice(idx, 1);
        });
        // Re-index IDs
        criteria.forEach((c, i) => c.id = `C${i + 1}`);
        sensitivityWeights = null;
        renderAll();
        showToast('Kriteria berhasil dihapus.', 'info');
        return;
      }

      const toggleBtn = e.target.closest('[data-action="toggle-type"]');
      if (toggleBtn) {
        const idx = parseInt(toggleBtn.getAttribute('data-index'), 10);
        criteria[idx].type = criteria[idx].type === 'benefit' ? 'cost' : 'benefit';
        renderCriteria();
        renderMatrixTable();
        calculateTOPSIS();
        showToast(`Jenis kriteria ${criteria[idx].id} diubah menjadi [${criteria[idx].type.toUpperCase()}].`, 'info');
      }
    });

    criteriaContainer.addEventListener('input', (e) => {
      const nameInput = e.target.closest('[data-crit-name]');
      if (nameInput) {
        const idx = parseInt(nameInput.getAttribute('data-crit-name'), 10);
        criteria[idx].name = nameInput.value;
        renderMatrixTable();
        return;
      }

      const pointInput = e.target.closest('[data-crit-point]');
      if (pointInput) {
        const idx = parseInt(pointInput.getAttribute('data-crit-point'), 10);
        const pt = parseFloat(pointInput.value) || 0;
        criteria[idx].point = pt;
        criteria[idx].weight = parseFloat((pt / 100).toFixed(4));
        sensitivityWeights = null;
        renderCriteria();
        renderMatrixTable();
        calculateTOPSIS();
        renderSensitivitySliders();
        return;
      }

      const weightInput = e.target.closest('[data-crit-weight]');
      if (weightInput) {
        const idx = parseInt(weightInput.getAttribute('data-crit-weight'), 10);
        const w = parseFloat(weightInput.value) || 0;
        criteria[idx].weight = w;
        criteria[idx].point = Math.round(w * 100);
        sensitivityWeights = null;
        renderCriteria();
        renderMatrixTable();
        calculateTOPSIS();
        renderSensitivitySliders();
      }
    });

    // Matrix rows interactions
    matrixBodyRows.addEventListener('click', (e) => {
      const delAlt = e.target.closest('[data-action="del-alt"]');
      if (delAlt) {
        const idx = parseInt(delAlt.getAttribute('data-index'), 10);
        if (alternatives.length <= 2) {
          showToast('Jumlah alternatif minimal 2 untuk perangkingan!', 'warn');
          return;
        }
        alternatives.splice(idx, 1);
        alternatives.forEach((a, i) => a.id = `A${i + 1}`);
        renderMatrixTable();
        calculateTOPSIS();
        showToast('Alternatif berhasil dihapus.', 'info');
      }
    });

    matrixBodyRows.addEventListener('input', (e) => {
      const nameInput = e.target.closest('[data-alt-name]');
      if (nameInput) {
        const idx = parseInt(nameInput.getAttribute('data-alt-name'), 10);
        alternatives[idx].name = nameInput.value;
        calculateTOPSIS();
        return;
      }

      const cellInput = e.target.closest('[data-cell]');
      if (cellInput) {
        const [rIdx, cIdx] = cellInput.getAttribute('data-cell').split(',').map(Number);
        if (!alternatives[rIdx].values) alternatives[rIdx].values = [];
        alternatives[rIdx].values[cIdx] = parseFloat(cellInput.value) || 0;
        calculateTOPSIS();
      }
    });

    // Add Criteria Button
    document.getElementById('btn-add-crit').addEventListener('click', () => {
      const newNum = criteria.length + 1;
      criteria.push({
        id: `C${newNum}`,
        name: `Kriteria Baru ${newNum}`,
        weight: 0.10,
        point: 10,
        type: 'benefit'
      });
      alternatives.forEach(alt => {
        if (!alt.values) alt.values = [];
        alt.values.push(50);
      });
      sensitivityWeights = null;
      renderAll();
      showToast(`Kriteria C${newNum} ditambahkan.`, 'success');
    });

    // Add Alternative Button
    document.getElementById('btn-add-alt').addEventListener('click', () => {
      const newNum = alternatives.length + 1;
      const defaultValues = criteria.map(() => 75);
      alternatives.push({
        id: `A${newNum}`,
        name: `Kandidat Alternatif ${newNum}`,
        values: defaultValues
      });
      renderMatrixTable();
      calculateTOPSIS();
      showToast(`Alternatif A${newNum} ditambahkan ke tabel.`, 'success');
    });

    // Normalization Buttons
    document.getElementById('btn-auto-normalize').addEventListener('click', autoNormalizeWeights);
    document.getElementById('btn-quick-normalize').addEventListener('click', autoNormalizeWeights);

    // Preset selector dropdown (if present)
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;
        selectPreset(val);
      });
    }

    // Template Cards Click Handler
    if (templateCardsContainer) {
      templateCardsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('[data-preset-card]');
        if (!card) return;
        const presetId = card.getAttribute('data-preset-card');
        selectPreset(presetId);
      });
    }

    // Weight Mode Switches
    if (btnModePoint) {
      btnModePoint.addEventListener('click', () => {
        weightMode = 'point';
        btnModePoint.classList.add('btn-primary');
        btnModePoint.classList.remove('btn-outline');
        btnModeDecimal.classList.add('btn-outline');
        btnModeDecimal.classList.remove('btn-primary');
        renderCriteria();
        showToast('Beralih ke Metode 100 Poin. Masukkan poin kepentingan (0-100).', 'info');
      });
    }

    if (btnModeDecimal) {
      btnModeDecimal.addEventListener('click', () => {
        weightMode = 'decimal';
        btnModeDecimal.classList.add('btn-primary');
        btnModeDecimal.classList.remove('btn-outline');
        btnModePoint.classList.add('btn-outline');
        btnModePoint.classList.remove('btn-primary');
        renderCriteria();
        showToast('Beralih ke Mode Desimal. Masukkan bobot dalam skala 0.00 - 1.00.', 'info');
      });
    }

    // Weight Warning Callout delegation
    if (weightWarningCallout) {
      weightWarningCallout.addEventListener('click', (e) => {
        const normBtn = e.target.closest('[data-callout-action="normalize"]');
        if (normBtn) {
          autoNormalizeWeights();
          return;
        }
        const learnBtn = e.target.closest('[data-callout-action="learn"]');
        if (learnBtn) {
          openModal('modal-weight-presentation');
        }
      });
    }

    // Solve with Chalk Button
    document.getElementById('btn-run-topsis').addEventListener('click', () => {
      calculateTOPSIS();
      document.getElementById('section-ranking').scrollIntoView({ behavior: 'smooth' });
      showToast('Perhitungan TOPSIS selesai dieksekusi.', 'success');
    });

    // Accordion Step Toggles
    document.querySelectorAll('.step-accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const stepId = header.getAttribute('data-step');
        const content = document.getElementById(stepId);
        const arrow = header.querySelector('.step-arrow');

        if (content.classList.contains('open')) {
          content.classList.remove('open');
          if (arrow) arrow.textContent = 'expand_more';
        } else {
          content.classList.add('open');
          if (arrow) arrow.textContent = 'expand_less';
        }
      });
    });

    // Toggle all steps button
    const toggleAllBtn = document.getElementById('btn-toggle-all-steps');
    if (toggleAllBtn) {
      let allOpen = false;
      toggleAllBtn.addEventListener('click', () => {
        allOpen = !allOpen;
        document.querySelectorAll('.step-accordion-content').forEach(c => {
          if (allOpen) c.classList.add('open');
          else c.classList.remove('open');
        });
        document.querySelectorAll('.step-arrow').forEach(a => {
          a.textContent = allOpen ? 'expand_less' : 'expand_more';
        });
        toggleAllBtn.textContent = allOpen ? 'Tutup Semua Langkah' : 'Buka Semua Langkah';
      });
    }
  }

  // --- HISTORY & PERSISTENCE (LOCALSTORAGE) ---
  const STORAGE_KEY = 'topsis_academic_history_v1';

  function getSavedHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveToHistory(title) {
    if (!calculationResult || !calculationResult.ranking) {
      calculateTOPSIS();
    }
    const history = getSavedHistory();
    const entry = {
      id: 'session_' + Date.now(),
      title,
      timestamp: new Date().toISOString(),
      winner: calculationResult.ranking[0] ? calculationResult.ranking[0].name : 'N/A',
      winnerScore: calculationResult.ranking[0] ? calculationResult.ranking[0].v.toFixed(4) : '0.0000',
      criteriaCount: criteria.length,
      altCount: alternatives.length,
      criteria: JSON.parse(JSON.stringify(criteria)),
      alternatives: JSON.parse(JSON.stringify(alternatives))
    };
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    renderHistory();
    showToast(`Sesi "${title}" berhasil disimpan di riwayat!`, 'success');
  }

  function renderHistory() {
    const history = getSavedHistory();
    historyCountBadge.textContent = `${history.length} Sesi`;

    if (history.length === 0) {
      historyListContainer.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:var(--chalk-secondary);">
          <span class="material-symbols-outlined" style="font-size:48px; opacity:0.5; margin-bottom:0.5rem; display:block;">history_toggle_off</span>
          <p>Belum ada riwayat perhitungan yang tersimpan.</p>
          <p style="font-size:0.75rem; margin-top:0.25rem;">Klik "Simpan Sesi Saat Ini" pada navigasi untuk mengarsipkan snapshot perhitungan Anda.</p>
        </div>
      `;
      return;
    }

    historyListContainer.innerHTML = history.map((item, idx) => {
      const dateFormatted = new Date(item.timestamp).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      return `
        <div class="history-item">
          <div>
            <div class="history-title">${escapeHtml(item.title)}</div>
            <div class="history-meta" style="margin-top:0.25rem;">
              <span>Waktu: ${dateFormatted}</span>
              <span>•</span>
              <span>Alternatif: ${item.altCount}</span>
              <span>•</span>
              <span>Kriteria: ${item.criteriaCount}</span>
              <span>•</span>
              <span style="color:var(--chalk-white);">Juara 1: ${escapeHtml(item.winner)} (V = ${item.winnerScore})</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button type="button" class="btn btn-primary btn-sm" data-action="load-history" data-index="${idx}">
              <span class="material-symbols-outlined" style="font-size:14px;">restore_page</span>
              Muat Kembali
            </button>
            <button type="button" class="btn btn-outline btn-sm" data-action="del-history" data-index="${idx}" title="Hapus Dari Riwayat">
              <span class="material-symbols-outlined" style="font-size:14px;">delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function setupHistoryListeners() {
    historyListContainer.addEventListener('click', (e) => {
      const loadBtn = e.target.closest('[data-action="load-history"]');
      if (loadBtn) {
        const idx = parseInt(loadBtn.getAttribute('data-index'), 10);
        const history = getSavedHistory();
        const item = history[idx];
        if (item) {
          criteria = JSON.parse(JSON.stringify(item.criteria));
          alternatives = JSON.parse(JSON.stringify(item.alternatives));
          sensitivityWeights = null;
          renderAll();
          const calcNavBtn = document.getElementById('nav-btn-kalkulator');
          if (calcNavBtn) calcNavBtn.click();
          showToast(`Sesi "${item.title}" berhasil dimuat kembali ke kalkulator!`, 'success');
        }
        return;
      }

      const delBtn = e.target.closest('[data-action="del-history"]');
      if (delBtn) {
        const idx = parseInt(delBtn.getAttribute('data-index'), 10);
        const history = getSavedHistory();
        history.splice(idx, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        renderHistory();
        showToast('Sesi riwayat berhasil dihapus.', 'info');
      }
    });

    const clearHistoryBtn = document.getElementById('btn-clear-history');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Bersihkan seluruh arsip riwayat perhitungan?')) {
          localStorage.removeItem(STORAGE_KEY);
          renderHistory();
          showToast('Seluruh riwayat berhasil dibersihkan.', 'info');
        }
      });
    }
  }

  // --- EXPORT TOOLS (CSV, JSON, TEXT, PRINT) ---
  function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportRankingsCSV() {
    if (!calculationResult || !calculationResult.ranking) calculateTOPSIS();
    const rows = [
      ['Peringkat', 'Kode', 'Nama Alternatif', 'Jarak Ideal (+) D+', 'Jarak Ideal (-) D-', 'Nilai Preferensi (V)', 'Persentase (%)', 'Status']
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

    const csvContent = rows.map(e => e.join(',')).join('\n');
    downloadBlob(csvContent, `topsis_ranking_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    showToast('Berkas CSV Hasil Rangking berhasil diunduh!', 'success');
  }

  function exportMatrixCSV() {
    const head = ['Kode Alternatif', 'Nama Alternatif', ...criteria.map(c => `"${c.id} - ${c.name} (${c.type})"`)];
    const rows = [head];

    alternatives.forEach(alt => {
      const row = [`"${alt.id}"`, `"${alt.name.replace(/"/g, '""')}"`];
      criteria.forEach((_, cIdx) => {
        row.push(alt.values[cIdx] !== undefined ? alt.values[cIdx] : 0);
      });
      rows.push(row);
    });

    const csvContent = rows.map(e => e.join(',')).join('\n');
    downloadBlob(csvContent, `topsis_matriks_keputusan_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    showToast('Berkas CSV Matriks Keputusan berhasil diunduh!', 'success');
  }

  function exportNormalizedCSV() {
    if (!calculationResult || !calculationResult.Y) calculateTOPSIS();
    const head = ['Kode Alternatif', 'Nama Alternatif', ...criteria.map(c => `"${c.id} (W=${c.weight})"`)];
    const rows = [head];

    alternatives.forEach((alt, i) => {
      const row = [`"${alt.id}"`, `"${alt.name.replace(/"/g, '""')}"`];
      criteria.forEach((_, j) => {
        row.push(calculationResult.Y[i][j].toFixed(6));
      });
      rows.push(row);
    });

    const csvContent = rows.map(e => e.join(',')).join('\n');
    downloadBlob(csvContent, `topsis_matriks_terbobot_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    showToast('Berkas CSV Matriks Terbobot (Y) berhasil diunduh!', 'success');
  }

  function exportProjectJSON() {
    const projectData = {
      app: 'Kalkulator TOPSIS Papan Tulis',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      criteria,
      alternatives
    };
    const jsonString = JSON.stringify(projectData, null, 2);
    downloadBlob(jsonString, `topsis_project_${Date.now()}.json`, 'application/json');
    showToast('Cadangan proyek JSON berhasil diunduh!', 'success');
  }

  function handleImportJSON() {
    const fileInput = document.getElementById('json-file-input');
    const pasteArea = document.getElementById('json-paste-area');

    function applyImportedData(data) {
      if (!data || !Array.isArray(data.criteria) || !Array.isArray(data.alternatives)) {
        throw new Error('Format berkas tidak sesuai: pastikan terdapat array criteria dan alternatives.');
      }
      criteria = data.criteria;
      alternatives = data.alternatives;
      sensitivityWeights = null;
      renderAll();
      closeModal('modal-import');
      const calcNavBtn = document.getElementById('nav-btn-kalkulator');
      if (calcNavBtn) calcNavBtn.click();
      showToast('Proyek berhasil diimpor ke papan tulis!', 'success');
    }

    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          applyImportedData(parsed);
        } catch (err) {
          showToast('Gagal mengurai file JSON: ' + err.message, 'error');
        }
      };
      reader.readAsText(fileInput.files[0]);
    } else if (pasteArea.value.trim()) {
      try {
        const parsed = JSON.parse(pasteArea.value.trim());
        applyImportedData(parsed);
      } catch (err) {
        showToast('Gagal mengurai teks JSON: ' + err.message, 'error');
      }
    } else {
      showToast('Silakan pilih file atau tempelkan teks JSON terlebih dahulu.', 'warn');
    }
  }

  function updateSummaryText() {
    if (!calculationResult || !calculationResult.ranking) calculateTOPSIS();
    const dateStr = new Date().toLocaleString('id-ID');
    const ranking = calculationResult.ranking;

    let text = `===================================================================\n`;
    text += `LAPORAN KEPUTUSAN METODE TOPSIS (ACADEMIC BLACKBOARD)\n`;
    text += `Waktu Komputasi: ${dateStr}\n`;
    text += `===================================================================\n\n`;

    text += `1. KRITERIA DAN BOBOT PREFERENSI:\n`;
    criteria.forEach((c, idx) => {
      text += `   [${c.id}] ${c.name} | Bobot: ${c.weight} | Tipe: ${c.type.toUpperCase()}\n`;
    });

    text += `\n2. REKOMENDASI TERBAIK (PERINGKAT 1):\n`;
    if (ranking.length > 0) {
      const champion = ranking[0];
      text += `   Nama Alternatif : ${champion.id} - ${champion.name}\n`;
      text += `   Skor Preferensi : V = ${champion.v.toFixed(6)} (${(champion.v * 100).toFixed(2)}%)\n`;
      text += `   Jarak Geometris : D+ = ${champion.dPlus.toFixed(6)} | D- = ${champion.dMinus.toFixed(6)}\n`;
    }

    text += `\n3. TABEL LENGKAP PERANGKINGAN ALTERNATIF:\n`;
    text += `   Rank | Kode | Nama Alternatif         | D+       | D-       | Nilai V   | Status\n`;
    text += `   -----+------+-------------------------+----------+----------+-----------+--------------------\n`;
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

    text += `\n===================================================================\n`;
    text += `Dihasilkan secara otomatis oleh Kalkulator TOPSIS Papan Tulis.\n`;

    summaryTextPreview.value = text;
  }

  function setupExportListeners() {
    const csvRankBtn = document.getElementById('btn-export-csv-rank');
    if (csvRankBtn) csvRankBtn.addEventListener('click', exportRankingsCSV);

    const csvMatrixBtn = document.getElementById('btn-export-csv-matrix');
    if (csvMatrixBtn) csvMatrixBtn.addEventListener('click', exportMatrixCSV);

    const csvNormBtn = document.getElementById('btn-export-csv-norm');
    if (csvNormBtn) csvNormBtn.addEventListener('click', exportNormalizedCSV);

    const jsonBtn = document.getElementById('btn-export-json');
    if (jsonBtn) jsonBtn.addEventListener('click', exportProjectJSON);

    const printBtn = document.getElementById('btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const copyBtn = document.getElementById('btn-copy-summary');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        updateSummaryText();
        navigator.clipboard.writeText(summaryTextPreview.value)
          .then(() => showToast('Ringkasan teks berhasil disalin ke clipboard!', 'success'))
          .catch(() => showToast('Gagal menyalin teks secara otomatis.', 'error'));
      });
    }
  }

  // --- ESCAPE HTML HELPER ---
  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- RENDER ALL PIPELINE ---
  function renderAll() {
    renderTemplateCards();
    renderCriteria();
    renderMatrixTable();
    calculateTOPSIS();
    renderSensitivitySliders();
  }

  // --- INITIALIZATION ---
  function init() {
    initTabs();
    setupModals();
    setupInteractiveListeners();
    setupSensitivityListeners();
    setupHistoryListeners();
    setupExportListeners();
    renderAll();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
