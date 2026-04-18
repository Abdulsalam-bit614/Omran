// firebase.js — type="module"
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, EmailAuthProvider, sendPasswordResetEmail,
  reauthenticateWithCredential, updatePassword,
  browserLocalPersistence, setPersistence
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore, doc, setDoc, getDoc, collection,
  getDocs, updateDoc, deleteDoc, serverTimestamp, arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ══ CONFIG ══
const firebaseConfig = {
  apiKey: "AIzaSyDNTuigUGGpTAKadc2Io71zV-RIYNc7-6c",
  authDomain: "ibbni-55e41.firebaseapp.com",
  projectId: "ibbni-55e41",
  storageBucket: "ibbni-55e41.firebasestorage.app",
  messagingSenderId: "429036025018",
  appId: "1:429036025018:web:f0dd72fa90771ee0f43e83"
};

const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);

// setPersistence داخل async — لا top-level await (Safari)
(async () => {
  try { await setPersistence(auth, browserLocalPersistence); }
  catch (e) { console.warn('persistence:', e); }
})();

// ══ SYRIA DATA ══
const SYRIA = {
  'دمشق': ['دمشق القديمة','المزة','كفرسوسة','البرامكة','ركن الدين','باب توما','المهاجرين','دمر','قدسيا'],
  'ريف دمشق': ['دوما','عربين','زملكا','جرمانا','صيدنايا','يبرود','الزبداني','معضمية الشام','داريا','سعسع','قطنا','النبك'],
  'حلب': ['حلب القديمة','العزيزية','الشهباء','السليمانية','إعزاز','منبج','الباب','جرابلس','عفرين','عين العرب'],
  'درعا': ['درعا البلد','درعا المحطة','نوى','المزيريب','الصنمين','طفس','بصرى الشام','إنخل','الحراك','جاسم','داعل','عتمان','ازرع','خربة غزالة','سهوة الجولان'],
  'حمص': ['حمص','الوعر','الزهراء','الرستن','تلبيسة','القصير','تدمر','تلكلخ','المخرم'],
  'حماة': ['حماة','مصياف','السلمية','محردة','صوران','مورك','اللطامنة'],
  'اللاذقية': ['اللاذقية','جبلة','القرداحة','الحفة','سلمى','قسطل معاف'],
  'طرطوس': ['طرطوس','صافيتا','بانياس','الشيخ بدر','دريكيش','القدموس'],
  'إدلب': ['إدلب','معرة النعمان','أريحا','جسر الشغور','سرمين','بنش','سرمدا','أطمة','حارم'],
  'دير الزور': ['دير الزور','الميادين','البوكمال','الأشارة','موحسن'],
  'الرقة': ['الرقة','الطبقة','تل أبيض','سلوك'],
  'الحسكة': ['الحسكة','القامشلي','المالكية','رأس العين','عامودا','الشدادي'],
  'السويداء': ['السويداء','شهبا','صلخد','القريا','ضمير'],
  'القنيطرة': ['القنيطرة','فيق','البعث','خان أرنبة']
};
const ALL_CITIES = Object.keys(SYRIA);

// ══ HELPERS ══
function authErr(c) {
  const m = {
    'auth/email-already-in-use': 'هذا البريد مسجّل — يرجى تسجيل الدخول',
    'auth/weak-password': 'كلمة المرور ضعيفة — ٦ أحرف على الأقل',
    'auth/invalid-email': 'البريد غير صحيح',
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
    'auth/too-many-requests': 'محاولات كثيرة — انتظر قليلاً',
    'auth/network-request-failed': 'تحقق من اتصال الإنترنت',
    'auth/requires-recent-login': 'يرجى تسجيل الخروج والدخول مجدداً',
    'auth/invalid-phone-number': 'رقم الهاتف غير صحيح',
    'auth/invalid-verification-code': 'رمز التحقق غير صحيح'
  };
  return m[c] || ('خطأ: ' + c);
}

const eyeSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOffSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

window.togglePass = function (inp, btnId) {
  try {
    const el = document.getElementById(inp);
    const b = document.getElementById(btnId);
    if (!el) return;
    const isPass = el.type === 'password';
    el.type = isPass ? 'text' : 'password';
    if (b) b.innerHTML = isPass ? eyeOffSVG : eyeSVG;
  } catch (e) { console.warn('togglePass:', e); }
};

window.buildCitySelect = function (id, all = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = (all ? '<option value="">كل المحافظات</option>' : '<option value="">اختر المحافظة...</option>') +
    ALL_CITIES.map(c => `<option value="${c}">${c}</option>`).join('');
};

window.buildVillageSelect = function (id, city) {
  const el = document.getElementById(id);
  if (!el) return;
  const vs = SYRIA[city] || [];
  el.innerHTML = '<option value="">كل المناطق</option>' + vs.map(v => `<option value="${v}">${v}</option>`).join('');
};

window.onCityChange = function (cId, vId) {
  window.buildVillageSelect(vId, document.getElementById(cId)?.value || '');
};

// ══ CITY FILTER HANDLERS ══
window.onHomeCityChange = function () {
  window.filterCity = document.getElementById('home-city-sel')?.value || '';
  window.filterVillage = '';
  const vSel = document.getElementById('home-village-sel');
  if (vSel) {
    if (window.filterCity) {
      const vs = SYRIA[window.filterCity] || [];
      vSel.innerHTML = '<option value="">كل المناطق</option>' + vs.map(v => `<option value="${v}">${v}</option>`).join('');
      vSel.style.display = '';
    } else {
      vSel.style.display = 'none';
      vSel.value = '';
    }
  }
  if (typeof renderPros === 'function') renderPros();
};

window.onHomeVillageChange = function () {
  window.filterVillage = document.getElementById('home-village-sel')?.value || '';
  if (typeof renderPros === 'function') renderPros();
};

window.onBrCityChange = function () {
  window.brCity = document.getElementById('br-city-sel')?.value || '';
  window.brVillage = '';
  const vSel = document.getElementById('br-village-sel');
  if (vSel) {
    if (window.brCity) {
      const vs = SYRIA[window.brCity] || [];
      vSel.innerHTML = '<option value="">كل المناطق</option>' + vs.map(v => `<option value="${v}">${v}</option>`).join('');
      vSel.style.display = '';
    } else {
      vSel.style.display = 'none';
      vSel.value = '';
    }
  }
  if (typeof renderBrowse === 'function') renderBrowse();
};

window.onBrVillageChange = function () {
  window.brVillage = document.getElementById('br-village-sel')?.value || '';
  if (typeof renderBrowse === 'function') renderBrowse();
};

// ══ FIRESTORE HELPERS ══
async function getNextCode() {
  try {
    const r = doc(db, 'meta', 'counter');
    const s = await getDoc(r);
    const c = s.exists() ? (s.data().count || 0) : 0;
    const n = c + 1;
    await setDoc(r, { count: n });
    return 'U-' + String(n).padStart(5, '0');
  } catch (e) {
    return 'U-' + Date.now().toString().slice(-5);
  }
}

// id دائماً String لـ Firestore
async function savePro2Fs(p) {
  try {
    await setDoc(doc(db, 'professionals', String(p.id)), { ...p, id: String(p.id) });
  } catch (e) { console.error('savePro2Fs', e); }
}

async function updatePro2Fs(id, data) {
  try {
    await setDoc(doc(db, 'professionals', String(id)), data, { merge: true });
  } catch (e) { console.error('updatePro2Fs', e); throw e; }
}

async function deletePro2Fs(id) {
  try { await deleteDoc(doc(db, 'professionals', String(id))); }
  catch (e) { console.error('deletePro2Fs', e); }
}

async function loadProsFromFs() {
  try {
    const sn = await getDocs(collection(db, 'professionals'));
    sn.forEach(d => {
      // String compare لمنع تضاعف demo data
      if (!professionals.find(p => String(p.id) === String(d.id))) {
        const dt = d.data();
        professionals.push({ ...dt, id: d.id, reviews: dt.reviews || [], photos: dt.photos || [] });
      }
    });
    if (typeof renderPros === 'function') renderPros();
    if (typeof renderBrowse === 'function') renderBrowse();
  } catch (e) { console.error('loadPros', e); }
}

// ══ AUTH STATE ══
onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (window.curUser?.uid === 'admin-local') return;
    window.curUser = user;
    try {
      const sn = await getDoc(doc(db, 'users', user.uid));
      if (sn.exists()) { window.curUserData = sn.data(); window.curType = window.curUserData.type || null; }
    } catch (e) {}
    if (typeof _activateUser === 'function') _activateUser();
    await loadProsFromFs();
    const pg = document.querySelector('.page.active')?.id;
    // وجّه فقط من صفحات auth
    if (pg === 'pg-login' || pg === 'pg-auth') {
      if (!window.curType) go('pg-choosetype');
      else go('pg-home');
    } else if (pg === 'pg-choosetype') {
      if (window.curType) go('pg-home');
    }
    // باقي الصفحات — لا تتدخل
  } else {
    if (window.curUser?.uid === 'admin-local') return;
    window.curUser = null; window.curUserData = null; window.curType = null;
    if (typeof _deactivateUser === 'function') _deactivateUser();
    if (typeof renderPros === 'function') renderPros();
  }
});

// ══ AUTH FUNCTIONS ══
window.switchAuthMode = function (mode) {
  document.getElementById('auth-phone-section').style.display = mode === 'phone' ? '' : 'none';
  document.getElementById('auth-email-section').style.display = mode === 'email' ? '' : 'none';
  document.getElementById('auth-tab-phone').classList.toggle('on', mode === 'phone');
  document.getElementById('auth-tab-email').classList.toggle('on', mode === 'email');
};

// OTP Step 1
let confirmResult = null;
window.doPhoneStep1 = async function () {
  const phone = document.getElementById('a-phone')?.value.trim();
  const errEl = document.getElementById('auth-err-ph');
  const btn = document.getElementById('btn-send-otp');
  if (errEl) { errEl.style.color = '#ef4444'; errEl.textContent = ''; }
  if (!phone) { if (errEl) errEl.textContent = 'يرجى إدخال رقم الهاتف'; return; }
  const full = phone.startsWith('+') ? phone : '+963' + phone.replace(/^0/, '');
  if (btn) { btn.disabled = true; btn.textContent = 'جارٍ الإرسال...'; }
  try {
    if (!window._rcv) {
      const { RecaptchaVerifier } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      window._rcv = new RecaptchaVerifier(auth, 'recaptcha-box', { size: 'invisible' });
    }
    const { signInWithPhoneNumber } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    confirmResult = await signInWithPhoneNumber(auth, full, window._rcv);
    document.getElementById('otp-section').style.display = '';
    document.getElementById('phone-section').style.display = 'none';
    if (btn) { btn.disabled = false; btn.textContent = 'إرسال رمز التحقق'; }
    if (errEl) { errEl.style.color = '#22c55e'; errEl.textContent = '✅ تم إرسال رمز التحقق'; }
  } catch (e) {
    if (errEl) { errEl.style.color = '#ef4444'; errEl.textContent = authErr(e.code) || 'خطأ في إرسال الرمز'; }
    if (btn) { btn.disabled = false; btn.textContent = 'إرسال رمز التحقق'; }
    window._rcv = null;
  }
};

// OTP Step 2
window.doPhoneStep2 = async function () {
  const otp = document.getElementById('a-otp')?.value.trim();
  const city = document.getElementById('a-city-ph')?.value || '';
  const errEl = document.getElementById('auth-err-otp');
  const btn = document.getElementById('btn-verify-otp');
  if (!otp || otp.length < 4) { if (errEl) errEl.textContent = 'يرجى إدخال رمز التحقق'; return; }
  if (btn) { btn.disabled = true; btn.textContent = 'جارٍ التحقق...'; }
  try {
    const result = await confirmResult.confirm(otp);
    const user = result.user;
    const sn = await getDoc(doc(db, 'users', user.uid));
    if (!sn.exists()) {
      const code = await getNextCode();
      await setDoc(doc(db, 'users', user.uid), { uid: user.uid, phone: user.phoneNumber, name: 'مستخدم عُمران', city, type: null, userCode: code, createdAt: serverTimestamp() });
      if (btn) { btn.disabled = false; btn.textContent = 'تحقق ودخول ✅'; }
      go('pg-choosetype');
    } else {
      if (btn) { btn.disabled = false; btn.textContent = 'تحقق ودخول ✅'; }
      go('pg-home');
    }
  } catch (e) {
    if (errEl) errEl.textContent = 'الرمز غير صحيح — حاول مرة أخرى';
    if (btn) { btn.disabled = false; btn.textContent = 'تحقق ودخول ✅'; }
  }
};

window.backToPhone = function () {
  document.getElementById('otp-section').style.display = 'none';
  document.getElementById('phone-section').style.display = '';
  const err = document.getElementById('auth-err-ph'); if (err) err.textContent = '';
  const otp = document.getElementById('a-otp'); if (otp) otp.value = '';
  window._rcv = null; confirmResult = null;
};

// Email Register
window.doAuth = async function () {
  const email = document.getElementById('a-email')?.value.trim();
  const pass = document.getElementById('a-pass')?.value;
  const pass2 = document.getElementById('a-pass2')?.value;
  const city = document.getElementById('a-city')?.value || '';
  const btn = document.getElementById('auth-btn');
  const err = document.getElementById('auth-err');
  if (err) err.textContent = '';
  if (!email) { if (err) err.textContent = 'يرجى إدخال البريد'; return; }
  if (!pass || pass.length < 6) { if (err) err.textContent = 'كلمة المرور ٦ أحرف على الأقل'; return; }
  if (pass !== pass2) { if (err) err.textContent = 'كلمتا المرور غير متطابقتين'; return; }
  if (btn) { btn.disabled = true; btn.textContent = 'جارٍ التسجيل...'; }
  try {
    const cr = await createUserWithEmailAndPassword(auth, email, pass);
    const code = await getNextCode();
    const ud = { uid: cr.user.uid, email, name: 'مستخدم عُمران', city, type: null, userCode: code, createdAt: serverTimestamp() };
    await setDoc(doc(db, 'users', cr.user.uid), ud);
    window.curUserData = ud; window.curType = null;
    if (btn) { btn.disabled = false; btn.textContent = 'متابعة →'; }
    go('pg-choosetype');
  } catch (e) {
    if (err) err.textContent = authErr(e.code);
    if (btn) { btn.disabled = false; btn.textContent = 'متابعة →'; }
  }
};

// Login — يقبل بريد أو رقم هاتف أو أدمن
window.doLogin = async function () {
  const id = document.getElementById('l-id')?.value.trim();
  const pass = document.getElementById('l-pass')?.value;
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('login-err');
  if (err) err.textContent = '';
  if (!id || !pass) { if (err) err.textContent = 'يرجى إدخال البريد أو رقم الهاتف وكلمة المرور'; return; }

  // أدمن محلي
  if (id === '0900000000' && pass === 'admin123') {
    window.curUser = { uid: 'admin-local', email: 'admin' };
    window.curUserData = { name: 'الأدمن', type: 'admin', userCode: 'ADMIN' };
    window.curType = 'admin';
    _activateUser();
    go('pg-home');
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'جارٍ الدخول...'; }

  // رقم هاتف → بريد وهمي
  let loginEmail = id;
  if (!id.includes('@')) {
    const normalized = id.replace(/^0/, '').replace(/[^0-9]/g, '');
    loginEmail = normalized + '@omransy.phone';
  }

  try {
    await signInWithEmailAndPassword(auth, loginEmail, pass);
    if (btn) { btn.disabled = false; btn.textContent = 'دخول'; }
  } catch (e) {
    if (err) err.textContent = authErr(e.code);
    if (btn) { btn.disabled = false; btn.textContent = 'دخول'; }
  }
};

window.doLogout = async function () {
  if (window.curUser?.uid === 'admin-local') {
    window.curUser = null; window.curUserData = null; window.curType = null;
    _deactivateUser(); go('pg-home'); return;
  }
  await signOut(auth);
  window.curUser = null; window.curUserData = null; window.curType = null;
  professionals = professionals.filter(p => !p.uid || p.uid === 'demo');
  go('pg-home');
};

window.showForgot = function () { document.getElementById('main-login-card').style.display = 'none'; document.getElementById('forgot-card').style.display = ''; };
window.hideForgot = function () { document.getElementById('main-login-card').style.display = ''; document.getElementById('forgot-card').style.display = 'none'; };
window.sendReset = async function () {
  const email = document.getElementById('reset-email')?.value.trim();
  const msg = document.getElementById('reset-msg');
  if (!email) { if (msg) { msg.style.color = '#ef4444'; msg.textContent = 'يرجى إدخال البريد'; } return; }
  try {
    await sendPasswordResetEmail(auth, email);
    if (msg) { msg.style.color = '#22c55e'; msg.textContent = '✅ تم الإرسال — تحقق من بريدك'; }
  } catch (e) { if (msg) { msg.style.color = '#ef4444'; msg.textContent = authErr(e.code); } }
};

window.confirmType = async function () {
  if (!window.selTypeVal || !window.curUser) return;
  window.curType = window.selTypeVal;
  try { await updateDoc(doc(db, 'users', window.curUser.uid), { type: window.selTypeVal }); } catch (e) {}
  if (window.curUserData) window.curUserData.type = window.selTypeVal;
  _activateUser();
  if (window.selTypeVal !== 'client' && window.selTypeVal !== 'admin') go('pg-addprofile');
  else success('🎉', 'مرحباً في عُمران!', 'حسابك جاهز.');
};

// ══ SAVE PRO ══
window.savePro = async function () {
  if (!window.curUser) { alert('يرجى تسجيل الدخول'); return; }
  const name = document.getElementById('ap-name')?.value.trim();
  const desc = document.getElementById('ap-desc')?.value.trim();
  const exp = document.getElementById('ap-exp')?.value;
  const city = document.getElementById('ap-city')?.value;
  const area = document.getElementById('ap-village')?.value || document.getElementById('ap-area')?.value?.trim() || '';
  const phone = document.getElementById('ap-phone')?.value.trim();
  const wa = document.getElementById('ap-wa')?.value.trim();
  if (!name) { alert('يرجى إدخال الاسم'); return; }
  if (!window.apSpecVal) { alert('يرجى اختيار المهنة'); return; }
  if (!exp) { alert('يرجى اختيار سنوات الخبرة'); return; }
  if (!city) { alert('يرجى اختيار المدينة'); return; }
  if (!phone) { alert('يرجى إدخال رقم الهاتف'); return; }
  const sp = specialties.find(s => s.id === window.apSpecVal);
  const photos = getPhotosFromGrid('ap-photos-grid');
  const code = window.curUserData?.userCode || (await getNextCode());
  const proId = 'pro-' + window.curUser.uid + '-' + Date.now();
  const pro = { id: proId, uid: window.curUser.uid, name, type: sp?.type || window.curType || 'worker', spec: window.apSpecVal, desc: desc || '', city, area, exp, phone, wa: wa || '', avail: window.availOn, verified: false, avatar: window.apAvatarData || null, photos, userCode: code, reviews: [], createdAt: Date.now() };
  professionals.unshift(pro);
  if (window.curUserData) { window.curUserData.name = name; try { await updateDoc(doc(db, 'users', window.curUser.uid), { name }); } catch (e) {} }
  await savePro2Fs(pro);
  success('🚀', 'تم نشر ملفك!', 'ملفك الآن ظاهر للعملاء.');
};

// ══ SUBMIT REVIEW ══
window.submitReview = async function () {
  if (!window.selStar) { alert('يرجى اختيار عدد النجوم'); return; }
  if (!window.curUser) { alert('يرجى تسجيل الدخول أولاً'); go('pg-login'); return; }
  const proId = String(window.revProId);
  const p = professionals.find(x => String(x.id) === proId);
  if (!p) return;
  const rev = {
    author: window.curUserData?.name || window.curUser?.email || window.curUser?.phoneNumber || 'مستخدم',
    authorUid: window.curUser?.uid || '',
    userCode: window.curUserData?.userCode || '—',
    stars: window.selStar,
    text: document.getElementById('rev-text')?.value.trim() || '',
    date: new Date().toLocaleDateString('ar-SY'),
    ts: Date.now()
  };
  const idx = window._editRevIdx;
  try {
    const ref = doc(db, 'professionals', proId);
    const snap = await getDoc(ref);
    if (idx != null) {
      if (!p.reviews) p.reviews = [];
      p.reviews[idx] = { ...p.reviews[idx], ...rev, date: 'تم التعديل' };
      window._editRevIdx = null;
      if (!snap.exists()) { await setDoc(ref, { ...p, id: proId }); }
      else { await setDoc(ref, { reviews: p.reviews }, { merge: true }); }
    } else {
      if (!snap.exists()) {
        await setDoc(ref, { ...p, id: proId, reviews: [rev] });
      } else {
        await updateDoc(ref, { reviews: arrayUnion(rev) });
      }
      if (!p.reviews) p.reviews = [];
      p.reviews.unshift(rev);
    }
    closeModal('mo-review');
    openDetail(window.revProId);
  } catch (e) {
    console.error('submitReview:', e);
    alert('خطأ في الحفظ: ' + (e.message || 'تحقق من الاتصال'));
  }
};

window.deleteReview = async function (proId, idx) {
  if (!confirm('حذف هذا التعليق؟')) return;
  const p = professionals.find(x => String(x.id) === String(proId));
  if (!p) return;
  p.reviews.splice(idx, 1);
  await updatePro2Fs(proId, { reviews: p.reviews });
  openDetail(proId);
};

// ══ ADMIN FIREBASE ACTIONS ══
window.toggleProAvail = function (id) {
  const p = professionals.find(x => String(x.id) === String(id));
  if (p) { p.avail = !p.avail; updatePro2Fs(id, { avail: p.avail }); renderAdmin(); }
};
window.toggleVerified = function (id) {
  const p = professionals.find(x => String(x.id) === String(id));
  if (p) { p.verified = !p.verified; updatePro2Fs(id, { verified: p.verified }); renderAdmin(); }
};
window.deletePro = function (id) {
  if (!confirm('حذف هذا الشخص نهائياً؟')) return;
  professionals = professionals.filter(p => String(p.id) !== String(id));
  deletePro2Fs(id);
  renderAdmin();
};
window.saveEditPro = async function () {
  const p = professionals.find(x => x.id === epProId);
  if (!p) return;
  const name = document.getElementById('ep-name')?.value.trim();
  const phone = document.getElementById('ep-phone')?.value.trim();
  const wa = document.getElementById('ep-wa')?.value.trim();
  const area = document.getElementById('ep-area')?.value.trim();
  const desc = document.getElementById('ep-desc')?.value.trim();
  if (!name || !phone) { alert('يرجى ملء الاسم والهاتف'); return; }
  p.name = name; p.phone = phone; p.wa = wa; p.area = area; p.desc = desc; p.avail = epAvailOn;
  await updatePro2Fs(epProId, { name, phone, wa, area, desc, avail: epAvailOn });
  closeModal('mo-edit-pro');
  renderAdmin();
};
window.saveAdminMember = async function () {
  const name = document.getElementById('am-name')?.value.trim();
  const desc = document.getElementById('am-desc')?.value.trim();
  const exp = document.getElementById('am-exp')?.value;
  const city = document.getElementById('am-city')?.value;
  const area = document.getElementById('am-area')?.value.trim();
  const phone = document.getElementById('am-phone')?.value.trim();
  const wa = document.getElementById('am-wa')?.value.trim();
  const type = document.getElementById('am-type')?.value;
  if (!name || !window.amSpecVal || !phone) { alert('يرجى ملء الاسم والمهنة والهاتف'); return; }
  const photos = getPhotosFromGrid('am-photos-grid');
  const code = await getNextCode();
  const pro = { id: 'pro-admin-' + Date.now(), uid: 'admin-added', name, type, spec: window.amSpecVal, desc: desc || '', city: city || '', area: area || '', exp: exp || '', phone, wa: wa || '', avail: window.amAvailOn, verified: true, avatar: window.amAvatarData || null, photos, userCode: code, reviews: [], createdAt: Date.now() };
  professionals.unshift(pro);
  await savePro2Fs(pro);
  success('✅', 'تم إضافة ' + name + '!', 'مضاف ومنشور للعملاء.');
};

window.saveName = async function () {
  const n = document.getElementById('set-name')?.value.trim();
  if (!n) { alert('يرجى إدخال الاسم'); return; }
  if (window.curUserData) window.curUserData.name = n;
  try { await updateDoc(doc(db, 'users', window.curUser.uid), { name: n }); } catch (e) {}
  success('✅', 'تم تغيير الاسم!', 'اسمك الجديد: ' + n);
};

window.savePass = async function () {
  const old = document.getElementById('set-old-pass')?.value;
  const n = document.getElementById('set-new-pass')?.value;
  const n2 = document.getElementById('set-new-pass2')?.value;
  if (!old || !n || !n2) { alert('يرجى ملء جميع الحقول'); return; }
  if (n.length < 6) { alert('كلمة المرور ٦ أحرف على الأقل'); return; }
  if (n !== n2) { alert('كلمتا المرور غير متطابقتين'); return; }
  try {
    const cr = EmailAuthProvider.credential(window.curUser.email, old);
    await reauthenticateWithCredential(window.curUser, cr);
    await updatePassword(window.curUser, n);
    ['set-old-pass', 'set-new-pass', 'set-new-pass2'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    success('🔑', 'تم تغيير كلمة المرور!', 'كلمة مرورك الجديدة فعّالة الآن.');
  } catch (e) { alert(authErr(e.code)); }
};

// ══ DASHBOARD ══
window.renderDashboard = async function () {
  const el = document.getElementById('dashboard-content');
  if (!el) return;
  if (window.curType !== 'admin') { go('pg-home'); return; }
  el.innerHTML = '<div class="loading-spin"></div>';
  let users = [];
  try { const sn = await getDocs(collection(db, 'users')); sn.forEach(d => users.push(d.data())); } catch (e) {}
  const totalUsers = users.length, totalPros = professionals.length;
  const totalReviews = professionals.reduce((s, p) => s + (p.reviews?.length || 0), 0);
  const availPros = professionals.filter(p => p.avail).length;
  const cityCount = {}; professionals.forEach(p => { if (p.city) { cityCount[p.city] = (cityCount[p.city] || 0) + 1; } });
  const sortedCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCity = sortedCities[0]?.[1] || 1;
  const specCount = {}; professionals.forEach(p => { if (p.spec) { specCount[p.spec] = (specCount[p.spec] || 0) + 1; } });
  const sortedSpecs = Object.entries(specCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topRated = professionals.filter(p => p.reviews?.length >= 1).sort((a, b) => { const ra = a.reviews.reduce((s, r) => s + r.stars, 0) / a.reviews.length; const rb = b.reviews.reduce((s, r) => s + r.stars, 0) / b.reviews.length; return rb - ra; }).slice(0, 5);
  const clrs = ['#1a56db', '#22c55e', '#f59e0b', '#ef4444', '#7c3aed', '#06b6d4'];
  el.innerHTML = `
    <div class="dash-grid">
      <div class="dash-card"><div class="dash-num">${totalUsers}</div><div class="dash-lbl">👤 مستخدم</div></div>
      <div class="dash-card"><div class="dash-num">${totalPros}</div><div class="dash-lbl">🔨 محترف</div></div>
      <div class="dash-card"><div class="dash-num">${totalReviews}</div><div class="dash-lbl">⭐ تقييم</div></div>
      <div class="dash-card"><div class="dash-num">${availPros}</div><div class="dash-lbl">✅ متاح</div></div>
    </div>
    <div class="chart-wrap"><div class="chart-title">📍 المحترفون حسب المحافظة</div>
      ${sortedCities.length ? sortedCities.map(([city, cnt], i) => `<div class="dash-row"><div class="dash-icon" style="background:${clrs[i]}22;color:${clrs[i]};font-weight:800;font-size:13px">${i + 1}</div><div style="flex:1"><div style="font-size:13px;font-weight:700;margin-bottom:3px">${city}</div><div class="dash-bar-wrap"><div class="dash-bar" style="width:${Math.round(cnt / maxCity * 100)}%;background:${clrs[i]}"></div></div></div><div style="font-size:15px;font-weight:900;color:${clrs[i]};min-width:24px;text-align:left">${cnt}</div></div>`).join('') : '<div style="text-align:center;padding:20px;color:var(--text3)">لا بيانات بعد</div>'}
    </div>
    <div class="chart-wrap"><div class="chart-title">🏆 الأعلى تقييماً</div>
      ${topRated.length ? topRated.map((p, i) => { const avg = (p.reviews.reduce((s, r) => s + r.stars, 0) / p.reviews.length).toFixed(1); return `<div class="dash-row"><div style="font-size:20px;min-width:28px">${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</div><div style="flex:1"><div style="font-size:13px;font-weight:700">${p.name}</div><div style="font-size:11px;color:var(--text3)">${p.spec}</div></div><div style="font-size:13px;font-weight:800;color:#f59e0b">⭐ ${avg}</div></div>`; }).join('') : '<div style="text-align:center;padding:20px;color:var(--text3)">لا تقييمات بعد</div>'}
    </div>
    <div class="chart-wrap"><div class="chart-title">🆕 آخر المسجلين</div>
      ${users.length ? users.slice(-6).reverse().map(u => `<div class="dash-row"><div class="dash-icon" style="background:var(--blue-lt);color:var(--blue)">👤</div><div style="flex:1"><div style="font-size:13px;font-weight:700">${u.name || 'مستخدم'}</div><div style="font-size:11px;color:var(--text3)">${u.email || u.phone || ''}</div></div><div style="font-size:11px;font-weight:700;color:var(--blue)">#${u.userCode || '—'}</div></div>`).join('') : '<div style="text-align:center;padding:20px;color:var(--text3)">لا مستخدمين بعد</div>'}
    </div>`;
};

// ══ INIT CITIES على DOM جاهز ══
document.addEventListener('DOMContentLoaded', () => {
  window.buildCitySelect('home-city-sel');
  window.buildCitySelect('br-city-sel');
  window.buildCitySelect('a-city', false);
  window.buildCitySelect('a-city-ph', false);
  document.querySelectorAll('.mo').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); }));
});
