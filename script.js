// toggle dark/light theme
const toggleTheme = document.querySelector('#toggle-theme');
toggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const ariaPressed =
    toggleTheme.getAttribute('aria-pressed') === 'false' ? 'true' : 'false';
  toggleTheme.setAttribute('aria-pressed', ariaPressed);
  const themeIcon = toggleTheme.firstElementChild.classList.contains('fa-moon')
    ? 'fa-sun'
    : 'fa-moon';
  toggleTheme.firstElementChild.className = `fa-solid ${themeIcon}`;
  //store the theme locally
  storeTheme();
});

function storeTheme() {
  let theme;
  if (document.body.classList.contains('dark-mode')) {
    theme = 'dark';
  } else {
    theme = 'light';
  }
  localStorage.setItem('theme', theme);
}

//add todo
class Todo {
  constructor(name, status) {
    this.name = name;
    this.status = status;
  }
}

const addTodoForm = document.forms['add-todo-form'];
addTodoForm.addEventListener('submit', e => {
  e.preventDefault();
  const todo = e.target.querySelector('#add-todo').value.trim();
  const todoObject = new Todo(todo, 'pending');
  const alertError = document.querySelector('.alert-error');
  const alertSuccess = document.querySelector('.alert-success');
  if (todo.length) {
    createNewTodoItem(todo);
    storeTodo(todoObject);
    hideEmptyListInstructions();
    showTodoWrapper();
    e.target.reset();
    showAlert(alertSuccess);
  } else {
    showAlert(alertError);
  }
  e.target.querySelector('#add-todo').focus();
});

function showAlert(element) {
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}

function createNewTodoItem(text) {
  const todoList = document.querySelector('.todo-list');
  const listItem = document.createElement('li');
  listItem.classList.add('todo-item');
  listItem.innerHTML = `<label><input type="checkbox"><span></span></label><button class="delete-btn btn" aria-label="Delete todo"><i class="fa-solid fa-trash-can"></i></button>`;
  listItem.querySelector('span').textContent = text;
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

//display todos when pages loads and theme previously selected
document.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  //check if there are todos stored
  const arrayOfTodos = getTodos();
  if (arrayOfTodos.length !== 0) {
    arrayOfTodos.forEach(todo => {
      const newItem = createNewTodoItem(todo.name);
      if (todo.status === 'complete') {
        newItem.classList.add('complete');
        newItem.querySelector('input').setAttribute('checked', '');
      }
    });
    hideEmptyListInstructions();
    showTodoWrapper();
  }
});

//delete todos
const todoList = document.querySelector('.todo-list');
todoList.addEventListener('click', e => {
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
});

function removeTodoFromStorage(text) {
  const arrayOfTodos = getTodos();
  arrayOfTodos.forEach((todo, index) => {
    if (todo.name === text) {
      arrayOfTodos.splice(index, 1);
    }
  });
  localStorage.setItem('todos', JSON.stringify(arrayOfTodos));
}

//mark todo as completed
todoList.addEventListener('change', e => {
  if (e.target.closest('.todo-item label')) {
    const todoItem = e.target.closest('.todo-item');
    const inputChecked = todoItem.querySelector('input:checked');
    const todoName = todoItem.querySelector('span').textContent;
    const activeButton = getActiveNavButton();
    if (inputChecked) {
      todoItem.classList.add('complete');
      changeTodoStatus(todoName, 'complete');
      if (activeButton === 'pending-todos') {
        setTimeout(() => {
          todoItem.classList.add('hide');
        }, 500);
      }
    } else {
      todoItem.classList.remove('complete');
      changeTodoStatus(todoName, 'pending');
      if (activeButton === 'completed-todos') {
        setTimeout(() => {
          todoItem.classList.add('hide');
        }, 500);
      }
    }
  }
});

function changeTodoStatus(text, status) {
  const arrayOfTodos = getTodos();
  arrayOfTodos.forEach(todo => {
    if (todo.name === text) {
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

//clear all todos from the list
const clearListButton = document.querySelector('#clear-list');
clearListButton.addEventListener('click', () => {
  document.querySelector('.todo-list').replaceChildren('');
  showEmptyListInstructions();
  hideTodoWrapper();
  localStorage.removeItem('todos');
});

//search/filter todos
const searchForm = document.forms['search-form'];
searchForm.addEventListener('submit', e => {
  e.preventDefault();
});

searchForm.addEventListener('input', e => {
  const term = e.target.value.trim().toLowerCase();
  const activeButton = getActiveNavButton();
  let todoItems;
  if (activeButton === 'completed-todos') {
    todoItems = document.querySelectorAll('.todo-item.complete');
  } else if (activeButton === 'pending-todos') {
    todoItems = document.querySelectorAll('.todo-item:not(.complete)');
  } else {
    todoItems = document.querySelectorAll('.todo-item');
  }
  todoItems.forEach(item => {
    const todoName = item.textContent.toLowerCase();
    item.classList.toggle('hide', !todoName.includes(term));
  });
});

//navigation: show all tasks, completed tasks or pending tasks
const menu = document.querySelector('.todo-nav .menu');
menu.addEventListener('click', e => {
  const buttonID = e.target.id;
  const todoItems = document.querySelectorAll('.todo-item');
  todoItems.forEach(item => {
    if (buttonID === 'all-todos') {
      item.classList.remove('hide');
    } else if (buttonID === 'pending-todos') {
      item.classList.toggle('hide', item.classList.contains('complete'));
    } else if (buttonID === 'completed-todos') {
      item.classList.toggle('hide', !item.classList.contains('complete'));
    }
  });
  const navigationButtons = document.querySelectorAll('.todo-nav ul button');
  navigationButtons.forEach(button => {
    button.classList.toggle('active', e.target === button);
  });
});
