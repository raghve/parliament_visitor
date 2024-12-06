const express = require('express');
const chokidar = require('chokidar');
const http = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const socketIo = require('socket.io');

const backendConfig = require('./backendConfig'); // Import the backend configuration

const app = express();
const server = http.createServer(app);



const folderPath = backendConfig.folderPath; // Folder to watch
console.log("FolderPath : ", folderPath);

// Enable CORS for all domains (or specify a specific domain)
app.use(cors({
  origin: backendConfig.frontendUrl, // Allow only the Angular app to access the backend
  methods: ['GET', 'POST'],
  credentials: true // Enable cookies if needed
}));

// Enable CORS
const io = socketIo(server, {
  cors: {
    origin: backendConfig.frontendUrl, // Angular app URL
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


// Watch the folder for changes
const watcher = chokidar.watch(folderPath, { persistent: true });

//      ---------New Code File Watcher------
watcher.on('add', (filePath) => {
  console.log(`File added1: ${filePath}`);

  try {
    const latestFileData = parseFilePath(filePath);
    console.log('Parsed File Data1:', latestFileData);

    // Extract deviceId from filePath (modify logic based on folder structure)
    const pathParts = filePath.split(path.sep);
    const deviceId = pathParts[pathParts.length - 3]; // Adjust as needed

    console.log('Device ID:', deviceId);
    // console.log("Profile Image Path:", backendConfig.profileImagePath);
    // console.log("Signature Image Path:", backendConfig.profileImagePath);

    // Paths for profile image and signature
    const profileImagePath = path.join(
      backendConfig.profileImagePath,
      `${latestFileData.empId}.jpg`
    );
    // console.log("Profile Image Path:", profileImagePath);/////
    
    const signatureImagePath = path.join(
      backendConfig.profileImagePath,
      `${latestFileData.empId}_sign.jpg`
    );
    // console.log("Signature Image Path:", signatureImagePath);

    // Read the file and convert to Base64
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }

      const base64Image = `data:image/jpeg;base64,${data.toString('base64')}`;

    // Read the profile image
    fs.readFile(profileImagePath, (err, profileImageData) => {
      if (err) {
        console.error('Error reading profile image:', err);
        return;
      }

      const base64ProfileImage = `data:image/jpeg;base64,${profileImageData.toString('base64')}`;

      // Read the signature image
      fs.readFile(signatureImagePath, (err, signatureImageData) => {
        if (err) {
          console.error('Error reading signature image:', err);
          return;
        }

        const base64SignatureImage = `data:image/jpeg;base64,${signatureImageData.toString('base64')}`;

        // Prepare and emit payload
        const payload = {
          deviceId,
          base64Image, // Main image
          base64ProfileImage, // Profile image
          base64SignatureImage, // Signature image
          empId: latestFileData.empId,
          name: latestFileData.name,
          companyName: latestFileData.companyName,
          department: latestFileData.department,
          expectedOutTime: latestFileData.expectedOutTime,
          type: latestFileData.type,
        };

        console.log('Emitted Payload:', payload);
        io.emit('file-added', payload);
      });
    });
  });
  } catch (error) {
    console.error('Error processing file1:', error.message);
  }
});


// Serve static files from Angular app
app.use(express.static(path.join(__dirname, '../dist/file-watcher-app')));

// API to get the latest image for a selected Device ID and current date
app.get('/get-latest-image/:deviceId', (req, res) => {
  const deviceId = req.params.deviceId;
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Format as yyyyMMdd
  const deviceFolderPath = path.join(folderPath, deviceId, currentDate);

  // Check if the folder for the device and date exists
  if (!fs.existsSync(deviceFolderPath)) {
    return res.status(404).send('Device folder not found.');
  }

  fs.readdir(deviceFolderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return res.status(500).send('Error reading folder.');
    }

    if (files.length === 0) {
      return res.status(404).send('No files found.');
    }

    try {
      // Sort files by timestamp (latest first)
      files.sort((a, b) => {
        const parseTimestamp = (fileName) => {
          const parts = fileName.replace('.jpg', '').split('~');
          if (parts.length !== 6) {
            throw new Error(`Invalid file format: ${fileName}`);
          }
          const timestamp = parts[4];    // Expected Out Time is at 4th part
          if (!/^\d{14}$/.test(timestamp)) {
            throw new Error(`Invalid timestamp: ${timestamp}`);
          }
          return new Date(
            timestamp.replace(
              /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
              '$1-$2-$3T$4:$5:$6'
            )
          );
        };

        return parseTimestamp(b) - parseTimestamp(a);
      });

      const latestFile = files[0]; // Get the latest file
      console.log("latest data", latestFile);
      const filePath = path.join(deviceFolderPath, latestFile);
      console.log('Filepath', filePath);
//Name~CompanyName~Department~ExpectedOuttime~type
     let [empId, name, companyName, department, expectedOutTime, type] = latestFile.replace('.jpg', '').split('~');

     empId = empId;
     name = formatName(name);
     companyName = formatName(companyName);
     department = department;
     expectedOutTime = formatTimestamp(expectedOutTime);
     type = type;

    // Profile image and signature paths
        const profileImagePath = path.join(
          backendConfig.profileImagePath,
          `${empId}.jpg`
        );
        const signatureImagePath = path.join(
          backendConfig.profileImagePath,
          `${empId}_sign.jpg`
        );  

  // Read the image file and convert it to base64
     fs.readFile(filePath, (err, data) => {
      if (err) {
      console.error('Error reading image file:', err);
      return res.status(500).send('Error reading image file.');
    }

     const base64Image = data.toString('base64');

      // Read the profile image
      fs.readFile(profileImagePath, (err, profileImageData) => {
        if (err) {
          console.error('Error reading profile image file:', err);
          return res.status(500).send('Error reading profile image file.');
        }

        const base64ProfileImage = `data:image/jpeg;base64,${profileImageData.toString('base64')}`;

        // Read the signature image
        fs.readFile(signatureImagePath, (err, signatureImageData) => {
          if (err) {
            console.error('Error reading signature image file:', err);
            return res.status(500).send('Error reading signature image file.');
          }

          const base64SignatureImage = `data:image/jpeg;base64,${signatureImageData.toString('base64')}`;

          // Send the response
          res.json({
            base64Image,
            base64ProfileImage,
            base64SignatureImage,
            empId,
            name,
            companyName,
            department,
            expectedOutTime,
            type,
          });
        });
      });
    });
    } catch (error) {
      console.error('Error processing files:', error.message);
      return res.status(500).send('Error processing files.');
    }
  });
});



// Fallback route for Angular's routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/file-watcher-app/index.html'));
});




// Function to format name (add space between first and last name)
function formatName(name) {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// Function to format timestamp (yyyymmddhhmmss to dd MMM yyyy hh:mm:ss)
function formatTimestamp(timestamp) {
  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hours = timestamp.substring(8, 10);
  const minutes = timestamp.substring(10, 12);
  const seconds = timestamp.substring(12, 14);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const formattedDate = `${day} ${months[parseInt(month, 10) - 1]} ${year} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

function parseFilePath(filePath) {
  const fileName = path.basename(filePath, '.jpg'); // Extract the file name without the extension
  const [empId, name, companyName, department, expectedOutTime, type] = fileName.split('~'); // Split by `~`

  if (!empId || !name || !companyName || !department || !expectedOutTime || !type) {
    throw new Error(`Invalid file name format: ${fileName}`);
  }

  return {
    empId,
    name: formatName(name),
    companyName: formatName(companyName),
    department,
    expectedOutTime: formatTimestamp(expectedOutTime), // Format expectedOutTime
    type,
  };
}

// Start the server
const PORT = backendConfig.port;
const HOST = backendConfig.host;
server.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});