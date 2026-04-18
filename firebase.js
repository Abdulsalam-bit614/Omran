// firebase.js — جاهز 100%

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ⚠️ بيانات مشروعك (مثل ما عطيتني)
const firebaseConfig = {
  apiKey: "AIzaSyDNTuigUGGpTAKadc2Io71zV-RIYNc7-6c",
  authDomain: "ibbni-55e41.firebaseapp.com",
  projectId: "ibbni-55e41",
  storageBucket: "ibbni-55e41.firebasestorage.app",
  messagingSenderId: "429036025018",
  appId: "1:429036025018:web:f0dd72fa90771ee0f43e83",
  measurementId: "G-XFSPZS1RDD"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================
// 🔐 تسجيل الدخول
// ============================
window.doLogin = async function () {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;

  if (!email || !pass) {
    alert("اكتب ايميل وكلمة مرور");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    alert("✅ تم تسجيل الدخول");
  } catch (e) {
    alert("❌ خطأ: " + e.message);
  }
};

// ============================
// 🆕 إنشاء حساب
// ============================
window.doAuth = async function () {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;

  if (!email || !pass) {
    alert("اكتب ايميل وكلمة مرور");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);

    // نحفظ بيانات المستخدم
    await setDoc(doc(db, "users", userCred.user.uid), {
      email: email,
      type: "client",
      createdAt: Date.now()
    });

    alert("✅ تم إنشاء الحساب");
  } catch (e) {
    alert("❌ خطأ: " + e.message);
  }
};

// ============================
// 🚪 تسجيل خروج
// ============================
window.doLogout = async function () {
  await signOut(auth);
  alert("تم تسجيل الخروج");
};

// ============================
// 👤 حالة المستخدم
// ============================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    window.curUser = user;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      window.curUserData = snap.data();
      window.curType = snap.data().type;
    }

    if (typeof _activateUser === "function") _activateUser();

  } else {
    window.curUser = null;
    window.curUserData = null;
    window.curType = null;

    if (typeof _deactivateUser === "function") _deactivateUser();
  }
});
