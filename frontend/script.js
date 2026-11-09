const productsContainer = document.getElementById('products');
const form = document.getElementById('product-form');
const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const productIdField = document.getElementById('product-id');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');

const API_URL = 'http://127.0.0.1:8003/produtos';
const CART_STORAGE_KEY = 'fashion-store-cart';
let allProducts = [];
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

function buildProductPayload(formData) {
  const nome = formData.get('nome').trim();
  const descricao = formData.get('descricao').trim();
  const precoCentavos = Number(formData.get('preco_centavos'));
  const fotoUrl = formData.get('foto_url').trim();
  const tamanho = formData.get('tamanho').trim();
  const cor = formData.get('cor').trim();
  const estoque = Number(formData.get('estoque')) || 0;

  return {
    nome,
    descricao: descricao || null,
    preco_centavos: precoCentavos,
    foto_url: fotoUrl || null,
    variacoes: tamanho || cor ? [{ tamanho: tamanho || 'Único', cor: cor || 'Padrão', estoque }] : [],
  };
}

function resetForm() {
  form.reset();
  productIdField.value = '';
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.textContent = 'Save product';
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function openModal(content) {
  modalBody.innerHTML = content;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

async function loadProductDetail(productId) {
  try {
    const response = await fetch(`${API_URL}/${productId}`);
    if (!response.ok) {
      throw new Error('Unable to load product details');
    }

    const product = await response.json();
    const variations = product.variacoes?.length
      ? product.variacoes
          .map(
            (variation) =>
              `<li><strong>${variation.tamanho}</strong> / ${variation.cor} — ${variation.estoque} in stock</li>`
          )
          .join('')
      : '<li>No variations available.</li>';

    openModal(`
      <div class="detail-layout">
        <img src="${product.foto_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'}" alt="${product.nome}" />
        <div class="detail-info">
          <h2 id="modal-title">${product.nome}</h2>
          <p>${product.descricao || 'Product description available soon.'}</p>
          <div class="detail-price">${formatPrice(product.preco_centavos)}</div>
          <ul class="detail-variations">${variations}</ul>
          <div class="action-row">
            <button class="secondary-btn" type="button" data-action="add-cart" data-product-id="${product.id}">Add to cart</button>
            <button class="secondary-btn" type="button" data-action="edit" data-product-id="${product.id}">Edit</button>
            <button class="danger-btn" type="button" data-action="delete" data-product-id="${product.id}">Delete</button>
          </div>
        </div>
      </div>
    `);

    document.querySelector('[data-action="add-cart"]').addEventListener('click', () => {
      addToCart(product.id);
      closeModal();
    });

    document.querySelector('[data-action="edit"]').addEventListener('click', () => {
      const productId = product.id;
      const firstVariation = product.variacoes?.[0] || {};

      productIdField.value = productId;
      document.getElementById('nome').value = product.nome;
      document.getElementById('descricao').value = product.descricao || '';
      document.getElementById('preco_centavos').value = product.preco_centavos;
      document.getElementById('foto_url').value = product.foto_url || '';
      document.getElementById('tamanho').value = firstVariation.tamanho || '';
      document.getElementById('cor').value = firstVariation.cor || '';
      document.getElementById('estoque').value = firstVariation.estoque || 0;

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.textContent = 'Update product';

      closeModal();
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      const shouldDelete = window.confirm('Do you want to delete this product?');
      if (!shouldDelete) return;

      try {
        const deleteResponse = await fetch(`${API_URL}/${product.id}`, {
          method: 'DELETE',
        });

        if (!deleteResponse.ok) {
          throw new Error('Unable to delete product');
        }

        closeModal();
        await loadProducts();
      } catch (error) {
        alert(error.message);
        console.error(error);
      }
    });
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

function matchesCategory(product, filter) {
  if (filter === 'all') {
    return true;
  }

  const text = `${product.nome} ${product.descricao || ''}`.toLowerCase();

  if (filter === 'dress') {
    return /(vestido|dress|blusa|saia|mini|midi|conjunto)/.test(text);
  }

  if (filter === 'outerwear') {
    return /(jaqueta|casaco|blazer|colete|outerwear|manga|camisa)/.test(text);
  }

  if (filter === 'accessories') {
    return /(bolsa|cachecol|óculos|oculos|acessório|acessorio|cinto|sapato|boné|bone|relógio|relogio)/.test(text);
  }

  return true;
}

function persistCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function updateCartSummary() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.preco_centavos, 0);

  cartCount.textContent = String(totalItems);
  cartTotal.textContent = formatPrice(totalPrice);
}

function addToCart(productId) {
  const product = allProducts.find((item) => item.id === Number(productId));
  if (!product) return;

  const existing = cart.find((item) => item.id === Number(productId));
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      nome: product.nome,
      preco_centavos: product.preco_centavos,
      foto_url: product.foto_url,
      quantity: 1,
    });
  }

  persistCart();
  updateCartSummary();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== Number(productId));
  persistCart();
  updateCartSummary();
  renderCart();
}

function changeCartQuantity(productId, delta) {
  const item = cart.find((entry) => entry.id === Number(productId));
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  persistCart();
  updateCartSummary();
  renderCart();
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
    updateCartSummary();
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.foto_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'}" alt="${item.nome}" />
          <div>
            <strong>${item.nome}</strong>
            <div class="cart-item-meta">
              <span>${formatPrice(item.preco_centavos)}</span>
              <div class="qty-controls">
                <button type="button" data-action="decrease" data-product-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-action="increase" data-product-id="${item.id}">+</button>
              </div>
            </div>
          </div>
          <button type="button" class="remove-item" data-action="remove" data-product-id="${item.id}">Remove</button>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('[data-action="increase"]').forEach((button) => {
    button.addEventListener('click', () => changeCartQuantity(button.dataset.productId, 1));
  });

  document.querySelectorAll('[data-action="decrease"]').forEach((button) => {
    button.addEventListener('click', () => changeCartQuantity(button.dataset.productId, -1));
  });

  document.querySelectorAll('[data-action="remove"]').forEach((button) => {
    button.addEventListener('click', () => removeFromCart(button.dataset.productId));
  });

  updateCartSummary();
}

function renderProducts() {
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter ?? 'all';
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredProducts = allProducts.filter((product) => {
    const productText = `${product.nome} ${product.descricao || ''}`.toLowerCase();
    const matchesSearch = !searchTerm || productText.includes(searchTerm);
    const matchesFilter = matchesCategory(product, activeFilter);
    return matchesSearch && matchesFilter;
  });

  if (!filteredProducts.length) {
    productsContainer.innerHTML = '<div class="empty-state">No products match your search.</div>';
    return;
  }

  productsContainer.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.foto_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'}" alt="${product.nome}" />
          <div class="product-info">
            <h3 class="product-name">${product.nome}</h3>
            <p class="product-description">${product.descricao || 'Product description available soon.'}</p>
            <div class="product-footer">
              <span class="price">${formatPrice(product.preco_centavos)}</span>
              <div class="product-actions">
                <button class="details-btn" type="button" data-product-id="${product.id}">Details</button>
                <button class="add-cart-btn" type="button" data-add-to-cart="${product.id}">Add to cart</button>
              </div>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.details-btn').forEach((button) => {
    button.addEventListener('click', () => loadProductDetail(button.dataset.productId));
  });

  document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.addToCart));
  });
}

async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Unable to load products');
    }

    allProducts = await response.json();
    renderProducts();
  } catch (error) {
    productsContainer.innerHTML = '<div class="empty-state">Unable to load products. Please check the API.</div>';
    console.error(error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = buildProductPayload(new FormData(form));
  const productId = productIdField.value;

  try {
    const response = await fetch(
      productId ? `${API_URL}/${productId}` : API_URL,
      {
        method: productId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save product');
    }

    resetForm();
    await loadProducts();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
});

modal.addEventListener('click', (event) => {
  if (event.target.matches('[data-close="true"]')) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

cartToggle.addEventListener('click', () => {
  cartPanel.classList.toggle('hidden');
  cartPanel.setAttribute('aria-hidden', String(cartPanel.classList.contains('hidden')));
});

cartClose.addEventListener('click', () => {
  cartPanel.classList.add('hidden');
  cartPanel.setAttribute('aria-hidden', 'true');
});

searchInput.addEventListener('input', renderProducts);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    renderProducts();
  });
});

renderCart();
loadProducts();
