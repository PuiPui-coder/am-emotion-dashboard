/* ═══════════════════════════════════════════════════
   RESEARCH DASHBOARD — script.js
   Data-driven rendering with localStorage persistence.
   Default tasks defined in WEEKS below.
   Custom tasks added via "+ Add Task" are stored
   separately and restored on every page load.
═══════════════════════════════════════════════════ */

const STORAGE_KEY = 'research_dashboard_v2';

/* ─────────────────────────────────────────────────
   WEEK & TASK DATA
   Edit task names, descriptions, and criteria here.
───────────────────────────────────────────────── */
const WEEKS = [
  {
    id: 1,
    label: 'Week 1',
    dates: 'May 1 – 7',
    goal: 'Monthly report submission + Conceptual foundation',
    tasks: [
      {
        id: 'w1t1',
        name: 'Submit Monthly Research Progress',
        description: 'Prepare and submit the monthly progress report for professor review.',
        criteria: [
          'Research Progress Report submitted',
        ],
      },
      {
        id: 'w1t2',
        name: 'Conceptual Clarification',
        description: 'AM definition (3 comparisons) · AM importance (practical + theoretical) · Emotion concept organization.',
        criteria: [
          'AM definition written as 1 paragraph with citations',
          'Emotion structure diagram or table completed',
        ],
      },
    ],
  },
  {
    id: 2,
    label: 'Week 2',
    dates: 'May 8 – 14',
    goal: 'Structure completion',
    tasks: [
      {
        id: 'w2t1',
        name: 'Literature Matrix',
        description: 'Organize 3–4 key papers into a structured literature matrix.',
        criteria: [
          '3+ papers entered with specific variables',
          'All variables and relationships clearly defined',
        ],
      },
      {
        id: 'w2t2',
        name: 'Tables — Final Version',
        description: 'Complete Table 1–3 with no empty cells.',
        criteria: [
          'Zero empty cells in Table 1–3',
        ],
      },
    ],
  },
  {
    id: 3,
    label: 'Week 3',
    dates: 'May 15 – 21',
    goal: 'Emotion framework completion',
    tasks: [
      {
        id: 'w3t1',
        name: 'Emotion Organization — Complete',
        description: 'Finalize the conceptual organization of emotion-related constructs.',
        criteria: [
          'Can clearly explain why emotional labor is the central mechanism',
        ],
      },
    ],
  },
  {
    id: 4,
    label: 'Week 4',
    dates: 'May 22 – 28',
    goal: 'Theoretical development + integration',
    tasks: [
      {
        id: 'w4t1',
        name: 'Research Gap Statement',
        description: 'Write the research gap section in English, grounded in literature.',
        criteria: [
          '200–300 words in English',
          'Clearly literature-based',
        ],
      },
      {
        id: 'w4t2',
        name: 'AM Definition Refinement',
        description: 'Sharpen the definition of Algorithmic Management situated within OBHRM literature.',
        criteria: [
          'Can explain the definition in OBHRM context without notes',
        ],
      },
      {
        id: 'w4t3',
        name: 'Theoretical Model — Draft',
        description: 'Produce a draft version of the theoretical model.',
        criteria: [
          'Model is explainable using a diagram',
        ],
      },
      {
        id: 'w4t4',
        name: 'Theoretical Model — Final',
        description: 'Finalize the theoretical model based on the draft from the same week.',
        criteria: [
          'Model is theoretically consistent throughout',
        ],
      },
      {
        id: 'w4t5',
        name: 'Overall Organization',
        description: 'Review and integrate all materials produced across all weeks.',
        criteria: [
          'Overall logical flow is coherent and holds up',
        ],
      },
    ],
  },
  {
    id: 5,
    label: 'Week 5',
    dates: 'May 29 – 31',
    goal: 'Professor discussion preparation',
    tasks: [
      {
        id: 'w5t1',
        name: 'Professor Discussion — Prep',
        description: 'Prepare for the discussion meeting with professor.',
        criteria: [
          'Can articulate all four points:',
          '① Where to start',
          '② How to deal with the data',
          '③ Conference strategy',
          '④ Next steps',
        ],
      },
    ],
  },
];


/* ─────────────────────────────────────────────────
   STORAGE HELPERS
───────────────────────────────────────────────── */
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getTaskState(taskId) {
  const state = loadState();
  return state.tasks?.[taskId] || { status: 'not-started', evidence: '', notes: '' };
}

function setTaskField(taskId, field, value) {
  const state = loadState();
  if (!state.tasks) state.tasks = {};
  if (!state.tasks[taskId]) state.tasks[taskId] = { status: 'not-started', evidence: '', notes: '' };
  state.tasks[taskId][field] = value;
  saveState(state);
}

function getCustomTasks(weekId) {
  const state = loadState();
  return state.customTasks?.[weekId] || [];
}

function saveCustomTasks(weekId, tasks) {
  const state = loadState();
  if (!state.customTasks) state.customTasks = {};
  state.customTasks[weekId] = tasks;
  saveState(state);
}


/* ─────────────────────────────────────────────────
   RENDERING
───────────────────────────────────────────────── */
function render() {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;
  dashboard.innerHTML = '';
  WEEKS.forEach(week => dashboard.appendChild(buildWeekBlock(week)));
  recalcAllProgress();
}

function buildWeekBlock(week) {
  const section = document.createElement('section');
  section.className = 'week-block';
  section.dataset.week = week.id;

  section.innerHTML = `
    <div class="week-header">
      <div class="week-label-group">
        <span class="week-badge">${week.label}</span>
        <span class="week-dates">${week.dates}</span>
        <span class="week-status-pill" id="pill-${week.id}">Not Started</span>
      </div>
      <div class="week-goal">
        <span class="goal-kicker">Goal</span>
        <span class="goal-text">${week.goal}</span>
      </div>
      <div class="week-prog-group">
        <div class="week-prog-track">
          <div class="week-prog-fill" id="wpbar-${week.id}"></div>
        </div>
        <span class="week-prog-pct" id="wppct-${week.id}">0%</span>
      </div>
    </div>
    <div class="table-scroll">
      <table class="task-table">
        <thead>
          <tr>
            <th class="col-task">Task</th>
            <th class="col-criteria">Completion Criteria</th>
            <th class="col-status">Status</th>
            <th class="col-evidence">Output / Evidence</th>
            <th class="col-notes">Notes</th>
          </tr>
        </thead>
        <tbody id="tbody-${week.id}">
        </tbody>
      </table>
    </div>
  `;

  const tbody = section.querySelector(`#tbody-${week.id}`);

  // Default tasks
  week.tasks.forEach(task => {
    tbody.appendChild(buildDefaultRow(task, week.id));
  });

  // Custom tasks
  getCustomTasks(week.id).forEach(ct => {
    tbody.appendChild(buildCustomRow(ct, week.id));
  });

  // Add Task row
  tbody.appendChild(buildAddTaskRow(week.id));

  return section;
}

function buildDefaultRow(task, weekId) {
  const tr = document.createElement('tr');
  tr.dataset.taskId = task.id;

  const ts = getTaskState(task.id);

  // Criteria: detect sub-items (starting with ①②③④ or similar marker)
  const criteriaHtml = task.criteria.map(c => {
    const isSub = /^[①②③④⑤]/.test(c.trim());
    return `<li class="${isSub ? 'sub' : ''}">${escHtml(c)}</li>`;
  }).join('');

  tr.innerHTML = `
    <td class="col-task" data-label="Task">
      <span class="task-name-main">${escHtml(task.name)}</span>
      <span class="task-desc">${escHtml(task.description)}</span>
    </td>
    <td class="col-criteria" data-label="Completion Criteria">
      <ul class="criteria-list">${criteriaHtml}</ul>
    </td>
    <td class="col-status" data-label="Status">
      <select class="status-select ${ts.status === 'not-started' ? '' : ts.status}"
              onchange="onStatusChange('${task.id}', this)">
        <option value="not-started" ${ts.status === 'not-started' ? 'selected' : ''}>Not Started</option>
        <option value="in-progress" ${ts.status === 'in-progress'  ? 'selected' : ''}>In Progress</option>
        <option value="completed"   ${ts.status === 'completed'    ? 'selected' : ''}>Completed</option>
      </select>
    </td>
    <td class="col-evidence" data-label="Output / Evidence">
      <input  class="evidence-input"
              type="text"
              placeholder="Paste Google Drive, OneDrive, Dropbox, or local path…"
              value="${escAttr(ts.evidence)}"
              oninput="onFieldChange('${task.id}', 'evidence', this.value)" />
    </td>
    <td class="col-notes" data-label="Notes">
      <textarea class="notes-input"
                placeholder="Add notes…"
                oninput="onFieldChange('${task.id}', 'notes', this.value)">${escHtml(ts.notes)}</textarea>
    </td>
  `;

  return tr;
}

function buildCustomRow(ct, weekId) {
  const tr = document.createElement('tr');
  tr.className = 'custom-row';
  tr.dataset.taskId = ct.id;
  tr.dataset.customWeek = weekId;

  const ts = getTaskState(ct.id);

  tr.innerHTML = `
    <td class="col-task" data-label="Task">
      <input  class="input-task-name"
              type="text"
              placeholder="Task name…"
              value="${escAttr(ct.name)}"
              oninput="onCustomNameChange('${ct.id}', ${weekId}, this.value)" />
    </td>
    <td class="col-criteria" data-label="Completion Criteria">
      <textarea class="input-criteria"
                placeholder="Completion criteria…"
                oninput="onCustomCriteriaChange('${ct.id}', ${weekId}, this.value)">${escHtml(ct.criteria)}</textarea>
    </td>
    <td class="col-status" data-label="Status">
      <select class="status-select ${ts.status === 'not-started' ? '' : ts.status}"
              onchange="onStatusChange('${ct.id}', this)">
        <option value="not-started" ${ts.status === 'not-started' ? 'selected' : ''}>Not Started</option>
        <option value="in-progress" ${ts.status === 'in-progress'  ? 'selected' : ''}>In Progress</option>
        <option value="completed"   ${ts.status === 'completed'    ? 'selected' : ''}>Completed</option>
      </select>
    </td>
    <td class="col-evidence" data-label="Output / Evidence">
      <input  class="evidence-input"
              type="text"
              placeholder="Paste link or path…"
              value="${escAttr(ts.evidence)}"
              oninput="onFieldChange('${ct.id}', 'evidence', this.value)" />
    </td>
    <td class="col-notes" data-label="Notes">
      <div style="display:flex;gap:.4rem;align-items:flex-start;">
        <textarea class="notes-input" style="flex:1;"
                  placeholder="Add notes…"
                  oninput="onFieldChange('${ct.id}', 'notes', this.value)">${escHtml(ts.notes)}</textarea>
        <button class="btn-delete" title="Remove task"
                onclick="deleteCustomTask('${ct.id}', ${weekId})">✕</button>
      </div>
    </td>
  `;

  return tr;
}

function buildAddTaskRow(weekId) {
  const tr = document.createElement('tr');
  tr.className = 'add-task-row';
  tr.id = `add-row-${weekId}`;
  tr.innerHTML = `
    <td colspan="5">
      <button class="btn-add-task" onclick="addCustomTask(${weekId})">
        + Add Task
      </button>
    </td>
  `;
  return tr;
}


/* ─────────────────────────────────────────────────
   EVENT HANDLERS
───────────────────────────────────────────────── */
function onStatusChange(taskId, select) {
  const value = select.value;
  select.className = 'status-select' + (value === 'not-started' ? '' : ' ' + value);
  setTaskField(taskId, 'status', value);
  recalcAllProgress();
}

function onFieldChange(taskId, field, value) {
  setTaskField(taskId, field, value);
}

function onCustomNameChange(taskId, weekId, value) {
  const customs = getCustomTasks(weekId);
  const ct = customs.find(c => c.id === taskId);
  if (ct) { ct.name = value; saveCustomTasks(weekId, customs); }
}

function onCustomCriteriaChange(taskId, weekId, value) {
  const customs = getCustomTasks(weekId);
  const ct = customs.find(c => c.id === taskId);
  if (ct) { ct.criteria = value; saveCustomTasks(weekId, customs); }
}


/* ─────────────────────────────────────────────────
   ADD / DELETE CUSTOM TASKS
───────────────────────────────────────────────── */
function addCustomTask(weekId) {
  const id = `custom_${weekId}_${Date.now()}`;
  const newTask = { id, name: '', criteria: '' };

  const customs = getCustomTasks(weekId);
  customs.push(newTask);
  saveCustomTasks(weekId, customs);

  // Insert new row before the Add Task row
  const addRow = document.getElementById(`add-row-${weekId}`);
  const tbody = addRow.parentElement;
  const newRow = buildCustomRow(newTask, weekId);
  tbody.insertBefore(newRow, addRow);

  // Focus the name input
  newRow.querySelector('.input-task-name')?.focus();

  recalcAllProgress();
}

function deleteCustomTask(taskId, weekId) {
  if (!confirm('Remove this task?')) return;

  const customs = getCustomTasks(weekId).filter(c => c.id !== taskId);
  saveCustomTasks(weekId, customs);

  // Remove task state
  const state = loadState();
  if (state.tasks?.[taskId]) {
    delete state.tasks[taskId];
    saveState(state);
  }

  // Remove row from DOM
  const row = document.querySelector(`[data-task-id="${taskId}"]`);
  if (row) row.remove();

  recalcAllProgress();
}


/* ─────────────────────────────────────────────────
   PROGRESS CALCULATION
───────────────────────────────────────────────── */
function recalcAllProgress() {
  let totalAll = 0;
  let doneAll = 0;

  WEEKS.forEach(week => {
    const state = loadState();

    // Collect all task IDs for this week (default + custom)
    const defaultIds = week.tasks.map(t => t.id);
    const customIds  = getCustomTasks(week.id).map(c => c.id);
    const allIds     = [...defaultIds, ...customIds];

    const total = allIds.length;
    const done  = allIds.filter(id => (state.tasks?.[id]?.status || 'not-started') === 'completed').length;
    const anyIP = allIds.some(id => (state.tasks?.[id]?.status || 'not-started') === 'in-progress');

    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    // Week bar
    const bar = document.getElementById(`wpbar-${week.id}`);
    const pctEl = document.getElementById(`wppct-${week.id}`);
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';

    // Week status pill
    const pill = document.getElementById(`pill-${week.id}`);
    if (pill) {
      if (total > 0 && done === total) {
        pill.textContent = 'Completed';
        pill.className = 'week-status-pill completed';
      } else if (done > 0 || anyIP) {
        pill.textContent = 'In Progress';
        pill.className = 'week-status-pill in-progress';
      } else {
        pill.textContent = 'Not Started';
        pill.className = 'week-status-pill';
      }
    }

    totalAll += total;
    doneAll  += done;
  });

  // Overall bar
  const overallPct = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;
  const overallBar  = document.getElementById('overall-bar');
  const overallStat = document.getElementById('overall-stat');
  if (overallBar)  overallBar.style.width = overallPct + '%';
  if (overallStat) overallStat.textContent = `${doneAll} / ${totalAll} completed (${overallPct}%)`;
}


/* ─────────────────────────────────────────────────
   RESET
───────────────────────────────────────────────── */
function resetAllData() {
  if (!confirm('Reset all progress, evidence links, notes, and custom tasks? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
}


/* ─────────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────────── */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}


/* ─────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', render);
