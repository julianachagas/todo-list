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

//add book
class Todo {
  constructor(name, status) {
    this.name = name;
    this.status = status;
  }
}

const addTodoForm = document.forms['add-todo-form'];
addTodoForm.addEventListener('submit', e => {
  e.preventDefault();
  const todo = e.target.querySelector('#add-todo').value;
  const todoObject = new Todo(todo, 'pending');
  createNewTodoItem(todo);
  storeTodo(todoObject);
  hideEmptyListInstructions();
  showTodoWrapper();
  e.target.querySelector('#add-todo').value = '';
});

function createNewTodoItem(text) {
  const listItem = document.createElement('li');
  listItem.classList.add('todo-item');
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  const span = document.createElement('span');
  span.textContent = text;
  label.append(input, span);
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('class', 'delete-btn btn');
  deleteBtn.setAttribute('aria-label', 'Delete todo');
  const deleteIcon = document.createElement('i');
  deleteIcon.setAttribute('class', 'fa-solid fa-trash-can');
  deleteBtn.append(deleteIcon);
  listItem.append(label, deleteBtn);
  const todoList = document.querySelector('.todo-list');
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
  const emptyListInstructions = document.querySelector(
    '.empty-list-instruction'
  );
  emptyListInstructions.style.display = 'none';
}

function showEmptyListInstructions() {
  const emptyListInstructions = document.querySelector(
    '.empty-list-instruction'
  );
  emptyListInstructions.style.display = 'block';
}

function showTodoWrapper() {
  const todoWrapper = document.querySelector('.todo-wrapper');
  todoWrapper.classList.add('show');
}

function hideTodoWrapper() {
  const todoWrapper = document.querySelector('.todo-wrapper');
  todoWrapper.classList.remove('show');
}

//display todos when pages loads and remember theme previously selected
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

//delete book
const todoList = document.querySelector('.todo-list');
todoList.addEventListener('click', e => {
  if (e.target.closest('.delete-btn')) {
    const todoItem = e.target.closest('.todo-item');
    todoItem.remove();
    const todoName = todoItem.firstElementChild.textContent;
    removeFromStorage(todoName);
    if (todoList.children.length === 0) {
      showEmptyListInstructions();
      hideTodoWrapper();
    }
  }
});

//mark todo as complete
const navigationButtons = document.querySelectorAll('.todo-nav ul button');
todoList.addEventListener('change', e => {
  if (e.target.closest('.todo-item label')) {
    const todoItem = e.target.closest('.todo-item');
    const inputChecked = todoItem.querySelector('input:checked');
    const todoName = todoItem.firstElementChild.textContent;
    let activeButton;
    navigationButtons.forEach(button => {
      if (button.classList.contains('active')) {
        activeButton = button.id;
      }
    });
    if (inputChecked) {
      todoItem.classList.add('complete');
      changeTodoStatus(todoName, 'complete');
      if (activeButton === 'pending-todos') {
        todoItem.classList.add('hide');
      }
    } else {
      todoItem.classList.remove('complete');
      changeTodoStatus(todoName, 'pending');
      if (activeButton === 'completed-todos') {
        todoItem.classList.add('hide');
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

function removeFromStorage(text) {
  const arrayOfTodos = getTodos();
  arrayOfTodos.forEach((todo, index) => {
    if (todo.name === text) {
      arrayOfTodos.splice(index, 1);
    }
  });
  localStorage.setItem('todos', JSON.stringify(arrayOfTodos));
}

//clear all todos from the list
const clearListButton = document.querySelector('#clear-list');
clearListButton.addEventListener('click', () => {
  const todoList = document.querySelector('.todo-list');
  todoList.replaceChildren('');
  showEmptyListInstructions();
  hideTodoWrapper();
  localStorage.removeItem('todos');
});

//search/filter todos
const searchForm = document.forms['search-form'];

searchForm.addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  let activeButton;
  navigationButtons.forEach(button => {
    if (button.classList.contains('active')) {
      activeButton = button.id;
    }
  });
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
  navigationButtons.forEach(button => {
    button.classList.toggle('active', e.target === button);
  });
});
