document.addEventListener('DOMContentLoaded', () => {
    let currentPath = ['Мои курсы'];
    let courseContent = null;

    const navbar = document.getElementById('navbar');
    const content = document.getElementById('content');

    function updateNavbar() {
        navbar.innerHTML = '';
        currentPath.forEach((item, index) => {
            const btn = document.createElement('div');
            btn.className = 'nav_button' + (index === currentPath.length - 1 ? ' active' : '');
            btn.textContent = item;
            btn.onclick = () => {
                currentPath = currentPath.slice(0, index + 1);
                renderContent();
            };
            navbar.appendChild(btn);
        });
    }

    function renderContent() {
        updateNavbar();
        content.innerHTML = '';
        if (currentPath.length === 1) {
            renderCoursesList();
        } else if (courseContent) {
            renderCourseContent();
        } else {
            fetchCourseStructure();
        }
    }

    function renderCoursesList() {
        const courses = [
            { name: 'module1', type: 'module' },
            { name: 'module2', type: 'module' }
        ]; // This would be dynamically fetched from GitHub API in a real scenario
        courses.forEach(item => {
            const entry = document.createElement('div');
            entry.className = 'courses_entry';
            entry.textContent = item.name;
            entry.onclick = () => {
                currentPath.push(item.name);
                renderContent();
            };
            content.appendChild(entry);
        });
    }

    function fetchCourseStructure() {
        const path = currentPath.slice(1).join('/');
        fetch(`courses/${path}/index.json`)
            .then(res => res.json())
            .then(data => {
                courseContent = data;
                renderCourseContent();
            })
            .catch(() => {
                const subItems = [
                    { name: 'course1', type: 'course' },
                    { name: 'module2', type: 'module' }
                ]; // Simulated substructure
                subItems.forEach(item => {
                    const entry = document.createElement('div');
                    entry.className = 'courses_entry';
                    entry.textContent = item.name;
                    entry.onclick = () => {
                        currentPath.push(item.name);
                        if (item.type === 'course') courseContent = null;
                        renderContent();
                    };
                    content.appendChild(entry);
                });
            });
    }

    function renderCourseContent() {
        const nav = document.createElement('div');
        nav.className = 'problems_navbar';
        courseContent.forEach((item, index) => {
            const btn = document.createElement('div');
            btn.className = 'problems_navbutton';
            btn.textContent = item.type === 'theory' ? `Теория ${index + 1}` : `Задача ${index + 1}`;
            btn.onclick = () => renderItem(item, btn);
            nav.appendChild(btn);
        });
        content.appendChild(nav);
        renderItem(courseContent[0], nav.children[0]); // Load first item
    }

    function renderItem(item, button) {
        Array.from(content.querySelectorAll('.problems_navbutton')).forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        let html = marked.parse(item.content || '');
        if (item.type === 'task') {
            html += `
                <div>
                    <input id="task-input" class="form_input" type="text">
                    <button id="check-btn">Проверить</button>
                    <div id="result">Задача обработана</div>
                </div>`;
        }
        content.innerHTML = '';
        content.appendChild(nav);
        content.innerHTML += html;
        if (item.type === 'task') {
            const checkBtn = document.getElementById('check-btn');
            const input = document.getElementById('task-input');
            const result = document.getElementById('result');
            checkBtn.onclick = () => {
                const answer = input.value.trim();
                const correct = item.answer === answer;
                button.className = `problems_navbutton ${correct ? 'checked_good' : 'checked_bad'}`;
                input.disabled = correct;
                const now = new Date().toLocaleString('ru');
                result.textContent = `Задача обработана\n${correct ? 'Результат: 1 из 1 баллов' : 'Сообщение: Неверно, попробуйте ещё раз!'}\nПоследний раз обновлено: ${now}`;
                if (correct) checkBtn.remove();
                localStorage.setItem(`${currentPath.join('/')}/${item.file}`, correct ? '1' : '0');
            };
            const status = localStorage.getItem(`${currentPath.join('/')}/${item.file}`);
            if (status) {
                button.className = `problems_navbutton ${status === '1' ? 'checked_good' : 'checked_bad'}`;
                input.disabled = status === '1';
                result.textContent = `Задача обработана\n${status === '1' ? 'Результат: 1 из 1 баллов' : 'Сообщение: Неверно, попробуйте ещё раз!'}\nПоследний раз обновлено: ${new Date().toLocaleString('ru')}`;
                if (status === '1') checkBtn.remove();
            }
        }
    }

    renderContent();
});