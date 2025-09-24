document.addEventListener("DOMContentLoaded", async () => {
  const rowsContainer = document.getElementById("rowsContainer");
  const heroSlider = document.querySelector(".hero-slider");
  const hero = document.getElementById("hero");
  const header = document.getElementById("siteHeader");
  const modal = document.getElementById("modal");
  const modalBody = modal.querySelector(".modal-body");
  const modalClose = modal.querySelector(".modal-close");
  const colorPicker = document.getElementById("colorPicker");
  const hamburger = document.querySelector('.hamburger');
  const mainNav = document.querySelector('.main-nav');

  const API_KEY = 'e4b90327227c88daac14c0bd0c1f93cd';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  const categories = [
      { id: "nouveautes", endpoint: "/movie/now_playing" },
      { id: "tendances", endpoint: "/trending/movie/week" },
      { id: "pour-vous", endpoint: "/movie/popular" }
  ];

  // Hamburger menu
  hamburger.addEventListener('click', () => mainNav.classList.toggle('active'));

  // Couleur primaire
  if (colorPicker) {
    const savedColor = localStorage.getItem("primaryColor");
    if (savedColor) {
      document.documentElement.style.setProperty("--primary-color", savedColor);
      colorPicker.value = savedColor;
    }
    colorPicker.addEventListener("input", e => {
      const color = e.target.value;
      document.documentElement.style.setProperty("--primary-color", color);
      localStorage.setItem("primaryColor", color);
    });
  }

  // Scroll header
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) header.classList.add("shrink");
    else header.classList.remove("shrink");
  });

  // Navigation scroll
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Fetch films
  async function fetchMovies(endpoint) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=fr-FR`);
      const data = await res.json();
      return data.results;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // Hero slider
  async function renderHeroSlider() {
    const movies = await fetchMovies("/movie/popular");
    movies.slice(0, 10).forEach(movie => {
      const img = document.createElement("img");
      img.src = `${IMAGE_BASE_URL}${movie.backdrop_path}`;
      img.alt = movie.title;
      heroSlider.appendChild(img);
    });
  }
  await renderHeroSlider();

  // Render rangées
  async function renderRows() {
    rowsContainer.innerHTML = "";
    for (const category of categories) {
      const row = document.createElement("section");
      row.classList.add("row");
      row.id = category.id;

      const title = document.createElement("h2");
      title.textContent = category.id.charAt(0).toUpperCase() + category.id.slice(1);
      row.appendChild(title);

      const cards = document.createElement("div");
      cards.classList.add("row-track");

      const movies = await fetchMovies(category.endpoint);
      movies.forEach((movie, i) => {
        const card = document.createElement("div");
        card.classList.add("card", "staggered");
        card.style.animationDelay = `${i * 0.08}s`;
        card.innerHTML = `
          <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}">
          <div class="card-info">
            <h3>${movie.title}</h3>
          </div>
        `;
        card.addEventListener("click", () => showModal(movie));
        cards.appendChild(card);
      });

      row.appendChild(cards);
      rowsContainer.appendChild(row);
    }
  }

  function showModal(movie) {
    modalBody.innerHTML = `
      <h2>${movie.title}</h2>
      <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" style="width:100%; border-radius:5px; margin-bottom:1rem;">
      <p>${movie.overview}</p>
    `;
    modal.classList.remove("hide");
  }

  modalClose.addEventListener("click", () => modal.classList.add("hide"));
  modal.querySelector(".modal-backdrop").addEventListener("click", () => modal.classList.add("hide"));

  await renderRows();
});
