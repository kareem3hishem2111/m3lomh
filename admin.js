import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
const $ = s => document.querySelector(s);
const cut = (s, n) => String(s ?? '').slice(0, n);
const h = (tag, a = {}, ...k) => { const e = document.createElement(tag); for (const [n, v] of Object.entries(a)) n === 'class' ? e.className = v : n.startsWith('on') ? e.addEventListener(n.slice(2), v) : e.setAttribute(n, v); k.flat().forEach(c => e.append(c instanceof Node ? c : String(c))); return e; };
const safeUrl = u => { if (!u) return ''; try { const x = new URL(u); if (x.protocol !== 'https:') throw 0; return x.href; } catch { throw new Error('URL must be https://'); } };

if (document.body.dataset.page === 'honeypot') {
  const log = async (type, username) => { try { const d = { timestamp: serverTimestamp(), userAgent: cut(navigator.userAgent, 300), source: 'admin.html', screen: cut(screen.width + 'x' + screen.height, 30), timezone: cut(Intl.DateTimeFormat().resolvedOptions().timeZone, 60), type }; if (username) d.username = cut(username, 100); await addDoc(collection(db, 'security_logs'), d); } catch { /* silent */ } };
  log('pageview');
  $('#f').addEventListener('submit', async e => { e.preventDefault(); const u = $('#u').value; $('#p').value = ''; await log('login_attempt', u); $('#warn').hidden = false; });
}

if (document.body.dataset.page === 'vault') {
  const KEY = 'm3_lock', lock = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { n: 0, until: 0 }; } catch { return { n: 0, until: 0 }; } };
  const S = (n, o) => [n, 'select', o];
  const SCHEMA = {
    free_tools: [['title'], S('type', ['website', 'application', 'ai']), S('team', ['red', 'blue', 'purple']), ['desc', 'area'], ['details', 'area'], ['url', 'url'], ['img', 'url']],
    pro_store: [['title'], S('type', ['website', 'application', 'ai']), S('team', ['red', 'blue', 'purple']), ['desc', 'area'], ['details', 'area'], ['url', 'url'], ['img', 'url'], ['price', 'num'], ['discount', 'num'], ['bundle', 'check'], ['items', 'lines']],
    materials: [['title'], ['desc', 'area'], ['url', 'url'], ['price', 'num']],
    roadmaps: [['title'], ['order', 'num'], ['lessons', 'lines']],
    promo_codes: [['code'], ['discount', 'num'], ['active', 'check']],
    site_settings: [S('theme', ['matrix', 'obsidian', 'neon', 'stealth']), ['telegram', 'url'], ['twitter', 'url'], ['youtube', 'url'], ['github', 'url']],
    security_logs: []
  };
  let cur = 'free_tools', editId = null;
  Object.keys(SCHEMA).forEach(k => $('#col').append(h('option', { value: k }, k)));
  $('#col').addEventListener('change', () => { cur = $('#col').value; editId = null; draw(); });

  $('#lf').addEventListener('submit', async e => {
    e.preventDefault(); const L = lock(), now = Date.now();
    if (L.until > now) { $('#lmsg').textContent = `Locked. Wait ${Math.ceil((L.until - now) / 1000)}s`; return; }
    try { await signInWithEmailAndPassword(auth, $('#em').value.trim(), $('#pw').value); localStorage.removeItem(KEY); $('#pw').value = ''; }
    catch { L.n++; if (L.n >= 3) L.until = now + Math.min(3600, 30 * 2 ** (L.n - 3)) * 1000; localStorage.setItem(KEY, JSON.stringify(L)); $('#lmsg').textContent = 'Access denied' + (L.until > now ? ` — locked ${Math.ceil((L.until - now) / 1000)}s` : ''); }
  });
  $('#out').addEventListener('click', () => signOut(auth));
  onAuthStateChanged(auth, u => { $('#login').hidden = !!u; $('#panel').hidden = !u; if (u) draw(); });

  function form(data = {}) {
    const f = $('#ef'); f.replaceChildren(); $('#emsg').textContent = '';
    SCHEMA[cur].forEach(([n, ty, o]) => {
      let el; const v = data[n];
      if (ty === 'area') el = h('textarea', { rows: '3', maxlength: '4000' }); else if (ty === 'lines') el = h('textarea', { rows: '4', placeholder: 'one per line' }); else if (ty === 'select') el = h('select', {}, o.map(x => h('option', { value: x }, x)));
      else if (ty === 'check') el = h('input', { type: 'checkbox' }); else el = h('input', { type: ty === 'num' ? 'number' : 'text', step: 'any', maxlength: '500' });
      if (ty === 'check') el.checked = !!v; else if (ty === 'lines') el.value = (v || []).join('\n'); else if (v !== undefined) el.value = v;
      if (n === 'code' && editId) el.disabled = true; el.dataset.k = n; el.dataset.t = ty || 'text'; f.append(h('label', {}, n), el);
    });
    f.append(h('p', {}, h('button', { class: 'btn', type: 'submit' }, editId ? 'Update' : 'Save'), ' ', h('button', { type: 'button', onclick: () => { editId = null; form(); } }, 'Clear')));
  }
  $('#ef').addEventListener('submit', async e => {
    e.preventDefault(); const o = {};
    try {
      e.target.querySelectorAll('[data-k]').forEach(el => { const k = el.dataset.k, ty = el.dataset.t; o[k] = ty === 'check' ? el.checked : ty === 'num' ? Number(el.value || 0) : ty === 'lines' ? el.value.split('\n').map(s => s.trim()).filter(Boolean) : ty === 'url' ? safeUrl(el.value.trim()) : el.value.trim(); });
      let id = editId;
      if (cur === 'promo_codes') { id = String(o.code || editId || '').toUpperCase(); if (!/^[A-Z0-9_-]{2,30}$/.test(id)) throw new Error('Invalid code'); delete o.code; o.discount = Math.min(100, Math.max(0, o.discount)); }
      else if (cur === 'site_settings') id = 'global';
      else if (!id) id = doc(collection(db, cur)).id;
      await setDoc(doc(db, cur, id), o); editId = null; if (cur === 'site_settings') editId = 'global'; draw();
    } catch (err) { $('#emsg').textContent = err.message; }
  });

  async function draw() {
    const tb = $('#tbl'); tb.replaceChildren(); $('#emsg').textContent = '';
    if (cur === 'security_logs') {
      $('#ef').replaceChildren();
      const s = await getDocs(query(collection(db, 'security_logs'), orderBy('timestamp', 'desc'), limit(100)));
      tb.append(h('tr', {}, ['time', 'type', 'user', 'tz', 'screen', 'UA', ''].map(x => h('th', {}, x))));
      s.docs.forEach(d => { const x = d.data(); tb.append(h('tr', {}, h('td', {}, x.timestamp?.toDate?.().toISOString() || ''), h('td', {}, x.type || ''), h('td', {}, x.username || ''), h('td', {}, x.timezone || ''), h('td', {}, x.screen || ''), h('td', {}, x.userAgent || ''), h('td', {}, h('button', { onclick: async () => { await deleteDoc(d.ref); draw(); } }, '🗑')))); });
      return;
    }
    if (cur === 'site_settings') { const s = await getDoc(doc(db, 'site_settings', 'global')); editId = 'global'; form(s.exists() ? s.data() : {}); return; }
    if (!editId) form();
    const s = await getDocs(collection(db, cur));
    s.docs.forEach(d => { const x = d.data(); tb.append(h('tr', {}, h('td', {}, d.id), h('td', {}, x.title || (x.discount !== undefined ? x.discount + '%' : '')), h('td', {},
      h('button', { onclick: () => { editId = d.id; form(cur === 'promo_codes' ? { ...x, code: d.id } : x); scrollTo(0, 0); } }, '✎'), ' ',
      h('button', { onclick: async () => { if (confirm('Delete?')) { await deleteDoc(d.ref); draw(); } } }, '🗑')))); });
  }
}
