const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.querySelector('.close');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const galleryImgs = Array.from(document.querySelectorAll('.gallery img'));

let currentIndex = 0;

function showModal(index) {
  currentIndex = index;
  modal.style.display = 'block';
  modalImg.src = galleryImgs[currentIndex].src;
  modalImg.alt = galleryImgs[currentIndex].alt;
}

galleryImgs.forEach((img, index) => {
  img.addEventListener('click', () => {
    showModal(index);
  });
});

closeBtn.onclick = function () {
  modal.style.display = 'none';
};

prevBtn.onclick = function () {
  currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length;
  showModal(currentIndex);
};

nextBtn.onclick = function () {
  currentIndex = (currentIndex + 1) % galleryImgs.length;
  showModal(currentIndex);
};

window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};