const { Notification, User } = require('../models');
const { sendEmailNotification } = require('./email');

const createNotification = async (userId, title, message) => {
  try {
    // Save to database
    const notification = await Notification.create({
      userId,
      title,
      message,
    });

    // Send email
    const user = await User.findByPk(userId);
    if (user && user.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #002653;">${title}</h2>
          <p style="color: #333; font-size: 16px;">${message}</p>
          <br/>
          <p style="color: #777; font-size: 12px;">Ini adalah email otomatis dari sistem CLASSIFY, harap jangan membalas email ini.</p>
        </div>
      `;
      await sendEmailNotification(user.email, title, emailHtml);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = {
  createNotification
};
