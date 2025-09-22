import { escapeHtml } from "./assets.js";
import { getCategoryMap } from "./assets.js";
import { debounce } from "./assets.js";
import { loadCategoriesToDashboard } from "./categories.js";

export function searchCategories(
  posts,
  selector = "loadPosts",
  categoryMap = {}
) {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  const select = document.querySelector("select[name='category_id']");
  if (selector !== "loadCategories" && !select) return;

  // Ne halmozódjanak a listenerek
  searchInput.oninput = null;

  const handler = debounce(async () => {
    const query = (searchInput.value || "").toLowerCase().trim();

    if (selector === "loadCategories") {
      const filtered = posts.filter((cat) =>
        cat.name?.toLowerCase().includes(query)
      );
      await loadCategoriesToDashboard(filtered);
      return;
    }

    // poszt nézet
    select.value = "999";
    const filtered = posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query)
    );

    if (selector === "loadPosts") {
      loadPosts(999, filtered);
    } else if (selector === "dashboardPosts") {
      await loadPostsToDashboard(999, filtered, categoryMap);
    }
  }, 300);

  // Egy darab, felülírható handler
  searchInput.oninput = handler;
}

export async function loadPosts(
  selectedCategoryId = null,
  posts = [],
  currentPage = 1
) {
  const postsContainer = document.getElementById("posts-container");
  const paginationContainer = document.getElementById("pagination-container");
  postsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  let filteredPosts = posts;

  if (Number(selectedCategoryId) === 999) {
    filteredPosts = posts;
  } else if (selectedCategoryId) {
    filteredPosts = posts.filter(
      (post) => Number(post.category_id) === Number(selectedCategoryId)
    );
  }

  if (posts.length === 0 || filteredPosts.length === 0) {
    postsContainer.innerHTML =
      posts.length === 0 ? "Nincs találat!" : "Jelenleg nincsenek posztok!";
    return;
  }

  // Calculate pagination details
  const postsPerPage = 5;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Render paginated posts
  paginatedPosts.forEach((post) => {
    const postEl = document.createElement("div");
    postEl.classList.add("post-item"); // Osztály a könnyebb stílusozáshoz
    postEl.innerHTML = `
    <hr>
    <h2>${escapeHtml(post.title)}</h2>
    <p class="post-content hidden">${escapeHtml(post.content).replace(
      /\n/g,
      "<br>"
    )}</p>
    ${
      post.image
        ? `<img src="${post.image}" alt="Post image" class="post-image">`
        : ""
    }
  `;

    // Kattintási esemény a váltáshoz
    postEl.addEventListener("click", () => {
      const content = postEl.querySelector(".post-content");
      const image = postEl.querySelector(".post-image");
      if (content && image) {
        content.classList.toggle("hidden");
        image.classList.toggle("hidden");
      }
    });

    postsContainer.appendChild(postEl);
  });

  renderPagination({
    paginationContainer,
    currentPage,
    totalPages,
    onPageChange: (newPage) => loadPosts(selectedCategoryId, posts, newPage),
  });
}

export function renderPagination({
  paginationContainer,
  currentPage,
  totalPages,
  onPageChange,
}) {
  paginationContainer.innerHTML = "";

  const prevButton = document.createElement("button");
  prevButton.textContent = "Előző";
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => onPageChange(currentPage - 1);

  const nextButton = document.createElement("button");
  nextButton.textContent = "Következő";
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => onPageChange(currentPage + 1);

  const pageInfo = document.createElement("span");
  pageInfo.textContent = ` ${currentPage} / ${totalPages} oldal `;

  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(nextButton);
}

// POSTS LISTA
export async function handlePostsIndexScript() {
  const postsContainer = document.getElementById("posts-container");
  const categoryContainer = document.getElementById("category-container");
  const select = document.querySelector("select[name='category_id']");
  if ((!postsContainer, !categoryContainer, !select)) return;

  try {
    const res = await fetch("/api/posts");
    const posts = await res.json();

    loadCategoriesSelection(); /* posts.category_id */
    loadPosts(999, posts);
    searchCategories(posts);

    select.addEventListener("change", async () => {
      const selectedCategoryId = select.value;
      await loadPosts(selectedCategoryId, posts);
    });
  } catch (err) {
    postsContainer.innerHTML = "<p>Hiba történt a posztok betöltésekor.</p>";
    console.error(err);
  }
}

export async function loadCategoriesSelection(selectedCategoryId = null) {
  const select = document.querySelector("select[name='category_id']");
  select.innerHTML = "";

  const catRes = await fetch("/api/categories");
  const categories = await catRes.json();

  // all option
  const option = document.createElement("option");
  option.value = 999;
  option.textContent = "Összes";
  if (selectedCategoryId && Number(selectedCategoryId) === 999) {
    option.selected = true;
  }
  select.appendChild(option);
  //

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;

    if (selectedCategoryId && Number(selectedCategoryId) === Number(cat.id)) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

// POSZT LÉTREHOZÁS
export async function handleCreateScript() {
  // KATEGORIÁK BETÖLTÉSE
  loadCategoriesSelection();
  // POSZT LÉTREHOZÁS
  const form = document.getElementById("create-form");
  // const message = document.getElementById("message");
  const errorMsg = document.createElement("div");
  form.appendChild(errorMsg);

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.message) {
        errorMsg.classList.remove("error");
        errorMsg.classList.add("success");
      }
      errorMsg.textContent = data.message || "Hiba: " + data.error;
      errorMsg.style.opacity = 1;
      form.reset();
    } catch (err) {
      errorMsg.classList.remove("success");
      errorMsg.classList.add("error");
      errorMsg.textContent = "Hiba: " + err.message;
      errorMsg.style.opacity = 1;
    }
  });
}

// POSZT SZERKESZTÉS
export function handleEditScript() {
  const form = document.getElementById("editForm");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const imageInput = document.getElementById("image");
  const imagePreview = document.getElementById("imagePreview");
  const message = document.getElementById("message");
  const adminButtons = document.getElementById("admin-buttons");

  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if (!form || !id) return;

  // Adatok betöltése
  fetch(`/api/posts/show?id=${id}`)
    .then((res) => res.json())
    .then((post) => {
      if (post.error) {
        message.textContent = post.error;
        return;
      }

      titleInput.value = post.title;
      contentInput.value = post.content;

      if (post.image) {
        imagePreview.src = post.image;
        imagePreview.style.display = "block";
      } else {
        imagePreview.style.display = "none";
      }

      loadCategoriesSelection(post.category_id);

      adminButtons.innerHTML = `
        <button type="submit">Frissítés</button>
        <a href="/index"><button type="button" class="delete-btn">🗑️ Törlés</button></a>
        <button type="button" class="deleteImage-btn">🗑️ Kép Törlése</button>
      `;

      form.addEventListener("submit", updatePost);
      document
        .querySelector(".delete-btn")
        .addEventListener("click", deletePost);
      document
        .querySelector(".deleteImage-btn")
        .addEventListener("click", deleteImage);
      imageInput.addEventListener("change", changeImg);
    })
    .catch(() => {
      message.textContent = "Hiba történt a betöltéskor.";
    });

  // Kép cserélés
  function changeImg() {
    const file = imageInput.files[0];
    if (file) {
      imagePreview.src = URL.createObjectURL(file);
      imagePreview.style.display = "block";
    }
  }

  // Frissítés
  async function updatePost(e) {
    e.preventDefault();
    const form = document.getElementById("editForm");
    const formData = new FormData(form);

    formData.append("_method", "PUT");
    formData.append("id", id);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      message.textContent = data.message || "Hiba: " + data.error;
    } catch (err) {
      message.textContent = "Szerverhiba történt mentés közben.";
    }
  }

  // Törlés
  async function deletePost(e) {
    e.preventDefault();

    if (!confirm("Biztosan törlöd ezt a posztot?")) return;

    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      alert(data.message || data.error || "Törlés sikeres.");
    } catch (err) {
      alert("Szerverhiba történt törléskor.");
    }
  }

  async function deleteImage(e) {
    e.preventDefault();

    const imagePreview = document.getElementById("imagePreview");

    if (!confirm("Biztosan törlöd ezt a képet?")) return;

    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (data.message) {
        imagePreview.src = "";
        imagePreview.style.display = "none";
      }

      message.textContent = data.message || "Hiba: " + data.error;
    } catch (err) {
      message.textContent = "Szerverhiba történt törléskor";
    }
  }
}

// Dashboard
import { loadPostsDashboard } from "./dashboardTabs.js";

export function handleDashboardScript() {
  const content = document.getElementById("dashboard-content");
  loadPostsDashboard(content);
}

export async function dashboardPosts() {
  const message = document.getElementById("message");
  const select = document.querySelector("select[name='category_id']");
  if (!message || !select) return;

  try {
    const userRes = await fetch("/api/user");
    const userData = await userRes.json();

    if (!userData.logged_in) {
      message.innerHTML = "Csak bejelentkezett admin férhet hozzá.";
      return;
    }

    const res = await fetch("/api/posts");
    const posts = await res.json();

    const categoryMap = await getCategoryMap();

    await loadCategoriesSelection();

    await loadPostsToDashboard(999, posts, categoryMap);

    searchCategories(posts, "dashboardPosts", categoryMap);

    select.addEventListener("change", async () => {
      const selectedCategoryId = Number(select.value);
      await loadPostsToDashboard(selectedCategoryId, posts, categoryMap);
    });
  } catch (err) {
    message.innerHTML = "Hiba történt a dashboard betöltésekor.";
    console.error(err);
  }
}

export async function loadPostsToDashboard(
  selectedCategoryId = 999,
  posts = [],
  categoryMap = {},
  currentPage = 1
) {
  const message = document.getElementById("message");
  const tbody = document.querySelector("#posts-table tbody");
  const paginationContainer = document.getElementById("pagination-container");
  paginationContainer.innerHTML = "";
  tbody.innerHTML = "";

  if (!posts || posts.length === 0) {
    message.innerHTML = "Nincs találat!";
    return;
  }

  // szűrés
  let filteredPosts = posts;
  if (Number(selectedCategoryId) !== 999) {
    filteredPosts = posts.filter(
      (post) => Number(post.category_id) === Number(selectedCategoryId)
    );
  }

  if (filteredPosts.length === 0) {
    message.innerHTML = "Jelenleg nincsenek posztok.";
    return;
  }

  message.innerHTML = "";

  // Calculate pagination details
  const postsPerPage = 5;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  paginatedPosts.forEach((post) => {
    const categoryName = categoryMap[String(post.category_id)] || "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${post.id}</td>
      <td>${post.title}</td>
      <td>${categoryName}</td>
      <td><a href="/edit?id=${post.id}">Szerkesztés</a></td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination({
    paginationContainer,
    currentPage,
    totalPages,
    onPageChange: (newPage) =>
      loadPostsToDashboard(selectedCategoryId, posts, categoryMap, newPage),
  });
}
