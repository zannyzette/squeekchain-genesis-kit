# Squeekchain Genesis Kit

Tutorial + script open-source untuk ikut **Squeekchain Genesis** dan **claim NFT test "Squeeks"** di Sepolia.

> Squeekchain = blockchain proof-of-work "hamster-powered" (Squeektoshi yang lari di roda). Semua yang di repo ini masih **testnet Sepolia** — NFT-nya gratis dan tidak punya nilai uang.

Kenapa ikut sekarang: Genesis adalah daftar awal (early member). Semakin awal masuk, semakin besar peluang dapat perlakuan awal waktu mainnet — dan claim test NFT-nya gratis, cuma butuh gas Sepolia (yang juga gratis).

---

## Yang kamu butuh

| Kebutuhan | Detail |
|---|---|
| Wallet EVM | MetaMask / Rabby / wallet apa pun |
| ETH Sepolia | Buat gas. Gratis dari faucet |
| X (Twitter) | Buat daftar Genesis |
| Node.js 20+ | Cuma kalau mau pakai script (`node -v`) |

---

## Step 0 — Pahami dulu (2 menit)

1. **Genesis** = daftar member awal. Daftar pakai akun X + Discord + wallet.
2. **Squeeks** = NFT test di Sepolia. Jatah claim tergantung tier:
   - Genesis **Gold** → 6 NFT
   - Genesis **Silver** → 4 NFT
   - Member biasa → 1 NFT
3. **Claim itu gratis.** Yang keluar cuma gas Sepolia. Kalau ada yang minta bayar, itu scam.

---

## Step 1 — Join Genesis lewat referral (WAJIB, urutan ini penting)

Buka link referral ini **sebelum** connect apa pun:

```
https://squeekchain.com/genesis/dpz2gpwb
```

Urutannya:

1. Klik link di atas → halaman Genesis kebuka dengan kode referral otomatis kepasang.
2. **Connect X** (Twitter) → ikuti authorize. Ini yang bikin kamu kecatat sebagai member + referral-nya kecatat.
3. **Connect wallet** → ini jadi *mint wallet* (NFT-nya nanti dikirim ke sini).
4. Kalau ada prompt **Discord**, sambungkan juga (beberapa badge butuh ini).
5. Selesai — cek profil kamu di `https://squeekchain.com/genesis/me`.

> Catatan penting: kalau kamu connect wallet/X dulu baru buka link referral, referral-nya sering **tidak kecatat**. Jadi buka link dulu, baru connect.

---

## Step 2 — Siapin wallet + gas Sepolia

1. Tambahkan jaringan **Sepolia** ke wallet (chain ID `11155111`).
2. Ambil ETH Sepolia gratis dari faucet (pilih salah satu):
   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia
   - https://sepoliafaucet.com
   - https://www.alchemy.com/faucets/ethereum-sepolia
3. Butuh sekitar **0.0005 ETH** buat beberapa kali claim — lebih dari cukup.

---

## Step 3 — Cek jatah claim (tanpa transaksi)

### Cara A — lewat web (paling gampang)

1. Buka `https://sepolia.squeekchain.com/mint`
2. **Connect wallet** → **Sign in** (tanda tangan pesan, gratis, bukan transaksi)
3. Halaman bakal nampilin jatah kamu: `1 / 4 / 6`.

### Cara B — lewat script (buat yang mau otomatis)

```bash
git clone https://github.com/zannyzette/squeekchain-genesis-kit.git
cd squeekchain-genesis-kit
npm install
cp .env.example .env
```

Buka `.env`, isi `PRIVATE_KEY` wallet kamu (yang udah connect di Genesis). Lalu:

```bash
node scripts/claim.mjs --check
```

Contoh output:

```
Wallet   : 0x....
Tier     : none
Jatah    : 1 | sudah claim: 0 | sisa: 1
Recipient: 0x....
Claims   : BUKA

(--check) Siap claim 1 NFT. Jalankan dengan --claim untuk kirim transaksi.
```

Kalau `Recipient` beda dengan wallet kamu, artinya wallet itu bukan *mint wallet* akun Genesis kamu — claim harus dikirim dari wallet yang tertulis di situ.

---

## Step 4 — Claim

### Cara A — lewat web

Di halaman yang sama, klik **Claim your Squeeks** → approve di wallet → selesai.

### Cara B — lewat script

```bash
node scripts/claim.mjs --claim
```

Output kalau sukses:

```
TX       : 0x....
Explorer : https://sepolia.etherscan.io/tx/0x....
Status   : SUKSES | gas: 299319 | block: 12068861
NFT di wallet: 1
```

---

## Step 5 — Verifikasi (jangan cuma percaya tampilan web)

- Transaksi: `https://sepolia.etherscan.io/tx/<TX_HASH>`
- Cek NFT masuk: buka `https://sepolia.squeekchain.com/portfolio` atau cek `balanceOf` wallet kamu di kontrak `0xc4c7982657f00509548f3a3a41db7fa439a6856b`.
- Kalau `Status: SUKSES` tapi NFT belum kelihatan, refresh metadata wallet (biasanya perlu beberapa menit).

---

## Step 6 — Naikin tier (opsional)

Tier **Gold (6)** dan **Silver (4)** dikasih ke pemegang NFT Genesis, bukan ke semua orang. Kalau tier kamu `none`, jatah kamu tetap 1 dan itu normal.

Yang bisa kamu lakuin:

- Pantau drop/komunitas Genesis berikutnya.
- Simpan wallet yang sama — tier dihitung dari **akun** (holdings), bukan dari wallet yang kamu pakai claim.
- Claim yang udah kamu ambil **selalu dihitung**, jadi naik tier cuma nambah selisihnya (misal dari 1 → 4, kamu bisa claim 3 lagi).

---

## Step 7 — Pantau hamster (bonus, biar nggak ketinggalan)

- Dashboard komunitas: `https://squeek.mfbrat.com` — nunjukin roda lagi jalan atau tidur, height block, SQK minted.
- Game gratis "Squeek or Sleep": `https://squeekorsleep.mfbrat.com` — nebak hamster nap / jog / zoomies tiap 10 menit, 12 call/hari. Nggak ada bayaran, cuma poin.

---

## FAQ & troubleshooting

**"This wallet isn't in Genesis yet"**
Wallet yang kamu connect belum ke-link ke akun Genesis. Login pakai X dulu di `https://squeekchain.com/genesis/dpz2gpwb`, lalu connect wallet dari situ.

**"None of your wallets can receive on Sepolia"**
Wallet kamu belum di-set sebagai mint wallet, atau wallet-nya belum ada di jaringan Sepolia. Tambahin Sepolia di wallet, lalu set mint wallet di halaman profil.

**Login gagal / `too_many_pending_challenges`**
Itu rate limit dari server: satu IP cuma boleh punya 1 challenge login yang belum dipakai. Tunggu ±15 menit, jangan spam klik sign-in. Script di repo ini otomatis nunggu dan retry.

**Jatah 0 padahal baru daftar**
Claim bisa lagi ditutup sementara (`Claims: TUTUP`), atau kuota koleksi habis. Cek lagi nanti.

**Butuh gas berapa?**
Sekitar 300k gas per NFT. Di Sepolia biayanya nyaris nol.

---

## Keamanan

- Script ini **tidak mengirim private key ke mana pun**. Semua tanda tangan & transaksi dibuat lokal di komputer kamu.
- `.env` sudah masuk `.gitignore`. Jangan pernah commit private key.
- Pakai wallet baru/terpisah buat testnet. Jangan pakai wallet utama yang isinya aset beneran.
- Tidak ada yang perlu bayar buat claim. Mint-nya gratis.

---

## Isi repo

```
squeekchain-genesis-kit/
├── README.md            # tutorial ini
├── scripts/claim.mjs    # login + cek jatah + claim (satu file)
├── package.json
├── .env.example
└── .gitignore
```

## Lisensi

MIT — silakan dipakai, dimodifikasi, dan dibagikan.
