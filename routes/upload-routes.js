const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUploader');
const path = require('path'); // For serving static files 
const fs = require('fs');

router.get('/files', (req, res) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch files' });
    }
    res.status(200).json({ files });
  });
});

// Serve a specific file by filename
router.get('/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Single file upload
router.get('/metadata', async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch file metadata' });
  }
});

// Multiple file upload
router.post('/multiple', upload.array('images', 5), (req, res) => {
  try {
    res.status(201).json({
      message: 'Files uploaded successfully',
      files: req.files,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file ${filename}:`, err.message);
      return res.status(500).json({ message: `Failed to delete file: ${filename}` });
    }
    res.status(200).json({ message: `File ${filename} deleted successfully.` });
  });
});

module.exports = router;
