(function () {
  const CART_KEY = "novacart-cart";
  const CONSENT_KEY = "novacart-consent";
  const catalog = window.NovaCartCatalog || [];

  function prefix() {
    const p = location.pathname.replace(/\\/g, "/");
    if (p.includes("/products/") || p.includes("/c/") || p.includes("/legal/")) return "../";
    return "";
  }

  function productBySku(sku) {
    return catalog.find((item) => item.sku === sku);
  }

  function productHref(p) {
    const b = prefix();
    if (p.page) return b + "products/" + p.page;
    return b + "products/p.html?sku=" + encodeURIComponent(p.sku);
  }

  function productImg(p) {
    return prefix() + "img/" + p.image;
  }

  function money(n) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(n);
  }

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCount();
  }

  function renderCount() {
    const n = readCart().reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = String(n);
    });
  }

  function addItem(sku, name, price) {
    const items = readCart();
    const found = items.find((i) => i.sku === sku);
    if (found) found.qty += 1;
    else items.push({ sku, name, price: Number(price), qty: 1 });
    writeCart(items);
    if (typeof gtag === "function") {
      gtag("event", "add_to_cart", {
        currency: "EUR",
        value: Number(price),
        items: [{ item_id: sku, item_name: name, price: Number(price), quantity: 1 }],
      });
    }
  }

  function setQty(sku, qty) {
    if (qty < 1) {
      writeCart(readCart().filter((i) => i.sku !== sku));
      return;
    }
    writeCart(
      readCart().map((i) => (i.sku === sku ? { ...i, qty } : i))
    );
  }

  function cardHTML(p, heading) {
    const h = heading || "h3";
    const badge = p.badge ? `<span class="badge">${p.badge}</span>` : "";
    return `<article class="card" data-category="${p.category}">
      ${badge}
      <a class="cover" href="${productHref(p)}">
        <div class="shot"><img src="${productImg(p)}" alt="${p.name}" width="800" height="800"></div>
        <div class="card-body">
          <${h}>${p.name}</${h}>
          <p class="meta">${p.spec}</p>
          <p class="stars">★ ${p.rating.toFixed(1)} · ${p.reviews.toLocaleString("en-GB")}</p>
          <p class="price">${money(p.price)}</p>
        </div>
      </a>
    </article>`;
  }

  function renderFeatured() {
    const root = document.querySelector("[data-featured]");
    if (!root || !catalog.length) return;
    const skus = (root.getAttribute("data-featured") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const list = skus.length ? skus.map(productBySku).filter(Boolean) : catalog.slice(0, 4);
    root.innerHTML = list.map((p) => cardHTML(p, "h3")).join("");
  }

  function renderCatalog() {
    const root = document.querySelector("[data-catalog]");
    if (!root || !catalog.length) return;
    const heading = root.hasAttribute("data-h2") ? "h2" : "h3";
    root.innerHTML = catalog.map((p) => cardHTML(p, heading)).join("");

    const bar = document.querySelector("[data-filters]");
    if (!bar) return;
    const cats = [
      { id: "all", label: "All" },
      { id: "audio", label: "Audio" },
      { id: "charge", label: "Charge" },
      { id: "home", label: "Home" },
      { id: "carry", label: "Carry" },
    ];
    bar.innerHTML = cats
      .map(
        (c, i) =>
          `<button type="button" data-filter="${c.id}" aria-pressed="${i === 0 ? "true" : "false"}">${c.label}</button>`
      )
      .join("");
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      const id = btn.getAttribute("data-filter");
      bar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      root.querySelectorAll(".card").forEach((card) => {
        card.hidden = id !== "all" && card.getAttribute("data-category") !== id;
      });
    });
  }

  function renderGenericPdp() {
    const root = document.querySelector("[data-pdp]");
    if (!root) return;
    const sku = new URLSearchParams(location.search).get("sku");
    const p = productBySku(sku);
    if (!p) {
      root.innerHTML = `<p class="lede">We couldn't find that product. <a href="${prefix()}catalog.html">Back to the shop</a>.</p>`;
      return;
    }
    document.title = p.name + " — NovaCart";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", p.blurb);
    root.innerHTML = `
      <p class="crumbs"><a href="${prefix()}index.html">Home</a> / <a href="${prefix()}catalog.html">Shop</a> / ${p.name}</p>
      <article class="product" data-view-item data-sku="${p.sku}" data-name="${p.name}" data-price="${p.price}">
        <div class="shot"><img src="${productImg(p)}" alt="${p.name}" width="800" height="800"></div>
        <div>
          <h1>${p.name}</h1>
          <p class="stars">★ ${p.rating.toFixed(1)} · ${p.reviews.toLocaleString("en-GB")} reviews</p>
          <p class="price">${money(p.price)}</p>
          <p>${p.blurb}</p>
          <p class="meta">${p.spec} · ${p.sku}</p>
          <p style="margin-top:1.2rem">
            <button class="btn btn-accent" type="button" data-add data-sku="${p.sku}" data-name="${p.name}" data-price="${p.price}">Add to cart</button>
          </p>
        </div>
      </article>`;
    trackViewItem();
  }

  function trackViewItem() {
    const el = document.querySelector("[data-view-item]");
    if (!el || typeof gtag !== "function") return;
    gtag("event", "view_item", {
      currency: "EUR",
      value: Number(el.dataset.price),
      items: [
        {
          item_id: el.dataset.sku,
          item_name: el.dataset.name,
          price: Number(el.dataset.price),
          quantity: 1,
        },
      ],
    });
  }

  function renderCartPage() {
    const root = document.querySelector("[data-cart-table]");
    if (!root) return;
    const items = readCart();
    const checkoutBtn = document.querySelector("[data-checkout-link]");
    if (!items.length) {
      root.innerHTML = `<div class="empty"><h2>Your cart is empty</h2><p>Pulse Buds are in stock. Free EU shipping from €50.</p><p><a class="btn" href="catalog.html">Continue shopping</a></p></div>`;
      if (checkoutBtn) checkoutBtn.hidden = true;
      return;
    }
    if (checkoutBtn) checkoutBtn.hidden = false;
    const rows = items
      .map((i) => {
        const p = productBySku(i.sku);
        const img = p ? `<img src="${productImg(p)}" alt="">` : "";
        return `<tr>
          <td><div class="cart-item">${img}<div><strong>${i.name}</strong><div class="meta">${i.sku}</div></div></div></td>
          <td><div class="qty">
            <button type="button" data-qty="${i.sku}" data-delta="-1" aria-label="Decrease">−</button>
            <span>${i.qty}</span>
            <button type="button" data-qty="${i.sku}" data-delta="1" aria-label="Increase">+</button>
          </div></td>
          <td>${money(i.price)}</td>
          <td>${money(i.price * i.qty)}</td>
          <td><button class="btn-ghost" type="button" data-remove="${i.sku}">Remove</button></td>
        </tr>`;
      })
      .join("");
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const ship = total >= 50 ? 0 : 4.9;
    root.innerHTML = `<table>
      <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Line</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="3">Shipping${ship ? " (free from €50)" : ""}</td><td>${ship ? money(ship) : "Free"}</td><td></td></tr>
        <tr><th colspan="3">Total</th><th>${money(total + ship)}</th><th></th></tr>
      </tfoot>
    </table>`;
    root.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setQty(btn.getAttribute("data-remove"), 0);
        renderCartPage();
        renderCheckoutSummary();
      });
    });
    root.querySelectorAll("[data-qty]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sku = btn.getAttribute("data-qty");
        const item = readCart().find((i) => i.sku === sku);
        if (!item) return;
        setQty(sku, item.qty + Number(btn.getAttribute("data-delta")));
        renderCartPage();
        renderCheckoutSummary();
      });
    });
  }

  function renderCheckoutSummary() {
    const root = document.querySelector("[data-summary]");
    if (!root) return;
    const items = readCart();
    if (!items.length) {
      root.innerHTML = `<p>Nothing to check out. <a href="catalog.html">Shop the collection</a>.</p>`;
      return;
    }
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const ship = total >= 50 ? 0 : 4.9;
    root.innerHTML =
      items.map((i) => `<p>${i.name} × ${i.qty} <span style="float:right">${money(i.price * i.qty)}</span></p>`).join("") +
      `<p class="meta">Shipping <span style="float:right">${ship ? money(ship) : "Free"}</span></p>` +
      `<p class="price">Total ${money(total + ship)}</p>`;
  }

  function cookieBar() {
    if (localStorage.getItem(CONSENT_KEY)) return;
    const bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.innerHTML = `<p>NovaCart uses cookies for analytics and ads. See <a href="${cookieHref()}">Cookies</a>.</p>
      <button type="button" data-accept>OK</button>`;
    document.body.appendChild(bar);
    bar.querySelector("[data-accept]").addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "all");
      bar.remove();
    });
  }

  function cookieHref() {
    return prefix() + "legal/cookies.html";
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addItem(btn.dataset.sku, btn.dataset.name, btn.dataset.price);
    const original = btn.textContent;
    btn.textContent = "Added to cart";
    setTimeout(() => {
      btn.textContent = original;
    }, 1100);
  });

  document.querySelectorAll("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = form.querySelector("[data-nl-msg]");
      if (msg) msg.textContent = "You're on the list.";
    });
  });

  const year = document.querySelectorAll("[data-year]");
  year.forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  renderFeatured();
  renderCatalog();
  renderGenericPdp();
  renderCount();
  renderCartPage();
  renderCheckoutSummary();
  cookieBar();
  if (document.querySelector("[data-view-item]") && !document.querySelector("[data-pdp]")) {
    trackViewItem();
  }

  const checkout = document.querySelector("[data-checkout]");
  if (checkout) {
    checkout.addEventListener("submit", (e) => {
      e.preventDefault();
      const items = readCart();
      const value = items.reduce((s, i) => s + i.price * i.qty, 0);
      if (typeof gtag === "function") {
        gtag("event", "begin_checkout", {
          currency: "EUR",
          value,
          items: items.map((i) => ({
            item_id: i.sku,
            item_name: i.name,
            price: i.price,
            quantity: i.qty,
          })),
        });
      }
      checkout.hidden = true;
      const grid = checkout.closest(".checkout-grid");
      if (grid) grid.hidden = true;
      const thanks = document.querySelector("[data-thanks]");
      if (thanks) {
        thanks.hidden = false;
        thanks.classList.add("is-on");
      }
    });
  }
})();
