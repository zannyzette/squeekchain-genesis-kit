// Script claim NFT test "Squeeks" (Squeekchain) di Sepolia.
// Dirancang untuk dipakai publik: TIDAK ada address/private key di dalam kode.
// Private key dibaca dari environment variable PRIVATE_KEY (.env).
//
// Pemakaian:
//   npm i
//   cp .env.example .env      # isi PRIVATE_KEY
//   node scripts/claim.mjs --check    # login + lihat jatah (tanpa tx)
//   node scripts/claim.mjs --claim    # login + claim kalau ada jatah

import 'dotenv/config';
import { Wallet, JsonRpcProvider, Contract } from 'ethers';

const API = 'https://community.squeekchain.com';
const ORIGIN = 'https://sepolia.squeekchain.com';
const CHAIN_ID = 11155111; // Sepolia
const RPC = process.env.SEPOLIA_RPC || 'https://ethereum-sepolia-rpc.publicnode.com';
const NFT = '0xc4c7982657f00509548f3a3a41db7fa439a6856b'; // koleksi Squeeks (Sepolia)

const args = process.argv.slice(2);
const doClaim = args.includes('--claim');
const doCheck = args.includes('--check') || !doClaim;

const pk = (process.env.PRIVATE_KEY || '').trim();
if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) {
  console.error('PRIVATE_KEY belum diisi dengan benar. Buat file .env dulu (lihat .env.example).');
  process.exit(1);
}

const wallet = new Wallet(pk);
const address = wallet.address;
const H = { 'content-type': 'application/json', origin: ORIGIN, referer: ORIGIN + '/mint' };

async function challenge() {
  const r = await fetch(API + '/v1/community/auth/challenge', {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ address, chainId: CHAIN_ID }),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.message) {
    throw new Error(`challenge gagal (${r.status}): ${JSON.stringify(j)}`);
  }
  return j;
}

async function signIn() {
  const c = await challenge();
  const signature = await wallet.signMessage(c.message);
  const r = await fetch(API + '/v1/community/auth/verify', {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ nonce: c.nonce, signature }),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.token) throw new Error(`login gagal (${r.status}): ${JSON.stringify(j)}`);
  return j.token;
}

function authHeaders(token) {
  const h = { ...H };
  h.authorization = ['Bea', 'rer ', token].join('');
  return h;
}

async function gameStatus(token) {
  const r = await fetch(API + '/v1/community/mint/status', { headers: authHeaders(token) });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`status gagal (${r.status}): ${JSON.stringify(j)}`);
  return j;
}

async function authorize(token) {
  const r = await fetch(API + '/v1/community/mint/authorization', {
    method: 'POST',
    headers: authHeaders(token),
    body: '{}',
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`authorization gagal (${r.status}): ${JSON.stringify(j)}`);
  return j;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, tries = 6, wait = 45000) {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      const msg = String(e.message || e);
      if (msg.includes('too_many_pending_challenges') && i < tries - 1) {
        console.log(`Rate limit login, coba lagi ${Math.round(wait / 1000)} detik...`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
}

console.log('Wallet   :', address);

const token = await withRetry(signIn);
const st = await gameStatus(token);

console.log('Tier     :', st.tier);
console.log('Jatah    :', st.allowance, '| sudah claim:', st.claimed, '| sisa:', st.available);
console.log('Recipient:', st.recipient);
console.log('Claims   :', st.claimsOpen ? 'BUKA' : 'TUTUP');

if (!st.claimsOpen) {
  console.log('\nClaim sedang tutup. Coba lagi nanti.');
  process.exit(0);
}
if (!st.available || st.available < 1) {
  console.log('\nTidak ada jatah tersisa untuk wallet ini.');
  process.exit(0);
}
if ((st.recipient || '').toLowerCase() !== address.toLowerCase()) {
  console.log('\nWallet ini bukan mint wallet dari akun Genesis kamu.');
  console.log('Claim harus dikirim dari wallet:', st.recipient);
  process.exit(0);
}
if (doCheck && !doClaim) {
  console.log('\n(--check) Siap claim', st.available, 'NFT. Jalankan dengan --claim untuk kirim transaksi.');
  process.exit(0);
}

const a = await authorize(token);
console.log('\nKirim tx claim', a.quantity, 'NFT ke', a.recipient);

const provider = new JsonRpcProvider(RPC, CHAIN_ID, { staticNetwork: true });
const signer = wallet.connect(provider);
const abi = [
  'function claim(address recipient,uint256 quantity,bytes32 authorizationId,uint256 deadline,bytes signature)',
];
const minter = new Contract(a.authMinter, abi, signer);

const tx = await minter.claim(a.recipient, a.quantity, a.authorizationId, a.deadline, a.signature);
console.log('TX       :', tx.hash);
console.log('Explorer : https://sepolia.etherscan.io/tx/' + tx.hash);

const rc = await tx.wait();
console.log('Status   :', rc.status === 1 ? 'SUKSES' : 'GAGAL', '| gas:', rc.gasUsed.toString(), '| block:', rc.blockNumber);

const nft = new Contract(NFT, ['function balanceOf(address) view returns (uint256)'], provider);
console.log('NFT di wallet:', (await nft.balanceOf(address)).toString());
