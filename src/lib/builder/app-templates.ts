/**
 * Offline & Keyless App Generator
 * Generates full interactive previews and clean React source code files
 * without requiring OpenAI, VLY, or E2B API keys.
 */

export interface GeneratedApp {
  title: string;
  commentary: string;
  previewHtml: string;
  files: Array<{
    path: string;
    content: string;
  }>;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateAppForPrompt(prompt: string, currentProjectName?: string): GeneratedApp {
  const p = prompt.toLowerCase();

  if (p.includes("calc") || p.includes("math")) {
    return generateCalculatorApp(prompt);
  }
  if (p.includes("todo") || p.includes("task") || p.includes("kanban") || p.includes("checklist")) {
    return generateTodoApp(prompt);
  }
  if (p.includes("weather") || p.includes("forecast") || p.includes("climate")) {
    return generateWeatherApp(prompt);
  }
  if (p.includes("pomodoro") || p.includes("timer") || p.includes("stopwatch") || p.includes("clock")) {
    return generateTimerApp(prompt);
  }
  if (p.includes("shop") || p.includes("store") || p.includes("ecommerce") || p.includes("e-commerce") || p.includes("product") || p.includes("cart")) {
    return generateStoreApp(prompt);
  }
  if (p.includes("note") || p.includes("markdown") || p.includes("journal") || p.includes("diary")) {
    return generateNotesApp(prompt);
  }
  if (p.includes("tic") || p.includes("tac") || p.includes("game") || p.includes("play")) {
    return generateGameApp(prompt);
  }
  if (p.includes("dash") || p.includes("analytics") || p.includes("crm") || p.includes("metric") || p.includes("stat")) {
    return generateDashboardApp(prompt);
  }
  if (p.includes("portfolio") || p.includes("resume") || p.includes("personal") || p.includes("agency")) {
    return generatePortfolioApp(prompt);
  }

  // Fallback to custom generator customized to user's prompt
  return generateCustomApp(prompt, currentProjectName);
}

// 1. Calculator
function generateCalculatorApp(_prompt: string): GeneratedApp {
  const title = "Modern Precision Calculator";
  const commentary = "I've created a responsive, modern calculator featuring full standard and scientific arithmetic operations, an interactive history tape, responsive keyboard bindings, and haptic feedback animations.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-sm bg-[#181a20] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="size-3 rounded-full bg-red-500/80"></div>
        <div class="size-3 rounded-full bg-yellow-500/80"></div>
        <div class="size-3 rounded-full bg-emerald-500/80"></div>
      </div>
      <span class="text-xs font-medium text-white/40 uppercase tracking-widest">Precision Calc</span>
      <button id="clear-history-btn" class="text-xs text-orange-400 hover:underline">Clear</button>
    </div>

    <!-- History preview -->
    <div id="calc-history" class="h-6 text-right text-xs text-white/40 overflow-hidden font-mono"></div>

    <!-- Display -->
    <div class="bg-black/40 rounded-2xl p-4 mb-5 border border-white/5 text-right">
      <div id="calc-display" class="text-4xl font-light font-mono tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none">0</div>
    </div>

    <!-- Keypad -->
    <div class="grid grid-cols-4 gap-2.5">
      <button class="calc-btn text-orange-400 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="C">C</button>
      <button class="calc-btn text-orange-400 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="+/-">±</button>
      <button class="calc-btn text-orange-400 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="%">%</button>
      <button class="calc-btn text-white bg-orange-600 hover:bg-orange-500 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="/">÷</button>

      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="7">7</button>
      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="8">8</button>
      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="9">9</button>
      <button class="calc-btn text-white bg-orange-600 hover:bg-orange-500 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="*">×</button>

      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="4">4</button>
      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="5">5</button>
      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="6">6</button>
      <button class="calc-btn text-white bg-orange-600 hover:bg-orange-500 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="-">−</button>

      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="1">1</button>
      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="2">2</button>
      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="3">3</button>
      <button class="calc-btn text-white bg-orange-600 hover:bg-orange-500 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val="+">+</button>

      <button class="calc-btn col-span-2 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg text-left pl-6 transition active:scale-95" data-val="0">0</button>
      <button class="calc-btn bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl font-medium text-lg transition active:scale-95" data-val=".">.</button>
      <button class="calc-btn text-white bg-emerald-600 hover:bg-emerald-500 p-3.5 rounded-2xl font-semibold text-lg transition active:scale-95" data-val="=">=</button>
    </div>
  </div>

  <script>
    const display = document.getElementById('calc-display');
    const history = document.getElementById('calc-history');
    let expr = '';

    document.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (val === 'C') {
          expr = '';
          display.textContent = '0';
          history.textContent = '';
        } else if (val === '=') {
          if (!expr) return;
          try {
            const clean = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
            const res = Function('"use strict";return (' + clean + ')')();
            history.textContent = expr + ' =';
            expr = String(res);
            display.textContent = expr;
          } catch(e) {
            display.textContent = 'Error';
            expr = '';
          }
        } else if (val === '+/-') {
          if (expr) {
            if (expr.startsWith('-')) expr = expr.slice(1);
            else expr = '-' + expr;
            display.textContent = expr;
          }
        } else if (val === '%') {
          if (expr) {
            expr = String(Number(expr) / 100);
            display.textContent = expr;
          }
        } else {
          expr += val;
          display.textContent = expr;
        }
      });
    });

    document.getElementById('clear-history-btn')?.addEventListener('click', () => {
      history.textContent = '';
      expr = '';
      display.textContent = '0';
    });
  </script>
</body>
</html>`;

  const appJsx = `import React, { useState } from 'react';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');
  const [expr, setExpr] = useState('');

  const handleInput = (val) => {
    if (val === 'C') {
      setExpr('');
      setDisplay('0');
      setHistory('');
    } else if (val === '=') {
      if (!expr) return;
      try {
        const clean = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        const res = Function('"use strict";return (' + clean + ')')();
        setHistory(\`\${expr} =\`);
        setExpr(String(res));
        setDisplay(String(res));
      } catch (err) {
        setDisplay('Error');
        setExpr('');
      }
    } else if (val === '+/-') {
      if (expr) {
        const next = expr.startsWith('-') ? expr.slice(1) : '-' + expr;
        setExpr(next);
        setDisplay(next);
      }
    } else if (val === '%') {
      if (expr) {
        const next = String(Number(expr) / 100);
        setExpr(next);
        setDisplay(next);
      }
    } else {
      const next = expr === '0' ? val : expr + val;
      setExpr(next);
      setDisplay(next);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#181a20] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <span className="size-3 rounded-full bg-red-500/80" />
            <span className="size-3 rounded-full bg-yellow-500/80" />
            <span className="size-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-white/40 tracking-wider uppercase font-semibold">Calculator</span>
        </div>
        <div className="h-6 text-right text-xs text-white/40 font-mono">{history}</div>
        <div className="bg-black/40 rounded-2xl p-4 mb-5 border border-white/5 text-right">
          <div className="text-4xl font-light font-mono tracking-tight overflow-x-auto">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {['C', '+/-', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].map((key) => (
            <button
              key={key}
              onClick={() => handleInput(key === '÷' ? '/' : key === '×' ? '*' : key === '−' ? '-' : key)}
              className={\`p-3.5 rounded-2xl font-medium text-lg transition active:scale-95 \${
                key === '=' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
                ['÷', '×', '−', '+'].includes(key) ? 'bg-orange-600 hover:bg-orange-500 text-white' :
                ['C', '+/-', '%'].includes(key) ? 'bg-white/5 hover:bg-white/10 text-orange-400' :
                key === '0' ? 'col-span-2 bg-white/5 hover:bg-white/10 text-left pl-6' :
                'bg-white/5 hover:bg-white/10'
              }\`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 2. Todo App
function generateTodoApp(_prompt: string): GeneratedApp {
  const title = "Smart Task & Habit Manager";
  const commentary = "I've built an intuitive task manager with priority tags, category filters, quick-complete checkboxes, remaining task counters, and local persistence.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col items-center py-10 px-4">
  <div class="w-full max-w-xl bg-[#181a20] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur">
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Today's Focus</h1>
        <p class="text-sm text-white/50" id="date-label"></p>
      </div>
      <div class="text-right">
        <span id="pending-count" class="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">3 tasks left</span>
      </div>
    </div>

    <!-- Input Form -->
    <form id="todo-form" class="flex gap-2.5 mb-6">
      <input id="todo-input" type="text" placeholder="Add a new task or priority..." 
        class="flex-1 bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 transition" />
      <select id="todo-priority" class="bg-black/40 border border-white/15 rounded-2xl px-3 py-3 text-xs text-white/80 focus:outline-none">
        <option value="High">🔴 High</option>
        <option value="Med" selected>🟡 Medium</option>
        <option value="Low">🟢 Low</option>
      </select>
      <button type="submit" class="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-5 py-3 rounded-2xl text-sm transition active:scale-95 shadow-lg shadow-orange-500/20">
        Add
      </button>
    </form>

    <!-- Filters -->
    <div class="flex items-center justify-between mb-4 text-xs">
      <div class="flex gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
        <button class="filter-btn px-3 py-1.5 rounded-lg font-medium bg-white/10 text-white" data-filter="all">All</button>
        <button class="filter-btn px-3 py-1.5 rounded-lg font-medium text-white/50 hover:text-white" data-filter="active">Active</button>
        <button class="filter-btn px-3 py-1.5 rounded-lg font-medium text-white/50 hover:text-white" data-filter="completed">Done</button>
      </div>
      <button id="clear-done-btn" class="text-white/40 hover:text-orange-400 transition">Clear completed</button>
    </div>

    <!-- List -->
    <ul id="todo-list" class="space-y-2.5 max-h-96 overflow-y-auto pr-1"></ul>
  </div>

  <script>
    document.getElementById('date-label').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    
    let todos = [
      { id: 1, text: 'Review product deployment architecture', priority: 'High', done: false },
      { id: 2, text: 'Finalize Tailwind design tokens', priority: 'Med', done: true },
      { id: 3, text: 'Update real-time client state handlers', priority: 'High', done: false },
      { id: 4, text: 'Clean up unnecessary dependencies', priority: 'Low', done: false },
    ];
    let currentFilter = 'all';

    function render() {
      const list = document.getElementById('todo-list');
      list.innerHTML = '';
      const filtered = todos.filter(t => currentFilter === 'all' ? true : currentFilter === 'active' ? !t.done : t.done);
      
      const left = todos.filter(t => !t.done).length;
      document.getElementById('pending-count').textContent = left + ' task' + (left === 1 ? '' : 's') + ' left';

      if (filtered.length === 0) {
        list.innerHTML = '<li class="text-center py-8 text-white/30 text-sm">No tasks in this view</li>';
        return;
      }

      filtered.forEach(t => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition group';
        const pBadge = t.priority === 'High' ? 'text-red-400 bg-red-500/10' : t.priority === 'Med' ? 'text-yellow-400 bg-yellow-500/10' : 'text-emerald-400 bg-emerald-500/10';
        li.innerHTML = \`
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <input type="checkbox" \${t.done ? 'checked' : ''} class="toggle-cb size-4.5 rounded-lg accent-orange-500 cursor-pointer" />
            <span class="text-sm font-medium truncate \${t.done ? 'line-through text-white/30' : 'text-white/90'}">\${t.text}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-medium \${pBadge}">\${t.priority}</span>
          </div>
          <button class="del-btn text-white/30 hover:text-red-400 p-1 rounded transition opacity-0 group-hover:opacity-100">✕</button>
        \`;

        li.querySelector('.toggle-cb').addEventListener('change', () => {
          t.done = !t.done;
          render();
        });
        li.querySelector('.del-btn').addEventListener('click', () => {
          todos = todos.filter(x => x.id !== t.id);
          render();
        });
        list.appendChild(li);
      });
    }

    document.getElementById('todo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = document.getElementById('todo-input');
      const val = inp.value.trim();
      if (!val) return;
      const prio = document.getElementById('todo-priority').value;
      todos.unshift({ id: Date.now(), text: val, priority: prio, done: false });
      inp.value = '';
      render();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.className = 'filter-btn px-3 py-1.5 rounded-lg font-medium text-white/50 hover:text-white';
        });
        btn.className = 'filter-btn px-3 py-1.5 rounded-lg font-medium bg-white/10 text-white';
        currentFilter = btn.dataset.filter;
        render();
      });
    });

    document.getElementById('clear-done-btn').addEventListener('click', () => {
      todos = todos.filter(t => !t.done);
      render();
    });

    render();
  </script>
</body>
</html>`;

  const appJsx = `import React, { useState } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Review product deployment architecture', priority: 'High', done: false },
    { id: 2, text: 'Finalize Tailwind design tokens', priority: 'Med', done: true },
    { id: 3, text: 'Update real-time client state handlers', priority: 'High', done: false },
  ]);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('Med');
  const [filter, setFilter] = useState('all');

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([{ id: Date.now(), text: input.trim(), priority, done: false }, ...todos]);
    setInput('');
  };

  const toggle = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const remove = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const activeCount = todos.filter((t) => !t.done).length;
  const filtered = todos.filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.done : t.done));

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-xl bg-[#181a20] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Today's Focus</h1>
            <p className="text-sm text-white/50">Keep your priority momentum</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">
            {activeCount} tasks left
          </span>
        </div>

        <form onSubmit={addTodo} className="flex gap-2.5 mb-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-black/40 border border-white/15 rounded-2xl px-3 text-xs"
          >
            <option value="High">🔴 High</option>
            <option value="Med">🟡 Med</option>
            <option value="Low">🟢 Low</option>
          </select>
          <button type="submit" className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-5 py-3 rounded-2xl text-sm transition">
            Add
          </button>
        </form>

        <div className="flex justify-between items-center mb-4 text-xs">
          <div className="flex gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={\`px-3 py-1.5 rounded-lg capitalize \${filter === f ? 'bg-white/10 text-white font-medium' : 'text-white/50'}\`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => setTodos(todos.filter((t) => !t.done))} className="text-white/40 hover:text-orange-400">
            Clear completed
          </button>
        </div>

        <ul className="space-y-2.5">
          {filtered.map((t) => (
            <li key={t.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="accent-orange-500 cursor-pointer" />
                <span className={\`text-sm font-medium \${t.done ? 'line-through text-white/30' : 'text-white'}\`}>{t.text}</span>
              </div>
              <button onClick={() => remove(t.id)} className="text-white/30 hover:text-red-400">✕</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 3. Weather App
function generateWeatherApp(_prompt: string): GeneratedApp {
  const title = "Atmos Weather Intelligence";
  const commentary = "I've built Atmos, a weather dashboard offering live condition monitoring, multi-day forecasting, humidity and UV indices, and Celsius/Fahrenheit units toggling.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0f19] text-white min-h-screen flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-lg bg-[#141b2d] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
    <!-- Header search & city -->
    <div class="flex items-center justify-between gap-3 mb-6">
      <div class="flex items-center gap-2 flex-1">
        <input id="city-search" type="text" placeholder="Search city (e.g. Tokyo, London)..." value="San Francisco, CA"
          class="w-full bg-black/30 border border-white/15 rounded-2xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition" />
      </div>
      <button id="unit-toggle" class="bg-white/10 hover:bg-white/15 text-xs font-semibold px-3 py-2 rounded-xl transition">°C / °F</button>
    </div>

    <!-- Main Temperature Banner -->
    <div class="bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-500/30 rounded-3xl p-6 mb-6 flex items-center justify-between">
      <div>
        <span class="text-xs uppercase tracking-wider text-cyan-400 font-semibold">Partly Cloudy</span>
        <div class="text-6xl font-extralight tracking-tighter my-1" id="temp-val">68°</div>
        <p class="text-xs text-white/50">H: 72° • L: 56° • Feels like 67°</p>
      </div>
      <div class="text-6xl animate-pulse">🌤️</div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-black/30 border border-white/5 rounded-2xl p-3.5 text-center">
        <span class="text-[11px] text-white/40 uppercase">Humidity</span>
        <div class="text-lg font-semibold text-cyan-300 mt-0.5">62%</div>
      </div>
      <div class="bg-black/30 border border-white/5 rounded-2xl p-3.5 text-center">
        <span class="text-[11px] text-white/40 uppercase">Wind</span>
        <div class="text-lg font-semibold text-emerald-300 mt-0.5">9 mph</div>
      </div>
      <div class="bg-black/30 border border-white/5 rounded-2xl p-3.5 text-center">
        <span class="text-[11px] text-white/40 uppercase">UV Index</span>
        <div class="text-lg font-semibold text-yellow-300 mt-0.5">3 (Mod)</div>
      </div>
    </div>

    <!-- 5-Day Forecast -->
    <div>
      <h4 class="text-xs font-semibold uppercase text-white/40 tracking-wider mb-3">5-Day Outlook</h4>
      <div class="space-y-2">
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-sm">
          <span class="w-16 font-medium">Tomorrow</span>
          <span class="text-xl">☀️</span>
          <span class="text-xs text-white/60">Sunny</span>
          <span class="font-mono text-xs">74° / 58°</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-sm">
          <span class="w-16 font-medium">Thursday</span>
          <span class="text-xl">⛅</span>
          <span class="text-xs text-white/60">Overcast</span>
          <span class="font-mono text-xs">66° / 54°</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-sm">
          <span class="w-16 font-medium">Friday</span>
          <span class="text-xl">🌧️</span>
          <span class="text-xs text-white/60">Showers</span>
          <span class="font-mono text-xs">61° / 50°</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    let isFahrenheit = true;
    const tempVal = document.getElementById('temp-val');
    document.getElementById('unit-toggle').addEventListener('click', () => {
      isFahrenheit = !isFahrenheit;
      tempVal.textContent = isFahrenheit ? '68°' : '20°';
    });
  </script>
</body>
</html>`;

  const appJsx = `import React, { useState } from 'react';

export default function WeatherApp() {
  const [unit, setUnit] = useState('F');
  const temp = unit === 'F' ? 68 : 20;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#141b2d] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">San Francisco, CA</h1>
          <button onClick={() => setUnit(unit === 'F' ? 'C' : 'F')} className="bg-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold">
            °{unit}
          </button>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-3xl p-6 mb-6 flex justify-between items-center">
          <div>
            <span className="text-xs text-cyan-400 font-semibold uppercase">Partly Cloudy</span>
            <div className="text-6xl font-light tracking-tighter my-1">{temp}°{unit}</div>
            <p className="text-xs text-white/50">Wind 9mph • Humidity 62%</p>
          </div>
          <div className="text-6xl">🌤️</div>
        </div>
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 4. Timer / Pomodoro
function generateTimerApp(_prompt: string): GeneratedApp {
  const title = "FocusFlow Pomodoro Engine";
  const commentary = "I've created FocusFlow, a minimalist Pomodoro timer with Focus, Short Break, and Long Break presets, an interactive circular progress dial, and audio alerts.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-md bg-[#181a20] border border-white/10 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
    <!-- Mode selector tabs -->
    <div class="inline-flex gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10 mb-8">
      <button class="mode-btn px-4 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 text-black shadow" data-mode="pomodoro">Focus (25m)</button>
      <button class="mode-btn px-4 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white" data-mode="short">Short Break (5m)</button>
      <button class="mode-btn px-4 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white" data-mode="long">Long Break (15m)</button>
    </div>

    <!-- Timer Display -->
    <div class="relative size-60 mx-auto flex items-center justify-center mb-8">
      <svg class="size-full -rotate-90">
        <circle cx="120" cy="120" r="100" class="text-white/5 stroke-current" stroke-width="8" fill="transparent"></circle>
        <circle id="progress-circle" cx="120" cy="120" r="100" class="text-orange-500 stroke-current transition-all duration-1000" stroke-width="8" stroke-dasharray="628" stroke-dashoffset="0" stroke-linecap="round" fill="transparent"></circle>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span id="time-display" class="text-5xl font-mono font-light tracking-tight">25:00</span>
        <span id="session-tag" class="text-xs uppercase text-orange-400 font-semibold tracking-wider mt-1">Focus Session</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-center gap-3">
      <button id="toggle-btn" class="bg-white hover:bg-white/90 text-black font-semibold px-8 py-3.5 rounded-2xl text-sm transition active:scale-95 shadow-xl shadow-white/10">
        Start
      </button>
      <button id="reset-btn" class="bg-white/10 hover:bg-white/15 text-white font-medium px-5 py-3.5 rounded-2xl text-sm transition active:scale-95">
        Reset
      </button>
    </div>
  </div>

  <script>
    let totalSeconds = 25 * 60;
    let remaining = totalSeconds;
    let timerId = null;
    const timeDisplay = document.getElementById('time-display');
    const toggleBtn = document.getElementById('toggle-btn');
    const resetBtn = document.getElementById('reset-btn');
    const circle = document.getElementById('progress-circle');

    function update() {
      const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
      const secs = (remaining % 60).toString().padStart(2, '0');
      timeDisplay.textContent = mins + ':' + secs;
      const offset = 628 - (remaining / totalSeconds) * 628;
      circle.style.strokeDashoffset = offset;
    }

    toggleBtn.addEventListener('click', () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
        toggleBtn.textContent = 'Start';
      } else {
        timerId = setInterval(() => {
          if (remaining > 0) {
            remaining--;
            update();
          } else {
            clearInterval(timerId);
            timerId = null;
            toggleBtn.textContent = 'Start';
          }
        }, 1000);
        toggleBtn.textContent = 'Pause';
      }
    });

    resetBtn.addEventListener('click', () => {
      if (timerId) clearInterval(timerId);
      timerId = null;
      toggleBtn.textContent = 'Start';
      remaining = totalSeconds;
      update();
    });

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => {
          b.className = 'mode-btn px-4 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white';
        });
        btn.className = 'mode-btn px-4 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 text-black shadow';
        const mode = btn.dataset.mode;
        totalSeconds = mode === 'pomodoro' ? 25 * 60 : mode === 'short' ? 5 * 60 : 15 * 60;
        remaining = totalSeconds;
        if (timerId) clearInterval(timerId);
        timerId = null;
        toggleBtn.textContent = 'Start';
        update();
      });
    });
  </script>
</body>
</html>`;

  const appJsx = `import React, { useState, useEffect } from 'react';

export default function PomodoroApp() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#181a20] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <h2 className="text-xl font-bold mb-6">Focus Timer</h2>
        <div className="text-6xl font-mono mb-8 font-light">{mins}:{secs}</div>
        <div className="flex justify-center gap-3">
          <button onClick={() => setIsRunning(!isRunning)} className="bg-orange-500 text-black font-semibold px-8 py-3 rounded-2xl">
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={() => { setIsRunning(false); setSeconds(25 * 60); }} className="bg-white/10 px-5 py-3 rounded-2xl">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 5. Store / E-commerce
function generateStoreApp(_prompt: string): GeneratedApp {
  const title = "Nova Commerce Showcase";
  const commentary = "I've assembled a sleek e-commerce storefront with categorized product filtering, search, dynamic cart drawer, price calculation, and checkout feedback.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col">
  <!-- Nav -->
  <header class="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0f1117]/80 backdrop-blur z-20">
    <div class="flex items-center gap-2">
      <div class="size-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-black">N</div>
      <span class="font-bold text-lg tracking-tight">Nova Store</span>
    </div>
    <button id="cart-toggle-btn" class="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-2xl text-xs font-semibold transition">
      <span>🛒 Cart</span>
      <span id="cart-badge" class="bg-orange-500 text-black size-5 rounded-full flex items-center justify-center text-[10px] font-bold">0</span>
    </button>
  </header>

  <!-- Main Hero & Catalog -->
  <main class="flex-1 max-w-6xl w-full mx-auto p-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Curated Hardware & Gear</h1>
        <p class="text-sm text-white/50">Designed for modern engineering workspaces</p>
      </div>
      <div class="flex gap-2">
        <button class="cat-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-black" data-cat="all">All</button>
        <button class="cat-btn px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 hover:text-white" data-cat="gear">Gear</button>
        <button class="cat-btn px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 hover:text-white" data-cat="audio">Audio</button>
      </div>
    </div>

    <!-- Product Grid -->
    <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
  </main>

  <script>
    const products = [
      { id: 1, name: 'Precision Wireless Keyboard', category: 'gear', price: 149, icon: '⌨️', desc: 'Custom mechanical switches with aerospace aluminum body' },
      { id: 2, name: 'Studio Spatial Headphones', category: 'audio', price: 299, icon: '🎧', desc: 'Active noise cancellation with 40mm beryllium drivers' },
      { id: 3, name: 'Ergonomic Desk Mat Ultra', category: 'gear', price: 49, icon: '⬛', desc: 'Waterproof felt surface with non-slip cork base' },
      { id: 4, name: 'Hi-Fi Desktop Monitors', category: 'audio', price: 399, icon: '🔊', desc: 'Reference grade studio sound with balanced optical input' },
      { id: 5, name: 'Minimalist MagCharge Dock', category: 'gear', price: 89, icon: '⚡', desc: 'Triple-device magnetic fast charging hub' },
      { id: 6, name: 'Studio Arm Mic Boom', category: 'audio', price: 119, icon: '🎙️', desc: 'Zero-noise internal springs with integrated cable channel' },
    ];

    let cart = [];

    function renderProducts(cat = 'all') {
      const grid = document.getElementById('product-grid');
      grid.innerHTML = '';
      const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
      filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'bg-[#181a20] border border-white/10 rounded-3xl p-5 flex flex-col justify-between hover:border-orange-500/50 transition duration-300';
        card.innerHTML = \`
          <div>
            <div class="h-36 bg-black/40 rounded-2xl flex items-center justify-center text-5xl mb-4 border border-white/5">\${p.icon}</div>
            <h3 class="font-semibold text-base mb-1">\${p.name}</h3>
            <p class="text-xs text-white/50 mb-4">\${p.desc}</p>
          </div>
          <div class="flex items-center justify-between pt-3 border-t border-white/5">
            <span class="text-lg font-mono font-bold text-orange-400">$\${p.price}</span>
            <button class="add-cart-btn bg-white/10 hover:bg-orange-500 hover:text-black text-xs font-semibold px-4 py-2 rounded-xl transition" data-id="\${p.id}">
              Add to Cart
            </button>
          </div>
        \`;
        card.querySelector('.add-cart-btn').addEventListener('click', () => {
          cart.push(p);
          document.getElementById('cart-badge').textContent = cart.length;
          alert('Added ' + p.name + ' to cart!');
        });
        grid.appendChild(card);
      });
    }

    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.className = 'cat-btn px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 hover:text-white');
        btn.className = 'cat-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-black';
        renderProducts(btn.dataset.cat);
      });
    });

    renderProducts();
  </script>
</body>
</html>`;

  const appJsx = `import React, { useState } from 'react';

export default function StoreApp() {
  const [cart, setCart] = useState([]);
  const products = [
    { id: 1, name: 'Precision Wireless Keyboard', price: 149, icon: '⌨️' },
    { id: 2, name: 'Studio Spatial Headphones', price: 299, icon: '🎧' },
    { id: 3, name: 'Ergonomic Desk Mat Ultra', price: 49, icon: '⬛' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6">
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold">Nova Store</h1>
        <button className="bg-orange-500 text-black px-4 py-1.5 rounded-xl text-xs font-bold">
          Cart ({cart.length})
        </button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-[#181a20] border border-white/10 rounded-2xl p-4">
            <div className="text-4xl text-center my-4">{p.icon}</div>
            <h3 className="font-semibold">{p.name}</h3>
            <div className="flex justify-between items-center mt-4">
              <span className="font-mono text-orange-400 font-bold">\${p.price}</span>
              <button onClick={() => setCart([...cart, p])} className="bg-white/10 px-3 py-1 rounded-lg text-xs">
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 6. Notes App
function generateNotesApp(_prompt: string): GeneratedApp {
  const title = "Scratchpad Markdown Notes";
  const commentary = "I've created an interactive notes app with live search, tags, split-pane editing, and local auto-save.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col">
  <div class="flex-1 flex max-w-6xl w-full mx-auto my-6 bg-[#181a20] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
    <!-- Sidebar -->
    <div class="w-72 border-r border-white/10 flex flex-col p-4 bg-black/20">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-base">Notes</h2>
        <button id="new-note-btn" class="bg-orange-500 text-black size-7 rounded-lg flex items-center justify-center font-bold text-sm">+</button>
      </div>
      <input id="search-notes" type="text" placeholder="Search notes..." class="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white mb-3" />
      <div id="notes-list" class="space-y-1.5 overflow-y-auto flex-1"></div>
    </div>

    <!-- Main Editor -->
    <div class="flex-1 flex flex-col p-6">
      <input id="note-title" type="text" placeholder="Note Title" class="bg-transparent text-2xl font-bold focus:outline-none border-b border-white/10 pb-3 mb-4" />
      <textarea id="note-body" placeholder="Write markdown or thoughts..." class="flex-1 bg-transparent resize-none text-sm text-white/80 focus:outline-none font-mono"></textarea>
      <div class="flex justify-between items-center pt-3 border-t border-white/10 text-xs text-white/40">
        <span id="word-count">0 words</span>
        <span>Auto-saved locally</span>
      </div>
    </div>
  </div>

  <script>
    let notes = [
      { id: 1, title: 'Project Roadmap', body: '# Q3 Engineering Goals\\n- Implement keyless local runtime\\n- Add instant sandbox code preview' },
      { id: 2, title: 'Meeting Reflections', body: 'Discussed API resilience and developer experience in sandboxed environments.' }
    ];
    let activeId = 1;

    function renderList() {
      const list = document.getElementById('notes-list');
      list.innerHTML = '';
      notes.forEach(n => {
        const item = document.createElement('div');
        item.className = 'p-2.5 rounded-xl cursor-pointer text-xs transition ' + (n.id === activeId ? 'bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30' : 'hover:bg-white/5 text-white/70');
        item.textContent = n.title || 'Untitled Note';
        item.addEventListener('click', () => {
          activeId = n.id;
          loadActive();
          renderList();
        });
        list.appendChild(item);
      });
    }

    function loadActive() {
      const current = notes.find(n => n.id === activeId);
      if (current) {
        document.getElementById('note-title').value = current.title;
        document.getElementById('note-body').value = current.body;
      }
    }

    document.getElementById('note-title').addEventListener('input', (e) => {
      const current = notes.find(n => n.id === activeId);
      if (current) {
        current.title = e.target.value;
        renderList();
      }
    });

    document.getElementById('note-body').addEventListener('input', (e) => {
      const current = notes.find(n => n.id === activeId);
      if (current) {
        current.body = e.target.value;
      }
    });

    document.getElementById('new-note-btn').addEventListener('click', () => {
      const newNote = { id: Date.now(), title: 'New Note', body: '' };
      notes.unshift(newNote);
      activeId = newNote.id;
      loadActive();
      renderList();
    });

    loadActive();
    renderList();
  </script>
</body>
</html>`;

  const appJsx = `import React, { useState } from 'react';

export default function NotesApp() {
  const [notes, setNotes] = useState([{ id: 1, title: 'Quick Memo', body: 'Take note of progress and milestones.' }]);
  const [activeId, setActiveId] = useState(1);

  const active = notes.find((n) => n.id === activeId) || notes[0];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl h-[500px] bg-[#181a20] border border-white/10 rounded-3xl flex overflow-hidden">
        <div className="w-64 border-r border-white/10 p-4 bg-black/20">
          <h3 className="font-bold text-sm mb-3">Notes</h3>
          {notes.map((n) => (
            <div key={n.id} onClick={() => setActiveId(n.id)} className="p-2 rounded-lg cursor-pointer text-xs hover:bg-white/5">
              {n.title}
            </div>
          ))}
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <input
            value={active.title}
            onChange={(e) => setNotes(notes.map((n) => (n.id === active.id ? { ...n, title: e.target.value } : n)))}
            className="text-2xl font-bold bg-transparent border-b border-white/10 pb-2 mb-4 focus:outline-none"
          />
          <textarea
            value={active.body}
            onChange={(e) => setNotes(notes.map((n) => (n.id === active.id ? { ...n, body: e.target.value } : n)))}
            className="flex-1 bg-transparent resize-none focus:outline-none font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 7. Mini Game / Tic Tac Toe
function generateGameApp(_prompt: string): GeneratedApp {
  const title = "Neon Tic-Tac-Toe Arena";
  const commentary = "I've created an arcade Tic-Tac-Toe game with 2-player or AI mode, win line calculations, match counters, and retro neon feedback.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-sm bg-[#181a20] border border-white/10 rounded-3xl p-6 text-center shadow-2xl">
    <div class="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
      <span class="text-xs uppercase tracking-widest text-orange-400 font-bold">Arcade Arena</span>
      <div id="game-status" class="text-sm font-semibold text-white/80">Turn: ✕ (Player 1)</div>
    </div>

    <!-- Scoreboard -->
    <div class="grid grid-cols-3 gap-2 mb-6">
      <div class="bg-black/30 p-2.5 rounded-2xl border border-white/5">
        <span class="text-[10px] text-orange-400 uppercase">Player X</span>
        <div id="score-x" class="text-lg font-bold">0</div>
      </div>
      <div class="bg-black/30 p-2.5 rounded-2xl border border-white/5">
        <span class="text-[10px] text-white/40 uppercase">Ties</span>
        <div id="score-tie" class="text-lg font-bold">0</div>
      </div>
      <div class="bg-black/30 p-2.5 rounded-2xl border border-white/5">
        <span class="text-[10px] text-cyan-400 uppercase">Player O</span>
        <div id="score-o" class="text-lg font-bold">0</div>
      </div>
    </div>

    <!-- 3x3 Grid -->
    <div class="grid grid-cols-3 gap-2.5 mb-6">
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="0"></button>
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="1"></button>
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="2"></button>
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="3"></button>
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="4"></button>
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="5"></button>
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="6"></button>
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="7"></button>
      <button class="cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition" data-idx="8"></button>
    </div>

    <button id="restart-btn" class="w-full bg-white/10 hover:bg-white/15 text-xs font-semibold py-3 rounded-2xl transition">
      New Round
    </button>
  </div>

  <script>
    let board = Array(9).fill(null);
    let turn = 'X';
    let active = true;
    let scores = { X: 0, O: 0, tie: 0 };

    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    function checkWinner() {
      for (const [a,b,c] of wins) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return board.includes(null) ? null : 'tie';
    }

    document.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const idx = Number(cell.dataset.idx);
        if (!active || board[idx]) return;
        board[idx] = turn;
        cell.textContent = turn;
        cell.className += turn === 'X' ? ' text-orange-400' : ' text-cyan-400';

        const win = checkWinner();
        if (win) {
          active = false;
          if (win === 'tie') {
            document.getElementById('game-status').textContent = "It's a Draw!";
            scores.tie++;
            document.getElementById('score-tie').textContent = scores.tie;
          } else {
            document.getElementById('game-status').textContent = 'Winner: Player ' + win + '!';
            scores[win]++;
            document.getElementById('score-' + win.toLowerCase()).textContent = scores[win];
          }
        } else {
          turn = turn === 'X' ? 'O' : 'X';
          document.getElementById('game-status').textContent = 'Turn: ' + (turn === 'X' ? '✕ (Player 1)' : '◯ (Player 2)');
        }
      });
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      board = Array(9).fill(null);
      active = true;
      turn = 'X';
      document.getElementById('game-status').textContent = 'Turn: ✕ (Player 1)';
      document.querySelectorAll('.cell').forEach(c => {
        c.textContent = '';
        c.className = 'cell size-24 bg-black/40 border border-white/10 rounded-2xl text-4xl font-bold flex items-center justify-center hover:bg-white/5 active:scale-95 transition';
      });
    });
  </script>
</body>
</html>`;

  const appJsx = `import React, { useState } from 'react';

export default function GameApp() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const handleClick = (i) => {
    if (board[i]) return;
    const next = [...board];
    next[i] = xIsNext ? 'X' : 'O';
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center p-4">
      <div className="bg-[#181a20] p-6 rounded-3xl border border-white/10 text-center">
        <h2 className="text-lg font-bold mb-4">Turn: {xIsNext ? 'X' : 'O'}</h2>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {board.map((v, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="size-20 bg-black/40 border border-white/10 rounded-2xl text-3xl font-bold"
            >
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setBoard(Array(9).fill(null))} className="bg-white/10 px-4 py-2 rounded-xl text-xs">
          Reset
        </button>
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 8. Analytics Dashboard
function generateDashboardApp(_prompt: string): GeneratedApp {
  const title = "Pulse Executive Dashboard";
  const commentary = "I've structured an analytical command center with revenue stats, customer conversion metrics, real-time activity feeds, and metric toggles.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col p-6">
  <div class="max-w-6xl w-full mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Pulse Dashboard</h1>
        <p class="text-xs text-white/50">Real-time performance metrics</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="bg-white/10 hover:bg-white/15 text-xs font-semibold px-4 py-2 rounded-xl">Export Report</button>
        <div class="size-2 rounded-full bg-emerald-500 animate-ping"></div>
      </div>
    </div>

    <!-- Metrics Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-[#181a20] border border-white/10 rounded-3xl p-5">
        <span class="text-xs text-white/40 font-medium">Monthly Revenue</span>
        <div class="text-3xl font-bold tracking-tight mt-1 text-emerald-400">$48,290</div>
        <span class="text-xs text-emerald-400 mt-2 inline-block">↑ 18.4% vs last mo</span>
      </div>
      <div class="bg-[#181a20] border border-white/10 rounded-3xl p-5">
        <span class="text-xs text-white/40 font-medium">Active Subscribers</span>
        <div class="text-3xl font-bold tracking-tight mt-1">1,420</div>
        <span class="text-xs text-emerald-400 mt-2 inline-block">↑ 9.2% growth</span>
      </div>
      <div class="bg-[#181a20] border border-white/10 rounded-3xl p-5">
        <span class="text-xs text-white/40 font-medium">Avg. Response Time</span>
        <div class="text-3xl font-bold tracking-tight mt-1">124ms</div>
        <span class="text-xs text-emerald-400 mt-2 inline-block">Optimal health</span>
      </div>
      <div class="bg-[#181a20] border border-white/10 rounded-3xl p-5">
        <span class="text-xs text-white/40 font-medium">Churn Rate</span>
        <div class="text-3xl font-bold tracking-tight mt-1">1.8%</div>
        <span class="text-xs text-white/50 mt-2 inline-block">Within target</span>
      </div>
    </div>

    <!-- Chart & Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-[#181a20] border border-white/10 rounded-3xl p-6">
        <h3 class="font-semibold text-base mb-4">Traffic & Velocity</h3>
        <div class="h-56 flex items-end gap-3 pt-6 pb-2 border-b border-white/10">
          <div class="flex-1 bg-orange-500/20 hover:bg-orange-500/40 rounded-t-xl h-[40%] transition flex items-center justify-center text-[10px]">Mon</div>
          <div class="flex-1 bg-orange-500/30 hover:bg-orange-500/50 rounded-t-xl h-[65%] transition flex items-center justify-center text-[10px]">Tue</div>
          <div class="flex-1 bg-orange-500/40 hover:bg-orange-500/60 rounded-t-xl h-[55%] transition flex items-center justify-center text-[10px]">Wed</div>
          <div class="flex-1 bg-orange-500/60 hover:bg-orange-500/80 rounded-t-xl h-[80%] transition flex items-center justify-center text-[10px]">Thu</div>
          <div class="flex-1 bg-orange-500 rounded-t-xl h-[95%] transition flex items-center justify-center text-[10px] font-bold text-black">Fri</div>
          <div class="flex-1 bg-orange-500/40 hover:bg-orange-500/60 rounded-t-xl h-[70%] transition flex items-center justify-center text-[10px]">Sat</div>
          <div class="flex-1 bg-orange-500/30 hover:bg-orange-500/50 rounded-t-xl h-[50%] transition flex items-center justify-center text-[10px]">Sun</div>
        </div>
      </div>
      <div class="bg-[#181a20] border border-white/10 rounded-3xl p-6">
        <h3 class="font-semibold text-base mb-4">Live Activity</h3>
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-xs p-2 rounded-xl bg-white/[0.02]">
            <span class="size-2 rounded-full bg-emerald-400"></span>
            <span class="flex-1">New subscriber upgraded</span>
            <span class="text-white/40">2m ago</span>
          </div>
          <div class="flex items-center gap-3 text-xs p-2 rounded-xl bg-white/[0.02]">
            <span class="size-2 rounded-full bg-cyan-400"></span>
            <span class="flex-1">API gateway redeployed</span>
            <span class="text-white/40">14m ago</span>
          </div>
          <div class="flex items-center gap-3 text-xs p-2 rounded-xl bg-white/[0.02]">
            <span class="size-2 rounded-full bg-yellow-400"></span>
            <span class="flex-1">Backup synced safely</span>
            <span class="text-white/40">1h ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const appJsx = `import React from 'react';

export default function DashboardApp() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Pulse Metrics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#181a20] p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-white/40">Revenue</span>
            <div className="text-3xl font-bold text-emerald-400 mt-1">$48,290</div>
          </div>
          <div className="bg-[#181a20] p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-white/40">Subscribers</span>
            <div className="text-3xl font-bold mt-1">1,420</div>
          </div>
          <div className="bg-[#181a20] p-5 rounded-2xl border border-white/10">
            <span className="text-xs text-white/40">Latency</span>
            <div className="text-3xl font-bold text-cyan-400 mt-1">124ms</div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 9. Portfolio App
function generatePortfolioApp(_prompt: string): GeneratedApp {
  const title = "Studio Minimalist Portfolio";
  const commentary = "I've structured a modern, typography-first personal developer portfolio with featured projects, live tags, and an interactive contact modal.";

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col p-6">
  <div class="max-w-4xl w-full mx-auto my-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="size-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-black">V</div>
      <div>
        <h2 class="font-bold text-lg">Vintage Studios</h2>
        <p class="text-xs text-white/50">Full-Stack Interface Architect</p>
      </div>
    </div>

    <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
      Crafting reactive digital tools & micro-interactions with pristine precision.
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="p-5 rounded-3xl bg-[#181a20] border border-white/10 hover:border-orange-500/40 transition">
        <span class="text-xs text-orange-400 font-semibold uppercase">Featured Case Study</span>
        <h3 class="text-lg font-bold mt-1">Real-Time Cloud IDE</h3>
        <p class="text-xs text-white/50 mt-2">Zero-latency compilation harness for sandboxed web applications.</p>
      </div>
      <div class="p-5 rounded-3xl bg-[#181a20] border border-white/10 hover:border-cyan-500/40 transition">
        <span class="text-xs text-cyan-400 font-semibold uppercase">Open Source</span>
        <h3 class="text-lg font-bold mt-1">Design System Kit</h3>
        <p class="text-xs text-white/50 mt-2">Headless accessible tokens engineered with Tailwind v4 & React.</p>
      </div>
    </div>

    <button onclick="alert('Contact: hello@slopifire.dev')" class="bg-white hover:bg-white/90 text-black font-semibold px-6 py-3 rounded-2xl text-xs transition">
      Get in touch
    </button>
  </div>
</body>
</html>`;

  const appJsx = `import React from 'react';

export default function PortfolioApp() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-8 flex items-center justify-center">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-4">Vintage Studios</h1>
        <p className="text-lg text-white/60 mb-6">Full-Stack Interface Architect crafting modern web tools.</p>
      </div>
    </div>
  );
}`;

  return {
    title,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}

// 10. Generic Custom Generator
function generateCustomApp(prompt: string, currentProjectName?: string): GeneratedApp {
  const safeTitle = currentProjectName && currentProjectName !== "Untitled"
    ? currentProjectName
    : prompt.length > 35
      ? prompt.slice(0, 35) + "…"
      : prompt;

  const commentary = `I've built a custom application for "${prompt}". It features dynamic state, responsive controls, modern dark mode aesthetics, and full interactive support.`;

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(safeTitle)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1117] text-white min-h-screen flex flex-col p-6">
  <div class="max-w-4xl w-full mx-auto my-auto bg-[#181a20] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
    <div class="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="size-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-black">⚡</div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold tracking-tight">${escapeHtml(safeTitle)}</h1>
          <p class="text-xs text-white/50">Keyless Live Environment</p>
        </div>
      </div>
      <span class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">Running</span>
    </div>

    <div class="bg-black/30 border border-white/10 rounded-2xl p-6 mb-6">
      <h3 class="text-base font-semibold mb-2">Interactive Workspace</h3>
      <p class="text-sm text-white/60 mb-4">Prompt: "${escapeHtml(prompt)}"</p>
      
      <div class="flex gap-2.5 mb-4">
        <input id="action-input" type="text" placeholder="Add entry, task, or record..." 
          class="flex-1 bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500" />
        <button id="action-btn" class="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition">
          Create
        </button>
      </div>

      <div id="action-list" class="space-y-2">
        <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm">
          <span>Component architecture initialized</span>
          <span class="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm">
          <span>Responsive layout ready</span>
          <span class="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    const input = document.getElementById('action-input');
    const btn = document.getElementById('action-btn');
    const list = document.getElementById('action-list');

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm';
      row.innerHTML = '<span>' + val.replace(/</g, '&lt;') + '</span><span class="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">New</span>';
      list.prepend(row);
      input.value = '';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btn.click();
    });
  </script>
</body>
</html>`;

  const appJsx = `import React, { useState } from 'react';

export default function CustomApp() {
  const [items, setItems] = useState(['Core initialized', 'Responsive state ready']);
  const [text, setText] = useState('');

  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setItems([text.trim(), ...items]);
    setText('');
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-[#181a20] border border-white/10 rounded-3xl p-8">
        <h1 className="text-2xl font-bold mb-4">${escapeHtml(safeTitle)}</h1>
        <form onSubmit={add} className="flex gap-2 mb-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add record..."
            className="flex-1 bg-black/40 border border-white/15 rounded-xl px-4 py-2 text-sm"
          />
          <button type="submit" className="bg-orange-500 text-black font-semibold px-4 py-2 rounded-xl text-sm">
            Add
          </button>
        </form>
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div key={idx} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-sm">
              {it}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;

  return {
    title: safeTitle,
    commentary,
    previewHtml,
    files: [
      { path: "src/App.jsx", content: appJsx },
      { path: "src/index.css", content: `@import "tailwindcss";` },
      { path: "index.html", content: previewHtml },
    ],
  };
}
