// firebase.js — FINAL CLEAN VERSION

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  getFirestore, doc, setDoc, getDoc,
  collection, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp, increment
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// 🔥 CONFIG (جاهز)
const firebaseConfig = {
  apiKey: "AIzaSyDNTuigUGGpTAKadc2Io71zV-RIYNc7-6c",
  authDomain: "ibbni-55e41.firebaseapp.com",
  projectId: "ibbni-55e41",
  storageBucket: "ibbni-55e41.firebasestorage.app",
  messagingSenderId: "429036025018",
  appId: "1:429036025018:web:f0dd72fa90771ee0f43e83"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🌍 GLOBAL
window.curUser = null;
window.curUserData = null;
window.professionals = [];

// 🔢 USER CODE
async function getNextCode() {
  const ref = doc(db, 'meta', 'counter');
  await setDoc(ref, { count: increment(1) }, { merge: true });
  const snap = await getDoc(ref);
  return 'U-' + String(snap.data().count).padStart(5, '0');
}

// 👤 REGISTER (متوافق مع HTML تبعك)
window.doAuth = async function () {
  const email = document.getElementById('a-email').value;
  const pass = document.getElementById('a-pass').value;

  if (!email || pass.length < 6) {
    alert('تأكد من البيانات');
    return;
  }

  const res = await createUserWithEmailAndPassword(auth, email, pass);
  const code = await getNextCode();

  await setDoc(doc(db, 'users', res.user.uid), {
    uid: res.user.uid,
    email,
    type: 'client',
    userCode: code,
    createdAt: serverTimestamp()
  });

  alert('تم إنشاء الحساب ✅');
};

// 🔐 LOGIN (متوافق مع HTML)
window.doLogin = async function () {
  const email = document.getElementById('l-id').value;
  const pass = document.getElementById('l-pass').value;

  if (!email || !pass) {
    alert('املأ الحقول');
    return;
  }

  await signInWithEmailAndPassword(auth, email, pass);
  alert('تم تسجيل الدخول ✅');
};

// 🚪 LOGOUT
window.logout = async function () {
  await signOut(auth);
};

// 📡 REALTIME
function watchPros() {
  const col = collection(db, 'professionals');

  onSnapshot(col, (snap) => {
    professionals = [];

    snap.forEach(doc => {
      professionals.push({ ...doc.data(), id: doc.id });
    });

    if (window.renderPros) renderPros();
    if (window.renderDashboard) renderDashboard();
  });
}

// ➕ ADD PRO
window.addPro = async function () {
  const name = document.getElementById('ap-name').value;
  const phone = document.getElementById('ap-phone').value;
  const city = document.getElementById('ap-city').value;

  if (!name || !phone) {
    alert('املأ الحقول');
    return;
  }

  const id = 'pro-' + Date.now();

  await setDoc(doc(db, 'professionals', id), {
    id,
    name,
    phone,
    city,
    verified: false,
    avail: true,
    createdAt: Date.now(),
    reviews: []
  });

  alert('تمت الإضافة ✅');
};

// ❌ DELETE
window.deletePro = async function (id) {
  if (!confirm('حذف؟')) return;
  await deleteDoc(doc(db, 'professionals', id));
};

// ✅ VERIFY
window.verifyPro = async function (id) {
  await updateDoc(doc(db, 'professionals', id), {
    verified: true
  });
};

// ⭐ REVIEW
window.addReview = async function (proId, stars) {
  const ref = doc(db, 'professionals', proId);
  const snap = await getDoc(ref);

  const data = snap.data();
  const reviews = data.reviews || [];

  reviews.push({
    stars,
    date: new Date().toLocaleDateString()
  });

  await updateDoc(ref, { reviews });
};

// 🔄 AUTH STATE
onAuthStateChanged(auth, async (user) => {
  if (user) {
    window.curUser = user;

    const snap = await getDoc(doc(db, 'users', user.uid));
    window.curUserData = snap.data();

    watchPros();
  } else {
    window.curUser = null;
    professionals = [];
  }
});
