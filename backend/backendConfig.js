const path = require('path');

const backendConfig = {
  // Define port, frontend URL, and folder path
  port: 3000, // The backend server port
  host: '',
  frontendUrl: 'http://localhost:4200', // The URL of the frontend app
  folderPath: './src/assets/watched-folder', // Folder to watch
  profileImagePath: 'C:/Ujjawal/profileImageSign' //Profile Image & Signature Folder
};

module.exports = backendConfig;