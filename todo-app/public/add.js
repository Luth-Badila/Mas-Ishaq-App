const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const timeInput = document.getElementById("time-input");
const nameInput = document.getElementById("name-input");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const timeText = timeInput.value.trim();
  const nameText = nameInput.value.trim();
  if (!text || !timeText || !nameText) return;

  fetch("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      time: timeText,
      name: nameText,
      done: false,
    }),
  }).then(() => {
    input.value = "";
    timeInput.value = "";
    nameInput.value = "";

    // Redirect ke halaman home
    window.location.href = "/public/index.html";
  });
});
