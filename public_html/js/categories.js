import { debounce } from "./assets.js";
import { searchCategories, renderPagination } from "./posts.js";

export async function loadCategoriesToDashboard(
  categories = [],
  currentPage = 1
) {
  const message = document.getElementById("message");
  const tbody = document.querySelector("#categories-table tbody");
  const paginationContainer = document.getElementById("pagination-container");
  tbody.innerHTML = "";
  paginationContainer.innerHTML = "";

  if (categories.length === 0) {
    message.innerHTML = "Nincs találat!";
    return;
  }

  message.innerHTML = "";

  // Calculate pagination details
  const postsPerPage = 5;
  const totalPages = Math.ceil(categories.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = categories.slice(startIndex, endIndex);

  paginatedPosts.forEach((cat) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cat.id}</td>
      <td>${cat.name}</td>
      <td><a href="/edit-category?id=${cat.id}">Szerkesztés</a></td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination({
    paginationContainer,
    currentPage,
    totalPages,
    onPageChange: (newPage) => loadCategoriesToDashboard(categories, newPage),
  });
}

export async function dashboardCategories() {
  const message = document.getElementById("message");
  if (!message) return;

  try {
    const userRes = await fetch("/api/user");
    const userData = await userRes.json();

    if (!userData.logged_in) {
      message.innerHTML = "Csak bejelentkezett admin férhet hozzá.";
      return;
    }

    const res = await fetch("/api/categories");
    const categories = await res.json();

    loadCategoriesToDashboard(categories);
    searchCategories(categories, "loadCategories", null);
  } catch (err) {
    message.innerHTML = "Hiba történt a dashboard betöltésekor.";
    console.error(err);
  }
}

export function handleCreateCategory() {
  const form = document.getElementById("category-form");
  const errorMsg = document.createElement("div");
  form.appendChild(errorMsg);

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch("/api/categories", {
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

export function handleEditCategory() {
  const form = document.getElementById("edit-category");
  const name = document.getElementById("name");
  const delBtn = document.querySelector(".delete-btn");
  const message = document.getElementById("message");

  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if (!form || !id) return;

  // Adatok betöltése
  fetch(`/api/categories/show?id=${id}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        message.textContent = data.error;
        return;
      }

      name.value = data.name;
    })
    .catch(() => {
      message.textContent = "Hiba történt a betöltéskor.";
    });

  // Mentés
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/categories/update?id=${id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      message.textContent = data.message || "Hiba: " + data.error;
    } catch (err) {
      message.textContent = "Hiba: " + err.message;
    }
  });

  // Törlés
  delBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/categories/delete?id=${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    message.textContent = data.message || "Hiba: " + data.error;
  });
}
