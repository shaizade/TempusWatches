const swiper = new Swiper('.popular-swiper', {
    loop: true, 
    simulateTouch: true, 
    grabCursor: true,
    slidesPerView: 4,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
});




const searchBtn = document.getElementById('searchBtn');
const heartBtn = document.getElementById('heartBtn');
const loginBtn = document.getElementById('loginBtn')

const headerSearch = document.getElementById('headerSearch');
const headerHeart = document.getElementById('headerHeart');
const headerLogin = document.getElementById('headerLogin')

const backArrowSearch = document.getElementById('backArrowSearch');
const backArrowHeart = document.getElementById('backArrowHeart');
const backArrowLogin = document.getElementById('backArrowLogin');
const overlay = document.getElementById('overlay');

// Search Menu

searchBtn.addEventListener('click', () => {
  headerSearch.classList.add('activeMenu');
  overlay.classList.add('activeOverlay');
  document.body.classList.add('no-scroll');
});

backArrowSearch.addEventListener('click', () => {
  headerSearch.classList.remove('activeMenu');
  overlay.classList.remove('activeOverlay')
  document.body.classList.remove('no-scroll');
});

overlay.addEventListener('click', () => {
  headerSearch.classList.remove('activeMenu');
  overlay.classList.remove('activeOverlay');
  document.body.classList.remove('no-scroll');
});

// Heart Menu

heartBtn.addEventListener('click', () =>{
  headerHeart.classList.add('activeMenu');
  overlay.classList.add('activeOverlay');
  document.body.classList.add('no-scroll');
});

backArrowHeart.addEventListener('click', () =>{
  headerHeart.classList.remove('activeMenu');
  overlay.classList.remove('activeOverlay');
  document.body.classList.remove('no-scroll');
});

overlay.addEventListener('click', () => {
  headerHeart.classList.remove('activeMenu');
  overlay.classList.remove('activeOverlay');
  document.body.classList.remove('no-scroll');
});

// Login Menu

loginBtn.addEventListener('click', () =>{
  headerLogin.classList.add('activeMenu');
  overlay.classList.add('activeOverlay');
  document.body.classList.add('no-scroll');
});

backArrowLogin.addEventListener('click', () =>{
  headerLogin.classList.remove('activeMenu');
  overlay.classList.remove('activeOverlay');
  document.body.classList.remove('no-scroll');
});

overlay.addEventListener('click', () => {
  headerLogin.classList.remove('activeMenu');
  overlay.classList.remove('activeOverlay');
  document.body.classList.remove('no-scroll');
});