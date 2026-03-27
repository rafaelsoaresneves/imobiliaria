/* ── Contact Page ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navToggle')?.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.toggle('open');
    });
});

async function enviarContato() {
    const nome = document.getElementById('cNome')?.value.trim();
    const email = document.getElementById('cEmail')?.value.trim();
    const telefone = document.getElementById('cTelefone')?.value.trim();
    const interesse = document.getElementById('cInteresse')?.value;
    const mensagem = document.getElementById('cMensagem')?.value.trim();

    if (!nome) { showToast('Informe seu nome.', 'error'); return; }
    if (!email) { showToast('Informe seu e-mail.', 'error'); return; }
    if (!telefone) { showToast('Informe seu telefone.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('E-mail inválido.', 'error'); return; }

    try {
        await DB.leads.create({ nome, email, telefone, interesse, mensagem, origem: 'formulario-contato' });
        showToast('Mensagem enviada com sucesso! Retornaremos em até 24h. 📨', 'success');
        ['cNome', 'cEmail', 'cTelefone', 'cMensagem'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    } catch {
        showToast('Erro ao enviar. Tente novamente.', 'error');
    }
}

function showToast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
}
