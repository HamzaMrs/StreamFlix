document.addEventListener("DOMContentLoaded", async () => {
  const rowsContainer = document.getElementById("rowsContainer");
  const heroSlider = document.querySelector(".hero-slider");
  const hero = document.getElementById("hero");
  const header = document.getElementById("siteHeader");
  const modal = document.getElementById("modal");
  const modalBody = modal.querySelector(".modal-body");
  const modalClose = modal.querySelector(".modal-close");
  const btnWatch = modal.querySelector(".btn.primary");
  const colorPicker = document.getElementById("colorPicker");
  const hamburger = document.querySelector('.hamburger');
  const mainNav = document.querySelector('.main-nav');
  const searchInput = document.getElementById("searchInput");
  const modalActions = document.querySelector('.modal-actions');

  const API_KEY = 'e4b90327227c88daac14c0bd0c1f93cd';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  
  // Cache des genres
  let genresCache = null;

  const categories = [
      { id: "nouveautes", endpoint: "/movie/now_playing" },
      { id: "tendances", endpoint: "/trending/movie/week" },
      { id: "pour-vous", endpoint: "/movie/popular" },
      { id: "ma-liste", endpoint: null }
  ];

  // Gestion favoris (localStorage)
  const FAVORITES_KEY = 'sf_favorites_v1';
  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; } catch { return []; }
  }
  function setFavorites(favs) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  }
  function isFavorite(id) {
    const favs = getFavorites();
    return favs.some(m => m.id === id);
  }
  function toggleFavorite(movie) {
    const favs = getFavorites();
    const exists = favs.some(m => m.id === movie.id);
    const next = exists ? favs.filter(m => m.id !== movie.id) : [...favs, movie];
    setFavorites(next);
  }

  // Hamburger menu
  hamburger.addEventListener('click', () => {
    const isActive = mainNav.classList.toggle('active');
    hamburger.classList.toggle('active', isActive);
    document.body.classList.toggle('no-scroll', isActive);
  });

  // Fermer le menu au clic sur un item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
  });


  window.addEventListener('resize', () => {
    if (window.innerWidth > 600 && mainNav.classList.contains('active')) {
      mainNav.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  });

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

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) header.classList.add("shrink");
    else header.classList.remove("shrink");
  });


  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  });

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

  async function fetchGenres() {
    if (genresCache) return genresCache;
    try {
      const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=fr-FR`);
      const data = await res.json();
      genresCache = data.genres;
      return genresCache;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function fetchMovieDetails(movieId) {
    try {
      const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function fetchMovieVideos(movieId) {
    try {
      const res = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=fr-FR`);
      const data = await res.json();
      return data.results;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function renderHeroSlider() {
    const movies = await fetchMovies("/movie/popular");
    let current = 0;

    const slides = movies.slice(0, 6).map((movie, idx) => {
        const img = document.createElement("img");
        img.src = `${IMAGE_BASE_URL}${movie.backdrop_path}`;
        img.alt = movie.title;
        if (idx === 0) img.classList.add('active');
        return { img, movie };
    });

    slides.forEach(s => heroSlider.appendChild(s.img));

    const heroWatchBtn = document.querySelector('.hero-actions .btn.primary');
    const heroFavBtn = document.querySelector('.hero-actions .btn.outline');

    function updateHeroButtons() {
        const featuredMovie = slides[current].movie;
        heroFavBtn.textContent = isFavorite(featuredMovie.id) ? 'Retirer de ma liste' : 'Ajouter à ma liste';
        heroFavBtn.onclick = () => {
            toggleFavorite(featuredMovie);
            heroFavBtn.textContent = isFavorite(featuredMovie.id) ? 'Retirer de ma liste' : 'Ajouter à ma liste';
            const myListRow = document.getElementById('ma-liste');
            if (myListRow) renderRows();
        };
        heroWatchBtn.onclick = () => showModal(featuredMovie);
    }

    updateHeroButtons(); 

    setInterval(() => {
        const imgs = heroSlider.querySelectorAll('img');
        imgs[current].classList.remove('active');
        current = (current + 1) % slides.length;
        imgs[current].classList.add('active');
        updateHeroButtons(); 
    }, 4000);
}


  await renderHeroSlider();

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

      const movies = category.endpoint ? await fetchMovies(category.endpoint) : getFavorites();
      movies.forEach((movie, i) => {
        const card = document.createElement("div");
        card.classList.add("card", "staggered");
        card.style.animationDelay = `${i * 0.08}s`;
        card.dataset.title = (movie.title || "").toLowerCase();
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

  async function showModal(movie) {
  const [details, genres, videos] = await Promise.all([
    fetchMovieDetails(movie.id),
    fetchGenres(),
    fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}&language=fr-FR`).then(res => res.json())
  ]);

  const genreNames = movie.genre_ids
    ? movie.genre_ids.map(id => genres.find(g => g.id === id)?.name).filter(Boolean).join(', ')
    : '';

  const runtime = details?.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}min` : '';

  const trailer = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");

  modalBody.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <div class="modal-body-content">
        <h2>${movie.title}</h2>
        <div class="modal-meta">
          <span class="badge">Film</span>
          ${movie.release_date ? `<span class="badge">${String(movie.release_date).slice(0,4)}</span>` : ''}
          ${runtime ? `<span class="badge">${runtime}</span>` : ''}
          ${movie.vote_average ? `<span class="badge">★ ${Math.round(movie.vote_average * 10) / 10}</span>` : ''}
        </div>
        ${genreNames ? `<p class="genres"><strong>Genres:</strong> ${genreNames}</p>` : ''}
        <p>${movie.overview || 'Aucune description disponible.'}</p>
      </div>
  `;

  const actions = modal.querySelector('.modal-actions');
  actions.innerHTML = '';
  const watchBtn = document.createElement('button');
  watchBtn.className = 'btn primary';
  watchBtn.textContent = 'Regarder maintenant';
  watchBtn.onclick = () => {
    if (trailer) {
      modalBody.innerHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      alert("Pas de bande-annonce disponible pour ce film.");
    }
  };

  const favBtn = document.createElement('button');
  favBtn.className = 'btn secondary';
  function syncFavBtn() {
    favBtn.textContent = isFavorite(movie.id) ? 'Retirer de ma liste' : 'Ajouter à ma liste';
  }
  syncFavBtn();
  favBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    toggleFavorite({ id: movie.id, title: movie.title, poster_path: movie.poster_path, overview: movie.overview });
    syncFavBtn();
    const myListRow = document.getElementById('ma-liste');
    if (myListRow) {
      renderRows();
    }
  });

  actions.appendChild(watchBtn);
  actions.appendChild(favBtn);
  modal.classList.add("show");
  const firstFocusable = actions.querySelector('button') || modalClose;
  firstFocusable && firstFocusable.focus({ preventScroll: true });
}

modalClose.addEventListener("click", () => modal.classList.remove("show"));
modal.querySelector(".modal-backdrop").addEventListener("click", () => modal.classList.remove("show"));

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('show')) return;
    if (e.key === 'Escape') {
      modal.classList.remove('show');
    }
    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const f = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });


  await renderRows();

  // Recherche films
  function filterCards(query) {
    const normalizedQuery = (query || "").toLowerCase().trim();
    const rows = rowsContainer.querySelectorAll('.row');
    rows.forEach(row => {
      const cards = row.querySelectorAll('.card');
      let visibleCount = 0;
      cards.forEach(card => {
        const title = card.dataset.title || '';
        const isMatch = normalizedQuery === '' || title.includes(normalizedQuery);
        card.style.display = isMatch ? '' : 'none';
        if (isMatch) visibleCount++;
      });
      row.style.display = visibleCount === 0 ? 'none' : '';
    });
  }

  if (searchInput) {
    let debounceId;
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value;
      clearTimeout(debounceId);
      debounceId = setTimeout(() => filterCards(value), 150);
    });
  }
});


let featuredMovie = null;
const heroWatchBtn = document.querySelector('.hero-actions .btn.primary');
heroWatchBtn.addEventListener('click', async () => {
    if (!featuredMovie) return;

    const resVideos = await fetch(`${BASE_URL}/movie/${featuredMovie.id}/videos?api_key=${API_KEY}&language=fr-FR`);
    const videos = await resVideos.json();
    const trailer = videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");

    if (trailer) {
        showModal(featuredMovie); 
    } else {
        alert("Pas de bande-annonce disponible.");
    }
});

