import { db } from "./firestore";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";

export async function listTrips(uid) {
  const q = query(collection(db, `users/${uid}/trips`), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addTrip(uid, payload) {
  const ref = await addDoc(collection(db, `users/${uid}/trips`), {
    name: payload.name || "(isimsiz)",
    note: payload.note || "",
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload };
}

export async function removeTrip(uid, id) {
  await deleteDoc(doc(db, `users/${uid}/trips/${id}`));
}