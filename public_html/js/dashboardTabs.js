export async function loadPostsDashboard(container) {
  const res = await fetch("/views/admin/tabs/posts.html");
  const html = await res.text();
  container.innerHTML = html;

  const { dashboardPosts } = await import("./posts.js");
  dashboardPosts();
}

export async function loadCategoriesDashboard(container) {
  const res = await fetch("/views/admin/tabs/categories.html");
  const html = await res.text();
  container.innerHTML = html;

  const { dashboardCategories } = await import("./categories.js");
  dashboardCategories();
}
