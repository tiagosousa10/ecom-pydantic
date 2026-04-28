import { state } from '../services/state.js';
import { fetchProducts, addToCart, placeOrder } from '../services/api_v2.js';
import { renderHeader } from '../components/Header.js';

export async function renderProductDetail(id) {
  const data = await fetchProducts();
  const product = data.find(p => p.id === id);
  
  if (!product) {
    document.getElementById('app').innerHTML = `
      ${renderHeader()}
      <div class="loading">Loading...</div>
    `;
    return;
  }
  
  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <div class="product-detail">
      <button class="back-btn" id="backBtn">← Back to Products</button>
      <div class="product-detail-grid">
        <div class="product-detail-image">
          <img src="${product.image || 'https://via.placeholder.com/500x500?text=Product+Image'}" alt="${product.name}" />
        </div>
        <div class="product-detail-info">
          <span class="product-detail-category">${product.category}</span>
          <h1>${product.name}</h1>
          <p class="product-detail-price">₹${product.price}</p>
          <p class="product-detail-desc">${product.description}</p>
          ${product.size && product.size.length > 0 ? `
            <div class="option-group">
              <h3 class="option-label">Sizes:</h3>
              <div class="option-values">
                ${product.size.map(s => `<span class="option-value">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${product.color && product.color.length > 0 ? `
            <div class="option-group">
              <h3 class="option-label">Colors:</h3>
              <div class="option-values">
                ${product.color.map(c => `<span class="option-value">${c}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          <div class="detail-actions">
            <button class="detail-btn detail-btn-primary" id="btnAddToCart">Add to Cart</button>
            <button class="detail-btn detail-btn-secondary" id="btnBuyNow">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('backBtn')?.addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('btnAddToCart')?.addEventListener('click', async (e) => {
    try {
      e.target.disabled = true;
      e.target.textContent = 'Adding...';
      
      await addToCart(state.sessionId, product.name, 1);
      
      state.cartItemCount++;
      e.target.textContent = 'Added! ✅';
      setTimeout(() => {
        e.target.textContent = 'Add to Cart';
        e.target.disabled = false;
        // Optionally update header to reflect new cart count
        const app = document.getElementById('app');
        if(app) renderProductDetail(id);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to add to cart');
      e.target.disabled = false;
      e.target.textContent = 'Add to Cart';
    }
  });

  document.getElementById('btnBuyNow')?.addEventListener('click', async (e) => {
    try {
      e.target.disabled = true;
      e.target.textContent = 'Processing...';
      
      await placeOrder(state.sessionId, product.name, 1);
      
      e.target.textContent = 'Order Placed! 🚀';
      setTimeout(() => {
        window.location.hash = '#/';
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to place order');
      e.target.disabled = false;
      e.target.textContent = 'Buy Now';
    }
  });
}
