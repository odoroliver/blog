export function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export async function getCategoryMap() {
  const res = await fetch("/api/categories");
  const categories = await res.json();
  const map = {};
  categories.forEach((c) => {
    map[String(c.id)] = c.name;
  });
  return map;
}
