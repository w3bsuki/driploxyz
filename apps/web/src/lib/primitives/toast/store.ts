// Minimal toast store placeholder to satisfy imports until full implementation.
import { writable } from 'svelte/store';
export interface ToastData { id: string; message: string; type?: 'success'|'error'|'info'; duration?: number }
const { subscribe, update } = writable<ToastData[]>([]);
export function addToastData(t: Omit<ToastData,'id'> & { id?: string }) {
  const id = t.id || Math.random().toString(36).slice(2);
  update(list => [...list, { id, ...t }]);
  return id;
}
export function removeToastData(id: string) { update(list => list.filter(t => t.id !== id)); }
export default { subscribe, addToastData, removeToastData };
