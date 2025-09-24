document.addEventListener("DOMContentLoaded", () => {
    const rowsContainer = document.getElementById("rowsContainer");
    const colorPicker = document.getElementById("colorPicker");
    const hero = document.getElementById("hero");
    const header = document.getElementById("siteHeader");
  
    const modal = document.getElementById("modal");
    const modalBody = modal.querySelector(".modal-body");
    const modalClose = modal.querySelector(".modal-close");
  
    let moviesData = [];
  
    fetch("data/movies.json")
      .then(res => res.json())
      .then(data => {
        moviesData = data;
        renderRows();
      })
      .catch(err => console.error("Erreur fetch JSON:", err));
  
    function renderRows() {
      const categories = ["nouveautes", "tendances", "pour vous"];
      rowsContainer.innerHTML = "";
  
      categories.forEach(cat => {
        const row = document.createElement("div");
        row.classList.add("row");
  
        const rowTitle = document.createElement("h2");
        rowTitle.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        row.appendChild(rowTitle);
  
        const cards = document.createElement("div");
        cards.classList.add("row-track");
  
        moviesData
          .filter(m => m.category === cat)
          .forEach((movie, i) => {
            const card = document.createElement("div");
            card.classList.add("card", "staggered");
            card.style.animationDelay = `${i * 0.08}s`;
            card.innerHTML = `
              <img src="${movie.poster}" alt="${movie.title}">
              <div class="card-info">
                <h3>${movie.title}</h3>
              </div>
            `;
            card.addEventListener("click", () => showModal(movie));
            cards.appendChild(card);
          });
  
        row.appendChild(cards);
        rowsContainer.appendChild(row);
      });
    }
  
    function showModal(movie) {
      modalBody.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="${movie.poster}" alt="${movie.title}" style="width:100%; border-radius:5px; margin-bottom:1rem;">
        <p>${movie.description}</p>
      `;
      modal.classList.remove("hide");
    }
  
    modalClose.addEventListener("click", () => modal.classList.add("hide"));
    modal.querySelector(".modal-backdrop").addEventListener("click", () => modal.classList.add("hide"));
  

    window.addEventListener("mousemove", e => {
      const layers = hero.querySelectorAll(".hero-layer");
      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed);
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    });
  
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
  
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) header.classList.add("shrink");
      else header.classList.remove("shrink");
    });
  });

  const hamburger = document.querySelector('.hamburger');
const mainNav = document.querySelector('.main-nav');
hamburger.addEventListener('click', () => {
  mainNav.classList.toggle('active');
});


