const PB = window.location.origin;
let TOKEN = null, COMPANY = null, CURRENT_TEMPLATE = null;
let serviceItems = [], discounts = [], customers = [], bundles = [], workOrders = [], expenses = [], recurringInvoices = [], appointments = [], reports = [];
let ONBOARDING_TEMPLATES = [], selectedOnboardingTemplateId = null;
let calMonthOffset = 0;
let reportPhotos = {before: [], after: []};

// ---------- auth ----------
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
  document.getElementById('brand-name').innerText = COMPANY.company_name || 'EWNexus';
  document.getElementById('screen-login').classList.remove('active');

  if (!COMPANY.template) {
    await loadOnboardingTemplates();
    document.getElementById('ob-company-name').value = COMPANY.company_name || '';
    document.getElementById('screen-onboarding').classList.add('active');
  } else {
    CURRENT_TEMPLATE = await authedFetch(`/api/collections/templates/records/${COMPANY.template}`);
    document.getElementById('app-shell').classList.remove('hidden');
    switchScreen('invoice');
    await refreshAll();
  }
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
  const data = await authedFetch('/api/collections/templates/records?perPage=50&sort=industry_name');
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
  };
  const base = ONBOARDING_TEMPLATES.filter(t => t.included_in_base);
  const premium = ONBOARDING_TEMPLATES.filter(t => !t.included_in_base);
  const card = t => `
    <div class="template-card relative overflow-hidden rounded-xl bg-surface-container-lowest border border-outline-variant shadow-[0px_4px_12px_rgba(0,0,0,0.05)] cursor-pointer p-4" onclick="selectOnboardingTemplate('${t.id}', this)">
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
  document.getElementById('ob-template-grid').innerHTML = `
    <div class="col-span-full">
      <p class="text-label-lg text-on-surface-variant uppercase tracking-widest mb-2">Included in all plans</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">${base.map(card).join('')}</div>
      <p class="text-label-lg text-on-surface-variant uppercase tracking-widest mb-2">Premium templates <span class="text-tertiary normal-case tracking-normal">(unlock with Premium plan)</span></p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">${premium.map(card).join('')}</div>
    </div>` || '<p class="text-on-surface-variant text-body-md">No templates available.</p>';
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
function showPreview() {
  const {subtotal, discountAmount, taxAmount, total, items, discount} = computeTotals();
  const custId = document.getElementById('customer-select').value;
  const cust = customers.find(c => c.id === custId);
  const assetDetails = collectAssetDetails('inv');
  const logoUrl = COMPANY.logo ? `${PB}/api/files/${COMPANY.collectionId}/${COMPANY.id}/${COMPANY.logo}` : '';
  const dateVal = document.getElementById('invoice-date').value || new Date().toISOString().slice(0,10);

  let html = `
    <div class="flex justify-between items-start border-b-2 border-[#0b1c30] pb-6 mb-6">
      <div class="flex items-center gap-3">
        ${logoUrl ? `<img src="${logoUrl}" class="w-14 h-14 object-contain">` : getDefaultLogoHtml(false)}
        <div class="text-xl font-bold">${COMPANY.company_name || 'Your Company'}</div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold text-[#004ac6]">INVOICE</div>
        <div class="text-sm text-[#434655]">Date: ${dateVal}</div>
      </div>
    </div>
    <div class="mb-6">
      <div class="text-xs uppercase tracking-wide text-[#434655] mb-1">Bill To</div>
      <div class="font-semibold">${cust ? cust.customer_name : '(no customer selected)'}</div>
      ${cust && cust.phone ? `<div class="text-sm">${cust.phone}</div>` : ''}
      ${cust && cust.email ? `<div class="text-sm">${cust.email}</div>` : ''}
      ${cust && cust.address ? `<div class="text-sm">${cust.address}</div>` : ''}
    </div>`;

  if (Object.keys(assetDetails).length) {
    const assetRows = ASSET_SCHEMA.filter(f => assetDetails[f.label]).map(f =>
      f.level === 'detail'
        ? `<div class="pl-4 border-l-2 border-[#c3c6d7] mt-1"><span class="text-[#434655] text-xs">${f.label}:</span> <span class="text-xs">${assetDetails[f.label]}</span></div>`
        : `<div class="mt-1 font-medium"><span class="text-[#434655]">${f.label}:</span> ${assetDetails[f.label]}</div>`
    ).join('');
    html += `<div class="mb-6 text-sm border border-[#c3c6d7] rounded-lg p-3">${assetRows}</div>`;
  }

  html += `<table class="w-full mb-6 text-sm"><thead><tr class="border-b border-[#c3c6d7] text-left text-[#434655]"><th class="py-2">Description</th><th class="py-2 text-right">Amount</th></tr></thead><tbody>`;
  items.forEach(i => {
    const descRow = i.description ? `<div class="text-xs text-[#737686] mt-0.5">${i.description}</div>` : '';
    html += `<tr class="border-b border-[#e5eeff]"><td class="py-2"><div class="font-medium">${i.name}</div>${descRow}</td><td class="py-2 text-right align-top">$${i.price.toFixed(2)}</td></tr>`;
    if (i.subitems && i.subitems.length) {
      i.subitems.forEach(s => html += `<tr class="text-[#737686] text-xs"><td class="py-1 pl-4">— ${s}</td><td></td></tr>`);
    }
  });
  html += `</tbody></table>`;

  html += `<div class="flex justify-end mb-6"><div class="w-full max-w-[280px] space-y-1 text-sm">
    <div class="flex justify-between"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>`;
  if (discount) html += `<div class="flex justify-between text-[#ba1a1a]"><span>${discount.discount_name}</span><span>-$${discountAmount.toFixed(2)}</span></div>`;
  html += `<div class="flex justify-between"><span>Tax</span><span>$${taxAmount.toFixed(2)}</span></div>
    <div class="flex justify-between text-lg font-bold border-t border-[#0b1c30] pt-2 mt-2"><span>Total</span><span>$${total.toFixed(2)}</span></div>
  </div></div>`;

  if (COMPANY.payment_link) {
    html += `<div class="mt-8 text-center">
      <a href="${COMPANY.payment_link}" target="_blank" rel="noopener noreferrer"
         class="inline-block bg-[#004ac6] text-white font-semibold text-sm px-8 py-3 rounded-lg no-underline">
        Pay Now
      </a>
      <div class="text-xs text-[#737686] mt-2">Tap to pay via Venmo / Zelle / CashApp / PayPal</div>
    </div>`;
  }

  const tos = stripHtml(COMPANY.terms_of_service || '');
  if (tos) html += `<div class="text-xs text-[#737686] border-t border-[#c3c6d7] pt-4 mt-8 whitespace-pre-wrap break-words overflow-wrap-anywhere">${tos}</div>`;

  document.getElementById('preview-content').innerHTML = html;
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
  if (tierNote) tierNote.innerText = COMPANY.subscription_tier === 'premium'
    ? 'Premium: photos are stored for 1 year on Cloudflare R2.'
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
    if (COMPANY.subscription_tier === 'premium') {
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
  if (!el) return;
  el.textContent = CURRENT_TEMPLATE ? CURRENT_TEMPLATE.industry_name : '—';
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
