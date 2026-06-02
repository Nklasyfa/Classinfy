const { Message, User, Notification } = require('../../models');

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
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email', 'profilePicture'] }],
          order: [['createdAt', 'DESC']]
        });
        
        // Group by user
        const conversations = [];
        const seen = new Set();
        for (let m of messages) {
          if (!seen.has(m.userId)) {
            seen.add(m.userId);
            
            const count = await Message.count({
              where: {
                userId: m.userId,
                senderId: m.userId,
                isRead: false
              }
            });

            conversations.push({
              userId: m.userId,
              username: m.user ? m.user.username : 'Unknown',
              profilePicture: m.user ? m.user.profilePicture : null,
              lastMessage: m.text,
              time: m.createdAt,
              unreadCount: count
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

    // Mark messages as read if sent by the other party
    const { Op } = require('sequelize');
    if (messages.length > 0) {
      await Message.update(
        { isRead: true },
        { 
          where: { 
            userId: targetUserId,
            senderId: { [Op.ne]: authUser.id },
            isRead: false
          }
        }
      );
    }

    // Tandai notifikasi chat sebagai dibaca
    if (authUser.roleId == 1) {
      // Admin membaca chat dari targetUserId
      const targetUser = await User.findByPk(targetUserId);
      if (targetUser) {
        await Notification.update(
          { isRead: true },
          {
            where: {
              userId: authUser.id,
              title: 'Pesan Chat Masuk',
              [Op.or]: [
                { message: { [Op.iLike]: `%${targetUser.username}%` } },
                { message: { [Op.iLike]: `%dari User:%` } }
              ],
              isRead: false
            }
          }
        );
      }
    } else {
      // User membaca chat dari Admin
      await Notification.update(
        { isRead: true },
        {
          where: {
            userId: authUser.id,
            title: 'Pesan Baru dari Admin',
            isRead: false
          }
        }
      );
    }

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

    const senderUser = await User.findByPk(authUser.id);
    const senderName = senderUser ? senderUser.username : 'User';

    // Integrasi Notifikasi: Buat notifikasi untuk penerima
    const { Notification } = require('../../models');
    
    // Jika sender adalah Admin, berarti notifikasi untuk User
    if (authUser.roleId == 1 && targetUserId) {
      await Notification.create({
        userId: targetUserId,
        title: 'Pesan Baru dari Admin',
        message: 'Anda menerima pesan baru di Live Chat: ' + text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        type: 'chat'
      });
    } else if (authUser.roleId != 1) {
      // Jika sender adalah User, kirim notifikasi ke semua Admin
      const admins = await User.findAll({ where: { roleId: 1 } });
      for (const admin of admins) {
        await Notification.create({
          userId: admin.id,
          title: 'Pesan Chat Masuk',
          message: `Pesan baru dari ${senderName}: "${text.substring(0, 50) + (text.length > 50 ? '...' : '')}"`,
          type: 'chat'
        });
      }
    }

    res.status(201).json({ data: message });
  } catch (error) {
    console.error('Error sendMessage:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
