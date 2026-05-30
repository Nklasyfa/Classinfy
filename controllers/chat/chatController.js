const { Message, User } = require('../../models');

// GET /api/chat/:userId?
// Untuk User biasa, akan mengambil pesannya sendiri.
// Untuk Admin, mengambil pesan milik userId tertentu, atau mengembalikan list percakapan.
exports.getMessages = async (req, res) => {
  try {
    const authUser = req.user; // dari token
    let targetUserId = authUser.id;

    if (authUser.roleId == 1) { // Admin
      if (req.query.userId) {
        targetUserId = req.query.userId;
      } else {
        // Jika admin tidak specify userId, kembalikan daftar user yang pernah chat
        const messages = await Message.findAll({
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
          order: [['createdAt', 'DESC']]
        });
        
        // Group by user
        const conversations = [];
        const seen = new Set();
        for (let m of messages) {
          if (!seen.has(m.userId)) {
            seen.add(m.userId);
            conversations.push({
              userId: m.userId,
              username: m.user ? m.user.username : 'Unknown',
              lastMessage: m.text,
              time: m.createdAt,
              unreadCount: 0 // Simplifikasi
            });
          }
        }
        return res.status(200).json({ data: conversations });
      }
    }

    const messages = await Message.findAll({
      where: { userId: targetUserId },
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({ data: messages });
  } catch (error) {
    console.error('Error getMessages:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/chat
exports.sendMessage = async (req, res) => {
  try {
    const authUser = req.user;
    const { text, targetUserId } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Pesan tidak boleh kosong.' });
    }

    let userIdForChat = authUser.id;
    if (authUser.roleId == 1 && targetUserId) {
      userIdForChat = targetUserId;
    }

    const message = await Message.create({
      userId: userIdForChat,
      senderId: authUser.id,
      text: text
    });

    res.status(201).json({ data: message });
  } catch (error) {
    console.error('Error sendMessage:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
