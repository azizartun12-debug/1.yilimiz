import { db } from "./firestore";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";

export async function listTodos(uid) {
  const q = query(collection(db, `users/${uid}/todos`), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addTodo(uid, text) {
  const ref = await addDoc(collection(db, `users/${uid}/todos`), {
    text,
    done: false,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, text, done: false };
}

export async function toggleTodo(uid, id, done) {
  await updateDoc(doc(db, `users/${uid}/todos/${id}`), { done });
}

export async function removeTodo(uid, id) {
  await deleteDoc(doc(db, `users/${uid}/todos/${id}`));
}