import { renderHome } from './pages/Home.js';
import { renderAdmin } from './pages/Admin.js';
import { renderProductDetail } from './pages/ProductDetail.js';
import { renderCart } from './pages/Cart.js';

export function navigate(path) {
  window.location.hash = path;
}

export function router() {
  const hash = window.location.hash || '#/';
  const path = hash.slice(1);
  
  if (path === '/add-products' || path === '/admin') {
    renderAdmin();
  } else if (path === '/cart') {
    renderCart();
  } else if (path.startsWith('/product/')) {
    const id = path.split('/')[2];
    renderProductDetail(id);
  } else {
    renderHome();
  }
}
