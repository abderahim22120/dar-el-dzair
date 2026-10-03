// دار الجزائر — منطق الموقع (العرض + السلة + إرسال الطلب عبر واتساب)
// لا تحتاج لتعديل هذا الملف: كل المحتوى في data.js
const S = SITE; // البيانات من ملف data.js
let cart = {}, cat = 0, mode = "delivery", si = 0, timer = null;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const vis = x => x.img ? `<img src="${x.img}" alt="">` : esc(x.e);
const find = id => S.items.find(x => x.id === id);
const sub = () => Object.entries(cart).reduce((s,[id,q]) => s + find(+id).p*q, 0);
const cnt = () => Object.values(cart).reduce((a,b) => a+b, 0);
const fee = () => mode==="delivery" && sub() < S.free ? S.fee : 0;

// ===== العرض =====
function render(){
  document.title = S.name + " | مطعم الأكل الجزائري";
  $("hn").textContent = S.name; $("hb").textContent = S.name; $("hs").textContent = S.tag;
  $("bn").textContent = `رسوم التوصيل ${S.fee} دج — مجاني للطلبات فوق ${S.free} دج`;
  $("stage").innerHTML = S.slides.map(s => `<div class="slide">${s.img ? `<img src="${s.img}" alt="">` : `<div class="e">${esc(s.e)}</div>`}</div>`).join("");
  $("dots").innerHTML = S.slides.map(() => "<i></i>").join("");
  si = 0; show(0);
  clearInterval(timer); timer = setInterval(() => { si = (si+1) % S.slides.length; show(si) }, 3500);
  if (cat >= S.cats.length) cat = 0;
  renderTabs(); renderGrid(); upd();
}
function show(i){
  document.querySelectorAll(".slide").forEach((el,k) => el.classList.toggle("on", k===i));
  document.querySelectorAll(".dots i").forEach((el,k) => el.classList.toggle("on", k===i));
  const s = S.slides[i]; if (s) { $("dn").textContent = s.n; $("dd").textContent = s.d }
}
function go(v){
  $("home").classList.toggle("hide", v!=="home");
  $("menu").classList.toggle("hide", v!=="menu");
  window.scrollTo(0,0);
}
function renderTabs(){
  $("tabs").innerHTML = S.cats.map((c,i) => `<button class="tab ${i===cat?"on":""}" onclick="cat=${i};renderTabs();renderGrid()">${esc(c)}</button>`).join("");
}
function renderGrid(){
  $("grid").innerHTML = S.items.filter(x => x.c===cat).map(x => `
   <div class="it"><div class="em">${vis(x)}</div><div style="flex:1"><h3>${esc(x.n)}</h3><p>${esc(x.d)}</p>
   <div class="pr"><b>${x.p} دج</b><button class="add" onclick="add(${x.id})">+ أضف</button></div></div></div>`).join("");
}
function add(id){ cart[id] = (cart[id]||0)+1; upd() }
function chg(id,d){ cart[id] += d; if (cart[id] <= 0) delete cart[id]; upd(); if (!cnt()) closeCart(); else openCart(true) }
function upd(){
  Object.keys(cart).forEach(id => { if (!find(+id)) delete cart[id] });
  $("bar").classList.toggle("hide", !cnt());
  $("bc").textContent = cnt(); $("bt").textContent = sub() + " دج";
}

// ===== السلة والطلب =====
function openCart(keep){
  const old = keep ? ["nm","ph","ad","nt"].map(i => $(i) ? $(i).value : "") : ["","","",""];
  $("sheet").innerHTML = `
   <h2 class="serif">سلة الطلب <button class="x" onclick="closeCart()">×</button></h2>
   ${Object.entries(cart).map(([id,q]) => { const x = find(+id); return `<div class="row"><span>${esc(x.e)} ${esc(x.n)}</span>
     <span class="q"><button onclick="chg(${id},-1)">−</button><b>${q}</b><button onclick="chg(${id},1)">+</button></span>
     <span style="color:var(--gold)">${x.p*q} دج</span></div>` }).join("")}
   <div class="mode"><button class="${mode==="delivery"?"on":""}" onclick="setMode('delivery')">🛵 توصيل للمنزل</button>
   <button class="${mode==="pickup"?"on":""}" onclick="setMode('pickup')">🏪 استلام من المحل</button></div>
   <div class="sum"><div><span>المجموع</span><span>${sub()} دج</span></div>
   <div><span>التوصيل</span><span>${mode==="pickup" ? "—" : fee() ? fee()+" دج" : "مجاني"}</span></div>
   <div class="t"><span>الإجمالي</span><span>${sub()+fee()} دج</span></div></div>
   <input id="nm" placeholder="الاسم الكامل" value="${esc(old[0])}">
   <input id="ph" type="tel" inputmode="tel" placeholder="رقم الهاتف" value="${esc(old[1])}">
   <input id="ad" placeholder="العنوان الكامل للتوصيل" class="${mode==="pickup"?"hide":""}" value="${esc(old[2])}">
   <textarea id="nt" rows="2" placeholder="ملاحظات (اختياري)">${esc(old[3])}</textarea>
   <div class="err" id="er"></div>
   <button class="send" onclick="send()">✅ تأكيد الطلب عبر واتساب</button>`;
  $("ov").classList.remove("hide");
}
function closeCart(){ $("ov").classList.add("hide") }
function setMode(m){ mode = m; openCart(true) }
function send(){
  const nm = $("nm").value.trim(), ph = $("ph").value.trim(), ad = $("ad").value.trim(), nt = $("nt").value.trim();
  if (!nm) return $("er").textContent = "الرجاء إدخال الاسم";
  if (!/^[0-9+\s]{9,15}$/.test(ph)) return $("er").textContent = "رقم الهاتف غير صحيح";
  if (mode==="delivery" && !ad) return $("er").textContent = "الرجاء إدخال عنوان التوصيل";
  const lines = Object.entries(cart).map(([id,q]) => `• ${find(+id).n} × ${q} = ${find(+id).p*q} دج`).join("\n");
  const msg = `🍽️ طلب جديد - ${S.name}\n\n${lines}\n\nالمجموع: ${sub()} دج\nالتوصيل: ${mode==="pickup" ? "استلام من المحل" : fee()+" دج"}\nالإجمالي: ${sub()+fee()} دج\n\n👤 ${nm}\n📞 ${ph}\n${mode==="delivery" ? "📍 "+ad : "🏪 استلام من المحل"}${nt ? "\n📝 "+nt : ""}`;
  window.open("https://wa.me/" + S.wa + "?text=" + encodeURIComponent(msg), "_blank");
  $("sheet").innerHTML = `<div class="ok"><span>🎉</span><h2 class="serif" style="justify-content:center">شكراً ${esc(nm)}!</h2>
   <p style="color:var(--mut)">تم تجهيز طلبك، أكمل الإرسال في واتساب وسنتصل بك للتأكيد.</p>
   <button class="send" onclick="cart={};upd();closeCart()">رجوع إلى القائمة</button></div>`;
}

render();
