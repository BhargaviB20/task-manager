const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const Notification = require('./models/Notification');
const User = require('./models/User');
const Task = require('./models/Task');

dotenv.config();


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS,
    },
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function sendNotifications() {
    try {
        const notifications = await Notification.find({ read: false })
            .populate('user')
            .populate('task');

        for (const notification of notifications) {
            const user = notification.user;
            const task = notification.task;
            if (!user || !user.email) continue;

            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: user.email,
                subject: `Task Notification: ${notification.type}`,
                text: `Hello ${user.name},\n\n${notification.message}\n\nTask: ${task ? task.title : 'N/A'}\n\nRegards,\nTask Manager`
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`Notification sent to ${user.email} (MessageId: ${info.messageId})`);
                notification.read = true;
                await notification.save();
            } catch (emailError) {
                console.error(`Failed to send notification to ${user.email}:`, emailError);
            }
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
    } finally {
        mongoose.connection.close();
    }
}

sendNotifications();
