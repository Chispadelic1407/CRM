// Main Application JavaScript
class CRMApp {
    constructor() {
        this.baseUrl = 'http://localhost:3001'; // Example backend URL
        this.currentUser = null;
        this.contacts = [];
        this.authToken = null;
        this.extraIA = []; // Property to hold extra AI configs
        this.init();
    }

    init() {
        this.setupSecurityFeatures();
        this.bindEvents();
        this.checkExistingAuth();
        this.startDashboardUpdates();
    }

    setupSecurityFeatures() {
        // Anti-screenshot protection
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
                e.preventDefault();
                this.showSecurityWarning();
            }
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                this.showSecurityWarning();
            }
        });

        // Disable right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showSecurityWarning();
        });

        // Blur content when window loses focus (anti-screenshot)
        window.addEventListener('blur', () => document.body.classList.add('security-blur'));
        window.addEventListener('focus', () => document.body.classList.remove('security-blur'));

        // Detect developer tools
        const threshold = 160;
        setInterval(() => {
            const devtoolsOpen = (window.outerHeight - window.innerHeight > threshold) ||
                                 (window.outerWidth - window.innerWidth > threshold);
            if (devtoolsOpen && !document.body.classList.contains('security-blur')) {
                this.showSecurityWarning();
                document.body.classList.add('security-blur');
            }
        }, 500);
    }

    showSecurityWarning() {
        this.showToast('Security feature: This action is not allowed.', 'warning');
    }

    bindEvents() {
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('send-sms-btn')) this.sendSMS(button.dataset.contactId);
            if (button.classList.contains('call-btn')) this.makeCall(button.dataset.contactId);
            if (button.classList.contains('edit-btn')) this.editContact(button.dataset.contactId);
        });

        const searchInput = document.getElementById('search-contacts');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.filterContacts(e.target.value), 300);
            });
        }

        document.getElementById('status-filter')?.addEventListener('change', (e) => this.filterContactsByStatus(e.target.value));

        document.getElementById('open-api-config-btn')?.addEventListener('click', (e) => this._toggleApiConfigPanel(e));
        document.getElementById('api-config-form')?.addEventListener('submit', (e) => this._saveApiConfig(e));
        document.getElementById('add-ia-btn')?.addEventListener('click', () => this._addExtraIa());
        document.addEventListener('click', (e) => this._closeApiConfigPanelOnClickOutside(e));
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showToast('Por favor, introduce usuario y contraseña', 'error');
            return;
        }

        try {
            let user, success, message;
            if (username === 'admin' && password === 'admin123') {
                user = { id: 1, username: 'admin', role: 'admin' };
                success = true;
            } else if (username === 'asesor' && password === 'asesor123') {
                user = { id: 2, username: 'asesor', role: 'asesor' };
                success = true;
            } else {
                success = false;
                message = 'Credenciales inválidas';
            }
            const data = { success, user, message, token: 'fake-jwt-token-for-demo' };

            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.currentUser = data.user;
                this.authToken = data.token;

                document.getElementById('login-container').classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');

                this.setupUserInterface();
                this.showToast(`¡Bienvenido ${data.user.username}!`, 'success');
                this.loadContacts();
            } else {
                this.showToast(data.message || 'Credenciales inválidas', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Falló el inicio de sesión. Por favor, inténtalo de nuevo.', 'error');
        }
    }

    async handleLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.authToken = null;

        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        this.setupUserInterface();
        this.showToast('Sesión cerrada correctamente', 'success');
    }

    checkExistingAuth() {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('currentUser');
        if (storedToken && storedUser) {
            try {
                this.authToken = storedToken;
                this.currentUser = JSON.parse(storedUser);
                document.getElementById('login-container').classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');
                this.setupUserInterface();
                this.loadContacts();
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                this.handleLogout();
            }
        }
    }

    setupUserInterface() {
        const userInfo = document.getElementById('user-info');
        const adminElements = document.querySelectorAll('.admin-only');

        if (this.currentUser && userInfo) {
            userInfo.textContent = `${this.currentUser.username} (${this.currentUser.role})`;
            const isAdmin = this.currentUser.role === 'admin';
            adminElements.forEach(el => el.classList.toggle('hidden', !isAdmin));
        } else {
            if (userInfo) userInfo.textContent = '';
            adminElements.forEach(el => el.classList.add('hidden'));
        }
    }

    _toggleApiConfigPanel(e) {
        e.stopPropagation();
        const panel = document.getElementById('api-config-panel');
        if (!panel) return;
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            this._loadApiConfig();
        }
    }

    _closeApiConfigPanelOnClickOutside(e) {
        const panel = document.getElementById('api-config-panel');
        const button = document.getElementById('open-api-config-btn');
        if (panel && button && !panel.classList.contains('hidden') && !panel.contains(e.target) && !button.contains(e.target)) {
            panel.classList.add('hidden');
        }
    }

    async _loadApiConfig() {
        this.showToast('Cargando configuración...', 'success');
        // Mock API call
        setTimeout(() => {
            const mockConfig = {
                twilio: { sid: 'AC123...', token: 'tok_abc...', phone: '+15005550006' },
                gemini: { key: 'AIzaSy...', url: 'https://gemini.api.google.com' },
                extraIA: [{ name: 'OpenAI', apiUrl: 'https://api.openai.com/v1' }]
            };
            document.getElementById('twilio-sid').value = mockConfig.twilio?.sid || '';
            document.getElementById('twilio-token').value = mockConfig.twilio?.token || '';
            document.getElementById('twilio-phone').value = mockConfig.twilio?.phone || '';
            document.getElementById('gemini-api-key').value = mockConfig.gemini?.key || '';
            document.getElementById('gemini-url').value = mockConfig.gemini?.url || '';
            this.extraIA = mockConfig.extraIA || [];
            this._refreshExtraIaList();
        }, 500);
    }

    async _saveApiConfig(e) {
        e.preventDefault();
        // In a real app, this would send data to a server.
        this.showToast('¡Configuración guardada!', 'success');
        document.getElementById('api-config-panel').classList.add('hidden');
    }

    _addExtraIa() {
        this._showPromptModal('Agregar Nueva IA', [
            { id: 'ia-name', placeholder: 'Nombre de la IA', label: 'Nombre IA' },
            { id: 'ia-url', placeholder: 'URL del API o endpoint', label: 'URL del API' }
        ], (values) => {
            const name = values['ia-name'];
            const apiUrl = values['ia-url'];
            if (name && apiUrl) {
                this.extraIA.push({ name, apiUrl });
                this._refreshExtraIaList();
            }
        });
    }

    _refreshExtraIaList() {
        const listElement = document.getElementById('extra-ia-list');
        if (!listElement) return;
        listElement.innerHTML = this.extraIA.map((ia, index) =>
            `<div class="extra-ia-item">
                <span><strong>${ia.name}:</strong> ${ia.apiUrl}</span>
                <button type="button" class="btn-danger btn-small" onclick="crmApp._removeExtraIa(${index})"><i class="fas fa-trash"></i></button>
            </div>`
        ).join('');
    }

    _removeExtraIa(index) {
        this.extraIA.splice(index, 1);
        this._refreshExtraIaList();
    }

    _showPromptModal(title, fields, callback) {
        document.querySelector('.overlay')?.remove();
        const modal = document.createElement('div');
        modal.className = 'overlay';
        const fieldsHtml = fields.map(field => `
            <div style="margin-bottom: 10px;">
                <label for="${field.id}" style="display: block; margin-bottom: 5px;">${field.label}:</label>
                <input type="text" id="${field.id}" placeholder="${field.placeholder}">
            </div>
        `).join('');
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${title}</h3>
                ${fieldsHtml}
                <div class="modal-actions">
                    <button id="prompt-cancel-btn" class="btn-secondary">Cancelar</button>
                    <button id="prompt-save-btn" class="btn-success">Guardar</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('prompt-save-btn').onclick = () => {
            const values = {};
            fields.forEach(field => values[field.id] = document.getElementById(field.id).value);
            callback(values);
            modal.remove();
        };
        document.getElementById('prompt-cancel-btn').onclick = () => modal.remove();
    }

    loadContacts() {
        this.contacts = [
            {id: 1, name: 'Juan Pérez', phone: '+525512345678', email: 'juan@example.com', status: 'Pendiente', notes: 'Interesado en el producto X'},
            {id: 2, name: 'María García', phone: '+525587654321', email: 'maria@example.com', status: 'Contactado', notes: 'Llamar la próxima semana'},
            {id: 3, name: 'Carlos López', phone: '+525511223344', email: 'carlos@example.com', status: 'Requiere_Seguimiento', notes: 'Envió propuesta'},
            {id: 4, name: 'Ana Fernández', phone: '+525544332211', email: 'ana@example.com', status: 'No_Interesado', notes: 'Ya tiene otro proveedor'}
        ];
        this.renderContacts();
        this.updateDashboard();
    }

    renderContacts(contactsToRender = this.contacts) {
        const tbody = document.querySelector('#contacts-table tbody');
        if (!tbody) return;
        tbody.innerHTML = contactsToRender.map(contact => `
            <tr class="fade-in">
                <td>${contact.name}</td>
                <td>${contact.phone}</td>
                <td>${contact.email}</td>
                <td><span class="status-badge status-${contact.status.replace(/ /g, '_')}">${contact.status.replace('_', ' ')}</span></td>
                <td>${contact.notes}</td>
                <td class="contact-actions">
                    <button class="call-btn btn-success" data-contact-id="${contact.id}" title="Llamar"><i class="fas fa-phone"></i></button>
                    <button class="send-sms-btn btn-secondary" data-contact-id="${contact.id}" title="Enviar SMS"><i class="fas fa-sms"></i></button>
                    <button class="edit-btn btn-secondary" data-contact-id="${contact.id}" title="Editar"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `).join('');
    }
    
    async makeCall(contactId) { this.showToast('Iniciando llamada (simulado)...', 'success'); }
    async sendSMS(contactId) { this.showToast('Enviando SMS (simulado)...', 'success'); }
    editContact(contactId) { this.showToast('Editando contacto (simulado)...', 'success'); }

    filterContacts(searchTerm) {
        const filtered = this.contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderContacts(filtered);
    }

    filterContactsByStatus(status) {
        if (status === 'all') {
            this.renderContacts();
        } else {
            const filtered = this.contacts.filter(contact => contact.status === status);
            this.renderContacts(filtered);
        }
    }

    updateDashboard() {
        const totalContacts = this.contacts.length;
        const statusCounts = this.contacts.reduce((acc, contact) => {
            acc[contact.status] = (acc[contact.status] || 0) + 1;
            return acc;
        }, {});

        document.getElementById('total-contacts').textContent = totalContacts;
        document.getElementById('contacted-today').textContent = statusCounts['Contactado'] || 0;
        document.getElementById('pending-followup').textContent = statusCounts['Requiere_Seguimiento'] || 0;

        const statusList = document.getElementById('status-breakdown');
        if (statusList) {
            statusList.innerHTML = Object.entries(statusCounts).map(([status, count]) => `
                <li><span>${status.replace('_', ' ')}</span><span>${count}</span></li>
            `).join('');
        }
    }
    
    startDashboardUpdates() {
        this.updateDashboard();
        setInterval(() => this.updateDashboard(), 30000);
    }

    showToast(message, type = 'success') {
        document.querySelectorAll('.toast').forEach(toast => toast.remove());
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.crmApp = new CRMApp();
});

