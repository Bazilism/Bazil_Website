const gallery = document.querySelector('#gallery');
const galleryView = document.querySelector('#gallery-view');
const projectView = document.querySelector('#project-view');
const dialog = document.querySelector('#info-dialog');
const imageDialog = document.querySelector('#image-dialog');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let activeFilter = 'all';
let galleryScroll = 0;
let lastProject = null;

// Escape catalog text at the HTML boundary, including future user-supplied titles.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function mediaPath(value) {
  if (!/^assets\/[a-z0-9/-]+\.(webp|mp4)$/.test(value)) throw new Error('Invalid portfolio media path');
  return value;
}
function durationLabel(seconds) {
  return `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
}
function artwork(media, thumbnail=false, eager=false) {
  return `<img class="portfolio-art" src="${mediaPath(thumbnail?media.thumb:media.src)}" ${thumbnail?'':`srcset="${mediaPath(media.thumb)} ${Number(media.thumbWidth)}w, ${mediaPath(media.src)} ${Number(media.width)}w" sizes="(max-width: 600px) 100vw, 70vw"`} width="${Number(media.width)}" height="${Number(media.height)}" alt="${escapeHtml(media.alt)}" loading="${eager?'eager':'lazy'}" decoding="async">`;
}
function pauseVideos() {
  document.querySelectorAll('video').forEach(video=>video.pause());
}
function renderGallery() {
  pauseVideos();
  const visible = projects.filter(p => activeFilter==='all' || p.category===activeFilter);
  gallery.innerHTML = visible.map((p,index) => `<a class="work-card" href="#project/${p.id}" aria-label="View ${escapeHtml(p.title)}, ${escapeHtml(p.label.toLowerCase())}"><div class="card-visual">${artwork(p.cover,true,index<4)}${p.video?`<video class="card-video" data-src="${mediaPath(p.video)}" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video><span class="card-type"><span aria-hidden="true">▷</span> ${durationLabel(p.duration)}</span>`:''}<span class="card-arrow" aria-hidden="true">↗</span></div><div class="card-caption"><h3>${escapeHtml(p.title)}</h3><span>${p.video?'Motion':p.media.length+' images'}</span></div></a>`).join('');
  document.querySelector('#work-count').textContent = String(visible.length).padStart(2,'0');
  gallery.querySelectorAll('.work-card').forEach(card=>{
    const video=card.querySelector('video');
    if (!video) return;
    card.addEventListener('pointerenter',event=>{
      if (event.pointerType!=='mouse'||reduceMotion.matches) return;
      video.muted=true;
      if (!video.getAttribute('src')) video.src=video.dataset.src;
      video.play().then(()=>{
        if(card.matches(':hover')&&!galleryView.hidden) video.classList.add('playing');
        else video.pause();
      }).catch(()=>video.classList.remove('playing'));
    });
    card.addEventListener('pointerleave',()=>{video.pause();video.classList.remove('playing');});
  });
}
function route() {
  pauseVideos();
  const id = location.hash.startsWith('#project/') ? location.hash.slice(9) : null;
  const project = projects.find(p=>p.id===id);
  if (!project) {
    const wasProject = !projectView.hidden;
    projectView.hidden = true;
    galleryView.hidden = false;
    document.title = 'Bazil — Selected work · Design preview';
    if (wasProject) {
      window.scrollTo({top:galleryScroll,behavior:'instant'});
      const card=Array.from(gallery.querySelectorAll('.work-card')).find(a=>a.hash===`#project/${lastProject}`);
      (card||document.querySelector('#main')).focus({preventScroll:true});
    }
    return;
  }
  if (!galleryView.hidden) galleryScroll = window.scrollY;
  lastProject=project.id;
  galleryView.hidden = true;
  projectView.hidden = false;
  const next = projects[(projects.indexOf(project)+1)%projects.length];
  const hero=project.video
    ? `<div class="project-film"><video controls playsinline preload="metadata" poster="${mediaPath(project.cover.src)}" src="${mediaPath(project.video)}" aria-label="${escapeHtml(project.title)} film">Your browser cannot play this video. <a href="${mediaPath(project.video)}">Open the film</a>.</video><p>${durationLabel(project.duration)} / Sound available in player controls</p></div>`
    : `<button class="project-hero image-expand" data-image="${mediaPath(project.cover.src)}" aria-label="Enlarge ${escapeHtml(project.title)} cover">${artwork(project.cover,false,true)}<span class="enlarge-hint">View image ↗</span></button>`;
  const series=project.video?'':`<section class="project-images" aria-label="Project image collection">${project.media.slice(1).map(media=>`<button class="image-expand ${media.width>media.height?'landscape':''}" data-image="${mediaPath(media.src)}" aria-label="Enlarge ${escapeHtml(media.alt)}">${artwork(media)}<span class="enlarge-hint">View image ↗</span></button>`).join('')}</section>`;
  projectView.innerHTML = `<div class="project"><a class="project-back" href="#selected-work">← Back to work</a><header class="project-header"><div><h1 tabindex="-1">${escapeHtml(project.title)}</h1><p>${escapeHtml(project.label)} / ${project.video?'Film':project.media.length+' images'}</p></div><span>Design preview</span></header>${hero}<section class="project-copy"><h2>${project.video?'In motion.':'A closer look.'}</h2><p>${escapeHtml(project.description)}</p></section>${series}<a class="next-project" href="#project/${next.id}"><div><small>Next collection</small><strong>${escapeHtml(next.title)}</strong></div><span aria-hidden="true">↗</span></a></div>`;
  projectView.querySelectorAll('.image-expand').forEach(button=>button.addEventListener('click',()=>{
    const full=document.querySelector('#full-image');
    full.src=button.dataset.image;
    full.alt=button.querySelector('img').alt;
    imageDialog.showModal();
  }));
  document.title = `${project.title} — Bazil · Design preview`;
  window.scrollTo({top:0,behavior:'instant'});
  projectView.querySelector('h1').focus({preventScroll:true});
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  activeFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b=>{
    const selected = b===button;
    b.classList.toggle('active',selected);
    b.setAttribute('aria-pressed',String(selected));
  });
  renderGallery();
}));
const dialogContent = {
  about:['Hi, I’m Bazil.','CGI artist and creative direction. Explore my product imagery, material studies, and motion work here, or see more on Instagram.'],
  contact:['Let’s create something.','Have a project in mind? Get in touch with me on Instagram.'],
};
document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{
  const [title,body] = dialogContent[button.dataset.dialog];
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-body').textContent = body;
  pauseVideos();
  dialog.showModal();
}));
document.querySelectorAll('.dialog-close,.dialog-done').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(modal=>modal.addEventListener('click',event=>{
  if(event.target!==modal) return;
  const box=modal.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)modal.close();
}));
document.querySelector('#back-top').addEventListener('click',event=>{event.preventDefault();window.scrollTo({top:0,behavior:reduceMotion.matches?'instant':'smooth'});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseVideos();});
reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches)pauseVideos();});
window.addEventListener('hashchange',route);
renderGallery();
route();
