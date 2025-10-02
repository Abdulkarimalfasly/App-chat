const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*'
  } // للسماح بالاتصال من أي مصدر
});

app.use(bodyParser.json());
app.use(express.static('Uploads')); // لخدمة الملفات (صور، صوت) من مجلد Uploads

// إعداد Multer لتخزين الملفات مع حد للحجم
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // حد 5 ميغابايت
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('الملف يجب أن يكون صورة (jpeg/png) أو صوت (webm)'));
    }
  }
});

// مصفوفات مؤقتة لتخزين البيانات
let rooms = [
  { id: 1, name: 'الغرفة الرئيسية', description: 'غرفة دردشة عامة', background: null }
];

const OWNER_EMAIL = 'njdj9985@gmail.com';

let users = [
  {
    id: 1,
    display_name: 'المالك',
    rank: 'owner',
    role: 'owner',
    email: OWNER_EMAIL,
    password: 'owner123',
    profile_image1: null,
    profile_image2: null,
    message_background: null,
    age: null,
    gender: null,
    marital_status: null,
    about_me: null,
    coins: 999999,
    frames: ['owner_frame_1', 'owner_frame_2', 'owner_frame_3'],
    active_frame: 'owner_frame_1',
    privacy_settings: {
      profile_visibility: 'all',
      pm_allowed: 'all',
      show_age: true,
      show_status: true,
      show_last_seen: true
    }
  }
];

let frames = [
  { id: 'owner_frame_1', name: 'إطار المالك الذهبي', type: 'owner', price: 0, animated: true, purchasable: false, animation: 'rainbow-glow' },
  { id: 'owner_frame_2', name: 'إطار المالك الفضي', type: 'owner', price: 0, animated: true, purchasable: false, animation: 'pulse-glow' },
  { id: 'owner_frame_3', name: 'إطار المالك الماسي', type: 'owner', price: 0, animated: true, purchasable: false, animation: 'sparkle-glow' },
  { id: 'admin_frame_1', name: 'إطار الإدارة 1', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'rainbow-glow' },
  { id: 'admin_frame_2', name: 'إطار الإدارة 2', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'pulse-glow' },
  { id: 'admin_frame_3', name: 'إطار الإدارة 3', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'sparkle-glow' },
  { id: 'admin_frame_4', name: 'إطار الإدارة 4', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'rotate-glow' },
  { id: 'admin_frame_5', name: 'إطار الإدارة 5', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'slide-glow' },
  { id: 'admin_frame_6', name: 'إطار الإدارة 6', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'bounce-glow' },
  { id: 'admin_frame_7', name: 'إطار الإدارة 7', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'wave-glow' },
  { id: 'admin_frame_8', name: 'إطار الإدارة 8', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'shake-glow' },
  { id: 'admin_frame_9', name: 'إطار الإدارة 9', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'flip-glow' },
  { id: 'admin_frame_10', name: 'إطار الإدارة 10', type: 'admin', price: 100000, animated: true, purchasable: true, animation: 'zoom-glow' },
  { id: 'prince_frame_1', name: 'إطار البرنس 1', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'rainbow-glow' },
  { id: 'prince_frame_2', name: 'إطار البرنس 2', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'pulse-glow' },
  { id: 'prince_frame_3', name: 'إطار البرنس 3', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'sparkle-glow' },
  { id: 'prince_frame_4', name: 'إطار البرنس 4', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'rotate-glow' },
  { id: 'prince_frame_5', name: 'إطار البرنس 5', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'slide-glow' },
  { id: 'prince_frame_6', name: 'إطار البرنس 6', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'bounce-glow' },
  { id: 'prince_frame_7', name: 'إطار البرنس 7', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'wave-glow' },
  { id: 'prince_frame_8', name: 'إطار البرنس 8', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'shake-glow' },
  { id: 'prince_frame_9', name: 'إطار البرنس 9', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'flip-glow' },
  { id: 'prince_frame_10', name: 'إطار البرنس 10', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'zoom-glow' },
  { id: 'prince_frame_11', name: 'إطار البرنس 11', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'swing-glow' },
  { id: 'prince_frame_12', name: 'إطار البرنس 12', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'twist-glow' },
  { id: 'prince_frame_13', name: 'إطار البرنس 13', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'fade-glow' },
  { id: 'prince_frame_14', name: 'إطار البرنس 14', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'blink-glow' },
  { id: 'prince_frame_15', name: 'إطار البرنس 15', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'spin-glow' },
  { id: 'prince_frame_16', name: 'إطار البرنس 16', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'float-glow' },
  { id: 'prince_frame_17', name: 'إطار البرنس 17', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'stretch-glow' },
  { id: 'prince_frame_18', name: 'إطار البرنس 18', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'squeeze-glow' },
  { id: 'prince_frame_19', name: 'إطار البرنس 19', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'jello-glow' },
  { id: 'prince_frame_20', name: 'إطار البرنس 20', type: 'prince', price: 2000, animated: true, purchasable: true, animation: 'wobble-glow' }
];

let shopItems = [];
let musicPlaylist = [];
let quizRooms = [];
let auditLog = [];

let messages = [];
let privateMessages = [];
let news = [];
let stories = [];
let bans = [];
let mutes = [];
let floodProtection = new Map(); // لحماية من الفيضانات
let competitions = [];
let comments = [];

// API لتسجيل الدخول
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const token = 'fake-token-' + user.id;
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'بيانات تسجيل الدخول غير صحيحة' });
  }
});

// API لإنشاء حساب
app.post('/api/register', (req, res) => {
  const { email, password, display_name } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'البريد الإلكتروني موجود مسبقًا' });
  }
  const newUser = {
    id: users.length + 1,
    email,
    password,
    display_name,
    rank: 'visitor',
    role: 'user',
    profile_image1: null,
    profile_image2: null,
    message_background: null,
    age: null,
    gender: null,
    marital_status: null,
    about_me: null,
    coins: 100,
    frames: [],
    active_frame: null,
    privacy_settings: {
      profile_visibility: 'all',
      pm_allowed: 'all',
      show_age: true,
      show_status: true,
      show_last_seen: true
    },
    joined_date: new Date()
  };
  users.push(newUser);
  const token = 'fake-token-' + newUser.id;
  res.json({ token, user: newUser });
});

// API للحصول على بيانات الملف الشخصي
app.get('/api/user/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (user) res.json(user);
  else res.status(401).json({ error: 'غير مصرح له' });
});

// API لتحديث الملف الشخصي
app.put('/api/user/profile', upload.fields([
  { name: 'profileImage1', maxCount: 1 },
  { name: 'profileImage2', maxCount: 1 },
  { name: 'messageBackground', maxCount: 1 }
]), (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user) return res.status(401).json({ error: 'غير مصرح له' });

  const { display_name, age, gender, marital_status, about_me } = req.body;

  if (display_name) user.display_name = display_name;
  if (age) user.age = parseInt(age);
  if (gender) user.gender = gender;
  if (marital_status) user.marital_status = marital_status;
  if (about_me) user.about_me = about_me;
  if (req.files['profileImage1']) user.profile_image1 = `/Uploads/${req.files['profileImage1'][0].filename}`;
  if (req.files['profileImage2']) user.profile_image2 = `/Uploads/${req.files['profileImage2'][0].filename}`;
  if (req.files['messageBackground']) user.message_background = `/Uploads/${req.files['messageBackground'][0].filename}`;

  res.json(user);
  io.emit('userUpdated', user);
});

// API للحصول على قائمة الغرف
app.get('/api/rooms', (req, res) => res.json(rooms));

// API لإنشاء غرفة جديدة
app.post('/api/rooms', upload.single('roomBackground'), (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' });

  const { name, description } = req.body;
  const background = req.file ? `/Uploads/${req.file.filename}` : null;

  const newRoom = {
    id: rooms.length + 1,
    name,
    description,
    background
  };

  rooms.push(newRoom);
  io.emit('roomCreated', newRoom);
  res.json(newRoom);
});

// API لحذف غرفة
app.delete('/api/rooms/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' });

  const roomId = parseInt(req.params.id);
  rooms = rooms.filter(r => r.id !== roomId);
  io.emit('roomDeleted', roomId);
  res.json({ message: 'تم حذف الغرفة' });
});

// API للحصول على رسائل الغرفة
app.get('/api/messages/:roomId', (req, res) => {
  res.json(messages.filter(m => m.roomId === parseInt(req.params.roomId)));
});

// API للحصول على الرسائل الخاصة
app.get('/api/private-messages/:userId', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const current = users.find(u => 'fake-token-' + u.id === token);
  if (!current) return res.status(401).json({ error: 'غير مصرح له' });
  res.json(privateMessages.filter(pm =>
    (pm.senderId === current.id && pm.receiverId === parseInt(req.params.userId)) ||
    (pm.senderId === parseInt(req.params.userId) && pm.receiverId === current.id)
  ));
});

// API للحصول على الأخبار
app.get('/api/news', (req, res) => {
  res.json(news);
});

// API لنشر خبر جديد
app.post('/api/news', upload.single('newsFile'), (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user) return res.status(401).json({ error: 'غير مصرح له' });

  const { content } = req.body;
  if (!content && !req.file) return res.status(400).json({ error: 'يجب إدخال محتوى أو ملف' });

  const media = req.file ? `/Uploads/${req.file.filename}` : null;

  const newNews = {
    id: news.length + 1,
    content,
    media,
    user_id: user.id,
    display_name: user.display_name,
    timestamp: new Date(),
    likes: []
  };

  news.push(newNews);
  io.emit('newNews', newNews);
  res.json(newNews);
});

// API للحصول على الستوريات
app.get('/api/stories', (req, res) => {
  res.json(stories.filter(s => new Date() - new Date(s.timestamp) < 24 * 60 * 60 * 1000));
});

// API لنشر ستوري جديد
app.post('/api/stories', upload.single('storyImage'), (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user) return res.status(401).json({ error: 'غير مصرح له' });

  const image = req.file ? `/Uploads/${req.file.filename}` : null;
  if (!image) return res.status(400).json({ error: 'يجب رفع صورة' });

  const newStory = {
    id: stories.length + 1,
    image,
    user_id: user.id,
    display_name: user.display_name,
    timestamp: new Date()
  };

  stories.push(newStory);
  io.emit('newStory', newStory);
  res.json(newStory);
});

// API للتعليقات
app.post('/api/comments', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user) return res.status(401).json({ error: 'غير مصرح له' });

  const { postId, content, targetUserId } = req.body;

  const newComment = {
    id: comments.length + 1,
    postId: parseInt(postId),
    content,
    user_id: user.id,
    display_name: user.display_name,
    targetUserId: targetUserId ? parseInt(targetUserId) : null,
    timestamp: new Date()
  };

  comments.push(newComment);

  // إرسال إشعار للمستخدم المستهدف
  if (targetUserId) {
    io.emit('newComment', { ...newComment, targetUserId });
  }

  res.json(newComment);
});

// API للحصول على التعليقات
app.get('/api/comments/:postId', (req, res) => {
  const postComments = comments.filter(c => c.postId === parseInt(req.params.postId));
  res.json(postComments);
});

// API للمسابقات
app.post('/api/competitions', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' });

  const { title, duration } = req.body;

  const newCompetition = {
    id: competitions.length + 1,
    title,
    duration: parseInt(duration),
    startTime: new Date(),
    active: true
  };

  competitions.push(newCompetition);
  io.emit('newCompetition', newCompetition);
  res.json(newCompetition);
});

// API لتعيين رتبة
app.post('/api/assign-rank', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const admin = users.find(u => 'fake-token-' + u.id === token);
  if (!admin || (admin.role !== 'owner' && admin.role !== 'admin')) {
    return res.status(403).json({ error: 'غير مسموح' });
  }

  const { userId, rank, role, reason } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  if (admin.role !== 'owner' && rank === 'owner') {
    return res.status(403).json({ error: 'فقط المالك يمكنه تعيين رتبة المالك' });
  }

  user.rank = rank;
  if (role) user.role = role;

  auditLog.push({
    id: auditLog.length + 1,
    action: 'assign_rank',
    adminId: admin.id,
    userId: user.id,
    rank,
    role: role || user.role,
    reason: reason || 'بدون سبب',
    timestamp: new Date()
  });

  res.json({ message: 'تم تعيين الرتبة' });
  io.emit('userUpdated', user);
});

// API للحصول على قائمة المستخدمين
app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({
    id: u.id,
    display_name: u.display_name,
    rank: u.rank,
    profile_image1: u.profile_image1,
    age: u.age,
    gender: u.gender,
    marital_status: u.marital_status,
    about_me: u.about_me
  })));
});

// API للطرد
app.post('/api/ban', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const admin = users.find(u => 'fake-token-' + u.id === token);
  if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' });

  const { userId, reason, duration } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const ban = {
    id: bans.length + 1,
    user_id: user.id,
    reason,
    duration,
    timestamp: new Date()
  };

  bans.push(ban);
  io.emit('userBanned', { userId: user.id, reason, duration });
  res.json({ message: 'تم طرد المستخدم' });
});

// API للكتم
app.post('/api/mute', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const admin = users.find(u => 'fake-token-' + u.id === token);
  if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'غير مسموح' });

  const { userId, reason, duration } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const mute = {
    id: mutes.length + 1,
    user_id: user.id,
    reason,
    duration,
    timestamp: new Date()
  };

  mutes.push(mute);
  io.emit('userMuted', { userId: user.id, reason, duration });
  res.json({ message: 'تم كتم المستخدم' });
});

// Socket.IO للتواصل الفوري
io.on('connection', (socket) => {
  console.log('مستخدم متصل: ' + socket.id);

  // الانضمام إلى غرفة
  socket.on('join', (data) => {
    socket.join(data.roomId);
    socket.user = data;
    io.emit('userList', users.filter(u => u.id !== socket.user.userId));
  });

  // إرسال رسالة عامة
  socket.on('sendMessage', (data) => {
    const userId = socket.user.userId;
    const now = Date.now();

    if (!floodProtection.has(userId)) {
      floodProtection.set(userId, []);
    }

    const userMessages = floodProtection.get(userId);
    const recentMessages = userMessages.filter(time => now - time < 10000);

    if (recentMessages.length >= 5) {
      const muteEndTime = new Date(now + 5 * 60 * 1000); // 5 دقائق
      const mute = {
        id: mutes.length + 1,
        user_id: userId,
        reason: 'الفيضانات - رسائل سريعة ومتكررة',
        duration: '5m',
        timestamp: new Date(),
        endTime: muteEndTime
      };
      mutes.push(mute);

      const muteMessage = {
        id: messages.length + 1,
        roomId: data.roomId,
        content: `تم كتم ${socket.user.display_name} بسبب الفيضانات`,
        type: 'system',
        timestamp: new Date()
      };

      messages.push(muteMessage);
      io.to(data.roomId).emit('newMessage', muteMessage);
      socket.emit('error', 'تم كتمك لمدة 5 دقائق بسبب الرسائل السريعة والمتكررة');
      return;
    }

    recentMessages.push(now);
    floodProtection.set(userId, recentMessages);

    const isMuted = mutes.find(m => m.user_id === socket.user.userId && 
      (m.duration === 'permanent' || (m.endTime && new Date() < new Date(m.endTime)) || 
      new Date() - new Date(m.timestamp) < parseDuration(m.duration)));

    if (isMuted) return socket.emit('error', 'أنت مكتوم ولا يمكنك إرسال الرسائل');

    const message = {
      id: messages.length + 1,
      roomId: data.roomId,
      user_id: socket.user.userId,
      display_name: socket.user.display_name,
      rank: socket.user.rank,
      content: data.content,
      type: 'text',
      timestamp: new Date()
    };

    messages.push(message);
    io.to(data.roomId).emit('newMessage', message);
  });

  // إرسال رسالة خاصة
  socket.on('sendPrivateMessage', (data) => {
    const isMuted = mutes.find(m => m.user_id === socket.user.userId && 
      (m.duration === 'permanent' || new Date() - new Date(m.timestamp) < parseDuration(m.duration)));

    if (isMuted) return socket.emit('error', 'أنت مكتوم ولا يمكنك إرسال الرسائل');

    const message = {
      id: privateMessages.length + 1,
      senderId: socket.user.userId,
      display_name: socket.user.display_name,
      rank: socket.user.rank,
      receiverId: data.receiverId,
      content: data.content,
      type: 'text',
      timestamp: new Date()
    };

    privateMessages.push(message);
    socket.to(data.receiverId).emit('newPrivateMessage', message);
    socket.emit('newPrivateMessage', message);
  });

  // إرسال صورة عامة
  socket.on('sendImage', (data, callback) => {
    upload.single('image')(data, {}, (err) => {
      if (err) {
        console.error('Error uploading image:', err.message);
        return callback({ error: 'فشل رفع الصورة: ' + err.message });
      }

      const isMuted = mutes.find(m => m.user_id === socket.user.userId && 
        (m.duration === 'permanent' || new Date() - new Date(m.timestamp) < parseDuration(m.duration)));

      if (isMuted) return callback({ error: 'أنت مكتوم ولا يمكنك إرسال الصور' });

      const imageUrl = `/Uploads/${data.file.filename}`;
      const message = {
        id: messages.length + 1,
        image_url: imageUrl,
        type: 'image',
        roomId: data.roomId,
        user_id: socket.user.userId,
        display_name: socket.user.display_name,
        rank: socket.user.rank,
        timestamp: new Date()
      };

      messages.push(message);
      io.to(data.roomId).emit('newImage', message);
      callback({ success: true, imageUrl });
    });
  });

  // إرسال صورة خاصة
  socket.on('sendPrivateImage', (data, callback) => {
    upload.single('image')(data, {}, (err) => {
      if (err) {
        console.error('Error uploading private image:', err.message);
        return callback({ error: 'فشل رفع الصورة: ' + err.message });
      }

      const isMuted = mutes.find(m => m.user_id === socket.user.userId && 
        (m.duration === 'permanent' || new Date() - new Date(m.timestamp) < parseDuration(m.duration)));

      if (isMuted) return callback({ error: 'أنت مكتوم ولا يمكنك إرسال الصور' });

      const imageUrl = `/Uploads/${data.file.filename}`;
      const message = {
        id: privateMessages.length + 1,
        image_url: imageUrl,
        type: 'image',
        receiverId: data.receiverId,
        user_id: socket.user.userId,
        display_name: socket.user.display_name,
        rank: socket.user.rank,
        timestamp: new Date()
      };

      privateMessages.push(message);
      socket.to(data.receiverId).emit('newPrivateImage', message);
      socket.emit('newPrivateImage', message);
      callback({ success: true, imageUrl });
    });
  });

  // إرسال رسالة صوتية عامة
  socket.on('sendVoice', (data, callback) => {
    upload.single('voice')(data, {}, (err) => {
      if (err) {
        console.error('Error uploading voice:', err.message);
        return callback({ error: 'فشل رفع التسجيل الصوتي: ' + err.message });
      }

      const isMuted = mutes.find(m => m.user_id === socket.user.userId && 
        (m.duration === 'permanent' || new Date() - new Date(m.timestamp) < parseDuration(m.duration)));

      if (isMuted) return callback({ error: 'أنت مكتوم ولا يمكنك إرسال الرسائل الصوتية' });

      const voiceUrl = `/Uploads/${data.file.filename}`;
      const message = {
        id: messages.length + 1,
        voice_url: voiceUrl,
        type: 'voice',
        roomId: data.roomId,
        user_id: socket.user.userId,
        display_name: socket.user.display_name,
        rank: socket.user.rank,
        timestamp: new Date()
      };

      messages.push(message);
      io.to(data.roomId).emit('newVoice', message);
      callback({ success: true, voiceUrl });
    });
  });

  // إرسال رسالة صوتية خاصة
  socket.on('sendPrivateVoice', (data, callback) => {
    upload.single('voice')(data, {}, (err) => {
      if (err) {
        console.error('Error uploading private voice:', err.message);
        return callback({ error: 'فشل رفع التسجيل الصوتي: ' + err.message });
      }

      const isMuted = mutes.find(m => m.user_id === socket.user.userId && 
        (m.duration === 'permanent' || new Date() - new Date(m.timestamp) < parseDuration(m.duration)));

      if (isMuted) return callback({ error: 'أنت مكتوم ولا يمكنك إرسال الرسائل الصوتية' });

      const voiceUrl = `/Uploads/${data.file.filename}`;
      const message = {
        id: privateMessages.length + 1,
        voice_url: voiceUrl,
        type: 'voice',
        receiverId: data.receiverId,
        user_id: socket.user.userId,
        display_name: socket.user.display_name,
        rank: socket.user.rank,
        timestamp: new Date()
      };

      privateMessages.push(message);
      socket.to(data.receiverId).emit('newPrivateVoice', message);
      socket.emit('newPrivateVoice', message);
      callback({ success: true, voiceUrl });
    });
  });

  // حذف غرفة
  socket.on('deleteRoom', (roomId) => {
    const user = users.find(u => u.id === socket.user.userId);
    if (user.role === 'admin') {
      rooms = rooms.filter(r => r.id !== roomId);
      io.emit('roomDeleted', roomId);
    }
  });

  // إرسال إشعار
  socket.on('sendNotification', (data) => {
    io.to(data.userId).emit('newNotification', data);
  });

  // تحميل المنشورات
  socket.on('loadNewsPosts', () => {
    socket.emit('loadNewsPosts', news);
  });

  // نشر خبر جديد
  socket.on('addNewsPost', (data) => {
    const user = socket.user;
    if (!user) return;

    const isMuted = mutes.find(m => m.user_id === user.userId &&
      (m.duration === 'permanent' ||
      new Date() - new Date(m.timestamp) < parseDuration(m.duration)));

    if (isMuted) return socket.emit('error', 'أنت مكتوم ولا يمكنك نشر الأخبار');

    const newNews = {
      id: news.length + 1,
      content: data.content,
      media: data.media,
      user_id: user.userId,
      display_name: user.display_name,
      timestamp: new Date(),
      likes: []
    };

    news.push(newNews);
    io.emit('updateNewsPost', newNews);
  });

  // إضافة تفاعل
  socket.on('addReaction', (data) => {
    const user = socket.user;
    if (!user) return;
    const post = news.find(n => n.id === parseInt(data.postId));
    if (post) {
      if (!post.reactions) post.reactions = { likes: [], dislikes: [], hearts: [] };

      // إزالة التفاعل السابق للمستخدم
      Object.keys(post.reactions).forEach(reactionType => {
        post.reactions[reactionType] = post.reactions[reactionType].filter(r => r.user_id !== user.userId);
      });

      // إضافة التفاعل الجديد
      if (data.type === 'like') {
        post.reactions.likes.push({ user_id: user.userId, display_name: user.display_name });
      } else if (data.type === 'dislike') {
        post.reactions.dislikes.push({ user_id: user.userId, display_name: user.display_name });
      } else if (data.type === 'heart') {
        post.reactions.hearts.push({ user_id: user.userId, display_name: user.display_name });
      }
      io.emit('updateNewsPost', post);
    }
  });

  // إضافة تعليق
  socket.on('addComment', (data) => {
    const user = socket.user;
    if (!user) return;

    const newComment = {
      id: comments.length + 1,
      postId: parseInt(data.postId),
      content: data.content,
      user_id: user.userId,
      display_name: user.display_name,
      targetUserId: data.targetUserId ? parseInt(data.targetUserId) : null,
      timestamp: new Date()
    };

    comments.push(newComment);

    // إرسال التعليق للجميع
    io.emit('newComment', newComment);

    // إرسال إشعار للمستخدم المستهدف
    if (data.targetUserId) {
      io.to(data.targetUserId).emit('commentNotification', {
        from: user.display_name,
        content: data.content,
        postId: data.postId
      });
    }
  });

  // إيقاف المسابقة
  socket.on('stopCompetition', (competitionId) => {
    const competition = competitions.find(c => c.id === parseInt(competitionId));
    if (competition) {
      competition.active = false;
      io.emit('competitionStopped', competitionId);
    }
  });

  socket.on('startQuiz', (quizId) => {
    const quiz = quizRooms.find(q => q.id === parseInt(quizId));
    if (!quiz) return;

    quiz.currentQuestion = 0;
    quiz.timer = 20;
    quiz.active = true;

    io.emit('quizStarted', quiz);

    const quizInterval = setInterval(() => {
      if (!quiz.active) {
        clearInterval(quizInterval);
        return;
      }

      quiz.timer--;

      if (quiz.timer <= 0) {
        quiz.currentQuestion++;

        if (quiz.currentQuestion >= quiz.questions.length) {
          quiz.active = false;
          io.emit('quizEnded', { quizId: quiz.id, scores: quiz.scores });
          clearInterval(quizInterval);
          return;
        }

        quiz.timer = 20;
        io.emit('quizNextQuestion', {
          quizId: quiz.id,
          currentQuestion: quiz.currentQuestion,
          question: quiz.questions[quiz.currentQuestion],
          timer: quiz.timer
        });
      } else {
        io.emit('quizTimerUpdate', { quizId: quiz.id, timer: quiz.timer });
      }
    }, 1000);
  });

  socket.on('playMusic', (songId) => {
    const song = musicPlaylist.find(s => s.id === parseInt(songId));
    if (!song) return socket.emit('error', 'الأغنية غير موجودة');

    io.emit('musicPlaying', song);
  });

  socket.on('stopMusic', () => {
    io.emit('musicStopped');
  });

  socket.on('deleteNews', (newsId) => {
    const user = users.find(u => u.id === socket.user.userId);
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return socket.emit('error', 'غير مسموح');
    }

    news = news.filter(n => n.id !== parseInt(newsId));
    io.emit('newsDeleted', newsId);

    auditLog.push({
      id: auditLog.length + 1,
      action: 'delete_news',
      adminId: user.id,
      newsId: parseInt(newsId),
      timestamp: new Date()
    });
  });

  socket.on('muteWithDuration', (data) => {
    const user = users.find(u => u.id === socket.user.userId);
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return socket.emit('error', 'غير مسموح');
    }

    const targetUser = users.find(u => u.id === parseInt(data.userId));
    if (!targetUser) return socket.emit('error', 'المستخدم غير موجود');

    const duration = data.duration || '5m';
    const endTime = duration === 'permanent' ? null : new Date(Date.now() + parseDuration(duration));

    const mute = {
      id: mutes.length + 1,
      user_id: targetUser.id,
      reason: data.reason || 'بدون سبب',
      duration,
      timestamp: new Date(),
      endTime
    };

    mutes.push(mute);

    const showPublicMessage = data.showPublicMessage !== false;
    if (showPublicMessage) {
      const muteMessage = {
        id: messages.length + 1,
        roomId: data.roomId || 1,
        content: `تم كتم ${targetUser.display_name} ${duration === 'permanent' ? 'بشكل دائم' : 'لمدة ' + duration}`,
        type: 'system',
        timestamp: new Date()
      };
      messages.push(muteMessage);
      io.emit('newMessage', muteMessage);
    }

    io.emit('userMuted', { userId: targetUser.id, reason: mute.reason, duration, endTime });

    auditLog.push({
      id: auditLog.length + 1,
      action: 'mute',
      adminId: user.id,
      userId: targetUser.id,
      reason: mute.reason,
      duration,
      timestamp: new Date()
    });
  });

  socket.on('addCoins', (data) => {
    const admin = users.find(u => u.id === socket.user.userId);
    if (!admin || admin.role !== 'owner') {
      return socket.emit('error', 'غير مسموح');
    }

    const targetUser = users.find(u => u.id === parseInt(data.userId));
    if (!targetUser) return socket.emit('error', 'المستخدم غير موجود');

    if (!targetUser.coins) targetUser.coins = 0;
    targetUser.coins += parseInt(data.amount);

    io.emit('userUpdated', targetUser);
    socket.emit('success', `تمت إضافة ${data.amount} كونز لـ ${targetUser.display_name}`);

    auditLog.push({
      id: auditLog.length + 1,
      action: 'add_coins',
      adminId: admin.id,
      userId: targetUser.id,
      amount: parseInt(data.amount),
      timestamp: new Date()
    });
  });

  // فصل الاتصال
  socket.on('disconnect', () => {
    console.log('مستخدم منفصل: ' + socket.id);
    io.emit('userList', users.filter(u => u.id !== socket.user?.userId));
  });
});

// دالة مساعدة لتحويل مدة الكتم/الطرد إلى ميلي ثانية
function parseDuration(duration) {
  const map = {
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    'permanent': Infinity
  };
  return map[duration] || 0;
}

// تنظيف الحماية من الفيضانات كل دقيقة
setInterval(() => {
  const now = Date.now();
  for (const [userId, messages] of floodProtection.entries()) {
    const recentMessages = messages.filter(time => now - time < 60000);
    if (recentMessages.length === 0) {
      floodProtection.delete(userId);
    } else {
      floodProtection.set(userId, recentMessages);
    }
  }
}, 60000);

// تنظيف الكتم المنتهي
setInterval(() => {
  const now = new Date();
  mutes = mutes.filter(mute => {
    if (mute.endTime && now > new Date(mute.endTime)) {
      return false;
    }
    return true;
  });
}, 30000);

app.get('/api/frames', (req, res) => res.json(frames));

app.get('/api/shop', (req, res) => {
  const purchasableFrames = frames.filter(f => f.purchasable);
  res.json({ frames: purchasableFrames, items: shopItems });
});

app.post('/api/shop/purchase', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user) return res.status(401).json({ error: 'غير مصرح له' });

  const { itemId, itemType } = req.body;

  if (itemType === 'frame') {
    const frame = frames.find(f => f.id === itemId);
    if (!frame) return res.status(404).json({ error: 'الإطار غير موجود' });
    if (!frame.purchasable) return res.status(403).json({ error: 'هذا الإطار غير قابل للشراء' });

    if (!user.coins) user.coins = 0;
    if (user.coins < frame.price) return res.status(400).json({ error: 'رصيد غير كافٍ' });

    if (!user.frames) user.frames = [];
    if (user.frames.includes(itemId)) return res.status(400).json({ error: 'تمتلك هذا الإطار بالفعل' });

    user.coins -= frame.price;
    user.frames.push(itemId);

    auditLog.push({
      id: auditLog.length + 1,
      action: 'purchase_frame',
      userId: user.id,
      details: { frameId: itemId, price: frame.price },
      timestamp: new Date()
    });

    res.json({ message: 'تم الشراء بنجاح', user });
  } else {
    return res.status(400).json({ error: 'نوع العنصر غير صحيح' });
  }
});

app.post('/api/frames/activate', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user) return res.status(401).json({ error: 'غير مصرح له' });

  const { frameId } = req.body;

  if (!user.frames || !user.frames.includes(frameId)) {
    return res.status(403).json({ error: 'لا تمتلك هذا الإطار' });
  }

  user.active_frame = frameId;
  res.json({ message: 'تم تفعيل الإطار', user });
  io.emit('userUpdated', user);
});

app.post('/api/owner/change-password', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const owner = users.find(u => 'fake-token-' + u.id === token);
  if (!owner || owner.role !== 'owner') return res.status(403).json({ error: 'غير مسموح' });

  const { userId, newPassword } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  user.password = newPassword;

  auditLog.push({
    id: auditLog.length + 1,
    action: 'change_password',
    adminId: owner.id,
    userId: user.id,
    timestamp: new Date()
  });

  res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
});

app.post('/api/owner/change-email', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const owner = users.find(u => 'fake-token-' + u.id === token);
  if (!owner || owner.role !== 'owner') return res.status(403).json({ error: 'غير مسموح' });

  const { userId, newEmail } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  if (users.find(u => u.email === newEmail && u.id !== user.id)) {
    return res.status(400).json({ error: 'البريد الإلكتروني مستخدم مسبقاً' });
  }

  user.email = newEmail;

  auditLog.push({
    id: auditLog.length + 1,
    action: 'change_email',
    adminId: owner.id,
    userId: user.id,
    timestamp: new Date()
  });

  res.json({ message: 'تم تغيير البريد الإلكتروني بنجاح' });
});

app.post('/api/music/add', upload.single('musicFile'), (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const owner = users.find(u => 'fake-token-' + u.id === token);
  if (!owner || (owner.role !== 'owner' && owner.role !== 'admin')) {
    return res.status(403).json({ error: 'غير مسموح' });
  }

  const { title, artist, url } = req.body;
  const musicUrl = req.file ? `/Uploads/${req.file.filename}` : url;

  const newSong = {
    id: musicPlaylist.length + 1,
    title,
    artist,
    url: musicUrl,
    addedBy: owner.id,
    timestamp: new Date()
  };

  musicPlaylist.push(newSong);
  io.emit('musicAdded', newSong);
  res.json(newSong);
});

app.delete('/api/music/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const owner = users.find(u => 'fake-token-' + u.id === token);
  if (!owner || (owner.role !== 'owner' && owner.role !== 'admin')) {
    return res.status(403).json({ error: 'غير مسموح' });
  }

  const songId = parseInt(req.params.id);
  musicPlaylist = musicPlaylist.filter(s => s.id !== songId);
  io.emit('musicRemoved', songId);
  res.json({ message: 'تم حذف الأغنية' });
});

app.get('/api/music', (req, res) => res.json(musicPlaylist));

app.post('/api/quiz/create', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const owner = users.find(u => 'fake-token-' + u.id === token);
  if (!owner || owner.role !== 'owner') return res.status(403).json({ error: 'غير مسموح' });

  const { title, questions } = req.body;

  const newQuiz = {
    id: quizRooms.length + 1,
    title,
    questions,
    currentQuestion: 0,
    timer: 20,
    active: true,
    startTime: new Date(),
    scores: {}
  };

  quizRooms.push(newQuiz);
  io.emit('quizCreated', newQuiz);
  res.json(newQuiz);
});

app.get('/api/quiz/:id', (req, res) => {
  const quiz = quizRooms.find(q => q.id === parseInt(req.params.id));
  if (!quiz) return res.status(404).json({ error: 'المسابقة غير موجودة' });
  res.json(quiz);
});

app.post('/api/quiz/:id/answer', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user) return res.status(401).json({ error: 'غير مصرح له' });

  const quiz = quizRooms.find(q => q.id === parseInt(req.params.id));
  if (!quiz) return res.status(404).json({ error: 'المسابقة غير موجودة' });

  const { answer } = req.body;
  const currentQ = quiz.questions[quiz.currentQuestion];

  if (!quiz.scores[user.id]) quiz.scores[user.id] = { name: user.display_name, score: 0 };

  if (answer === currentQ.correct) {
    quiz.scores[user.id].score += 10;
  }

  res.json({ correct: answer === currentQ.correct, score: quiz.scores[user.id].score });
  io.emit('quizUpdated', quiz);
});

app.get('/api/audit-log', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const owner = users.find(u => 'fake-token-' + u.id === token);
  if (!owner || owner.role !== 'owner') return res.status(403).json({ error: 'غير مسموح' });

  res.json(auditLog);
});

app.post('/api/user/privacy', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = users.find(u => 'fake-token-' + u.id === token);
  if (!user) return res.status(401).json({ error: 'غير مصرح له' });

  const { profile_visibility, pm_allowed, show_age, show_status, show_last_seen } = req.body;

  if (!user.privacy_settings) user.privacy_settings = {};

  if (profile_visibility) user.privacy_settings.profile_visibility = profile_visibility;
  if (pm_allowed) user.privacy_settings.pm_allowed = pm_allowed;
  if (show_age !== undefined) user.privacy_settings.show_age = show_age;
  if (show_status !== undefined) user.privacy_settings.show_status = show_status;
  if (show_last_seen !== undefined) user.privacy_settings.show_last_seen = show_last_seen;

  res.json({ message: 'تم تحديث إعدادات الخصوصية', privacy_settings: user.privacy_settings });
});

app.post('/api/news/pin', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const admin = users.find(u => 'fake-token-' + u.id === token);
  if (!admin || (admin.role !== 'owner' && admin.role !== 'admin')) {
    return res.status(403).json({ error: 'غير مسموح' });
  }

  const { newsId } = req.body;
  const post = news.find(n => n.id === parseInt(newsId));
  if (!post) return res.status(404).json({ error: 'المنشور غير موجود' });

  post.pinned = !post.pinned;
  io.emit('newsUpdated', post);
  res.json({ message: post.pinned ? 'تم التثبيت' : 'تم إلغاء التثبيت', post });
});

app.use('/public', express.static('public'));

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

