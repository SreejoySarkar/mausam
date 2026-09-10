const { messaging } = require("./firebaseAdmin");

const sendNotification = async () => {
    const message = {
        notification: {
            title: "Mausam Test",
            body: "FCM notification is working!"
        },
        token: "eUTFPkbXeNITR8S_KVBtWQ:APA91bEr5lRu72dGFBhqonz9C2cM7GvgnCRSIlF25uEhHZ529wJTKfGIlJoVrPXqrEZJtZGLGJJdu-K3qSWgQEZryVeNMITu2ji4P6UibBP7r8hyQGqB10E"
    };

    try {
        const response = await messaging.send(message);
        console.log("Notification sent successfully:", response);
    } catch (error) {
        console.log("Notification Error:", error.message);
    }
};

sendNotification();