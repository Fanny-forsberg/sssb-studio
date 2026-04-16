const SUPABASE_URL = 'https://kndadtevenphkiotunlc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZGFkdGV2ZW5waGtpb3R1bmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTEzMjAsImV4cCI6MjA5MTg4NzUyMH0.fTfFxbG7z1wjgqIa-jAnMqiHBlWG5KzTIPDE1Qh79gg';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentTopic = '';

const platformIcons = {
  instagram: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  tiktok: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.79 1.52V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>`,
  linkedin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
};

const platformNames = { instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn' };

function showPasteArea() {
  const topic = document.getElementById('topic').value.trim();
  const platforms = Array.from(document.querySelectorAll('.platform-toggle input:checked')).map(el => el.value);

  if (!topic) {
    document.getElementById('topic').focus();
    return;
  }
  if (platforms.length === 0) {
    alert('Välj minst en kanal.');
    return;
  }

  currentTopic = topic;
  const grid = document.getElementById('captions-grid');
  grid.innerHTML = '';

  // Schedule info
  const schedDate = document.getElementById('schedule-date')?.value;
  const schedTime = document.getElementById('schedule-time')?.value || '10:00';
  const schedInfo = document.getElementById('schedule-info');
  if (schedDate) {
    const d = new Date(schedDate + 'T' + schedTime);
    const dateStr = d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
    schedInfo.textContent = `Schemalagd: ${dateStr} kl ${schedTime}`;
  } else {
    schedInfo.textContent = 'Skriv din caption och kopiera eller skicka till Later.';
  }

  platforms.forEach(platform => {
    const card = document.createElement('div');
    card.className = 'caption-card';
    card.innerHTML = `
      <div class="caption-header ${platform}">
        <div class="caption-platform ${platform}">
          ${platformIcons[platform]}
          ${platformNames[platform]}
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="copy-btn" onclick="copyFromTextarea('${platform}')">Kopiera</span>
          <span class="copy-btn" onclick="sendToLater('${platform}')" style="background:var(--green, #2E5435);color:white;border-color:var(--green, #2E5435);">Later</span>
        </div>
      </div>
      <textarea
        class="caption-textarea"
        id="caption-${platform}"
        placeholder="Skriv din ${platformNames[platform]}-caption här..."
      ></textarea>
    `;
    grid.appendChild(card);
  });

  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function saveAll() {
  const textareas = document.querySelectorAll('.caption-textarea');
  const rows = [];

  textareas.forEach(ta => {
    const platform = ta.id.replace('caption-', '');
    const caption = ta.value.trim();
    if (caption) {
      rows.push({ topic: currentTopic, platform, caption });
    }
  });

  if (rows.length === 0) {
    alert('Klistra in minst en text innan du sparar.');
    return;
  }

  const { error } = await db.from('captions').insert(rows);

  const status = document.getElementById('save-status');
  if (error) {
    status.textContent = 'Kunde inte spara: ' + error.message;
    status.style.color = '#DC2626';
  } else {
    status.textContent = 'Sparat!';
    status.style.color = '#059669';
    setTimeout(() => status.textContent = '', 3000);
    loadHistory();
  }
}

async function loadHistory() {
  const { data, error } = await db
    .from('captions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) return;

  const section = document.getElementById('history-section');
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  data.forEach(item => {
    const date = new Date(item.created_at).toLocaleDateString('sv-SE', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    const el = document.createElement('div');
    el.className = 'history-item';
    el.innerHTML = `
      <div class="history-meta">
        <span class="history-topic">${item.topic}</span>
        <span class="history-platform-tag ${item.platform}">${platformNames[item.platform]}</span>
      </div>
      <div class="history-caption">${item.caption}</div>
      <div class="history-date">${date}</div>
    `;
    list.appendChild(el);
  });

  section.style.display = 'block';
}

async function copyFromTextarea(platform) {
  const ta = document.getElementById('caption-' + platform);
  if (!ta || !ta.value.trim()) return;
  await navigator.clipboard.writeText(ta.value);
  const btn = ta.previousElementSibling?.querySelector('.copy-btn') || ta.closest('.caption-card').querySelector('.copy-btn');
  if (btn) {
    btn.textContent = 'Kopierad!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Kopiera'; btn.classList.remove('copied'); }, 2000);
  }
}

document.getElementById('topic').addEventListener('keydown', e => {
  if (e.key === 'Enter') showPasteArea();
});

// --- Send to Later ---
async function sendToLater(platform) {
  const ta = document.getElementById('caption-' + platform);
  if (!ta || !ta.value.trim()) {
    alert('Skriv en caption först.');
    return;
  }

  const caption = ta.value.trim();
  const schedDate = document.getElementById('schedule-date')?.value;
  const schedTime = document.getElementById('schedule-time')?.value || '10:00';

  // Copy to clipboard first (always useful)
  await navigator.clipboard.writeText(caption);

  // Try webhook (if configured via Zapier → Later)
  try {
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        caption,
        scheduled_date: schedDate || null,
        scheduled_time: schedTime,
        topic: currentTopic
      })
    });
    if (res.ok) {
      const btn = ta.closest('.caption-card').querySelector('[onclick*="sendToLater"]');
      if (btn) {
        btn.textContent = 'Skickat!';
        setTimeout(() => { btn.textContent = 'Later'; }, 2500);
      }
      return;
    }
  } catch (e) {
    // Webhook not available — fallback to opening Later
  }

  // Fallback: open Later with caption copied
  const btn = ta.closest('.caption-card').querySelector('[onclick*="sendToLater"]');
  if (btn) {
    btn.textContent = 'Kopierad!';
    setTimeout(() => { btn.textContent = 'Later'; }, 2500);
  }
  window.open('https://app.later.com/schedule', '_blank');
}

// Pre-fill topic from URL param (from Idéer page "Skapa caption" button)
const urlParams = new URLSearchParams(window.location.search);
const prefillTopic = urlParams.get('topic');
if (prefillTopic) {
  document.getElementById('topic').value = prefillTopic;
  window.history.replaceState({}, '', window.location.pathname);
}

loadHistory();
