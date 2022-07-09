//selectors
const toggleThemeButton = document.querySelector('#toggle-theme');
const addTodoForm = document.forms['add-todo-form'];
const todoList = document.querySelector('.todo-list');
const clearListButton = document.querySelector('#clear-list');
const searchForm = document.forms['search-form'];
const todoMenu = document.querySelector('.todo-nav .menu');

//event listeners and functions

// toggle dark/light theme
toggleThemeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const ariaPressed =
    toggleThemeButton.getAttribute('aria-pressed') === 'false'
      ? 'true'
      : 'false';
  toggleThemeButton.setAttribute('aria-pressed', ariaPressed);
  const themeIcon = toggleThemeButton.firstElementChild.classList.contains(
    'fa-moon'
  )
    ? 'fa-sun'
    : 'fa-moon';
  toggleThemeButton.firstElementChild.className = `fa-solid ${themeIcon}`;
  storeTheme();
});

function storeTheme() {
  const theme = document.body.classList.contains('dark-mode')
    ? 'dark'
    : 'light';
  localStorage.setItem('theme', theme);
}

//add todo
class Todo {
  constructor(name, status) {
    this.name = name;
    this.status = status;
  }
}

addTodoForm.addEventListener('submit', e => {
  e.preventDefault();
  addTodo();
  e.target.reset();
  e.target.querySelector('#add-todo').focus();
});

function addTodo() {
  const todo = document.querySelector('#add-todo').value.trim();
  const todoObject = new Todo(todo, 'pending');
  const alertError = document.querySelector('.alert-error');
  const alertSuccess = document.querySelector('.alert-success');
  if (todo.length) {
    createNewTodoItem(todo);
    storeTodo(todoObject);
    hideEmptyListInstructions();
    showTodoWrapper();
    showAlert(alertSuccess);
  } else {
    showAlert(alertError);
  }
}

function createNewTodoItem(todo) {
  const todoList = document.querySelector('.todo-list');
  const listItem = document.createElement('li');
  listItem.classList.add('todo-item');
  listItem.innerHTML = `<label><input type="checkbox"><span></span></label><button class="delete-btn btn" aria-label="Delete todo"><i class="fa-solid fa-trash-can"></i></button>`;
  listItem.querySelector('span').textContent = todo;
  todoList.append(listItem);
  return listItem;
}

function getTodos() {
  let arrayOfTodos = JSON.parse(localStorage.getItem('todos'));
  if (!arrayOfTodos) {
    arrayOfTodos = [];
  }
  return arrayOfTodos;
}

function storeTodo(obj) {
  const arrayOfTodos = getTodos();
  arrayOfTodos.push(obj);
  localStorage.setItem('todos', JSON.stringify(arrayOfTodos));
}

function hideEmptyListInstructions() {
  document.querySelector('.empty-list-instruction').style.display = 'none';
}

function showEmptyListInstructions() {
  document.querySelector('.empty-list-instruction').style.display = 'block';
}

function showTodoWrapper() {
  document.querySelector('.todo-wrapper').classList.add('show');
}

function hideTodoWrapper() {
  document.querySelector('.todo-wrapper').classList.remove('show');
}

function showAlert(element) {
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}

//display theme and todos stored in local storage when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadTodos();
});

function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    toggleThemeButton.setAttribute('aria-pressed', 'true');
    toggleThemeButton.firstElementChild.className = `fa-solid fa-sun`;
  }
}

function loadTodos() {
  const arrayOfTodos = getTodos();
  if (arrayOfTodos.length !== 0) {
    arrayOfTodos.forEach(todo => {
      const newItem = createNewTodoItem(todo.name);
      if (todo.status === 'completed') {
        newItem.classList.add('completed');
        newItem.querySelector('input').setAttribute('checked', '');
      }
    });
    hideEmptyListInstructions();
    showTodoWrapper();
  }
}

//delete todos
todoList.addEventListener('click', deleteTodo);

function deleteTodo(e) {
  if (e.target.closest('.delete-btn')) {
    const todoItem = e.target.closest('.todo-item');
    const todoName = todoItem.querySelector('span').textContent;
    todoItem.remove();
    removeTodoFromStorage(todoName);
    if (todoList.children.length === 0) {
      showEmptyListInstructions();
      hideTodoWrapper();
    }
  }
}

function removeTodoFromStorage(todoName) {
  const arrayOfTodos = getTodos();
  arrayOfTodos.forEach((todo, index) => {
    if (todo.name === todoName) {
      arrayOfTodos.splice(index, 1);
    }
  });
  localStorage.setItem('todos', JSON.stringify(arrayOfTodos));
}

//update todo: mark todo as completed
todoList.addEventListener('change', e => {
  if (e.target.closest('.todo-item label')) {
    const todoItem = e.target.closest('.todo-item');
    updateTodo(todoItem);
  }
});

function updateTodo(todoItem) {
  const todoName = todoItem.querySelector('span').textContent;
  todoItem.classList.toggle('completed');
  const status = todoItem.classList.contains('completed')
    ? 'completed'
    : 'pending';
  storeTodoStatus(todoName, status);
  const activeButton = getActiveNavButton();
  if (
    (activeButton === 'pending-todos' && status === 'completed') ||
    (activeButton === 'completed-todos' && status === 'pending')
  ) {
    setTimeout(() => {
      todoItem.classList.add('hide');
    }, 500);
  }
}

function storeTodoStatus(name, status) {
  const arrayOfTodos = getTodos();
  arrayOfTodos.forEach(todo => {
    if (todo.name === name) {
      todo.status = status;
    }
  });
  localStorage.setItem('todos', JSON.stringify(arrayOfTodos));
}

function getActiveNavButton() {
  const navigationButtons = document.querySelectorAll('.todo-nav ul button');
  let activeButton;
  navigationButtons.forEach(button => {
    if (button.classList.contains('active')) {
      activeButton = button.id;
    }
  });
  return activeButton;
}

//clear all todos from the list and remove from local storage
clearListButton.addEventListener('click', () => {
  document.querySelector('.todo-list').replaceChildren('');
  showEmptyListInstructions();
  hideTodoWrapper();
  localStorage.removeItem('todos');
});

//search/filter todos
searchForm.addEventListener('submit', e => {
  e.preventDefault();
});

searchForm.addEventListener('input', filterTodos);

function filterTodos(e) {
  const searchWord = e.target.value.trim().toLowerCase();
  const activeButton = getActiveNavButton();
  const selector =
    activeButton === 'completed-todos'
      ? '.todo-item.completed'
      : activeButton === 'pending-todos'
      ? '.todo-item:not(.completed)'
      : '.todo-item';
  const todoItems = document.querySelectorAll(`${selector}`);
  todoItems.forEach(item => {
    const todoName = item.textContent.toLowerCase();
    item.classList.toggle('hide', !todoName.includes(searchWord));
  });
}

//navigation: show all todos, completed todos or pending todos
todoMenu.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const buttonID = e.target.id;
    const todoItems = document.querySelectorAll('.todo-item');
    todoItems.forEach(item => {
      switch (buttonID) {
        case 'all-todos':
          item.classList.remove('hide');
          break;
        case 'pending-todos':
          item.classList.toggle('hide', item.classList.contains('completed'));
          break;
        case 'completed-todos':
          item.classList.toggle('hide', !item.classList.contains('completed'));
          break;
      }
    });
    const navigationButtons = document.querySelectorAll('.todo-nav ul button');
    navigationButtons.forEach(button => {
      button.classList.toggle('active', e.target === button);
    });
  }
});
