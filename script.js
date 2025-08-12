// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Lightbox =====
const lb = document.getElementById('lightbox');
const img = lb.querySelector('img');
const closeBtn = lb.querySelector('.lightbox-close');
document.querySelectorAll('.gallery a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    img.src = a.getAttribute('href');
    lb.classList.add('show');
    lb.setAttribute('aria-hidden', 'false');
  });
});
closeBtn.addEventListener('click', () => {
  lb.classList.remove('show');
  lb.setAttribute('aria-hidden', 'true');
  img.src = '';
});
lb.addEventListener('click', e => { if(e.target === lb){ closeBtn.click(); } });

// Keyboard nav for lightbox
const galleryLinks = Array.from(document.querySelectorAll('.gallery a'));
let currentIndex = -1;
document.querySelectorAll('.gallery a').forEach((a,i)=> a.addEventListener('click', ()=> currentIndex = i ));
window.addEventListener('keydown', e=>{
  if(!lb.classList.contains('show')) return;
  if(e.key === 'Escape') closeBtn.click();
  if(e.key === 'ArrowLeft'){ currentIndex = Math.max(0, currentIndex-1); galleryLinks[currentIndex]?.click(); }
  if(e.key === 'ArrowRight'){ currentIndex = Math.min(galleryLinks.length-1, currentIndex+1); galleryLinks[currentIndex]?.click(); }
});

// ===== Mailto forms =====
function encodeBody(obj){
  return Object.entries(obj).map(([k,v]) => `${encodeURIComponent(k)}: ${encodeURIComponent(v)}`).join('%0D%0A');
}
function collect(form){
  const data = {};
  form.querySelectorAll('input, textarea').forEach(el => {
    if (el.type === 'checkbox') data[el.name || '同意'] = el.checked ? 'はい' : 'いいえ';
    else data[el.name || el.id] = el.value;
  });
  return data;
}
function submitMailto(e){
  e.preventDefault();
  const form = e.target;
  const kind = form.dataset.form || 'お問い合わせ';
  const data = collect(form);
  const subject = `[TSUGITECH] ${kind}`;
  const body = encodeBody(data);
  const mail = `mailto:tsugitech@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  window.location.href = mail;
}
document.querySelectorAll('form[data-form]').forEach(f => f.addEventListener('submit', submitMailto));

// ===== Smooth scroll & scrollspy =====
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    if(!id) return;
    const el = document.getElementById(id);
    if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
});
const spyTargets = Array.from(document.querySelectorAll('main section[id]'));
const menuLinks = Array.from(document.querySelectorAll('.menu a'));
function onScrollSpy(){
  const y = window.scrollY + 120;
  let activeId = null;
  for(const sec of spyTargets){ if(sec.offsetTop <= y) activeId = sec.id; }
  menuLinks.forEach(l=> l.classList.toggle('active', l.getAttribute('href') === '#' + activeId));
}
window.addEventListener('scroll', onScrollSpy);

// ===== Header shrink & progress bar =====
const header = document.querySelector('.site-header');
const progress = document.getElementById('progress');
function onScroll(){
  header.classList.toggle('shrink', window.scrollY > 20);
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = scrolled + '%';
}
window.addEventListener('scroll', onScroll); onScroll();

// ===== Reveal on view =====
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
}, {threshold: 0.12});
document.querySelectorAll('[data-reveal]').forEach(el=> io.observe(el));

// ===== Gallery filters =====
const filterWrap = document.getElementById('galleryFilters');
if(filterWrap){
  filterWrap.addEventListener('click', e=>{
    if(!e.target.matches('.tab')) return;
    filterWrap.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    const key = e.target.dataset.filter;
    document.querySelectorAll('#gallery .gallery a').forEach(item=>{
      const tags = (item.dataset.tags || '').split(' ');
      const show = key === '*' || tags.includes(key) || (tags.includes('event') && key === 'event');
      item.style.display = show ? '' : 'none';
    });
  });
}

// ===== Carousel controls =====
document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  const track = carousel.querySelector('.carousel-track');
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  const step = ()=> Math.min(track.clientWidth*0.9, 480);
  prev?.addEventListener('click', ()=> track.scrollBy({left: -step(), behavior:'smooth'}));
  next?.addEventListener('click', ()=> track.scrollBy({left: step(), behavior:'smooth'}));
});

// ===== Back to top FAB =====
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', ()=>{ toTop.classList.toggle('show', window.scrollY > 600); });
toTop?.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// ===== Theme toggle =====
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
function setTheme(mode){
  root.classList.toggle('light', mode === 'light');
  localStorage.setItem('theme', mode);
  if(themeBtn) themeBtn.textContent = mode === 'light' ? '☀️' : '🌙';
}
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);
themeBtn?.addEventListener('click', ()=> setTheme(root.classList.contains('light') ? 'dark' : 'light'));

// ===== Forms: counters + autosave + copy =====
function attachFormEnhancements(form){
  const key = 'form-' + (form.dataset.form || 'generic');
  form.querySelectorAll('textarea[data-count]').forEach(t=>{
    const max = parseInt(t.dataset.count, 10) || 500;
    const counter = document.createElement('span'); counter.className = 'char';
    t.insertAdjacentElement('afterend', counter);
    const update = ()=> counter.textContent = `${t.value.length}/${max}`;
    t.addEventListener('input', update); update();
  });
  const saved = localStorage.getItem(key);
  if(saved){
    try{
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([name, val])=>{
        const el = form.querySelector(`[name="${name}"]`);
        if(el){ if(el.type==='checkbox'){ el.checked = !!val; } else { el.value = val; } }
      });
    }catch{}
  }
  form.addEventListener('input', ()=>{
    const data = {};
    form.querySelectorAll('input, textarea').forEach(el=> data[el.name] = el.type === 'checkbox' ? el.checked : el.value);
    localStorage.setItem(key, JSON.stringify(data));
  });
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button'; copyBtn.textContent = '内容をコピー'; copyBtn.className = 'cta ghost';
  form.appendChild(copyBtn);
  copyBtn.addEventListener('click', ()=>{
    const data = collect(form);
    const text = decodeURIComponent(encodeBody(data).replace(/%0D%0A/g, '\n'));
    navigator.clipboard.writeText(text).then(()=> toast('内容をクリップボードにコピーしました'));
  });
}
document.querySelectorAll('form[data-form]').forEach(attachFormEnhancements);

// ===== PWA =====
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js'));
}

// ===== Instagram latest embed =====
(async function setupInstagram(){
  try{
    const cfg = await fetch('assets/config.json').then(r=>r.json());
    const handle = cfg.instagramHandle || 'tsugi_tech';
    const profileUrl = `https://www.instagram.com/${handle}/`;
    document.getElementById('ig-profile-link').href = profileUrl;
    let postUrl = (cfg.instagramPostUrl || '').trim();
    if(!postUrl){
      try{
        const html = await fetch(`https://r.jina.ai/http://www.instagram.com/${handle}/`).then(r=>r.text());
        const m = html.match(/https:\/\/www\.instagram\.com\/p\/[^"']+\//);
        if(m) postUrl = m[0];
      }catch(_){}
    }
    const wrap = document.getElementById('ig-latest');
    if(!postUrl){ wrap.innerHTML = `<p class="small">最新投稿の取得に失敗しました。<a href="${profileUrl}" target="_blank" rel="noopener">プロフィールを開く</a></p>`; return; }
    wrap.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${postUrl}" data-instgrm-version="14"></blockquote>`;
    if(!document.getElementById('ig-embed-js')){
      const s = document.createElement('script'); s.id = 'ig-embed-js'; s.src = "https://www.instagram.com/embed.js"; s.async = true;
      document.body.appendChild(s);
    }else{ if(window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process(); }
  }catch(e){ console.warn('IG embed error', e); }
})();

// ===== YouTube live auto on/off via oEmbed =====
(async function setupYouTubeLive(){
  try{
    const cfg = await fetch('assets/config.json').then(r=>r.json());
    const handle = (cfg.youtubeHandle || 'tsugitech').replace(/^@/, '');
    const liveUrl = `https://www.youtube.com/@${handle}/live`;
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(liveUrl)}&format=json`;
    await fetch(oembed).then(r=> r.ok ? r.json() : Promise.reject());
    const ban = document.getElementById('yt-live');
    const off = document.getElementById('yt-live-off');
    const link = document.getElementById('yt-live-link');
    link.href = liveUrl; ban.hidden = false; off.style.display = 'none';
  }catch(_){
    const ban = document.getElementById('yt-live'); const off = document.getElementById('yt-live-off');
    if(ban) ban.hidden = true; if(off) off.style.display = '';
  }
})();

// Toast utility
function toast(msg){
  let t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style,{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,.8)',color:'#fff',padding:'10px 14px',borderRadius:'10px',zIndex:'1000'});
  document.body.appendChild(t); setTimeout(()=>{ t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(()=> t.remove(), 400); }, 1200);
}
