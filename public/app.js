const PROVIDERS = ['openrouter', 'openai', 'gemini', 'anthropic', 'freemodel', 'groq', 'together', 'ollama'];
const PROVIDER_URLS = {
    'openrouter': 'https://openrouter.ai/keys',
    'openai': 'https://platform.openai.com/api-keys',
    'gemini': 'https://aistudio.google.com/app/apikey',
    'anthropic': 'https://console.anthropic.com/settings/keys',
    'freemodel': 'https://freemodel.dev/',
    'groq': 'https://console.groq.com/keys',
    'together': 'https://api.together.xyz/settings/api-keys',
    'ollama': 'https://ollama.com/'
};
let currentConfig = {};

function loadFilters() {
    const hideDisabled = localStorage.getItem('hideDisabled') === 'true';
    const hideMissing = localStorage.getItem('hideMissing') === 'true';
    document.getElementById('hide-disabled').checked = hideDisabled;
    document.getElementById('hide-missing').checked = hideMissing;
}

function saveFilters() {
    localStorage.setItem('hideDisabled', document.getElementById('hide-disabled').checked);
    localStorage.setItem('hideMissing', document.getElementById('hide-missing').checked);
}

async function fetchConfig() {
    loadFilters();
    try {
        const res = await fetch('/api/config');
        currentConfig = await res.json();
        renderProviders();
    } catch (err) {
        console.error('Failed to load config', err);
    }
}

function maskKey(key) {
    if (!key) return '';
    if (key.length <= 12) return '********';
    return key.substring(0, 6) + '...' + key.substring(key.length - 4);
}

function getOrderedProviders() {
    const order = currentConfig.providerOrder || [];
    return [...PROVIDERS].sort((a, b) => {
        const idxA = order.indexOf(a);
        const idxB = order.indexOf(b);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });
}

function renderProviders() {
    const tbody = document.getElementById('providers-tbody');
    const hideDisabled = document.getElementById('hide-disabled').checked;
    const hideMissing = document.getElementById('hide-missing').checked;
    
    saveFilters();

    const providersToRender = getOrderedProviders().filter(id => {
        const config = currentConfig.providers?.[id];
        const hasKey = !!config && !!config.apiKey;
        const isActive = hasKey && (config.isActive !== false);

        if (hideMissing && !hasKey) return false;
        if (hideDisabled && hasKey && !isActive) return false;
        return true;
    });

    tbody.innerHTML = providersToRender.map((id, index) => {
        const config = currentConfig.providers?.[id];
        const hasKey = !!config && !!config.apiKey;
        const isActive = hasKey && (config.isActive !== false);

        let statusHtml = '';
        if (!hasKey) {
            statusHtml = '<span class="status status-inactive">Missing</span>';
        } else if (isActive) {
            statusHtml = '<span class="status status-active">Active</span>';
        } else {
            statusHtml = '<span class="status" style="color: var(--text-muted); border-color: var(--text-muted);">Disabled</span>';
        }

        return `
            <tr class="draggable-row" data-id="${id}" draggable="true">
                <td class="priority-number"></td>
                <td class="provider-name">
                    <div class="provider-name-inner">
                        <span class="drag-handle" title="Drag to reorder">[↕]</span>
                        <span>${id}</span>
                        <a href="${PROVIDER_URLS[id]}" target="_blank" rel="noopener noreferrer" style="color: var(--border-hover); text-decoration: none; flex-shrink: 0;" title="Get API Key">[↗]</a>
                    </div>
                </td>
                <td>
                    ${statusHtml}
                </td>
                <td class="config-cell">
                    ${hasKey ?
                `<span class="masked-key">${maskKey(config.apiKey)}</span>` :
                `<input type="password" id="input-${id}" class="key-input" placeholder="Enter API key...">`
            }
                </td>
                <td class="action-cell">
                    <div class="action-group">
                        ${hasKey ?
                `<button class="btn btn-primary" onclick="toggleKey('${id}', ${!isActive})">${isActive ? 'Disable' : 'Enable'}</button>` +
                `<button class="btn btn-danger" onclick="removeKey('${id}')">Remove</button>` :
                `<button class="btn btn-primary" id="btn-${id}" onclick="saveKey('${id}')">Save</button>`
            }
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    attachDragListeners();
}

let draggedRow = null;

function attachDragListeners() {
    const rows = document.querySelectorAll('.draggable-row');
    rows.forEach(row => {
        row.addEventListener('dragstart', (e) => {
            draggedRow = row;
            setTimeout(() => row.classList.add('dragging'), 0);
        });
        
        row.addEventListener('dragend', () => {
            setTimeout(() => {
                if (draggedRow) {
                    draggedRow.classList.remove('dragging');
                    draggedRow = null;
                    saveNewOrder();
                }
            }, 0);
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            const tbody = document.getElementById('providers-tbody');
            const afterElement = getDragAfterElement(tbody, e.clientY);
            if (afterElement == null) {
                tbody.appendChild(draggedRow);
            } else {
                tbody.insertBefore(draggedRow, afterElement);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable-row:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function saveNewOrder() {
    const newOrder = [...document.querySelectorAll('.draggable-row')].map(row => row.dataset.id);
    try {
        const res = await fetch('/api/config/order', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: newOrder })
        });
        if (!res.ok) {
            showToast('Failed to save priority order');
        }
    } catch (err) {
        console.error(err);
    }
}

async function saveKey(id) {
    const input = document.getElementById(`input-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    const key = input.value.trim();

    if (!key) {
        input.focus();
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: id, key })
        });

        if (res.ok) {
            showToast(`[${id}] Key saved successfully`);
            await fetchConfig();
        } else {
            showToast(`[${id}] Failed to save key`);
        }
    } catch (err) {
        console.error(err);
        showToast(`Error saving ${id}`);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Save';
        }
    }
}

async function removeKey(id) {
    if (!confirm(`Are you sure you want to remove the ${id} key?`)) return;

    try {
        const res = await fetch(`/api/config/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast(`[${id}] Key removed`);
            await fetchConfig();
        }
    } catch (err) {
        console.error(err);
        showToast(`Error removing ${id}`);
    }
}

async function toggleKey(id, isActive) {
    try {
        const res = await fetch(`/api/config/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive })
        });
        if (res.ok) {
            showToast(`[${id}] is now ${isActive ? 'enabled' : 'disabled'}`);
            await fetchConfig();
        } else {
            showToast(`Failed to toggle ${id}`);
        }
    } catch (err) {
        console.error(err);
        showToast(`Error toggling ${id}`);
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Initialize
fetchConfig();
