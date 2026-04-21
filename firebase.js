// ══════════════════════════════════════════
// عُمران — Firebase Backend
// ══════════════════════════════════════════

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore,
  doc, setDoc, getDoc, updateDoc, getDocs,
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Config ──
const firebaseConfig = {
  apiKey: "AIzaSyDNTuigUGGpTAKadc2Io71zV-RIYNc7-6c",
  authDomain: "ibbni-55e41.firebaseapp.com",
  projectId: "ibbni-55e41",
  storageBucket: "ibbni-55e41.firebasestorage.app",
  messagingSenderId: "429036025018",
  appId: "1:429036025018:web:f0dd72fa90771ee0f43e83"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ══════════════════════════════════════════
// AUTH — تسجيل جديد بالإيميل
// ══════════════════════════════════════════
window.doAuth = async function() {
  const em    = document.getElementById('a-email').value.trim();
  const pass  = document.getElementById('a-pass').value;
  const pass2 = document.getElementById('a-pass2').value;
  if (!em)             { alert('يرجى إدخال البريد الإلكتروني'); return; }
  if (pass.length < 6) { alert('كلمة المرور ٦ أحرف على الأقل'); return; }
  if (pass !== pass2)  { alert('كلمتا المرور غير متطابقتين'); return; }

  const btn = document.getElementById('btn-auth');
  if (btn) btn.classList.add('btn-loading');
  try {
    const cred = await createUserWithEmailAndPassword(auth, em, pass);
    const code = window.genUserCode ? window.genUserCode() : 'IBN-' + Date.now();
    const data = { email: em, name: 'مستخدم عُمران', userCode: code, type: null, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'users', cred.user.uid), data);
    window.curUser = { ...data, uid: cred.user.uid };
    window.curType = null;
    if (btn) btn.classList.remove('btn-loading');
    window.go('pg-choosetype');
  } catch(e) {
    if (btn) btn.classList.remove('btn-loading');
    const msgs = {
      'auth/email-already-in-use': 'هذا البريد مسجّل مسبقاً',
      'auth/invalid-email': 'البريد غير صحيح',
      'auth/weak-password': 'كلمة المرور ضعيفة جداً'
    };
    alert(msgs[e.code] || 'خطأ: ' + e.message);
  }
};

// ══════════════════════════════════════════
// AUTH — تسجيل دخول بالإيميل
// ══════════════════════════════════════════
window.doLogin = async function() {
  const id   = document.getElementById('l-id').value.trim();
  const pass = document.getElementById('l-pass').value;
  if (!id || !pass) { alert('يرجى إدخال البريد وكلمة المرور'); return; }

  // أدمن محلي — أولوية قصوى قبل أي شيء
  if ((id === '0900000000' || id === 'admin') && pass === 'admin123') {
    window.curUser = { name: 'الأدمن', type: 'admin', userCode: 'IBN-00000', uid: 'admin', phone: '0900000000' };
    window.curType = 'admin';
    // أضفه لـ users array عشان يتعرف عليه
    if (!window.users.find(u => u.phone === '0900000000')) {
      window.users.push(window.curUser);
    }
    window.activateUser();
    return;
  }

  const btn = document.getElementById('btn-login');
  if (btn) btn.classList.add('btn-loading');
  try {
    const cred = await signInWithEmailAndPassword(auth, id, pass);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (snap.exists()) {
      const data = snap.data();
      window.curUser = { ...data, uid: cred.user.uid };
      window.curType = data.type || null;
    }
    if (btn) btn.classList.remove('btn-loading');
    if (window.curType) window.activateUser();
    else window.go('pg-choosetype');
  } catch(e) {
    if (btn) btn.classList.remove('btn-loading');
    const msgs = {
      'auth/user-not-found': 'لا يوجد حساب بهذا البريد',
      'auth/wrong-password': 'كلمة المرور غير صحيحة',
      'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
      'auth/invalid-email': 'البريد غير صحيح'
    };
    alert(msgs[e.code] || 'خطأ في الدخول');
  }
};

// ══════════════════════════════════════════
// AUTH — تسجيل دخول بـ Google
// ══════════════════════════════════════════
window.doLoginGoogle = async function() {
  const provider = new GoogleAuthProvider();
  try {
    const cred = await signInWithPopup(auth, provider);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (snap.exists()) {
      const data = snap.data();
      window.curUser = { ...data, uid: cred.user.uid };
      window.curType = data.type || null;
    } else {
      const code = window.genUserCode ? window.genUserCode() : 'IBN-' + Date.now();
      const data = { email: cred.user.email, name: cred.user.displayName || 'مستخدم عُمران', userCode: code, type: null, createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'users', cred.user.uid), data);
      window.curUser = { ...data, uid: cred.user.uid };
      window.curType = null;
    }
    if (window.curType) window.activateUser();
    else window.go('pg-choosetype');
  } catch(e) {
    if (e.code !== 'auth/popup-closed-by-user')
      alert('خطأ في الدخول بـ Google');
  }
};

// ══════════════════════════════════════════
// AUTH — تأكيد نوع الحساب
// ══════════════════════════════════════════
window.confirmType = function() {
  const selTypeVal = window.selTypeVal;
  if (!selTypeVal) return;
  window.curType = selTypeVal;
  if (window.curUser) window.curUser.type = selTypeVal;
  window.activateUser();
  // حفظ في Firestore بالخلفية
  if (window.curUser?.uid && window.curUser.uid !== 'admin') {
    updateDoc(doc(db, 'users', window.curUser.uid), { type: selTypeVal })
      .catch(e => console.log('confirmType save:', e));
  }
};

// ══════════════════════════════════════════
// AUTH — تسجيل خروج
// ══════════════════════════════════════════
window.logout = async function() {
  if (window.curUser?.uid !== 'admin') {
    await signOut(auth).catch(() => {});
  }
  window.curUser = null;
  window.curType = null;
  window.selTypeVal = null;
  document.getElementById('top-auth').style.display = '';
  document.getElementById('top-me').style.display = 'none';
  document.getElementById('top-admin').style.display = 'none';
  document.getElementById('top-code').style.display = 'none';
  document.getElementById('hero-out').style.display = 'block';
  document.getElementById('hero-in').style.display = 'none';
  document.getElementById('chat-dot').style.display = 'none';
  document.getElementById('nav-badge').style.display = 'none';
  window.go('pg-home');
};

// ══════════════════════════════════════════
// AUTH — استعادة الجلسة تلقائياً بعد Refresh
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// AUTH — استعادة الجلسة بعد Refresh
// ══════════════════════════════════════════
onAuthStateChanged(auth, async (fbUser) => {
  // لا تتدخل أبداً إذا في مستخدم موجود
  if (window.curUser) return;
  
  if (fbUser) {
    // مسجل في Firebase — استعد بياناته
    try {
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        window.curUser = { ...data, uid: fbUser.uid };
        window.curType = data.type || null;
        if (window.curType) {
          window.activateUser();
          window.go('pg-home');
        } else {
          window.go('pg-choosetype');
        }
      }
    } catch(e) { console.log('session restore:', e); }
  }
  // إذا ما في fbUser — لا تعمل شيء، اتركه على صفحة الرئيسية
});

// ══════════════════════════════════════════
// FIRESTORE — حفظ وجلب المعلمين
// ══════════════════════════════════════════
window.saveProfessionalToDB = async function(pro) {
  try {
    await setDoc(doc(db, 'professionals', String(pro.id)), {
      id: String(pro.id),
      name: pro.name || '',
      type: pro.type || 'worker',
      spec: pro.spec || '',
      area: pro.area || '',
      phone: pro.phone || '',
      wa: pro.wa || '',
      exp: pro.exp || '',
      desc: pro.desc || '',
      avail: pro.avail !== false,
      verified: pro.verified || false
    });
  } catch(e) { console.log('savePro:', e); }
};

window.loadProfessionalsFromDB = async function() {
  try {
    const snap = await getDocs(collection(db, 'professionals'));
    if (snap.empty) return;
    snap.docs.forEach(d => {
      const p = { ...d.data(), reviews: [] };
      const idx = window.professionals.findIndex(x => String(x.id) === String(p.id) || x.phone === p.phone);
      if (idx >= 0) window.professionals[idx] = { ...window.professionals[idx], ...p };
      else window.professionals.unshift(p);
    });
    window.renderPros();
  } catch(e) { console.log('loadPros:', e); }
};

// ══════════════════════════════════════════
// FIRESTORE — حفظ وجلب الطلبات
// ══════════════════════════════════════════
window.saveRequestToDB = async function(req) {
  try {
    await setDoc(doc(db, 'requests', String(req.id)), {
      id: String(req.id),
      clientName: req.clientName || '',
      clientCode: req.clientCode || '',
      phone: req.phone || '',
      spec: req.spec || '',
      area: req.area || '',
      det: req.det || '',
      status: req.status || 'new',
      date: req.date || ''
    });
  } catch(e) { console.log('saveReq:', e); }
};

window.loadRequestsFromDB = async function() {
  try {
    const snap = await getDocs(collection(db, 'requests'));
    snap.docs.forEach(d => {
      const r = { ...d.data() };
      if (!window.myRequests.find(x => String(x.id) === String(r.id)))
        window.myRequests.push(r);
    });
  } catch(e) { console.log('loadReqs:', e); }
};

// ══════════════════════════════════════════
// FIRESTORE — الرسائل اللحظية
// ══════════════════════════════════════════
window.sendFireMsg = async function(proId, text) {
  if (!window.curUser?.uid || !text?.trim()) return;
  const chatId = [window.curUser.uid, String(proId)].sort().join('_');
  try {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text,
      sender: window.curUser.uid,
      senderName: window.curUser.name || 'مستخدم',
      time: serverTimestamp()
    });
  } catch(e) { console.log('sendMsg:', e); }
};

window.listenChat = function(proId, callback) {
  if (!window.curUser?.uid) return null;
  const chatId = [window.curUser.uid, String(proId)].sort().join('_');
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('time'));
  return onSnapshot(q, snap => {
    const msgs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        out: data.sender === window.curUser.uid,
        text: data.text,
        senderName: data.senderName,
        time: data.time?.toDate
          ? new Date(data.time.toDate()).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
          : '',
        tp: 'text'
      };
    });
    callback(msgs);
  });
};

// ══════════════════════════════════════════
// INIT — تحميل البيانات عند البداية
// ══════════════════════════════════════════
window.loadProfessionalsFromDB();
