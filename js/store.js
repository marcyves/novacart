(function () {
  const CART_KEY = "novacart-cart";
  const CONSENT_KEY = "novacart-consent";

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

  function removeItem(sku) {
    writeCart(readCart().filter((i) => i.sku !== sku));
  }

  function money(n) {
    return new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR" }).format(n);
  }

  function renderCartPage() {
    const root = document.querySelector("[data-cart-table]");
    if (!root) return;
    const items = readCart();
    if (!items.length) {
      root.innerHTML = "<p>Your cart is empty. <a href=\"catalog.html\">Continue shopping</a>.</p>";
      return;
    }
    const rows = items
      .map(
        (i) => `<tr>
          <td>${i.name}</td>
          <td>${i.qty}</td>
          <td>${money(i.price)}</td>
          <td>${money(i.price * i.qty)}</td>
          <td><button class="btn-ghost" data-remove="${i.sku}">Remove</button></td>
        </tr>`
      )
      .join("");
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    root.innerHTML = `<table>
      <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Line</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><th colspan="3">Total</th><th>${money(total)}</th><th></th></tr></tfoot>
    </table>`;
    root.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeItem(btn.getAttribute("data-remove"));
        renderCartPage();
      });
    });
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
    const path = location.pathname;
    if (path.includes("/products/") || path.includes("/c/") || path.includes("/legal/")) {
      return "../legal/cookies.html";
    }
    return "legal/cookies.html";
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addItem(btn.dataset.sku, btn.dataset.name, btn.dataset.price);
    btn.textContent = "Added";
    setTimeout(() => {
      btn.textContent = "Add to cart";
    }, 900);
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  renderCount();
  renderCartPage();
  cookieBar();

  const checkout = document.querySelector("[data-checkout]");
  if (checkout) {
    checkout.addEventListener("submit", (e) => {
      e.preventDefault();
      if (typeof gtag === "function") {
        gtag("event", "begin_checkout", { currency: "EUR" });
      }
      alert("Demo checkout — no payment is processed. This page exists for the funnel / QA labs.");
    });
  }
})();
