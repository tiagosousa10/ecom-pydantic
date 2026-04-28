import { state } from '../services/state.js';
import { getCart, placeOrder, clearCart, fetchProducts } from '../services/api_v2.js';
import { renderHeader } from '../components/Header.js';

export async function renderCart() {
  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem;">Your Cart</h1>
      <div id="cartContent">
        <p>Loading cart...</p>
      </div>
    </div>
  `;

  try {
    const rawCartItems = await getCart(state.sessionId);
    
    // The cart only saves names/quantities, fetch products to display images/prices
    const productsDB = await fetchProducts(); 
    
    // Map items to rich data
    const cartItems = rawCartItems.map(item => {
      const match = productsDB.find(p => p.name === item.product_name) || {};
      return {
        ...item,
        price: match.price || 0,
        image: match.image || 'https://via.placeholder.com/100x100?text=Item',
        description: match.description || 'No description available',
      };
    });

    const contentDiv = document.getElementById('cartContent');
    
    if (!cartItems.length) {
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
          <h2 style="font-size: 1.5rem; color: #4B5563; margin-bottom: 1rem;">Your cart is empty!</h2>
          <a href="#/" class="btn btn-primary" style="text-decoration: none; display: inline-block;">Continue Shopping</a>
        </div>
      `;
      state.cartItemCount = 0;
      setTimeout(() => renderHeader(), 100); // re-patch header if needed
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    state.cartItemCount = cartItems.length; // sync state

    contentDiv.innerHTML = `
      <div style="background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem;">
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${cartItems.map(item => `
            <div style="display: flex; gap: 1rem; align-items: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 1.5rem;">
              <img src="${item.image}" alt="${item.product_name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 0.5rem;" />
              <div style="flex: 1;">
                <h3 style="font-weight: bold; font-size: 1.1rem; color: #111827;">${item.product_name}</h3>
                <p style="color: #6B7280; font-size: 0.9rem;">Qty: ${item.quantity}</p>
              </div>
              <div style="font-weight: bold; font-size: 1.1rem;">₹${item.price}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 2rem; border-top: 2px dashed #E5E7EB; padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 1.5rem; font-weight: bold;">Total Due:</h2>
          <span style="font-size: 1.5rem; font-weight: bold; color: #111827;">₹${total}</span>
        </div>
        
        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
          <a href="#/" class="btn btn-outline" style="flex: 1; text-align: center; text-decoration: none;">Keep Shopping</a>
          <button id="clearCartBtn" class="btn btn-outline" style="flex: 1; color: #DC2626; border-color: #DC2626; font-size: 1.1rem;">Clear Cart 🗑️</button>
          <button id="buyAllBtn" class="btn btn-primary" style="flex: 2; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <span>Buy All Now</span>
            <span>🚀</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('clearCartBtn')?.addEventListener('click', async (e) => {
      if (!confirm('Are you sure you want to clear your cart?')) return;
      
      const btn = e.target.closest('button');
      btn.disabled = true;
      btn.innerHTML = 'Clearing... ⏳';
      
      try {
        await clearCart(state.sessionId);
        state.cartItemCount = 0;
        
        // Re-render the cart right away
        renderCart();
      } catch (err) {
        alert('Failed to clear cart.');
        btn.disabled = false;
        btn.innerHTML = 'Clear Cart 🗑️';
      }
    });

    document.getElementById('buyAllBtn')?.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      btn.disabled = true;
      btn.innerHTML = `<span>Processing... ⏳</span>`;
      
      try {
        // Place individual orders for every item in the cart
        const promises = cartItems.map(item => placeOrder(state.sessionId, item.product_name, item.quantity));
        await Promise.all(promises);
        
        // Wipe the cart
        await clearCart(state.sessionId);
        
        // Reset state
        state.cartItemCount = 0;
        
        btn.innerHTML = `<span>Order Successful! 🎉</span>`;
        btn.style.backgroundColor = '#16a34a'; // tailwind green-600
        btn.style.color = 'white';
        
        setTimeout(() => {
          window.location.hash = '#/';
        }, 2000);
        
      } catch(err) {
        alert('Failed to process bulk order.');
        btn.disabled = false;
        btn.innerHTML = `<span>Buy All Now 🚀</span>`;
      }
    });

  } catch(err) {
    document.getElementById('cartContent').innerHTML = `
      <div style="color: red; text-align: center; padding: 2rem;">Error loading cart. Please try again.</div>
    `;
  }
}
