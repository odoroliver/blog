export async function loadView(viewPath, loadPlace) {
  try {
    const res = await fetch(`/views/${viewPath}.html`);

    if (!res.ok) {
      throw new Error("Nézet nem található.");
    }

    const html = await res.text();
    loadPlace.innerHTML = html;
  } catch (err) {
    loadPlace.innerHTML = "<p>Hiba történt a betöltéskor.</p>";
    console.error("loadView hiba:", err);
  }
}
