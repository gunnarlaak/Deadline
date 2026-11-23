(() => {
  'use strict';

  const STORAGE_KEY = 'deadline.student.tasks.v1';
  const types = {
    exam: { label: 'Eksam', plural: 'Eksamid', icon: 'graduation-cap' },
    homework: { label: 'Kodutöö', plural: 'Kodutööd', icon: 'book-open' },
    project: { label: 'Projekt', plural: 'Projektid', icon: 'briefcase-business' }
  };
  const iconPaths = {
    'layout-dashboard': '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    'calendar-days': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    'layers': '<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
    'graduation-cap': '<path d="m2 10 10-6 10 6-10 6-10-6ZM6 12.5V17c3.6 2.8 8.4 2.8 12 0v-4.5M22 10v7"/>',
    'book-open': '<path d="M12 7c-3-2-6-2.2-9-1v14c3-1.2 6-1 9 1 3-2 6-2.2 9-1V6c-3-1.2-6-1-9 1ZM12 7v14"/>',
    'briefcase-business': '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13c5.5 3.7 12.5 3.7 18 0M12 13v3"/>',
    'sparkles': '<path d="m12 3 1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3ZM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17ZM4 2l.6 1.4L6 4l-1.4.6L4 6l-.6-1.4L2 4l1.4-.6L4 2Z"/>',
    'download': '<path d="M12 3v12m0 0 5-5m-5 5-5-5M4 16v4h16v-4"/>',
    'upload': '<path d="M12 16V4m0 0 5 5m-5-5L7 9M4 16v4h16v-4"/>',
    'shield-check': '<path d="m12 2 8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3ZM9 12l2 2 4-4"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'arrow-up-right': '<path d="M6 18 18 6M8 6h10v10"/>',
    'alert-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',
    'clock-3': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5h5"/>',
    'calendar-clock': '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M7 2v4M17 2v4M3 9h18"/><circle cx="14" cy="15" r="3.5"/><path d="M14 13v2h1.5"/>',
    'check-circle-2': '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    'calendar-plus': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M12 13v5M9.5 15.5h5"/>',
    'list': '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'check': '<path d="m5 12 4 4L19 6"/>',
    'x': '<path d="M18 6 6 18M6 6l12 12"/>',
    'pencil': '<path d="m16 4 4 4M4 20l4.5-1 12-12a2.8 2.8 0 0 0-4-4l-12 12L4 20Z"/>',
    'trash-2': '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
    'star': '<path d="m12 2 2.9 6 6.6 1-4.8 4.7 1.2 6.6-5.9-3.1-5.9 3.1 1.2-6.6L2.5 9l6.6-1L12 2Z"/>',
    'calendar-check': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18m-12 5 2 2 4-4"/>',
    'inbox': '<path d="M4 4h16l2 11v5H2v-5L4 4ZM2 15h6l2 3h4l2-3h6"/>'
  };
  const $ = (id) => document.getElementById(id);
  function mountIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
      const path = iconPaths[el.dataset.icon];
      if (path && !el.querySelector('svg')) el.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24">${path}</svg>`;
    });
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function isoLocal(date = new Date()) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
  function dateParts(str) { const [y, m, d] = String(str).split('-').map(Number); return [y,m,d]; }
  function validDate(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const [y, m, d] = dateParts(str);
    if (y < 1900 || y > 2100) return false;
    const check = new Date(y, m - 1, d);
    return check.getFullYear() === y && check.getMonth() === m - 1 && check.getDate() === d;
  }
  function dateFromIso(str) { const [y,m,d] = dateParts(str); return new Date(y,m-1,d); }
  function addDays(iso, number) { const date = dateFromIso(iso); date.setDate(date.getDate() + number); return isoLocal(date); }
  function daysUntil(iso) {
    const [y,m,d] = dateParts(iso); const [ty,tm,td] = dateParts(isoLocal());
    return Math.round((Date.UTC(y,m-1,d) - Date.UTC(ty,tm-1,td)) / 86400000);
  }
  function formatDate(iso, withYear = false) {
    const options = {day:'numeric',month:'short'};
    if (withYear || dateParts(iso)[0] !== new Date().getFullYear()) options.year = 'numeric';
    return new Intl.DateTimeFormat('et-EE', options).format(dateFromIso(iso));
  }
  function dateLong(iso) { return new Intl.DateTimeFormat('et-EE',{day:'numeric',month:'long',year:'numeric'}).format(dateFromIso(iso)); }
  function monthLong(date) { return new Intl.DateTimeFormat('et-EE',{month:'long',year:'numeric'}).format(date); }
  function relativeLabel(n) {
    if (n < 0) return `${Math.abs(n)} ${Math.abs(n) === 1 ? 'päev' : 'päeva'} hilinenud`;
    if (n === 0) return 'Täna';
    if (n === 1) return 'Homme';
    return `${n} päeva jäänud`;
  }
  function groupOf(task) {
    if (task.done) return 'done';
    const left = daysUntil(task.date);
    return left < 0 ? 'overdue' : left === 0 ? 'today' : left <= 7 ? 'soon' : 'later';
  }
  function makeId() { return (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : `deadline-${Date.now()}-${Math.random().toString(36).slice(2,10)}`; }
  function normalizeTask(raw) {
    if (!raw || typeof raw !== 'object' || typeof raw.title !== 'string' || !raw.title.trim() || raw.title.length > 120 || !validDate(raw.date) || !Object.hasOwn(types, raw.type)) return null;
    const time = typeof raw.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.time) ? raw.time : '';
    return {
      id: typeof raw.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(raw.id) ? raw.id : makeId(),
      title: raw.title.trim(), course: typeof raw.course === 'string' ? raw.course.slice(0,100) : '',
      type: raw.type, date: raw.date, time,
      notes: typeof raw.notes === 'string' ? raw.notes.slice(0,700) : '',
      important: Boolean(raw.important), done: Boolean(raw.done),
      createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now()
    };
  }
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const seen = new Set();
      return parsed.slice(0,5000).map(normalizeTask).filter(t => { if (!t || seen.has(t.id)) return false; seen.add(t.id); return true; });
    } catch (err) { console.warn('Andmete lugemine ebaõnnestus:', err); return []; }
  }
  function saveTasks(nextTasks = state.tasks) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks)); return true; }
    catch (err) { showToast('Salvestamine ebaõnnestus! Muudatust ei tehtud. Kontrolli brauseri salvestusruumi.'); return false; }
  }
  const current = new Date();
  const state = {
    tasks: loadTasks(), view: 'list', typeFilter: 'all', statusFilter: 'all', search: '',
    calendarYear: current.getFullYear(), calendarMonth: current.getMonth(),
    selectedDate: isoLocal(), editingId: null, toastTimer: null, undo: null
  };

  function sortTasks(a,b) {
    return a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || Number(b.important) - Number(a.important) || a.createdAt - b.createdAt;
  }
  function filteredTasks() {
    const q = state.search.toLocaleLowerCase('et-EE');
    return state.tasks.filter(task =>
      (state.typeFilter === 'all' || state.typeFilter === task.type) &&
      (state.statusFilter === 'all' || (state.statusFilter === 'done' ? task.done : !task.done)) &&
      (!q || `${task.title} ${task.course} ${task.notes} ${types[task.type].label}`.toLocaleLowerCase('et-EE').includes(q))
    ).sort(sortTasks);
  }
  function updateOverview() {
    const tasks = state.tasks;
    const overdue = tasks.filter(t => !t.done && daysUntil(t.date) < 0).length;
    const today = tasks.filter(t => !t.done && daysUntil(t.date) === 0).length;
    const soon = tasks.filter(t => !t.done && daysUntil(t.date) >= 0 && daysUntil(t.date) <= 7).length;
    const done = tasks.filter(t => t.done).length;
    $('statOverdue').textContent = overdue;
    $('statToday').textContent = today;
    $('statSoon').textContent = soon;
    $('statDone').childNodes[0].nodeValue = String(done);
    $('statTotal').textContent = ` / ${tasks.length}`;
    $('progressFill').style.width = (tasks.length ? done / tasks.length * 100 : 0) + '%';
    $('statOverdueText').textContent = overdue ? 'Tee need esmajärjekorras' : 'Kõik on ajakavas';
    $('navAll').textContent = tasks.length;
    $('navExams').textContent = tasks.filter(t => t.type === 'exam').length;
    $('navHomework').textContent = tasks.filter(t => t.type === 'homework').length;
    $('navProjects').textContent = tasks.filter(t => t.type === 'project').length;
    $('headingCount').textContent = filteredTasks().length;
    const now = new Date();
    $('todayLabel').textContent = new Intl.DateTimeFormat('et-EE',{weekday:'long',day:'numeric',month:'long'}).format(now);
    $('heroArtMonth').textContent = new Intl.DateTimeFormat('et-EE',{month:'short'}).format(now).replace('.','').toUpperCase();
    $('heroArtDay').textContent = String(now.getDate());
    const next = tasks.filter(t => !t.done && daysUntil(t.date) >= 0).sort(sortTasks)[0];
    if (overdue) {
      $('heroDescription').textContent = `${overdue} ${overdue === 1 ? 'tähtaeg on möödas' : 'tähtaega on möödas'}. Vaata kiireloomulised ülesanded üle.`;
    } else if (next) {
      const diff = daysUntil(next.date);
      $('heroDescription').textContent = `Järgmine: ${next.title} — ${diff === 0 ? 'täna' : diff === 1 ? 'homme' : `${diff} päeva pärast`}. Hoia graafikul silm peal.`;
    } else if (tasks.length && done === tasks.length) {
      $('heroDescription').textContent = 'Kõik ülesanded on tehtud. Tubli töö! Lisa järgmised tähtajad, kui need selguvad.';
    } else {
      $('heroDescription').textContent = 'Lisa oma eksamid, kodutööd ja projektid. Näed kohe, millele keskenduda.';
    }
    $('openAddHero').innerHTML = `${tasks.length ? 'Lisa uus tähtaeg' : 'Lisa esimene tähtaeg'} <span data-icon="arrow-up-right"></span>`;
    mountIcons($('openAddHero'));
  }
  function taskRow(task) {
    const category = types[task.type];
    const group = groupOf(task);
    const diff = daysUntil(task.date);
    const timeText = task.time ? ` · ${esc(task.time)}` : '';
    const dateStr = formatDate(task.date) + timeText;
    return `<article class="task-item ${group === 'overdue' ? 'is-overdue' : ''} ${group === 'today' ? 'is-today' : ''} ${task.done ? 'completed' : ''}">
      <button class="task-checkbox" type="button" data-action="toggle" data-id="${esc(task.id)}" aria-label="${task.done ? 'Märgi tegemata:' : 'Märgi tehtuks:'} ${esc(task.title)}" aria-pressed="${task.done}">${task.done ? '<span data-icon="check"></span>' : ''}</button>
      <div class="task-symbol symbol-${task.type}"><span data-icon="${category.icon}"></span></div>
      <div class="task-main"><div class="task-name-row"><h4 class="task-name" title="${esc(task.title)}">${esc(task.title)}</h4>${task.important && !task.done ? '<span class="important-badge"><span data-icon="star"></span> Oluline</span>' : ''}</div>
      <div class="task-meta"><span class="type-label">${category.label}</span>${task.course ? `<span class="meta-sep"></span><span>${esc(task.course)}</span>` : ''}</div>
      ${task.notes ? `<div class="task-note" title="${esc(task.notes)}">${esc(task.notes)}</div>` : ''}</div>
      <div class="task-right"><div class="task-deadline"><div class="task-date">${dateStr}</div><span class="days-pill ${group}">${task.done ? 'Tehtud ✓' : relativeLabel(diff)}</span></div>
      <div class="task-actions"><button type="button" class="icon-btn" data-action="edit" data-id="${esc(task.id)}" aria-label="Muuda: ${esc(task.title)}" title="Muuda"><span data-icon="pencil"></span></button><button type="button" class="icon-btn delete-btn" data-action="delete" data-id="${esc(task.id)}" aria-label="Kustuta: ${esc(task.title)}" title="Kustuta"><span data-icon="trash-2"></span></button></div></div>
    </article>`;
  }
  const groupDefs = [
    ['overdue','Hilinenud'],['today','Täna'],['soon','Järgmise 7 päeva jooksul'],['later','Hiljem'],['done','Tehtud']
  ];
  function renderList() {
    const tasks = filteredTasks();
    if (!tasks.length) {
      const fresh = state.tasks.length === 0;
      $('listView').innerHTML = `<div class="empty-state ${fresh ? '' : 'no-results'}"><div class="empty-illustration"><span data-icon="${fresh ? 'calendar-check' : 'search'}"></span></div>
        <h3>${fresh ? 'Sinu plaan algab siit' : 'Ühtegi ülesannet ei leitud'}</h3>
        <p>${fresh ? 'Lisa esimene eksam, kodutöö või projekt ja äpp loeb päevad sinu eest.' : 'Proovi teist otsingusõna või muuda filtreid.'}</p>
        <div class="empty-actions">${fresh ? '<button type="button" class="btn btn-primary" data-action="add"><span data-icon="plus"></span> Lisa tähtaeg</button><button type="button" class="text-btn" data-action="demo">Proovi näidisülesandeid</button>' : '<button type="button" class="btn btn-outline" data-action="clear-filters">Tühista filtrid</button>'}</div></div>`;
      mountIcons($('listView')); return;
    }
    let html = '';
    for (const [key, title] of groupDefs) {
      const items = tasks.filter(t => groupOf(t) === key);
      if (items.length === 0) continue;
      html += `<section class="task-group" aria-label="${esc(title)}"><div class="group-heading"><span class="group-dot ${key}"></span><h3>${esc(title)}</h3><span class="group-number">${items.length}</span></div><div class="task-list">${items.map(taskRow).join('')}</div></section>`;
    }
    $('listView').innerHTML = html;
    mountIcons($('listView'));
  }
  function renderCalendar() {
    const y = state.calendarYear, m = state.calendarMonth;
    const monthDate = new Date(y,m,1);
    const startOffset = (monthDate.getDay() + 6) % 7;
    const numDays = new Date(y,m+1,0).getDate();
    const cellCount = Math.ceil((startOffset + numDays) / 7) * 7;
    const visible = filteredTasks();
    const byDate = new Map();
    visible.forEach(t => { if (!byDate.has(t.date)) byDate.set(t.date,[]); byDate.get(t.date).push(t); });
    let cells = '';
    const today = isoLocal();
    for (let i=0;i<cellCount;i++) {
      const day = new Date(y,m,i-startOffset+1);
      const iso = isoLocal(day), items = byDate.get(iso) || [];
      const currentMonth = day.getMonth() === m;
      cells += `<button type="button" class="calendar-day ${!currentMonth ? 'other-month' : ''} ${iso === today ? 'is-today' : ''} ${iso === state.selectedDate ? 'is-selected' : ''}" data-date="${iso}" aria-label="${esc(dateLong(iso))}; ${items.length} ülesannet" aria-pressed="${iso === state.selectedDate}"><span class="calendar-day-num">${day.getDate()}</span><span class="day-dots">${items.slice(0,4).map(t => `<i class="${t.type}" title="${esc(t.title)}"></i>`).join('')}</span>${items.length > 4 ? `<span class="day-count">+${items.length-4}</span>` : ''}</button>`;
    }
    const dayTasks = (byDate.get(state.selectedDate) || []).sort(sortTasks);
    $('calendarView').innerHTML = `<div class="calendar-grid-layout"><div class="calendar-main"><div class="calendar-header"><div class="calendar-title">${esc(monthLong(monthDate))}</div><div class="calendar-controls"><button type="button" class="calendar-today" data-cal-action="today">Täna</button><button type="button" class="calendar-nav" data-cal-action="prev" aria-label="Eelmine kuu"><span data-icon="chevron-left"></span></button><button type="button" class="calendar-nav" data-cal-action="next" aria-label="Järgmine kuu"><span data-icon="chevron-right"></span></button></div></div><div class="calendar-weekdays"><span>E</span><span>T</span><span>K</span><span>N</span><span>R</span><span>L</span><span>P</span></div><div class="calendar-days">${cells}</div></div>
    <aside class="calendar-side"><span class="calendar-side-label">VALITUD KUUPÄEV</span><h3 class="calendar-side-title">${esc(dateLong(state.selectedDate))}</h3><div class="day-detail-list">${dayTasks.map(t => `<div class="day-detail ${t.done ? 'completed' : ''}"><span class="mini-dot ${t.type}"></span><div><strong>${esc(t.title)}</strong><p>${esc(types[t.type].label)}${t.time ? ` · ${esc(t.time)}` : ''}${t.course ? ` · ${esc(t.course)}` : ''}</p></div></div>`).join('') || '<div class="day-empty">Sellel päeval pole veel ühtegi tähtaega.</div>'}</div><button type="button" class="day-add" data-cal-action="add"><span data-icon="plus"></span> Lisa sellele päevale</button></aside></div>`;
    mountIcons($('calendarView'));
  }
  function updateControls() {
    document.querySelectorAll('[data-view]').forEach(btn => {
      const active = btn.dataset.view === state.view;
      btn.classList.toggle('active', active);
      if (active) btn.setAttribute('aria-current','page'); else btn.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-switch-view]').forEach(btn => {
      const active = btn.dataset.switchView === state.view;
      btn.classList.toggle('selected', active); btn.setAttribute('aria-pressed',String(active));
    });
    document.querySelectorAll('[data-filter-type]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filterType === state.typeFilter && state.typeFilter !== 'all');
    });
    $('listView').hidden = state.view !== 'list';
    $('calendarView').hidden = state.view !== 'calendar';
  }
  function render() { updateOverview(); updateControls(); renderList(); if (state.view === 'calendar') renderCalendar(); }
  function setView(view) { if (view !== 'list' && view !== 'calendar') return; state.view = view; render(); }
  function openDialog(id = null, prefillDate = null) {
    state.editingId = id;
    const task = id ? state.tasks.find(t => t.id === id) : null;
    if (id && !task) return;
    $('taskForm').reset();
    $('titleError').hidden = true; $('dateError').hidden = true;
    $('taskTitle').classList.remove('invalid'); $('taskDate').classList.remove('invalid');
    $('dialogTitle').textContent = task ? 'Muuda tähtaega' : 'Uus tähtaeg';
    $('dialogSubtitle').textContent = task ? 'Muuda andmeid ja salvesta uuesti.' : 'Lisa midagi, mida tahad õigel ajal valmis saada.';
    $('saveTask').innerHTML = `<span data-icon="check"></span> ${task ? 'Salvesta muudatused' : 'Salvesta tähtaeg'}`;
    mountIcons($('saveTask'));
    $('taskTitle').value = task?.title || '';
    $('taskCourse').value = task?.course || '';
    $('taskType').value = task?.type || 'homework';
    $('taskDate').value = task?.date || prefillDate || isoLocal();
    $('taskTime').value = task?.time || '';
    $('taskImportant').checked = Boolean(task?.important);
    $('taskNotes').value = task?.notes || '';
    $('taskDialog').showModal();
    setTimeout(() => $('taskTitle').focus(), 0);
  }
  function closeDialog() { $('taskDialog').close(); }
  function submitTask(event) {
    event.preventDefault();
    const title = $('taskTitle').value.trim(); const date = $('taskDate').value;
    $('titleError').hidden = Boolean(title);
    $('dateError').hidden = validDate(date);
    $('taskTitle').classList.toggle('invalid', !title);
    $('taskDate').classList.toggle('invalid', !validDate(date));
    if (!title || !validDate(date)) { (!title ? $('taskTitle') : $('taskDate')).focus(); return; }
    const values = {
      title: title.slice(0,120), course: $('taskCourse').value.trim().slice(0,100),
      type: $('taskType').value, date, time: $('taskTime').value,
      important: $('taskImportant').checked, notes: $('taskNotes').value.trim().slice(0,700)
    };
    if (!Object.hasOwn(types, values.type)) return;
    const existing = state.tasks.find(t => t.id === state.editingId);
    if (state.tasks.length >= 5000 && !existing) { showToast('Ülesannete piir on 5000.'); return; }
    const nextTasks = existing ? state.tasks.map(t => t.id === existing.id ? {...t,...values} : t) : [...state.tasks,{id: makeId(), ...values, done:false, createdAt:Date.now()}];
    if (!saveTasks(nextTasks)) return;
    state.tasks = nextTasks;
    closeDialog(); render(); showToast(existing ? 'Tähtaeg uuendatud' : 'Tähtaeg lisatud');
  }
  function deleteTask(id) {
    const index = state.tasks.findIndex(t => t.id === id);
    if (index === -1) return;
    const removed = state.tasks[index];
    const nextTasks = state.tasks.filter(t => t.id !== id);
    if (!saveTasks(nextTasks)) return;
    state.tasks = nextTasks; render();
    showToast('Tähtaeg kustutatud', 'Võta tagasi', () => {
      if (state.tasks.some(t => t.id === removed.id)) return;
      const restored = [...state.tasks]; restored.splice(Math.min(index,restored.length),0,removed);
      if (!saveTasks(restored)) return;
      state.tasks = restored; render(); showToast('Tähtaeg taastatud');
    });
  }
  function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const nextTasks = state.tasks.map(t => t.id === id ? {...t,done:!t.done} : t);
    if (!saveTasks(nextTasks)) return;
    state.tasks = nextTasks;
    render(); showToast(!task.done ? 'Tubli! Ülesanne on tehtud.' : 'Ülesanne märgiti taas tegemisel olevaks');
  }
  function showToast(message, actionLabel = null, callback = null) {
    if (state.toastTimer) clearTimeout(state.toastTimer);
    $('toastText').textContent = message;
    $('toastAction').hidden = !actionLabel;
    $('toastAction').textContent = actionLabel || '';
    $('toastAction').onclick = callback;
    $('toast').hidden = false;
    state.toastTimer = setTimeout(() => { $('toast').hidden = true; $('toastAction').onclick = null; }, actionLabel ? 9000 : 3600);
  }
  function downloadFile(name, content, mime) {
    const blob = new Blob([content], {type:mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportBackup() {
    downloadFile(`deadline-varukoopia-${isoLocal()}.json`, JSON.stringify({app:'Deadline',version:1,exportedAt:new Date().toISOString(),tasks:state.tasks},null,2), 'application/json;charset=utf-8');
    showToast('Varukoopia salvestatud');
  }
  async function importBackup(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (file.size > 5_000_000) { showToast('Fail on liiga suur (kuni 5 MB).'); return; }
    try {
      const raw = JSON.parse(await file.text());
      const array = Array.isArray(raw) ? raw : raw?.tasks;
      if (!Array.isArray(array) || array.length > 5000) throw Error('Vale failivorming');
      const seen = new Set();
      const imported = array.map(normalizeTask).filter(t => { if (!t || seen.has(t.id)) return false; seen.add(t.id); return true; });
      if (array.length && !imported.length) throw Error('Failis polnud kehtivaid tähtaegu');
      if (!window.confirm(`Kas asendan kõik praegused tähtajad varukoopia ${imported.length} ülesandega? Soovi korral salvesta enne senistest andmetest varukoopia.`)) return;
      if (imported.length !== array.length) throw Error('Varukoopias on vigased kirjed');
      if (!saveTasks(imported)) return;
      state.tasks = imported;
      render(); showToast(`${imported.length} ülesannet taastatud${array.length !== imported.length ? ` (${array.length - imported.length} vigast kirjet jäeti vahele)` : ''}`);
    } catch (err) { console.warn('Import ebaõnnestus',err); showToast('Varukoopia lugemine ebaõnnestus. Kontrolli faili.'); }
  }
  function icsEscape(str) { return String(str ?? '').replace(/\\/g,'\\\\').replace(/\r\n?|\n/g,'\\n').replace(/[,;]/g,ch=>'\\'+ch); }
  function exportCalendar() {
    const active = state.tasks.filter(t => !t.done).sort(sortTasks);
    if (!active.length) { showToast('Kalendrisse eksportimiseks pole tegemata tähtaegu.'); return; }
    const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Deadline//Tahtaegade jalgija//ET','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Deadline tähtajad'];
    for (const task of active) {
      const compact = task.date.replaceAll('-','');
      const description = [types[task.type].label, task.course && `Õppeaine: ${task.course}`,task.notes].filter(Boolean).join('\n');
      lines.push('BEGIN:VEVENT',`UID:${task.id}@deadline.local`,`DTSTAMP:${stamp}`,`SUMMARY:${icsEscape(task.title)}`,`DESCRIPTION:${icsEscape(description)}`);
      if (task.time) {
        lines.push(`DTSTART:${compact}T${task.time.replace(':','')}00`,'DURATION:PT1H');
      } else {
        lines.push(`DTSTART;VALUE=DATE:${compact}`,`DTEND;VALUE=DATE:${addDays(task.date,1).replaceAll('-','')}`);
      }
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    downloadFile(`deadline-kalender-${isoLocal()}.ics`, '\ufeff' + lines.join('\r\n') + '\r\n', 'text/calendar;charset=utf-8');
    showToast(`${active.length} tähtaega eksporditud kalendrifaili`);
  }
  function addDemoTasks() {
    if (state.tasks.length) return;
    const demo = [
      {title:'Sissejuhatus majandusse – eksam',course:'Majandusteooria',type:'exam',date:addDays(isoLocal(),2),important:true,time:'10:00',notes:'Korda üle peatükid 1–6.'},
      {title:'Essee esitamine',course:'Akadeemiline kirjutamine',type:'homework',date:addDays(isoLocal(),5),important:false,time:'23:59',notes:'Vähemalt 1500 sõna.'},
      {title:'Rühmatöö lõppettekanne',course:'Projektijuhtimine',type:'project',date:addDays(isoLocal(),14),important:false,time:'',notes:'Viimistleda slaidid.'}
    ];
    const nextTasks = demo.map(t => ({id:makeId(),done:false,createdAt:Date.now(),...t}));
    if (!saveTasks(nextTasks)) return;
    state.tasks = nextTasks;
    render(); showToast('Lisatud 3 näidisülesannet. Neid saab muuta või kustutada.');
  }
  function clearFilters() {
    state.typeFilter = 'all'; state.statusFilter = 'all'; state.search = '';
    $('statusFilter').value = 'all'; $('searchInput').value = '';
    render();
  }
  function registerEvents() {
    mountIcons();
    $('taskForm').addEventListener('submit', submitTask);
    $('openAddTop').addEventListener('click', () => openDialog());
    $('openAddHero').addEventListener('click', () => openDialog());
    $('openAddMobile').addEventListener('click', () => openDialog());
    $('closeDialog').addEventListener('click',closeDialog);
    $('cancelDialog').addEventListener('click',closeDialog);
    $('taskDialog').addEventListener('click',event=>{ if (event.target === $('taskDialog')) closeDialog(); });
    $('toastDismiss').addEventListener('click',() => { $('toast').hidden = true; });
    $('exportBackup').addEventListener('click',exportBackup);
    $('footerBackup').addEventListener('click',exportBackup);
    $('importBackup').addEventListener('click', () => $('backupInput').click());
    $('backupInput').addEventListener('change',importBackup);
    $('calendarExport').addEventListener('click',exportCalendar);
    document.querySelectorAll('[data-view],[data-switch-view]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view || btn.dataset.switchView)));
    document.querySelectorAll('[data-filter-type]').forEach(btn => btn.addEventListener('click', () => { state.typeFilter = btn.dataset.filterType; state.view = 'list'; render(); }));
    $('searchInput').addEventListener('input',e => { state.search = e.target.value.trim(); render(); });
    $('statusFilter').addEventListener('change',e => { state.statusFilter = e.target.value; render(); });
    $('listView').addEventListener('click',event => {
      const btn = event.target.closest('button[data-action]'); if (!btn) return;
      const {action,id} = btn.dataset;
      if (action === 'toggle') toggleTask(id);
      else if (action === 'edit') openDialog(id);
      else if (action === 'delete') deleteTask(id);
      else if (action === 'add') openDialog();
      else if (action === 'demo') addDemoTasks();
      else if (action === 'clear-filters') clearFilters();
    });
    $('calendarView').addEventListener('click',event => {
      const btn = event.target.closest('button'); if (!btn) return;
      if (btn.dataset.date) {
        state.selectedDate = btn.dataset.date;
        const date = dateFromIso(state.selectedDate);
        state.calendarYear = date.getFullYear(); state.calendarMonth = date.getMonth(); renderCalendar();
        return;
      }
      if (btn.dataset.calAction === 'today') {
        const date = new Date(); state.calendarYear = date.getFullYear(); state.calendarMonth = date.getMonth(); state.selectedDate = isoLocal(); renderCalendar();
      } else if (btn.dataset.calAction === 'prev' || btn.dataset.calAction === 'next') {
        const delta = btn.dataset.calAction === 'prev' ? -1 : 1;
        const next = new Date(state.calendarYear,state.calendarMonth + delta,1);
        state.calendarYear = next.getFullYear(); state.calendarMonth = next.getMonth();
        state.selectedDate = isoLocal(next); renderCalendar();
      } else if (btn.dataset.calAction === 'add') openDialog(null,state.selectedDate);
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
    setInterval(() => { if (!document.hidden) render(); },60_000);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      window.addEventListener('load',() => navigator.serviceWorker.register('./sw.js').catch(err => console.info('Võrguühenduseta režiim ei õnnestunud:',err)));
    }
  }
  registerEvents();
  render();
})();