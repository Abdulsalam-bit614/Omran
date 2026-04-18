// app.js — script عادي (لا module)
// كل المتغيرات على window حتى يشوفها firebase.js

// ══ togglePass fallback — يشتغل حتى لو module لم يُحمَّل بعد ══
window.togglePass = window.togglePass || function (inp, btnId) {
  try {
    var el = document.getElementById(inp);
    var b = document.getElementById(btnId);
    if (!el) return;
    var isPass = el.type === 'password';
    el.type = isPass ? 'text' : 'password';
    if (b) b.innerHTML = isPass
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  } catch (e) {}
};

// ══ STATE — على window ══
window.curUser = null;
window.curUserData = null;
window.curType = null;
window.selTypeVal = null;
window.curPro = null;
window.curChatId = null;
window.prevPg = 'pg-home';
window.isRec = false; window.recInt = null; window.recSecs = 0; window.playBtn = null;
window.apSpecVal = null; window.amSpecVal = null;
window.availOn = true; window.amAvailOn = true;
window.selStar = 0; window.revProId = null; window._editRevIdx = null;
window.homeFilt = ''; window.homeSearchV = ''; window.filterCity = ''; window.filterVillage = '';
window.brCity = ''; window.brVillage = '';
window.amAvatarData = null; window.apAvatarData = null;
window.reqSpec = '';

// ══ CONFIG ══
const ADMIN_PHONE = '0900000000', ADMIN_PASS = 'admin123';
let appConfig = { waPhone: '+963912345678', phone: '+963912345678', email1: 'omran.daraa@gmail.com', appName: 'عُمران – سوريا' };
let epProId = null, epAvailOn = true;

// ══ DATA ══
let specialties = [
  { id: 'بلاط وسيراميك', icon: '🔲', type: 'worker' },
  { id: 'دهان وديكور', icon: '🖌️', type: 'worker' },
  { id: 'كهرباء', icon: '⚡', type: 'worker' },
  { id: 'صحي وسباكة', icon: '🚰', type: 'worker' },
  { id: 'بناء وترميم', icon: '🏗️', type: 'worker' },
  { id: 'جبس وديكور', icon: '🏛️', type: 'worker' },
  { id: 'حديد وألمنيوم', icon: '🔩', type: 'worker' },
  { id: 'نجارة', icon: '🪵', type: 'worker' },
  { id: 'محل مواد بناء', icon: '🏪', type: 'store' },
  { id: 'هندسة مدنية', icon: '📐', type: 'engineer' },
  { id: 'مقاولات', icon: '🏢', type: 'contractor' },
];

// Demo data — كل ids أرقام، لكن Firestore يتعامل معها كـ String
let professionals = [
  { id: 'demo-1', name: 'أبو محمد البلاط', type: 'worker', spec: 'بلاط وسيراميك', desc: 'متخصص في تركيب البلاط والسيراميك لأكثر من 12 سنة.', city: 'درعا', area: 'درعا البلد', exp: '10-15 سنة', phone: '0912345678', wa: '0912345678', avail: true, verified: true, mine: false, avatar: null, photos: [], reviews: [{ author: 'أحمد خليل', stars: 5, text: 'شغل ممتاز ونظيف', date: 'قبل ٣ أيام' }, { author: 'محمد', stars: 4, text: 'معلم شاطر', date: 'قبل أسبوع' }] },
  { id: 'demo-2', name: 'أستاذ خالد الدهان', type: 'worker', spec: 'دهان وديكور', desc: 'دهان داخلي وخارجي وورق حائط.', city: 'درعا', area: 'المزيريب', exp: '5-10 سنوات', phone: '0923456789', wa: '0923456789', avail: true, verified: true, mine: false, avatar: null, photos: [], reviews: [{ author: 'سامر', stars: 5, text: 'أحسن دهان بالمنطقة', date: 'قبل يومين' }] },
  { id: 'demo-3', name: 'معلم سامر الكهربائي', type: 'worker', spec: 'كهرباء', desc: 'كهرباء منازل وتجاري وصيانة شاملة.', city: 'درعا', area: 'نوى', exp: '10-15 سنة', phone: '0934567890', wa: '', avail: false, verified: true, mine: false, avatar: null, photos: [], reviews: [{ author: 'خالد', stars: 5, text: 'سريع وأمين', date: 'قبل ٥ أيام' }] },
  { id: 'demo-4', name: 'أبو حسن الصحي', type: 'worker', spec: 'صحي وسباكة', desc: 'سباكة وصحي وتركيب حمامات.', city: 'درعا', area: 'درعا البلد', exp: '5-10 سنوات', phone: '0945678901', wa: '0945678901', avail: true, verified: false, mine: false, avatar: null, photos: [], reviews: [] },
  { id: 'demo-5', name: 'مواد البناء الوطني', type: 'store', spec: 'محل مواد بناء', desc: 'جميع مواد البناء مع توصيل مجاني.', city: 'درعا', area: 'شارع الثورة', exp: 'أكثر من 15 سنة', phone: '0956789012', wa: '0956789012', avail: true, verified: true, mine: false, avatar: null, photos: [], reviews: [{ author: 'عميل', stars: 4, text: 'أسعار معقولة', date: 'قبل ٣ أيام' }] },
  { id: 'demo-6', name: 'م. أحمد الحايك', type: 'engineer', spec: 'هندسة مدنية', desc: 'تصميم منازل وإشراف هندسي.', city: 'درعا', area: 'درعا', exp: 'أكثر من 15 سنة', phone: '0967890123', wa: '0967890123', avail: true, verified: true, mine: false, avatar: null, photos: [], reviews: [{ author: 'أبو سامر', stars: 5, text: 'مهندس محترف', date: 'قبل أسبوعين' }] },
];

let chats = { 'demo-1': { msgs: [{ out: false, text: 'مرحبا بدي شغل بلاط', time: '10:20', tp: 'text' }, { out: true, text: 'أهلاً كم متر؟', time: '10:21', tp: 'text' }] } };
let unread = { 'demo-1': 1 };
let myRequests = [];

const TBG = { worker: '#e8f0fe', store: '#d1fae5', engineer: '#ede9fe', contractor: '#fef3c7', client: '#f1f5f9', admin: '#fee2e2' };
const TCL = { worker: '#1a56db', store: '#065f46', engineer: '#5b21b6', contractor: '#92400e', client: '#475569', admin: '#dc2626' };
const TEM = { worker: '🔨', store: '🏪', engineer: '📐', contractor: '🏗️', client: '👤', admin: '⚙️' };
const TLB = { worker: 'معلم حرفي', store: 'محل مواد بناء', engineer: 'مهندس', contractor: 'متعهد', client: 'عميل', admin: 'أدمن' };

// ══ HELPERS ══
function nowT() { const d = new Date(); return d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
function uid() { return 'local-' + Date.now() + Math.floor(Math.random() * 999); }
function avgRating(p) { if (!p.reviews?.length) return 0; return p.reviews.reduce((s, r) => s + r.stars, 0) / p.reviews.length; }
function starsHTML(n, sm) { return [1, 2, 3, 4, 5].map(i => `<span class="star${sm ? ' star-sm' : ''}" style="pointer-events:none;color:${i <= Math.round(n) ? '#f59e0b' : '#e2e8f0'}">★</span>`).join(''); }
function getPhotosFromGrid(gridId) { const grid = document.getElementById(gridId); if (!grid) return []; return Array.from(grid.querySelectorAll('img')).map(img => img.src); }
function viewPhoto(src) { document.getElementById('mo-photo-img').src = src; openModal('mo-photo'); }
function getWaLink(msg) { return `https://wa.me/${appConfig.waPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg || '')}`; }

function previewAvatar(inp, targetId) {
  const file = inp.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const el = document.getElementById(targetId); if (!el) return;
    el.style.backgroundImage = `url(${e.target.result})`;
    el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; el.textContent = '';
    if (targetId === 'ap-avatar-preview') window.apAvatarData = e.target.result;
    if (targetId === 'am-avatar-preview') window.amAvatarData = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addPhotos(inp, gridId) {
  const grid = document.getElementById(gridId); if (!grid) return;
  const existing = grid.querySelectorAll('img').length;
  Array.from(inp.files).slice(0, 50 - existing).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img'); img.src = e.target.result; img.className = 'photo-thumb';
      img.onclick = () => viewPhoto(e.target.result);
      grid.insertBefore(img, grid.querySelector('label'));
      if (grid.querySelectorAll('img').length >= 50) grid.querySelector('label').style.display = 'none';
    };
    reader.readAsDataURL(file);
  });
}

// ══ COLOR THEME ══
function setColor(main, dark, light, el) {
  document.documentElement.style.setProperty('--blue', main);
  document.documentElement.style.setProperty('--blue-dk', dark);
  document.documentElement.style.setProperty('--blue-lt', light);
  document.documentElement.style.setProperty('--blue-mid', main);
  document.getElementById('meta-theme').content = main;
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  if (el) el.classList.add('active');
  try { localStorage.setItem('omran-color', JSON.stringify({ main, dark, light })); } catch (e) {}
}
try { const c = JSON.parse(localStorage.getItem('omran-color')); if (c) setColor(c.main, c.dark, c.light, null); } catch (e) {}

// ══ NAV ══
function go(id) {
  window.prevPg = document.querySelector('.page.active')?.id || 'pg-home';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id); if (!el) return;
  el.classList.add('active');
  const fns = {
    'pg-home': renderPros, 'pg-browse': renderBrowse, 'pg-request': renderRequest,
    'pg-myprofile': renderMyProfile, 'pg-chat': () => renderChatList(),
    'pg-newchat': () => ncSearch(''),
    'pg-admin': renderAdmin, 'pg-addprofile': buildApSpecs, 'pg-dashboard': renderDashboard,
    'pg-addmember': () => { buildAmSpecs(); buildCurSpecs(); window.amAvatarData = null; },
    'pg-addspec': buildCurSpecs,
    'pg-settings': () => { if (window.curUser) { const n = document.getElementById('set-name'); if (n) n.value = window.curUserData?.name || ''; } },
  };
  if (fns[id]) fns[id]();
  window.scrollTo(0, 0);
}
function goBack() { go(window.prevPg); }
function success(icon, title, msg) {
  document.getElementById('suc-icon').textContent = icon;
  document.getElementById('suc-title').textContent = title;
  document.getElementById('suc-msg').textContent = msg;
  go('pg-success');
}

// ══ PRO CARD ══
function proCard(p) {
  const bg = TBG[p.type] || '#f1f5f9', tc = TCL[p.type] || '#475569', em = TEM[p.type] || '👤';
  const avg = avgRating(p), cnt = p.reviews?.length || 0;
  const avStyle = p.avatar ? `background-image:url(${p.avatar});background-size:cover;background-position:center` : `background:${bg};color:${tc}`;
  return `<div class="pc" onclick="openDetail('${p.id}')">
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:10px">
      <div class="av" style="width:46px;height:46px;font-size:20px;${avStyle}">${p.avatar ? '' : em}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
          <span style="font-weight:800;font-size:15px">${p.name}</span>
          ${p.verified ? '<span class="verified-badge">✓ موثّق</span>' : ''}
          ${p.avail ? '<span class="badge b-green">متاح</span>' : '<span class="badge b-red">مشغول</span>'}
        </div>
        <div style="font-size:13px;color:var(--text2)">${p.spec}</div>
        <div style="font-size:12px;color:var(--text3)">📍 ${p.area}${p.city ? ' – ' + p.city : ''}</div>
        <div style="font-size:11px;color:var(--blue);font-weight:700">#${p.userCode || '—'}</div>
      </div>
      <div style="text-align:left;flex-shrink:0">
        ${avg ? `<div style="display:flex;align-items:center;gap:3px"><span style="color:#f59e0b">★</span><span style="font-size:13px;font-weight:700">${avg.toFixed(1)}</span></div><div style="font-size:11px;color:var(--text3)">(${cnt})</div>` : '<div style="font-size:12px;color:var(--text3)">جديد</div>'}
        <div style="font-size:11px;color:var(--text3);margin-top:3px">${p.exp}</div>
      </div>
    </div>
    ${p.desc ? `<p style="font-size:13px;color:var(--text2);line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${p.desc}</p>` : ''}
    ${p.photos?.length ? `<div style="display:flex;gap:4px;margin-bottom:10px;overflow:hidden;border-radius:8px">${p.photos.slice(0, 3).map(src => `<img src="${src}" style="width:${100 / Math.min(3, p.photos.length)}%;aspect-ratio:1;object-fit:cover">`).join('')}</div>` : ''}
    <div style="display:flex;gap:8px">
      <button class="btn-call btn-sm" style="flex:1" onclick="event.stopPropagation();location.href='tel:${p.phone}'">📞 اتصل</button>
      ${p.wa ? `<a class="btn-wa btn-sm" style="flex:1" href="https://wa.me/963${p.wa.slice(1)}" onclick="event.stopPropagation()">واتساب</a>` : ''}
      <button class="btn btn-primary btn-sm" style="flex:1;padding:9px" onclick="event.stopPropagation();openChatWith('${p.id}')">💬</button>
    </div>
  </div>`;
}

// ══ RENDER PROS ══
function renderPros() {
  const el = document.getElementById('pros-list'); if (!el) return;
  const list = professionals.filter(p => {
    const f1 = !window.homeFilt || (p.spec.toLowerCase().includes(window.homeFilt) || p.type === window.homeFilt);
    const f2 = !window.homeSearchV || (p.name.includes(window.homeSearchV) || p.spec.includes(window.homeSearchV) || p.area.includes(window.homeSearchV) || p.city?.includes(window.homeSearchV));
    const f3 = !window.filterCity || (p.city === window.filterCity || p.area?.includes(window.filterCity));
    const f4 = !window.filterVillage || (p.area?.includes(window.filterVillage) || p.area === window.filterVillage);
    return f1 && f2 && f3 && f4 && (window.homeFilt || window.filterCity || window.filterVillage ? true : p.avail);
  });
  el.innerHTML = list.length ? list.map(proCard).join('') : '<div class="empty"><div class="empty-icon">🔍</div><div class="empty-text">لا نتائج</div><div class="empty-sub">جرّب تغيير الفلتر</div></div>';
  const title = document.getElementById('pros-title');
  if (title) title.textContent = window.filterCity ? (window.filterVillage ? window.filterVillage : window.filterCity) + ' (' + list.length + ')' : (list.length ? 'متاحون الآن' : 'لا يوجد');
}
function homeSearch(v) { window.homeSearchV = v; renderPros(); }
function filterChip(v, el) {
  window.homeFilt = v;
  document.querySelectorAll('#home-chips .spec-chip').forEach(b => b.classList.remove('on'));
  el.classList.add('on'); renderPros();
}

// ══ BROWSE ══
let brType = 'all', brText = '';
function renderBrowse() {
  const list = professionals.filter(p => {
    const t = brType === 'all' || p.type === brType;
    const tx = !brText || (p.name.includes(brText) || p.spec.includes(brText) || p.area.includes(brText) || p.city?.includes(brText));
    const tc = !window.brCity || (p.city === window.brCity || p.area?.includes(window.brCity));
    const tv = !window.brVillage || (p.area?.includes(window.brVillage) || p.area === window.brVillage);
    return t && tx && tc && tv;
  });
  const el = document.getElementById('br-list');
  if (el) el.innerHTML = list.length ? list.map(proCard).join('') : '<div class="empty"><div class="empty-icon">🔍</div><div class="empty-text">لا نتائج</div></div>';
}
function browseFilter(v) { brText = v; renderBrowse(); }
function brTab(t, el) { brType = t; document.querySelectorAll('#pg-browse .tab').forEach(b => b.classList.remove('on')); el.classList.add('on'); renderBrowse(); }

// ══ DETAIL ══
function openDetail(id) {
  const p = professionals.find(x => String(x.id) === String(id)); if (!p) return;
  window.curPro = id;
  const avg = avgRating(p), cnt = p.reviews?.length || 0;
  const avEl = document.getElementById('dt-av');
  if (p.avatar) { avEl.style.backgroundImage = `url(${p.avatar})`; avEl.style.backgroundSize = 'cover'; avEl.style.backgroundPosition = 'center'; avEl.textContent = ''; }
  else { avEl.style.backgroundImage = ''; avEl.style.background = 'rgba(255,255,255,.18)'; avEl.style.color = '#fff'; avEl.textContent = TEM[p.type] || '👤'; }
  document.getElementById('dt-name').textContent = p.name;
  document.getElementById('dt-role').textContent = p.spec;
  document.getElementById('dt-rating').textContent = avg ? avg.toFixed(1) + ' ⭐' : '—';
  document.getElementById('dt-reviews-count').textContent = cnt;
  document.getElementById('dt-exp').textContent = p.exp;
  const dtCode = document.getElementById('dt-code'); if (dtCode) dtCode.textContent = '#' + (p.userCode || '—');
  let badges = p.avail ? '<span class="badge b-green">✅ متاح الآن</span>' : '<span class="badge b-red">مشغول</span>';
  if (p.verified) badges += '<span class="badge b-blue">✓ موثّق</span>';
  document.getElementById('dt-badges').innerHTML = badges;
  if (avg && cnt > 0) {
    const counts = [5, 4, 3, 2, 1].map(s => ({ s, c: p.reviews.filter(r => r.stars === s).length }));
    document.getElementById('dt-rating-bars').innerHTML = `<div class="card" style="margin-bottom:0"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="font-size:36px;font-weight:900;color:var(--blue);line-height:1">${avg.toFixed(1)}</div><div><div class="stars">${starsHTML(avg)}</div><div style="font-size:12px;color:var(--text3)">${cnt} تقييم</div></div></div>${counts.map(({ s, c }) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><span style="font-size:12px;color:var(--text2);min-width:14px">${s}</span><span style="color:#f59e0b;font-size:13px">★</span><div class="prog-bar" style="flex:1"><div class="prog-fill" style="width:${cnt ? Math.round(c / cnt * 100) : 0}%"></div></div><span style="font-size:12px;color:var(--text3);min-width:18px;text-align:left">${c}</span></div>`).join('')}</div>`;
  } else { document.getElementById('dt-rating-bars').innerHTML = ''; }
  const ps = document.getElementById('dt-photos-section');
  if (p.photos?.length) { ps.innerHTML = `<div class="sh"><span class="st">صور الأعمال (${p.photos.length})</span></div><div class="photo-grid" style="margin-bottom:16px">${p.photos.map(src => `<img src="${src}" class="photo-thumb" onclick="viewPhoto('${src}')">`).join('')}</div>`; }
  else { ps.innerHTML = ''; }
  document.getElementById('dt-desc').textContent = p.desc || 'لا يوجد وصف';
  document.getElementById('dt-area').textContent = '📍 ' + p.area;
  document.getElementById('dt-call').href = 'tel:' + p.phone;
  const waEl = document.getElementById('dt-wa');
  if (p.wa) { waEl.href = `https://wa.me/963${p.wa.slice(1)}`; waEl.style.display = 'flex'; } else { waEl.style.display = 'none'; }
  renderDetailReviews(p);
  go('pg-detail');
}

function renderDetailReviews(p) {
  const el = document.getElementById('dt-reviews-list'); if (!el) return;
  const revs = p.reviews || [];
  if (!revs.length) {
    el.innerHTML = '<div class="empty" style="padding:20px 0"><div class="empty-icon" style="font-size:36px">💬</div><div class="empty-sub">لا توجد تقييمات بعد</div></div>';
  } else {
    el.innerHTML = revs.map((r, idx) => {
      const isOwn = window.curUser && r.authorUid === window.curUser.uid;
      const isAdmin = window.curType === 'admin';
      const actions = (isOwn || isAdmin) ? `<div style="display:flex;gap:6px;margin-top:8px">
        ${isOwn ? `<button onclick="editReview('${p.id}',${idx})" style="background:var(--blue-lt);color:var(--blue);border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Tajawal,sans-serif">تعديل</button>` : ''}
        <button onclick="deleteReview('${p.id}',${idx})" style="background:#fee2e2;color:var(--red);border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:Tajawal,sans-serif">حذف</button>
      </div>` : '';
      return `<div class="rev-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <span style="font-weight:700;font-size:14px">${r.author}</span>
          <div class="stars">${starsHTML(r.stars, true)}</div>
        </div>
        ${r.text ? `<div style="font-size:13px;color:var(--text2);margin-top:4px;line-height:1.6">${r.text}</div>` : ''}
        <div style="font-size:11px;color:var(--text3);margin-top:4px">${r.date}</div>
        ${actions}
      </div>`;
    }).join('');
  }
  const fa = document.getElementById('review-form-area');
  if (window.curUser) {
    fa.innerHTML = `<button class="btn btn-primary" onclick="openReviewModal('${p.id}')" style="margin-top:8px">⭐ أضف تقييمك</button>`;
  } else {
    fa.innerHTML = '<div style="text-align:center;padding:14px;background:var(--gray);border-radius:var(--rsm);margin-top:8px;font-size:13px;color:var(--text2)">سجّل لإضافة تقييم <button onclick="go(\'pg-auth\')" style="background:none;border:none;color:var(--blue);font-weight:700;cursor:pointer;font-size:13px">سجّل الآن</button></div>';
  }
}

function openReviewModal(proId) {
  window.revProId = proId; window.selStar = 0; window._editRevIdx = null;
  const p = professionals.find(x => String(x.id) === String(proId));
  document.getElementById('rev-pro-name').textContent = p?.name || '';
  document.querySelectorAll('#rev-stars .star').forEach(s => s.style.color = '#e2e8f0');
  document.getElementById('rev-text').value = '';
  openModal('mo-review');
}
function editReview(proId, idx) {
  const p = professionals.find(x => String(x.id) === String(proId)); if (!p?.reviews) return;
  const r = p.reviews[idx];
  window.revProId = proId; window.selStar = r.stars; window._editRevIdx = idx;
  document.getElementById('rev-pro-name').textContent = p.name;
  document.querySelectorAll('#rev-stars .star').forEach((s, i) => s.style.color = i < r.stars ? '#f59e0b' : '#e2e8f0');
  document.getElementById('rev-text').value = r.text || '';
  openModal('mo-review');
}
function setStar(n) {
  window.selStar = n;
  document.querySelectorAll('#rev-stars .star').forEach((s, i) => s.style.color = i < n ? '#f59e0b' : '#e2e8f0');
}
// submitReview يستدعي window.submitReview من firebase.js
function submitReview() { if (typeof window.submitReview === 'function') window.submitReview(); }
function deleteReview(proId, idx) { if (typeof window.deleteReview === 'function') window.deleteReview(proId, idx); }

// ══ AUTH FALLBACKS ══
function selType(t, el) {
  window.selTypeVal = t;
  document.querySelectorAll('.tyb').forEach(b => { b.classList.remove('on'); b.querySelector('.chk').textContent = ''; });
  el.classList.add('on'); el.querySelector('.chk').textContent = '✓';
  const btn = document.getElementById('confirm-type'); btn.disabled = false; btn.style.opacity = '1';
}
function doLogin() { if (typeof window.doLogin === 'function') window.doLogin(); }
function doAuth() { if (typeof window.doAuth === 'function') window.doAuth(); }
function confirmType() { if (typeof window.confirmType === 'function') window.confirmType(); }
function doLogout() { if (typeof window.doLogout === 'function') window.doLogout(); }
function sendReset() { if (typeof window.sendReset === 'function') window.sendReset(); }
function showForgot() { if (typeof window.showForgot === 'function') window.showForgot(); }
function hideForgot() { if (typeof window.hideForgot === 'function') window.hideForgot(); }
function doPhoneStep1() { if (typeof window.doPhoneStep1 === 'function') window.doPhoneStep1(); }
function doPhoneStep2() { if (typeof window.doPhoneStep2 === 'function') window.doPhoneStep2(); }
function backToPhone() { if (typeof window.backToPhone === 'function') window.backToPhone(); }
function switchAuthMode(m) { if (typeof window.switchAuthMode === 'function') window.switchAuthMode(m); }
function onHomeCityChange() { if (typeof window.onHomeCityChange === 'function') window.onHomeCityChange(); }
function onHomeVillageChange() { if (typeof window.onHomeVillageChange === 'function') window.onHomeVillageChange(); }
function onBrCityChange() { if (typeof window.onBrCityChange === 'function') window.onBrCityChange(); }
function onBrVillageChange() { if (typeof window.onBrVillageChange === 'function') window.onBrVillageChange(); }
function onCityChange(c, v) { if (typeof window.onCityChange === 'function') window.onCityChange(c, v); }
function saveName() { if (typeof window.saveName === 'function') window.saveName(); }
function savePass() { if (typeof window.savePass === 'function') window.savePass(); }
function savePro() { if (typeof window.savePro === 'function') window.savePro(); }
function saveAdminMember() { if (typeof window.saveAdminMember === 'function') window.saveAdminMember(); }
function saveEditPro() { if (typeof window.saveEditPro === 'function') window.saveEditPro(); }
function toggleProAvail(id) { if (typeof window.toggleProAvail === 'function') window.toggleProAvail(id); }
function toggleVerified(id) { if (typeof window.toggleVerified === 'function') window.toggleVerified(id); }
function deletePro(id) { if (typeof window.deletePro === 'function') window.deletePro(id); }

// ══ ACTIVATE / DEACTIVATE ══
function _activateUser() {
  const m = { 'top-auth': 'none', 'top-me': '', 'hero-out': 'none', 'chat-dot': '' };
  Object.entries(m).forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.style.display = v; });
  const hi = document.getElementById('hero-in'); if (hi) hi.style.display = 'flex';
  const nb = document.getElementById('nav-badge'); if (nb) nb.style.display = 'flex';
  const ad = document.getElementById('top-admin'); if (ad) ad.style.display = window.curType === 'admin' ? '' : 'none';
  const tc = document.getElementById('top-code');
  if (tc && window.curUserData?.userCode) { tc.textContent = '#' + window.curUserData.userCode; tc.style.display = ''; }
  updateTopAvatar();
}
function _deactivateUser() {
  const ta = document.getElementById('top-auth'); if (ta) ta.style.display = '';
  ['top-me', 'top-admin', 'chat-dot', 'nav-badge', 'top-code'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  const ho = document.getElementById('hero-out'); if (ho) ho.style.display = 'block';
  const hi = document.getElementById('hero-in'); if (hi) hi.style.display = 'none';
}
function updateTopAvatar() {
  const el = document.getElementById('top-av'); if (!el) return;
  const myP = professionals.find(p => p.mine && p.avatar);
  if (myP) { el.style.backgroundImage = `url(${myP.avatar})`; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; el.textContent = ''; }
  else { el.style.backgroundImage = ''; el.textContent = TEM[window.curType] || '👤'; }
}
function logout() { doLogout(); }

// ══ SETTINGS ══
function setColor(main, dark, light, el) {
  document.documentElement.style.setProperty('--blue', main);
  document.documentElement.style.setProperty('--blue-dk', dark);
  document.documentElement.style.setProperty('--blue-lt', light);
  document.documentElement.style.setProperty('--blue-mid', main);
  const mt = document.getElementById('meta-theme'); if (mt) mt.content = main;
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  if (el) el.classList.add('active');
  try { localStorage.setItem('omran-color', JSON.stringify({ main, dark, light })); } catch (e) {}
}

// ══ SPECS ══
function buildSpecGrid(cid, fn) {
  const el = document.getElementById(cid); if (!el) return;
  el.innerHTML = specialties.map(s => `<button class="sb" onclick="${fn}('${s.id}',this)">${s.icon} ${s.id}</button>`).join('');
}
function buildApSpecs() {
  window.apSpecVal = null; window.apAvatarData = null;
  buildSpecGrid('ap-specs', 'apSpec');
  const initCity = () => { if (typeof window.buildCitySelect === 'function') window.buildCitySelect('ap-city', false); else setTimeout(initCity, 100); };
  initCity();
}
function apSpec(v, el) { window.apSpecVal = v; document.querySelectorAll('#ap-specs .sb').forEach(b => b.classList.remove('on')); el.classList.add('on'); }
function buildAmSpecs() { window.amSpecVal = null; buildSpecGrid('am-specs', 'amSpec'); }
function amSpec(v, el) { window.amSpecVal = v; document.querySelectorAll('#am-specs .sb').forEach(b => b.classList.remove('on')); el.classList.add('on'); }
function buildCurSpecs() { const el = document.getElementById('cur-specs'); if (el) el.innerHTML = specialties.map(s => `<span class="badge b-blue" style="margin:2px">${s.icon} ${s.id}</span>`).join(''); }
function togAvail() { window.availOn = !window.availOn; document.getElementById('avail-track').className = 'tog-track' + (window.availOn ? ' on' : ''); }
function togAm() { window.amAvailOn = !window.amAvailOn; document.getElementById('am-avail-track').className = 'tog-track' + (window.amAvailOn ? ' on' : ''); }
function saveSpec() {
  const name = document.getElementById('sp-name').value.trim();
  const icon = document.getElementById('sp-icon').value.trim() || '🔧';
  const type = document.getElementById('sp-type').value;
  if (!name) { alert('يرجى إدخال اسم المهنة'); return; }
  if (specialties.find(s => s.id === name)) { alert('هذه المهنة موجودة'); return; }
  specialties.push({ id: name, icon, type });
  document.getElementById('sp-name').value = ''; document.getElementById('sp-icon').value = '';
  buildCurSpecs(); alert('✅ تمت إضافة مهنة "' + name + '"!');
}

// ══ REQUEST ══
function renderRequest() {
  const el = document.getElementById('req-content'); if (!el) return;
  if (!window.curUser) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">🔐</div><div class="empty-text">سجّل أولاً</div><div class="empty-sub" style="margin-bottom:18px">يجب التسجيل لإرسال طلب</div><button class="btn btn-primary" onclick="go(\'pg-auth\')">سجّل مجاناً</button></div>';
    return;
  }
  const chips = specialties.map(s => `<button class="sb" onclick="pickReqSpec('${s.id}',this)">${s.icon} ${s.id}</button>`).join('');
  el.innerHTML = `<p style="color:var(--text2);margin-bottom:16px;font-size:14px">سيتواصل معك المعلم خلال دقائق</p>
    <div class="fg"><label class="fl">نوع العمل</label><div class="sg" id="req-specs">${chips}</div></div>
    <div class="fg"><label class="fl">الموقع</label><input class="fi" id="req-loc" placeholder="مثال: درعا البلد..."></div>
    <div class="fg"><label class="fl">تفاصيل العمل</label><textarea class="fi" id="req-det" placeholder="اكتب ما تحتاجه..."></textarea></div>
    <div class="fg"><label class="fl">رقم التواصل</label><input class="fi" id="req-ph" value="${window.curUser.phoneNumber || ''}" placeholder="09XXXXXXXX" style="direction:ltr"></div>
    <button class="btn btn-primary" onclick="submitReq()">إرسال الطلب ⚡</button>`;
}
function pickReqSpec(v, el) { window.reqSpec = v; document.querySelectorAll('#req-specs .sb').forEach(b => b.classList.remove('on')); el.classList.add('on'); }
function submitReq() {
  if (!document.getElementById('req-loc')?.value.trim()) { alert('يرجى إدخال الموقع'); return; }
  myRequests.push({ spec: window.reqSpec || 'عام', area: document.getElementById('req-loc').value, date: nowT(), done: false });
  success('✅', 'تم إرسال طلبك!', 'سيتواصل معك المعلم المناسب خلال دقائق.');
}

// ══ CHAT ══
function renderChatList(filter) {
  const el = document.getElementById('chat-list'); if (!el) return;
  let keys = Object.keys(chats);
  if (filter && filter !== 'all') keys = keys.filter(id => { const p = professionals.find(x => String(x.id) === String(id)); return p && p.type === filter; });
  if (!keys.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">💬</div><div class="empty-text">لا توجد محادثات</div><div class="empty-sub">ابدأ من صفحة التصفح</div></div>'; return; }
  el.innerHTML = keys.map(id => {
    const p = professionals.find(x => String(x.id) === String(id)); if (!p) return '';
    const last = chats[id].msgs.slice(-1)[0];
    const preview = last ? (last.tp === 'voice' ? '🎤 رسالة صوتية' : last.text) : '';
    const u = unread[id] || 0;
    const avStyle = p.avatar ? `background-image:url(${p.avatar});background-size:cover;background-position:center` : `background:${TBG[p.type]};color:${TCL[p.type]}`;
    return `<div class="ci" onclick="openChatWith('${p.id}')">
      <div class="av" style="width:46px;height:46px;font-size:19px;${avStyle}">${p.avatar ? '' : TEM[p.type] || '👤'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:15px">${p.name}</div>
        <div style="font-size:13px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px">${preview}</div>
      </div>
      <div style="text-align:left;flex-shrink:0">
        <div style="font-size:11px;color:var(--text3)">${last?.time || ''}</div>
        ${u ? `<div style="background:var(--red);color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;margin-top:4px;margin-right:auto">${u}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}
function cTab(t, el) { document.querySelectorAll('#pg-chat .tab').forEach(b => b.classList.remove('on')); el.classList.add('on'); renderChatList(t); }
function openChatWith(id) {
  const p = professionals.find(x => String(x.id) === String(id)); if (!p) return;
  window.curChatId = id; unread[id] = 0;
  if (!chats[id]) chats[id] = { msgs: [] };
  const avStyle = p.avatar ? `background-image:url(${p.avatar});background-size:cover;background-position:center` : `background:${TBG[p.type]};color:${TCL[p.type]}`;
  const av = document.getElementById('cw-av');
  av.style.cssText = `width:38px;height:38px;font-size:16px;${avStyle}`;
  av.textContent = p.avatar ? '' : TEM[p.type] || '👤';
  document.getElementById('cw-dot').style.background = p.avail ? '#22c55e' : '#94a3b8';
  document.getElementById('cw-name').textContent = p.name;
  document.getElementById('cw-status').textContent = p.avail ? 'متصل الآن' : 'غير متصل';
  document.getElementById('cw-call').href = 'tel:' + p.phone;
  document.getElementById('cw-wa').href = p.wa ? `https://wa.me/963${p.wa.slice(1)}` : '#';
  renderMsgs(); go('pg-chatwin');
}
const WVH = [8, 14, 20, 14, 24, 12, 18, 22, 10, 16, 20, 14, 8, 18, 22];
function renderMsgs() {
  const el = document.getElementById('cw-msgs'); if (!el || !window.curChatId) return;
  el.innerHTML = (chats[window.curChatId]?.msgs || []).map(m => {
    const cls = m.out ? 'out' : 'in';
    if (m.tp === 'voice') return `<div class="bbl ${cls}"><div class="vb"><button class="pb" onclick="playV(this)">▶</button><div class="wv">${WVH.map(h => `<span style="height:${h}px"></span>`).join('')}</div><span style="font-size:11px;opacity:.6">${m.dur}</span></div><div class="bt">${m.time}${m.out ? ' ✓✓' : ''}</div></div>`;
    return `<div class="bbl ${cls}">${m.text}<div class="bt">${m.time}${m.out ? ' ✓✓' : ''}</div></div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}
function sendMsg() {
  const inp = document.getElementById('msg-inp'); const txt = inp.value.trim();
  if (!txt || !window.curChatId) return;
  chats[window.curChatId].msgs.push({ out: true, text: txt, time: nowT(), tp: 'text' });
  inp.value = ''; inp.style.height = 'auto'; renderMsgs();
  setTimeout(() => {
    const rep = ['تمام شكراً!', 'رح نرتب الموضوع', 'مفهوم سأتواصل', 'أهلاً سأكون عندك'][Math.floor(Math.random() * 4)];
    chats[window.curChatId].msgs.push({ out: false, text: rep, time: nowT(), tp: 'text' });
    renderMsgs();
  }, 1400);
}
function toggleRec() {
  if (!window.curChatId) return;
  if (!window.isRec) {
    window.isRec = true; window.recSecs = 0;
    document.getElementById('rec-btn').classList.add('on'); document.getElementById('rec-btn').textContent = '⏹';
    document.getElementById('rec-bar').classList.add('show');
    window.recInt = setInterval(() => { window.recSecs++; const m = Math.floor(window.recSecs / 60), s = window.recSecs % 60; document.getElementById('rec-timer').textContent = m + ':' + (s < 10 ? '0' : '') + s; }, 1000);
  } else { finishRec(); }
}
function finishRec() {
  window.isRec = false; clearInterval(window.recInt);
  document.getElementById('rec-btn').classList.remove('on'); document.getElementById('rec-btn').textContent = '🎤';
  document.getElementById('rec-bar').classList.remove('show');
  if (window.recSecs >= 1) { const dur = Math.floor(window.recSecs / 60) + ':' + (window.recSecs % 60 < 10 ? '0' : '') + window.recSecs % 60; chats[window.curChatId].msgs.push({ out: true, text: '', time: nowT(), tp: 'voice', dur }); renderMsgs(); }
}
function cancelRec() { window.isRec = false; clearInterval(window.recInt); document.getElementById('rec-btn').classList.remove('on'); document.getElementById('rec-btn').textContent = '🎤'; document.getElementById('rec-bar').classList.remove('show'); }
function playV(btn) { if (window.playBtn && window.playBtn !== btn) window.playBtn.textContent = '▶'; btn.textContent = btn.textContent === '▶' ? '⏸' : '▶'; if (btn.textContent === '⏸') { window.playBtn = btn; setTimeout(() => { btn.textContent = '▶'; if (window.playBtn === btn) window.playBtn = null; }, 3000); } else { window.playBtn = null; } }
function autoResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 90) + 'px'; }
function ncSearch(v) {
  const el = document.getElementById('nc-list'); if (!el) return;
  el.innerHTML = professionals.filter(p => !v || (p.name.includes(v) || p.spec.includes(v))).map(p => `<div class="ci" onclick="openChatWith('${p.id}')">
    <div class="av" style="width:46px;height:46px;font-size:19px;background:${TBG[p.type]};color:${TCL[p.type]}">${TEM[p.type] || '👤'}</div>
    <div style="flex:1"><div style="font-weight:700">${p.name}</div><div style="font-size:13px;color:var(--text2)">${p.spec} · ${p.area}</div></div>
    ${p.avail ? '<span class="badge b-green">متاح</span>' : ''}
  </div>`).join('');
}

// ══ MY PROFILE ══
function renderMyProfile() {
  const el = document.getElementById('myprofile'); if (!el) return;
  if (!window.curUser) {
    el.innerHTML = '<div class="empty" style="padding:60px 20px"><div class="empty-icon" style="font-size:60px">👤</div><div class="empty-text">أنت غير مسجّل</div><div class="empty-sub" style="margin-bottom:20px">سجّل للوصول لحسابك</div><button class="btn btn-primary" onclick="go(\'pg-auth\')" style="max-width:260px;margin:0 auto">سجّل مجاناً ⚡</button></div>';
    return;
  }
  const myPs = professionals.filter(p => p.mine);
  const te = TEM[window.curType] || '👤';
  const myAvatar = myPs.find(p => p.avatar)?.avatar;
  el.innerHTML = `
    <div class="ph">
      <div class="av" style="width:74px;height:74px;font-size:30px;margin:0 auto;${myAvatar ? `background-image:url(${myAvatar});background-size:cover;background-position:center` : 'background:rgba(255,255,255,.18);color:#fff'}">${myAvatar ? '' : te}</div>
      <div class="pn">${window.curUserData?.name || window.curUser.displayName || 'مستخدم عُمران'}</div>
      <div class="pr">${TLB[window.curType] || 'مستخدم'}</div>
    </div>
    <div class="sr">
      <div class="sb3"><div class="sn">${myPs.length}</div><div class="slb">ملفاتي</div></div>
      <div class="sb3"><div class="sn">${Object.keys(chats).length}</div><div class="slb">محادثة</div></div>
      <div class="sb3"><div class="sn">${myRequests.length}</div><div class="slb">طلب</div></div>
    </div>
    <div style="padding:16px">
      <button class="btn btn-primary" onclick="go('pg-addprofile')" style="margin-bottom:8px">+ أضف ملفاً مهنياً</button>
      <button class="btn btn-secondary" onclick="go('pg-settings')" style="margin-bottom:16px">⚙️ الإعدادات</button>
      ${myPs.length ? `<div class="sh"><span class="st">ملفاتي</span></div>${myPs.map(p => `<div class="card" style="display:flex;gap:12px;align-items:center;cursor:pointer" onclick="openDetail('${p.id}')">
        <div class="av" style="width:42px;height:42px;font-size:18px;${p.avatar ? `background-image:url(${p.avatar});background-size:cover;background-position:center` : `background:${TBG[p.type]};color:${TCL[p.type]}`}">${p.avatar ? '' : te}</div>
        <div style="flex:1"><div style="font-weight:700">${p.name}</div><div style="font-size:13px;color:var(--text2)">${p.spec}</div></div>
        ${p.avail ? '<span class="badge b-green">متاح</span>' : '<span class="badge b-red">مشغول</span>'}
      </div>`).join('')}` : ''}
      <button onclick="doLogout()" style="width:100%;margin-top:20px;background:#fff;color:var(--red);border:1.5px solid #fecaca;border-radius:var(--rsm);padding:12px;font-size:14px;font-weight:700;cursor:pointer">تسجيل خروج</button>
    </div>`;
}

// ══ ADMIN ══
function renderDashboard() {
  if (typeof window.renderDashboard === 'function') window.renderDashboard();
  else setTimeout(() => { if (typeof window.renderDashboard === 'function') window.renderDashboard(); }, 500);
}
function renderAdmin() {
  if (window.curType !== 'admin') { go('pg-home'); return; }
  const el = document.getElementById('admin-content'); if (!el) return;
  const avgAll = professionals.filter(p => p.reviews?.length).reduce((s, p, _, a) => s + avgRating(p) / a.length, 0);
  el.innerHTML = `
    <button class="btn btn-primary" onclick="go('pg-dashboard')" style="margin-bottom:12px;background:linear-gradient(135deg,#1a56db,#7c3aed)">📊 داشبورد التحليلات</button>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div class="stat-card"><div style="font-size:28px;font-weight:900;color:var(--blue)">${professionals.length}</div><div style="font-size:13px;color:var(--text2)">مسجّل</div></div>
      <div class="stat-card" style="background:#f0fdf4"><div style="font-size:28px;font-weight:900;color:var(--green)">${professionals.filter(p => p.avail).length}</div><div style="font-size:13px;color:var(--text2)">متاح</div></div>
      <div class="stat-card" style="background:#fef3c7"><div style="font-size:28px;font-weight:900;color:#92400e">${specialties.length}</div><div style="font-size:13px;color:var(--text2)">مهنة</div></div>
      <div class="stat-card" style="background:#f3e8ff"><div style="font-size:28px;font-weight:900;color:var(--purple)">${avgAll ? avgAll.toFixed(1) + ' ⭐' : '—'}</div><div style="font-size:13px;color:var(--text2)">متوسط تقييم</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      <button class="btn btn-primary btn-sm" onclick="go('pg-addmember')">➕ إضافة شخص</button>
      <button class="btn btn-secondary btn-sm" onclick="go('pg-addspec')">🏷️ مهنة جديدة</button>
      <button class="btn btn-secondary btn-sm" onclick="openAppSettings()" style="grid-column:span 2">📱 إعدادات التطبيق</button>
      <button class="btn btn-secondary btn-sm" onclick="go('pg-settings')" style="grid-column:span 2">🔑 إعدادات الأدمن</button>
    </div>
    <div class="sh"><span class="st">المسجّلون (${professionals.length})</span></div>
    ${professionals.map(p => {
      const avg = avgRating(p), cnt = p.reviews?.length || 0;
      const avStyle = p.avatar ? `background-image:url(${p.avatar});background-size:cover;background-position:center` : `background:${TBG[p.type]};color:${TCL[p.type]}`;
      return `<div class="admin-row">
        <div class="av" style="width:40px;height:40px;font-size:17px;${avStyle}">${p.avatar ? '' : TEM[p.type] || '👤'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px">${p.name} ${p.verified ? '<span style="color:var(--blue);font-size:12px">✓</span>' : ''}</div>
          <div style="font-size:12px;color:var(--text2)">${p.spec} · ${p.area}</div>
          ${avg ? `<div style="font-size:11px;color:#f59e0b">★ ${avg.toFixed(1)} (${cnt})</div>` : ''}
        </div>
        ${p.avail ? '<span class="badge b-green" style="font-size:11px">متاح</span>' : '<span class="badge b-red" style="font-size:11px">مشغول</span>'}
        <div style="display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">
          <button onclick="openEditPro('${p.id}')" style="background:#fef3c7;color:#92400e;border:none;border-radius:6px;padding:5px 7px;cursor:pointer;font-size:11px;font-weight:700">✏️</button>
          <button onclick="toggleProAvail('${p.id}')" style="background:var(--gray);border:none;border-radius:6px;padding:5px 7px;cursor:pointer;font-size:11px;font-weight:700">${p.avail ? 'إيقاف' : 'تفعيل'}</button>
          <button onclick="toggleVerified('${p.id}')" style="background:var(--blue-lt);color:var(--blue);border:none;border-radius:6px;padding:5px 7px;cursor:pointer;font-size:11px;font-weight:700">${p.verified ? 'إلغاء توثيق' : 'توثيق'}</button>
          <button onclick="deletePro('${p.id}')" style="background:#fee2e2;color:var(--red);border:none;border-radius:6px;padding:5px 7px;cursor:pointer;font-size:11px;font-weight:700">حذف</button>
        </div>
      </div>`;
    }).join('')}`;
}

function openEditPro(proId) {
  const p = professionals.find(x => String(x.id) === String(proId)); if (!p) return;
  epProId = proId; epAvailOn = p.avail;
  document.getElementById('ep-pro-name').textContent = p.name;
  document.getElementById('ep-name').value = p.name;
  document.getElementById('ep-phone').value = p.phone;
  document.getElementById('ep-wa').value = p.wa || '';
  document.getElementById('ep-area').value = p.area;
  document.getElementById('ep-desc').value = p.desc || '';
  document.getElementById('ep-avail-track').className = 'tog-track ' + (p.avail ? 'on' : '');
  openModal('mo-edit-pro');
}
function togEpAvail() { epAvailOn = !epAvailOn; document.getElementById('ep-avail-track').className = 'tog-track ' + (epAvailOn ? 'on' : ''); }

function openAppSettings() {
  document.getElementById('cfg-wa').value = appConfig.waPhone;
  document.getElementById('cfg-phone').value = appConfig.phone;
  document.getElementById('cfg-email1').value = appConfig.email1;
  document.getElementById('cfg-appname').value = appConfig.appName;
  openModal('mo-app-settings');
}
function saveAppSettings() {
  const wa = document.getElementById('cfg-wa').value.trim();
  const phone = document.getElementById('cfg-phone').value.trim();
  const email1 = document.getElementById('cfg-email1').value.trim();
  const name = document.getElementById('cfg-appname').value.trim();
  if (!wa || !phone || !email1) { alert('يرجى إدخال واتساب وهاتف وبريد'); return; }
  appConfig = { waPhone: wa, phone, email1, appName: name || appConfig.appName };
  closeModal('mo-app-settings');
  alert('✅ تم حفظ الإعدادات!');
}

// ══ MODAL ══
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// ══ PWA ══
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// ══ INIT ══
document.addEventListener('DOMContentLoaded', () => {
  // بناء قوائم المدن — ننتظر firebase.js يكمل تحميله
  const initCities = () => {
    if (typeof window.buildCitySelect === 'function') {
      window.buildCitySelect('home-city-sel');
      window.buildCitySelect('br-city-sel');
      window.buildCitySelect('a-city', false);
      window.buildCitySelect('a-city-ph', false);
    } else {
      setTimeout(initCities, 100);
    }
  };
  initCities();
  document.querySelectorAll('.mo').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); }));
  renderPros();
});
