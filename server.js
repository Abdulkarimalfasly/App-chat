const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const multer = require("multer")
const path = require("path")
const bodyParser = require("body-parser")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: { origin: "*" },
})

app.use(bodyParser.json())
app.use(express.static("Uploads"))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "Uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webm|mp3|mp4|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error("الملف يجب أن يكون صورة أو صوت أو فيديو"))
    }
  },
})

const frames = {
  owner: [
    { id: "owner_1", name: "التاج الذهبي", type: "owner", price: null, animation: "glow-gold", purchasable: false },
    {
      id: "owner_2",
      name: "النجم الماسي",
      type: "owner",
      price: null,
      animation: "sparkle-diamond",
      purchasable: false,
    },
    { id: "owner_3", name: "الهالة الملكية", type: "owner", price: null, animation: "royal-aura", purchasable: false },
  ],
  admin: [
    { id: "admin_1", name: "الدرع الأزرق", type: "admin", price: 100000, animation: "pulse-blue", purchasable: true },
    { id: "admin_2", name: "النار الحمراء", type: "admin", price: 100000, animation: "flame-red", purchasable: true },
    {
      id: "admin_3",
      name: "البرق الأصفر",
      type: "admin",
      price: 100000,
      animation: "lightning-yellow",
      purchasable: true,
    },
    { id: "admin_4", name: "الجليد الأبيض", type: "admin", price: 100000, animation: "frost-white", purchasable: true },
    { id: "admin_5", name: "الظل الأسود", type: "admin", price: 100000, animation: "shadow-black", purchasable: true },
    {
      id: "admin_6",
      name: "الزمرد الأخضر",
      type: "admin",
      price: 100000,
      animation: "emerald-green",
      purchasable: true,
    },
    {
      id: "admin_7",
      name: "الياقوت الأرجواني",
      type: "admin",
      price: 100000,
      animation: "ruby-purple",
      purchasable: true,
    },
    {
      id: "admin_8",
      name: "الفضة اللامعة",
      type: "admin",
      price: 100000,
      animation: "silver-shine",
      purchasable: true,
    },
    {
      id: "admin_9",
      name: "النحاس البرونزي",
      type: "admin",
      price: 100000,
      animation: "bronze-copper",
      purchasable: true,
    },
    { id: "admin_10", name: "قوس قزح", type: "admin", price: 100000, animation: "rainbow-multi", purchasable: true },
  ],
  prince: Array.from({ length: 20 }, (_, i) => ({
    id: `prince_${i + 1}`,
    name: `إطار الأمير ${i + 1}`,
    type: "prince",
    price: 2000,
    animation: `prince-anim-${i + 1}`,
    purchasable: true,
  })),
}

const shopItems = {
  backgrounds: [
    { id: "bg_1", name: "خلفية النجوم", price: 5000, type: "background", animated: true },
    { id: "bg_2", name: "خلفية القلوب", price: 5000, type: "background", animated: true },
    { id: "bg_3", name: "خلفية الورود", price: 5000, type: "background", animated: false },
  ],
  nameStyles: [
    { id: "name_1", name: "اسم لامع ذهبي", price: 10000, type: "nameStyle", animation: "gold-glitter" },
    { id: "name_2", name: "اسم متحرك قوس قزح", price: 15000, type: "nameStyle", animation: "rainbow-wave" },
    { id: "name_3", name: "اسم نيون", price: 12000, type: "nameStyle", animation: "neon-glow" },
  ],
  crowns: [
    { id: "crown_1", name: "تاج ذهبي", price: 50000, type: "crown", rarity: "legendary" },
    { id: "crown_2", name: "تاج فضي", price: 30000, type: "crown", rarity: "epic" },
    { id: "crown_3", name: "تاج برونزي", price: 15000, type: "crown", rarity: "rare" },
  ],
  stickers: Array.from({ length: 50 }, (_, i) => ({
    id: `sticker_${i + 1}`,
    name: `ملصق متحرك ${i + 1}`,
    price: 500,
    type: "sticker",
    animated: true,
  })),
}

const users = [
  {
    id: 1,
    display_name: "المالك",
    rank: "owner",
    role: "owner",
    email: "njdj9985@gmail.com",
    password: "owner123",
    profile_image1: null,
    profile_image2: null,
    message_background: null,
    age: null,
    gender: null,
    marital_status: null,
    about_me: null,
    coins: 999999999,
    frame: "owner_1",
    nameStyle: null,
    crown: null,
    purchasedItems: [],
    friends: [],
    privacySettings: {
      profileVisibility: "everyone",
      messagePermission: "everyone",
      showAge: true,
      showStatus: true,
      showLastSeen: true,
    },
    joinDate: new Date(),
    lastSeen: new Date(),
  },
  {
    id: 2,
    display_name: "Admin",
    rank: "admin",
    role: "admin",
    email: "admin@example.com",
    password: "admin",
    profile_image1: null,
    profile_image2: null,
    message_background: null,
    age: null,
    gender: null,
    marital_status: null,
    about_me: null,
    coins: 100000,
    frame: null,
    nameStyle: null,
    crown: null,
    purchasedItems: [],
    friends: [],
    privacySettings: {
      profileVisibility: "everyone",
      messagePermission: "everyone",
      showAge: true,
      showStatus: true,
      showLastSeen: true,
    },
    joinDate: new Date(),
    lastSeen: new Date(),
  },
]

let rooms = [
  { id: 1, name: "الغرفة الرئيسية", description: "غرفة دردشة عامة", background: null, isOpen: true, createdBy: 1 },
]

const messages = []
const privateMessages = []
const news = []
const stories = []
let bans = []
let mutes = []
const floodProtection = new Map()
const competitions = []
const comments = []
let pinnedMessages = []
const reports = []
const auditLog = []
let radioPlaylist = []
let currentSong = null

function logAudit(action, performedBy, targetUser, details) {
  const log = {
    id: auditLog.length + 1,
    action,
    performedBy,
    targetUser,
    details,
    timestamp: new Date(),
  }
  auditLog.push(log)
  io.emit("auditLogUpdate", log)
}

app.post("/api/login", (req, res) => {
  const { email, password } = req.body
  const user = users.find((u) => u.email === email && u.password === password)
  if (user) {
    user.lastSeen = new Date()
    const token = "fake-token-" + user.id
    res.json({ token, user })
    logAudit("login", user.id, user.id, "تسجيل دخول ناجح")
  } else {
    res.status(401).json({ error: "بيانات تسجيل الدخول غير صحيحة" })
  }
})

app.post("/api/register", (req, res) => {
  const { email, password, display_name } = req.body
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "البريد الإلكتروني موجود مسبقًا" })
  }
  const newUser = {
    id: users.length + 1,
    email,
    password,
    display_name,
    rank: "visitor",
    role: "user",
    profile_image1: null,
    profile_image2: null,
    message_background: null,
    age: null,
    gender: null,
    marital_status: null,
    about_me: null,
    coins: 1000,
    frame: null,
    nameStyle: null,
    crown: null,
    purchasedItems: [],
    friends: [],
    privacySettings: {
      profileVisibility: "everyone",
      messagePermission: "level3",
      showAge: true,
      showStatus: true,
      showLastSeen: true,
    },
    joinDate: new Date(),
    lastSeen: new Date(),
  }
  users.push(newUser)
  const token = "fake-token-" + newUser.id
  res.json({ token, user: newUser })
  logAudit("register", newUser.id, newUser.id, "إنشاء حساب جديد")
})

app.get("/api/frames", (req, res) => {
  res.json(frames)
})

app.get("/api/shop", (req, res) => {
  res.json({
    frames: [...frames.admin, ...frames.prince],
    ...shopItems,
  })
})

app.post("/api/shop/purchase", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user) return res.status(401).json({ error: "غير مصرح له" })

  const { itemId, itemType } = req.body
  let item = null

  // البحث عن العنصر
  if (itemType === "frame") {
    item = [...frames.admin, ...frames.prince].find((f) => f.id === itemId)
  } else if (itemType === "background") {
    item = shopItems.backgrounds.find((b) => b.id === itemId)
  } else if (itemType === "nameStyle") {
    item = shopItems.nameStyles.find((n) => n.id === itemId)
  } else if (itemType === "crown") {
    item = shopItems.crowns.find((c) => c.id === itemId)
  } else if (itemType === "sticker") {
    item = shopItems.stickers.find((s) => s.id === itemId)
  }

  if (!item) return res.status(404).json({ error: "العنصر غير موجود" })
  if (!item.purchasable && itemType === "frame") return res.status(403).json({ error: "هذا العنصر غير قابل للشراء" })
  if (user.coins < item.price) return res.status(400).json({ error: "رصيد غير كافٍ" })
  if (user.purchasedItems.includes(itemId)) return res.status(400).json({ error: "لديك هذا العنصر بالفعل" })

  // خصم السعر وإضافة العنصر
  user.coins -= item.price
  user.purchasedItems.push(itemId)

  // تطبيق العنصر تلقائياً
  if (itemType === "frame") user.frame = itemId
  else if (itemType === "nameStyle") user.nameStyle = itemId
  else if (itemType === "crown") user.crown = itemId

  res.json({ message: "تم الشراء بنجاح", user })
  io.emit("userUpdated", user)
  logAudit("purchase", user.id, user.id, `شراء ${item.name} بسعر ${item.price} كونز`)
})

app.post("/api/user/apply-item", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user) return res.status(401).json({ error: "غير مصرح له" })

  const { itemId, itemType } = req.body

  if (!user.purchasedItems.includes(itemId) && user.role !== "owner") {
    return res.status(403).json({ error: "ليس لديك هذا العنصر" })
  }

  if (itemType === "frame") user.frame = itemId
  else if (itemType === "nameStyle") user.nameStyle = itemId
  else if (itemType === "crown") user.crown = itemId
  else if (itemType === "background") user.message_background = itemId

  res.json({ message: "تم تطبيق العنصر", user })
  io.emit("userUpdated", user)
})

app.post("/api/owner/change-credentials", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const owner = users.find((u) => "fake-token-" + u.id === token)
  if (!owner || owner.role !== "owner") return res.status(403).json({ error: "غير مسموح - المالك فقط" })

  const { userId, newEmail, newPassword } = req.body
  const targetUser = users.find((u) => u.id === Number.parseInt(userId))
  if (!targetUser) return res.status(404).json({ error: "المستخدم غير موجود" })

  const oldEmail = targetUser.email
  if (newEmail) targetUser.email = newEmail
  if (newPassword) targetUser.password = newPassword

  res.json({ message: "تم تغيير البيانات بنجاح", user: targetUser })
  logAudit("change_credentials", owner.id, targetUser.id, `تغيير البريد من ${oldEmail} إلى ${newEmail || oldEmail}`)
})

app.post("/api/owner/manage-coins", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const owner = users.find((u) => "fake-token-" + u.id === token)
  if (!owner || owner.role !== "owner") return res.status(403).json({ error: "غير مسموح - المالك فقط" })

  const { userId, amount, action } = req.body
  const targetUser = users.find((u) => u.id === Number.parseInt(userId))
  if (!targetUser) return res.status(404).json({ error: "المستخدم غير موجود" })

  if (action === "add") {
    targetUser.coins += Number.parseInt(amount)
  } else if (action === "remove") {
    targetUser.coins = Math.max(0, targetUser.coins - Number.parseInt(amount))
  } else if (action === "set") {
    targetUser.coins = Number.parseInt(amount)
  }

  res.json({ message: "تم تحديث العملات", user: targetUser })
  io.emit("userUpdated", targetUser)
  logAudit("manage_coins", owner.id, targetUser.id, `${action} ${amount} كونز`)
})

app.post("/api/assign-rank", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { userId, rank, reason } = req.body
  const user = users.find((u) => u.id === Number.parseInt(userId))
  if (!user) return res.status(404).json({ error: "المستخدم غير موجود" })

  // المالك فقط يستطيع تعيين رتبة owner أو admin
  if ((rank === "owner" || rank === "admin") && admin.role !== "owner") {
    return res.status(403).json({ error: "المالك فقط يستطيع تعيين هذه الرتبة" })
  }

  const oldRank = user.rank
  user.rank = rank
  if (rank === "admin") user.role = "admin"
  else if (rank === "owner") user.role = "owner"
  else user.role = "user"

  res.json({ message: "تم تعيين الرتبة" })
  io.emit("userUpdated", user)
  logAudit("assign_rank", admin.id, user.id, `تغيير الرتبة من ${oldRank} إلى ${rank} - السبب: ${reason || "غير محدد"}`)
})

app.post("/api/ban", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { userId, reason, duration } = req.body
  const user = users.find((u) => u.id === Number.parseInt(userId))
  if (!user) return res.status(404).json({ error: "المستخدم غير موجود" })

  // لا يمكن طرد المالك
  if (user.role === "owner") return res.status(403).json({ error: "لا يمكن طرد المالك" })

  const ban = {
    id: bans.length + 1,
    user_id: user.id,
    reason,
    duration,
    timestamp: new Date(),
    bannedBy: admin.id,
  }
  bans.push(ban)
  io.emit("userBanned", { userId: user.id, reason, duration })
  res.json({ message: "تم طرد المستخدم" })
  logAudit("ban", admin.id, user.id, `طرد - السبب: ${reason} - المدة: ${duration}`)
})

app.post("/api/mute", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { userId, reason, duration } = req.body
  const user = users.find((u) => u.id === Number.parseInt(userId))
  if (!user) return res.status(404).json({ error: "المستخدم غير موجود" })

  // لا يمكن كتم المالك
  if (user.role === "owner") return res.status(403).json({ error: "لا يمكن كتم المالك" })

  const mute = {
    id: mutes.length + 1,
    user_id: user.id,
    reason,
    duration,
    timestamp: new Date(),
    endTime: duration === "permanent" ? null : new Date(Date.now() + parseDuration(duration)),
    mutedBy: admin.id,
  }
  mutes.push(mute)
  io.emit("userMuted", { userId: user.id, reason, duration })
  res.json({ message: "تم كتم المستخدم" })
  logAudit("mute", admin.id, user.id, `كتم - السبب: ${reason} - المدة: ${duration}`)
})

app.post("/api/unban", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { userId } = req.body
  bans = bans.filter((b) => b.user_id !== Number.parseInt(userId))
  io.emit("userUnbanned", { userId })
  res.json({ message: "تم إلغاء الحظر" })
  logAudit("unban", admin.id, userId, "إلغاء الحظر")
})

app.post("/api/unmute", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { userId } = req.body
  mutes = mutes.filter((m) => m.user_id !== Number.parseInt(userId))
  io.emit("userUnmuted", { userId })
  res.json({ message: "تم إلغاء الكتم" })
  logAudit("unmute", admin.id, userId, "إلغاء الكتم")
})

app.post("/api/messages/pin", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { messageId, roomId } = req.body
  const message = messages.find((m) => m.id === Number.parseInt(messageId))
  if (!message) return res.status(404).json({ error: "الرسالة غير موجودة" })

  const pinned = {
    id: pinnedMessages.length + 1,
    messageId: message.id,
    roomId: Number.parseInt(roomId),
    pinnedBy: admin.id,
    timestamp: new Date(),
  }
  pinnedMessages.push(pinned)
  io.to(roomId).emit("messagePinned", { message, pinnedBy: admin.display_name })
  res.json({ message: "تم تثبيت الرسالة" })
  logAudit("pin_message", admin.id, message.user_id, `تثبيت رسالة: ${message.content}`)
})

app.post("/api/messages/unpin", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { messageId } = req.body
  pinnedMessages = pinnedMessages.filter((p) => p.messageId !== Number.parseInt(messageId))
  io.emit("messageUnpinned", { messageId })
  res.json({ message: "تم إلغاء التثبيت" })
  logAudit("unpin_message", admin.id, null, `إلغاء تثبيت رسالة ${messageId}`)
})

app.post("/api/messages/report", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user) return res.status(401).json({ error: "غير مصرح له" })

  const { messageId, reason } = req.body
  const message = messages.find((m) => m.id === Number.parseInt(messageId))
  if (!message) return res.status(404).json({ error: "الرسالة غير موجودة" })

  const report = {
    id: reports.length + 1,
    messageId: message.id,
    reportedBy: user.id,
    reason,
    timestamp: new Date(),
    status: "pending",
  }
  reports.push(report)

  // إرسال إشعار للإدارة
  io.emit("newReport", report)
  res.json({ message: "تم الإبلاغ عن الرسالة" })
})

app.get("/api/reports", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }
  res.json(reports)
})

app.get("/api/audit-log", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }
  res.json(auditLog)
})

app.post("/api/radio/add", upload.single("song"), (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { title, artist, youtubeUrl } = req.body
  const songUrl = req.file ? `/Uploads/${req.file.filename}` : youtubeUrl

  const song = {
    id: radioPlaylist.length + 1,
    title,
    artist,
    url: songUrl,
    addedBy: admin.id,
    timestamp: new Date(),
  }
  radioPlaylist.push(song)
  io.emit("radioPlaylistUpdated", radioPlaylist)
  res.json({ message: "تم إضافة الأغنية", song })
  logAudit("add_song", admin.id, null, `إضافة أغنية: ${title}`)
})

app.delete("/api/radio/:songId", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const songId = Number.parseInt(req.params.songId)
  const song = radioPlaylist.find((s) => s.id === songId)
  radioPlaylist = radioPlaylist.filter((s) => s.id !== songId)
  io.emit("radioPlaylistUpdated", radioPlaylist)
  res.json({ message: "تم حذف الأغنية" })
  logAudit("remove_song", admin.id, null, `حذف أغنية: ${song?.title}`)
})

app.get("/api/radio/playlist", (req, res) => {
  res.json(radioPlaylist)
})

app.post("/api/radio/play", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const admin = users.find((u) => "fake-token-" + u.id === token)
  if (!admin || (admin.role !== "admin" && admin.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { songId } = req.body
  const song = radioPlaylist.find((s) => s.id === Number.parseInt(songId))
  if (!song) return res.status(404).json({ error: "الأغنية غير موجودة" })

  currentSong = song
  io.emit("radioNowPlaying", song)
  res.json({ message: "جاري التشغيل", song })
})

app.post("/api/competitions", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { title, questions } = req.body
  const newCompetition = {
    id: competitions.length + 1,
    title,
    questions: questions || [],
    currentQuestion: 0,
    startTime: new Date(),
    active: true,
    participants: [],
    scores: {},
  }
  competitions.push(newCompetition)
  io.emit("newCompetition", newCompetition)
  res.json(newCompetition)
  logAudit("create_competition", user.id, null, `إنشاء مسابقة: ${title}`)
})

app.post("/api/competitions/:id/questions", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const competitionId = Number.parseInt(req.params.id)
  const competition = competitions.find((c) => c.id === competitionId)
  if (!competition) return res.status(404).json({ error: "المسابقة غير موجودة" })

  const { question, options, correctAnswer, hint } = req.body
  const newQuestion = {
    id: competition.questions.length + 1,
    question,
    options,
    correctAnswer,
    hint,
    timer: 20,
  }
  competition.questions.push(newQuestion)
  io.emit("competitionUpdated", competition)
  res.json({ message: "تم إضافة السؤال", competition })
})

app.put("/api/user/privacy", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user) return res.status(401).json({ error: "غير مصرح له" })

  const { profileVisibility, messagePermission, showAge, showStatus, showLastSeen } = req.body

  if (profileVisibility) user.privacySettings.profileVisibility = profileVisibility
  if (messagePermission) user.privacySettings.messagePermission = messagePermission
  if (showAge !== undefined) user.privacySettings.showAge = showAge
  if (showStatus !== undefined) user.privacySettings.showStatus = showStatus
  if (showLastSeen !== undefined) user.privacySettings.showLastSeen = showLastSeen

  res.json({ message: "تم تحديث إعدادات الخصوصية", user })
})

app.post("/api/user/friends/add", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user) return res.status(401).json({ error: "غير مصرح له" })

  const { friendId } = req.body
  const friend = users.find((u) => u.id === Number.parseInt(friendId))
  if (!friend) return res.status(404).json({ error: "المستخدم غير موجود" })

  if (!user.friends.includes(friendId)) {
    user.friends.push(Number.parseInt(friendId))
  }

  res.json({ message: "تم إضافة الصديق", user })
})

app.post("/api/user/friends/remove", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user) return res.status(401).json({ error: "غير مصرح له" })

  const { friendId } = req.body
  user.friends = user.friends.filter((f) => f !== Number.parseInt(friendId))

  res.json({ message: "تم إزالة الصديق", user })
})

app.post("/api/rooms", upload.single("roomBackground"), (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return res.status(403).json({ error: "غير مسموح" })
  }

  const { name, description } = req.body
  const background = req.file ? `/Uploads/${req.file.filename}` : null
  const newRoom = {
    id: rooms.length + 1,
    name,
    description,
    background,
    isOpen: true,
    createdBy: user.id,
  }
  rooms.push(newRoom)
  io.emit("roomCreated", newRoom)
  res.json(newRoom)
  logAudit("create_room", user.id, null, `إنشاء غرفة: ${name}`)
})

app.post("/api/rooms/:id/toggle", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const user = users.find((u) => "fake-token-" + u.id === token)
  if (!user || user.role !== "owner") {
    return res.status(403).json({ error: "المالك فقط" })
  }

  const roomId = Number.parseInt(req.params.id)
  const room = rooms.find((r) => r.id === roomId)
  if (!room) return res.status(404).json({ error: "الغرفة غير موجودة" })

  room.isOpen = !room.isOpen
  io.emit("roomToggled", room)
  res.json({ message: room.isOpen ? "تم فتح الغرفة" : "تم إغلاق الغرفة", room })
  logAudit("toggle_room", user.id, null, `${room.isOpen ? "فتح" : "إغلاق"} غرفة: ${room.name}`)
})

io.on("connection", (socket) => {
  console.log("مستخدم متصل: " + socket.id)

  socket.on("join", (data) => {
    socket.join(data.roomId)
    socket.user = data

    // تحديث آخر ظهور
    const user = users.find((u) => u.id === data.userId)
    if (user) {
      user.lastSeen = new Date()
    }

    io.emit(
      "userList",
      users.filter((u) => u.id !== socket.user.userId),
    )
  })

  socket.on("sendMessage", (data) => {
    const userId = socket.user.userId
    const now = Date.now()

    // فحص الحظر
    const isBanned = bans.find((b) => b.user_id === userId)
    if (isBanned) return socket.emit("error", "أنت محظور ولا يمكنك إرسال الرسائل")

    // فحص الكتم
    const isMuted = mutes.find(
      (m) => m.user_id === userId && (m.duration === "permanent" || (m.endTime && new Date() < new Date(m.endTime))),
    )
    if (isMuted) return socket.emit("error", "أنت مكتوم ولا يمكنك إرسال الرسائل")

    // حماية الفيضانات
    if (!floodProtection.has(userId)) {
      floodProtection.set(userId, [])
    }

    const userMessages = floodProtection.get(userId)
    const recentMessages = userMessages.filter((time) => now - time < 10000)

    if (recentMessages.length >= 5) {
      const muteEndTime = new Date(now + 5 * 60 * 1000)
      const mute = {
        id: mutes.length + 1,
        user_id: userId,
        reason: "الفيضانات - رسائل سريعة ومتكررة",
        duration: "5m",
        timestamp: new Date(),
        endTime: muteEndTime,
        mutedBy: "system",
      }
      mutes.push(mute)

      const muteMessage = {
        id: messages.length + 1,
        roomId: data.roomId,
        content: `تم كتم ${socket.user.display_name} بسبب الفيضانات`,
        type: "system",
        timestamp: new Date(),
      }
      messages.push(muteMessage)
      io.to(data.roomId).emit("newMessage", muteMessage)

      socket.emit("error", "تم كتمك لمدة 5 دقائق بسبب الرسائل السريعة والمتكررة")
      logAudit("auto_mute", "system", userId, "كتم تلقائي بسبب الفيضانات")
      return
    }

    recentMessages.push(now)
    floodProtection.set(userId, recentMessages)

    const message = {
      id: messages.length + 1,
      roomId: data.roomId,
      user_id: socket.user.userId,
      display_name: socket.user.display_name,
      rank: socket.user.rank,
      content: data.content,
      type: "text",
      timestamp: new Date(),
      reactions: { likes: [], dislikes: [], hearts: [], laughs: [] },
      quotedMessage: data.quotedMessageId ? messages.find((m) => m.id === data.quotedMessageId) : null,
    }
    messages.push(message)
    io.to(data.roomId).emit("newMessage", message)
  })

  socket.on("addMessageReaction", (data) => {
    const { messageId, reactionType } = data
    const message = messages.find((m) => m.id === Number.parseInt(messageId))
    if (!message) return

    if (!message.reactions) {
      message.reactions = { likes: [], dislikes: [], hearts: [], laughs: [] }
    }

    const user = socket.user

    // إزالة التفاعل السابق
    Object.keys(message.reactions).forEach((type) => {
      message.reactions[type] = message.reactions[type].filter((u) => u.userId !== user.userId)
    })

    // إضافة التفاعل الجديد
    if (reactionType && message.reactions[reactionType]) {
      message.reactions[reactionType].push({
        userId: user.userId,
        display_name: user.display_name,
      })
    }

    io.emit("messageReactionUpdated", { messageId, reactions: message.reactions })
  })

  socket.on("sendPrivateMessage", (data) => {
    const sender = users.find((u) => u.id === socket.user.userId)
    const receiver = users.find((u) => u.id === data.receiverId)

    if (!receiver) return socket.emit("error", "المستخدم غير موجود")

    // فحص إعدادات الخصوصية
    const permission = receiver.privacySettings.messagePermission
    if (permission === "nobody") {
      return socket.emit("error", "هذا المستخدم لا يقبل رسائل خاصة")
    } else if (permission === "friends" && !receiver.friends.includes(sender.id)) {
      return socket.emit("error", "يمكنك فقط مراسلة الأصدقاء")
    } else if (permission === "level3" && sender.rank === "visitor") {
      return socket.emit("error", "يجب أن تكون مستوى 3 أو أعلى")
    }

    const isMuted = mutes.find(
      (m) =>
        m.user_id === socket.user.userId &&
        (m.duration === "permanent" || (m.endTime && new Date() < new Date(m.endTime))),
    )
    if (isMuted) return socket.emit("error", "أنت مكتوم ولا يمكنك إرسال الرسائل")

    const message = {
      id: privateMessages.length + 1,
      senderId: socket.user.userId,
      display_name: socket.user.display_name,
      rank: socket.user.rank,
      receiverId: data.receiverId,
      content: data.content,
      type: "text",
      timestamp: new Date(),
    }
    privateMessages.push(message)

    // إرسال إشعار صوتي للمستلم
    io.to(data.receiverId).emit("newPrivateMessage", message)
    io.to(data.receiverId).emit("playNotificationSound", "private_message")
    socket.emit("newPrivateMessage", message)
  })

  socket.on("joinCompetition", (data) => {
    const competition = competitions.find((c) => c.id === Number.parseInt(data.competitionId))
    if (!competition || !competition.active) {
      return socket.emit("error", "المسابقة غير متاحة")
    }

    if (!competition.participants.includes(socket.user.userId)) {
      competition.participants.push(socket.user.userId)
      competition.scores[socket.user.userId] = 0
    }

    socket.join(`competition_${competition.id}`)
    socket.emit("competitionJoined", competition)
  })

  socket.on("submitAnswer", (data) => {
    const competition = competitions.find((c) => c.id === Number.parseInt(data.competitionId))
    if (!competition || !competition.active) return

    const currentQ = competition.questions[competition.currentQuestion]
    if (!currentQ) return

    if (data.answer === currentQ.correctAnswer) {
      competition.scores[socket.user.userId] = (competition.scores[socket.user.userId] || 0) + 10
      socket.emit("answerResult", { correct: true, score: competition.scores[socket.user.userId] })
    } else {
      socket.emit("answerResult", { correct: false })
    }

    io.to(`competition_${competition.id}`).emit("leaderboardUpdate", competition.scores)
  })

  socket.on("nextQuestion", (data) => {
    const competition = competitions.find((c) => c.id === Number.parseInt(data.competitionId))
    if (!competition || !competition.active) return

    competition.currentQuestion++

    if (competition.currentQuestion >= competition.questions.length) {
      competition.active = false
      io.to(`competition_${competition.id}`).emit("competitionEnded", {
        scores: competition.scores,
        winner: Object.keys(competition.scores).reduce((a, b) =>
          competition.scores[a] > competition.scores[b] ? a : b,
        ),
      })
    } else {
      const nextQ = competition.questions[competition.currentQuestion]
      io.to(`competition_${competition.id}`).emit("newQuestion", nextQ)

      // بدء عداد 20 ثانية تلقائي
      setTimeout(() => {
        socket.emit("nextQuestion", { competitionId: competition.id })
      }, 20000)
    }
  })

  socket.on("deleteRoom", (roomId) => {
    const user = users.find((u) => u.id === socket.user.userId)
    if (user.role === "admin" || user.role === "owner") {
      rooms = rooms.filter((r) => r.id !== roomId)
      io.emit("roomDeleted", roomId)
      logAudit("delete_room", user.id, null, `حذف غرفة ${roomId}`)
    }
  })

  socket.on("sendNotification", (data) => {
    io.to(data.userId).emit("newNotification", data)
  })

  socket.on("loadNewsPosts", () => {
    socket.emit("loadNewsPosts", news)
  })

  socket.on("addNewsPost", (data) => {
    const user = socket.user
    if (!user) return
    const isMuted = mutes.find(
      (m) =>
        m.user_id === user.userId && (m.duration === "permanent" || (m.endTime && new Date() < new Date(m.endTime))),
    )
    if (isMuted) return socket.emit("error", "أنت مكتوم ولا يمكنك نشر الأخبار")

    const newNews = {
      id: news.length + 1,
      content: data.content,
      media: data.media,
      user_id: user.userId,
      display_name: user.display_name,
      timestamp: new Date(),
      reactions: { likes: [], dislikes: [], hearts: [] },
      comments: [],
    }
    news.push(newNews)
    io.emit("updateNewsPost", newNews)
  })

  socket.on("addReaction", (data) => {
    const user = socket.user
    if (!user) return
    const post = news.find((n) => n.id === Number.parseInt(data.postId))
    if (post) {
      if (!post.reactions) post.reactions = { likes: [], dislikes: [], hearts: [] }

      Object.keys(post.reactions).forEach((reactionType) => {
        post.reactions[reactionType] = post.reactions[reactionType].filter((r) => r.user_id !== user.userId)
      })

      if (data.type === "like") {
        post.reactions.likes.push({ user_id: user.userId, display_name: user.display_name })
      } else if (data.type === "dislike") {
        post.reactions.dislikes.push({ user_id: user.userId, display_name: user.display_name })
      } else if (data.type === "heart") {
        post.reactions.hearts.push({ user_id: user.userId, display_name: user.display_name })
      }

      io.emit("updateNewsPost", post)
    }
  })

  socket.on("addComment", (data) => {
    const user = socket.user
    if (!user) return

    const newComment = {
      id: comments.length + 1,
      postId: Number.parseInt(data.postId),
      content: data.content,
      user_id: user.userId,
      display_name: user.display_name,
      targetUserId: data.targetUserId ? Number.parseInt(data.targetUserId) : null,
      timestamp: new Date(),
    }
    comments.push(newComment)

    io.emit("newComment", newComment)

    if (data.targetUserId) {
      io.to(data.targetUserId).emit("commentNotification", {
        from: user.display_name,
        content: data.content,
        postId: data.postId,
      })
    }
  })

  socket.on("stopCompetition", (competitionId) => {
    const user = users.find((u) => u.id === socket.user.userId)
    if (!user || (user.role !== "admin" && user.role !== "owner")) return

    const competition = competitions.find((c) => c.id === Number.parseInt(competitionId))
    if (competition) {
      competition.active = false
      io.emit("competitionStopped", competitionId)
      logAudit("stop_competition", user.id, null, `إيقاف مسابقة ${competitionId}`)
    }
  })

  socket.on("disconnect", () => {
    console.log("مستخدم منفصل: " + socket.id)
    if (socket.user) {
      const user = users.find((u) => u.id === socket.user.userId)
      if (user) {
        user.lastSeen = new Date()
      }
    }
    io.emit(
      "userList",
      users.filter((u) => u.id !== socket.user?.userId),
    )
  })
})

function parseDuration(duration) {
  const map = {
    "5m": 5 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    permanent: Number.POSITIVE_INFINITY,
  }
  return map[duration] || 0
}

setInterval(() => {
  const now = Date.now()
  for (const [userId, messages] of floodProtection.entries()) {
    const recentMessages = messages.filter((time) => now - time < 60000)
    if (recentMessages.length === 0) {
      floodProtection.delete(userId)
    } else {
      floodProtection.set(userId, recentMessages)
    }
  }
}, 60000)

setInterval(() => {
  const now = new Date()
  mutes = mutes.filter((mute) => {
    if (mute.endTime && now > new Date(mute.endTime)) {
      return false
    }
    return true
  })
}, 30000)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
