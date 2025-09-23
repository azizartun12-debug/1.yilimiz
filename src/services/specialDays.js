import { db } from "./firestore";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";

export async function listSpecialDays(uid) {
  const q = query(collection(db, `users/${uid}/specialDays`), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addSpecialDay(uid, payload) {
  const ref = await addDoc(collection(db, `users/${uid}/specialDays`), {
    title: payload.title,
    date: payload.date,
    note: payload.note || "",
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload };
}

export async function removeSpecialDay(uid, id) {
  await deleteDoc(doc(db, `users/${uid}/specialDays/${id}`));
}