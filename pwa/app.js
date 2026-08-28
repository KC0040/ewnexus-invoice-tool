const PB = window.location.origin;
let TOKEN = null, COMPANY = null, CURRENT_TEMPLATE = null;

// ---------- tier helpers ----------
function isFree() { return !COMPANY || !COMPANY.subscription_tier || COMPANY.subscription_tier === 'free'; }
function isBase() { return COMPANY && (COMPANY.subscription_tier === 'base' || COMPANY.subscription_tier === 'pro'); }
function isPro()  { return COMPANY && COMPANY.subscription_tier === 'pro'; }
let serviceItems = [], discounts = [], customers = [], bundles = [], workOrders = [], expenses = [], recurringInvoices = [], appointments = [], reports = [];
let ONBOARDING_TEMPLATES = [], selectedOnboardingTemplateId = null;
let calMonthOffset = 0;
let reportPhotos = {before: [], after: []};

// ---------- screen helpers ----------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---------- auth ----------
function updateTrialBadge() {
  const badge = document.getElementById('trial-badge');
  if (!badge || !COMPANY) return;
  if (!isFree()) { badge.classList.add('hidden'); return; }
  const left = COMPANY.trial_invoices_left ?? 5;
  if (left > 0) {
    badge.textContent = `${left} free invoice${left===1?'':'s'} left`;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

async function doPostLogin() {
  document.getElementById('brand-name').innerText = COMPANY.company_name || 'EWNexus';
  // Check paywall
  if (isFree() && (COMPANY.trial_invoices_left ?? 5) <= 0) {
    showScreen('screen-paywall');
    return;
  }
  updateTrialBadge();
  if (!COMPANY.template) {
    await loadOnboardingTemplates();
    document.getElementById('ob-company-name').value = COMPANY.company_name || '';
    showScreen('screen-onboarding');
  } else {
    try {
      CURRENT_TEMPLATE = await authedFetch(`/api/collections/templates/records/${COMPANY.template}`);
      if (!CURRENT_TEMPLATE?.id) CURRENT_TEMPLATE = null;
    } catch { CURRENT_TEMPLATE = null; }
    document.getElementById('app-shell').classList.remove('hidden');
    switchScreen('invoice');
    await refreshAll();
  }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${PB}/api/collections/companies/auth-with-password`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({identity: email, password})
  });
  const data = await res.json();
  if (!res.ok) { document.getElementById('login-error').innerText = 'Login failed: ' + (data.message||''); return; }
  TOKEN = data.token;
  COMPANY = data.record;
  await doPostLogin();
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('register-error');
  errEl.innerText = '';
  const company_name = document.getElementById('reg-company').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  // Create company account (trial_invoices_left set by server hook)
  const res = await fetch(`${PB}/api/collections/companies/records`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({company_name, email, password, passwordConfirm: password})
  });
  const data = await res.json();
  if (!res.ok) { errEl.innerText = data.message || 'Registration failed'; return; }
  // Auto login
  const authRes = await fetch(`${PB}/api/collections/companies/auth-with-password`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({identity: email, password})
  });
  const authData = await authRes.json();
  if (!authRes.ok) { errEl.innerText = 'Account created — please sign in'; showScreen('screen-login'); return; }
  TOKEN = authData.token;
  COMPANY = authData.record;
  await doPostLogin();
});

async function authedFetch(path, opts={}) {
  opts.headers = Object.assign({}, opts.headers, {'Authorization': TOKEN});
  if (!(opts.body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(PB + path, opts);
  return res.json();
}

async function refreshAll() {
  await Promise.all([loadCustomers(), loadServiceItems(), loadDiscounts(), loadBundles(), loadWorkOrders(), loadRecurringInvoices(), loadAppointments(), loadReports()]);
  document.getElementById('settings-company-name').value = COMPANY.company_name || '';
  document.getElementById('settings-tax-rate').value = COMPANY.sales_tax_rate || '';
  document.getElementById('settings-tos').value = stripHtml(COMPANY.terms_of_service || '');
  document.getElementById('settings-payment-link').value = COMPANY.payment_link || '';
  initAssetSchema();
  renderSettingsTemplateName();
  loadPaymentSettings();
  loadBlockOrder();
  loadBrandingSettings();
  loadLanguageSettings();
}

function stripHtml(html) { const d = document.createElement('div'); d.innerHTML = html; return d.textContent || ''; }

// ---------- screen / sheet navigation ----------
function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(el => { if (el.id !== 'screen-login' && el.id !== 'screen-onboarding') el.classList.remove('active'); });
  document.getElementById('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('bg-secondary-container', b.dataset.nav === name));
  if (name === 'history') loadHistory();
  if (name === 'customers') renderCustomersScreen();
  if (name === 'finances') loadFinances();
  if (name === 'report') loadReportScreen();
}

function openSheet(id) {
  document.getElementById('sheet-backdrop').classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
  if (id === 'sheet-bundle') renderBundleItemPicker();
  if (id === 'sheet-recurring') renderRecurringItemPicker();
}
function closeSheets() {
  document.getElementById('sheet-backdrop').classList.add('hidden');
  ['sheet-customer','sheet-service-item','sheet-discount','sheet-bundle','sheet-recurring','sheet-appointment'].forEach(id => document.getElementById(id).classList.add('hidden'));
}

// ---------- onboarding ----------
async function loadOnboardingTemplates() {
  let data = {};
  try { data = await authedFetch('/api/collections/templates/records?perPage=50&sort=industry_name'); } catch {}
  ONBOARDING_TEMPLATES = data.items || [];
  const iconMap = {
    'plumbing':          'water_drop',
    'hvac':              'ac_unit',
    'handyman':          'handyman',
    'auto-repair':       'directions_car',
    'electrical':        'electrical_services',
    'landscaping':       'yard',
    'roofing':           'roofing',
    'pest-control':      'pest_control',
    'pool-service':      'pool',
    'appliance-repair':  'home_repair_service',
    'painting':          'format_paint',
    'cleaning':          'cleaning_services',
    'pressure-washing':  'water',
    'flooring':          'texture',
    'tree-service':      'park',
    'pet-grooming':      'pets',
    'computer-repair':   'computer',
    'electronics-repair':'electrical_services',
    'general':           'business_center',
  };
  // All templates selectable — no gating during onboarding
  const card = t => `
    <div class="template-card relative overflow-hidden rounded-xl bg-surface-container-lowest border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.05)] cursor-pointer p-4 transition-all" onclick="selectOnboardingTemplate('${t.id}', this)">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-title-md text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">${iconMap[t.slug]||'work'}</span>${t.industry_name}
        </h3>
        <span class="material-symbols-outlined text-primary selection-icon hidden">check_circle</span>
      </div>
      <ul class="text-body-sm text-on-surface-variant space-y-0.5 mt-1">
        ${(t.default_service_items||[]).slice(0,3).map(i=>`<li>• ${i.name}</li>`).join('')}
      </ul>
    </div>`;
  const grid = document.getElementById('ob-template-grid');
  if (ONBOARDING_TEMPLATES.length === 0) {
    grid.innerHTML = '<p class="text-on-surface-variant text-body-md col-span-full">No templates found. You can set up your service items manually in Settings.</p>';
  } else {
    grid.innerHTML = ONBOARDING_TEMPLATES.map(card).join('');
  }
}
function selectOnboardingTemplate(id, el) {
  document.querySelectorAll('.template-card').forEach(c => { c.classList.remove('border-primary','ring-2','ring-primary'); c.querySelector('.selection-icon').classList.add('hidden'); });
  el.classList.add('border-primary','ring-2','ring-primary');
  el.querySelector('.selection-icon').classList.remove('hidden');
  selectedOnboardingTemplateId = id;
  document.getElementById('ob-btn-next2').disabled = false;
}
function obGoToStep(step) {
  document.querySelectorAll('#screen-onboarding .step-section').forEach(el => el.classList.remove('active'));
  document.getElementById('ob-step-' + step).classList.add('active');
  document.getElementById('ob-progress-fill').style.width = (step/4*100) + '%';
  document.getElementById('ob-progress-text').innerText = `Step ${step} of 4`;
  if (step === 3) {
    const tmpl = ONBOARDING_TEMPLATES.find(t => t.id === selectedOnboardingTemplateId);
    const tosEl = document.getElementById('ob-tos');
    if (tmpl && !tosEl.value) tosEl.value = stripHtml(tmpl.default_terms_draft || '');
  }
}
async function finishOnboarding() {
  if (!selectedOnboardingTemplateId) { alert('Select an industry first'); return; }
  const body = {
    template: selectedOnboardingTemplateId,
    company_name: document.getElementById('ob-company-name').value,
    terms_of_service: document.getElementById('ob-tos').value
  };
  const data = await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', body: JSON.stringify(body)});
  if (!data.id) { document.getElementById('ob-result').innerText = 'ERROR: ' + JSON.stringify(data); return; }
  COMPANY = data;
  const tmpl = ONBOARDING_TEMPLATES.find(t => t.id === selectedOnboardingTemplateId);
  if (tmpl && tmpl.default_service_items) {
    for (const item of tmpl.default_service_items) {
      await authedFetch('/api/collections/service_items/records', {method:'POST', body: JSON.stringify({company: COMPANY.id, item_name: item.name, default_price: item.price})});
    }
  }
  CURRENT_TEMPLATE = tmpl;
  obGoToStep(4);
}
function enterApp() {
  document.getElementById('screen-onboarding').classList.remove('active');
  document.getElementById('app-shell').classList.remove('hidden');
  switchScreen('invoice');
  refreshAll();
}

// ---------- customers ----------
async function loadCustomers() {
  const data = await authedFetch('/api/collections/customers/records?perPage=200&sort=customer_name');
  customers = data.items || [];
  const sel = document.getElementById('customer-select');
  sel.innerHTML = '<option value="">-- select customer --</option>' +
    customers.map(c => `<option value="${c.id}">${c.customer_name} (${c.email || c.phone || 'no contact'})</option>`).join('');
}

async function createCustomer() {
  const body = {
    company: COMPANY.id,
    customer_name: document.getElementById('nc-name').value,
    phone: document.getElementById('nc-phone').value,
    email: document.getElementById('nc-email').value,
    address: document.getElementById('nc-address').value
  };
  const data = await authedFetch('/api/collections/customers/records', {method:'POST', body: JSON.stringify(body)});
  if (data.id) {
    await loadCustomers();
    document.getElementById('customer-select').value = data.id;
    closeSheets();
    ['nc-name','nc-phone','nc-email','nc-address'].forEach(id => document.getElementById(id).value = '');
  } else { alert('Failed: ' + JSON.stringify(data)); }
}

// ---------- service items ----------
async function loadServiceItems() {
  const data = await authedFetch('/api/collections/service_items/records?perPage=200');
  serviceItems = data.items || [];
  const box = document.getElementById('service-items-list');
  box.innerHTML = serviceItems.map(si => `
    <div class="flex items-start gap-3 p-3 rounded-lg border border-outline-variant bg-surface">
      <div class="flex items-center h-5 mt-1">
        <input type="checkbox" class="si-check w-5 h-5 text-primary rounded" value="${si.id}" data-price="${si.default_price}" onchange="recalc()">
      </div>
      <div class="flex-1">
        <label class="text-body-md text-on-surface font-semibold block">${si.item_name}</label>
      </div>
      <div class="text-headline-md text-on-surface">$${Number(si.default_price).toFixed(2)}</div>
    </div>`).join('') || '<p class="text-on-surface-variant text-body-md">No service items yet — add one in Settings.</p>';

  const settingsBox = document.getElementById('settings-service-items-list');
  if (settingsBox) {
    settingsBox.innerHTML = serviceItems.map(si => `
      <div class="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface">
        <div>
          <div><span class="text-body-md font-semibold">${si.item_name}</span> <span class="text-on-surface-variant">$${Number(si.default_price).toFixed(2)}</span></div>
          ${si.description ? `<div class="text-body-sm text-on-surface-variant">${si.description}</div>` : ''}
        </div>
        <button onclick="deleteServiceItem('${si.id}')" class="text-error"><span class="material-symbols-outlined text-[20px]">delete</span></button>
      </div>`).join('') || '<p class="text-on-surface-variant text-body-md">No service items yet.</p>';
  }
}

async function deleteServiceItem(id) {
  if (!confirm('Delete this service item?')) return;
  await authedFetch(`/api/collections/service_items/records/${id}`, {method:'DELETE'});
  await loadServiceItems();
}

async function deleteDiscount(id) {
  if (!confirm('Delete this discount?')) return;
  await authedFetch(`/api/collections/discounts/records/${id}`, {method:'DELETE'});
  await loadDiscounts();
}

async function createServiceItem() {
  const body = { company: COMPANY.id, item_name: document.getElementById('si-name').value,
    default_price: parseFloat(document.getElementById('si-price').value) || 0,
    description: document.getElementById('si-description').value.trim() };
  const data = await authedFetch('/api/collections/service_items/records', {method:'POST', body: JSON.stringify(body)});
  if (data.id) { await loadServiceItems(); closeSheets(); document.getElementById('si-name').value=''; document.getElementById('si-price').value=''; document.getElementById('si-description').value=''; }
  else { alert('Failed: ' + JSON.stringify(data)); }
}

// ---------- discounts ----------
async function loadDiscounts() {
  const data = await authedFetch('/api/collections/discounts/records?perPage=200');
  discounts = data.items || [];
  const box = document.getElementById('discount-list');
  box.innerHTML = `<label class="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface cursor-pointer">
      <div class="flex items-center gap-2"><input class="discount-radio" type="radio" name="discount" value="" checked onchange="recalc()"><span>None</span></div>
    </label>` +
    discounts.map(d => `
    <label class="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface cursor-pointer">
      <div class="flex items-center gap-2">
        <input class="discount-radio" type="radio" name="discount" value="${d.id}" onchange="recalc()">
        <span>${d.discount_name}</span>
      </div>
      <span class="text-outline text-label-md">${d.discount_type === 'percentage' ? d.value + '%' : '$' + d.value}</span>
    </label>`).join('');

  const settingsBox = document.getElementById('settings-discounts-list');
  if (settingsBox) {
    settingsBox.innerHTML = discounts.map(d => `
      <div class="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface">
        <div><span class="text-body-md font-semibold">${d.discount_name}</span> <span class="text-on-surface-variant">${d.discount_type === 'percentage' ? d.value+'%' : '$'+d.value}</span></div>
        <button onclick="deleteDiscount('${d.id}')" class="text-error"><span class="material-symbols-outlined text-[20px]">delete</span></button>
      </div>`).join('') || '<p class="text-on-surface-variant text-body-md">No discounts yet.</p>';
  }
}

async function createDiscount() {
  const body = { company: COMPANY.id, discount_name: document.getElementById('disc-name').value,
    discount_type: document.getElementById('disc-type').value, value: parseFloat(document.getElementById('disc-value').value) || 0,
    description: document.getElementById('disc-description').value.trim() };
  const data = await authedFetch('/api/collections/discounts/records', {method:'POST', body: JSON.stringify(body)});
  if (data.id) { await loadDiscounts(); closeSheets(); document.getElementById('disc-name').value=''; document.getElementById('disc-value').value=''; document.getElementById('disc-description').value=''; }
  else { alert('Failed: ' + JSON.stringify(data)); }
}

// ---------- bundles ----------
async function loadBundles() {
  const data = await authedFetch('/api/collections/bundles/records?perPage=200&expand=items');
  bundles = data.items || [];
  const box = document.getElementById('bundles-list');
  box.innerHTML = bundles.map(b => {
    const subnames = (b.expand && b.expand.items) ? b.expand.items.map(i=>i.item_name).join(' + ') : '';
    const subJson = JSON.stringify((b.expand && b.expand.items) ? b.expand.items.map(i=>i.item_name) : []).replace(/'/g, "&#39;");
    return `
    <div class="flex items-start gap-3 p-3 rounded-lg border border-outline-variant bg-surface">
      <div class="flex items-center h-5 mt-1">
        <input type="checkbox" class="bd-check w-5 h-5 text-primary rounded" value="${b.id}" data-price="${b.price}" data-name="${b.bundle_name}" data-sub='${subJson}' onchange="recalc()">
      </div>
      <div class="flex-1">
        <label class="text-body-md text-on-surface font-semibold block">${b.bundle_name}</label>
        <p class="text-on-surface-variant text-[13px]">${subnames}</p>
      </div>
      <div class="text-headline-md text-on-surface">$${Number(b.price).toFixed(2)}</div>
    </div>`;
  }).join('') || '<p class="text-on-surface-variant text-body-md">No bundles yet — add one in Settings.</p>';

  const settingsBox = document.getElementById('settings-bundles-list');
  if (settingsBox) {
    settingsBox.innerHTML = bundles.map(b => `
      <div class="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface">
        <div><span class="text-body-md font-semibold">${b.bundle_name}</span> <span class="text-on-surface-variant">$${Number(b.price).toFixed(2)}</span></div>
        <button onclick="deleteBundle('${b.id}')" class="text-error"><span class="material-symbols-outlined text-[20px]">delete</span></button>
      </div>`).join('') || '<p class="text-on-surface-variant text-body-md">No bundles yet.</p>';
  }
}
async function deleteBundle(id) {
  if (!confirm('Delete this bundle?')) return;
  await authedFetch(`/api/collections/bundles/records/${id}`, {method:'DELETE'});
  await loadBundles();
}
function renderBundleItemPicker() {
  const box = document.getElementById('bd-items-list');
  box.innerHTML = serviceItems.map(si => `
    <label class="flex items-center gap-2 p-2 border border-outline-variant rounded-lg">
      <input type="checkbox" class="bdi-check" value="${si.id}"> ${si.item_name} ($${Number(si.default_price).toFixed(2)})
    </label>`).join('') || '<p class="text-on-surface-variant text-body-md">Add service items first.</p>';
}
async function createBundle() {
  const items = Array.from(document.querySelectorAll('.bdi-check:checked')).map(c => c.value);
  const body = {
    company: COMPANY.id,
    bundle_name: document.getElementById('bd-name').value,
    price: parseFloat(document.getElementById('bd-price').value) || 0,
    description: document.getElementById('bd-description').value,
    items
  };
  const data = await authedFetch('/api/collections/bundles/records', {method:'POST', body: JSON.stringify(body)});
  if (data.id) {
    await loadBundles(); closeSheets();
    ['bd-name','bd-price','bd-description'].forEach(id => document.getElementById(id).value='');
  } else { alert('Failed: ' + JSON.stringify(data)); }
}

// ---------- asset / target-object fields (custom schema) ----------
let ASSET_SCHEMA = []; // [{label, level:'main'|'detail', required:bool}]

function getAssetSchema() {
  try { return JSON.parse(COMPANY.custom_asset_schema || '[]'); } catch(e) { return []; }
}

function initAssetSchema() {
  ASSET_SCHEMA = getAssetSchema();
  // seed from template if worker has no schema yet
  if (!ASSET_SCHEMA.length && CURRENT_TEMPLATE && CURRENT_TEMPLATE.asset_field_schema && CURRENT_TEMPLATE.asset_field_schema.length) {
    ASSET_SCHEMA = CURRENT_TEMPLATE.asset_field_schema.map(f => ({label: f.label, level: 'main', required: true}));
  }
  renderAssetSchemaSettings();
  renderAssetFieldsSection();
}

function renderAssetSchemaSettings() {
  const box = document.getElementById('settings-asset-schema-list');
  if (!box) return;
  if (!ASSET_SCHEMA.length) {
    box.innerHTML = '<p class="text-body-sm text-on-surface-variant">No fields yet. Add main or detail fields below.</p>';
    return;
  }
  box.innerHTML = ASSET_SCHEMA.map((f, i) => `
    <div class="flex items-center gap-2 p-3 rounded-lg border border-outline-variant bg-surface">
      <span class="text-label-sm font-semibold px-2 py-0.5 rounded ${f.level === 'main' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'} shrink-0">
        ${f.level === 'main' ? 'MAIN' : 'DETAIL'}
      </span>
      <input value="${f.label}" oninput="updateAssetFieldLabel(${i}, this.value)"
        class="flex-1 min-w-0 border border-outline-variant rounded px-2 py-1 text-body-md bg-surface">
      <label class="flex items-center gap-1 text-label-sm shrink-0 cursor-pointer">
        <input type="checkbox" ${f.required ? 'checked' : ''} onchange="toggleAssetRequired(${i}, this.checked)">
        Req
      </label>
      <button onclick="removeAssetField(${i})" class="text-error shrink-0">
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>`).join('');
}

function addAssetField(level) {
  ASSET_SCHEMA.push({label: level === 'main' ? 'New field' : 'Detail field', level, required: true});
  renderAssetSchemaSettings();
}
function removeAssetField(i) {
  ASSET_SCHEMA.splice(i, 1);
  renderAssetSchemaSettings();
}
function updateAssetFieldLabel(i, val) { ASSET_SCHEMA[i].label = val; }
function toggleAssetRequired(i, checked) { ASSET_SCHEMA[i].required = checked; renderAssetSchemaSettings(); }

function renderAssetFieldsSection() {
  const invSection = document.getElementById('asset-fields-section');
  const invList = document.getElementById('asset-fields-list');
  const repSection = document.getElementById('report-asset-fields-section');
  const repList = document.getElementById('report-asset-fields-list');
  if (!ASSET_SCHEMA.length) {
    invSection.classList.add('hidden'); repSection.classList.add('hidden');
    return;
  }
  const buildInputs = (prefix) => ASSET_SCHEMA.map((f, i) => {
    const isDetail = f.level === 'detail';
    const placeholder = f.required ? f.label : `${f.label} (optional)`;
    return `<div class="${isDetail ? 'pl-5 border-l-2 border-outline-variant' : ''}">
      <label class="block text-label-md text-on-surface mb-1 ${isDetail ? 'text-on-surface-variant' : ''}">${f.label}${!f.required ? ' <span class="text-xs font-normal">(optional)</span>' : ''}</label>
      <input id="af-${prefix}-${i}" class="w-full py-3 px-3 border border-outline-variant rounded-lg bg-surface" placeholder="${placeholder}">
    </div>`;
  }).join('');
  invList.innerHTML = buildInputs('inv');
  repList.innerHTML = buildInputs('rep');
  invSection.classList.remove('hidden');
  repSection.classList.remove('hidden');
}

function collectAssetDetails(prefix) {
  const out = {};
  ASSET_SCHEMA.forEach((f, i) => {
    const el = document.getElementById(`af-${prefix}-${i}`);
    if (el && el.value) out[f.label] = el.value;
  });
  return out;
}

function calcWorkDuration() {
  const s = document.getElementById('report-start-time').value;
  const e = document.getElementById('report-end-time').value;
  const div = document.getElementById('work-duration');
  if (!s || !e) { div.classList.add('hidden'); return; }
  const [sh, sm] = s.split(':').map(Number);
  const [eh, em] = e.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) { div.classList.add('hidden'); return; }
  const h = Math.floor(mins / 60), m = mins % 60;
  div.textContent = `Duration: ${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'min' : ''}`;
  div.classList.remove('hidden');
}

// ---------- totals ----------
function getCurrentDiscount() {
  const el = document.querySelector('.discount-radio:checked');
  return el && el.value ? discounts.find(d => d.id === el.value) : null;
}

function computeTotals() {
  let subtotal = 0;
  const items = [];
  document.querySelectorAll('.si-check:checked').forEach(chk => {
    const price = parseFloat(chk.dataset.price);
    subtotal += price;
    const si = serviceItems.find(x => x.id === chk.value);
    items.push({name: si.item_name, price, description: si.description || ''});
  });
  document.querySelectorAll('.bd-check:checked').forEach(chk => {
    const price = parseFloat(chk.dataset.price);
    subtotal += price;
    let sub = [];
    try { sub = JSON.parse(chk.dataset.sub); } catch (e) {}
    items.push({name: chk.dataset.name, price, subitems: sub});
  });
  const d = getCurrentDiscount();
  let discountAmount = 0;
  if (d) discountAmount = d.discount_type === 'percentage' ? subtotal * (d.value/100) : d.value;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxRate = COMPANY.sales_tax_rate || 0;
  const taxAmount = taxable * (taxRate/100);
  const total = taxable + taxAmount;
  return {subtotal, discountAmount, taxAmount, total, items, discount: d};
}

function recalc() {
  const {total} = computeTotals();
  document.getElementById('total').innerText = total.toFixed(2);
}

// ---------- preview (A4) ----------
function collectInvoiceData() {
  const {subtotal, discountAmount, taxAmount, total, items, discount} = computeTotals();
  const custId = document.getElementById('customer-select').value;
  const cust = customers.find(c => c.id === custId);
  const assetDetails = collectAssetDetails('inv');
  const logoUrl = COMPANY.logo ? `${PB}/api/files/${COMPANY.collectionId}/${COMPANY.id}/${COMPANY.logo}` : '';
  const dateVal = document.getElementById('invoice-date').value || new Date().toISOString().slice(0,10);

  // Branding settings
  const invoiceColor  = COMPANY.invoice_color || '#004ac6';
  const fontStyle     = getFontStyle(COMPANY.invoice_font || 'inter');
  const titleLabel    = COMPANY.invoice_title_label || 'INVOICE';
  const numPrefix     = COMPANY.invoice_number_prefix || '';
  const footerMsg     = COMPANY.invoice_footer_msg || '';
  const dateFmt       = COMPANY.invoice_date_format || 'MM/DD/YYYY';
  const formattedDate = formatInvoiceDate(dateVal, dateFmt);
  const hidden        = new Set(COMPANY.invoice_hidden_blocks ? JSON.parse(COMPANY.invoice_hidden_blocks) : []);
  const iLang         = COMPANY.invoice_language || 'en';
  const L             = getLabelSet(iLang); // label set — bilingual aware

  // Invoice number (sequential from work orders count + prefix)
  const invoiceNum = `${numPrefix}${String((workOrders.length || 0) + 1).padStart(4, '0')}`;

  // Header block
  const bannerUrl = COMPANY.invoice_header_banner
    ? `${PB}/api/files/${COMPANY.collectionId}/${COMPANY.id}/${COMPANY.invoice_header_banner}` : null;

  let html = `<div style="${fontStyle}">`;

  // HEADER (always shown)
  if (bannerUrl) {
    html += `<div style="margin:-0px 0 24px;border-radius:8px 8px 0 0;overflow:hidden;height:80px;">
      <img src="${bannerUrl}" style="width:100%;height:80px;object-fit:cover;">
    </div>`;
    html += `<div class="flex justify-between items-start pb-6 mb-6 border-b-2 border-[#0b1c30]">
      <div class="font-bold text-xl">${COMPANY.company_name || 'Your Company'}</div>
      <div class="text-right">
        <div class="text-2xl font-bold" style="color:${invoiceColor}">${titleLabel}</div>
        <div class="text-xs text-[#434655] font-mono">#${invoiceNum}</div>
        <div class="text-sm text-[#434655]">${formattedDate}</div>
      </div>
    </div>`;
  } else {
    html += `<div style="background:${invoiceColor};color:#fff;margin:-0px 0 0;padding:20px 24px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:12px;">
        ${logoUrl ? `<img src="${logoUrl}" style="width:48px;height:48px;object-fit:contain;border-radius:6px;background:rgba(255,255,255,.15);">` : getDefaultLogoHtml(true)}
        <div style="font-weight:700;font-size:18px;">${COMPANY.company_name || 'Your Company'}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:22px;font-weight:800;">${titleLabel}</div>
        <div style="font-size:12px;opacity:.8;font-family:monospace;">#${invoiceNum}</div>
        <div style="font-size:13px;opacity:.85;margin-top:2px;">${formattedDate}</div>
      </div>
    </div>
    <div style="margin-bottom:24px;"></div>`;
  }

  // COMPANY block
  if (!hidden.has('company') && (COMPANY.phone || COMPANY.email || COMPANY.address)) {
    html += `<div class="text-xs text-[#434655] mb-6">
      ${COMPANY.phone ? `<span>${COMPANY.phone}</span>` : ''}
      ${COMPANY.email ? `<span class="ml-3">${COMPANY.email}</span>` : ''}
      ${COMPANY.address ? `<span class="ml-3">${COMPANY.address}</span>` : ''}
    </div>`;
  }

  // CLIENT block
  if (!hidden.has('client')) {
    html += `<div class="mb-6">
      <div class="text-xs uppercase tracking-wide text-[#434655] mb-1">${L.billTo}</div>
      <div class="font-semibold">${cust ? cust.customer_name : '(no customer selected)'}</div>
      ${cust && cust.phone ? `<div class="text-sm">${cust.phone}</div>` : ''}
      ${cust && cust.email ? `<div class="text-sm">${cust.email}</div>` : ''}
      ${cust && cust.address ? `<div class="text-sm">${cust.address}</div>` : ''}
    </div>`;
  }

  // ASSETS block
  if (!hidden.has('assets') && Object.keys(assetDetails).length) {
    const assetRows = ASSET_SCHEMA.filter(f => assetDetails[f.label]).map(f =>
      f.level === 'detail'
        ? `<div class="pl-4 border-l-2 border-[#c3c6d7] mt-1"><span class="text-[#434655] text-xs">${f.label}:</span> <span class="text-xs">${assetDetails[f.label]}</span></div>`
        : `<div class="mt-1 font-medium"><span class="text-[#434655]">${f.label}:</span> ${assetDetails[f.label]}</div>`
    ).join('');
    html += `<div class="mb-6 text-sm border border-[#c3c6d7] rounded-lg p-3">${assetRows}</div>`;
  }

  html += `<table class="w-full mb-6 text-sm"><thead><tr class="border-b border-[#c3c6d7] text-left text-[#434655]"><th class="py-2">${L.description}</th><th class="py-2 text-right">${L.amount}</th></tr></thead><tbody>`;
  items.forEach(i => {
    const descRow = i.description ? `<div class="text-xs text-[#737686] mt-0.5">${i.description}</div>` : '';
    html += `<tr class="border-b border-[#e5eeff]"><td class="py-2"><div class="font-medium">${i.name}</div>${descRow}</td><td class="py-2 text-right align-top">$${i.price.toFixed(2)}</td></tr>`;
    if (i.subitems && i.subitems.length) {
      i.subitems.forEach(s => html += `<tr class="text-[#737686] text-xs"><td class="py-1 pl-4">— ${s}</td><td></td></tr>`);
    }
  });
  html += `</tbody></table>`;

  html += `<div class="flex justify-end mb-6"><div class="w-full max-w-[280px] space-y-1 text-sm">
    <div class="flex justify-between"><span>${L.subtotal}</span><span>$${subtotal.toFixed(2)}</span></div>`;
  if (discount) html += `<div class="flex justify-between text-[#ba1a1a]"><span>${discount.discount_name}</span><span>-$${discountAmount.toFixed(2)}</span></div>`;
  html += `<div class="flex justify-between"><span>${L.tax}</span><span>$${taxAmount.toFixed(2)}</span></div>
    <div class="flex justify-between text-lg font-bold border-t border-[#0b1c30] pt-2 mt-2"><span>${L.total}</span><span>$${total.toFixed(2)}</span></div>
  </div></div>`;

  if (COMPANY.payment_link) {
    html += `<div class="mt-8 text-center">
      <a href="${COMPANY.payment_link}" target="_blank" rel="noopener noreferrer"
         style="background:${invoiceColor}"
         class="inline-block text-white font-semibold text-sm px-8 py-3 rounded-lg no-underline">
        ${L.payNow}
      </a>
    </div>`;
  }

  // PAYMENT methods block
  if (!hidden.has('payment')) {
    const hasZelle = COMPANY.zelle_email || COMPANY.zelle_phone;
    const hasAch = COMPANY.ach_routing && COMPANY.ach_account;
    if (hasZelle || hasAch) {
      html += `<div class="mt-8 border border-[#c3c6d7] rounded-lg p-4 bg-[#f8f9ff]">
        <div class="font-semibold text-sm mb-3" style="color:${invoiceColor}">${L.howToPay}</div>`;
      if (hasZelle) {
        const zelleQrUrl = COMPANY.zelle_qr ? `${PB}/api/files/companies/${COMPANY.id}/${COMPANY.zelle_qr}` : null;
        html += `<div class="flex items-start gap-4 mb-3">
          ${zelleQrUrl ? `<img src="${zelleQrUrl}" class="w-20 h-20 object-contain rounded border border-[#c3c6d7]" alt="Zelle QR">` : ''}
          <div>
            <div class="font-medium text-sm text-[#0b1c30] mb-1">Zelle</div>
            ${COMPANY.zelle_email ? `<div class="text-xs text-[#434655]">Email: ${COMPANY.zelle_email}</div>` : ''}
            ${COMPANY.zelle_phone ? `<div class="text-xs text-[#434655]">Phone: ${COMPANY.zelle_phone}</div>` : ''}
            <div class="text-xs text-[#737686] mt-1">${L.zelleInstant}</div>
          </div>
        </div>`;
      }
      if (hasAch) {
        html += `<div class="border-t border-[#c3c6d7] pt-3">
          <div class="font-medium text-sm text-[#0b1c30] mb-1">${L.achDays.includes('días') ? 'ACH / Transferencia Bancaria' : (L.achDays.includes('工作天') ? 'ACH 銀行轉帳' : 'ACH Bank Transfer')}${COMPANY.ach_bank_name ? ` — ${COMPANY.ach_bank_name}` : ''}</div>
          <div class="text-xs text-[#434655] font-mono">Routing: ${COMPANY.ach_routing}</div>
          <div class="text-xs text-[#434655] font-mono">Account: ${COMPANY.ach_account}</div>
          <div class="text-xs text-[#737686] mt-1">${L.achDays}</div>
        </div>`;
      }
      html += `</div>`;
    }
  }

  // NOTES / TOS block
  if (!hidden.has('notes')) {
    const tos = stripHtml(COMPANY.terms_of_service || '');
    if (tos) html += `<div class="text-xs text-[#737686] border-t border-[#c3c6d7] pt-4 mt-8 whitespace-pre-wrap break-words overflow-wrap-anywhere"><strong>${L.terms}</strong><br>${tos}</div>`;
  }

  // SIGNATURE block
  if (!hidden.has('signature')) {
    html += `<div class="mt-8 pt-4 border-t border-[#c3c6d7] flex justify-between text-xs text-[#737686]">
      <div>${L.signatureLine} _______________________</div>
      <div>${L.dateLine} ___________</div>
    </div>`;
  }

  // Footer message
  if (footerMsg) {
    html += `<div class="mt-6 text-center text-xs text-[#737686] italic">${footerMsg}</div>`;
  }

  html += `</div>`; // close font wrapper

  return {
    subtotal, discountAmount, taxAmount, total, items, discount,
    cust, assetDetails, logoUrl, bannerUrl, invoiceNum, formattedDate,
    invoiceColor, fontStyle, titleLabel, numPrefix, footerMsg, hidden, L,
    iLang,
  };
}

function showPreview() {
  const d = collectInvoiceData();
  const slug = COMPANY.invoice_visual_template || 'clean-white';
  document.getElementById('preview-content').innerHTML = renderInvoiceTemplate(slug, d);
  document.getElementById('modal-preview').classList.remove('hidden');
}
function closePreview() { document.getElementById('modal-preview').classList.add('hidden'); }

// ---------- work orders ----------
async function loadWorkOrders() {
  const data = await authedFetch('/api/collections/work_orders/records?perPage=500');
  workOrders = data.items || [];
}

async function createWorkOrder() {
  const customerId = document.getElementById('customer-select').value;
  if (!customerId) { alert('Select a customer first'); return; }
  const {subtotal, discountAmount, taxAmount, total, items, discount} = computeTotals();
  const dateVal = document.getElementById('invoice-date').value;
  const body = {
    company: COMPANY.id, customer: customerId, line_items: items,
    subtotal, discount_applied: discount ? discount.id : null, tax_amount: taxAmount, total_amount: total,
    payment_status: document.getElementById('payment-status').value,
    work_date: dateVal ? dateVal + ' 00:00:00' : null,
    asset_details: collectAssetDetails('inv')
  };
  const data = await authedFetch('/api/collections/work_orders/records', {method:'POST', body: JSON.stringify(body)});
  if (data.id) {
    document.getElementById('wo-result').innerText = `Saved — invoice total $${data.total_amount}. Sending...`;
    document.querySelectorAll('.si-check:checked, .bd-check:checked').forEach(c => c.checked = false);
    recalc();
    await loadWorkOrders();
    if (body.payment_status !== 'estimate') {
      const sendResult = await authedFetch(`/api/send-invoice/${data.id}`, {method:'POST'});
      document.getElementById('wo-result').innerText = `Saved — invoice total $${data.total_amount}. ${describeSendResult(sendResult)}`;
    } else {
      document.getElementById('wo-result').innerText = `Saved as estimate — $${data.total_amount} (not sent, it's just a quote for now)`;
    }
  } else {
    document.getElementById('wo-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}
function describeSendResult(r) {
  const parts = [];
  if (r.emailed) parts.push('emailed to customer');
  else if (r.email_dry_run) parts.push(r.email_skipped_reason || 'email not sent (SMTP not configured yet)');
  if (r.texted) parts.push('texted to customer');
  else if (r.sms_dry_run) parts.push(r.sms_skipped_reason || 'SMS not sent (Twilio not configured yet)');
  return parts.join(' · ');
}

// ---------- job report ----------
function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
// ---------- report groups ----------
let reportGroups = []; // [{title, beforeFile, beforeDataUrl, beforeCaption, afterFile, afterDataUrl, afterCaption}]
let currentGroupTarget = null; // {index, type: 'before'|'after'}

function addReportGroup() {
  if (reportGroups.length >= 10) return;
  reportGroups.push({title:'', beforeFile:null, beforeDataUrl:null, beforeCaption:'', afterFile:null, afterDataUrl:null, afterCaption:'', inGallery:false});
  renderReportGroups();
}
function removeReportGroup(i) {
  reportGroups.splice(i, 1);
  renderReportGroups();
}
function renderReportGroups() {
  const container = document.getElementById('report-groups-container');
  const addBtn = document.getElementById('add-group-btn');
  document.getElementById('add-group-label').innerText = `Add Group (${reportGroups.length} / 10)`;
  addBtn.classList.toggle('hidden', reportGroups.length >= 10);
  container.innerHTML = reportGroups.map((g, i) => `
    <section class="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/30">
      <div class="flex justify-between items-center mb-3">
        <span class="text-label-md font-semibold text-primary">Group ${i+1}</span>
        <button onclick="removeReportGroup(${i})" class="text-error"><span class="material-symbols-outlined text-[20px]">delete</span></button>
      </div>
      <input value="${g.title.replace(/"/g,'&quot;')}" oninput="reportGroups[${i}].title=this.value"
        placeholder="Describe the issue / task for this group (e.g. Leaking kitchen pipe)"
        class="w-full py-3 px-3 border border-outline-variant rounded-lg bg-surface mb-4 text-body-md">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <div class="text-label-sm font-bold text-error mb-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">warning</span> BEFORE
          </div>
          <div onclick="triggerGroupPhoto(${i},'before')" class="cursor-pointer rounded-xl overflow-hidden border-2 ${g.beforeDataUrl ? 'border-outline-variant' : 'border-dashed border-outline-variant'} mb-2 flex items-center justify-center min-h-[120px] bg-surface">
            ${g.beforeDataUrl
              ? `<img src="${g.beforeDataUrl}" class="w-full object-cover max-h-[200px]">`
              : `<div class="flex flex-col items-center gap-1 text-on-surface-variant p-4"><span class="material-symbols-outlined text-2xl">photo_camera</span><span class="text-label-sm">Tap to add</span></div>`}
          </div>
          <input value="${g.beforeCaption.replace(/"/g,'&quot;')}" oninput="reportGroups[${i}].beforeCaption=this.value"
            placeholder="Describe the problem..." class="w-full py-2 px-3 border border-outline-variant rounded-lg bg-surface text-body-sm">
        </div>
        <div>
          <div class="text-label-sm font-bold text-[#1a7f4b] mb-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">check_circle</span> AFTER
          </div>
          <div onclick="triggerGroupPhoto(${i},'after')" class="cursor-pointer rounded-xl overflow-hidden border-2 ${g.afterDataUrl ? 'border-outline-variant' : 'border-dashed border-outline-variant'} mb-2 flex items-center justify-center min-h-[120px] bg-surface">
            ${g.afterDataUrl
              ? `<img src="${g.afterDataUrl}" class="w-full object-cover max-h-[200px]">`
              : `<div class="flex flex-col items-center gap-1 text-on-surface-variant p-4"><span class="material-symbols-outlined text-2xl">photo_camera</span><span class="text-label-sm">Tap to add</span></div>`}
          </div>
          <input value="${g.afterCaption.replace(/"/g,'&quot;')}" oninput="reportGroups[${i}].afterCaption=this.value"
            placeholder="Result after fix..." class="w-full py-2 px-3 border border-outline-variant rounded-lg bg-surface text-body-sm">
        </div>
      </div>
      ${COMPANY.gallery_enabled ? `
      <div class="mt-3 pt-3 border-t border-outline-variant flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" ${g.inGallery ? 'checked' : ''} onchange="reportGroups[${i}].inGallery=this.checked"
            class="w-5 h-5 text-primary rounded">
          <span class="text-label-md text-on-surface">Include in Website Gallery</span>
        </label>
        <span class="text-body-sm text-on-surface-variant">EWNexus will add these photos to your portfolio</span>
      </div>` : ''}
    </section>`).join('');
}
function triggerGroupPhoto(index, type) {
  currentGroupTarget = {index, type};
  document.getElementById('group-photo-input').click();
}
async function onGroupPhotoSelected(file) {
  if (!file || !currentGroupTarget) return;
  const {index, type} = currentGroupTarget;
  const dataUrl = await fileToDataUrl(file);
  if (type === 'before') { reportGroups[index].beforeFile = file; reportGroups[index].beforeDataUrl = dataUrl; }
  else { reportGroups[index].afterFile = file; reportGroups[index].afterDataUrl = dataUrl; }
  renderReportGroups();
  currentGroupTarget = null;
}

function loadReportScreen() {
  const sel = document.getElementById('report-customer-select');
  sel.innerHTML = '<option value="">-- select customer --</option>' +
    customers.map(c => `<option value="${c.id}">${c.customer_name}</option>`).join('');
  const tierNote = document.getElementById('report-tier-note');
  if (tierNote) tierNote.innerText = isPro()
    ? 'Pro: photos are stored for 1 year on Cloudflare R2.'
    : 'Base plan: photos are used for your PDF report but not stored on server.';
  reportGroups = [];
  renderReportGroups();
  ['report-objective','report-findings','report-materials','report-recommendations','report-summary','report-signature','report-asset-freeform'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('report-start-time').value = '';
  document.getElementById('report-end-time').value = '';
  document.getElementById('work-duration').classList.add('hidden');
  onReportCustomerChange();
}
async function loadReports() {
  const data = await authedFetch('/api/collections/reports/records?perPage=500&sort=-work_date');
  reports = data.items || [];
}
function switchReportView(view) {
  document.getElementById('view-report-new').classList.toggle('hidden', view !== 'new');
  document.getElementById('view-report-history').classList.toggle('hidden', view !== 'history');
  document.getElementById('report-save-bar').classList.toggle('hidden', view !== 'new');
  const newBtn = document.getElementById('btn-report-new'), histBtn = document.getElementById('btn-report-hist');
  newBtn.classList.toggle('bg-surface', view==='new'); newBtn.classList.toggle('text-primary', view==='new'); newBtn.classList.toggle('shadow-sm', view==='new');
  histBtn.classList.toggle('bg-surface', view==='history'); histBtn.classList.toggle('text-primary', view==='history'); histBtn.classList.toggle('shadow-sm', view==='history');
  if (view === 'history') renderReportHistory();
}
async function renderReportHistory() {
  await Promise.all([loadReports(), loadWorkOrders()]);
  const box = document.getElementById('view-report-history');
  box.innerHTML = reports.map(r => {
    const cust = customers.find(c => c.id === r.customer);
    const linkedWo = r.work_order ? workOrders.find(w => w.id === r.work_order) : null;
    const notesPreview = (r.notes || '').split('\n').filter(Boolean).slice(0,2).join(' · ');
    return `
    <div class="bg-surface rounded-xl p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-body-md font-semibold text-on-surface">${cust ? cust.customer_name : 'Unknown customer'}</h3>
        <span class="text-label-md text-on-surface-variant">${(r.work_date||'').slice(0,10)}</span>
      </div>
      <p class="text-body-md text-on-surface-variant mb-2">${notesPreview || '(no notes)'}</p>
      ${linkedWo
        ? `<div class="inline-flex items-center gap-1 text-label-md text-primary bg-primary/5 px-2 py-1 rounded-full"><span class="material-symbols-outlined text-[16px]">receipt_long</span>Linked to invoice — $${Number(linkedWo.total_amount).toFixed(2)}</div>`
        : `<div class="inline-flex items-center gap-1 text-label-md text-on-surface-variant"><span class="material-symbols-outlined text-[16px]">link_off</span>Standalone report</div>`}
    </div>`;
  }).join('') || '<p class="text-on-surface-variant text-body-md text-center py-8">No job reports yet.</p>';
}
function onReportCustomerChange() {
  const custId = document.getElementById('report-customer-select').value;
  const sel = document.getElementById('report-invoice-select');
  const relevant = workOrders.filter(w => w.customer === custId);
  sel.innerHTML = '<option value="">None (standalone report)</option>' +
    relevant.map(w => `<option value="${w.id}">$${Number(w.total_amount).toFixed(2)} — ${(w.work_date||'').slice(0,10)}</option>`).join('');
  sel.onchange = onReportInvoiceChange;
  onReportInvoiceChange();
}
function onReportInvoiceChange() {
  const woId = document.getElementById('report-invoice-select').value;
  // Always show editable asset fields; pre-populate from invoice if available
  renderAssetFieldsSection(); // ensures report-asset-fields-list is populated
  if (!woId) return;
  const wo = workOrders.find(w => w.id === woId);
  const assetDetails = (wo && wo.asset_details) ? wo.asset_details : {};
  ASSET_SCHEMA.forEach((f, i) => {
    const el = document.getElementById(`af-rep-${i}`);
    if (el && assetDetails[f.label]) el.value = assetDetails[f.label];
  });
}
async function submitReport() {
  const customerId = document.getElementById('report-customer-select').value;
  if (!customerId) { alert('Select a customer first'); return; }
  const linkedInvoice = document.getElementById('report-invoice-select').value;
  const startT = document.getElementById('report-start-time').value;
  const endT = document.getElementById('report-end-time').value;
  const durationEl = document.getElementById('work-duration');
  const durationStr = (!durationEl.classList.contains('hidden')) ? durationEl.textContent.replace('Duration: ','') : '';

  // For premium: upload group photos to R2
  const groupsForSave = await Promise.all(reportGroups.map(async (g, i) => {
    const out = {title: g.title, beforeCaption: g.beforeCaption, afterCaption: g.afterCaption, beforeUrl: '', afterUrl: ''};
    if (isPro()) {
      const uploadFile = async (file, kind) => {
        if (!file) return '';
        const filename = file.name || 'photo.jpg';
        const presignRes = await authedFetch(`/api/r2-presign?kind=${kind}&work_order_id=${linkedInvoice || 'standalone'}&filename=${encodeURIComponent(filename)}`);
        if (!presignRes.presigned_url) return '';
        await fetch(presignRes.presigned_url, {method:'PUT', headers:{'Content-Type': file.type||'image/jpeg'}, body: file});
        return presignRes.public_url || '';
      };
      out.beforeUrl = await uploadFile(g.beforeFile, `group${i}_before`);
      out.afterUrl  = await uploadFile(g.afterFile,  `group${i}_after`);
    }
    return out;
  }));

  const fields = {
    company: COMPANY.id, customer: customerId,
    work_date: new Date().toISOString().slice(0,10) + ' 00:00:00',
    report_groups: JSON.stringify(groupsForSave),
    objective: document.getElementById('report-objective').value,
    findings: document.getElementById('report-findings').value,
    materials_used: document.getElementById('report-materials').value,
    recommendations: document.getElementById('report-recommendations').value,
    summary: document.getElementById('report-summary').value,
    signature: document.getElementById('report-signature').value,
    work_start: startT, work_end: endT,
    notes: [document.getElementById('report-objective').value, document.getElementById('report-summary').value].filter(Boolean).join('\n\n'),
  };
  if (linkedInvoice) fields.work_order = linkedInvoice;

  const data = await authedFetch('/api/collections/reports/records', {method:'POST', body: JSON.stringify(fields)});
  if (data.id) {
    document.getElementById('report-result').innerText = 'Report saved.';
    // Notify EWNexus if gallery groups are selected and company has gallery service
    const galleryGroups = reportGroups.filter(g => g.inGallery);
    if (COMPANY.gallery_enabled && galleryGroups.length > 0) {
      const cust = customers.find(c => c.id === customerId);
      const msg = `📸 Gallery Update Ready\n\n` +
        `Company: ${COMPANY.company_name}\n` +
        `Website: ${COMPANY.website_url || '(not set)'}\n` +
        `Groups for gallery: ${galleryGroups.length}\n` +
        `Titles: ${galleryGroups.map(g => g.title || '(untitled)').join(', ')}\n\n` +
        `→ Log in to admin to review and update their website gallery.`;
      await authedFetch('/api/notify-gallery', {method:'POST', body: JSON.stringify({message: msg, report_id: data.id})}).catch(()=>{});
      document.getElementById('report-result').innerText = 'Report saved. Gallery update request sent to EWNexus ✓';
    }
    loadReportScreen();
    await loadReports();
  } else {
    document.getElementById('report-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}
function generateReportPDF() {
  const custId = document.getElementById('report-customer-select').value;
  const cust = customers.find(c => c.id === custId);
  const woId = document.getElementById('report-invoice-select').value;
  const wo = woId ? workOrders.find(w => w.id === woId) : null;
  const startT = document.getElementById('report-start-time').value;
  const endT = document.getElementById('report-end-time').value;
  const durationEl = document.getElementById('work-duration');
  const durationStr = (!durationEl.classList.contains('hidden')) ? ' (' + durationEl.textContent.replace('Duration: ','') + ')' : '';
  const logoUrl = COMPANY.logo ? `${PB}/api/files/${COMPANY.collectionId}/${COMPANY.id}/${COMPANY.logo}` : '';
  const today = new Date().toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'});

  // Asset details (from invoice or from form)
  let assetHtml = '';
  if (wo && wo.asset_details && Object.keys(wo.asset_details).length) {
    assetHtml = Object.entries(wo.asset_details).map(([k,v]) => {
      const schema = ASSET_SCHEMA.find(f => f.label === k);
      return schema && schema.level === 'detail'
        ? `<div style="padding-left:16px;border-left:3px solid #c3c6d7;font-size:12px;color:#737686;margin-top:4px"><b>${k}:</b> ${v}</div>`
        : `<div style="font-size:13px;margin-top:4px"><b>${k}:</b> ${v}</div>`;
    }).join('');
  }

  // Groups HTML
  const groupsHtml = reportGroups.map((g, i) => `
    <div style="page-break-inside:avoid;margin-bottom:24px;border:1px solid #c3c6d7;border-radius:10px;overflow:hidden;">
      <div style="background:#004ac6;color:white;padding:8px 16px;font-weight:700;font-size:14px;">
        Group ${i+1}${g.title ? ' — ' + g.title : ''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">
        <div style="padding:12px;border-right:1px solid #e5eeff;">
          <div style="font-size:11px;font-weight:700;color:#ba1a1a;margin-bottom:8px;text-transform:uppercase;">▼ Before</div>
          ${g.beforeDataUrl ? `<img src="${g.beforeDataUrl}" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;margin-bottom:8px;">` : '<div style="height:120px;background:#f5f5f5;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:12px;">No photo</div>'}
          ${g.beforeCaption ? `<div style="font-size:11px;color:#434655;line-height:1.4;">${g.beforeCaption}</div>` : ''}
        </div>
        <div style="padding:12px;">
          <div style="font-size:11px;font-weight:700;color:#1a7f4b;margin-bottom:8px;text-transform:uppercase;">✓ After</div>
          ${g.afterDataUrl ? `<img src="${g.afterDataUrl}" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;margin-bottom:8px;">` : '<div style="height:120px;background:#f5f5f5;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:12px;">No photo</div>'}
          ${g.afterCaption ? `<div style="font-size:11px;color:#434655;line-height:1.4;">${g.afterCaption}</div>` : ''}
        </div>
      </div>
    </div>`).join('');

  const objectiveVal = document.getElementById('report-objective').value;
  const findingsVal = document.getElementById('report-findings').value;
  const materialsVal = document.getElementById('report-materials').value;
  const recsVal = document.getElementById('report-recommendations').value;
  const summaryVal = document.getElementById('report-summary').value;
  const signatureVal = document.getElementById('report-signature').value;
  const assetFreeform = document.getElementById('report-asset-freeform').value;

  const printHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Job Report — ${COMPANY.company_name||''}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: Arial, sans-serif; color: #0b1c30; font-size: 13px; margin:0; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
  </head><body>
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #004ac6;padding-bottom:12px;margin-bottom:16px;">
    <div style="display:flex;align-items:center;gap:12px;">
      ${logoUrl ? `<img src="${logoUrl}" style="width:50px;height:50px;object-fit:contain;">` : getDefaultLogoHtml(true)}
      <div><div style="font-size:18px;font-weight:700;">${COMPANY.company_name||'Company'}</div></div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:20px;font-weight:700;color:#004ac6;">JOB REPORT</div>
      <div style="font-size:12px;color:#434655;">${today}</div>
    </div>
  </div>
  <!-- Customer + Work Time -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
    <div style="background:#f0f4ff;border-radius:8px;padding:12px;">
      <div style="font-size:10px;text-transform:uppercase;color:#434655;margin-bottom:4px;">Customer</div>
      <div style="font-weight:600;">${cust ? cust.customer_name : ''}</div>
      ${cust && cust.phone ? `<div style="font-size:12px;">${cust.phone}</div>` : ''}
      ${cust && cust.address ? `<div style="font-size:12px;">${cust.address}</div>` : ''}
    </div>
    <div style="background:#f0f4ff;border-radius:8px;padding:12px;">
      <div style="font-size:10px;text-transform:uppercase;color:#434655;margin-bottom:4px;">Work Time</div>
      ${startT && endT ? `<div style="font-weight:600;">${startT} – ${endT}${durationStr}</div>` : '<div style="color:#aaa;">Not recorded</div>'}
      ${wo ? `<div style="font-size:12px;margin-top:4px;">Invoice: $${Number(wo.total_amount).toFixed(2)} — ${(wo.work_date||'').slice(0,10)}</div>` : ''}
    </div>
  </div>
  ${(assetHtml || assetFreeform) ? `<div style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:12px;margin-bottom:12px;"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#434655;margin-bottom:6px;">③ Service Target</div>${assetHtml}${assetFreeform ? `<div style="font-size:12px;margin-top:6px;color:#434655;">${assetFreeform}</div>` : ''}</div>` : ''}
  ${objectiveVal ? `<div style="border-left:4px solid #004ac6;background:#f0f4ff;border-radius:0 8px 8px 0;padding:12px;margin-bottom:12px;"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#004ac6;margin-bottom:4px;">④ Objective / Scope of Work</div><div style="font-size:13px;white-space:pre-wrap;">${objectiveVal}</div></div>` : ''}
  ${findingsVal ? `<div style="border:1px solid #c3c6d7;border-radius:8px;padding:12px;margin-bottom:12px;"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#434655;margin-bottom:4px;">⑤ Findings</div><div style="font-size:13px;white-space:pre-wrap;">${findingsVal}</div></div>` : ''}
  <!-- ⑥ Work Groups -->
  ${groupsHtml}
  ${materialsVal ? `<div style="border:1px solid #c3c6d7;border-radius:8px;padding:12px;margin-bottom:12px;"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#434655;margin-bottom:4px;">⑦ Materials Used</div><div style="font-size:13px;white-space:pre-wrap;">${materialsVal}</div></div>` : ''}
  ${recsVal ? `<div style="border-left:4px solid #1a7f4b;background:#f0fff4;border-radius:0 8px 8px 0;padding:12px;margin-bottom:12px;"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#1a7f4b;margin-bottom:4px;">⑧ Recommendations</div><div style="font-size:13px;white-space:pre-wrap;">${recsVal}</div></div>` : ''}
  ${summaryVal ? `<div style="border:1px solid #0b1c30;border-radius:8px;padding:12px;margin-bottom:20px;"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#434655;margin-bottom:4px;">⑨ Summary / Conclusion</div><div style="font-size:13px;white-space:pre-wrap;">${summaryVal}</div></div>` : ''}
  <!-- Signature -->
  <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:32px;">
    <div><div style="font-size:11px;color:#737686;margin-bottom:4px;">Technician</div>
      <div style="border-bottom:1px solid #0b1c30;height:32px;"></div>
      <div style="font-size:11px;color:#737686;margin-top:4px;">${COMPANY.company_name||''}</div></div>
    <div><div style="font-size:11px;color:#737686;margin-bottom:4px;">Customer Signature / Confirmation</div>
      <div style="border-bottom:1px solid #0b1c30;height:32px;padding-top:8px;font-size:13px;">${signatureVal||''}</div>
      <div style="font-size:11px;color:#737686;margin-top:4px;">${cust ? cust.customer_name : ''}</div></div>
  </div>
  <script>window.onload=function(){window.print();}<\/script>
  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(printHtml);
  win.document.close();
}

// ---------- history (list + calendar) ----------
async function loadHistory() {
  await Promise.all([loadWorkOrders(), loadReports()]);
  populateHistoryCustomerFilter();
  renderHistoryList();
  if (!document.getElementById('view-hist-cal').classList.contains('hidden')) renderCalendar();
}
function switchHistoryView(view) {
  document.getElementById('view-hist-list').classList.toggle('hidden', view !== 'list');
  document.getElementById('view-hist-cal').classList.toggle('hidden', view !== 'calendar');
  const listBtn = document.getElementById('btn-hist-list'), calBtn = document.getElementById('btn-hist-cal');
  listBtn.classList.toggle('bg-surface', view==='list'); listBtn.classList.toggle('text-primary', view==='list'); listBtn.classList.toggle('shadow-sm', view==='list');
  calBtn.classList.toggle('bg-surface', view==='calendar'); calBtn.classList.toggle('text-primary', view==='calendar'); calBtn.classList.toggle('shadow-sm', view==='calendar');
  if (view === 'calendar') renderCalendar();
}
function statusPill(status) {
  if (status === 'void') return `<div class="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant text-label-md inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">block</span>Void</div>`;
  if (status === 'unpaid') return `<div class="px-3 py-1 rounded-full bg-error-container text-error text-label-md inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">pending</span>Unpaid</div>`;
  if (status === 'estimate') return `<div class="px-3 py-1 rounded-full bg-primary/10 text-primary text-label-md inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">request_quote</span>Estimate</div>`;
  return `<div class="px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-label-md inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">check_circle</span>Paid</div>`;
}
function populateHistoryCustomerFilter() {
  const sel = document.getElementById('hist-filter-customer');
  const current = sel.value;
  sel.innerHTML = '<option value="">All customers</option>' +
    customers.map(c => `<option value="${c.id}">${c.customer_name}</option>`).join('');
  sel.value = current;
}
function clearHistoryFilters() {
  document.getElementById('hist-filter-customer').value = '';
  document.getElementById('hist-filter-status').value = '';
  document.getElementById('hist-filter-from').value = '';
  document.getElementById('hist-filter-to').value = '';
  renderHistoryList();
}
function renderHistoryList() {
  const box = document.getElementById('view-hist-list-cards');
  const custFilter = document.getElementById('hist-filter-customer').value;
  const statusFilter = document.getElementById('hist-filter-status').value;
  const fromFilter = document.getElementById('hist-filter-from').value;
  const toFilter = document.getElementById('hist-filter-to').value;
  let filtered = [...workOrders];
  if (custFilter) filtered = filtered.filter(w => w.customer === custFilter);
  if (statusFilter === 'paid') filtered = filtered.filter(w => ['cash','zelle','card'].includes(w.payment_status));
  else if (statusFilter) filtered = filtered.filter(w => w.payment_status === statusFilter);
  if (fromFilter) filtered = filtered.filter(w => (w.work_date||'').slice(0,10) >= fromFilter);
  if (toFilter) filtered = filtered.filter(w => (w.work_date||'').slice(0,10) <= toFilter);
  const sorted = filtered.sort((a,b) => (b.work_date||'').localeCompare(a.work_date||''));
  box.innerHTML = sorted.map(w => {
    const cust = customers.find(c => c.id === w.customer);
    const voidClass = w.payment_status === 'void' ? 'opacity-60' : '';
    const linkedReport = reports.find(r => r.work_order === w.id);
    return `
    <article class="bg-surface rounded-xl p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant ${voidClass}">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-headline-md text-on-surface ${w.payment_status==='void'?'line-through':''}">${cust ? cust.customer_name : 'Unknown customer'}</h2>
        <span class="text-label-md text-on-surface-variant">${(w.work_date||'').slice(0,10) || '—'}</span>
      </div>
      <div class="flex justify-between items-end border-t border-surface-variant pt-4">
        <div class="text-numeric-xl text-on-surface ${w.payment_status==='void'?'line-through':''}">$${Number(w.total_amount).toFixed(2)}</div>
        <div class="flex items-center gap-2">
          ${linkedReport ? `<span class="material-symbols-outlined text-[18px] text-primary" title="Has linked job report">assignment_turned_in</span>` : ''}
          ${statusPill(w.payment_status)}
        </div>
      </div>
    </article>`;
  }).join('') || '<p class="text-on-surface-variant text-body-md text-center py-8">No invoices match these filters.</p>';
}

// ---------- appointments / calendar ----------
async function loadAppointments() {
  const data = await authedFetch('/api/collections/appointments/records?perPage=500');
  appointments = data.items || [];
}
function calShiftMonth(delta) { calMonthOffset += delta; renderCalendar(); }
function renderCalendar() {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
  const year = base.getFullYear(), month = base.getMonth();
  document.getElementById('cal-month-label').innerText = base.toLocaleDateString('en-US', {month:'long', year:'numeric'});
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const byDay = {};
  appointments.forEach(a => {
    if (!a.scheduled_at) return;
    const d = new Date(a.scheduled_at);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      byDay[day] = byDay[day] || [];
      byDay[day].push(a);
    }
  });

  let html = '';
  for (let i = 0; i < firstDay; i++) html += `<div></div>`;
  const todayStr = new Date().toDateString();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = new Date(year, month, day).toDateString() === todayStr;
    const dayAppts = byDay[day] || [];
    const dot = dayAppts.length ? `<span class="w-1.5 h-1.5 bg-primary rounded-full"></span>` : '';
    html += `<div class="py-2 text-body-md relative cursor-pointer ${isToday ? 'bg-primary-container text-on-primary-container rounded-lg font-bold' : 'text-on-surface'}" onclick="showCalDayDetail(${year}, ${month}, ${day})">
      ${day}
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">${dot}</div>
    </div>`;
  }
  document.getElementById('cal-grid').innerHTML = html;
  document.getElementById('cal-day-detail').innerHTML = '';
}
function showCalDayDetail(year, month, day) {
  const dayAppts = appointments.filter(a => {
    if (!a.scheduled_at) return false;
    const d = new Date(a.scheduled_at);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  }).sort((a,b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const box = document.getElementById('cal-day-detail');
  if (!dayAppts.length) { box.innerHTML = '<p class="text-on-surface-variant text-body-md text-center py-4">No appointments this day.</p>'; return; }
  box.innerHTML = dayAppts.map(a => {
    const cust = customers.find(c => c.id === a.customer);
    const time = new Date(a.scheduled_at).toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
    const addr = a.address || (cust ? cust.address : '');
    return `
    <div class="bg-surface rounded-xl p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant">
      <div class="flex justify-between items-start mb-1">
        <h3 class="text-body-md font-semibold text-on-surface">${cust ? cust.customer_name : 'Unknown customer'}</h3>
        <span class="text-label-md text-primary font-semibold">${time}</span>
      </div>
      <p class="text-body-md text-on-surface-variant">${a.summary || ''}</p>
      ${addr ? `<p class="text-label-md text-on-surface-variant mt-1 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">location_on</span>${addr}</p>` : ''}
    </div>`;
  }).join('');
}
function openAppointmentSheet() {
  const sel = document.getElementById('appt-customer');
  sel.innerHTML = customers.map(c => `<option value="${c.id}">${c.customer_name}</option>`).join('');
  document.getElementById('appt-datetime').value = '';
  document.getElementById('appt-summary').value = '';
  document.getElementById('appt-address').value = '';
  document.getElementById('appt-result').innerText = '';
  document.getElementById('sheet-backdrop').classList.remove('hidden');
  document.getElementById('sheet-appointment').classList.remove('hidden');
}
async function createAppointment() {
  const datetimeVal = document.getElementById('appt-datetime').value;
  if (!datetimeVal) { alert('Pick a date and time'); return; }
  const body = {
    company: COMPANY.id,
    customer: document.getElementById('appt-customer').value,
    scheduled_at: datetimeVal.replace('T', ' ') + ':00',
    summary: document.getElementById('appt-summary').value,
    address: document.getElementById('appt-address').value
  };
  const data = await authedFetch('/api/collections/appointments/records', {method:'POST', body: JSON.stringify(body)});
  if (data.id) {
    await loadAppointments();
    closeSheets();
    renderCalendar();
  } else {
    document.getElementById('appt-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}

// ---------- customers (CRM) ----------
function renderCustomersScreen() {
  const q = (document.getElementById('crm-search').value || '').toLowerCase();
  const box = document.getElementById('crm-list');
  const filtered = customers.filter(c => !q || (c.customer_name||'').toLowerCase().includes(q) || (c.phone||'').includes(q));
  box.innerHTML = filtered.map(c => {
    const jobs = workOrders.filter(w => w.customer === c.id);
    const initials = (c.customer_name||'??').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const unpaid = jobs.filter(w => w.payment_status === 'unpaid').reduce((s,w)=>s+Number(w.total_amount),0);
    const last = jobs.sort((a,b)=>(b.work_date||'').localeCompare(a.work_date||''))[0];
    return `
    <div class="bg-surface rounded-xl p-5 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/30 cursor-pointer" onclick="openDetailPanel('${c.id}')">
      <div class="flex justify-between items-start mb-2">
        <div><h2 class="text-headline-md text-on-surface">${c.customer_name}</h2><p class="text-body-md text-on-surface-variant mt-1">${c.phone||c.email||''}</p></div>
        <div class="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full text-primary font-bold">${initials}</div>
      </div>
      <div class="pt-3 border-t border-outline-variant flex justify-between items-center text-label-md">
        <div class="text-secondary flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">history</span>${jobs.length} past job${jobs.length===1?'':'s'}</div>
        ${unpaid > 0 ? `<div class="text-error flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">warning</span>Unpaid: $${unpaid.toFixed(2)}</div>` : (last ? `<div>Last: <b>$${Number(last.total_amount).toFixed(2)}</b></div>` : '')}
      </div>
    </div>`;
  }).join('') || '<p class="text-on-surface-variant text-body-md">No customers yet.</p>';
}
let detailCustomerId = null;
function openDetailPanel(id) {
  detailCustomerId = id;
  const c = customers.find(x => x.id === id);
  const jobs = workOrders.filter(w => w.customer === id);
  const revenue = jobs.filter(w => !['void','estimate'].includes(w.payment_status)).reduce((s,w)=>s+Number(w.total_amount),0);
  const balance = jobs.filter(w => w.payment_status === 'unpaid').reduce((s,w)=>s+Number(w.total_amount),0);
  document.getElementById('detailName').innerText = c.customer_name;
  document.getElementById('detailContact').innerHTML = `
    ${c.phone ? `<div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary">phone</span>${c.phone}</div>` : ''}
    ${c.email ? `<div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary">mail</span>${c.email}</div>` : ''}
    ${c.address ? `<div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary">location_on</span>${c.address}</div>` : ''}
  `;
  document.getElementById('detailRevenue').innerText = '$' + revenue.toFixed(2);
  document.getElementById('detailBalance').innerText = '$' + balance.toFixed(2);
  document.getElementById('customerDetailPanel').classList.remove('hidden');
}
function closeDetailPanel() { document.getElementById('customerDetailPanel').classList.add('hidden'); }
function newInvoiceForDetailCustomer() {
  closeDetailPanel();
  switchScreen('invoice');
  document.getElementById('customer-select').value = detailCustomerId;
}

// ---------- finances ----------
async function loadFinances() {
  const data = await authedFetch('/api/collections/expenses/records?perPage=500&sort=-expense_date');
  expenses = data.items || [];
  await loadWorkOrders();
  const income = workOrders.filter(w => ['cash','zelle','card'].includes(w.payment_status)).reduce((s,w)=>s+Number(w.total_amount),0);
  const totalExpenses = expenses.reduce((s,e)=>s+Number(e.amount),0);
  const net = income - totalExpenses;
  document.getElementById('fin-net').innerText = '$' + net.toFixed(2);
  document.getElementById('fin-income').innerText = '+$' + income.toFixed(2);
  document.getElementById('fin-expenses').innerText = '-$' + totalExpenses.toFixed(2);
  const taxCollected = workOrders.filter(w => !['void','estimate'].includes(w.payment_status)).reduce((s,w)=>s+Number(w.tax_amount||0),0);
  document.getElementById('fin-tax').innerText = '$' + taxCollected.toFixed(2);

  const byCat = {};
  expenses.forEach(e => { byCat[e.category] = byCat[e.category] || {sum:0,count:0}; byCat[e.category].sum += Number(e.amount); byCat[e.category].count++; });
  const iconMap = {Materials:'handyman', 'Fuel/Vehicle':'local_gas_station', Tools:'build', Other:'more_horiz'};
  document.getElementById('fin-breakdown').innerHTML = Object.entries(byCat).map(([cat,v]) => `
    <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center justify-between shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary"><span class="material-symbols-outlined">${iconMap[cat]||'category'}</span></div>
        <div><p class="text-body-md text-on-surface font-semibold">${cat}</p><p class="text-label-md text-on-surface-variant">${v.count} item${v.count===1?'':'s'}</p></div>
      </div>
      <span class="text-body-md text-on-surface font-semibold">$${v.sum.toFixed(2)}</span>
    </div>`).join('') || '<p class="text-on-surface-variant text-body-md">No expenses logged yet.</p>';
}
function exportFinancesCSV() {
  const rows = [['Date','Type','Description','Customer/Vendor','Amount','Tax Collected']];
  workOrders.filter(w => !['void','estimate'].includes(w.payment_status)).forEach(w => {
    const cust = customers.find(c => c.id === w.customer);
    rows.push([(w.work_date||'').slice(0,10), 'Income', w.payment_status, cust ? cust.customer_name : '', Number(w.total_amount).toFixed(2), Number(w.tax_amount||0).toFixed(2)]);
  });
  expenses.forEach(e => {
    rows.push([(e.expense_date||'').slice(0,10), 'Expense', e.category, e.vendor || '', '-' + Number(e.amount).toFixed(2), '']);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finances_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function openExpenseSheet() { document.getElementById('expense-sheet-backdrop').classList.remove('hidden'); document.getElementById('expense-sheet').classList.remove('hidden'); }
function closeExpenseSheet() { document.getElementById('expense-sheet-backdrop').classList.add('hidden'); document.getElementById('expense-sheet').classList.add('hidden'); }
async function createExpense() {
  const file = document.getElementById('exp-receipt').files[0];
  const fields = {
    company: COMPANY.id,
    expense_date: new Date().toISOString().slice(0,10) + ' 00:00:00',
    category: document.getElementById('exp-category').value,
    vendor: document.getElementById('exp-vendor').value,
    amount: parseFloat(document.getElementById('exp-amount').value) || 0,
    notes: ''
  };
  let data;
  if (file) {
    const form = new FormData();
    Object.entries(fields).forEach(([k,v]) => form.append(k, v));
    form.append('receipt_photo', file);
    const res = await fetch(`${PB}/api/collections/expenses/records`, {method:'POST', headers:{'Authorization':TOKEN}, body: form});
    data = await res.json();
  } else {
    data = await authedFetch('/api/collections/expenses/records', {method:'POST', body: JSON.stringify(fields)});
  }
  if (data.id) {
    document.getElementById('exp-result').innerText = 'Saved.';
    ['exp-vendor','exp-amount'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('exp-receipt').value = '';
    await loadFinances();
    setTimeout(closeExpenseSheet, 600);
  } else {
    document.getElementById('exp-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}

// ---------- recurring invoices ----------
async function loadRecurringInvoices() {
  const data = await authedFetch('/api/collections/recurring_invoices/records?perPage=200&sort=-next_run_date');
  recurringInvoices = data.items || [];
  const box = document.getElementById('settings-recurring-list');
  box.innerHTML = recurringInvoices.map(r => {
    const cust = customers.find(c => c.id === r.customer);
    return `
    <div class="p-3 rounded-lg border border-outline-variant bg-surface">
      <div class="flex items-center justify-between mb-2">
        <div><span class="text-body-md font-semibold">${cust ? cust.customer_name : '?'}</span> <span class="text-on-surface-variant">— ${r.frequency}, $${Number(r.total_amount).toFixed(2)}</span></div>
        <button onclick="deleteRecurring('${r.id}')" class="text-error"><span class="material-symbols-outlined text-[20px]">delete</span></button>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <label class="text-label-md text-on-surface-variant">Next date:</label>
        <input type="date" id="rec-date-${r.id}" value="${(r.next_run_date||'').slice(0,10)}" class="py-1 px-2 border border-outline-variant rounded text-body-md">
        <button onclick="generateNextRecurring('${r.id}')" class="ml-auto px-3 py-2 bg-primary text-on-primary rounded-lg text-label-md">Generate next</button>
      </div>
    </div>`;
  }).join('') || '<p class="text-on-surface-variant text-body-md">No recurring invoices yet.</p>';
}
async function deleteRecurring(id) {
  if (!confirm('Delete this recurring invoice?')) return;
  await authedFetch(`/api/collections/recurring_invoices/records/${id}`, {method:'DELETE'});
  await loadRecurringInvoices();
}
function renderRecurringItemPicker() {
  const sel = document.getElementById('rec-customer');
  sel.innerHTML = customers.map(c => `<option value="${c.id}">${c.customer_name}</option>`).join('');
  const box = document.getElementById('rec-items-list');
  box.innerHTML = serviceItems.map(si => `
    <label class="flex items-center gap-2 p-2 border border-outline-variant rounded-lg">
      <input type="checkbox" class="reci-check" value="${si.id}" data-price="${si.default_price}" data-name="${si.item_name}" onchange="recalcRecTotal()"> ${si.item_name} ($${Number(si.default_price).toFixed(2)})
    </label>`).join('') || '<p class="text-on-surface-variant text-body-md">Add service items first.</p>';
  document.getElementById('rec-start-date').value = new Date().toISOString().slice(0,10);
  recalcRecTotal();
}
function recalcRecTotal() {
  let total = 0;
  document.querySelectorAll('.reci-check:checked').forEach(c => total += parseFloat(c.dataset.price));
  document.getElementById('rec-total').innerText = total.toFixed(2);
}
async function createRecurring() {
  const items = [];
  let total = 0;
  document.querySelectorAll('.reci-check:checked').forEach(c => { items.push({name: c.dataset.name, price: parseFloat(c.dataset.price)}); total += parseFloat(c.dataset.price); });
  const startDate = document.getElementById('rec-start-date').value;
  const body = {
    company: COMPANY.id,
    customer: document.getElementById('rec-customer').value,
    line_items: items,
    total_amount: total,
    frequency: document.getElementById('rec-frequency').value,
    next_run_date: startDate + ' 00:00:00',
    start_date: startDate + ' 00:00:00',
    periods_elapsed: 0,
    active: true
  };
  const data = await authedFetch('/api/collections/recurring_invoices/records', {method:'POST', body: JSON.stringify(body)});
  if (data.id) {
    await loadRecurringInvoices();
    closeSheets();
    document.getElementById('rec-result').innerText = '';
  } else {
    document.getElementById('rec-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}

// anchor-date recurring logic (JS port of generate_next_invoice.py — see pocketbase/generate_next_invoice.py)
function addMonthsJS(dateStr, months) {
  const [y,m,d] = dateStr.split('-').map(Number);
  const total = (m - 1) + months;
  const year = y + Math.floor(total/12);
  const month = ((total % 12) + 12) % 12 + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.min(d, daysInMonth);
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
const FREQ_MONTHS = {monthly:1, quarterly:3, yearly:12};
const FREQ_DAYS = {weekly:7, biweekly:14};
function computeNextDateJS(startDateStr, frequency, periodsElapsed) {
  if (FREQ_MONTHS[frequency]) return addMonthsJS(startDateStr, FREQ_MONTHS[frequency]*periodsElapsed);
  const days = FREQ_DAYS[frequency] || 7;
  const base = new Date(startDateStr + 'T00:00:00Z');
  base.setUTCDate(base.getUTCDate() + days*periodsElapsed);
  return base.toISOString().slice(0,10);
}
async function generateNextRecurring(id) {
  const rec = await authedFetch(`/api/collections/recurring_invoices/records/${id}`);
  if (!rec.id) { alert('Not found'); return; }
  const overrideEl = document.getElementById(`rec-date-${id}`);
  const workDate = (overrideEl && overrideEl.value) ? overrideEl.value : rec.next_run_date.slice(0,10);
  const woBody = {
    company: rec.company, customer: rec.customer, line_items: rec.line_items,
    subtotal: rec.total_amount, total_amount: rec.total_amount,
    payment_status: 'unpaid', work_date: workDate + ' 00:00:00'
  };
  const wo = await authedFetch('/api/collections/work_orders/records', {method:'POST', body: JSON.stringify(woBody)});
  if (!wo.id) { alert('Failed to create invoice: ' + JSON.stringify(wo)); return; }
  const startDateStr = (rec.start_date || rec.next_run_date).slice(0,10);
  const periodsElapsed = (rec.periods_elapsed || 0) + 1;
  const newNext = computeNextDateJS(startDateStr, rec.frequency, periodsElapsed);
  const updateBody = { next_run_date: newNext + ' 00:00:00', periods_elapsed: periodsElapsed };
  if (!rec.start_date) updateBody.start_date = startDateStr + ' 00:00:00';
  await authedFetch(`/api/collections/recurring_invoices/records/${id}`, {method:'PATCH', body: JSON.stringify(updateBody)});
  const sendResult = await authedFetch(`/api/send-invoice/${wo.id}`, {method:'POST'});
  alert(`Generated invoice $${wo.total_amount} dated ${workDate}. Next suggested date: ${newNext}. ${describeSendResult(sendResult)}`);
  await Promise.all([loadRecurringInvoices(), loadWorkOrders()]);
}

// ---------- settings ----------
async function saveSettings() {
  const body = {
    company_name: document.getElementById('settings-company-name').value,
    sales_tax_rate: parseFloat(document.getElementById('settings-tax-rate').value) || 0,
    terms_of_service: document.getElementById('settings-tos').value,
    payment_link: document.getElementById('settings-payment-link').value.trim(),
    custom_asset_schema: JSON.stringify(ASSET_SCHEMA)
  };
  const data = await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', body: JSON.stringify(body)});
  if (data.id) {
    COMPANY = data;
    document.getElementById('brand-name').innerText = COMPANY.company_name;
    document.getElementById('settings-result').innerText = 'Saved.';
    setTimeout(() => switchScreen('invoice'), 1000);
  } else {
    document.getElementById('settings-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}

async function uploadLogo() {
  const file = document.getElementById('logo-input').files[0];
  if (!file) return;
  const form = new FormData();
  form.append('logo', file);
  const res = await fetch(`${PB}/api/collections/companies/records/${COMPANY.id}`, {
    method: 'PATCH', headers: {'Authorization': TOKEN}, body: form
  });
  const data = await res.json();
  if (data.id) { COMPANY = data; document.getElementById('settings-result').innerText = 'Logo uploaded.'; }
  else { document.getElementById('settings-result').innerText = 'ERROR: ' + JSON.stringify(data); }
}

// ---------- fonts ----------
const FONTS_BASE = [
  { key: 'inter',   label: 'Inter',    sample: 'Modern Clean',   style: 'font-family:Inter,sans-serif' },
  { key: 'poppins', label: 'Poppins',  sample: 'Friendly Round', style: "font-family:'Poppins',sans-serif" },
  { key: 'oswald',  label: 'Oswald',   sample: 'Bold Strong',    style: "font-family:'Oswald',sans-serif" },
];
const FONTS_PRO = [
  { key: 'georgia',  label: 'Georgia',          sample: 'Classic Formal',  style: "font-family:Georgia,'Times New Roman',serif" },
  { key: 'roboto-mono', label: 'Roboto Mono',   sample: 'Technical',       style: "font-family:'Roboto Mono',monospace" },
  { key: 'playfair', label: 'Playfair Display', sample: 'Elegant Premium', style: "font-family:'Playfair Display',serif" },
];
const ALL_FONTS = [...FONTS_BASE, ...FONTS_PRO];
let SELECTED_FONT = 'inter';

function getFontStyle(key) {
  return (ALL_FONTS.find(f => f.key === key) || ALL_FONTS[0]).style;
}

function renderFontPicker() {
  const el = document.getElementById('font-picker');
  if (!el) return;
  el.innerHTML = ALL_FONTS.map(f => `
    <button onclick="pickFont('${f.key}', this)"
      class="font-btn py-3 px-3 border-2 rounded-lg text-left transition-colors ${SELECTED_FONT === f.key ? 'border-primary bg-primary-container/20' : 'border-outline-variant bg-surface'}"
      style="${f.style}">
      <div class="text-body-md font-semibold text-on-surface">${f.label}</div>
      <div class="text-xs text-on-surface-variant">${f.sample}</div>
    </button>`).join('');
}

function pickFont(key, btn) {
  SELECTED_FONT = key;
  document.querySelectorAll('.font-btn').forEach(b => {
    b.classList.toggle('border-primary', b === btn);
    b.classList.toggle('bg-primary-container/20', b === btn);
    b.classList.toggle('border-outline-variant', b !== btn);
  });
}

// ---------- date format ----------
let SELECTED_DATE_FORMAT = 'MM/DD/YYYY';

function pickDateFormat(fmt, btn) {
  SELECTED_DATE_FORMAT = fmt;
  document.querySelectorAll('.date-fmt-btn').forEach(b => {
    b.classList.toggle('border-primary', b === btn);
    b.classList.toggle('border-outline-variant', b !== btn);
  });
}

function formatInvoiceDate(dateStr, fmt) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00');
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  if (fmt === 'MMM DD YYYY')  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${yyyy}`;
  if (fmt === 'MMMM DD YYYY') return `${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${yyyy}`;
  if (fmt === 'YYYY-MM-DD')   return `${yyyy}-${mm}-${dd}`;
  return `${mm}/${dd}/${yyyy}`;
}

// ---------- invoice color ----------
const DEFAULT_BLOCKS = ['company','client','assets','items','totals','payment','notes','signature'];

function pickColor(hex) {
  document.getElementById('settings-invoice-color').value = hex;
  document.getElementById('color-preview-hex').innerText = hex;
  document.querySelectorAll('.swatch').forEach(s => {
    s.style.borderColor = s.style.background.toLowerCase() === hex.toLowerCase() ? '#000' : 'transparent';
  });
}

function applyInvoiceColor(hex) {
  if (!hex) return;
  const root = document.documentElement;
  root.style.setProperty('--tw-color-primary', hex);
  document.querySelectorAll('[class*="bg-primary"]:not([class*="bg-primary-"])').forEach(el => {
    el.style.backgroundColor = hex;
  });
  document.querySelectorAll('[class*="text-primary"]:not([class*="text-primary-"])').forEach(el => {
    el.style.color = hex;
  });
  document.querySelectorAll('[class*="border-primary"]:not([class*="border-primary-"])').forEach(el => {
    el.style.borderColor = hex;
  });
  document.querySelectorAll('[class*="accent-primary"]').forEach(el => {
    el.style.accentColor = hex;
  });
}

async function saveInvoiceColor() {
  const hex = document.getElementById('settings-invoice-color').value;
  const data = await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', body: JSON.stringify({invoice_color: hex})});
  if (data.id) { COMPANY = data; applyInvoiceColor(hex); document.getElementById('settings-result').innerText = 'Color saved.'; }
  else { document.getElementById('settings-result').innerText = 'ERROR: ' + JSON.stringify(data); }
}

// ---------- payment methods ----------
async function savePaymentMethods() {
  const body = {
    zelle_email: document.getElementById('settings-zelle-email').value.trim(),
    zelle_phone: document.getElementById('settings-zelle-phone').value.trim(),
    ach_bank_name: document.getElementById('settings-ach-bank').value.trim(),
    ach_routing: document.getElementById('settings-ach-routing').value.trim(),
    ach_account: document.getElementById('settings-ach-account').value.trim(),
  };
  const data = await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', body: JSON.stringify(body)});
  if (data.id) {
    COMPANY = data;
    const qrFile = document.getElementById('settings-zelle-qr').files[0];
    if (qrFile) {
      const form = new FormData();
      form.append('zelle_qr', qrFile);
      const res2 = await fetch(`${PB}/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', headers:{'Authorization':TOKEN}, body: form});
      const d2 = await res2.json();
      if (d2.id) COMPANY = d2;
    }
    document.getElementById('payment-settings-result').innerText = 'Saved.';
    loadZelleQrPreview();
  } else {
    document.getElementById('payment-settings-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}

function loadZelleQrPreview() {
  if (COMPANY.zelle_qr) {
    const url = `${PB}/api/files/companies/${COMPANY.id}/${COMPANY.zelle_qr}`;
    document.getElementById('zelle-qr-img').src = url;
    document.getElementById('zelle-qr-preview').classList.remove('hidden');
  }
}

function loadPaymentSettings() {
  document.getElementById('settings-zelle-email').value = COMPANY.zelle_email || '';
  document.getElementById('settings-zelle-phone').value = COMPANY.zelle_phone || '';
  document.getElementById('settings-ach-bank').value = COMPANY.ach_bank_name || '';
  document.getElementById('settings-ach-routing').value = COMPANY.ach_routing || '';
  document.getElementById('settings-ach-account').value = COMPANY.ach_account || '';
  if (COMPANY.invoice_color) {
    pickColor(COMPANY.invoice_color);
    applyInvoiceColor(COMPANY.invoice_color);
  }
  loadZelleQrPreview();
}

// ---------- invoice block order + visibility ----------
let BLOCK_ORDER = [...DEFAULT_BLOCKS];
let HIDDEN_BLOCKS = new Set();
const BLOCK_LABELS = {
  company:   'Your Company Info',
  client:    'Client Info',
  assets:    'Job / Asset Details',
  items:     'Service Items & Line Items',
  totals:    'Subtotal · Tax · Total',
  payment:   'Payment Methods (Zelle / ACH)',
  notes:     'Terms & Notes',
  signature: 'Signature Line',
};
const BLOCK_REQUIRED = new Set(['items','totals']); // cannot be hidden

function renderBlockOrderList() {
  const list = document.getElementById('block-order-list');
  if (!list) return;
  list.innerHTML = BLOCK_ORDER.map((key, idx) => {
    const hidden = HIDDEN_BLOCKS.has(key);
    const required = BLOCK_REQUIRED.has(key);
    return `
    <div class="flex items-center gap-2 p-3 rounded-lg border ${hidden ? 'border-outline-variant/20 bg-surface opacity-50' : 'bg-surface-container border-outline-variant/40'}" data-block="${key}">
      <button onclick="toggleBlock('${key}')" class="flex-shrink-0 w-10 h-6 rounded-full transition-colors ${hidden ? 'bg-outline-variant' : 'bg-primary'} relative ${required ? 'opacity-30 pointer-events-none' : ''}" title="${required ? 'Required' : (hidden ? 'Show' : 'Hide')}">
        <span class="absolute top-0.5 ${hidden ? 'left-0.5' : 'left-[18px]'} w-5 h-5 bg-white rounded-full shadow transition-all"></span>
      </button>
      <span class="flex-1 text-body-md text-on-surface">${BLOCK_LABELS[key] || key}</span>
      <div class="flex gap-1">
        <button onclick="moveBlock(${idx},-1)" class="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant" ${idx===0?'disabled style="opacity:.3"':''}>
          <span class="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
        </button>
        <button onclick="moveBlock(${idx},1)" class="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant" ${idx===BLOCK_ORDER.length-1?'disabled style="opacity:.3"':''}>
          <span class="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
        </button>
      </div>
    </div>`;
  }).join('');
}

function toggleBlock(key) {
  if (BLOCK_REQUIRED.has(key)) return;
  HIDDEN_BLOCKS.has(key) ? HIDDEN_BLOCKS.delete(key) : HIDDEN_BLOCKS.add(key);
  renderBlockOrderList();
}

function moveBlock(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= BLOCK_ORDER.length) return;
  [BLOCK_ORDER[idx], BLOCK_ORDER[newIdx]] = [BLOCK_ORDER[newIdx], BLOCK_ORDER[idx]];
  renderBlockOrderList();
}

async function saveBlockOrder() {
  const body = {
    invoice_block_order:  JSON.stringify(BLOCK_ORDER),
    invoice_hidden_blocks: JSON.stringify([...HIDDEN_BLOCKS]),
  };
  const data = await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', body: JSON.stringify(body)});
  if (data.id) { COMPANY = data; document.getElementById('block-order-result').innerText = 'Layout saved.'; }
  else { document.getElementById('block-order-result').innerText = 'ERROR: ' + JSON.stringify(data); }
}

function loadBlockOrder() {
  try {
    const saved = COMPANY.invoice_block_order ? JSON.parse(COMPANY.invoice_block_order) : null;
    BLOCK_ORDER = (saved && saved.length) ? saved : [...DEFAULT_BLOCKS];
    const hiddenArr = COMPANY.invoice_hidden_blocks ? JSON.parse(COMPANY.invoice_hidden_blocks) : [];
    HIDDEN_BLOCKS = new Set(hiddenArr);
  } catch { BLOCK_ORDER = [...DEFAULT_BLOCKS]; HIDDEN_BLOCKS = new Set(); }
  renderBlockOrderList();
}

// ---------- branding settings (font, format, footer) ----------
async function saveBrandingSettings() {
  // banner image upload first if provided
  const bannerFile = document.getElementById('settings-header-banner')?.files[0];
  if (bannerFile) {
    const form = new FormData();
    form.append('invoice_header_banner', bannerFile);
    const res = await fetch(`${PB}/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', headers:{'Authorization':TOKEN}, body: form});
    const d = await res.json();
    if (d.id) COMPANY = d;
  }
  const body = {
    invoice_font:          SELECTED_FONT,
    invoice_title_label:   document.getElementById('settings-title-label')?.value || 'INVOICE',
    invoice_number_prefix: document.getElementById('settings-num-prefix')?.value.trim() || '',
    invoice_footer_msg:    document.getElementById('settings-footer-msg')?.value.trim() || '',
    invoice_date_format:   SELECTED_DATE_FORMAT,
  };
  const data = await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', body: JSON.stringify(body)});
  if (data.id) {
    COMPANY = data;
    document.getElementById('branding-result').innerText = 'Saved.';
    setTimeout(() => { document.getElementById('branding-result').innerText = ''; }, 2000);
  } else {
    document.getElementById('branding-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}

function loadBrandingSettings() {
  SELECTED_FONT = COMPANY.invoice_font || 'inter';
  SELECTED_DATE_FORMAT = COMPANY.invoice_date_format || 'MM/DD/YYYY';
  renderFontPicker();
  // highlight saved date format button
  document.querySelectorAll('.date-fmt-btn').forEach(btn => {
    const fmt = btn.getAttribute('onclick').match(/'([^']+)'/)?.[1];
    btn.classList.toggle('border-primary', fmt === SELECTED_DATE_FORMAT);
    btn.classList.toggle('border-outline-variant', fmt !== SELECTED_DATE_FORMAT);
  });
  const titleEl = document.getElementById('settings-title-label');
  if (titleEl && COMPANY.invoice_title_label) titleEl.value = COMPANY.invoice_title_label;
  const prefixEl = document.getElementById('settings-num-prefix');
  if (prefixEl) prefixEl.value = COMPANY.invoice_number_prefix || '';
  const footerEl = document.getElementById('settings-footer-msg');
  if (footerEl) footerEl.value = COMPANY.invoice_footer_msg || '';
}

// ---------- i18n translations ----------
const TRANSLATIONS = {
  en: {
    'nav.invoices':'Invoices','nav.jobs':'Jobs','nav.history':'History','nav.clients':'Clients','nav.money':'Money',
    'settings.language':'Language','settings.appLanguage':'App interface language','settings.invoiceLanguage':'Invoice output language',
    'btn.save':'Save','btn.cancel':'Cancel','btn.addItem':'Add new item','btn.addCustomer':'New Customer',
    'screen.invoices':'Invoices','screen.jobs':'Job Reports','screen.history':'History','screen.clients':'Clients',
    'screen.finances':'Finances','screen.settings':'Settings',
    'label.customer':'Customer','label.date':'Date','label.total':'Total','label.status':'Status',
    'status.paid':'Paid','status.unpaid':'Unpaid','status.estimate':'Estimate','status.void':'Void',
    'invoice.saveAndSend':'Save & Send Invoice','invoice.preview':'Preview Invoice',
    'report.save':'Save Report',
  },
  es: {
    'nav.invoices':'Facturas','nav.jobs':'Trabajos','nav.history':'Historial','nav.clients':'Clientes','nav.money':'Dinero',
    'settings.language':'Idioma','settings.appLanguage':'Idioma de la aplicación','settings.invoiceLanguage':'Idioma de la factura',
    'btn.save':'Guardar','btn.cancel':'Cancelar','btn.addItem':'Agregar artículo','btn.addCustomer':'Nuevo Cliente',
    'screen.invoices':'Facturas','screen.jobs':'Reportes de Trabajo','screen.history':'Historial','screen.clients':'Clientes',
    'screen.finances':'Finanzas','screen.settings':'Configuración',
    'label.customer':'Cliente','label.date':'Fecha','label.total':'Total','label.status':'Estado',
    'status.paid':'Pagado','status.unpaid':'Pendiente','status.estimate':'Cotización','status.void':'Anulado',
    'invoice.saveAndSend':'Guardar y Enviar Factura','invoice.preview':'Vista Previa',
    'report.save':'Guardar Reporte',
  },
  zh: {
    'nav.invoices':'發票','nav.jobs':'工作','nav.history':'記錄','nav.clients':'客戶','nav.money':'財務',
    'settings.language':'語言設定','settings.appLanguage':'App 介面語言','settings.invoiceLanguage':'發票輸出語言',
    'btn.save':'儲存','btn.cancel':'取消','btn.addItem':'新增項目','btn.addCustomer':'新增客戶',
    'screen.invoices':'發票','screen.jobs':'工作報告','screen.history':'歷史記錄','screen.clients':'客戶',
    'screen.finances':'財務','screen.settings':'設定',
    'label.customer':'客戶','label.date':'日期','label.total':'總計','label.status':'狀態',
    'status.paid':'已付款','status.unpaid':'未付款','status.estimate':'估價單','status.void':'作廢',
    'invoice.saveAndSend':'儲存並發送發票','invoice.preview':'預覽發票',
    'report.save':'儲存報告',
  }
};

// Invoice field label translations
const INVOICE_LABELS = {
  en: {
    billTo:'Bill To', description:'Description', amount:'Amount', subtotal:'Subtotal',
    discount:'Discount', tax:'Tax', total:'Total', terms:'Terms & Conditions',
    signatureLine:'Customer signature:', dateLine:'Date:', howToPay:'How to Pay',
    zelleInstant:'Instant transfer — no fees', achDays:'1–3 business days', payNow:'Pay Now',
    jobDetails:'Job Details',
  },
  es: {
    billTo:'Facturar a', description:'Descripción', amount:'Monto', subtotal:'Subtotal',
    discount:'Descuento', tax:'Impuesto', total:'Total', terms:'Términos y Condiciones',
    signatureLine:'Firma del cliente:', dateLine:'Fecha:', howToPay:'Cómo Pagar',
    zelleInstant:'Transferencia instantánea — sin cargos', achDays:'1–3 días hábiles', payNow:'Pagar Ahora',
    jobDetails:'Detalles del Trabajo',
  },
  zh: {
    billTo:'收件人', description:'項目說明', amount:'金額', subtotal:'小計',
    discount:'折扣', tax:'稅金', total:'總計', terms:'條款與細則',
    signatureLine:'客戶簽名：', dateLine:'日期：', howToPay:'付款方式',
    zelleInstant:'即時到帳，無手續費', achDays:'1–3 個工作天', payNow:'立即付款',
    jobDetails:'工作詳情',
  }
};

function getLabelSet(lang) {
  // For bilingual: returns a proxy that renders "EN / Other"
  if (lang === 'en+es') return new Proxy({}, { get: (_, k) => `${INVOICE_LABELS.en[k]} / ${INVOICE_LABELS.es[k]}` });
  if (lang === 'en+zh') return new Proxy({}, { get: (_, k) => `${INVOICE_LABELS.en[k]} / ${INVOICE_LABELS.zh[k]}` });
  return INVOICE_LABELS[lang] || INVOICE_LABELS.en;
}

let APP_LANGUAGE = 'en';
let INVOICE_LANGUAGE = 'en';

function applyAppLanguage(lang) {
  APP_LANGUAGE = lang || 'en';
  const t = TRANSLATIONS[APP_LANGUAGE] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
}

function pickAppLang(lang, btn) {
  APP_LANGUAGE = lang;
  document.querySelectorAll('.app-lang-btn').forEach(b => {
    b.classList.toggle('border-primary', b === btn);
    b.classList.toggle('border-outline-variant', b !== btn);
  });
  applyAppLanguage(lang);
}

function pickInvoiceLang(lang, btn) {
  INVOICE_LANGUAGE = lang;
  document.querySelectorAll('.inv-lang-btn').forEach(b => {
    b.classList.toggle('border-primary', b === btn);
    b.classList.toggle('border-outline-variant', b !== btn);
  });
}

async function saveLanguageSettings() {
  const data = await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ app_language: APP_LANGUAGE, invoice_language: INVOICE_LANGUAGE })
  });
  if (data.id) {
    COMPANY = data;
    document.getElementById('lang-result').innerText = TRANSLATIONS[APP_LANGUAGE]?.['btn.save'] === 'Guardar' ? 'Guardado.' : (APP_LANGUAGE === 'zh' ? '已儲存。' : 'Saved.');
    setTimeout(() => { document.getElementById('lang-result').innerText = ''; }, 2000);
  } else {
    document.getElementById('lang-result').innerText = 'ERROR: ' + JSON.stringify(data);
  }
}

function loadLanguageSettings() {
  APP_LANGUAGE = COMPANY.app_language || 'en';
  INVOICE_LANGUAGE = COMPANY.invoice_language || 'en';
  applyAppLanguage(APP_LANGUAGE);
  // highlight app lang buttons
  document.querySelectorAll('.app-lang-btn').forEach(btn => {
    const lang = btn.getAttribute('onclick').match(/'([^']+)'/)?.[1];
    btn.classList.toggle('border-primary', lang === APP_LANGUAGE);
    btn.classList.toggle('border-outline-variant', lang !== APP_LANGUAGE);
  });
  // highlight invoice lang buttons
  document.querySelectorAll('.inv-lang-btn').forEach(btn => {
    const lang = btn.getAttribute('onclick').match(/'([^']+)'/)?.[1];
    btn.classList.toggle('border-primary', lang === INVOICE_LANGUAGE);
    btn.classList.toggle('border-outline-variant', lang !== INVOICE_LANGUAGE);
  });
}

// ---------- default logo ----------
const INDUSTRY_ICON_MAP = {
  'plumbing':          {icon:'water_drop',    color:'#0057a8'},
  'hvac':              {icon:'ac_unit',        color:'#00796b'},
  'handyman':          {icon:'handyman',       color:'#5d4037'},
  'auto-repair':       {icon:'directions_car', color:'#37474f'},
  'electrical':        {icon:'electrical_services', color:'#f57f17'},
  'landscaping':       {icon:'yard',           color:'#388e3c'},
  'roofing':           {icon:'roofing',        color:'#bf360c'},
  'pest-control':      {icon:'pest_control',   color:'#6a1b9a'},
  'pool-service':      {icon:'pool',           color:'#0288d1'},
  'appliance-repair':  {icon:'home_repair_service', color:'#455a64'},
  'painting':          {icon:'format_paint',   color:'#ad1457'},
  'cleaning':          {icon:'cleaning_services', color:'#00838f'},
  'pressure-washing':  {icon:'water',          color:'#1565c0'},
  'flooring':          {icon:'texture',        color:'#4e342e'},
  'tree-service':      {icon:'park',           color:'#2e7d32'},
  'pet-grooming':      {icon:'pets',           color:'#e64a19'},
  'computer-repair':   {icon:'computer',       color:'#283593'},
  'electronics-repair':{icon:'electrical_services', color:'#558b2f'},
};
function getDefaultLogoHtml(forPdf = false) {
  if (COMPANY.logo) return '';
  const slug = CURRENT_TEMPLATE ? CURRENT_TEMPLATE.slug : '';
  const {icon, color} = INDUSTRY_ICON_MAP[slug] || {icon:'home_repair_service', color:'#004ac6'};
  if (forPdf) {
    return `<div style="width:52px;height:52px;background:${color};border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <span style="color:white;font-size:26px;font-family:'Material Symbols Outlined';font-weight:100;font-style:normal;">${icon}</span></div>`;
  }
  return `<div class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style="background:${color}">
    <span class="material-symbols-outlined text-white text-[28px]">${icon}</span></div>`;
}

// ---------- template marketplace ----------
let selectedMarketplaceTemplateId = null;

function renderSettingsTemplateName() {
  const el = document.getElementById('settings-current-template');
  if (el) el.textContent = CURRENT_TEMPLATE ? CURRENT_TEMPLATE.industry_name : '—';
  const el2 = document.getElementById('settings-visual-template-name');
  if (el2) {
    const slug = COMPANY?.invoice_visual_template || 'clean-white';
    el2.textContent = VISUAL_TEMPLATES.find(t => t.slug === slug)?.label || 'Clean White';
  }
}

async function openTemplateMarketplace() {
  selectedMarketplaceTemplateId = null;
  document.getElementById('marketplace-apply-btn').disabled = true;
  document.getElementById('marketplace-replace-row').classList.add('hidden');
  document.getElementById('marketplace-result').textContent = '';
  document.getElementById('modal-template-marketplace').classList.remove('hidden');

  if (!ONBOARDING_TEMPLATES.length) await loadOnboardingTemplates();
  renderMarketplaceGrid();
}

function closeTemplateMarketplace() {
  document.getElementById('modal-template-marketplace').classList.add('hidden');
}

function renderMarketplaceGrid() {
  const iconMap = {
    'plumbing':'water_drop','hvac':'ac_unit','handyman':'handyman','auto-repair':'directions_car',
    'electrical':'electrical_services','landscaping':'yard','roofing':'roofing',
    'pest-control':'pest_control','pool-service':'pool','appliance-repair':'home_repair_service',
    'painting':'format_paint','cleaning':'cleaning_services','pressure-washing':'water',
    'flooring':'texture','tree-service':'park','pet-grooming':'pets',
  };
  const activeId = COMPANY.template;
  const card = t => {
    const isActive = t.id === activeId;
    return `<div class="template-mkt-card relative overflow-hidden rounded-xl bg-surface-container-lowest border-2 ${isActive ? 'border-primary' : 'border-outline-variant'} shadow-[0px_4px_12px_rgba(0,0,0,0.05)] cursor-pointer p-4" onclick="selectMarketplaceTemplate('${t.id}', this)">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-title-md text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">${iconMap[t.slug]||'work'}</span>${t.industry_name}
        </h3>
        <div class="flex items-center gap-1">
          ${isActive ? '<span class="text-[10px] bg-primary text-on-primary rounded-full px-2 py-0.5 font-medium">Current</span>' : ''}
          <span class="material-symbols-outlined text-primary selection-icon-mkt ${isActive ? '' : 'hidden'}">check_circle</span>
        </div>
      </div>
      <ul class="text-body-sm text-on-surface-variant space-y-0.5 mt-1">
        ${(t.default_service_items||[]).slice(0,3).map(i=>`<li>• ${i.name}</li>`).join('')}
        ${(t.default_service_items||[]).length > 3 ? `<li class="text-on-surface-variant/60">+ ${(t.default_service_items||[]).length - 3} more</li>` : ''}
      </ul>
    </div>`;
  };
  const base = ONBOARDING_TEMPLATES.filter(t => t.included_in_base);
  const premium = ONBOARDING_TEMPLATES.filter(t => !t.included_in_base);
  document.getElementById('marketplace-template-grid').innerHTML = `
    <div class="col-span-full">
      <p class="text-label-lg text-on-surface-variant uppercase tracking-widest mb-2">Included in all plans</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">${base.map(card).join('')}</div>
      ${premium.length ? `<p class="text-label-lg text-on-surface-variant uppercase tracking-widest mb-2">Premium templates</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${premium.map(card).join('')}</div>` : ''}
    </div>`;
}

function selectMarketplaceTemplate(id, el) {
  document.querySelectorAll('.template-mkt-card').forEach(c => {
    c.classList.remove('border-primary');
    c.classList.add('border-outline-variant');
    c.querySelector('.selection-icon-mkt').classList.add('hidden');
  });
  el.classList.remove('border-outline-variant');
  el.classList.add('border-primary');
  el.querySelector('.selection-icon-mkt').classList.remove('hidden');
  selectedMarketplaceTemplateId = id;
  const isSame = id === COMPANY.template;
  document.getElementById('marketplace-replace-row').classList.toggle('hidden', isSame);
  document.getElementById('marketplace-apply-btn').disabled = isSame;
  if (!isSame) document.getElementById('marketplace-result').textContent = '';
}

async function applySelectedTemplate() {
  if (!selectedMarketplaceTemplateId) return;
  const btn = document.getElementById('marketplace-apply-btn');
  const resultEl = document.getElementById('marketplace-result');
  const replaceItems = document.getElementById('marketplace-replace-items').checked;
  btn.disabled = true;
  btn.textContent = 'Applying…';
  resultEl.textContent = '';

  const tmpl = ONBOARDING_TEMPLATES.find(t => t.id === selectedMarketplaceTemplateId);
  if (!tmpl) { resultEl.textContent = 'Template not found.'; btn.disabled = false; btn.textContent = 'Apply Template'; return; }

  // patch company.template
  const patch = await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', body: JSON.stringify({template: selectedMarketplaceTemplateId})});
  if (!patch.id) { resultEl.textContent = 'ERROR: ' + JSON.stringify(patch); btn.disabled = false; btn.textContent = 'Apply Template'; return; }
  COMPANY = patch;
  CURRENT_TEMPLATE = tmpl;

  if (replaceItems) {
    // delete existing service items
    for (const si of serviceItems) {
      await authedFetch(`/api/collections/service_items/records/${si.id}`, {method:'DELETE'});
    }
    // seed from template
    for (const item of (tmpl.default_service_items || [])) {
      await authedFetch('/api/collections/service_items/records', {method:'POST', body: JSON.stringify({company: COMPANY.id, item_name: item.name, default_price: item.price})});
    }
  }

  // update asset schema from template if template provides one and worker hasn't customised
  if (tmpl.asset_field_schema && tmpl.asset_field_schema.length) {
    ASSET_SCHEMA = tmpl.asset_field_schema.map(f => ({label: f.label, level: 'main', required: true}));
    await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {method:'PATCH', body: JSON.stringify({custom_asset_schema: JSON.stringify(ASSET_SCHEMA)})});
  }

  await refreshAll();
  renderSettingsTemplateName();
  resultEl.textContent = replaceItems ? 'Template applied and service items replaced.' : 'Template switched. Your existing items kept.';
  btn.textContent = 'Apply Template';
  setTimeout(() => closeTemplateMarketplace(), 1500);
}

// ============================================================
// INVOICE VISUAL TEMPLATE ENGINE
// ============================================================

const VISUAL_TEMPLATES = [
  { slug: 'clean-white',     label: 'Clean White',     desc: 'Minimal, professional' },
  { slug: 'bold-header',     label: 'Bold Header',     desc: 'Strong color banner' },
  { slug: 'dark-pro',        label: 'Dark Pro',        desc: 'Premium dark style' },
  { slug: 'contractor',      label: 'Contractor',      desc: 'Trade-ready, orange' },
  { slug: 'modern-minimal',  label: 'Modern Minimal',  desc: 'Airy, no header block' },
  { slug: 'classic',         label: 'Classic',         desc: 'Traditional bordered' },
  { slug: 'sidebar',         label: 'Sidebar',         desc: 'Two-column layout' },
  { slug: 'red-bold',        label: 'Red Bold',        desc: 'High-contrast accent' },
];

function renderInvoiceTemplate(slug, d) {
  switch (slug) {
    case 'bold-header':    return tmplBoldHeader(d);
    case 'dark-pro':       return tmplDarkPro(d);
    case 'contractor':     return tmplContractor(d);
    case 'modern-minimal': return tmplModernMinimal(d);
    case 'classic':        return tmplClassic(d);
    case 'sidebar':        return tmplSidebar(d);
    case 'red-bold':       return tmplRedBold(d);
    default:               return tmplCleanWhite(d);
  }
}

// ---------- shared helpers ----------
function _logoImg(logoUrl, size=48) {
  return logoUrl
    ? `<img src="${logoUrl}" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:6px;">`
    : `<div style="width:${size}px;height:${size}px;border-radius:6px;background:#e5eeff;display:flex;align-items:center;justify-content:center;font-size:${size/2.5}px;font-weight:700;color:#004ac6;">$</div>`;
}

function _itemsTable(d, headerColor='#434655', borderColor='#e5eeff', accentColor='') {
  const rowBg = accentColor ? accentColor + '10' : '#f8f9ff';
  let t = `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">
    <thead><tr style="border-bottom:2px solid ${borderColor};">
      <th style="padding:8px 4px;text-align:left;color:${headerColor};font-weight:600;">${d.L.description}</th>
      <th style="padding:8px 4px;text-align:right;color:${headerColor};font-weight:600;">${d.L.amount}</th>
    </tr></thead><tbody>`;
  d.items.forEach((i, idx) => {
    const bg = idx % 2 === 1 ? `background:${rowBg};` : '';
    t += `<tr style="${bg}border-bottom:1px solid ${borderColor};">
      <td style="padding:8px 4px;"><span style="font-weight:500;">${i.name}</span>${i.description ? `<br><span style="font-size:11px;color:#737686;">${i.description}</span>` : ''}</td>
      <td style="padding:8px 4px;text-align:right;vertical-align:top;">$${i.price.toFixed(2)}</td>
    </tr>`;
    (i.subitems||[]).forEach(s => { t += `<tr><td style="padding:2px 4px 2px 20px;font-size:11px;color:#737686;">— ${s}</td><td></td></tr>`; });
  });
  t += '</tbody></table>';
  return t;
}

function _totalsBox(d, accentColor) {
  let t = `<div style="display:flex;justify-content:flex-end;margin-bottom:20px;">
    <div style="min-width:220px;font-size:13px;">
      <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>${d.L.subtotal}</span><span>$${d.subtotal.toFixed(2)}</span></div>`;
  if (d.discount) t += `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#ba1a1a;"><span>${d.discount.discount_name}</span><span>-$${d.discountAmount.toFixed(2)}</span></div>`;
  t += `<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>${d.L.tax}</span><span>$${d.taxAmount.toFixed(2)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0 4px;border-top:2px solid ${accentColor||'#0b1c30'};font-weight:700;font-size:16px;">
        <span>${d.L.total}</span><span>$${d.total.toFixed(2)}</span>
      </div>
    </div>
  </div>`;
  return t;
}

function _paymentBlock(d, accentColor) {
  const hasZelle = d.cmp && (COMPANY.zelle_email || COMPANY.zelle_phone);
  const hasAch   = COMPANY.ach_routing && COMPANY.ach_account;
  if (!hasZelle && !hasAch) return '';
  let h = `<div style="border:1px solid #c3c6d7;border-radius:8px;padding:16px;background:#f8f9ff;margin-bottom:16px;">
    <div style="font-weight:600;font-size:13px;margin-bottom:12px;color:${accentColor};">${d.L.howToPay}</div>`;
  if (hasZelle) {
    const qrUrl = COMPANY.zelle_qr ? `${PB}/api/files/companies/${COMPANY.id}/${COMPANY.zelle_qr}` : null;
    h += `<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:10px;">
      ${qrUrl ? `<img src="${qrUrl}" style="width:64px;height:64px;object-fit:contain;border-radius:4px;border:1px solid #c3c6d7;">` : ''}
      <div><div style="font-weight:500;font-size:13px;">Zelle</div>
        ${COMPANY.zelle_email ? `<div style="font-size:11px;color:#434655;">${COMPANY.zelle_email}</div>` : ''}
        ${COMPANY.zelle_phone ? `<div style="font-size:11px;color:#434655;">${COMPANY.zelle_phone}</div>` : ''}
      </div></div>`;
  }
  if (hasAch) {
    h += `<div style="border-top:1px solid #c3c6d7;padding-top:10px;font-size:11px;color:#434655;font-family:monospace;">
      ACH${COMPANY.ach_bank_name ? ' — '+COMPANY.ach_bank_name : ''}<br>
      Routing: ${COMPANY.ach_routing} &nbsp; Account: ${COMPANY.ach_account}
    </div>`;
  }
  h += '</div>';
  return h;
}

function _signatureBlock(d) {
  if (d.hidden.has('signature')) return '';
  return `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #c3c6d7;display:flex;justify-content:space-between;font-size:11px;color:#737686;">
    <span>${d.L.signatureLine} _______________________</span>
    <span>${d.L.dateLine} ___________</span>
  </div>`;
}

function _clientBlock(d) {
  if (d.hidden.has('client') || !d.cust) return '';
  return `<div style="margin-bottom:20px;">
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#737686;margin-bottom:4px;">${d.L.billTo}</div>
    <div style="font-weight:600;font-size:14px;">${d.cust.customer_name}</div>
    ${d.cust.phone ? `<div style="font-size:12px;color:#434655;">${d.cust.phone}</div>` : ''}
    ${d.cust.email ? `<div style="font-size:12px;color:#434655;">${d.cust.email}</div>` : ''}
    ${d.cust.address ? `<div style="font-size:12px;color:#434655;">${d.cust.address}</div>` : ''}
  </div>`;
}

function _assetBlock(d) {
  if (d.hidden.has('assets') || !Object.keys(d.assetDetails).length) return '';
  const rows = ASSET_SCHEMA.filter(f => d.assetDetails[f.label])
    .map(f => `<div style="font-size:12px;padding:2px 0;"><span style="color:#737686;">${f.label}:</span> ${d.assetDetails[f.label]}</div>`).join('');
  return `<div style="border:1px solid #c3c6d7;border-radius:6px;padding:10px;margin-bottom:16px;">${rows}</div>`;
}

// ---------- TEMPLATE 1: Clean White (default) ----------
function tmplCleanWhite(d) {
  const c = d.invoiceColor;
  let h = `<div style="${d.fontStyle}">`;
  h += `<div style="background:${c};color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <div style="display:flex;align-items:center;gap:12px;">${_logoImg(d.logoUrl)}<span style="font-weight:700;font-size:17px;">${COMPANY.company_name||''}</span></div>
    <div style="text-align:right;"><div style="font-size:20px;font-weight:800;">${d.titleLabel}</div>
      <div style="font-size:11px;opacity:.8;font-family:monospace;">#${d.invoiceNum}</div>
      <div style="font-size:12px;opacity:.85;">${d.formattedDate}</div></div>
  </div>`;
  h += _clientBlock(d);
  h += _assetBlock(d);
  h += _itemsTable(d, '#434655', '#e5eeff', c);
  h += _totalsBox(d, c);
  h += _paymentBlock(d, c);
  h += _signatureBlock(d);
  if (d.footerMsg) h += `<div style="text-align:center;font-size:11px;color:#737686;font-style:italic;margin-top:16px;">${d.footerMsg}</div>`;
  h += '</div>';
  return h;
}

// ---------- TEMPLATE 2: Bold Header ----------
function tmplBoldHeader(d) {
  const c = d.invoiceColor;
  let h = `<div style="${d.fontStyle}">`;
  h += `<div style="background:linear-gradient(135deg,${c} 0%,${c}cc 100%);color:#fff;padding:28px 24px;border-radius:8px 8px 0 0;margin-bottom:0;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>${_logoImg(d.logoUrl,56)}<div style="font-weight:800;font-size:20px;margin-top:8px;">${COMPANY.company_name||''}</div>
        ${COMPANY.phone ? `<div style="font-size:11px;opacity:.75;margin-top:2px;">${COMPANY.phone}</div>` : ''}
        ${COMPANY.email ? `<div style="font-size:11px;opacity:.75;">${COMPANY.email}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:28px;font-weight:900;letter-spacing:-.5px;">${d.titleLabel}</div>
        <div style="font-size:13px;font-family:monospace;opacity:.85;margin-top:4px;">#${d.invoiceNum}</div>
        <div style="font-size:13px;opacity:.85;">${d.formattedDate}</div>
        <div style="margin-top:12px;background:rgba(255,255,255,.2);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;">Due on receipt</div>
      </div>
    </div>
  </div>
  <div style="height:4px;background:${c};opacity:.3;margin-bottom:24px;"></div>`;
  h += _clientBlock(d);
  h += _assetBlock(d);
  h += _itemsTable(d, c, '#e5eeff', c);
  h += _totalsBox(d, c);
  h += _paymentBlock(d, c);
  h += _signatureBlock(d);
  if (d.footerMsg) h += `<div style="text-align:center;font-size:11px;color:#737686;font-style:italic;margin-top:16px;">${d.footerMsg}</div>`;
  h += '</div>';
  return h;
}

// ---------- TEMPLATE 3: Dark Pro ----------
function tmplDarkPro(d) {
  const accent = '#f5a623';
  let h = `<div style="${d.fontStyle}">`;
  h += `<div style="background:#1C2541;color:#fff;padding:24px;border-radius:8px 8px 0 0;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:12px;">${_logoImg(d.logoUrl,52)}<div>
      <div style="font-weight:700;font-size:18px;">${COMPANY.company_name||''}</div>
      ${COMPANY.phone ? `<div style="font-size:11px;color:#aab;margin-top:2px;">${COMPANY.phone}</div>` : ''}
    </div></div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:${accent};text-transform:uppercase;letter-spacing:.1em;font-weight:600;">${d.titleLabel}</div>
      <div style="font-size:24px;font-weight:800;color:#fff;font-family:monospace;">#${d.invoiceNum}</div>
      <div style="font-size:12px;color:#aab;margin-top:2px;">${d.formattedDate}</div>
    </div>
  </div>`;
  h += _clientBlock(d);
  h += _assetBlock(d);
  h += _itemsTable(d, '#1C2541', '#eaedf7', accent);
  h += _totalsBox(d, accent);
  h += _paymentBlock(d, '#1C2541');
  h += _signatureBlock(d);
  if (d.footerMsg) h += `<div style="text-align:center;font-size:11px;color:#737686;font-style:italic;margin-top:16px;">${d.footerMsg}</div>`;
  h += '</div>';
  return h;
}

// ---------- TEMPLATE 4: Contractor ----------
function tmplContractor(d) {
  const orange = '#e65100';
  let h = `<div style="${d.fontStyle}">`;
  h += `<div style="background:${orange};color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;margin-bottom:0;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:10px;">${_logoImg(d.logoUrl,44)}<span style="font-weight:800;font-size:18px;text-transform:uppercase;">${COMPANY.company_name||''}</span></div>
      <div style="text-align:right;"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;opacity:.8;">Work Order</div>
        <div style="font-size:22px;font-weight:900;font-family:monospace;">#${d.invoiceNum}</div>
      </div>
    </div>
  </div>
  <div style="background:#fff3e0;padding:8px 24px;margin-bottom:20px;display:flex;justify-content:space-between;font-size:12px;color:#bf360c;">
    <span style="font-weight:600;">Date: ${d.formattedDate}</span>
    <span style="font-weight:600;">Status: <span style="background:${orange};color:#fff;padding:1px 8px;border-radius:10px;">Due</span></span>
  </div>`;
  h += _clientBlock(d);
  h += _assetBlock(d);
  let t = `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;">
    <thead><tr style="background:${orange};color:#fff;">
      <th style="padding:8px 12px;text-align:left;border-radius:4px 0 0 4px;">Service / Description</th>
      <th style="padding:8px 12px;text-align:right;border-radius:0 4px 4px 0;">Amount</th>
    </tr></thead><tbody>`;
  d.items.forEach((i, idx) => {
    t += `<tr style="background:${idx%2===1?'#fff3e0':'#fff'};border-bottom:1px solid #ffe0b2;">
      <td style="padding:8px 12px;">✓ <strong>${i.name}</strong>${i.description ? `<br><span style="font-size:11px;color:#737686;margin-left:18px;">${i.description}</span>` : ''}</td>
      <td style="padding:8px 12px;text-align:right;font-family:monospace;">$${i.price.toFixed(2)}</td>
    </tr>`;
  });
  t += '</tbody></table>';
  h += t;
  h += _totalsBox(d, orange);
  h += _paymentBlock(d, orange);
  h += _signatureBlock(d);
  if (d.footerMsg) h += `<div style="text-align:center;font-size:11px;color:#737686;font-style:italic;margin-top:16px;">${d.footerMsg}</div>`;
  h += '</div>';
  return h;
}

// ---------- TEMPLATE 5: Modern Minimal ----------
function tmplModernMinimal(d) {
  const c = d.invoiceColor;
  let h = `<div style="${d.fontStyle}padding:8px;">`;
  h += `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid ${c};">
    <div style="display:flex;align-items:center;gap:14px;">${_logoImg(d.logoUrl,64)}<div>
      <div style="font-weight:700;font-size:20px;color:#111;">${COMPANY.company_name||''}</div>
      ${COMPANY.phone ? `<div style="font-size:12px;color:#737686;">${COMPANY.phone}</div>` : ''}
      ${COMPANY.email ? `<div style="font-size:12px;color:#737686;">${COMPANY.email}</div>` : ''}
    </div></div>
    <div style="text-align:right;">
      <div style="font-size:40px;font-weight:900;color:${c};line-height:1;letter-spacing:-2px;">${d.titleLabel}</div>
      <div style="font-size:14px;color:#737686;margin-top:6px;font-family:monospace;">#${d.invoiceNum}</div>
      <div style="font-size:12px;color:#737686;">${d.formattedDate}</div>
    </div>
  </div>`;
  h += _clientBlock(d);
  h += _assetBlock(d);
  h += _itemsTable(d, '#737686', '#f0f0f5', c);
  h += _totalsBox(d, c);
  h += _paymentBlock(d, c);
  h += _signatureBlock(d);
  if (d.footerMsg) h += `<div style="text-align:center;font-size:11px;color:#737686;font-style:italic;margin-top:16px;">${d.footerMsg}</div>`;
  h += '</div>';
  return h;
}

// ---------- TEMPLATE 6: Classic ----------
function tmplClassic(d) {
  let h = `<div style="${d.fontStyle}">`;
  h += `<div style="border-bottom:3px double #0b1c30;padding-bottom:16px;margin-bottom:20px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div style="display:flex;align-items:center;gap:10px;">${_logoImg(d.logoUrl,52)}<div>
        <div style="font-weight:700;font-size:18px;">${COMPANY.company_name||''}</div>
        ${COMPANY.phone ? `<div style="font-size:11px;color:#434655;">${COMPANY.phone}</div>` : ''}
        ${COMPANY.email ? `<div style="font-size:11px;color:#434655;">${COMPANY.email}</div>` : ''}
        ${COMPANY.address ? `<div style="font-size:11px;color:#434655;">${COMPANY.address}</div>` : ''}
      </div></div>
      <div style="text-align:right;">
        <div style="font-size:22px;font-weight:800;border:3px solid #0b1c30;padding:4px 14px;display:inline-block;">${d.titleLabel}</div>
        <div style="font-size:12px;color:#434655;margin-top:6px;font-family:monospace;">No. ${d.invoiceNum}</div>
        <div style="font-size:12px;color:#434655;">Date: ${d.formattedDate}</div>
      </div>
    </div>
  </div>`;
  if (d.cust && !d.hidden.has('client')) {
    h += `<div style="background:#f4f4f8;border:1px solid #c3c6d7;border-radius:4px;padding:12px;margin-bottom:20px;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#434655;margin-bottom:6px;font-weight:700;">Bill To</div>
      <div style="font-weight:600;">${d.cust.customer_name}</div>
      ${d.cust.phone ? `<div style="font-size:12px;">${d.cust.phone}</div>` : ''}
      ${d.cust.email ? `<div style="font-size:12px;">${d.cust.email}</div>` : ''}
    </div>`;
  }
  h += _assetBlock(d);
  let t = `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px;border:1px solid #c3c6d7;">
    <thead><tr style="background:#0b1c30;color:#fff;">
      <th style="padding:8px 10px;text-align:left;">Description</th>
      <th style="padding:8px 10px;text-align:right;">Amount</th>
    </tr></thead><tbody>`;
  d.items.forEach((i, idx) => {
    t += `<tr style="background:${idx%2===1?'#f4f4f8':'#fff'};border-bottom:1px solid #c3c6d7;">
      <td style="padding:8px 10px;"><strong>${i.name}</strong>${i.description ? `<br><span style="font-size:11px;color:#737686;">${i.description}</span>` : ''}</td>
      <td style="padding:8px 10px;text-align:right;font-family:monospace;">$${i.price.toFixed(2)}</td>
    </tr>`;
  });
  t += '</tbody></table>';
  h += t;
  h += _totalsBox(d, '#0b1c30');
  h += _paymentBlock(d, '#0b1c30');
  h += _signatureBlock(d);
  if (d.footerMsg) h += `<div style="text-align:center;font-size:11px;color:#737686;font-style:italic;margin-top:16px;">${d.footerMsg}</div>`;
  h += '</div>';
  return h;
}

// ---------- TEMPLATE 7: Sidebar ----------
function tmplSidebar(d) {
  const sideColor = '#2d6a4f';
  let h = `<div style="${d.fontStyle}display:flex;gap:0;min-height:400px;">`;
  h += `<div style="width:160px;min-width:160px;background:${sideColor};color:#fff;padding:20px 14px;border-radius:8px 0 0 8px;flex-shrink:0;">
    <div style="margin-bottom:16px;">${_logoImg(d.logoUrl,48)}</div>
    <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${COMPANY.company_name||''}</div>
    ${COMPANY.phone ? `<div style="font-size:10px;opacity:.8;margin-top:3px;">${COMPANY.phone}</div>` : ''}
    ${COMPANY.email ? `<div style="font-size:10px;opacity:.8;word-break:break-all;">${COMPANY.email}</div>` : ''}
    ${COMPANY.address ? `<div style="font-size:10px;opacity:.8;margin-top:4px;">${COMPANY.address}</div>` : ''}
    <div style="border-top:1px solid rgba(255,255,255,.3);margin:16px 0;"></div>
    ${d.cust && !d.hidden.has('client') ? `<div style="font-size:10px;opacity:.7;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Bill To</div>
      <div style="font-weight:600;font-size:12px;">${d.cust.customer_name}</div>
      ${d.cust.phone ? `<div style="font-size:10px;opacity:.8;">${d.cust.phone}</div>` : ''}
      ${d.cust.email ? `<div style="font-size:10px;opacity:.8;word-break:break-all;">${d.cust.email}</div>` : ''}` : ''}
    <div style="border-top:1px solid rgba(255,255,255,.3);margin:16px 0;"></div>
    <div style="font-size:10px;opacity:.7;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Invoice</div>
    <div style="font-family:monospace;font-size:12px;font-weight:700;">#${d.invoiceNum}</div>
    <div style="font-size:10px;opacity:.8;margin-top:3px;">${d.formattedDate}</div>
  </div>
  <div style="flex:1;padding:24px;background:#fff;border-radius:0 8px 8px 0;border:1px solid #e0e0e0;border-left:none;">
    <div style="font-size:22px;font-weight:800;color:${sideColor};margin-bottom:20px;">${d.titleLabel}</div>`;
  h += _assetBlock(d);
  h += _itemsTable(d, sideColor, '#e8f5e9', sideColor);
  h += _totalsBox(d, sideColor);
  h += _paymentBlock(d, sideColor);
  h += _signatureBlock(d);
  if (d.footerMsg) h += `<div style="text-align:center;font-size:11px;color:#737686;font-style:italic;margin-top:16px;">${d.footerMsg}</div>`;
  h += '</div></div>';
  return h;
}

// ---------- TEMPLATE 8: Red Bold ----------
function tmplRedBold(d) {
  const red = '#c62828';
  let h = `<div style="${d.fontStyle}">`;
  h += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding:20px 0;border-bottom:4px solid ${red};">
    <div style="display:flex;align-items:center;gap:14px;">${_logoImg(d.logoUrl,60)}<div>
      <div style="font-weight:800;font-size:20px;color:#1a1a1a;">${COMPANY.company_name||''}</div>
      ${COMPANY.phone ? `<div style="font-size:12px;color:#737686;">${COMPANY.phone}</div>` : ''}
      ${COMPANY.email ? `<div style="font-size:12px;color:#737686;">${COMPANY.email}</div>` : ''}
    </div></div>
    <div style="background:${red};color:#fff;padding:16px 20px;border-radius:8px;text-align:center;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;opacity:.85;">${d.titleLabel}</div>
      <div style="font-size:22px;font-weight:900;font-family:monospace;line-height:1.1;">#${d.invoiceNum}</div>
      <div style="font-size:11px;opacity:.85;margin-top:2px;">${d.formattedDate}</div>
    </div>
  </div>`;
  h += _clientBlock(d);
  h += _assetBlock(d);
  h += _itemsTable(d, '#1a1a1a', '#fce4ec', red);
  h += _totalsBox(d, red);
  h += _paymentBlock(d, red);
  h += _signatureBlock(d);
  if (d.footerMsg) h += `<div style="text-align:center;font-size:11px;color:#737686;font-style:italic;margin-top:16px;">${d.footerMsg}</div>`;
  h += '</div>';
  return h;
}

// ============================================================
// VISUAL TEMPLATE PICKER
// ============================================================

function openVisualTemplatePicker() {
  const current = COMPANY.invoice_visual_template || 'clean-white';
  const grid = document.getElementById('vt-picker-grid');
  grid.innerHTML = VISUAL_TEMPLATES.map(t => {
    const active = t.slug === current;
    return `<div onclick="selectVisualTemplate('${t.slug}',this)"
      style="cursor:pointer;border-radius:10px;border:2px solid ${active?'#004ac6':'#c3c6d7'};overflow:hidden;transition:border-color .15s;">
      ${vtThumbnail(t.slug)}
      <div style="padding:8px 10px;background:#fff;">
        <div style="font-weight:600;font-size:13px;color:${active?'#004ac6':'#0b1c30'};">${t.label}</div>
        <div style="font-size:11px;color:#737686;">${t.desc}</div>
      </div>
    </div>`;
  }).join('');
  document.getElementById('modal-visual-template').classList.remove('hidden');
}

function closeVisualTemplatePicker() {
  document.getElementById('modal-visual-template').classList.add('hidden');
}

async function selectVisualTemplate(slug, el) {
  document.querySelectorAll('#vt-picker-grid > div').forEach(c => {
    c.style.borderColor = '#c3c6d7';
    c.querySelector('div:last-child div').style.color = '#0b1c30';
  });
  el.style.borderColor = '#004ac6';
  el.querySelector('div:last-child div').style.color = '#004ac6';

  await authedFetch(`/api/collections/companies/records/${COMPANY.id}`, {
    method: 'PATCH',
    body: JSON.stringify({invoice_visual_template: slug})
  });
  COMPANY.invoice_visual_template = slug;
  const label = VISUAL_TEMPLATES.find(t => t.slug === slug)?.label || slug;
  const el2 = document.getElementById('settings-visual-template-name');
  if (el2) el2.textContent = label;
}

function vtThumbnail(slug) {
  const thumbs = {
    'clean-white':    `<div style="height:60px;background:linear-gradient(to bottom,#004ac6 40%,#fff 40%);position:relative;"><div style="position:absolute;top:6px;left:8px;width:20px;height:20px;background:rgba(255,255,255,.3);border-radius:3px;"></div><div style="position:absolute;top:6px;right:8px;width:30px;height:8px;background:rgba(255,255,255,.6);border-radius:2px;"></div></div>`,
    'bold-header':    `<div style="height:60px;background:linear-gradient(135deg,#1565c0,#42a5f5);position:relative;"><div style="position:absolute;bottom:4px;left:8px;right:8px;height:3px;background:rgba(255,255,255,.3);border-radius:2px;"></div></div>`,
    'dark-pro':       `<div style="height:60px;background:#1C2541;display:flex;align-items:center;justify-content:flex-end;padding-right:10px;"><div style="color:#f5a623;font-size:16px;font-weight:900;font-family:monospace;">#0042</div></div>`,
    'contractor':     `<div style="height:60px;background:#e65100;position:relative;"><div style="position:absolute;bottom:0;left:0;right:0;height:14px;background:#fff3e0;"></div></div>`,
    'modern-minimal': `<div style="height:60px;background:#fff;border-bottom:3px solid #004ac6;display:flex;align-items:center;justify-content:flex-end;padding-right:10px;"><div style="font-size:22px;font-weight:900;color:#e8ecff;">INV</div></div>`,
    'classic':        `<div style="height:60px;background:#fff;border:1px solid #c3c6d7;position:relative;"><div style="position:absolute;top:0;left:0;right:0;height:20px;background:#0b1c30;"></div></div>`,
    'sidebar':        `<div style="height:60px;display:flex;"><div style="width:30px;background:#2d6a4f;"></div><div style="flex:1;background:#fff;border:1px solid #e0e0e0;border-left:none;"></div></div>`,
    'red-bold':       `<div style="height:60px;background:#fff;border-bottom:4px solid #c62828;position:relative;"><div style="position:absolute;top:8px;right:8px;background:#c62828;border-radius:5px;width:36px;height:38px;"></div></div>`,
  };
  return thumbs[slug] || thumbs['clean-white'];
}
