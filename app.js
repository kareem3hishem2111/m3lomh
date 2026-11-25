import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { applyLang, t } from './i18n.js';
const $ = s => document.querySelector(s);
const dec = s => new DOMParser().parseFromString(s, 'text/html').body.textContent;
const clean = x => String(window.DOMPurify ? dec(DOMPurify.sanitize(String(x ?? ''), { ALLOWED_TAGS: [] })) : String(x ?? '').replace(/[<>]/g, ''));
const safe = u => { try { const x = new URL(u); return x.protocol === 'https:' ? x.href : '#'; } catch { return '#'; } };
const h = (tag, a = {}, ...k) => { const e = document.createElement(tag); for (const [n, v] of Object.entries(a)) n === 'class' ? e.className = v : n.startsWith('on') ? e.addEventListener(n.slice(2), v) : e.setAttribute(n, v); k.flat().forEach(c => e.append(c instanceof Node ? c : String(c))); return e; };
const SHIELD = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><path d="M50 4 6 20v40c0 28 20 48 44 56 24-8 44-28 44-56V20z" fill="#060A12" stroke="#00F0FF" stroke-width="4"/><text x="50" y="72" font-size="40" fill="#fff" text-anchor="middle" font-family="sans-serif" font-weight="700">M3</text></svg>');
document.querySelectorAll('#logo-s,#logo-h').forEach(i => i.addEventListener('error', () => { i.src = SHIELD; }, { once: true }));

const lang = $('#lang'); lang.value = localStorage.getItem('m3_lang') || 'en';
lang.addEventListener('change', () => { applyLang(lang.value); renderAll(); }); applyLang(lang.value);

const load = async c => { try { return (await getDocs(collection(db, c))).docs.map(d => ({ id: d.id, ...d.data() })); } catch { return []; } };
let FREE = [], PRO = [], MATS = [], ROADS = [];
const DEF_ROADS = [
 { id: 'netplus', title: 'CompTIA Network+', order: 1, lessons: ['OSI & TCP/IP models', 'IP addressing & subnetting', 'Routing & switching', 'DNS, DHCP, NAT', 'Wireless & VLANs', 'Network troubleshooting'] },
 { id: 'linux', title: 'Linux Security', order: 2, lessons: ['Filesystem & permissions', 'Users, sudo & PAM', 'Processes & services', 'iptables / nftables', 'SSH hardening', 'Auditd & log analysis'] },
 { id: 'soc', title: 'SOC / Blue Team', order: 3, lessons: ['SIEM fundamentals (Splunk)', 'Windows event logs', 'Alert triage & IOCs', 'MITRE ATT&CK mapping', 'Incident response lifecycle', 'Threat hunting'] },
 { id: 'red', title: 'Red Team', order: 4, lessons: ['Recon & OSINT', 'Scanning & enumeration', 'Web exploitation (OWASP Top 10)', 'Privilege escalation', 'Active Directory attacks', 'Reporting'] }];

async function settings() {
  try {
    const s = await getDoc(doc(db, 'site_settings', 'global')); const d = s.exists() ? s.data() : {};
    document.body.dataset.theme = ['matrix', 'obsidian', 'neon', 'stealth'].includes(d.theme) ? d.theme : 'matrix';
    const box = $('#social'); box.replaceChildren();
    [['Telegram', 'telegram'], ['X / Twitter', 'twitter'], ['YouTube', 'youtube'], ['GitHub', 'github']].forEach(([n, k]) => { if (d[k] && safe(d[k]) !== '#') box.append(h('a', { href: safe(d[k]), target: '_blank', rel: 'noopener noreferrer' }, n)); });
  } catch { /* keep defaults */ }
}

const FALLBACK = [
 { cveID: 'CVE-2024-3400', vendorProject: 'Palo Alto Networks', product: 'PAN-OS', dateAdded: '2024-04-12', knownRansomwareCampaignUse: 'Unknown' },
 { cveID: 'CVE-2023-4966', vendorProject: 'Citrix', product: 'NetScaler', dateAdded: '2023-10-18', knownRansomwareCampaignUse: 'Known' },
 { cveID: 'CVE-2023-34362', vendorProject: 'Progress', product: 'MOVEit Transfer', dateAdded: '2023-06-02', knownRansomwareCampaignUse: 'Known' },
 { cveID: 'CVE-2021-44228', vendorProject: 'Apache', product: 'Log4j2', dateAdded: '2021-12-10', knownRansomwareCampaignUse: 'Known' }];
async function radar() {
  let list = null;
  try { const r = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', { cache: 'no-store' }); list = (await r.json()).vulnerabilities; const top = [...list].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 40); localStorage.setItem('m3_kev', JSON.stringify({ t: Date.now(), list: top })); }
  catch { try { list = JSON.parse(localStorage.getItem('m3_kev')).list; } catch { list = FALLBACK; } }
  list = [...list].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 10);
  const box = $('#kev'); box.replaceChildren();
  list.forEach(v => { const sev = v.knownRansomwareCampaignUse === 'Known' ? 'CRITICAL' : 'HIGH';
    box.append(h('div', { class: 'cve mono' }, h('b', {}, clean(v.cveID)), h('div', {}, clean(v.vendorProject) + ' / ' + clean(v.product)), h('div', {}, clean(v.dateAdded)), h('span', { class: 'sev ' + sev }, sev))); });
}

const RX = { md5: /^[a-f0-9]{32}$/i, sha1: /^[a-f0-9]{40}$/i, sha256: /^[a-f0-9]{64}$/i, ipv4: /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/, ipv6: /^(?=.*:.*:)[0-9a-f:]{2,39}$/i, domain: /^(?!-)([a-z0-9-]{1,63}\.)+[a-z]{2,24}$/i };
$('#ioc').addEventListener('input', e => {
  const v = e.target.value.trim(), out = $('#ioc-links'); out.replaceChildren();
  const type = Object.keys(RX).find(k => RX[k].test(v)); $('#ioc-type').textContent = v ? (type ? 'IOC: ' + type.toUpperCase() : 'Unknown') : '';
  if (!type) return; const q = encodeURIComponent(v), hash = /^(md5|sha1|sha256)$/.test(type), ip = /^ipv/.test(type);
  const L = [['VirusTotal', `https://www.virustotal.com/gui/${hash ? 'file' : ip ? 'ip-address' : 'domain'}/${q}`]];
  if (ip) L.push(['AbuseIPDB', `https://www.abuseipdb.com/check/${q}`]);
  L.push(['Shodan', ip ? `https://www.shodan.io/host/${q}` : `https://www.shodan.io/search?query=${q}`], ['URLScan.io', `https://urlscan.io/search/#${q}`]);
  L.forEach(([n, u]) => out.append(h('a', { class: 'btn', href: u, target: '_blank', rel: 'noopener noreferrer' }, n)));
});

const CMD = {
 Nmap: ['nmap -sV -sC -p {port} {ip}', 'nmap -p- -T4 --min-rate 1000 {ip}', 'nmap -sS -Pn -A -p {port} {ip}', 'nmap --script vuln -p {port} {ip}', 'nmap -sU --top-ports 100 {ip}'],
 'Wireshark Filters': ['ip.addr == {ip}', 'tcp.port == {port}', 'ip.addr == {ip} && tcp.port == {port}', 'tcp.flags.syn == 1 && tcp.flags.ack == 0', 'http.request.method == "POST"', 'dns.qry.name contains "{ip}"'],
 'Splunk SPL': ['index=* dest_ip="{ip}" dest_port={port} | stats count by src_ip', 'index=* src_ip="{ip}" | timechart span=1h count', 'index=wineventlog EventCode=4625 | stats count by Account_Name, src_ip | sort -count', 'index=* dest_port={port} | top limit=20 src_ip'],
 Linux: ['nc -zv {ip} {port}', 'curl -vk https://{ip}:{port}/', 'ss -tulpn | grep :{port}', 'sudo tcpdump -i any host {ip} and port {port} -nn', 'openssl s_client -connect {ip}:{port}'],
 PowerShell: ['Test-NetConnection {ip} -Port {port}', 'Get-NetTCPConnection -RemotePort {port} | Select RemoteAddress,State,OwningProcess', 'Resolve-DnsName {ip}', 'Get-WinEvent -FilterHashtable @{LogName="Security";Id=4625} -MaxEvents 20']
};
let curTab = 'Nmap';
const okIp = v => RX.ipv4.test(v) || RX.ipv6.test(v) || RX.domain.test(v);
function cmds() {
  const ip = okIp($('#tip').value.trim()) ? $('#tip').value.trim() : '10.10.10.10', pt = /^\d{1,5}$/.test($('#tport').value.trim()) ? $('#tport').value.trim() : '443';
  const tabs = $('#cmd-tabs'); tabs.replaceChildren(); Object.keys(CMD).forEach(k => tabs.append(h('button', { class: k === curTab ? 'on' : '', onclick: () => { curTab = k; cmds(); } }, k)));
  const out = $('#cmd-out'); out.replaceChildren();
  CMD[curTab].forEach(c => { const txt = c.replaceAll('{ip}', ip).replaceAll('{port}', pt); const b = h('button', {}, t('copy'));
    b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(txt); b.textContent = '✓'; setTimeout(() => b.textContent = t('copy'), 1200); } catch { /* ignore */ } });
    out.append(h('div', { class: 'row' }, h('pre', { class: 'mono grow' }, txt), b)); });
}
$('#tip').addEventListener('input', cmds); $('#tport').addEventListener('input', cmds);

const fmt = n => (Math.round(n * 100) / 100).toFixed(2);
const F = ['all', 'website', 'application', 'ai', 'red', 'blue', 'purple'], FL = { all: 'all', website: 'websites', application: 'apps', ai: 'ai' };
const state = { free: 'all', pro: 'all' };
const favicon = it => { if (it.img && safe(it.img) !== '#') return safe(it.img); try { return 'https://www.google.com/s2/favicons?sz=64&domain=' + new URL(safe(it.url)).hostname; } catch { return SHIELD; } };
function tabs(id, key, extra) {
  const box = $(id); box.replaceChildren();
  [...F, ...(extra ? ['bundle'] : [])].forEach(f => box.append(h('button', { class: state[key] === f ? 'on' : '', onclick: () => { state[key] = f; renderAll(); } }, FL[f] ? t(FL[f]) : f[0].toUpperCase() + f.slice(1))));
}
const match = (it, f) => f === 'all' || it.type === f || it.team === f || (f === 'bundle' && it.bundle);
function card(it, pro) {
  const fin = pro ? Number(it.price || 0) * (1 - Number(it.discount || 0) / 100) : 0;
  const c = h('div', { class: 'card', tabindex: '0' }, h('img', { src: favicon(it), alt: '', loading: 'lazy' }), h('b', {}, clean(it.title)), h('div', {}, h('span', { class: 'badge' }, clean(it.bundle ? 'bundle' : it.type)), h('span', { class: 'badge ' + clean(it.team) }, clean(it.team))), h('p', {}, clean(it.desc)));
  if (pro) c.append(h('div', {}, Number(it.discount) ? [h('span', { class: 'old' }, fmt(it.price) + ' '), h('span', { class: 'badge off' }, '-' + Number(it.discount) + '%'), ' '] : '', h('b', { class: 'mono' }, '$' + fmt(fin))));
  c.addEventListener('click', () => modal(it, pro)); return c;
}
function modal(it, pro) {
  const b = $('#modal-body'); b.replaceChildren(h('h2', {}, clean(it.title)), h('p', {}, clean(it.details || it.desc)));
  if (Array.isArray(it.items) && it.items.length) b.append(h('ul', {}, it.items.map(x => h('li', {}, clean(x)))));
  if (!pro) b.append(h('a', { class: 'btn', href: safe(it.url), target: '_blank', rel: 'noopener noreferrer' }, t('launch')));
  else {
    const base = Number(it.price || 0) * (1 - Number(it.discount || 0) / 100); let pct = 0, code = '';
    const fin = h('b', { class: 'mono' }), msg = h('span', { class: 'msg' }), inp = h('input', { placeholder: 'PROMO', maxlength: '30', class: 'mono' }), buy = h('a', { class: 'btn', target: '_blank', rel: 'noopener noreferrer' }, t('buy'));
    const upd = () => { const f = '$' + fmt(base * (1 - pct / 100)); fin.textContent = f; buy.href = 'https://wa.me/201068441784?text=' + encodeURIComponent(`Hello M3LOMH, I want to purchase: ${clean(it.title)} | Promo: ${code || 'None'} | Final Price: ${f}`); };
    const ap = h('button', {}, 'Apply'); ap.addEventListener('click', async () => {
      const v = inp.value.trim().toUpperCase(); msg.textContent = ''; pct = 0; code = '';
      if (/^[A-Z0-9_-]{2,30}$/.test(v)) { try { const s = await getDoc(doc(db, 'promo_codes', v)); if (s.exists() && s.data().active) { pct = Math.min(100, Math.max(0, Number(s.data().discount) || 0)); code = v; } else msg.textContent = 'Invalid code'; } catch { msg.textContent = 'Error'; } } else msg.textContent = 'Invalid code';
      upd(); }); upd();
    b.append(h('div', { class: 'row' }, inp, ap, msg), h('p', {}, 'Final: ', fin), buy);
  }
  $('#modal').showModal();
}
$('#modal-x').addEventListener('click', () => $('#modal').close());

const P = () => { try { return JSON.parse(localStorage.getItem('m3_prog')) || {}; } catch { return {}; } };
function roads() {
  const box = $('#roads'); box.replaceChildren(); const prog = P();
  [...(ROADS.length ? ROADS : DEF_ROADS)].sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(r => {
    const ls = (r.lessons || []).map(clean), done = new Set(prog[r.id] || []); const bar = h('i'), pc = h('span', { class: 'mono' }), cert = h('button', { class: 'btn' }, t('cert'));
    const upd = () => { const p = ls.length ? Math.round(done.size / ls.length * 100) : 0; bar.style.width = p + '%'; pc.textContent = p + '%'; cert.hidden = p < 100; };
    const wrap = h('details', { class: 'layer' }, h('summary', {}, clean(r.title)), h('div', { class: 'body' }, h('div', { class: 'row' }, h('div', { class: 'bar grow' }, bar), pc),
      ls.map((l, i) => { const cb = h('input', { type: 'checkbox' }); cb.checked = done.has(i); cb.addEventListener('change', () => { cb.checked ? done.add(i) : done.delete(i); const p = P(); p[r.id] = [...done]; localStorage.setItem('m3_prog', JSON.stringify(p)); upd(); }); return h('label', {}, cb, ' ' + l); }), cert));
    cert.addEventListener('click', () => { const n = h('input', { placeholder: 'Your name', maxlength: '40' }), go = h('button', { class: 'btn' }, 'PNG ⬇'); go.addEventListener('click', () => { if (n.value.trim()) certPng(n.value.trim(), clean(r.title)); }); $('#modal-body').replaceChildren(h('h3', {}, clean(r.title)), n, go); $('#modal').showModal(); });
    upd(); box.append(wrap);
  });
}
function certPng(name, track) {
  const c = document.createElement('canvas'); c.width = 1600; c.height = 1000; const x = c.getContext('2d');
  x.fillStyle = '#060A12'; x.fillRect(0, 0, 1600, 1000); x.strokeStyle = '#00F0FF'; x.lineWidth = 6; x.strokeRect(40, 40, 1520, 920); x.strokeStyle = '#0066FF'; x.lineWidth = 2; x.strokeRect(62, 62, 1476, 876);
  const fin = () => { x.textAlign = 'center'; x.fillStyle = '#00F0FF'; x.font = '700 64px Inter,Cairo,sans-serif'; x.fillText('CERTIFICATE OF ACHIEVEMENT', 800, 430);
    x.fillStyle = '#9FB0C6'; x.font = '32px Inter,Cairo,sans-serif'; x.fillText('This certifies that', 800, 520); x.fillStyle = '#fff'; x.font = '700 80px Inter,Cairo,sans-serif'; x.fillText(name, 800, 630);
    x.fillStyle = '#9FB0C6'; x.font = '32px Inter,Cairo,sans-serif'; x.fillText('has completed the learning track', 800, 710); x.fillStyle = '#00F0FF'; x.font = '700 52px Inter,Cairo,sans-serif'; x.fillText(track, 800, 790);
    x.fillStyle = '#9FB0C6'; x.font = '26px JetBrains Mono,monospace'; x.fillText(new Date().toISOString().slice(0, 10) + '  ·  M3LOMH — Cyber Security Engineer', 800, 890);
    const a = document.createElement('a'); a.download = 'M3LOMH-certificate.png'; a.href = c.toDataURL('image/png'); a.click(); };
  const im = new Image(); im.onload = () => { x.drawImage(im, 700, 90, 200, 200); fin(); }; im.onerror = fin; im.src = 'assets/logo.png';
}

function renderAll() {
  tabs('#free-tabs', 'free'); tabs('#pro-tabs', 'pro', true);
  $('#free-grid').replaceChildren(...FREE.filter(i => match(i, state.free)).map(i => card(i, false)));
  $('#pro-grid').replaceChildren(...PRO.filter(i => match(i, state.pro)).map(i => card(i, true)));
  $('#mats').replaceChildren(...MATS.map(m => h('div', { class: 'card' }, h('b', {}, clean(m.title)), h('p', {}, clean(m.desc)), h('span', { class: 'badge off' }, Number(m.price) > 0 ? '$' + fmt(m.price) : 'Free'), ' ', safe(m.url) !== '#' ? h('a', { href: safe(m.url), target: '_blank', rel: 'noopener noreferrer' }, t('launch')) : '')));
  cmds(); roads();
}
(async () => {
  renderAll(); radar(); settings();
  [FREE, PRO, MATS, ROADS] = await Promise.all(['free_tools', 'pro_store', 'materials', 'roadmaps'].map(load));
  $('#c-free').textContent = FREE.length; $('#c-pro').textContent = PRO.length; $('#c-mat').textContent = MATS.length; renderAll();
})();
