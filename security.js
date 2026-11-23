(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STORAGE_KEY = 'deadline.student.tasks.v1';
  const ITERATIONS = 310000;
  const MAX_FILE_SIZE = 5_000_000;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', {fatal: true});

  function showError(id, message) { $(id).textContent = message; $(id).hidden = !message; }
  function byteToBase64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i,i+8192));
    return btoa(s);
  }
  function base64ToBytes(s) {
    if (typeof s !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(s) || s.length % 4 !== 0 || s.length > 7_000_000) throw new Error('Vigane krüptitud varukoopia');
    const decoded = atob(s);
    return Uint8Array.from(decoded, c => c.charCodeAt(0));
  }
  async function derive(password, salt) {
    const base = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function encryptBackup(tasks,password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await derive(password,salt);
    const payload = encoder.encode(JSON.stringify({app:'Deadline',version:1,tasks}));
    const encrypted = await crypto.subtle.encrypt({name:'AES-GCM',iv},key,payload);
    return JSON.stringify({app:'Deadline',version:2,encrypted:true,kdf:'PBKDF2-SHA256',iterations:ITERATIONS,cipher:'AES-256-GCM',salt:byteToBase64(salt),iv:byteToBase64(iv),payload:byteToBase64(new Uint8Array(encrypted))},null,2);
  }
  async function decryptBackup(raw,password) {
    if (!raw || raw.app !== 'Deadline' || raw.version !== 2 || raw.encrypted !== true || raw.kdf !== 'PBKDF2-SHA256' || raw.cipher !== 'AES-256-GCM' || raw.iterations !== ITERATIONS) throw new Error('Vale krüptitud varukoopia vorming');
    const salt = base64ToBytes(raw.salt), iv = base64ToBytes(raw.iv), payload = base64ToBytes(raw.payload);
    if (salt.length !== 16 || iv.length !== 12 || payload.length < 17 || payload.length > MAX_FILE_SIZE) throw new Error('Vigased krüptitud andmed');
    const key = await derive(password,salt);
    const bytes = await crypto.subtle.decrypt({name:'AES-GCM',iv},key,payload);
    return JSON.parse(decoder.decode(bytes));
  }
  function validDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y,m,d] = s.split('-').map(Number);
    if (y<1900 || y>2100) return false;
    const date = new Date(y,m-1,d);
    return date.getFullYear() === y && date.getMonth() === m-1 && date.getDate() === d;
  }
  function isTask(t) {
    return t && typeof t === 'object' && !Array.isArray(t) &&
      typeof t.title === 'string' && t.title.trim().length > 0 && t.title.length <= 120 &&
      ['exam','homework','project'].includes(t.type) && validDate(t.date) &&
      typeof t.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(t.id) &&
      (t.course == null || (typeof t.course === 'string' && t.course.length <= 100)) &&
      (t.notes == null || (typeof t.notes === 'string' && t.notes.length <= 700)) &&
      (t.time == null || t.time === '' || (typeof t.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t.time))) &&
      (t.important == null || typeof t.important === 'boolean') && (t.done == null || typeof t.done === 'boolean') &&
      (t.createdAt == null || (typeof t.createdAt === 'number' && Number.isFinite(t.createdAt)));
  }
  function validatePayload(raw) {
    if (!raw || raw.app !== 'Deadline' || raw.version !== 1 || !Array.isArray(raw.tasks) || raw.tasks.length > 5000) throw new Error('Vigane varukoopia sisu');
    const ids = new Set();
    for (const task of raw.tasks) {
      if (!isTask(task) || ids.has(task.id)) throw new Error('Varukoopia sisaldab vigaseid või korduvaid ülesandeid');
      ids.add(task.id);
    }
    return raw.tasks;
  }
  function download(content) {
    const blob = new Blob([content],{type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deadline-krüptitud-${new Date().toISOString().slice(0,10)}.json`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  function announce(message) { $('toastText').textContent = message; $('toast').hidden = false; }
  function setupDialog(name) {
    const dialog = $(`secure${name}Dialog`);
    document.querySelectorAll(`.close-secure-${name.toLowerCase()}`).forEach(b=>b.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('click',event=>{ if (event.target === dialog) dialog.close(); });
    return dialog;
  }
  const backupDialog = setupDialog('Backup');
  const restoreDialog = setupDialog('Restore');
  $('openSecureBackup').addEventListener('click',()=>{
    $('secureBackupForm').reset(); showError('backupError',''); backupDialog.showModal();
  });
  $('openSecureRestore').addEventListener('click',()=>{
    $('secureRestoreForm').reset(); showError('restoreError',''); restoreDialog.showModal();
  });
  $('secureBackupForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const pass = $('backupPassword').value;
    if (pass.length < 12 || pass !== $('backupPasswordConfirm').value) { showError('backupError','Parool peab olema vähemalt 12 märki ja mõlemal väljal sama.'); return; }
    if (!crypto?.subtle) { showError('backupError','Krüpteerimine nõuab turvalist HTTPS-ühendust.'); return; }
    $('confirmSecureBackup').disabled = true;
    try {
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const payload = validatePayload({app:'Deadline',version:1,tasks});
      download(await encryptBackup(payload,pass));
      $('secureBackupForm').reset(); backupDialog.close(); announce('Krüptitud varukoopia alla laaditud');
    } catch (err) { showError('backupError', 'Varukoopiat ei saanud salvestada. Kontrolli andmeid ja brauseri õigusi.'); }
    finally { $('confirmSecureBackup').disabled = false; }
  });
  $('secureRestoreForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const file = $('encryptedBackupInput').files?.[0];
    if (!file || file.size > MAX_FILE_SIZE) { showError('restoreError','Vali kuni 5 MB suurune JSON-varukoopia.'); return; }
    if (!crypto?.subtle) { showError('restoreError','Taastamine nõuab turvalist HTTPS-ühendust.'); return; }
    $('confirmSecureRestore').disabled = true;
    try {
      const raw = JSON.parse(await file.text());
      const tasks = validatePayload(await decryptBackup(raw,$('restorePassword').value));
      if (!window.confirm(`Kas asendan kõik praegused tähtajad (${tasks.length} kirjet)? Soovi korral salvesta enne praegusest seisust varukoopia.`)) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      $('secureRestoreForm').reset(); restoreDialog.close();
      location.reload();
    } catch (err) { showError('restoreError', 'Taastamine ebaõnnestus. Kontrolli parooli, faili ja salvestusruumi.'); }
    finally { $('confirmSecureRestore').disabled = false; }
  });
})();