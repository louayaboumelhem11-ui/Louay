LS_API.init();
const cfgKey = LS_API.LS.config;

const loginBox = document.getElementById("login");
const panel = document.getElementById("panel");
const pw = document.getElementById("pw");
const btnLogin = document.getElementById("btnLogin");

function isAuthed(){
  const a = LS_API.load(LS_API.LS.admin, {authed:false, at:0});
  if(!a.authed) return false;
  return (Date.now() - a.at) < 12*60*60*1000;
}
function setAuthed(v){
  LS_API.save(LS_API.LS.admin, {authed:v, at: Date.now()});
}

function showAuthed(){
  loginBox.style.display = "none";
  panel.style.display = "block";
  renderAll();
}
function showLogin(){
  loginBox.style.display = "block";
  panel.style.display = "none";
}

btnLogin.addEventListener("click", ()=>{
  const cfg = LS_API.load(cfgKey, null);
  const pass = (pw.value||"").trim();
  if(pass && cfg && pass === cfg.adminPassword){
    setAuthed(true);
    showAuthed();
  }else{
    alert("Wrong password");
  }
});

document.getElementById("logout").addEventListener("click", ()=>{
  setAuthed(false);
  location.reload();
});

document.querySelectorAll("[data-tab]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll("[data-tab]").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.getAttribute("data-tab");
    ["products","stock","orders","settings"].forEach(t=>{
      document.getElementById("tab-"+t).style.display = (t===tab) ? "block":"none";
    });
    renderAll();
  });
});

function renderAll(){
  const active = document.querySelector("[data-tab].active").getAttribute("data-tab");
  if(active==="products") renderProducts();
  if(active==="stock") renderStock();
  if(active==="orders") renderOrders();
  if(active==="settings") renderSettings();
}

function renderProducts(){
  const el = document.getElementById("tab-products");
  const products = LS_API.load(LS_API.LS.products, []);
  el.innerHTML = `
    <div class="card">
      <div class="h2">Products</div>
      <div class="small">Add / edit products. Stock count is automatic from codes.</div>
      <div class="form" style="margin-top:10px">
        <div>
          <div class="small">Name</div>
          <input class="input" id="pName" placeholder="PSN Account"/>
        </div>
        <div>
          <div class="small">Section</div>
          <select class="input" id="pSec">
            <option value="gaming">Gaming</option>
            <option value="full">FULL ACCESS</option>
          </select>
        </div>
        <div>
          <div class="small">Unit price (USD)</div>
          <input class="input" id="pPrice" type="number" step="0.01" value="1"/>
        </div>
        <div>
          <div class="small">Icon</div>
          <select class="input" id="pIcon">
            <option value="assets/psn.svg">PSN</option>
            <option value="assets/epic.svg">EPIC</option>
            <option value="assets/full.svg">FULL</option>
            <option value="assets/insta.svg">INSTA</option>
          </select>
        </div>
        <div class="full">
          <button class="btn" id="addP">Add Product</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="h2">Current products</div>
      <table class="table">
        <thead><tr><th>ID</th><th>Name</th><th>Section</th><th>Price</th><th>Stock</th><th></th></tr></thead>
        <tbody id="pRows"></tbody>
      </table>
    </div>
  `;

  document.getElementById("addP").addEventListener("click", ()=>{
    const name = (document.getElementById("pName").value||"").trim();
    const sec = document.getElementById("pSec").value;
    const price = parseFloat(document.getElementById("pPrice").value||"1");
    const icon = document.getElementById("pIcon").value;
    if(!name) return alert("Name required");
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,18) || ("p-"+Math.random().toString(16).slice(2,8));
    products.unshift({id, name, section: sec, unitPrice: isFinite(price)?price:1, icon, badge: ""});
    LS_API.save(LS_API.LS.products, products);
    renderProducts();
  });

  const rows = document.getElementById("pRows");
  products.forEach(p=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="kbd">${p.id}</td>
      <td>${p.name}</td>
      <td>${p.section}</td>
      <td>$${LS_API.money(p.unitPrice)}</td>
      <td>${LS_API.countStock(p.id)}</td>
      <td><button class="copy" data-del="${p.id}">Delete</button></td>
    `;
    rows.appendChild(tr);
  });

  rows.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-del]");
    if(!b) return;
    const id = b.getAttribute("data-del");
    if(!confirm("Delete product?")) return;
    const next = products.filter(x=>x.id!==id);
    LS_API.save(LS_API.LS.products, next);
    renderProducts();
  });
}

function renderStock(){
  const el = document.getElementById("tab-stock");
  const products = LS_API.load(LS_API.LS.products, []);
  const opts = products.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
  el.innerHTML = `
    <div class="card">
      <div class="h2">Stock codes</div>
      <div class="small">Paste codes (one per line). System counts available codes automatically.</div>
      <div class="form" style="margin-top:10px">
        <div class="full">
          <div class="small">Product</div>
          <select class="input" id="sProd">${opts}</select>
        </div>
        <div class="full">
          <div class="small">Codes (each line = one code)</div>
          <textarea class="input kbd" id="sCodes" placeholder="email:pass&#10;email:pass"></textarea>
        </div>
        <div class="full">
          <button class="btn" id="addS">Add Stock</button>
        </div>
      </div>
      <div class="notice" id="sInfo"></div>
    </div>
  `;

  const sProd = document.getElementById("sProd");
  const sInfo = document.getElementById("sInfo");

  function updateInfo(){
    if(!products.length){ sInfo.textContent = "No products."; return; }
    const pid = sProd.value;
    sInfo.innerHTML = `Available: <b>${LS_API.countStock(pid)}</b> codes`;
  }
  sProd.addEventListener("change", updateInfo);

  document.getElementById("addS").addEventListener("click", ()=>{
    const pid = sProd.value;
    const raw = document.getElementById("sCodes").value || "";
    const lines = raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    if(!lines.length) return alert("No codes");
    const key = LS_API.LS.stockPrefix + pid;
    const arr = LS_API.load(key, []);
    const merged = arr.concat(lines);
    LS_API.save(key, merged);
    document.getElementById("sCodes").value = "";
    updateInfo();
    alert("Stock added: " + lines.length);
  });

  updateInfo();
}

function renderOrders(){
  const el = document.getElementById("tab-orders");
  const orders = LS_API.load(LS_API.LS.orders, []);
  el.innerHTML = `
    <div class="card">
      <div class="h2">Orders</div>
      <div class="small">Approve order to allocate codes automatically (random).</div>
      <table class="table">
        <thead><tr><th>ID</th><th>Status</th><th>Product</th><th>Qty</th><th>Total</th><th>TxID</th><th></th></tr></thead>
        <tbody id="oRows"></tbody>
      </table>
    </div>
  `;
  const rows = document.getElementById("oRows");
  orders.forEach(o=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="kbd">${o.id}</td>
      <td><b>${o.status}</b></td>
      <td>${o.productName}</td>
      <td>${o.qty}</td>
      <td>$${o.totalUSD}</td>
      <td class="kbd">${(o.txid||"").slice(0,14)}${(o.txid||"").length>14?"…":""}</td>
      <td>
        <button class="copy" data-open="${o.id}">Open</button>
        ${o.status==="PENDING" ? `<button class="copy" data-approve="${o.id}">Approve</button>
        <button class="copy" data-reject="${o.id}">Reject</button>` : ""}
      </td>
    `;
    rows.appendChild(tr);
  });

  rows.addEventListener("click", (e)=>{
    const open = e.target.closest("[data-open]");
    const ap = e.target.closest("[data-approve]");
    const rj = e.target.closest("[data-reject]");
    if(open){
      const id = open.getAttribute("data-open");
      window.open("order.html?id="+encodeURIComponent(id), "_blank");
    }
    if(ap){
      const id = ap.getAttribute("data-approve");
      const idx = orders.findIndex(x=>x.id===id);
      if(idx<0) return;
      const o = orders[idx];
      const codes = LS_API.pickCodes(o.productId, o.qty);
      if(!codes){ return alert("Not enough stock"); }
      o.codes = codes;
      o.status = "APPROVED";
      orders[idx] = o;
      LS_API.save(LS_API.LS.orders, orders);
      alert("Approved. Codes allocated: "+codes.length);
      renderOrders();
    }
    if(rj){
      const id = rj.getAttribute("data-reject");
      const idx = orders.findIndex(x=>x.id===id);
      if(idx<0) return;
      orders[idx].status = "REJECTED";
      LS_API.save(LS_API.LS.orders, orders);
      renderOrders();
    }
  });
}

function renderSettings(){
  const el = document.getElementById("tab-settings");
  const cfg = LS_API.load(cfgKey, null);
  el.innerHTML = `
    <div class="card">
      <div class="h2">Settings</div>
      <div class="form" style="margin-top:10px">
        <div>
          <div class="small">Store name</div>
          <input class="input" id="cName" value="${cfg.storeName}"/>
        </div>
        <div>
          <div class="small">Support link</div>
          <input class="input kbd" id="cSup" value="${cfg.supportLink}"/>
        </div>
        <div class="full">
          <div class="small">Admin password</div>
          <input class="input kbd" id="cPw" value="${cfg.adminPassword}"/>
        </div>
        <div class="full">
          <button class="btn" id="saveC">Save</button>
        </div>
      </div>
      <div class="notice small">كل البيانات محفوظة في نفس المتصفح. للنشر الحقيقي متعدد المستخدمين تحتاج Backend.</div>
    </div>
  `;
  document.getElementById("saveC").addEventListener("click", ()=>{
    cfg.storeName = (document.getElementById("cName").value||"").trim() || cfg.storeName;
    cfg.supportLink = (document.getElementById("cSup").value||"").trim() || cfg.supportLink;
    cfg.adminPassword = (document.getElementById("cPw").value||"").trim() || cfg.adminPassword;
    LS_API.save(cfgKey, cfg);
    alert("Saved");
    location.reload();
  });
}

if(isAuthed()) showAuthed(); else showLogin();
