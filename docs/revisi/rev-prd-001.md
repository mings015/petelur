# PRD-001-REVISION-01

# Core Operational MVP Revision

## Egg Farm Management Dashboard

---

# Document Information

| Field          | Value                  |
| -------------- | ---------------------- |
| PRD ID         | PRD-001-REVISION-01    |
| Type           | Revision / Improvement |
| Related PRD    | PRD-001                |
| Priority       | High                   |
| Status         | Draft                  |
| Target Release | Phase 1 Revision       |

---

# Objective

Melakukan perbaikan UX, rendering state, feedback user, dan konsistensi operasional pada fitur Core Operational MVP.

Fokus revisi:

- memperbaiki usability
- memperjelas relasi data
- memperbaiki state rendering
- meningkatkan feedback user
- meningkatkan consistency UI/UX

---

# Scope

## Included

- back navigation
- riwayat populasi kandang
- relation dropdown improvements
- feed stock detail page
- realtime rerender fixes
- toast notification
- confirmation dialog

---

## Excluded

- redesign UI besar
- perubahan architecture besar
- AI analytics
- offline mode

---

# GLOBAL IMPROVEMENT

# Back Navigation Button

## Objective

Menambahkan tombol back/navigation pada seluruh halaman detail dan form.

---

# Requirements

Semua halaman:

- detail
- create form
- edit form

wajib memiliki:

- tombol back

---

# UI Rules

## Position

Tombol berada:

- kiri atas halaman
- sebelum page title

---

## Behavior

Tombol:

- kembali ke halaman sebelumnya
- menggunakan browser history back

Fallback:

- redirect ke parent route jika history kosong

---

# Acceptance Criteria

✅ Semua halaman detail memiliki tombol back  
✅ Semua halaman create/edit memiliki tombol back  
✅ Navigation berjalan dengan benar

---

# MODULE 1 — Manajemen Kandang

# Issue — Population History Form Missing

## Current Problem

Fitur riwayat populasi kandang belum tersedia.

User belum dapat:

- mencatat penambahan ayam
- mencatat pengurangan ayam
- mencatat mutasi ayam
- melihat histori populasi

---

# Expected Behavior

Setiap kandang memiliki:

- histori populasi
- histori mutasi
- histori perubahan jumlah ayam

---

# Requirements

## Population History Form

Field:

- kandang
- tanggal
- tipe perubahan
- jumlah ayam
- catatan

---

# Population Change Type

Enum:

- penambahan
- pengurangan
- mutasi masuk
- mutasi keluar
- kematian

---

# Functional Requirements

## Create Population History

Owner dapat:

- menambahkan histori populasi

---

## Automatic Coop Population Update

Saat histori dibuat:

- jumlah ayam kandang otomatis terupdate

---

## Population History Display

Detail kandang wajib menampilkan:

- histori populasi
- histori mutasi
- histori kematian

---

# Acceptance Criteria

✅ Form riwayat populasi tersedia  
✅ Histori populasi tersimpan  
✅ Jumlah ayam otomatis update  
✅ Histori tampil pada detail kandang  
✅ Mobile responsive

---

# MODULE 2 — Produksi Telur

# Issue — Coop Form Shows Raw ID

## Current Problem

Pada form produksi telur:

- dropdown kandang masih menampilkan raw database ID

Contoh:

```txt
clx92js82
clx9ajs73

Hal ini membuat user sulit memahami kandang yang dipilih.

Expected Behavior

Dropdown kandang harus menampilkan:

nama kandang

Contoh:

Kandang A
Kandang Layer Timur
Kandang Produksi 1
Functional Requirements
Coop Dropdown Behavior

Dropdown kandang harus:

searchable
menampilkan nama kandang
menyimpan ID kandang secara internal
support selected state
support empty state
Display Rules

User hanya boleh melihat:

nama kandang
informasi pendukung opsional

User tidak boleh melihat:

UUID
database ID mentah
Technical Requirements
Data Mapping

Frontend wajib melakukan mapping:

{
  label: coop.name,
  value: coop.id
}
Reusable Component

Gunakan reusable component:

CoopSelect
Acceptance Criteria

✅ Dropdown menampilkan nama kandang
✅ User tidak melihat raw ID
✅ Selected value tetap menggunakan internal ID
✅ Search kandang berjalan
✅ Mobile responsive
✅ Empty state tersedia

MODULE 3 — Manajemen Pakan
Issue 1 — Feed Form Shows Raw Item ID
Current Problem

Pada form manajemen pakan:

item pakan masih menampilkan raw database ID

Contoh:

clx82hshs72
clx82hs912a

Hal ini membuat user sulit memahami item yang dipilih.

Expected Behavior

Form harus menampilkan:

nama item pakan
optional satuan
optional stok saat ini

Contoh:

Pakan Layer A
Jagung Giling
Konsentrat Premium
Requirements
Feed Item Selector

Semua dropdown/select item pakan wajib:

menampilkan nama item
menyimpan ID secara internal
tidak menampilkan raw UUID/database ID
Functional Requirements
Feed Item Search

Dropdown item pakan harus:

searchable
responsive
support selected state
support empty state
Technical Requirements
Feed Item Mapping

Frontend wajib melakukan mapping:

{
  label: feedItem.name,
  value: feedItem.id
}
Acceptance Criteria

✅ User melihat nama item pakan
✅ Raw database ID tidak tampil
✅ Selected value tetap menggunakan internal ID
✅ Search item berjalan
✅ Mobile responsive

Issue 2 — Feed Stock Detail Page Missing
Current Problem

Halaman detail stok pakan belum tersedia.

User tidak dapat:

melihat histori stok
melihat penggunaan
melihat transaksi pakan
Expected Behavior

Setiap item stok pakan memiliki halaman detail.

Requirements
Feed Stock Detail Page

Halaman detail stok wajib menampilkan:

nama item
total stok saat ini
satuan
supplier
harga terakhir
Transaction History

Menampilkan histori:

pembelian
penambahan stok
penggunaan
penyesuaian stok

Field:

tanggal
tipe transaksi
jumlah
user
Feed Usage History

Menampilkan:

kandang
jumlah penggunaan
tanggal penggunaan
Acceptance Criteria

✅ Halaman detail stok tersedia
✅ Histori transaksi tampil
✅ Histori penggunaan tampil
✅ Informasi supplier tampil
✅ Informasi harga terakhir tampil
✅ Mobile responsive

MODULE 4 — Kesehatan Ayam
Issue 1 — Vaccine Card Does Not Re-render
Current Problem

Pada fitur jadwal vaksin:

setelah tombol "Tandai Selesai" diklik
status data berubah di database
tetapi card UI tidak otomatis update

User harus:

refresh halaman manual
Expected Behavior

Setelah klik:

Tandai Selesai

UI harus:

langsung update
card berubah status
data rerender otomatis

Tanpa:

refresh manual
Technical Requirements

Gunakan salah satu:

optimistic update
router.refresh()
revalidatePath()
local state update
Acceptance Criteria

✅ Card otomatis rerender
✅ Status vaksin langsung berubah
✅ Tidak perlu refresh manual
✅ UX terasa realtime

Issue 2 — Vaccine Form Shows Coop ID Instead of Coop Name
Current Problem

Pada form tambah jadwal vaksin:

field kandang masih menampilkan raw ID

Contoh:

clx92hs82js
clx92hsj72h
Expected Behavior

Dropdown kandang harus menampilkan:

nama kandang

Contoh:

Kandang A
Kandang Layer Timur
Kandang Produksi 2
Requirements
Coop Selector

Dropdown/select kandang wajib:

menampilkan nama kandang
menyimpan ID secara internal
tidak menampilkan raw database ID
Technical Requirements
Coop Mapping

Frontend wajib melakukan mapping:

{
  label: coop.name,
  value: coop.id
}
Acceptance Criteria

✅ Nama kandang tampil pada dropdown
✅ Raw ID tidak tampil
✅ Selected value tetap menggunakan ID internal
✅ Search kandang berjalan
✅ Mobile responsive

GLOBAL UX IMPROVEMENT
Toast Notification System
Objective

Memberikan feedback visual pada seluruh aksi penting.

Requirements
Success Toast

Tampilkan saat:

create berhasil
update berhasil
delete berhasil
Error Toast

Tampilkan saat:

gagal submit
gagal update
gagal delete
Toast Examples
Success
Data berhasil disimpan
Error
Gagal menyimpan data
Technical Requirements

Gunakan:

shadcn/ui toast
Acceptance Criteria

✅ Semua create action memiliki toast
✅ Semua edit action memiliki toast
✅ Semua delete action memiliki toast
✅ Semua error memiliki feedback

Confirmation Dialog
Objective

Mencegah user melakukan aksi destruktif tanpa konfirmasi.

Requirements
Confirmation Required For

Dialog wajib digunakan untuk:

delete data
logout
Dialog Example
Delete
Apakah Anda yakin ingin menghapus data ini?
Logout
Apakah Anda yakin ingin logout?
Technical Requirements

Gunakan:

shadcn/ui alert-dialog
Acceptance Criteria

✅ Semua delete action memiliki konfirmasi
✅ Logout memiliki konfirmasi
✅ User dapat cancel action
✅ Dialog responsive di mobile

Reusable Components Recommendation
components/
 ├── common/
 │    ├── back-button.tsx
 │    ├── confirm-dialog.tsx
 │    ├── coop-select.tsx
 │    ├── feed-item-select.tsx
 │    ├── form-toast.tsx
 │    └── page-header.tsx
```
