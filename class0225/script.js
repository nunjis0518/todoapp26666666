document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const itemsLeft = document.getElementById('items-left');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');

    let todos = JSON.parse(localStorage.getItem('glow-todos')) || [];
    let currentFilter = 'all';

    // Initialize
    renderTodos();

    // Event Listeners
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            addTodo(text);
            todoInput.value = '';
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    clearCompletedBtn.addEventListener('click', () => {
        todos = todos.filter(todo => !todo.completed);
        saveAndRender();
    });

    // Functions
    function addTodo(text) {
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.unshift(newTodo);
        saveAndRender();
    }

    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveAndRender();
    }

    function deleteTodo(id) {
        const item = document.querySelector(`[data-id="${id}"]`);
        item.style.transform = 'translateX(20px)';
        item.style.opacity = '0';
        
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveAndRender();
        }, 300);
    }

    function saveAndRender() {
        localStorage.setItem('glow-todos', JSON.stringify(todos));
        renderTodos();
    }

    function renderTodos() {
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        if (filteredTodos.length === 0) {
            renderEmptyState();
        } else {
            todoList.innerHTML = '';
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', todo.id);
                
                li.innerHTML = `
                    <label class="check-container">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <span class="todo-text">${escapeHTML(todo.text)}</span>
                    <button class="delete-btn" aria-label="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;

                // Checkbox toggle
                const checkbox = li.querySelector('input');
                checkbox.addEventListener('change', () => toggleTodo(todo.id));

                // Delete click
                const deleteBtn = li.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

                todoList.appendChild(li);
            });
        }

        updateStats();
    }

    function renderEmptyState() {
        let message = '할 일이 없습니다.';
        let icon = 'fa-clipboard-list';
        
        if (currentFilter === 'active') message = '모든 할 일을 완료했습니다!';
        if (currentFilter === 'completed') message = '완료된 항목이 없습니다.';

        todoList.innerHTML = `
            <div class="empty-state">
                <i class="fas ${icon}"></i>
                <p>${message}</p>
            </div>
        `;
    }

    function updateStats() {
        const activeCount = todos.filter(todo => !todo.completed).length;
        itemsLeft.innerText = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
