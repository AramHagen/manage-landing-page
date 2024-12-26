// Hamburger Menu Toggle
const hamburgereMenuElm = document.querySelector('#hamburger-menu');
const menuElm = document.querySelector('#menu');
hamburgereMenuElm.addEventListener('click', () => {
  hamburgereMenuElm.classList.toggle('open');
  menuElm.classList.toggle('hidden');
});

// Email Validation
const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(?<!\.)$/;
const emailElm = document.getElementById('email');
const errorMessageElm = document.querySelector('#error-message');
emailElm.addEventListener('blur', () => {
  if (emailRegex.test(emailElm.value)) {
    errorMessageElm.classList.add('hidden');
  } else {
    errorMessageElm.classList.remove('hidden');
  }
});

// Carousel Class
class Carousel {
  constructor(elm, settings = {}) {
    this.size = settings.size || 3;
    this.elm = elm;
    this.gap = settings.gap || 20;
    this.container = document.querySelector('.carousel-container');
    this.items = Array.from(this.container.children);
    this.totalItems = this.items.length;
    this.dots = [];
    this.itemWidth = 0;
    this.currentIndex = this.totalItems; // Start from the first real item (after clones)
    this.init();
  }

  async init() {
    this.createWrapper();
    this.createDots();
    this.adjustWidthsToItems();
    this.cloneItems();

    this.container.style.transition = 'none';
    this.updatePosition();

    // Make container visible after setup
    requestAnimationFrame(() => {
      this.container.style.transition = 'transform 0.5s ease';
      this.container.style.visibility = 'visible';
    });

    this.addEventListeners();
  }

  createWrapper() {
    const nav = `
      <div class="carousel_nav">
        <button class="carousel_nav_item" aria-label="Previous" data-dir="prev"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="carousel_nav_item" aria-label="Next" data-dir="next"><i class="fa-solid fa-chevron-right"></i></button>
      </div>`;

    const wrapper = document.createElement('div');
    wrapper.classList.add('carousel_wrapper');
    const clonedElm = this.elm.cloneNode(true);
    wrapper.insertAdjacentElement('afterbegin', clonedElm);
    wrapper.insertAdjacentHTML('beforeend', nav);

    this.elm.parentElement.replaceChild(wrapper, this.elm);
    this.container = document.querySelector('.carousel-container');
    this.items = this.container.querySelectorAll('.carousel_item');
  }

  adjustWidthsToItems() {
    this.itemWidth =
        (this.container.clientWidth - this.gap * (this.size - 1)) / this.size;
    [...this.items].forEach((item) => {
      item.style.flex = `0 0 ${this.itemWidth}px`;
      item.style.marginRight = `${this.gap}px`;
    });
  }
  createDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('carousel-dots');

    for (let i = 0; i < this.totalItems; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dotsContainer.appendChild(dot);
    }

    this.container.insertAdjacentElement('afterend', dotsContainer);
    this.dots = dotsContainer.querySelectorAll('.dot');
  }
  cloneItems() {
    const firstClones = [...this.items]
        .slice(0, this.size)
        .map((item) => item.cloneNode(true));
    const lastClones = [...this.items]
        .slice(-this.size)
        .map((item) => item.cloneNode(true));

    firstClones.forEach((clone) => this.container.appendChild(clone));
    lastClones
        .reverse()
        .forEach((clone) =>
            this.container.insertBefore(clone, this.container.firstChild)
        );

    this.items = Array.from(this.container.children);
    this.currentIndex = this.size; // Start at the first real item
  }

  updatePosition() {
    const offset = -this.currentIndex * (this.itemWidth + this.gap);
    this.container.style.transform = `translateX(${offset}px)`;

    // Calculate the index of the first visible item in the original list
    const originalIndex =
        (this.currentIndex - this.size + this.totalItems) % this.totalItems;
    // Update dots
    this.dots.forEach((dot, index) => {
      if (index === originalIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  movePrev() {
    this.currentIndex--;

    // Check if we've reached the clone at the beginning
    if (this.currentIndex === -1) {
      this.container.style.transition = 'none'; // Disable animation
      this.currentIndex = this.totalItems - 1; // Reset to the last real item
      this.updatePosition();

      // Re-enable transition for the next click
      requestAnimationFrame(() => {
        this.container.style.transition = 'transform 0.5s ease';
      });
    } else {
      this.updatePosition();
    }
  }
  moveNext() {
    this.currentIndex++;

    // Check if we've reached the clone at the end
    if (this.currentIndex === this.items.length - this.size) {
      this.container.style.transition = 'none'; // Disable animation
      this.currentIndex = this.size; // Reset to the first real item
      this.updatePosition();

      // Re-enable transition for the next click
      requestAnimationFrame(() => {
        this.container.style.transition = 'transform 0.5s ease';
      });
    } else {
      this.updatePosition();
    }
  }
  moveToDot(dotIndex) {
    // Calculate the new currentIndex based on the clicked dot
    const newIndex = dotIndex + this.size; // Account for clones at the start

    // Update currentIndex and position
    this.currentIndex = newIndex;
    this.updatePosition();
  }
  addEventListeners() {
    const prevBtn = document.querySelector(
        '.carousel_nav_item[data-dir="prev"]'
    );
    const nextBtn = document.querySelector(
        '.carousel_nav_item[data-dir="next"]'
    );

    let isAnimating = false;

    prevBtn.addEventListener('click', () => {
      if (!isAnimating) {
        isAnimating = true;
        this.movePrev();
        setTimeout(() => (isAnimating = false), 500); // Adjust duration to match animation
      }
    });

    nextBtn.addEventListener('click', () => {
      if (!isAnimating) {
        isAnimating = true;
        this.moveNext();
        setTimeout(() => (isAnimating = false), 500);
      }
    });
    // Add click listeners for dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.moveToDot(index));
    });
  }
}
// Initialize Carousel
document.addEventListener('DOMContentLoaded', () => {
  const carouselElement = document.getElementById('carousel');

  const initializeCarousel = () => {
    const settings = window.matchMedia('(min-width: 976px)').matches
        ? { size: 3, gap: 30}
        : { size: 1, gap: 30};

    new Carousel(carouselElement, settings);
  };

  initializeCarousel();
  window.addEventListener('resize', initializeCarousel);
});