// Use relative paths since the frontend is served directly by the backend!
export const API_BASE = ""; 

/**
 * Fetch products, optionally filtering by category and/or price range.
 */
export async function fetchProducts(category = '', minPrice = null, maxPrice = null) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (minPrice !== null) params.set('min_price', minPrice);
  if (maxPrice !== null) params.set('max_price', maxPrice);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/products${query}`);
  return await res.json();
}

/**
 * Generate 500 demo products instantaneously via the backend Python script.
 */
export async function bulkGenerateProducts() {
  const res = await fetch(`${API_BASE}/products/bulk-generate-500`, {
    method: 'POST'
  });
  return await res.json();
}

/**
 * Add a new product to the database (requires FormData for image handling).
 */
export async function addProduct(formData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    body: formData
  });
  return await res.json();
}

/**
 * Update an existing product by its ID.
 */
export async function updateProduct(id, body, isFormData = false) {
  const options = {
    method: 'PUT',
    body: isFormData ? body : JSON.stringify(body)
  };
  if (!isFormData) {
    options.headers = { 'Content-Type': 'application/json' };
  }
  const res = await fetch(`${API_BASE}/products/${id}`, options);
  return await res.json();
}

/**
 * Delete a product by its ID.
 */
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  return await res.json();
}

/**
 * Delete all products from the database.
 */
export async function deleteAllProducts() {
  const res = await fetch(`${API_BASE}/products`, { method: 'DELETE' });
  return await res.json();
}

/**
 * Send a message to the AI Chatbot and await its semantic response.
 */
export async function sendChatMessage(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}

/**
 * Add an item to the shopping cart.
 */
export async function addToCart(userEmail, productName, quantity = 1) {
  const res = await fetch(`${API_BASE}/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, product_name: productName, quantity })
  });
  return await res.json();
}

/**
 * Place a new order directly.
 */
export async function placeOrder(userEmail, productName, quantity = 1) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, product_name: productName, quantity })
  });
  return await res.json();
}

/**
 * Fetch all items in the user's cart.
 */
export async function getCart(userEmail) {
  const res = await fetch(`${API_BASE}/cart/${userEmail}`);
  return await res.json();
}

/**
 * Clear the user's cart completely.
 */
export async function clearCart(userEmail) {
  const res = await fetch(`${API_BASE}/cart/${userEmail}`, { method: 'DELETE' });
  return await res.json();
}
