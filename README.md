# Kalkulator TOPSIS Studio (Next.js App Router)

Aplikasi web interaktif untuk **Sistem Pendukung Keputusan (SPK)** menggunakan metode **TOPSIS** (*Technique for Order of Preference by Similarity to Ideal Solution* oleh Hwang & Yoon, 1981). Aplikasi ini dibangun dengan **Next.js (App Router) & TypeScript** serta mengusung tata letak **3-Panel Floating Studio** berpalet *Warm Ivory (`#F2EEE5`), Deep Charcoal (`#242424`), dan Ochre-Amber (`#CC8D51` / `#E1A46B`)* dengan tipografi **Helvetica**.

## Fitur Utama

1. **Kalkulator Matriks Interaktif (Langkah 00 s/d Tahap 03)**
   - **Langkah 00 (Preset Studi Kasus):** Pilihan cepat 4 studi kasus nyata (Pemilihan Laptop, Evaluasi Karyawan Terbaik, Pemilihan Vendor Supplier, Penentuan Lokasi Cabang) serta mode Matriks Kustom Mandiri.
   - **Tahap 01 (Kalibrasi Kriteria & Bobot):** Tambah/hapus kriteria, input bobot via **Metode 100 Poin** atau **Mode Desimal (0.00 - 1.00)**, sakelar polaritas **[+] Benefit** dan **[-] Cost**, serta deteksi & normalisasi otomatis bila $\sum W \neq 1$.
   - **Tahap 02 (Matriks Keputusan $X$):** Tabel matriks responsif dengan pembaruan kalkulasi secara langsung (*real-time*).
   - **Tahap 03 (Peringkat & Simulasi Sensitivitas):** Kartu sorotan pemenang berlatar *Deep Charcoal*, tabel peringkat lengkap dengan visualisasi rasio kedekatan, dan tuas geser *What-If Analysis* untuk menguji sensitivitas perubahan bobot.

2. **Audit Langkah Komputasi (Langkah 01 s/d 05)**
   - **Langkah 01:** Matriks Keputusan Ternormalisasi Euclidean ($R$) beserta nilai pembagi tiap kolom.
   - **Langkah 02:** Matriks Ternormalisasi Terbobot ($Y$).
   - **Langkah 03:** Vektor Solusi Ideal Positif ($A^+$) dan Negatif ($A^-$).
   - **Langkah 04 & 05:** Jarak Euclidean ($D_i^+, D_i^-$) dan Skor Kedekatan Relatif ($V_i$).

3. **Inspektor Kanan (Pohon Skenario & Peringkat Langsung)**
   - Navigasi pohon (*folder & branch tree*) untuk berpindah skenario studi kasus, melompat antar tahapan komputasi, dan memantau bar peringkat secara langsung.

4. **Landasan Teori, Riwayat Lokal, & Ekspor Multi-Format**
   - Pembahasan matematis rumus TOPSIS dan bedah perhitungan manual kasus pemilihan laptop.
   - Penyimpanan sesi riwayat perhitungan di *Local Storage* peramban.
   - Ekspor hasil ke berkas **CSV** (Peringkat, Matriks $X$, Matriks $Y$), cadangan/impor **JSON**, salin laporan teks ke clipboard, dan tata letak cetak kertas (**Print / PDF**).

## Cara Menjalankan

### Mode Pengembangan (Development)
```bash
npm run dev
```
Buka peramban di `http://localhost:3000`.

### Membangun untuk Produksi (Production Build)
```bash
npm run build
npm run start
```
