const authSistem = {
    // Rastgele numara oluşturucu (+1, +90, +44 gibi)
    numaraUret() {
        const kodlar = ["+90", "+1", "+44", "+49", "+33"];
        const secilen = kodlar[Math.floor(Math.random() * kodlar.length)];
        const seri = Math.floor(100000000 + Math.random() * 900000000);
        return `${secilen} ${seri}`;
    },

    girisYap() {
        const isim = document.getElementById('username-input').value;
        if (!isim) return alert("Lütfen bir isim yaz!");

        let kullanicilar = JSON.parse(localStorage.getItem('chat_app_users')) || {};

        // Eğer kullanıcı yoksa yeni numara ata ve kaydet
        if (!kullanicilar[isim]) {
            kullanicilar[isim] = {
                username: isim,
                number: this.numaraUret(),
                isVerified: true // Herkese mavi tık verdik
            };
            localStorage.setItem('chat_app_users', JSON.stringify(kullanicilar));
        }

        sessionStorage.setItem('aktif_user', isim);
        this.ekranDegistir(kullanicilar[isim]);
    },

    ekranDegistir(user) {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('chat-screen').classList.remove('hidden');
        document.getElementById('display-name').innerText = user.username;
        document.getElementById('display-number').innerText = user.number;
        chatSistem.mesajlariYukle();
    }
};

const chatSistem = {
    mesajGonder() {
        const input = document.getElementById('message-input');
        const text = input.value;
        const kim = sessionStorage.getItem('aktif_user');

        if (!text) return;

        let mesajlar = JSON.parse(localStorage.getItem('chat_app_messages')) || [];
        mesajlar.push({
            sender: kim,
            body: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        localStorage.setItem('chat_app_messages', JSON.stringify(mesajlar));
        input.value = '';
        this.mesajlariYukle();
    },

    mesajlariYukle() {
        const mesajlar = JSON.parse(localStorage.getItem('chat_app_messages')) || [];
        const box = document.getElementById('chat-messages');
        box.innerHTML = '';

        mesajlar.forEach(m => {
            const div = document.createElement('div');
            div.className = 'msg sent';
            div.innerHTML = `${m.body} <span class="msg-info">${m.time}</span>`;
            box.appendChild(div);
        });
        box.scrollTop = box.scrollHeight; // En aşağı kaydır
    }
};

// Sayfa yenilendiğinde girişi hatırla
window.onload = () => {
    const aktif = sessionStorage.getItem('aktif_user');
    if (aktif) {
        const users = JSON.parse(localStorage.getItem('chat_app_users'));
        authSistem.ekranDegistir(users[aktif]);
    }
};
