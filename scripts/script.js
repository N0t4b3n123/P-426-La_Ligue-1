// Clock
const timeEl = document.getElementById('time');
function tick(){ timeEl.textContent = new Date().toLocaleTimeString(); }
tick(); setInterval(tick,1000);

// Counter
let count = 0;
const countEl = document.getElementById('count');
document.getElementById('inc').addEventListener('click', ()=>{ count++; countEl.textContent = count; });
document.getElementById('dec').addEventListener('click', ()=>{ count--; countEl.textContent = count; });
document.getElementById('reset').addEventListener('click', ()=>{ count = 0; countEl.textContent = count; });

// Todo
const todos = [];
const todosEl = document.getElementById('todos');
const newTodo = document.getElementById('newTodo');
function renderTodos(){
    todosEl.innerHTML = '';
    todos.forEach((t,i)=>{
        const li = document.createElement('li');
        li.textContent = t;
        li.style.cursor = 'pointer';
        li.title = 'Click to remove';
        li.addEventListener('click', ()=>{ todos.splice(i,1); renderTodos(); });
        todosEl.appendChild(li);
    });
}
newTodo.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && newTodo.value.trim()){
        todos.push(newTodo.value.trim()); newTodo.value=''; renderTodos();
    }
});

// Fetch example (uses public placeholder API)
document.getElementById('loadPosts').addEventListener('click', async ()=>{
    const postsEl = document.getElementById('posts');
    postsEl.innerHTML = '<li>Loading...</li>';
    try{
        const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        const data = await res.json();
        postsEl.innerHTML = '';
        data.forEach(p=>{
            const li = document.createElement('li');
            li.textContent = p.title;
            postsEl.appendChild(li);
        });
    }catch(err){ postsEl.innerHTML = '<li>Error loading posts</li>'; }
});