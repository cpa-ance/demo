// ====== 請在這裡改成你自己的資訊 ======
const MERCHANT_EMAIL = "cpa.ance@gmail.com"; // 收訂單的信箱
const SHOP_NAME = "小日子選物";
const LINE_URL = "https://line.me/ti/p/@986fcuww"; // LINE 官方帳號連結
// =====================================

let products = [];
let cart = {}; // { productId: qty }

const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const searchInput = document.getElementById("search");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const sendBtn = document.getElementById("sendBtn");
const customerNameEl = document.getElementById("customerName");
const customerContactEl = document.getElementById("customerContact");
const customerNoteEl = document.getElementById("customerNote");
const fallbackModal = document.getElementById("fallbackModal");
const fallbackOverlay = document.getElementById("fallbackOverlay");
const fallbackText = document.getElementById("fallbackText");
const copyBtn = document.getElementById("copyBtn");
const closeFallback = document.getElementById("closeFallback");

let activeCategory = "全部";
let searchTerm = "";

function init() {
  products = JSON.parse(document.getElementById("productsData").textContent);
  document.getElementById("lineBtn").href = LINE_URL;
  renderFilters();
  renderGrid();
  bindEvents();
}

function renderFilters() {
  const categories = ["全部", ...new Set(products.map(p => p.category))];
  filters.innerHTML = categories
    .map(c => `<button class="filter-chip ${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderGrid() {
  const filtered = products.filter(p => {
    const matchCat = activeCategory === "全部" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color:#6b6459;padding:24px;">找不到符合的商品。</p>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="card-body">
        <span class="card-category">${p.category}</span>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.description}</p>
        <div class="card-footer">
          <span class="card-price">NT$ ${p.price}</span>
          <button class="add-btn" data-id="${p.id}">加入清單</button>
        </div>
      </div>
    </div>
  `).join("");
}

function bindEvents() {
  filters.addEventListener("click", e => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    renderFilters();
    renderGrid();
  });

  searchInput.addEventListener("input", e => {
    searchTerm = e.target.value;
    renderGrid();
  });

  grid.addEventListener("click", e => {
    const btn = e.target.closest(".add-btn");
    if (!btn) return;
    const id = btn.dataset.id;
    cart[id] = (cart[id] || 0) + 1;
    btn.textContent = "已加入";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "加入清單";
      btn.classList.remove("added");
    }, 900);
    renderCart();
  });

  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  cartItemsEl.addEventListener("click", e => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains("qty-plus")) cart[id]++;
    if (e.target.classList.contains("qty-minus")) {
      cart[id]--;
      if (cart[id] <= 0) delete cart[id];
    }
    if (e.target.classList.contains("remove-link")) delete cart[id];
    renderCart();
  });

  sendBtn.addEventListener("click", sendOrder);

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(fallbackText.value);
      copyBtn.textContent = "已複製！";
      setTimeout(() => (copyBtn.textContent = "複製訂單內容"), 1500);
    } catch {
      fallbackText.select();
      copyBtn.textContent = "請按 Ctrl+C / Cmd+C 複製";
    }
  });

  closeFallback.addEventListener("click", closeFallbackModal);
  fallbackOverlay.addEventListener("click", closeFallbackModal);
}

function closeFallbackModal() {
  fallbackModal.classList.remove("open");
  fallbackOverlay.classList.remove("open");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

function renderCart() {
  const ids = Object.keys(cart);
  const totalQty = ids.reduce((sum, id) => sum + cart[id], 0);
  cartCountEl.textContent = totalQty;

  if (ids.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty-cart">尚未選購任何商品</p>`;
    cartTotalEl.textContent = "NT$ 0";
    sendBtn.disabled = true;
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = ids.map(id => {
    const p = products.find(x => x.id === id);
    const qty = cart[id];
    const subtotal = p.price * qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">NT$ ${p.price} × ${qty} = NT$ ${subtotal}</div>
          <div class="qty-controls">
            <button class="qty-btn qty-minus" data-id="${id}">−</button>
            <span>${qty}</span>
            <button class="qty-btn qty-plus" data-id="${id}">+</button>
            <button class="remove-link" data-id="${id}">移除</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  cartTotalEl.textContent = `NT$ ${total}`;
  sendBtn.disabled = false;
}

function sendOrder() {
  const ids = Object.keys(cart);
  if (ids.length === 0) return;

  const name = customerNameEl.value.trim() || "(未填寫)";
  const contact = customerContactEl.value.trim() || "(未填寫)";
  const note = customerNoteEl.value.trim();

  let total = 0;
  const lines = ids.map(id => {
    const p = products.find(x => x.id === id);
    const qty = cart[id];
    const subtotal = p.price * qty;
    total += subtotal;
    return `- ${p.name} x ${qty} ＝ NT$${subtotal}`;
  });

  const body = [
    `您好,我想訂購以下商品：`,
    ``,
    ...lines,
    ``,
    `總金額：NT$${total}`,
    ``,
    `姓名：${name}`,
    `聯絡方式：${contact}`,
    note ? `備註：${note}` : null,
  ].filter(Boolean).join("\n");

  const subject = `【${SHOP_NAME}】新訂單 - ${name}`;
  const mailto = `mailto:${MERCHANT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  fallbackText.value = `收件人：${MERCHANT_EMAIL}\n主旨：${subject}\n\n${body}`;
  fallbackModal.classList.add("open");
  fallbackOverlay.classList.add("open");

  window.location.href = mailto;
}

init();
