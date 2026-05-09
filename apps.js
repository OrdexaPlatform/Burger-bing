// ======================== app.js (المنطق العام للمنيو والسلة) ========================
// تهيئة البيانات الأولية
function initData() {
    if(!localStorage.getItem('products')) {
        const sampleProducts = [
            { id: 'p1', name: 'برجر كلاسيك', description: 'لحم بقري طازج، خس، طماطم، صوص خاص', price: 55, category: 'برجر', image: 'https://picsum.photos/200/150?random=10', rating: 4.5, offer: false, timesOrdered: 12 },
            { id: 'p2', name: 'برجر دبل تشيز', description: 'شريحتان لحم، جبن شيدر مضاعف', price: 85, category: 'برجر', image: 'https://picsum.photos/200/150?random=11', rating: 4.8, offer: true, timesOrdered: 25 },
            { id: 'p3', name: 'ساندوتش فراخ', description: 'صدور دجاج مشوية، خضار', price: 45, category: 'ساندوتشات', image: 'https://picsum.photos/200/150?random=12', rating: 4.2, offer: false, timesOrdered: 18 },
            { id: 'p4', name: 'وجبة عائلة', description: '4 برجر + 4 بطاطس + 4 مشروبات', price: 220, category: 'وجبات', image: 'https://picsum.photos/200/150?random=13', rating: 4.9, offer: true, timesOrdered: 30 },
            { id: 'p5', name: 'بطاطس حارة', description: 'بطاطس مقلية بتتبيلة حارة', price: 20, category: 'بطاطس', image: 'https://picsum.photos/200/150?random=14', rating: 4.3, offer: false, timesOrdered: 45 },
            { id: 'p6', name: 'صوص ثوم', description: 'صوص ثوم كريمي', price: 10, category: 'صوصات', image: 'https://picsum.photos/200/150?random=15', rating: 4.7, offer: false, timesOrdered: 60 },
            { id: 'p7', name: 'كوكاكولا', description: 'مشروب غازي', price: 12, category: 'مشروبات', image: 'https://picsum.photos/200/150?random=16', rating: 4.5, offer: false, timesOrdered: 100 },
            { id: 'p8', name: 'تشيز كيك', description: 'حلوى لذيذة', price: 35, category: 'حلويات', image: 'https://picsum.photos/200/150?random=17', rating: 4.6, offer: false, timesOrdered: 22 }
        ];
        localStorage.setItem('products', JSON.stringify(sampleProducts));
    }
    if(!localStorage.getItem('categories')) {
        const cats = ['البرجر', 'الساندوتشات', 'الوجبات', 'المقبلات', 'البطاطس', 'المشروبات', 'الصوصات', 'الحلويات'];
        localStorage.setItem('categories', JSON.stringify(cats));
    }
    if(!localStorage.getItem('cart')) localStorage.setItem('cart', JSON.stringify([]));
    if(!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));
    if(!localStorage.getItem('settings')) {
        const settings = {
            restaurantName: 'Burger Bing',
            logo: 'https://via.placeholder.com/40?text=BB',
            primaryColor: '#ff6b00',
            adminUser: 'admin',
            adminPass: '200300'
        };
        localStorage.setItem('settings', JSON.stringify(settings));
    }
    if(!localStorage.getItem('governorates')) {
        const govs = {
            'القاهرة': { cities: { 'مدينة نصر': 20, 'وسط البلد': 15, 'مصر الجديدة': 25 }, defaultShipping: 20 },
            'الإسكندرية': { cities: { 'المنتزة': 30, 'وسط': 25 }, defaultShipping: 25 }
        };
        localStorage.setItem('governorates', JSON.stringify(govs));
    }
    if(!localStorage.getItem('coupons')) {
        localStorage.setItem('coupons', JSON.stringify({ 'WELCOME10': 10, 'BURGER20': 20 }));
    }
}
initData();

// تحديث عداد السلة
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('#cart-badge, #mobile-cart-badge, #floating-cart-count');
    badges.forEach(b => { if(b) b.innerText = total; });
}
window.updateCartBadge = updateCartBadge;

// إضافة منتج للسلة
window.addToCart = function(productId, productName, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === productId);
    if(existing) existing.quantity += 1;
    else cart.push({ id: productId, name: productName, price, image, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showToast(`تم إضافة ${productName} إلى السلة`);
};

// Toast
function showToast(msg) {
    let toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
window.showToast = showToast;

// عرض المنيو في index.html
function renderMenu() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const activeCat = document.getElementById('categoriesFilter')?.dataset.activeCat || 'الكل';
    let filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    if(activeCat !== 'الكل') filtered = filtered.filter(p => p.category === activeCat);
    
    // تجميع حسب الفئة
    const grouped = {};
    filtered.forEach(p => { if(!grouped[p.category]) grouped[p.category] = []; grouped[p.category].push(p); });
    const container = document.getElementById('productsContainer');
    if(container) {
        container.innerHTML = '';
        for(let cat in grouped) {
            let section = `<h2 class="category-title">${cat}</h2><div class="products-grid">`;
            grouped[cat].forEach(p => {
                section += `
                    <div class="product-card">
                        <img src="${p.image}" class="product-img">
                        <h3>${p.name} ${p.offer ? '<span class="badge-offer">عرض</span>' : ''}</h3>
                        <p>${p.description}</p>
                        <div class="rating">${'★'.repeat(Math.floor(p.rating))}${p.rating % 1 ? '½' : ''}</div>
                        <div class="price">${p.price} ج.م</div>
                        <div class="quantity-controls">
                            <button onclick="addToCart('${p.id}','${p.name}',${p.price},'${p.image}')">أضف للسلة</button>
                        </div>
                    </div>
                `;
            });
            section += `</div>`;
            container.innerHTML += section;
        }
    }
    // عرض الأكثر طلباً
    const topProducts = [...products].sort((a,b)=>b.timesOrdered - a.timesOrdered).slice(0,4);
    const topGrid = document.getElementById('topProductsGrid');
    if(topGrid) {
        topGrid.innerHTML = topProducts.map(p => `<div class="product-card"><img src="${p.image}"><h3>${p.name}</h3><div>${p.price} ج.م</div></div>`).join('');
    }
}
window.renderMenu = renderMenu;

// فلتر وسيرش
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    if(document.getElementById('productsContainer')) {
        // تحميل الأقسام
        const cats = JSON.parse(localStorage.getItem('categories')) || [];
        const filterDiv = document.getElementById('categoriesFilter');
        if(filterDiv) {
            filterDiv.innerHTML = `<button class="cat-filter active" data-cat="الكل">الكل</button>` + cats.map(c => `<button class="cat-filter" data-cat="${c}">${c}</button>`).join('');
            filterDiv.querySelectorAll('.cat-filter').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    filterDiv.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filterDiv.dataset.activeCat = btn.dataset.cat;
                    renderMenu();
                });
            });
            filterDiv.dataset.activeCat = 'الكل';
        }
        document.getElementById('searchInput')?.addEventListener('input', () => renderMenu());
        renderMenu();
        // سلايدر
        let slideIndex = 0;
        const slides = document.querySelectorAll('.slide');
        if(slides.length) {
            const slider = document.querySelector('.slider');
            function showSlide() { if(slider) slider.style.transform = `translateX(-${slideIndex * 100}%)`; }
            document.getElementById('nextSlide')?.addEventListener('click', () => { slideIndex = (slideIndex + 1) % slides.length; showSlide(); });
            document.getElementById('prevSlide')?.addEventListener('click', () => { slideIndex = (slideIndex - 1 + slides.length) % slides.length; showSlide(); });
            setInterval(() => { slideIndex = (slideIndex + 1) % slides.length; showSlide(); }, 5000);
        }
    }
    // منطق السلة
    if(document.querySelector('.cart-page')) {
        initCartPage();
    }
    // إعدادات المطعم
    const settings = JSON.parse(localStorage.getItem('settings'));
    if(settings) {
        document.getElementById('site-name')?.innerText = settings.restaurantName;
        document.getElementById('cart-site-name')?.innerText = settings.restaurantName;
        document.getElementById('logo-img')?.setAttribute('src', settings.logo);
        document.getElementById('cart-logo-img')?.setAttribute('src', settings.logo);
    }
});

// دوال cart صفحة
window.initCartPage = function() {
    updateCartBadge();
    renderCartItems();
    loadGovernorates();
    document.getElementById('backToMenu')?.addEventListener('click', () => window.location.href='index.html');
    document.getElementById('applyCoupon')?.addEventListener('click', applyCoupon);
    document.getElementById('checkoutBtn')?.addEventListener('click', checkout);
    document.getElementById('governorateSelect')?.addEventListener('change', updateCities);
};
function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items-container');
    if(!container) return;
    if(cart.length === 0) { container.innerHTML = '<div class="empty-cart">سلة التسوق فارغة <a href="index.html">تسوق الآن</a></div>'; updateSummary(); return; }
    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}">
            <div><strong>${item.name}</strong><br>${item.price} ج.م</div>
            <div><button onclick="changeQty('${item.id}', -1)">-</button> <span>${item.quantity}</span> <button onclick="changeQty('${item.id}', 1)">+</button></div>
            <button onclick="removeCartItem('${item.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
    updateSummary();
}
window.changeQty = function(id, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let idx = cart.findIndex(i => i.id === id);
    if(idx !== -1) {
        cart[idx].quantity += delta;
        if(cart[idx].quantity <= 0) cart.splice(idx,1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartBadge();
    }
};
window.removeCartItem = function(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartBadge();
};
function updateSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = cart.reduce((sum,i)=> sum + (i.price * i.quantity),0);
    let tax = subtotal * 0.14;
    let governorate = document.getElementById('governorateSelect')?.value;
    let city = document.getElementById('citySelect')?.value;
    let shippingCost = 0;
    if(governorate && city) {
        const govs = JSON.parse(localStorage.getItem('governorates')) || {};
        if(govs[governorate] && govs[governorate].cities[city]) shippingCost = govs[governorate].cities[city];
        else shippingCost = govs[governorate]?.defaultShipping || 20;
    }
    let couponDiscount = window.appliedDiscount || 0;
    let total = subtotal + tax + shippingCost - couponDiscount;
    document.getElementById('subtotal').innerText = subtotal;
    document.getElementById('tax').innerText = tax.toFixed(2);
    document.getElementById('shipping').innerText = shippingCost;
    document.getElementById('discount').innerText = couponDiscount;
    document.getElementById('total').innerText = total.toFixed(2);
}
function loadGovernorates() {
    const govs = JSON.parse(localStorage.getItem('governorates')) || {};
    const select = document.getElementById('governorateSelect');
    if(select) {
        select.innerHTML = '<option value="">اختر المحافظة</option>' + Object.keys(govs).map(g => `<option value="${g}">${g}</option>`).join('');
        select.addEventListener('change', updateCities);
    }
}
function updateCities() {
    const gov = document.getElementById('governorateSelect').value;
    const citySelect = document.getElementById('citySelect');
    if(!gov) { citySelect.innerHTML = '<option>اختر المدينة أولاً</option>'; updateSummary(); return; }
    const govs = JSON.parse(localStorage.getItem('governorates')) || {};
    const cities = govs[gov]?.cities || {};
    citySelect.innerHTML = '<option value="">اختر المدينة</option>' + Object.keys(cities).map(c => `<option value="${c}">${c}</option>`).join('');
    citySelect.addEventListener('change', updateSummary);
}
let appliedDiscount = 0;
function applyCoupon() {
    const code = document.getElementById('couponCode').value;
    const coupons = JSON.parse(localStorage.getItem('coupons')) || {};
    if(coupons[code]) {
        appliedDiscount = coupons[code];
        window.appliedDiscount = appliedDiscount;
        updateSummary();
        document.getElementById('couponMsg').innerText = 'تم تطبيق الخصم';
    } else { document.getElementById('couponMsg').innerText = 'كود غير صالح'; appliedDiscount=0; updateSummary();}
}
function checkout() {
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    if(!name || !phone) { showToast('يرجى إدخال الاسم والهاتف'); return; }
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if(cart.length === 0) { showToast('السلة فارغة'); return; }
    const subtotal = cart.reduce((s,i)=>s+i.price*i.quantity,0);
    const tax = subtotal*0.14;
    const shipping = parseInt(document.getElementById('shipping').innerText) || 0;
    const total = parseFloat(document.getElementById('total').innerText);
    const order = {
        id: 'ORD' + Date.now(),
        customer: { name, phone, address: document.getElementById('custAddress').value, notes: document.getElementById('custNotes').value },
        items: cart,
        subtotal, tax, shipping, total,
        governorate: document.getElementById('governorateSelect').value,
        city: document.getElementById('citySelect').value,
        status: 'جديد',
        date: new Date().toISOString()
    };
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartBadge();
    showToast(`تم إتمام الطلب بنجاح، رقم الطلب: ${order.id}`);
    setTimeout(()=> window.location.href='index.html', 2000);
          }
