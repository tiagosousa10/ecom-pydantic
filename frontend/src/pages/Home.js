import { state } from '../services/state.js';
import { fetchProducts, sendChatMessage, addToCart } from '../services/api_v2.js';
import { renderHeader } from '../components/Header.js';
import { renderHero } from '../components/Hero.js';
import { renderChatbot } from '../components/Chatbot.js';
import { navigate } from '../router.js';

// Price range options shown in the filter bar
const PRICE_RANGES = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under ₹500',  min: null, max: 500 },
  { label: '₹500–₹1000',  min: 500,  max: 1000 },
  { label: '₹1000–₹2000', min: 1000, max: 2000 },
  { label: '₹2000–₹5000', min: 2000, max: 5000 },
  { label: 'Above ₹5000', min: 5000, max: null },
];

export async function renderHome() {
  const { min, max } = state.priceFilter;
  const data = await fetchProducts(state.currentCategory, min, max);
  state.products = data;

  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    ${renderHero()}
    <div class="products-section">
      <h2 class="section-title">Our Products</h2>

      <!-- Price Range Filter Bar -->
      <div class="price-filter-bar" id="price-filter-container">
        ${PRICE_RANGES.map((r, i) => {
          const isActive = state.priceFilter.min === r.min && state.priceFilter.max === r.max;
          return `<button
            class="price-filter-btn ${isActive ? 'active' : ''}"
            data-min="${r.min ?? ''}"
            data-max="${r.max ?? ''}"
          >${r.label}</button>`;
        }).join('')}
      </div>

      <div class="products-grid">
        ${state.products.length === 0
          ? `<p style="grid-column:1/-1;text-align:center;color:#888;padding:40px">No products found for this filter.</p>`
          : state.products.map(p => `
            <div class="product-card" data-id="${p.id}">
              <div class="product-image">
                ${p.image
                  ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
                  : `<span class="product-placeholder">Product Image</span>`}
              </div>
              <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-footer">
                  <span class="product-price">₹${p.price}</span>
                  <span class="product-category">${p.category}</span>
                </div>
                <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
              </div>
            </div>
          `).join('')}
      </div>
    </div>
    ${renderChatbot()}
  `;

  setupHomeEvents();
}

/** Called by navbar buttons and inline onclick attributes */
window.handleCatClick = async function(cat) {
  state.currentCategory = cat;
  state.priceFilter = { min: null, max: null }; // reset price filter on category change
  renderHome();
};

function setupHomeEvents() {
  // Highlight active nav button
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase() === (state.currentCategory || 'all')) {
      btn.classList.add('active');
    }
  });

  // Price filter buttons
  document.querySelectorAll('#price-filter-container .price-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const min = btn.dataset.min !== '' ? Number(btn.dataset.min) : null;
      const max = btn.dataset.max !== '' ? Number(btn.dataset.max) : null;
      state.priceFilter = { min, max };
      renderHome();
    });
  });

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', async (e) => {
      if (e.target.classList.contains('add-to-cart-btn')) {
        e.stopPropagation();
        
        try {
          const product = state.products.find(p => p.id === card.dataset.id || String(p.id) === card.dataset.id) || { name: 'Unknown Product' };
          e.target.disabled = true;
          e.target.textContent = 'Adding...';
          
          await addToCart(state.sessionId, product.name, 1);
          
          state.cartItemCount++;
          e.target.textContent = 'Added! ✅';
          setTimeout(() => {
            renderHome();
          }, 1000);
        } catch (err) {
          console.error('Failed to add to cart:', err);
          alert('Failed to add to cart.');
          e.target.disabled = false;
          e.target.textContent = 'Add to Cart';
        }
      } else {
        navigate(`#/product/${card.dataset.id}`);
      }
    });
  });

  // Chatbot toggle
  document.getElementById('chatToggle')?.addEventListener('click', () => {
    state.chatOpen = !state.chatOpen;
    renderHome();
  });

  document.getElementById('chatSend')?.addEventListener('click', handleChatSend);
  document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSend();
  });

  document.querySelectorAll('.product-recommendation').forEach(el => {
    el.addEventListener('click', () => navigate(`#/product/${el.dataset.id}`));
  });
}

async function handleChatSend() {
  const input = document.getElementById('chatInput');
  state.chatInput = input.value;
  if (!state.chatInput) return;

  state.chatMessages = [...state.chatMessages, { sender: 'user', text: state.chatInput }];
  state.chatLoading = true;
  renderHome();

  try {
    const data = await sendChatMessage(state.chatInput);
    state.chatMessages = [...state.chatMessages, {
      sender: 'bot',
      type: data.type,
      data: data.data,
      message: data.message
    }];
  } catch (err) {
    console.error(err);
  } finally {
    state.chatLoading = false;
    state.chatInput = '';
    renderHome();
  }
}
