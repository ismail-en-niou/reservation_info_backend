const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyDJXSkS1pWOu__t3QowQ5IqPpWddqpzOe8",
  authDomain: "info4mth-efd44.firebaseapp.com",
  databaseURL: "https://info4mth-efd44-default-rtdb.firebaseio.com",
  projectId: "info4mth-efd44",
  storageBucket: "info4mth-efd44.appspot.com",
  messagingSenderId: "379077626240",
  appId: "1:379077626240:web:8064f5dcb22a3dc9175965",
  measurementId: "G-L2YVDB9G3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = database;