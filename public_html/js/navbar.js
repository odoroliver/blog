let isLoggedIn = false;

export function getLoginStatus() {
  return isLoggedIn;
}

export function updateNav() {
  const logoutLink = document.getElementById("logout-link");
  const loginLink = document.getElementById("login-link");
  const adminLink = document.getElementById("admin-link");

  fetch("/api/user")
    .then((res) => res.json())
    .then((data) => {
      isLoggedIn = data.logged_in;

      if (logoutLink && loginLink && adminLink) {
        loginLink.style.display = isLoggedIn ? "none" : "inline-block";
        logoutLink.style.display = isLoggedIn ? "inline-block" : "none";
        adminLink.style.display = isLoggedIn ? "inline-block" : "none";
      }
    })
    .catch((err) => {
      console.error("Navigáció frissítés hiba:", err);
    });
}

export function initNavbarRouting(routeCallback) {
  const logoutLink = document.getElementById("logout-link");

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      fetch("/api/logout").then(() => {
        isLoggedIn = false;
        updateNav();
        history.pushState(null, "", "/login");
        routeCallback();
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links a");

  // Hamburger menü toggle
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Menü bezárása linkre kattintáskor
  links.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });
});