// متغيرات عامة
let socket;
let currentUser = null;
let currentRoom = 1;
let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let quotedMessage = null;

// الأصوات
const sounds = {
    message: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/JdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/JdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/JdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/JdSYE'),
    notification: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/JdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/JdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/JdSYELIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2O/JdSYE')
};

// إعدادات الأصوات
let soundSettings = {
    messageSound: true,
    notificationSound: true,
    voiceMessageSound: true
};

// تحميل إعدادات الأصوات من localStorage
function loadSoundSettings() {
    const saved = localStorage.getItem('soundSettings');
    if (saved) {
        soundSettings = { ...soundSettings, ...JSON.parse(saved) };
    }
}

// حفظ إعدادات الأصوات
function saveSoundSettings() {
    localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
}

// تشغيل الصوت
function playSound(type) {
    if (soundSettings[type + 'Sound'] && sounds[type]) {
        sounds[type].play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
    }
}

// التحقق من تسجيل الدخول
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showScreen('loginScreen');
        return false;
    }
    
    // فك تشفير JWT بسيط (في الإنتاج استخدم مكتبة مناسبة)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = payload;
        return true;
    } catch (e) {
        localStorage.removeItem('token');
        showScreen('loginScreen');
        return false;
    }
}

// عرض الشاشة
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// تبديل التبويبات
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.form').forEach(form => form.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Form').classList.add('active');
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            initializeChat();
        } else {
            document.getElementById('loginError').textContent = data.error;
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'خطأ في الاتصال';
    }
});

// تسجيل حساب جديد
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const displayName = document.getElementById('registerDisplayName').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, display_name: displayName })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            initializeChat();
        } else {
            document.getElementById('loginError').textContent = data.error;
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'خطأ في الاتصال';
    }
});

// تهيئة الشات
async function initializeChat() {
    showScreen('chatScreen');
    loadSoundSettings();
    
    // عرض معلومات المستخدم
    document.getElementById('userDisplayName').textContent = currentUser.display_name;
    document.getElementById('userRank').textContent = getRankDisplay(currentUser.rank);
    
    if (currentUser.profile_image1) {
        document.getElementById('userAvatar').src = currentUser.profile_image1;
    }
    
    // إظهار زر الإدارة للإداريين
    if (currentUser.role === 'admin') {
        document.getElementById('adminBtn').style.display = 'inline-block';
        document.getElementById('createRoomBtn').style.display = 'block';
    }
    
    // تهيئة Socket.IO
    socket = io();
    
    socket.emit('join', {
        userId: currentUser.id,
        displayName: currentUser.display_name,
        rank: currentUser.rank,
        email: currentUser.email,
        roomId: currentRoom
    });
    
    // استقبال الرسائل العامة
    socket.on('newMessage', (message) => {
        displayMessage(message, false);
        if (message.user_id !== currentUser.id) {
            playSound('message');
        }
    });
    
    // استقبال الرسائل الخاصة
    socket.on('newPrivateMessage', (message) => {
        displayPrivateMessage(message);
        if (message.user_id !== currentUser.id) {
            playSound('notification');
        }
    });
    
    // استقبال قائمة المستخدمين في الغرفة
    socket.on('roomUsersList', (users) => {
        displayRoomUsers(users);
    });
    
    // تغيير الغرفة
    socket.on('roomChanged', (roomId) => {
        currentRoom = roomId;
        loadRoomMessages(roomId);
    });
    
    // حذف غرفة
    socket.on('roomDeleted', (roomId) => {
        if (currentRoom === roomId) {
            currentRoom = 1;
            socket.emit('changeRoom', 1);
        }
        loadRooms();
    });
    
    // تحميل البيانات الأولية
    await loadRooms();
    await loadRoomMessages(currentRoom);
    await loadAllUsers();
}

// تحميل الغرف
async function loadRooms() {
    try {
        const response = await fetch('/api/rooms', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const rooms = await response.json();
        const roomsList = document.getElementById('roomsList');
        
        roomsList.innerHTML = rooms.map(room => `
            <div class="room-item ${room.id === currentRoom ? 'active' : ''}" onclick="changeRoom(${room.id})">
                <div class="room-item-icon">${room.name.charAt(0)}</div>
                <div class="room-item-info">
                    <div class="room-item-name">${room.name}</div>
                    <div class="room-item-desc">${room.description || ''}</div>
                </div>
                ${currentUser.role === 'admin' && room.id !== 1 ? `<button onclick="deleteRoom(${room.id})" class="btn" style="background: #e74c3c; color: white; padding: 5px 10px; font-size: 12px;">حذف</button>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('خطأ في تحميل الغرف:', error);
    }
}

// تغيير الغرفة
function changeRoom(roomId) {
    if (roomId === currentRoom) return;
    
    currentRoom = roomId;
    socket.emit('changeRoom', roomId);
    
    // تحديث واجهة الغرف
    document.querySelectorAll('.room-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.room-item').classList.add('active');
    
    // تحديث اسم الغرفة
    const roomName = event.target.closest('.room-item').querySelector('.room-item-name').textContent;
    document.getElementById('currentRoomName').textContent = roomName;
    
    loadRoomMessages(roomId);
}

// تحميل رسائل الغرفة
async function loadRoomMessages(roomId) {
    try {
        const response = await fetch(`/api/messages/${roomId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const messages = await response.json();
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        messages.forEach(message => displayMessage(message, false));
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('خطأ في تحميل الرسائل:', error);
    }
}

// عرض الرسالة
function displayMessage(message, isPrivate = false) {
    const container = isPrivate ? 
        document.getElementById('privateChatMessages') : 
        document.getElementById('messagesContainer');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.user_id === currentUser.id ? 'own' : 'other'}`;
    messageDiv.dataset.messageId = message.id;
    
    // إضافة خلفية الرسالة إذا كانت متوفرة
    if (message.message_background) {
        messageDiv.style.backgroundImage = `url(${message.message_background})`;
        messageDiv.classList.add('has-background');
    }
    
    let messageContent = '';
    
    // رسالة صوتية
    if (message.voice_url) {
        messageContent = `
            <div class="message-header">
                <img src="${message.profile_image1 || getDefaultAvatar()}" alt="صورة شخصية" class="message-avatar clickable-avatar" onclick="showUserProfile(${message.user_id})">
                <span class="message-author clickable-name" onclick="mentionUser('${message.display_name}')">${message.display_name}</span>
                <span class="message-rank">${getRankDisplay(message.rank)}</span>
                <span class="message-time">${formatTime(message.timestamp)}</span>
                <div class="message-actions">
                    <button class="quote-btn" onclick="quoteMessage(${message.id}, '${message.display_name}', 'رسالة صوتية')" title="اقتباس">💬</button>
                    ${message.user_id === currentUser.id || currentUser.role === 'admin' ? `<button class="quote-btn" onclick="deleteMessage(${message.id}, ${isPrivate})" title="حذف">🗑️</button>` : ''}
                </div>
            </div>
            <div class="message-content">
                <div class="voice-message">
                    🎤 رسالة صوتية
                    <audio controls>
                        <source src="${message.voice_url}" type="audio/webm">
                        متصفحك لا يدعم تشغيل الصوت
                    </audio>
                </div>
            </div>
        `;
    }
    // رسالة صورة
    else if (message.image_url) {
        messageContent = `
            <div class="message-header">
                <img src="${message.profile_image1 || getDefaultAvatar()}" alt="صورة شخصية" class="message-avatar clickable-avatar" onclick="showUserProfile(${message.user_id})">
                <span class="message-author clickable-name" onclick="mentionUser('${message.display_name}')">${message.display_name}</span>
                <span class="message-rank">${getRankDisplay(message.rank)}</span>
                <span class="message-time">${formatTime(message.timestamp)}</span>
                <div class="message-actions">
                    <button class="quote-btn" onclick="quoteMessage(${message.id}, '${message.display_name}', 'صورة')" title="اقتباس">💬</button>
                    ${message.user_id === currentUser.id || currentUser.role === 'admin' ? `<button class="quote-btn" onclick="deleteMessage(${message.id}, ${isPrivate})" title="حذف">🗑️</button>` : ''}
                </div>
            </div>
            <div class="message-content">
                <img src="${message.image_url}" alt="صورة" class="message-image" onclick="openImageModal('${message.image_url}')">
            </div>
        `;
    }
    // رسالة نصية
    else {
        let processedMessage = message.message;
        
        // معالجة الاقتباس
        if (message.quoted_message_id) {
            processedMessage = `
                <div class="quoted-message">
                    <div class="quote-author">${message.quoted_author}</div>
                    <div class="quote-content">${message.quoted_content}</div>
                </div>
                ${processedMessage}
            `;
        }
        
        // معالجة الأكواد
        processedMessage = processedMessage.replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>');
        processedMessage = processedMessage.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        // معالجة الإشارات
        processedMessage = processedMessage.replace(/@(\w+)/g, '<span data-mention="$1">@$1</span>');
        
        messageContent = `
            <div class="message-header">
                <img src="${message.profile_image1 || getDefaultAvatar()}" alt="صورة شخصية" class="message-avatar clickable-avatar" onclick="showUserProfile(${message.user_id})">
                <span class="message-author clickable-name" onclick="mentionUser('${message.display_name}')">${message.display_name}</span>
                <span class="message-rank">${getRankDisplay(message.rank)}</span>
                <span class="message-time">${formatTime(message.timestamp)}</span>
                <div class="message-actions">
                    <button class="quote-btn" onclick="quoteMessage(${message.id}, '${message.display_name}', '${message.message.substring(0, 50)}...')" title="اقتباس">💬</button>
                    ${message.user_id === currentUser.id || currentUser.role === 'admin' ? `<button class="quote-btn" onclick="deleteMessage(${message.id}, ${isPrivate})" title="حذف">🗑️</button>` : ''}
                </div>
            </div>
            <div class="message-content">${processedMessage}</div>
        `;
    }
    
    messageDiv.innerHTML = messageContent;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// حذف رسالة
async function deleteMessage(messageId, isPrivate = false) {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    
    try {
        const response = await fetch(`/api/messages/${messageId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            // إزالة الرسالة من الواجهة
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.remove();
            }
            
            // إشعار المستخدمين الآخرين
            if (isPrivate) {
                socket.emit('deletePrivateMessage', { messageId });
            } else {
                socket.emit('deleteMessage', { messageId, roomId: currentRoom });
            }
        }
    } catch (error) {
        console.error('خطأ في حذف الرسالة:', error);
        alert('حدث خطأ في حذف الرسالة');
    }
}

// اقتباس رسالة
function quoteMessage(messageId, author, content) {
    quotedMessage = { id: messageId, author, content };
    
    const quotePreview = document.createElement('div');
    quotePreview.className = 'quote-preview';
    quotePreview.innerHTML = `
        <div class="quote-preview-header">
            اقتباس من ${author}
            <button class="clear-quote-btn" onclick="clearQuote()">×</button>
        </div>
        <div class="quote-preview-text">${content}</div>
    `;
    
    const inputArea = document.querySelector('.message-input-area');
    const existingQuote = inputArea.querySelector('.quote-preview');
    if (existingQuote) {
        existingQuote.remove();
    }
    
    inputArea.insertBefore(quotePreview, inputArea.firstChild);
    document.getElementById('messageInput').focus();
}

// مسح الاقتباس
function clearQuote() {
    quotedMessage = null;
    const quotePreview = document.querySelector('.quote-preview');
    if (quotePreview) {
        quotePreview.remove();
    }
}

// إشارة لمستخدم
function mentionUser(username) {
    const input = document.getElementById('messageInput');
    const currentValue = input.value;
    const mention = `@${username} `;
    
    if (!currentValue.includes(mention)) {
        input.value = currentValue + mention;
        input.focus();
    }
}

// إرسال رسالة
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messageData = {
        message,
        roomId: currentRoom
    };
    
    // إضافة الاقتباس إذا كان موجوداً
    if (quotedMessage) {
        messageData.quoted_message_id = quotedMessage.id;
        messageData.quoted_author = quotedMessage.author;
        messageData.quoted_content = quotedMessage.content;
    }
    
    socket.emit('sendMessage', messageData);
    input.value = '';
    clearQuote();
}

// إرسال رسالة خاصة
function sendPrivateMessage() {
    const input = document.getElementById('privateMessageInput');
    const message = input.value.trim();
    const receiverId = parseInt(document.getElementById('privateChatModal').dataset.userId);
    
    if (!message || !receiverId) return;
    
    const messageData = {
        message,
        receiverId
    };
    
    socket.emit('sendPrivateMessage', messageData);
    input.value = '';
}

// بدء تسجيل الصوت
async function startVoiceRecording(isPrivate = false) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            sendVoiceMessage(audioBlob, isPrivate);
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // تحديث واجهة المستخدم
        const recordBtn = isPrivate ? 
            document.getElementById('privateRecordBtn') : 
            document.getElementById('recordBtn');
        
        recordBtn.textContent = '⏹️ إيقاف التسجيل';
        recordBtn.onclick = () => stopVoiceRecording(isPrivate);
        
    } catch (error) {
        console.error('خطأ في بدء التسجيل:', error);
        alert('لا يمكن الوصول للميكروفون');
    }
}

// إيقاف تسجيل الصوت
function stopVoiceRecording(isPrivate = false) {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // تحديث واجهة المستخدم
        const recordBtn = isPrivate ? 
            document.getElementById('privateRecordBtn') : 
            document.getElementById('recordBtn');
        
        recordBtn.textContent = '🎤 تسجيل صوتي';
        recordBtn.onclick = () => startVoiceRecording(isPrivate);
    }
}

// إرسال رسالة صوتية
async function sendVoiceMessage(audioBlob, isPrivate = false) {
    const formData = new FormData();
    formData.append('voice', audioBlob, 'voice-message.webm');
    
    if (isPrivate) {
        const receiverId = parseInt(document.getElementById('privateChatModal').dataset.userId);
        formData.append('receiverId', receiverId);
    } else {
        formData.append('roomId', currentRoom);
    }
    
    try {
        const response = await fetch('/api/upload-voice', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const messageData = {
                voice_url: data.voice_url,
                roomId: currentRoom
            };
            
            if (isPrivate) {
                messageData.receiverId = parseInt(document.getElementById('privateChatModal').dataset.userId);
                socket.emit('sendPrivateVoice', messageData);
            } else {
                socket.emit('sendVoice', messageData);
            }
        }
    } catch (error) {
        console.error('خطأ في إرسال الرسالة الصوتية:', error);
        alert('حدث خطأ في إرسال الرسالة الصوتية');
    }
}

// عرض المستخدمين في الغرفة
function displayRoomUsers(users) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = users.map(user => `
        <div class="user-item" onclick="openPrivateChat(${user.userId}, '${user.displayName}')">
            <img src="${getDefaultAvatar()}" alt="صورة شخصية">
            <div class="user-item-info">
                <div class="user-item-name">${user.displayName}</div>
                <div class="user-item-rank">${getRankDisplay(user.rank)}</div>
            </div>
        </div>
    `).join('');
}

// تحميل جميع المستخدمين
async function loadAllUsers() {
    try {
        const response = await fetch('/api/all-users-chat', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const users = await response.json();
        // سيتم استخدامها في مودال جميع المستخدمين
        window.allUsers = users;
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
    }
}

// فتح الدردشة الخاصة
async function openPrivateChat(userId, userName) {
    document.getElementById('privateChatUserName').textContent = userName;
    document.getElementById('privateChatModal').dataset.userId = userId;
    document.getElementById('privateChatModal').classList.add('active');
    
    // تحميل الرسائل الخاصة
    try {
        const response = await fetch(`/api/private-messages/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const messages = await response.json();
        const container = document.getElementById('privateChatMessages');
        container.innerHTML = '';
        
        messages.forEach(message => displayMessage(message, true));
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('خطأ في تحميل الرسائل الخاصة:', error);
    }
}

// إغلاق الدردشة الخاصة
function closePrivateChatModal() {
    document.getElementById('privateChatModal').classList.remove('active');
}

// عرض الرسالة الخاصة
function displayPrivateMessage(message) {
    if (document.getElementById('privateChatModal').classList.contains('active')) {
        const currentChatUserId = parseInt(document.getElementById('privateChatModal').dataset.userId);
        if (message.user_id === currentChatUserId || message.receiver_id === currentChatUserId) {
            displayMessage(message, true);
        }
    }
}

// فتح مودال جميع المستخدمين
function openAllUsersModal() {
    document.getElementById('allUsersModal').classList.add('active');
    displayAllUsers();
}

// إغلاق مودال جميع المستخدمين
function closeAllUsersModal() {
    document.getElementById('allUsersModal').classList.remove('active');
}

// عرض جميع المستخدمين
function displayAllUsers() {
    const container = document.getElementById('allUsersListModal');
    
    if (!window.allUsers) {
        container.innerHTML = '<div class="loading">جاري تحميل المستخدمين...</div>';
        loadAllUsers().then(() => displayAllUsers());
        return;
    }
    
    container.innerHTML = window.allUsers.map(user => `
        <div class="user-chat-item">
            <div class="user-info">
                <img src="${user.profile_image1 || getDefaultAvatar()}" alt="صورة شخصية" class="user-avatar">
                <div class="user-details">
                    <div class="user-name">${user.display_name}</div>
                    <div class="user-rank">${getRankDisplay(user.rank)}</div>
                    <div class="user-status ${user.is_online ? 'online' : 'offline'}">
                        ${user.is_online ? 'متصل' : 'غير متصل'}
                    </div>
                    ${user.age ? `<div class="user-age">العمر: ${user.age}</div>` : ''}
                    ${user.gender ? `<div class="user-gender">الجنس: ${user.gender}</div>` : ''}
                    ${user.marital_status ? `<div class="user-marital">الحالة: ${user.marital_status}</div>` : ''}
                </div>
            </div>
            <div class="user-actions">
                <button class="private-chat-btn" onclick="openPrivateChat(${user.id}, '${user.display_name}'); closeAllUsersModal();">دردشة خاصة</button>
                <button class="view-profile-btn" onclick="showUserProfile(${user.id})">عرض الملف</button>
            </div>
        </div>
    `).join('');
}

// الحصول على الصورة الافتراضية
function getDefaultAvatar() {
    return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><circle cx='20' cy='20' r='20' fill='%23007bff'/><text x='20' y='25' text-anchor='middle' fill='white' font-size='16'>👤</text></svg>";
}

// الحصول على عرض الرتبة
function getRankDisplay(rank) {
    const ranks = {
        visitor: '👋 زائر',
        bronze: '🥉 عضو برونزي',
        silver: '🥈 عضو فضي',
        gold: '🥇 عضو ذهبي',
        trophy: '🏆 كأس',
        diamond: '💎 عضو الماس',
        prince: '👑 برنس'
    };
    return ranks[rank] || '👋 زائر';
}

// تنسيق الوقت
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

// فتح مودال الملف الشخصي
function openProfileModal() {
    document.getElementById('profileModal').classList.add('active');
    loadUserProfile();
}

// إغلاق مودال الملف الشخصي
function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('active');
}

// تحميل بيانات المستخدم
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const user = await response.json();
        
        // تحديث الصور
        if (user.profile_image1) {
            document.getElementById('profileImg1').src = user.profile_image1;
        }
        if (user.profile_image2) {
            document.getElementById('profileImg2').src = user.profile_image2;
        }
        
        // تحديث الرتبة الحالية
        document.getElementById('currentRank').textContent = getRankDisplay(user.rank);
        
        // تحديث الاسم
        document.getElementById('newDisplayName').value = user.display_name;
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات المستخدم:', error);
    }
}

// معاينة صورة البروفايل
function previewProfileImage(slot, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(`profileImg${slot}`).src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// رفع صور البروفايل
async function uploadProfileImages() {
    const formData = new FormData();
    
    const file1 = document.getElementById('profileFile1').files[0];
    const file2 = document.getElementById('profileFile2').files[0];
    
    if (file1) formData.append('profile1', file1);
    if (file2) formData.append('profile2', file2);
    
    if (!file1 && !file2) {
        alert('يرجى اختيار صورة واحدة على الأقل');
        return;
    }
    
    try {
        const response = await fetch('/api/upload-profile-images', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('تم حفظ الصور بنجاح');
            if (data.profile_image1) {
                document.getElementById('userAvatar').src = data.profile_image1;
            }
        } else {
            alert(data.error || 'حدث خطأ في رفع الصور');
        }
    } catch (error) {
        console.error('خطأ في رفع الصور:', error);
        alert('حدث خطأ في رفع الصور');
    }
}

// تحديث الاسم المعروض
async function updateDisplayName() {
    const newName = document.getElementById('newDisplayName').value.trim();
    
    if (!newName) {
        alert('يرجى إدخال اسم صحيح');
        return;
    }
    
    try {
        const response = await fetch('/api/user/display-name', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ display_name: newName })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('تم تحديث الاسم بنجاح');
            document.getElementById('userDisplayName').textContent = newName;
            currentUser.display_name = newName;
        } else {
            alert(data.error || 'حدث خطأ في تحديث الاسم');
        }
    } catch (error) {
        console.error('خطأ في تحديث الاسم:', error);
        alert('حدث خطأ في تحديث الاسم');
    }
}

// تحديث المعلومات الشخصية
async function updatePersonalInfo() {
    const age = document.getElementById('userAge').value;
    const gender = document.getElementById('userGender').value;
    const maritalStatus = document.getElementById('userMaritalStatus').value;
    const aboutMe = document.getElementById('userAboutMe').value;
    
    try {
        const response = await fetch('/api/user/personal-info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                age: age || null,
                gender: gender || null,
                marital_status: maritalStatus || null,
                about_me: aboutMe || null
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('تم تحديث المعلومات بنجاح');
        } else {
            alert(data.error || 'حدث خطأ في تحديث المعلومات');
        }
    } catch (error) {
        console.error('خطأ في تحديث المعلومات:', error);
        alert('حدث خطأ في تحديث المعلومات');
    }
}

// فتح إعدادات الأصوات
function openSoundSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2>إعدادات الأصوات</h2>
            
            <div class="sound-settings">
                <div class="sound-setting">
                    <label>
                        <input type="checkbox" ${soundSettings.messageSound ? 'checked' : ''} onchange="updateSoundSetting('messageSound', this.checked)">
                        صوت الرسائل العامة
                    </label>
                    <button class="test-sound-btn" onclick="playSound('message')">تجربة</button>
                </div>
                
                <div class="sound-setting">
                    <label>
                        <input type="checkbox" ${soundSettings.notificationSound ? 'checked' : ''} onchange="updateSoundSetting('notificationSound', this.checked)">
                        صوت الرسائل الخاصة
                    </label>
                    <button class="test-sound-btn" onclick="playSound('notification')">تجربة</button>
                </div>
                
                <div class="sound-setting">
                    <label>
                        <input type="checkbox" ${soundSettings.voiceMessageSound ? 'checked' : ''} onchange="updateSoundSetting('voiceMessageSound', this.checked)">
                        صوت الرسائل الصوتية
                    </label>
                    <button class="test-sound-btn" onclick="playSound('notification')">تجربة</button>
                </div>
            </div>
            
            <div class="sound-actions">
                <button class="btn save-btn" onclick="this.closest('.modal').remove()">حفظ</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// تحديث إعداد الصوت
function updateSoundSetting(setting, value) {
    soundSettings[setting] = value;
    saveSoundSettings();
}

// فتح لوحة الإدارة
function openAdminPanel() {
    if (currentUser.role !== 'admin') return;
    
    document.getElementById('adminModal').classList.add('active');
    loadAllUsersForAdmin();
    loadAvailableRanks();
}

// إغلاق لوحة الإدارة
function closeAdminPanel() {
    document.getElementById('adminModal').classList.remove('active');
}

// تحميل المستخدمين للإدارة
async function loadAllUsersForAdmin() {
    try {
        const response = await fetch('/api/all-users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const users = await response.json();
        const container = document.getElementById('allUsersList');
        
        container.innerHTML = users.map(user => `
            <div class="admin-user-item">
                <div class="admin-user-info">
                    <img src="${user.profile_image1 || getDefaultAvatar()}" alt="صورة شخصية" class="admin-user-avatar">
                    <div class="admin-user-details">
                        <h4>${user.display_name}</h4>
                        <p>${user.email} - ${getRankDisplay(user.rank)}</p>
                        <p>تاريخ التسجيل: ${new Date(user.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                </div>
                <button class="assign-rank-btn" onclick="openAssignRankModal(${user.id}, '${user.display_name}')">
                    تعيين رتبة
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('خطأ في تحميل المستخدمين:', error);
    }
}

// تحميل الرتب المتاحة
async function loadAvailableRanks() {
    try {
        const response = await fetch('/api/ranks', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const ranks = await response.json();
        const container = document.getElementById('availableRanks');
        
        container.innerHTML = Object.entries(ranks).map(([key, rank]) => `
            <div class="rank-item">
                <span class="rank-emoji">${rank.emoji}</span>
                <div class="rank-name">${rank.name}</div>
                <div class="rank-level">المستوى: ${rank.level}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('خطأ في تحميل الرتب:', error);
    }
}

// فتح مودال تعيين الرتبة
async function openAssignRankModal(userId, userName) {
    document.getElementById('targetUserName').textContent = userName;
    document.getElementById('assignRankModal').dataset.userId = userId;
    document.getElementById('assignRankModal').classList.add('active');
    
    // تحميل الرتب في القائمة المنسدلة
    try {
        const response = await fetch('/api/ranks', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        const ranks = await response.json();
        const select = document.getElementById('rankSelect');
        
        select.innerHTML = '<option value="">اختر الرتبة</option>' +
            Object.entries(ranks).map(([key, rank]) => 
                `<option value="${key}">${rank.emoji} ${rank.name}</option>`
            ).join('');
    } catch (error) {
        console.error('خطأ في تحميل الرتب:', error);
    }
}

// إغلاق مودال تعيين الرتبة
function closeAssignRankModal() {
    document.getElementById('assignRankModal').classList.remove('active');
}

// تأكيد تعيين الرتبة
async function confirmAssignRank() {
    const userId = document.getElementById('assignRankModal').dataset.userId;
    const newRank = document.getElementById('rankSelect').value;
    const reason = document.getElementById('rankReason').value;
    
    if (!newRank) {
        alert('يرجى اختيار رتبة');
        return;
    }
    
    try {
        const response = await fetch('/api/assign-rank', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ userId, newRank, reason })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(data.message);
            closeAssignRankModal();
            loadAllUsersForAdmin();
        } else {
            alert(data.error || 'حدث خطأ في تعيين الرتبة');
        }
    } catch (error) {
        console.error('خطأ في تعيين الرتبة:', error);
        alert('حدث خطأ في تعيين الرتبة');
    }
}

// فتح مودال إنشاء غرفة
function openCreateRoomModal() {
    if (currentUser.role !== 'admin') return;
    document.getElementById('createRoomModal').classList.add('active');
}

// إغلاق مودال إنشاء غرفة
function closeCreateRoomModal() {
    document.getElementById('createRoomModal').classList.remove('active');
}

// إنشاء غرفة جديدة
async function createRoom() {
    const name = document.getElementById('roomName').value.trim();
    const description = document.getElementById('roomDescription').value.trim();
    const backgroundFile = document.getElementById('roomBackgroundFile').files[0];
    
    if (!name) {
        alert('يرجى إدخال اسم الغرفة');
        return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (backgroundFile) {
        formData.append('roomBackground', backgroundFile);
    }
    
    try {
        const response = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('تم إنشاء الغرفة بنجاح');
            closeCreateRoomModal();
            loadRooms();
            
            // مسح النموذج
            document.getElementById('roomName').value = '';
            document.getElementById('roomDescription').value = '';
            document.getElementById('roomBackgroundFile').value = '';
            document.getElementById('roomBackgroundPreview').style.backgroundImage = '';
        } else {
            alert(data.error || 'حدث خطأ في إنشاء الغرفة');
        }
    } catch (error) {
        console.error('خطأ في إنشاء الغرفة:', error);
        alert('حدث خطأ في إنشاء الغرفة');
    }
}

// حذف غرفة
async function deleteRoom(roomId) {
    if (!confirm('هل أنت متأكد من حذف هذه الغرفة؟')) return;
    
    try {
        const response = await fetch(`/api/rooms/${roomId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
            socket.emit('deleteRoom', roomId);
            loadRooms();
        }
    } catch (error) {
        console.error('خطأ في حذف الغرفة:', error);
        alert('حدث خطأ في حذف الغرفة');
    }
}

// معاينة خلفية الغرفة
function previewRoomBackground(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('roomBackgroundPreview');
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.classList.add('has-image');
            preview.textContent = '';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('token');
    if (socket) {
        socket.disconnect();
    }
    showScreen('loginScreen');
    currentUser = null;
}

// معالجة الضغط على Enter
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('privateMessageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendPrivateMessage();
    }
});

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        initializeChat();
    }
});