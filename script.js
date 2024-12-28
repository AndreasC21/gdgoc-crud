const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

let listFilm = [];
const statusMap = {
  watching: "Watching",
  on_hold: "On Hold",
  dropped: "Dropped",
  plan_to_watch: "Plan to Watch",
  completed: "Completed",
};

//MENGHINDARI USER UNTUK KLIK KANAN
document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

//MENGHINDARI USER UNTUK MENUJU FITUR INSPECT ELEMENT/VIEW SOURCE
document.addEventListener("keydown", function (event) {
  if (
    event.key === "F12" ||
    (event.ctrlKey && event.shiftKey && event.key === "I") ||
    (event.ctrlKey && event.shiftKey && event.key === "J") ||
    (event.ctrlKey && (event.key === "U" || event.key === "u"))
  ) {
    event.preventDefault();
  }
});

//JIKA USER MEMAKSA MEMBUKA INSPECT ELEMENT, AKAN DIARAHKAN KE ABOUT:BLANK
setInterval(function () {
  if (window.outerWidth - window.innerWidth > 100) {
    window.location.href = "about:blank";
  }

  const isResponsiveMode =
    window.innerWidth !== window.outerWidth ||
    window.screen.width !== window.innerWidth ||
    (window.outerHeight < window.screen.height &&
      window.outerWidth < window.screen.width);

  if (
    isResponsiveMode &&
    (window.devicePixelRatio !== 1 || window.outerWidth !== window.innerWidth)
  ) {
    window.location.href = "about:blank";
  }
}, 100);

//LOAD FILM YANG TERSIMPAN DI LOCALSTORAGE
window.onload = function () {
  const storedFilm = localStorage.getItem("listFilm");
  if (storedFilm) {
    listFilm = JSON.parse(storedFilm);
    displayFilm();
  }
};

//FUNGSI UNTUK MENGAMBIL COVER IMAGE DARI TMDB API
async function fetchFilmCover(nama) {
  try {
    const searchResponse = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
        nama
      )}`
    );

    const searchData = await searchResponse.json();

    //JIKA FILM DITEMUKAN, MENGAMBIL COVER IMAGE
    if (searchData.results && searchData.results.length > 0) {
      const posterPath = searchData.results[0].poster_path;

      if (posterPath) {
        return `https://image.tmdb.org/t/p/w500${posterPath}`;
      }
    }
    return "https://via.placeholder.com/500x750.png?text=No+Cover+Available";
  } catch (error) {
    console.error("Gagal dalam fetching film cover:", error);
    return "https://via.placeholder.com/500x750.png?text=No+Cover+Available";
  }
}

//MENGAMBIL DATA DARI FORM
document.getElementById("add").addEventListener("submit", async (event) => {
  event.preventDefault();
  const nama = document.getElementById("nama").value;

  //JIKA JUDUL SAMA, TIDAK BOLEH DITAMBAH
  const isDuplicate = listFilm.some(
    (film) => film.nama.toLowerCase() === nama.toLowerCase()
  );

  if (isDuplicate) {
    alert("Film dengan judul yang sama sudah ada!");
    return;
  }

  const status = document.getElementById("status").value;
  const eps = document.getElementById("eps").value;
  const cover = await fetchFilmCover(nama);

  const film = { nama, status, eps, cover };
  listFilm.push(film);

  localStorage.setItem("listFilm", JSON.stringify(listFilm));
  event.target.reset();
  displayFilm();
});

//FUNGSI MENAMPILKAN LIST FILM
function displayFilm() {
  const list = document.getElementById("list");
  list.innerHTML = "";
  listFilm.forEach((film, index) => {
    const listItem = document.createElement("tr");
    listItem.classList.add("fade-in");

    const cover = document.createElement("td");
    const coverimg = document.createElement("img");
    coverimg.src = film.cover;
    coverimg.alt = film.nama;
    coverimg.style.width = "70px";
    coverimg.onerror = function () {
      this.src =
        "https://via.placeholder.com/500x750.png?text=No+Cover+Available";
    };
    cover.appendChild(coverimg);

    const nama = document.createElement("td");
    nama.textContent = film.nama;

    const status = document.createElement("td");
    status.textContent = statusMap[film.status];

    const eps = document.createElement("td");
    eps.textContent = film.eps;

    const button = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => editFilm(index);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteFilm(index);

    listItem.appendChild(cover);
    listItem.appendChild(nama);
    listItem.appendChild(status);
    listItem.appendChild(eps);
    listItem.appendChild(button);
    button.appendChild(editButton);
    button.appendChild(deleteButton);
    list.appendChild(listItem);
  });
}

//FUNGSI MENGEDIT FILM
function editFilm(index) {
  const film = listFilm[index];
  document.getElementById("nama").value = film.nama;
  document.getElementById("status").value = film.status;
  document.getElementById("eps").value = film.eps;

  listFilm.splice(index, 1);
  localStorage.setItem("listFilm", JSON.stringify(listFilm));
  displayFilm();
}

//FUNGSI MENGHAPUS FILM
function deleteFilm(index) {
  const list = document.getElementById("list");
  const listItem = list.children[index];
  listItem.classList.add("fade-out");

  listFilm.splice(index, 1);
  localStorage.setItem("listFilm", JSON.stringify(listFilm));
  displayFilm();
}
