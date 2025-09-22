import { updateNav } from "./navbar.js";
import { route } from "./router.js";

export function handleLoginScript() {
  const form = document.getElementById("login-form");
  const errorDiv = document.getElementById("error");
  const adminBtn = document.querySelector(".admin-btn");

  if (!form) {
    console.warn("Login form nem található!");
    return;
  }

  adminBtn.onclick = function () {
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    setTimeout(() => {
      username.value = "admin";
      password.value = "admin";
    }, 100);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.success) {
        window.history.pushState({}, "", "/");
        route();
        updateNav();
      } else {
        errorDiv.textContent = response.message || "Hiba történt";
        errorDiv.style.opacity = 1;
      }
    } catch (err) {
      errorDiv.textContent = "Szerverhiba történt.";
    }
  });
}
