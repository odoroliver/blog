import { updateNav, initNavbarRouting } from "./navbar.js";
import { route, initRouting } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  route();
  initRouting();
  updateNav();
  initNavbarRouting(route);
});
