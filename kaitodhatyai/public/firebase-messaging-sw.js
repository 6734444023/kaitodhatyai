importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBZvfLNEHYBK-DKcsGdFOenFwLZJMxS7iY",
  authDomain: "kaitodhatyai-504f8.firebaseapp.com",
  projectId: "kaitodhatyai-504f8",
  storageBucket: "kaitodhatyai-504f8.firebasestorage.app",
  messagingSenderId: "395846897458",
  appId: "1:395846897458:web:a6b8a2588035fee7bd512b",
  measurementId: "G-VWSFMY3S5Q"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
