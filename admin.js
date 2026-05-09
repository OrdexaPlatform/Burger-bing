// admin.js
let currentAdmin = false;
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    if(loginBtn) loginBtn.onclick = () => {
        const user = document.getElementById('adminUsername').value;
        const pass = document.getElementById('adminPassword').value;
        const settings = JSON.parse(localStorage.getItem('settings'));
        if(user === settings.adminUser && pass === settings.adminPass) {
            currentAdmin = true;
            sessionStorage.setItem('adminLogged', 'true');
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            loadAdminDashboard();
        } else { document.getElementById('loginError').innerText = 'بيانات دخول خاطئة'; }
    };
    if(sessionStorage.getItem('adminLogged')) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadAdminDashboard();
    }
    document.getElementById('logoutBtn')?.addEventListener('click', () => { sessionStorage.removeItem('adminLogged'); location.reload(); });
});
function loadAdminDashboard() {
    loadProductsTab();
    loadCategoriesTab();
    loadOrdersTab();
    loadLocationsTab();
    loadStatsTab();
    loadSettingsTab();
    loadBackupTab();
    loadExportsTab();
    setupTabs();
}
function setupTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(`tab${btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)}`).classList.add('active');
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });
}
function loadProductsTab() {
    const container = document.getElementById('tabProducts');
    let products = JSON.parse(localStorage.getItem('products')) || [];
    container.innerHTML = `
        <div class="admin-card"><h3>إضافة منتج جديد</h3>
        <input id="newProdName" placeholder="الاسم"><input id="newProdPrice" placeholder="السعر"><input id="newProdCat" placeholder="القسم"><textarea id="newProdDesc"></textarea>
        <input type="file" id="newProdImage" accept="image/*"><button id="addProductBtn">إضافة</button></div>
        <div class="products-table"><table><tr><th>الصورة</th><th>الاسم</th><th>السعر</th><th>القسم</th><th>تعديل/حذف</th></tr>
        ${products.map(p => `<tr><td><img src="${p.image}" width="40"></td><td>${p.name}</td><td><input type="number" id="price-${p.id}" value="${p.price}"></td><td>${p.category}</td><td><button onclick="updateProductPrice('${p.id}')">تحديث</button> <button onclick="deleteProduct('${p.id}')">حذف</button></td></tr>`).join('')}
        </table></div>
    `;
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        const name = document.getElementById('newProdName').value;
        const price = parseFloat(document.getElementById('newProdPrice').value);
        const category = document.getElementById('newProdCat').value;
        const desc = document.getElementById('newProdDesc').value;
        const file = document.getElementById('newProdImage').files[0];
        if(!name || !price) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const newProd = { id: Date.now().toString(), name, price, category, description: desc, image: e.target.result, rating: 4, offer: false, timesOrdered: 0 };
            let prods = JSON.parse(localStorage.getItem('products')) || [];
            prods.push(newProd);
            localStorage.setItem('products', JSON.stringify(prods));
            loadProductsTab();
            showToast('تمت الإضافة');
        };
        if(file) reader.readAsDataURL(file); else reader.onload({ target: { result: 'https://picsum.photos/200/150' } });
    });
}
window.updateProductPrice = function(id) {
    let prods = JSON.parse(localStorage.getItem('products'));
    const newPrice = parseFloat(document.getElementById(`price-${id}`).value);
    let prod = prods.find(p=>p.id===id);
    if(prod) prod.price = newPrice;
    localStorage.setItem('products', JSON.stringify(prods));
    showToast('تم تعديل السعر');
};
window.deleteProduct = function(id) {
    let prods = JSON.parse(localStorage.getItem('products')).filter(p=>p.id!==id);
    localStorage.setItem('products', JSON.stringify(prods));
    loadProductsTab();
};
function loadCategoriesTab() { /* مشابه: عرض الأقسام وإضافة وحذف */ }
function loadOrdersTab() { /* عرض الطلبات مع تغيير الحالة */ }
function loadLocationsTab() { /* إدارة المحافظات والمدن */ }
function loadStatsTab() { /* إحصائيات */ }
function loadSettingsTab() { /* تغيير اسم المطعم، الشعار، ألوان، كلمات مرور */ }
function loadBackupTab() { /* تصدير / استيراد JSON */ }
function loadExportsTab() { /* تصدير الطلبات CSV */ }
function showToast(msg) { /* نفس الدالة */ }
