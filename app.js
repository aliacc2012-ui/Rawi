const modal = document.getElementById('appModal');
const projectModal = document.getElementById('projectModal');
const pageTitle = document.getElementById('pageTitle');

document.querySelectorAll('[data-open-app]').forEach(btn => btn.addEventListener('click', () => {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}));

document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}));

const titles = {
  dashboard:'Good evening, Ali.',
  projects:'Projects',
  builder:'Gallery Builder',
  analytics:'Analytics',
  settings:'Branding'
};

function switchPage(id){
  document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.side-link').forEach(b => b.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  document.querySelector(`.side-link[data-page="${id}"]`)?.classList.add('active');
  pageTitle.textContent = titles[id] || 'RAWI';
}

document.querySelectorAll('.side-link').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.page)));
document.querySelectorAll('[data-page-target]').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.pageTarget)));

function openProject(){
  projectModal.classList.add('open');
  projectModal.setAttribute('aria-hidden','false');
}
function closeProject(){
  projectModal.classList.remove('open');
  projectModal.setAttribute('aria-hidden','true');
}
document.getElementById('newProjectBtn').addEventListener('click', openProject);
document.getElementById('createProjectCard').addEventListener('click', openProject);
document.querySelectorAll('[data-close-project]').forEach(btn => btn.addEventListener('click', closeProject));
document.getElementById('projectForm').addEventListener('submit', e => {
  e.preventDefault();
  closeProject();
  modal.classList.add('open');
  switchPage('builder');
});

const langBtn = document.getElementById('langBtn');
let ar = false;
langBtn.addEventListener('click', () => {
  ar = !ar;
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  document.documentElement.lang = ar ? 'ar' : 'en';
  langBtn.textContent = ar ? 'English' : 'العربية';
  document.querySelector('.hero h1').innerHTML = ar ? 'شغلك يستحق <span>أفضل</span> من رابط درايف.' : 'Your work deserves <span>better</span> than a Drive link.';
  document.querySelector('.hero-copy > p').textContent = ar ? 'سلّم الصور والأفلام من خلال معارض سينمائية تحمل هويتك، مصممة لطريقة عمل المبدعين.' : 'Deliver photos and films through cinematic, branded client galleries built for the way creators actually work.';
});
