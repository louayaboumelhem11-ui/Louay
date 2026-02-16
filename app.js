
(function(){
  const LS = {
    config: "ls_config_v1",
    products: "ls_products_v1",
    orders: "ls_orders_v1",
    myOrders: "ls_myorders_v1",
    stockPrefix: "ls_stock_",
    admin: "ls_admin_v1"
  };

  function load(k, fallback){ try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback)); } catch(e){ return fallback; } }
  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

  function init(){
    const cfg = load(LS.config, null);
    if(!cfg){
      save(LS.config, {"storeName": "LIVE STOCK", "supportLink": "https://t.me/T_T_C_c_C", "adminPassword": "louay2011$$", "sections": [{"id": "gaming", "name": "Gaming"}, {"id": "full", "name": "FULL ACCESS"}], "payments": [{"id": "USDT_BEP20", "name": "USDT (BEP20 / Binance)", "address": "0xc615DfC9AB9c7940C74C3Bab6112d06bA8dBBCf9", "note": "عادةً أقل من دقيقة"}, {"id": "BNB", "name": "BNB (BEP20)", "address": "0xc615DfC9AB9c7940C74C3Bab6112d06bA8dBBCf9", "note": "عادةً أقل من دقيقة"}, {"id": "USDT_ERC20", "name": "USDT (ERC20)", "address": "0xc615DfC9AB9c7940C74C3Bab6112d06bA8dBBCf9", "note": "1–3 دقائق"}, {"id": "LTC", "name": "LTC", "address": "ltc1qp7sn95vtsh862sud5eykjf4z9fx3m0qwygnel5", "note": "حوالي 4 دقائق"}, {"id": "BTC", "name": "BTC", "address": "bc1qvug5jyxkg222y5l2tpf98y9azml9pf3pl0qk38", "note": "قد يكون أبطأ"}]});
    }
    const products = load(LS.products, null);
    if(!products){
      save(LS.products, [{"id": "psn", "name": "PSN Account", "section": "gaming", "unitPrice": 1.0, "icon": "assets/psn.svg", "badge": "Sony"}, {"id": "epic", "name": "Epic Account", "section": "gaming", "unitPrice": 1.0, "icon": "assets/epic.svg", "badge": "Epic"}, {"id": "full", "name": "FULL ACCESS", "section": "full", "unitPrice": 1.0, "icon": "assets/full.svg", "badge": "Access"}, {"id": "insta", "name": "INSTA", "section": "full", "unitPrice": 1.0, "icon": "assets/insta.svg", "badge": "Insta"}]);
    }
    const orders = load(LS.orders, null);
    if(!orders){ save(LS.orders, []); }
    const my = load(LS.myOrders, null);
    if(!my){ save(LS.myOrders, []); }
  }

  function uid(){
    const a = Date.now().toString(36).toUpperCase();
    const b = Math.random().toString(36).slice(2,6).toUpperCase();
    return "LS-" + a + "-" + b;
  }

  function countStock(pid){
    const arr = load(LS.stockPrefix + pid, []);
    return Array.isArray(arr) ? arr.length : 0;
  }

  function pickCodes(pid, qty){
    const arr = load(LS.stockPrefix + pid, []);
    if(arr.length < qty) return null;
    const picked = [];
    for(let i=0;i<qty;i++){
      const idx = Math.floor(Math.random()*arr.length);
      picked.push(arr.splice(idx,1)[0]);
    }
    save(LS.stockPrefix + pid, arr);
    return picked;
  }

  function money(n){ return (Math.round(n*100)/100).toFixed(2); }

  window.LS_API = { LS, load, save, init, uid, countStock, pickCodes, money };
})();
