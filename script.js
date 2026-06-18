// Product Data Array (Simulated database - kept for reference)
const products = [
    { id: 1, name: "Handmade Soap", price: 120, image: "images/soap.jpg", description: "Natural aloe vera and coconut oil handmade soap." },
    { id: 3, name: "Local Coffee", price: 350, image: "images/coffee.jpg", description: "Freshly roasted beans sourced locally." },
    { id: 4, name: "Homemade Pickles", price: 180, image: "images/pickles.jpg", description: "Traditional homemade spicy pickles." },
    { id: 5, name: "Clay Pots", price: 300, image: "images/claypots.jpg", description: "Beautiful handcrafted clay pots." },
    { id: 6, name: "Herbal Tea", price: 220, image: "images/tea.jpg", description: "Soothing herbal tea blend for relaxation." },
    { id: 7, name: "Handmade Candles", price: 150, image: "images/candles.jpg", description: "Scented candles made with natural wax." },
    { id: 8, name: "Organic Spices Pack", price: 280, image: "images/spices.jpg", description: "Locally grown organic spices pack." }
];

// --- CART MANAGEMENT UTILITIES ---

function getCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

function updateCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// --- FEATURE: ORDER SUCCESS LOGIC ---

function handleCheckout() {
    const userEmail = localStorage.getItem('userEmail') || 'Valued Customer';
    
    // 1. Clear the Cart Data
    localStorage.removeItem('cart');
    
    // 2. Hide the Summary Card
    const summaryCard = document.querySelector('.order-summary-card');
    if (summaryCard) {
        summaryCard.style.display = 'none';
    }
    
    // 3. Display Order Confirmation Message
    const container = document.getElementById('cart-items-container');
    if (container) {
        container.innerHTML = `
            <div class="order-success-message">
                <h2>🎉 Order Placed Successfully!</h2>
                <p>Thank you for your purchase, **${userEmail}**.</p>
                <p>Your items will be shipped shortly.</p>
                <a href="products.html" class="btn">Continue Shopping</a>
            </div>
        `;
    }
    
    // Update the header count (if one were implemented)
    // The cart will be empty on the next page load.
}

// Helper to get item count before clearing cart (simulated, needs the cart items for real count)
function getCartItemCount() {
    const cart = getCart();
    // This function is for display purposes *before* the cart is cleared
    return cart.length; 
}


// --- FEATURE 1: ADD TO CART WITH LOGIN GATE ---

function handleAddToCart(productId, quantity = 0) {
    if (!isUserLoggedIn()) {
        alert("🔒 Please log in to add items to your cart.");
        window.location.href = 'login.html';
        return;
    }
    
    if (quantity <= 0 || isNaN(quantity)) {
         alert("Please select a quantity greater than zero to add to cart.");
         return;
    }

    const id = parseInt(productId); 
    const product = products.find(p => p.id === id);
    let cart = getCart();
    const existingItem = cart.find(item => item.id === id); 

    if (existingItem) {
        existingItem.quantity += quantity;
    } else if (product) {
        cart.push({ id: id, quantity: quantity, ...product });
    }

    updateCart(cart);
    alert(`✅ Added to Cart: ${quantity} x ${product.name}`);
}

// --- FEATURE 3: CART PAGE LOGIC ---

function handleCartQuantityChange(productId, delta) {
    const id = parseInt(productId); 
    let cart = getCart();
    const item = cart.find(i => i.id === id);

    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    updateCart(cart);
    renderCart(); 
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const summaryCard = document.querySelector('.order-summary-card');
    if (!container || !summaryCard) return; 

    const cart = getCart();
    let subtotal = 0;
    const shipping = cart.length > 0 ? 50 : 0;
    let totalItems = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Your cart is empty. Start shopping!</p>';
        summaryCard.style.display = 'none'; // Hide summary if empty
    } else {
        summaryCard.style.display = 'block'; // Show summary if items exist
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) checkoutBtn.disabled = false;
        
        container.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            totalItems += item.quantity;

            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p class="item-price-per">₹${item.price} per unit</p>
                    </div>
                    <div class="item-quantity-control">
                        <button class="btn-qty cart-minus" data-product-id="${item.id}">-</button>
                        <input type="number" class="input-qty" value="${item.quantity}" readonly>
                        <button class="btn-qty cart-plus" data-product-id="${item.id}">+</button>
                    </div>
                    <div class="item-total">
                        <p>₹${itemTotal}</p>
                    </div>
                    <button class="remove-item-btn" data-product-id="${item.id}">&#x2715;</button>
                </div>
            `;
        }).join('');

        // Update Summary Card
        document.getElementById('total-items-count').textContent = totalItems;
        document.getElementById('summary-subtotal').textContent = `₹${subtotal}`;
        document.getElementById('summary-grand-total').textContent = `₹${subtotal + shipping}`;
        
        // Add event listeners for cart buttons
        container.querySelectorAll('.cart-plus').forEach(btn => {
            btn.addEventListener('click', (e) => handleCartQuantityChange(e.target.dataset.productId, 1));
        });
        container.querySelectorAll('.cart-minus').forEach(btn => {
            btn.addEventListener('click', (e) => handleCartQuantityChange(e.target.dataset.productId, -1));
        });
        container.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleCartQuantityChange(e.target.dataset.productId, -1000));
        });
        
        // Bind Checkout button
        document.querySelector('.checkout-btn').addEventListener('click', handleCheckout);
    }
}


/**
 * -------------------------------------------
 * GLOBAL PAGE INITIALIZATION AND EVENT LISTENERS
 * -------------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
    // Global: Set up the Logout function and update Header link (same as previous)
    const authLink = document.getElementById('auth-link');
    if (isUserLoggedIn() && authLink) {
        authLink.textContent = 'Logout';
        authLink.href = '#'; 
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('cart');
            alert('You have been logged out.');
            window.location.reload();
        });
    }

    // Product Page Logic (PRODUCTS.html) - Render products and attach listeners (same as previous)
    const productContainer = document.getElementById("product-list");
    if (productContainer) {
        // ... (Product rendering and quantity controls go here) ...
        productContainer.innerHTML = "";
        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p class="product-description">${p.description}</p>
                <p class="product-price">₹${p.price}</p>
                
                <div class="quantity-control-group">
                    <button type="button" class="btn-qty quantity-minus" data-product-id="${p.id}">-</button>
                    <input type="number" 
                           class="input-qty product-quantity" 
                           id="quantity-${p.id}" 
                           value="0" 
                           min="0" 
                           max="99" 
                           readonly>
                    <button type="button" class="btn-qty quantity-plus" data-product-id="${p.id}">+</button>
                </div>
                
                <button class="btn add-to-cart-final" data-product-id="${p.id}">Add to Cart</button>
            `;
            productContainer.appendChild(card);
        });

        // Setup Event Listeners for Plus, Minus, and Add to Cart
        document.querySelectorAll('.quantity-plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-product-id');
                const inputField = document.getElementById(`quantity-${productId}`);
                let currentVal = parseInt(inputField.value);
                if (currentVal < 99) {
                    inputField.value = currentVal + 1;
                }
            });
        });

        document.querySelectorAll('.quantity-minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-product-id');
                const inputField = document.getElementById(`quantity-${productId}`);
                let currentVal = parseInt(inputField.value);
                
                if (currentVal > 0) {
                    inputField.value = currentVal - 1;
                }
            });
        });

        document.querySelectorAll('.add-to-cart-final').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-product-id');
                const inputField = document.getElementById(`quantity-${productId}`);
                const quantity = parseInt(inputField.value);

                handleAddToCart(productId, quantity);
            });
        });
    }

    // Cart Page Logic (CART.html)
    if (document.getElementById("cart-items-container")) {
        renderCart(); 
    }
});