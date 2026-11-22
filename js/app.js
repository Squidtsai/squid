import { CATEGORIES, CHECKLIST, WARNING_SIGNS, INCIDENT_STEPS } from './checklist-data.js';
import { analyzeText } from './link-check.js';
import { strength, pwnedCount } from './password-check.js';

// ── 小工具 ──
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
const $ = (s) => document.querySelector(s);

const STORE_KEY = 'iphone-guard:v1';
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* 私密瀏覽等情況無法儲存，忽略 */
  }
}

const state = Object.assign({ items: {}, signs: {}, filter: 'todo' }, load());

const PRIORITY = {
  critical: { label: '必做', weight: 3 },
  high: { label: '強烈建議', weight: 2 },
  medium: { label: '建議', weight: 1 },
};
const LEVEL_TEXT = { high: '高風險', medium: '中風險', low: '低風險', none: '未發現明顯問題' };

// ── 分頁 ──
document.querySelectorAll('.tabbar button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === btn.dataset.tab));
    window.scrollTo({ top: 0 });
    try { sessionStorage.setItem('tab', btn.dataset.tab); } catch { /* ignore */ }
  });
});
try {
  const t = sessionStorage.getItem('tab');
  if (t) document.querySelector(`.tabbar button[data-tab="${t}"]`)?.click();
} catch { /* ignore */ }

// ── 健檢清單 ──
function itemStatus(id) {
  return state.items[id] || 'todo'; // todo | done | na
}

function renderScore() {
  let total = 0;
  let got = 0;
  let criticalLeft = 0;
  let doneCount = 0;
  const applicable = CHECKLIST.filter((i) => itemStatus(i.id) !== 'na');
  for (const i of applicable) {
    const w = PRIORITY[i.priority].weight;
    total += w;
    if (itemStatus(i.id) === 'done') {
      got += w;
      doneCount++;
    } else if (i.priority === 'critical') criticalLeft++;
  }
  const score = total ? Math.round((got / total) * 100) : 0;
  $('#score').textContent = score;
  const circ = 2 * Math.PI * 52;
  const fg = $('#ring-fg');
  fg.style.strokeDasharray = `${circ}`;
  fg.style.strokeDashoffset = `${circ * (1 - score / 100)}`;
  const tone = score >= 85 && criticalLeft === 0 ? 'good' : score >= 50 ? 'mid' : 'bad';
  $('#ring').dataset.tone = tone;
  $('#score-label').textContent =
    tone === 'good' ? '防護很完整 👍' : tone === 'mid' ? '還有一些漏洞' : doneCount ? '防護不足，繼續加油' : '開始檢查吧';
  $('#score-detail').textContent = `已完成 ${doneCount} / ${applicable.length} 項`;
  $('#critical-left').textContent = criticalLeft ? `還有 ${criticalLeft} 項「必做」未完成` : '';
}

function renderChecklist() {
  const root = $('#checklist');
  root.replaceChildren();
  const f = state.filter;
  document.querySelectorAll('.filters .chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === f));

  for (const cat of CATEGORIES) {
    const items = CHECKLIST.filter((i) => {
      if (i.cat !== cat.id) return false;
      const s = itemStatus(i.id);
      if (f === 'todo') return s === 'todo';
      if (f === 'critical') return i.priority === 'critical';
      if (f === 'done') return s !== 'todo';
      return true;
    });
    if (!items.length) continue;
    root.append(
      h('h2', { class: 'cat' }, `${cat.icon} ${cat.name}`),
      ...items.map(renderItem),
    );
  }
  if (!root.children.length) {
    root.append(
      h('div', { class: 'empty' },
        f === 'todo' ? '🎉 全部完成！建議每次 iOS 大改版後再回來檢查一次。' : '這個分類沒有項目。'),
    );
  }
  renderScore();
}

function setStatus(id, s) {
  state.items[id] = s;
  if (s === 'todo') delete state.items[id];
  save();
  renderChecklist();
}

function renderItem(item) {
  const s = itemStatus(item.id);
  const p = PRIORITY[item.priority];
  return h('article', { class: `item ${s}`, 'data-priority': item.priority },
    h('details', {},
      h('summary', {},
        h('span', { class: `badge ${item.priority}` }, p.label),
        h('span', { class: 'item-title' }, item.title),
        s === 'done' ? h('span', { class: 'tick', 'aria-label': '已完成' }, '✓') : null,
        s === 'na' ? h('span', { class: 'na-tag' }, '不適用') : null,
      ),
      h('p', { class: 'why' }, item.why),
      h('ol', { class: 'path' }, item.steps.map((st) => h('li', {}, st))),
      h('div', { class: 'row' },
        s !== 'done'
          ? h('button', { class: 'btn primary', onclick: () => setStatus(item.id, 'done') }, '✓ 我已完成')
          : h('button', { class: 'btn', onclick: () => setStatus(item.id, 'todo') }, '標為未完成'),
        s !== 'na'
          ? h('button', { class: 'btn ghost', onclick: () => setStatus(item.id, 'na') }, '不適用')
          : h('button', { class: 'btn ghost', onclick: () => setStatus(item.id, 'todo') }, '恢復'),
      ),
    ),
  );
}

document.querySelectorAll('.filters .chip').forEach((c) =>
  c.addEventListener('click', () => {
    state.filter = c.dataset.filter;
    save();
    renderChecklist();
  }),
);
$('#reset-progress').addEventListener('click', () => {
  if (confirm('確定要清除所有勾選紀錄嗎？')) {
    state.items = {};
    state.signs = {};
    save();
    renderChecklist();
    renderSigns();
  }
});

// ── 連結檢查 ──
function renderLinkResult(r) {
  const root = $('#link-result');
  const advice = {
    high: '很可能是詐騙。不要點連結、不要輸入任何資料，直接刪除並封鎖寄件人。如果已經輸入過資料，請到「應變」分頁處理。',
    medium: '有可疑跡象。請不要從這則訊息點連結，改用官方 App 或自己輸入官方網址確認。',
    low: '有一些小疑點。如果訊息要你輸入帳號、密碼或付款，請改從官方管道操作。',
    none: '沒有發現常見的詐騙特徵，但這不代表一定安全。只要被要求輸入密碼或付款，都請從官方 App 操作。',
  }[r.verdict];

  const parts = [
    h('div', { class: `verdict ${r.verdict}` },
      h('p', { class: 'verdict-title' }, LEVEL_TEXT[r.verdict]),
      h('p', {}, advice),
    ),
    r.phrases.length
      ? h('div', { class: 'card' },
          h('h3', {}, '訊息內容的可疑話術'),
          h('ul', {}, r.phrases.map((p) => h('li', {}, p))))
      : null,
    ...r.urls.map((u) =>
      h('div', { class: 'card' },
        h('h3', {}, '連結：', h('code', { class: 'url' }, u.url)),
        h('p', { class: 'muted small' }, '實際網域：', h('strong', {}, u.domain || u.host || '—')),
        u.reasons.length
          ? h('ul', { class: 'reasons' }, u.reasons.map((x) => h('li', { class: x.level }, x.msg)))
          : h('p', { class: 'muted' }, '這個網址沒有發現常見的可疑特徵。'),
      ),
    ),
    !r.urls.length && !r.phrases.length && $('#link-input').value.trim()
      ? h('p', { class: 'muted' }, '沒有找到網址。')
      : null,
  ];
  root.replaceChildren(...parts.filter(Boolean));
}

$('#link-go').addEventListener('click', () => {
  const text = $('#link-input').value.trim();
  if (!text) return;
  renderLinkResult(analyzeText(text));
});
$('#link-clear').addEventListener('click', () => {
  $('#link-input').value = '';
  $('#link-result').replaceChildren();
});
$('#link-paste').addEventListener('click', async () => {
  try {
    $('#link-input').value = await navigator.clipboard.readText();
    $('#link-go').click();
  } catch {
    alert('無法讀取剪貼板，請長按輸入框手動貼上。');
  }
});

// ── 密碼檢查 ──
const pwInput = $('#pw-input');
pwInput.addEventListener('input', () => {
  const s = strength(pwInput.value);
  const meter = $('#pw-meter');
  meter.style.width = pwInput.value ? `${(s.score + 1) * 20}%` : '0';
  meter.dataset.score = s.score;
  $('#pw-strength').textContent = pwInput.value ? `強度：${s.label}` : '';
  $('#pw-tips').replaceChildren(...s.tips.map((t) => h('li', {}, t)));
  $('#pw-result').replaceChildren();
});
$('#pw-toggle').addEventListener('click', () => {
  const show = pwInput.type === 'password';
  pwInput.type = show ? 'text' : 'password';
  $('#pw-toggle').textContent = show ? '隱藏' : '顯示';
});
$('#pw-go').addEventListener('click', async () => {
  const pw = pwInput.value;
  const out = $('#pw-result');
  if (!pw) return;
  out.replaceChildren(h('p', { class: 'muted' }, '查詢中…'));
  try {
    const n = await pwnedCount(pw);
    out.replaceChildren(
      n
        ? h('div', { class: 'verdict high' },
            h('p', { class: 'verdict-title' }, `⚠️ 這組密碼曾在外洩資料中出現 ${n.toLocaleString()} 次`),
            h('p', {}, '駭客會優先拿這些密碼去試。請立刻把所有使用這組密碼的帳號改成新的、各不相同的密碼。'))
        : h('div', { class: 'verdict none' },
            h('p', { class: 'verdict-title' }, '✓ 沒有在已知外洩資料中找到'),
            h('p', {}, '這不代表密碼夠強。請確認它夠長，而且沒有在其他網站重複使用。')),
    );
  } catch (e) {
    out.replaceChildren(h('p', { class: 'warn-text' }, `無法連線到查詢服務：${e.message}。請確認網路連線後再試一次。`));
  }
});

// ── 入侵徵兆 ──
function renderSigns() {
  const root = $('#signs');
  root.replaceChildren(
    ...WARNING_SIGNS.map((s, i) =>
      h('label', { class: 'sign' },
        h('input', {
          type: 'checkbox',
          checked: !!state.signs[i],
          onchange: (e) => {
            state.signs[i] = e.target.checked;
            save();
            renderSignsResult();
          },
        }),
        h('span', {}, s.sign),
      ),
    ),
  );
  renderSignsResult();
}
function renderSignsResult() {
  const checked = WARNING_SIGNS.filter((_, i) => state.signs[i]);
  const high = checked.filter((s) => s.level === 'high').length;
  const out = $('#signs-result');
  if (!checked.length) return out.replaceChildren();
  const level = high ? 'high' : checked.length >= 2 ? 'medium' : 'low';
  const msg = {
    high: '出現高度可疑的徵兆，請立刻照下方的應變步驟處理，尤其是更改 Apple 帳號密碼和移除不明描述檔。',
    medium: '有幾個可疑跡象。建議先更新 iOS、移除可疑 App，並更改 Apple 帳號密碼。',
    low: '可能只是一般的使用狀況（例如電池老化），但建議檢查一下最近安裝的 App。',
  }[level];
  out.replaceChildren(h('div', { class: `verdict ${level}` }, h('p', {}, msg)));
}

$('#incident').replaceChildren(
  ...INCIDENT_STEPS.map((s) => h('li', {}, h('strong', {}, s.title), h('p', {}, s.body))),
);

renderChecklist();
renderSigns();

// ── 離線支援 ──
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
