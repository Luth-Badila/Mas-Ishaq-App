const list = document.getElementById("todo-list");

function loadTodos() {
  fetch("/todos")
    .then((res) => res.json())
    .then((todos) => {
      list.innerHTML = "";
      todos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = "todo-item " + (todo.done ? "done" : "");

        // const section = document.createElement("span");
        // section.innerHTML = `
        //   <p class="span-id">${todo.id}</p>
        //   ${todo.done ? "✔️ " : ""}<strong>${todo.text}</strong><br>
        //   <small>pukul: ${todo.time || "-"} | nama: ${todo.name || "-"}</small>
        // `;

        const divList = document.createElement("div");
        divList.className = "divList";

        const idP = document.createElement("div");
        idP.className = "span-id";
        idP.textContent = todo.id;

        const textStrong = document.createElement("strong");
        textStrong.textContent = `${todo.done ? "✔️ " : ""}${todo.text}`;

        const br = document.createElement("br");

        const small = document.createElement("small");
        small.textContent = `pukul: ${todo.time || "-"} | nama: ${todo.name || "-"}`;

        // Gabungkan elemen ke dalam divList
        divList.appendChild(idP);
        divList.appendChild(textStrong);
        divList.appendChild(br);
        divList.appendChild(small);

        const div = document.createElement("div");

        const doneBtn = document.createElement("button");
        doneBtn.textContent = "✔";
        doneBtn.onclick = () => toggleTodo(todo.id, !todo.done);

        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.onclick = () => showEditForm(todo, li);

        const delBtn = document.createElement("button");
        delBtn.textContent = "✖";
        delBtn.onclick = () => deleteTodo(todo.id);

        div.appendChild(doneBtn);
        div.appendChild(editBtn);
        div.appendChild(delBtn);

        li.appendChild(divList);
        li.appendChild(div);
        list.appendChild(li);
      });
    });
}

function deleteTodo(id) {
  fetch(`/todos/${id}`, { method: "DELETE" }).then(loadTodos);
}

function toggleTodo(id, done) {
  fetch(`/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  }).then(loadTodos);
}

// Untuk edit data
function showEditForm(todo, li) {
  li.innerHTML = "";

  const input = document.createElement("input");
  input.type = "text";
  input.value = todo.text;

  const timeEdit = document.createElement("input");
  timeEdit.type = "time";
  timeEdit.value = todo.time || "";

  const nameEdit = document.createElement("input");
  nameEdit.type = "text";
  nameEdit.placeholder = "Nama";
  nameEdit.value = todo.name || "";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾";
  saveBtn.onclick = () => {
    fetch(`/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input.value,
        time: timeEdit.value,
        name: nameEdit.value,
        done: todo.done,
      }),
    }).then(loadTodos);
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "❌";
  cancelBtn.onclick = loadTodos;

  li.appendChild(input);
  li.appendChild(timeEdit);
  li.appendChild(nameEdit);
  li.appendChild(saveBtn);
  li.appendChild(cancelBtn);
}

loadTodos();
