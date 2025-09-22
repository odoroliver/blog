import { loadView } from "./viewLoader.js";
import {
  handleDashboardScript,
  handleCreateScript,
  handleEditScript,
  handlePostsIndexScript,
} from "./posts.js";
import { handleLoginScript } from "./auth.js";
import { handleCreateCategory } from "./categories.js";
import { handleEditCategory } from "./categories.js";
import {
  loadPostsDashboard,
  loadCategoriesDashboard,
} from "./dashboardTabs.js";

export function initRouting() {
  window.addEventListener("popstate", route);

  document.addEventListener("click", async (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    // ha van data-tab, akkor ez belső tab váltás → ne route-oljon
    if (link.dataset.tab) {
      e.preventDefault();
      await handleTabSwitch(link.dataset.tab);
      return;
    }

    if (link && link.href.startsWith(location.origin)) {
      const path = link.getAttribute("href");
      if (!path.startsWith("http") && !path.includes(".")) {
        e.preventDefault();
        history.pushState(null, "", path);
        route();
      }
    }
  });
}

async function handleTabSwitch(tab) {
  const dashboardContent = document.getElementById("dashboard-content");
  if (!dashboardContent) return;

  if (tab === "posts") {
    await loadView("admin/tabs/posts", dashboardContent);
    await loadPostsDashboard(dashboardContent);
    return;
  }

  if (tab === "categories") {
    await loadView("admin/tabs/categories", dashboardContent);
    await loadCategoriesDashboard(dashboardContent);
    return;
  }
}

export async function route() {
  let path = location.pathname.slice(1) || "index";
  let folder = "";
  let loadPlace = document.getElementById("app");

  const adminViews = ["edit", "create", "create-category", "edit-category"];
  const validPublicViews = ["index", "login"];

  try {
    if (path === "admin" || adminViews.includes(path)) {
      await loadView("admin/dashboard", loadPlace);

      if (adminViews.includes(path)) {
        const dashboardContent = document.getElementById("dashboard-content");

        if (["edit", "create"].includes(path)) {
          await loadView(`posts/${path}`, dashboardContent);
        } else if (path === "create-category" || path === "edit-category") {
          await loadView(`categories/${path}`, dashboardContent);
        }
      }
    } else if (validPublicViews.includes(path)) {
      // publikus nézetek
      if (path === "index") folder = "posts/";
      await loadView(`${folder}${path}`, loadPlace);
    } else {
		await loadView("errors/404", loadPlace);
	}

    switch (path) {
      case "edit":
        handleEditScript();
        break;
      case "create":
        handleCreateScript();
        break;
      case "admin":
        handleDashboardScript();
        break;
      case "login":
        handleLoginScript();
        break;
      case "index":
        handlePostsIndexScript();
        break;
      case "create-category":
        handleCreateCategory();
        break;
      case "edit-category":
        handleEditCategory();
        break;
    }
  } catch (error) {
    console.warn("Nem talált nézet:", path, error);

    // 🔥 SPA 404 nézet betöltése
    try {
      await loadView("errors/404", loadPlace);
    } catch {
      document.getElementById("app").innerHTML =
        "<h1>404</h1><p>A keresett oldal nem található.</p>";
    }
  }
}
