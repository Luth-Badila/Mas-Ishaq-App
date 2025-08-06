async function fetchData() {
  const res = await fetch("/api/data");
  const data = await res.json();

  const container = document.getElementById("dataList");
  container.innerHTML = "";

  data.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="view-mode">
        <strong>Nama:</strong> <span>${item.name}</span><br>
        <strong>Email:</strong> <span>${item.email}</span><br>
        <strong>Pesan:</strong><br>
        <span>${item.message}</span><br><br>
        <button onclick="enableEdit(${index}, this)">Edit</button>
        <button onclick="deleteData(${index})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function enableEdit(index, btn) {
  const card = btn.closest(".card");
  const spans = card.querySelectorAll("span");

  const name = spans[0].innerText;
  const email = spans[1].innerText;
  const message = spans[2].innerText;

  card.innerHTML = `
    <div class="edit-mode">
      <strong>Nama:</strong> <input type="text" id="editName" value="${name}"><br>
      <strong>Email:</strong> <input type="email" id="editEmail" value="${email}"><br>
      <strong>Pesan:</strong><br>
      <textarea id="editMessage">${message}</textarea><br><br>
      <button onclick="saveEdit(${index}, this)">Save</button>
      <button onclick="cancelEdit()">Cancel</button>
    </div>
  `;
}

function cancelEdit() {
  fetchData(); // reload ulang data
}

async function saveEdit(index, btn) {
  const card = btn.closest(".card");
  const name = card.querySelector("#editName").value.trim();
  const email = card.querySelector("#editEmail").value.trim();
  const message = card.querySelector("#editMessage").value.trim();

  await fetch(`/api/update/${index}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message }),
  });

  alert("Data berhasil diupdate.");
  fetchData();
}

async function deleteData(index) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    await fetch(`/api/delete/${index}`, { method: "DELETE" });
    alert("Data dihapus.");
    fetchData();
  }
}

fetchData();
