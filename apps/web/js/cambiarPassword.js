/**
 * cambiarPassword.js
 * Modal de cambio de contraseña — exportable y reutilizable
 * Uso: import { abrirCambiarPassword } from './cambiarPassword.js';
 *      abrirCambiarPassword();
 */

export function abrirCambiarPassword() {
    if (document.getElementById('cpModal')) return;
    _inyectarEstilos();
    document.body.insertAdjacentHTML('beforeend', _template());
    _bindEventos();
}

// ──────────────────────────────────────────────
// Template HTML
// ──────────────────────────────────────────────
function _template() {
    return `
    <div id="cpModal" class="cp-overlay" role="dialog" aria-modal="true" aria-labelledby="cpTitle">
        <div class="cp-backdrop"></div>
        <div class="cp-card">

            <div class="cp-card-header">
                <div class="cp-header-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <div>
                    <h2 class="cp-title" id="cpTitle">Cambiar contraseña</h2>
                    <p class="cp-subtitle">Actualizá la contraseña de tu cuenta</p>
                </div>
                <button class="cp-close" id="cpClose" aria-label="Cerrar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>

            <div class="cp-card-body">

                <div class="cp-field" id="cpFieldActual">
                    <label class="cp-label" for="cpActual">Contraseña actual</label>
                    <div class="cp-input-wrap">
                        <span class="cp-input-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </span>
                        <input class="cp-input" type="password" id="cpActual" placeholder="••••••••" autocomplete="current-password"/>
                        <button type="button" class="cp-toggle-eye" data-target="cpActual" aria-label="Ver contraseña">
                            <svg class="eye-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            <svg class="eye-on" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                    <span class="cp-error" id="cpErrorActual"></span>
                </div>

                <div class="cp-divider"></div>

                <div class="cp-field" id="cpFieldNueva">
                    <label class="cp-label" for="cpNueva">Nueva contraseña</label>
                    <div class="cp-input-wrap">
                        <span class="cp-input-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </span>
                        <input class="cp-input" type="password" id="cpNueva" placeholder="••••••••" autocomplete="new-password"/>
                        <button type="button" class="cp-toggle-eye" data-target="cpNueva" aria-label="Ver contraseña">
                            <svg class="eye-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            <svg class="eye-on" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                    <span class="cp-error" id="cpErrorNueva"></span>

                    <!-- Barra de fortaleza -->
                    <div class="cp-strength-wrap" id="cpStrengthWrap" style="display:none">
                        <div class="cp-strength-bar">
                            <div class="cp-strength-fill" id="cpStrengthFill"></div>
                        </div>
                        <span class="cp-strength-label" id="cpStrengthLabel"></span>
                    </div>

                    <!-- Checklist de requisitos -->
                    <ul class="cp-req-list" id="cpReqList">
                        <li class="cp-req" id="req-len">
                            <span class="cp-req-dot"></span> Mínimo 8 caracteres
                        </li>
                        <li class="cp-req" id="req-upper">
                            <span class="cp-req-dot"></span> Al menos una mayúscula
                        </li>
                        <li class="cp-req" id="req-num">
                            <span class="cp-req-dot"></span> Al menos un número
                        </li>
                        <li class="cp-req" id="req-special">
                            <span class="cp-req-dot"></span> Al menos un carácter especial (!@#$...)
                        </li>
                    </ul>
                </div>

                <div class="cp-field" id="cpFieldConfirm">
                    <label class="cp-label" for="cpConfirm">Confirmar nueva contraseña</label>
                    <div class="cp-input-wrap">
                        <span class="cp-input-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </span>
                        <input class="cp-input" type="password" id="cpConfirm" placeholder="••••••••" autocomplete="new-password"/>
                        <button type="button" class="cp-toggle-eye" data-target="cpConfirm" aria-label="Ver contraseña">
                            <svg class="eye-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            <svg class="eye-on" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                    <span class="cp-error" id="cpErrorConfirm"></span>
                </div>

            </div>

            <div class="cp-card-footer">
                <button class="cp-btn-cancel" id="cpCancel">Cancelar</button>
                <button class="cp-btn-submit" id="cpSubmit">
                    <span id="cpSubmitText">Actualizar contraseña</span>
                    <span id="cpSubmitLoader" style="display:none" class="cp-spinner"></span>
                </button>
            </div>

        </div>
    </div>`;
}

// ──────────────────────────────────────────────
// Eventos
// ──────────────────────────────────────────────
function _bindEventos() {
    const modal    = document.getElementById('cpModal');
    const backdrop = modal.querySelector('.cp-backdrop');

    document.getElementById('cpClose').addEventListener('click', cerrarCambiarPassword);
    document.getElementById('cpCancel').addEventListener('click', cerrarCambiarPassword);
    backdrop.addEventListener('click', cerrarCambiarPassword);

    document.getElementById('cpNueva').addEventListener('input', _evaluarFortaleza);
    document.getElementById('cpConfirm').addEventListener('input', _validarConfirmacion);

    document.querySelectorAll('.cp-toggle-eye').forEach(btn => {
        btn.addEventListener('click', () => {
            const input  = document.getElementById(btn.dataset.target);
            const eyeOff = btn.querySelector('.eye-off');
            const eyeOn  = btn.querySelector('.eye-on');
            const isPass = input.type === 'password';
            input.type       = isPass ? 'text' : 'password';
            eyeOff.style.display = isPass ? 'none'  : '';
            eyeOn.style.display  = isPass ? ''      : 'none';
        });
    });

    document.getElementById('cpSubmit').addEventListener('click', _handleSubmit);

    document.addEventListener('keydown', _handleEsc);

    requestAnimationFrame(() => modal.classList.add('cp-visible'));
}

function _handleEsc(e) {
    if (e.key === 'Escape') cerrarCambiarPassword();
}

export function cerrarCambiarPassword() {
    const modal = document.getElementById('cpModal');
    if (!modal) return;
    modal.classList.remove('cp-visible');
    modal.classList.add('cp-closing');
    document.removeEventListener('keydown', _handleEsc);
    setTimeout(() => modal.remove(), 280);
}

// ──────────────────────────────────────────────
// Fortaleza de contraseña
// ──────────────────────────────────────────────
function _evaluarFortaleza() {
    const val   = document.getElementById('cpNueva').value;
    const wrap  = document.getElementById('cpStrengthWrap');
    const fill  = document.getElementById('cpStrengthFill');
    const label = document.getElementById('cpStrengthLabel');

    const checks = {
        len:     val.length >= 8,
        upper:   /[A-Z]/.test(val),
        num:     /[0-9]/.test(val),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(val),
    };

    Object.entries(checks).forEach(([key, ok]) => {
        const li = document.getElementById(`req-${key}`);
        if (li) li.classList.toggle('cp-req-ok', ok);
    });

    const score = Object.values(checks).filter(Boolean).length;
    wrap.style.display = val.length > 0 ? 'block' : 'none';

    const niveles = [
        { pct: '20%',  color: '#ef4444', texto: 'Muy débil'  },
        { pct: '40%',  color: '#f97316', texto: 'Débil'      },
        { pct: '65%',  color: '#eab308', texto: 'Regular'    },
        { pct: '85%',  color: '#22c55e', texto: 'Fuerte'     },
        { pct: '100%', color: '#16a34a', texto: 'Muy fuerte' },
    ];

    const nivel = niveles[Math.max(0, score - 1)] || niveles[0];
    fill.style.width      = val.length > 0 ? nivel.pct : '0%';
    fill.style.background = nivel.color;
    label.textContent     = val.length > 0 ? nivel.texto : '';
    label.style.color     = nivel.color;

    _validarConfirmacion();
}

function _validarConfirmacion() {
    const nueva   = document.getElementById('cpNueva').value;
    const confirm = document.getElementById('cpConfirm').value;
    const err     = document.getElementById('cpErrorConfirm');
    if (confirm.length > 0 && nueva !== confirm) {
        err.textContent = 'Las contraseñas no coinciden.';
    } else {
        err.textContent = '';
    }
}

// ──────────────────────────────────────────────
// Submit
// ──────────────────────────────────────────────
async function _handleSubmit() {
    const actual   = document.getElementById('cpActual').value.trim();
    const nueva    = document.getElementById('cpNueva').value;
    const confirm  = document.getElementById('cpConfirm').value;
    let   valido   = true;

    _clearErrors();

    if (!actual) {
        _setError('cpErrorActual', 'Ingresá tu contraseña actual.');
        valido = false;
    }

    if (!nueva) {
        _setError('cpErrorNueva', 'Ingresá la nueva contraseña.');
        valido = false;
    } else if (nueva.length < 8) {
        _setError('cpErrorNueva', 'La contraseña debe tener al menos 8 caracteres.');
        valido = false;
    }

    if (!confirm) {
        _setError('cpErrorConfirm', 'Confirmá la nueva contraseña.');
        valido = false;
    } else if (nueva !== confirm) {
        _setError('cpErrorConfirm', 'Las contraseñas no coinciden.');
        valido = false;
    }

    if (!valido) return;

    _setLoading(true);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                passwordActual: actual,
                passwordNueva: nueva
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            _setError('cpErrorActual', data.message || 'Contraseña actual incorrecta.');
            _setLoading(false);
            return;
        }

        _mostrarExito();

    } catch (e) {
        _setError('cpErrorActual', 'Error de conexión. Intentá de nuevo.');
        _setLoading(false);
    }
}

function _mostrarExito() {
    const body   = document.querySelector('.cp-card-body');
    const footer = document.querySelector('.cp-card-footer');

    body.innerHTML = `
        <div class="cp-success-state">
            <div class="cp-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <p class="cp-success-title">¡Contraseña actualizada!</p>
            <p class="cp-success-sub">Tu contraseña fue cambiada correctamente.</p>
        </div>`;

    footer.innerHTML = `
        <button class="cp-btn-submit" style="margin:0 auto" onclick="window.cerrarCambiarPasswordGlobal()">
            Cerrar
        </button>`;

    window.cerrarCambiarPasswordGlobal = cerrarCambiarPassword;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function _setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function _clearErrors() {
    ['cpErrorActual', 'cpErrorNueva', 'cpErrorConfirm'].forEach(id => _setError(id, ''));
}

function _setLoading(state) {
    document.getElementById('cpSubmitText').style.display   = state ? 'none' : '';
    document.getElementById('cpSubmitLoader').style.display = state ? 'inline-block' : 'none';
    document.getElementById('cpSubmit').disabled = state;
}

// ──────────────────────────────────────────────
// Estilos
// ──────────────────────────────────────────────
function _inyectarEstilos() {
    if (document.getElementById('cp-styles')) return;
    const style = document.createElement('style');
    style.id = 'cp-styles';
    style.textContent = `
        .cp-overlay {
            position: fixed; inset: 0;
            display: flex; align-items: center; justify-content: center;
            z-index: 9999; padding: 16px;
            opacity: 0; transition: opacity 0.25s ease;
        }
        .cp-overlay.cp-visible { opacity: 1; }
        .cp-overlay.cp-closing { opacity: 0; }

        .cp-backdrop {
            position: absolute; inset: 0;
            background: rgba(0,0,0,0.45);
        }

        .cp-card {
            position: relative;
            background: white;
            border-radius: 16px;
            width: 100%; max-width: 440px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            overflow: hidden;
            transform: translateY(16px) scale(0.97);
            transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cp-overlay.cp-visible .cp-card {
            transform: translateY(0) scale(1);
        }

        .cp-card-header {
            display: flex; align-items: center; gap: 14px;
            padding: 22px 24px 18px;
            border-bottom: 0.5px solid #f0f0f0;            
        }
        .cp-header-icon {
            width: 44px; height: 44px; border-radius: 12px;
            background: white; display: flex; align-items: center; justify-content: center;
            color: var(--color-principal); flex-shrink: 0;
            border: 0.5px solid var(--color-principal);
        }
        .cp-title {
            font-size: 16px; font-weight: 600; color: #1a202c; margin: 0;
        }
        .cp-subtitle {
            font-size: 12px; color: #718096; margin: 2px 0 0;
        }
        .cp-close {
            margin-left: auto; background: none; border: none;
            cursor: pointer; color: #a0aec0; padding: 6px; border-radius: 8px;
            display: flex; align-items: center; transition: background 0.15s, color 0.15s;
        }
        .cp-close:hover { background: rgba(0,0,0,0.06); color: #2d3748; }

        .cp-card-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 18px; }

        .cp-divider { height: 0.5px; background: #f0f0f0; margin: 0 -4px; }

        .cp-field { display: flex; flex-direction: column; gap: 6px; }
        .cp-label { font-size: 13px; font-weight: 500; color: #2d3748; }

        .cp-input-wrap {
            display: flex; align-items: center;
            border: 1px solid #e2e8f0; border-radius: 10px;
            background: #fafafa; overflow: hidden;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cp-input-wrap:focus-within {
            border-color: var(--color-principal);
            box-shadow: 0 0 0 3px rgba(var(--color-principal), 0.1);
            background: white;
        }
        .cp-input-icon {
            padding: 0 10px 0 14px; color: #a0aec0; display: flex; align-items: center;
        }
        .cp-input {
            flex: 1; border: none; background: transparent;
            padding: 11px 4px; font-size: 14px; color: #2d3748;
            outline: none; min-width: 0;
        }
        .cp-input::placeholder { color: #cbd5e0; }
        .cp-toggle-eye {
            padding: 0 14px; background: none; border: none;
            cursor: pointer; color: #a0aec0; display: flex; align-items: center;
            transition: color 0.15s;
        }
        .cp-toggle-eye:hover { color: var(--color-principal); }

        .cp-error { font-size: 12px; color: #dc2626; min-height: 16px; }

        .cp-strength-wrap { margin-top: 6px; }
        .cp-strength-bar {
            height: 4px; background: #f0f0f0; border-radius: 4px; overflow: hidden; margin-bottom: 4px;
        }
        .cp-strength-fill {
            height: 100%; width: 0; border-radius: 4px;
            transition: width 0.4s ease, background 0.4s ease;
        }
        .cp-strength-label { font-size: 11px; font-weight: 500; }

        .cp-req-list {
            list-style: none; padding: 0; margin: 8px 0 0;
            display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;
        }
        .cp-req {
            display: flex; align-items: center; gap: 6px;
            font-size: 12px; color: #a0aec0; transition: color 0.2s;
        }
        .cp-req-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: #e2e8f0; flex-shrink: 0; transition: background 0.2s;
        }
        .cp-req-ok { color: #16a34a; }
        .cp-req-ok .cp-req-dot { background: #16a34a; }

        .cp-card-footer {
            padding: 16px 24px 22px;
            border-top: 0.5px solid #f0f0f0;
            display: flex; justify-content: flex-end; gap: 10px;
        }
        .cp-btn-cancel {
            padding: 10px 18px; border-radius: 9px;
            border: 1px solid #e2e8f0; background: white;
            font-size: 13px; font-weight: 500; color: #4a5568;
            cursor: pointer; transition: background 0.15s;
        }
        .cp-btn-cancel:hover { background: #f7fafc; }

        .cp-btn-submit {
            padding: 10px 20px; border-radius: 9px; border: none;
            background: var(--color-principal);
            font-size: 13px; font-weight: 500; color: white;
            cursor: pointer; display: flex; align-items: center; gap: 8px;
            transition: opacity 0.15s, transform 0.1s;
        }
        .cp-btn-submit:hover { opacity: 0.9; }
        .cp-btn-submit:active { transform: scale(0.98); }
        .cp-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .cp-spinner {
            width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white; border-radius: 50%;
            animation: cp-spin 0.7s linear infinite;
        }
        @keyframes cp-spin { to { transform: rotate(360deg); } }

        .cp-success-state {
            display: flex; flex-direction: column; align-items: center;
            padding: 32px 24px; text-align: center; gap: 10px;
        }
        .cp-success-icon {
            width: 64px; height: 64px; border-radius: 50%;
            background: #f0fdf4; color: #16a34a;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 6px;
        }
        .cp-success-title { font-size: 16px; font-weight: 600; color: #1a202c; }
        .cp-success-sub { font-size: 13px; color: #718096; }
    `;
    document.head.appendChild(style);
}
