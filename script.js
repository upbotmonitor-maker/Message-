// ==================== LOCAL STORAGE ====================
const USERS_KEY = 'cv_users';
const MESSAGES_PREFIX = 'cv_msg_';
const CURRENT_USER_KEY = 'cv_current';
const ONLINE_USERS_KEY = 'cv_online';
const DARK_MODE_KEY = 'cv_dark';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}
function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}
function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
function updateCurrentUser(updated) {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === updated.username);
  if (idx !== -1) {
    users[idx] = updated;
    saveUsers(users);
    saveCurrentUser(updated);
  }
}

function getOnlineUsers() {
  return JSON.parse(localStorage.getItem(ONLINE_USERS_KEY)) || {};
}
function setUserOnline(username) {
  const online = getOnlineUsers();
  online[username] = Date.now();
  localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(online));
}
function setUserOffline(username) {
  const online = getOnlineUsers();
  delete online[username];
  localStorage.setItem(ONLINE_USERS_KEY, JSON.stringify(online));
}
function isUserOnline(username) {
  const online = getOnlineUsers();
  return !!online[username];
}

function getUnreadCount(currentUser, partner) {
  const key = `unread_${currentUser}_${partner}`;
  return parseInt(localStorage.getItem(key) || '0');
}
function incrementUnread(currentUser, partner) {
  const key = `unread_${currentUser}_${partner}`;
  const current = parseInt(localStorage.getItem(key) || '0');
  localStorage.setItem(key, current + 1);
}
function resetUnread(currentUser, partner) {
  const key = `unread_${currentUser}_${partner}`;
  localStorage.setItem(key, '0');
}

const codes = ['+90','+1','+44','+49','+33','+81','+7','+39'];
function randomPhone() {
  const c = codes[Math.floor(Math.random() * codes.length)];
  const n = Math.floor(100000000 + Math.random() * 900000000);
  return `${c} ${n}`;
}

function chatKey(a, b) {
  const s = [a, b].sort();
  return MESSAGES_PREFIX + s[0] + '_' + s[1];
}
function getMsgs(a, b) {
  return JSON.parse(localStorage.getItem(chatKey(a,b))) || [];
}
function saveMsgs(a, b, msgs) {
  localStorage.setItem(chatKey(a,b), JSON.stringify(msgs));
}

const VERIFIED_USER = 'BaconPrime_Dev';
const LUMINA_USERNAME = 'Lumina';
const LUMINA_AVATAR_URL = 'https://i.imgur.com/1I0n5Id.png'; // Mira'nın logosu

// ==================== UI ====================
const appHeader = document.getElementById('appHeader');
const backBtn = document.getElementById('backBtn');
const headerAvatar = document.getElementById('headerAvatar');
const headerTitle = document.getElementById('headerTitle');
const settingsBtn = document.getElementById('settingsBtn');
const logoutBtn = document.getElementById('logoutBtn');

const authScreen = document.getElementById('authScreen');
const contactsScreen = document.getElementById('contactsScreen');
const chatScreen = document.getElementById('chatScreen');

const authTitle = document.getElementById('authTitle');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const authActionBtn = document.getElementById('authActionBtn');
const switchText = document.getElementById('switchText');
const switchLink = document.getElementById('switchLink');

const searchInput = document.getElementById('searchInput');
const contactListDiv = document.getElementById('contactList');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Ayarlar modal
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const avatarPreview = document.getElementById('avatarPreview');
const avatarFileInput = document.getElementById('avatarFileInput');
const chooseAvatarBtn = document.getElementById('chooseAvatarBtn');
const removeAvatarBtn = document.getElementById('removeAvatarBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const settingsUsername = document.getElementById('settingsUsername');
const settingsPhone = document.getElementById('settingsPhone');
const darkModeCheckbox = document.getElementById('darkModeCheckbox');

// Profil kartı
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const profileAvatarLarge = document.getElementById('profileAvatarLarge');
const profileName = document.getElementById('profileName');
const profileBadge = document.getElementById('profileBadge');
const profilePhone = document.getElementById('profilePhone');
const profileStatus = document.getElementById('profileStatus');

let isLogin = true;
let chatPartner = null;
let tempAvatarData = null;

// ==================== RESİM KORUMASI ====================
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
document.addEventListener('dragstart', (e) => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

// ==================== KARANLIK MOD ====================
function applyDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  localStorage.setItem(DARK_MODE_KEY, enabled);
}

(function loadDarkMode() {
  const saved = localStorage.getItem(DARK_MODE_KEY);
  if (saved === 'true') {
    applyDarkMode(true);
    if (darkModeCheckbox) darkModeCheckbox.checked = true;
  } else {
    applyDarkMode(false);
    if (darkModeCheckbox) darkModeCheckbox.checked = false;
  }
})();

darkModeCheckbox.addEventListener('change', () => {
  applyDarkMode(darkModeCheckbox.checked);
});

// ==================== EKRAN ====================
function showScreen(scr) {
  authScreen.classList.remove('active');
  contactsScreen.classList.remove('active');
  chatScreen.classList.remove('active');
  scr.classList.add('active');
}

function updateHeaderUI(titleText, showBack = false, avatarSrc = null, initial = '', partnerUsername = '') {
  if (partnerUsername === VERIFIED_USER) {
    headerTitle.innerHTML = `${partnerUsername} <span class="verified-badge"><img src="https://i.imgur.com/14PqZwx.png" alt="✓"></span>`;
  } else if (partnerUsername === LUMINA_USERNAME) {
    headerTitle.innerHTML = `${partnerUsername} <span class="ai-badge">AI</span>`;
  } else {
    headerTitle.textContent = titleText;
  }

  backBtn.classList.toggle('show', showBack);

  if (avatarSrc) {
    headerAvatar.innerHTML = `<img src="${avatarSrc}" alt="pf">`;
    headerAvatar.classList.add('show');
  } else if (initial) {
    headerAvatar.innerHTML = '';
    headerAvatar.textContent = initial;
    headerAvatar.classList.add('show');
  } else {
    headerAvatar.classList.remove('show');
  }

  headerAvatar.onclick = () => {
    if (partnerUsername) showProfileCard(partnerUsername);
  };
}

// ==================== PROFİL KARTI ====================
function showProfileCard(username) {
  const user = getUsers().find(u => u.username === username);
  if (!user) return;
  profileName.textContent = user.username;
  profilePhone.textContent = user.phone || '—';
  if (user.username === VERIFIED_USER) {
    profileBadge.innerHTML = '<span class="verified-badge"><img src="https://i.imgur.com/14PqZwx.png" alt="✓" style="width:23px;height:23px;"></span>';
  } else if (user.username === LUMINA_USERNAME) {
    profileBadge.innerHTML = '<span class="ai-badge">AI</span>';
  } else {
    profileBadge.innerHTML = '';
  }
  profileStatus.textContent = user.username === LUMINA_USERNAME ? 'Lumina | Groq + Llama 3.3 70B' : (isUserOnline(user.username) ? 'çevrimiçi' : 'çevrimdışı');
  profileStatus.className = user.username === LUMINA_USERNAME ? 'lumina-status' : '';
  profileAvatarLarge.innerHTML = user.avatar
    ? `<img src="${user.avatar}" alt="pf">`
    : user.username === LUMINA_USERNAME ? `<img src="${LUMINA_AVATAR_URL}" alt="pf">` : user.username.charAt(0).toUpperCase();
  profileAvatarLarge.style.background = user.avatar ? 'transparent' : (user.username === LUMINA_USERNAME ? 'transparent' : avatarColor(user.username));
  profileModal.classList.add('show');
}

closeProfileBtn.addEventListener('click', () => {
  profileModal.classList.remove('show');
});
profileModal.addEventListener('click', (e) => {
  if (e.target === profileModal) profileModal.classList.remove('show');
});

// ==================== AUTH ====================
switchLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;
  if (isLogin) {
    authTitle.textContent = 'Giriş Yap';
    authActionBtn.textContent = 'Giriş Yap';
    switchText.textContent = 'Hesabın yok mu?';
    switchLink.textContent = 'Kayıt ol';
  } else {
    authTitle.textContent = 'Kayıt Ol';
    authActionBtn.textContent = 'Kayıt Ol';
    switchText.textContent = 'Zaten hesabın var mı?';
    switchLink.textContent = 'Giriş yap';
  }
});

authActionBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!username || !password) {
    alert('Kullanıcı adı ve şifre gerekli.');
    return;
  }
  let users = getUsers();

  if (isLogin) {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      alert('Kullanıcı adı veya şifre hatalı.');
      return;
    }
    saveCurrentUser(user);
    setUserOnline(user.username);
    enterApp();
  } else {
    if (users.some(u => u.username === username)) {
      alert('Bu kullanıcı adı alınmış.');
      return;
    }
    const newUser = {
      username,
      password,
      phone: randomPhone(),
      avatar: null,
    };
    users.push(newUser);
    saveUsers(users);
    saveCurrentUser(newUser);
    setUserOnline(newUser.username);
    alert(`Kayıt başarılı!\nNumaran: ${newUser.phone}`);
    enterApp();
  }
  usernameInput.value = '';
  passwordInput.value = '';
});

// Çıkış
logoutBtn.addEventListener('click', () => {
  const cu = getCurrentUser();
  if (cu) setUserOffline(cu.username);
  clearCurrentUser();
  chatPartner = null;
  showScreen(authScreen);
  appHeader.classList.remove('visible');
});

// Geri
backBtn.addEventListener('click', () => {
  if (chatPartner) {
    const cu = getCurrentUser();
    if (cu) resetUnread(cu.username, chatPartner);
  }
  chatPartner = null;
  showContactsScreen();
});

window.addEventListener('beforeunload', () => {
  const cu = getCurrentUser();
  if (cu) setUserOffline(cu.username);
});

// ==================== REHBER ====================
function enterApp() {
  appHeader.classList.add('visible');
  showContactsScreen();
}

function showContactsScreen() {
  const cu = getCurrentUser();
  if (!cu) {
    showScreen(authScreen);
    return;
  }
  updateHeaderUI('Sohbetler', false, null, '', '');

  // Lumina'yı dahil et, sonra sırala
  let users = getUsers().filter(u => u.username !== cu.username);

  // Son mesaj zamanına göre sırala (en yeni en üstte)
  users.sort((a, b) => {
    const msgsA = getMsgs(cu.username, a.username);
    const msgsB = getMsgs(cu.username, b.username);
    const timeA = msgsA.length ? msgsA[msgsA.length - 1].time : 0;
    const timeB = msgsB.length ? msgsB[msgsB.length - 1].time : 0;
    return timeB - timeA;
  });

  renderContactList(users);
  showScreen(contactsScreen);
}

function renderContactList(users) {
  contactListDiv.innerHTML = '';
  const cu = getCurrentUser();

  if (users.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.cssText = 'padding:30px;text-align:center;color:var(--text-secondary);';
    emptyMsg.textContent = 'Henüz kayıtlı kullanıcı yok.';
    contactListDiv.appendChild(emptyMsg);
    return;
  }

  users.forEach(u => {
    const isVerified = (u.username === VERIFIED_USER);
    const isLumina = (u.username === LUMINA_USERNAME);
    const avatarHTML = u.avatar
      ? `<img src="${u.avatar}" alt="pf">`
      : isLumina ? `<img src="${LUMINA_AVATAR_URL}" alt="pf">` : u.username.charAt(0).toUpperCase();
    const bg = u.avatar ? 'transparent' : (isLumina ? 'transparent' : avatarColor(u.username));
    const online = isLumina ? true : isUserOnline(u.username);
    const statusText = isLumina ? 'Lumina | Groq + Llama 3.3 70B' : (online ? 'çevrimiçi' : 'çevrimdışı');
    const statusClass = isLumina ? 'lumina-status' : (online ? 'online' : 'offline');

    const unread = getUnreadCount(cu.username, u.username);

    const div = document.createElement('div');
    div.className = 'contact-item';
    div.innerHTML = `
      <div class="contact-avatar" style="background:${bg}" data-username="${u.username}">
        ${avatarHTML}
      </div>
      <div class="contact-info">
        <span class="contact-name name-with-badge">
          ${u.username}
          ${isVerified ? '<span class="verified-badge"><img src="https://i.imgur.com/14PqZwx.png" alt="✓"></span>' : ''}
          ${isLumina ? '<span class="ai-badge">AI</span>' : ''}
        </span>
        <div class="contact-phone">${u.phone || ''}</div>
        <div class="contact-status ${statusClass}">${statusText}</div>
      </div>
      ${unread > 0 ? `<div class="unread-badge">${unread}</div>` : ''}
    `;

    const avatarEl = div.querySelector('.contact-avatar');
    avatarEl.addEventListener('click', (e) => {
      e.stopPropagation();
      showProfileCard(u.username);
    });

    div.addEventListener('click', (e) => {
      if (!e.target.closest('.contact-avatar')) {
        openChat(u.username);
      }
    });

    contactListDiv.appendChild(div);
  });
}

searchInput.addEventListener('input', () => {
  const cu = getCurrentUser();
  if (!cu) return;
  const q = searchInput.value.toLowerCase();
  let users = getUsers().filter(u => u.username !== cu.username && u.username.toLowerCase().includes(q));
  users.sort((a, b) => {
    const msgsA = getMsgs(cu.username, a.username);
    const msgsB = getMsgs(cu.username, b.username);
    const timeA = msgsA.length ? msgsA[msgsA.length - 1].time : 0;
    const timeB = msgsB.length ? msgsB[msgsB.length - 1].time : 0;
    return timeB - timeA;
  });
  renderContactList(users);
});

// ==================== SOHBET ====================
function openChat(partner) {
  chatPartner = partner;
  const cu = getCurrentUser();
  if (!cu) return;

  resetUnread(cu.username, partner);

  const partnerUser = getUsers().find(u => u.username === partner);
  const initial = partner === LUMINA_USERNAME ? '' : partner.charAt(0).toUpperCase();
  const avatarSrc = partnerUser?.avatar || (partner === LUMINA_USERNAME ? LUMINA_AVATAR_URL : null);
  updateHeaderUI(partner, true, avatarSrc, initial, partner);
  showScreen(chatScreen);
  renderMessages();
}

function renderMessages() {
  const cu = getCurrentUser();
  if (!cu || !chatPartner) return;
  const msgs = getMsgs(cu.username, chatPartner);
  chatMessages.innerHTML = '';

  msgs.forEach(m => {
    const time = new Date(m.time);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const row = document.createElement('div');
    row.className = `message-row ${m.from === cu.username ? 'outgoing' : 'incoming'}`;
    row.innerHTML = `
      <div class="message-bubble">
        ${esc(m.text)}
        <span class="message-time">${timeStr}</span>
      </div>
    `;
    chatMessages.appendChild(row);
  });

  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

sendBtn.addEventListener('click', sendMsg);
messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMsg();
});

async function sendMsg() {
  const text = messageInput.value.trim();
  if (!text || !chatPartner) return;
  const cu = getCurrentUser();
  if (!cu) return;

  if (chatPartner === LUMINA_USERNAME && cu.username !== VERIFIED_USER) {
    alert('Bu özellik şu anda sadece test kullanıcısına açıktır.');
    return;
  }

  const msgs = getMsgs(cu.username, chatPartner);
  msgs.push({ from: cu.username, text, time: Date.now() });
  saveMsgs(cu.username, chatPartner, msgs);
  messageInput.value = '';
  renderMessages();

  if (chatPartner === LUMINA_USERNAME) {
    try {
      const response = await fetch('https://chatgpt-production-1b97.up.railway.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-api-key-mira-001'
        },
        body: JSON.stringify({
          message: text,
          user: cu.username
        })
      });
      const data = await response.json();
      let reply = data.reply || data.message || 'Üzgünüm, şu anda yanıt veremiyorum.';
      reply = reply.replace(/\*\*/g, '');
      const updatedMsgs = getMsgs(cu.username, chatPartner);
      updatedMsgs.push({ from: LUMINA_USERNAME, text: reply, time: Date.now() });
      saveMsgs(cu.username, chatPartner, updatedMsgs);
      renderMessages();

      // Rehbere dönünce sıralama güncellensin diye yeniden yükle
      showContactsScreen();
      if (chatPartner) openChat(chatPartner); // tekrar aç
    } catch (err) {
      const updatedMsgs = getMsgs(cu.username, chatPartner);
      updatedMsgs.push({ from: LUMINA_USERNAME, text: '⚠️ API bağlantı hatası. Lütfen tekrar deneyin.', time: Date.now() });
      saveMsgs(cu.username, chatPartner, updatedMsgs);
      renderMessages();
    }
  } else {
    incrementUnread(chatPartner, cu.username);
    // Normal kullanıcıya mesaj sonrası rehber sıralaması hemen güncellensin
    showContactsScreen();
    openChat(chatPartner);
  }
}

function esc(s) {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
}

function avatarColor(name) {
  const colors = ['#075e54','#128c7e','#25d366','#1ebc56','#0b5e42','#2e7d32','#388e3c','#4caf50'];
  let hash = 0;
  for (let i=0; i<name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ==================== AYARLAR ====================
settingsBtn.addEventListener('click', () => {
  const cu = getCurrentUser();
  if (!cu) return;
  settingsUsername.textContent = cu.username;
  settingsPhone.textContent = cu.phone;
  avatarPreview.innerHTML = '';
  if (cu.avatar) {
    avatarPreview.innerHTML = `<img src="${cu.avatar}" alt="pf">`;
  } else {
    avatarPreview.textContent = cu.username.charAt(0).toUpperCase();
    avatarPreview.style.background = avatarColor(cu.username);
  }
  tempAvatarData = cu.avatar;
  darkModeCheckbox.checked = document.body.classList.contains('dark');
  settingsModal.classList.add('show');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

chooseAvatarBtn.addEventListener('click', () => {
  avatarFileInput.click();
});

avatarFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    tempAvatarData = ev.target.result;
    avatarPreview.innerHTML = `<img src="${tempAvatarData}" alt="pf">`;
  };
  reader.readAsDataURL(file);
});

removeAvatarBtn.addEventListener('click', () => {
  tempAvatarData = null;
  avatarPreview.innerHTML = '';
  const cu = getCurrentUser();
  avatarPreview.textContent = cu.username.charAt(0).toUpperCase();
  avatarPreview.style.background = avatarColor(cu.username);
});

saveSettingsBtn.addEventListener('click', () => {
  const cu = getCurrentUser();
  if (!cu) return;
  cu.avatar = tempAvatarData;
  updateCurrentUser(cu);
  settingsModal.classList.remove('show');
  showContactsScreen();
  if (chatPartner) {
    openChat(chatPartner);
  }
});

// ==================== BAŞLANGIÇ ====================
(function init() {
  let users = getUsers();

  // BaconPrime_Dev garantisi
  const bacon = users.find(u => u.username === VERIFIED_USER);
  if (!bacon) {
    users.push({
      username: VERIFIED_USER,
      password: 'Bacon2024!',
      phone: '+1 555 000 0001',
      avatar: null
    });
  } else {
    if (!bacon.phone || bacon.phone.startsWith('+90')) {
      bacon.phone = '+1 555 000 0001';
    }
  }

  // Lumina botu garantisi ve logosu
  if (!users.some(u => u.username === LUMINA_USERNAME)) {
    users.push({
      username: LUMINA_USERNAME,
      password: '',
      phone: '',
      avatar: LUMINA_AVATAR_URL // Mira'nın logosu
    });
  } else {
    const lumina = users.find(u => u.username === LUMINA_USERNAME);
    if (lumina) {
      lumina.phone = '';
      lumina.avatar = LUMINA_AVATAR_URL; // Logoyu güncelle
    }
  }

  saveUsers(users);

  const cu = getCurrentUser();
  if (cu) {
    setUserOnline(cu.username);
    setUserOnline(LUMINA_USERNAME);
    enterApp();
  } else {
    showScreen(authScreen);
    appHeader.classList.remove('visible');
  }
})();
