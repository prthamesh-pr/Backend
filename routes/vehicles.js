const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/vehicles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create vehicle (Vehicle In)
router.post('/in', auth, upload.array('photos', 6), [
  body('vehicleNumber').notEmpty().trim(),
  body('chassisNo').notEmpty().trim(),
  body('engineNo').notEmpty().trim(),
  body('vehicleName').notEmpty().trim(),
  body('modelYear').isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
  body('ownerName').notEmpty().trim(),
  body('ownerType').isIn(['1st', '2nd', '3rd']),
  body('mobileNo').matches(/^[6-9]\d{9}$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findOne({ 
      vehicleNumber: req.body.vehicleNumber.toUpperCase() 
    });
    
    if (existingVehicle) {
      return res.status(400).json({ 
        message: 'Vehicle with this number already exists' 
      });
    }

    // Process uploaded photos
    const photos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      uploadDate: new Date()
    })) : [];

    // Create vehicle data
    const vehicleData = {
      ...req.body,
      vehicleNumber: req.body.vehicleNumber.toUpperCase(),
      chassisNo: req.body.chassisNo.toUpperCase(),
      engineNo: req.body.engineNo.toUpperCase(),
      modelYear: parseInt(req.body.modelYear),
      vehicleInDate: req.body.vehicleInDate ? new Date(req.body.vehicleInDate) : new Date(),
      insuranceDate: req.body.insuranceDate ? new Date(req.body.insuranceDate) : null,
      documents: {
        RC: req.body.RC === 'true',
        PUC: req.body.PUC === 'true',
        NOC: req.body.NOC === 'true'
      },
      photos: photos,
      createdBy: req.user.userId
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicle: vehicle
    });
  } catch (error) {
    console.error('Add vehicle error:', error);
    res.status(500).json({ message: 'Error adding vehicle', error: error.message });
  }
});

// Get all vehicles with search and filter
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('status').optional().isIn(['in', 'out']),
  query('fromDate').optional().isISO8601(),
  query('toDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.$or = [
        { vehicleNumber: { $regex: req.query.search, $options: 'i' } },
        { ownerName: { $regex: req.query.search, $options: 'i' } },
        { vehicleName: { $regex: req.query.search, $options: 'i' } },
        { uniqueId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.fromDate || req.query.toDate) {
      filter.vehicleInDate = {};
      if (req.query.fromDate) {
        filter.vehicleInDate.$gte = new Date(req.query.fromDate);
      }
      if (req.query.toDate) {
        filter.vehicleInDate.$lte = new Date(req.query.toDate);
      }
    }

    // Get vehicles with pagination
    const vehicles = await Vehicle.find(filter)
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vehicle.countDocuments(filter);

    res.json({
      vehicles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});

// Get vehicle by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Error fetching vehicle' });
  }
});

// Update vehicle
router.put('/:id', auth, upload.array('newPhotos', 6), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Prevent editing if vehicle is marked as "out"
    if (vehicle.status === 'out' && req.body.status !== 'in') {
      return res.status(400).json({ 
        message: 'Cannot edit vehicle that is marked as out' 
      });
    }

    // Process new photos if uploaded
    const newPhotos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      uploadDate: new Date()
    })) : [];

    // Update vehicle data
    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    // Handle documents
    if (req.body.RC !== undefined) {
      updateData['documents.RC'] = req.body.RC === 'true';
    }
    if (req.body.PUC !== undefined) {
      updateData['documents.PUC'] = req.body.PUC === 'true';
    }
    if (req.body.NOC !== undefined) {
      updateData['documents.NOC'] = req.body.NOC === 'true';
    }

    // Add new photos to existing ones
    if (newPhotos.length > 0) {
      updateData.$push = { photos: { $each: newPhotos } };
    }

    // Handle date fields
    if (req.body.vehicleInDate) {
      updateData.vehicleInDate = new Date(req.body.vehicleInDate);
    }
    if (req.body.insuranceDate) {
      updateData.insuranceDate = new Date(req.body.insuranceDate);
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy updatedBy', 'name username');

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Error updating vehicle' });
  }
});

// Vehicle Out - mark vehicle as sold
router.post('/:id/out', auth, upload.single('buyerPhoto'), [
  body('buyerName').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('mobileNo').matches(/^[6-9]\d{9}$/),
  body('price').isFloat({ min: 0 }),
  body('idProofType').isIn(['Aadhaar', 'PAN', 'DL', 'Voter', 'Passport'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status === 'out') {
      return res.status(400).json({ message: 'Vehicle is already marked as out' });
    }

    // Process buyer photo if uploaded
    const buyerPhoto = req.file ? {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadDate: new Date()
    } : null;

    // Update vehicle with buyer information
    const buyerData = {
      buyerName: req.body.buyerName,
      address: req.body.address,
      mobileNo: req.body.mobileNo,
      price: parseFloat(req.body.price),
      rtoCharges: req.body.rtoCharges ? parseFloat(req.body.rtoCharges) : 0,
      commission: req.body.commission ? parseFloat(req.body.commission) : 0,
      token: req.body.token ? parseFloat(req.body.token) : 0,
      receivedPrice: req.body.receivedPrice ? parseFloat(req.body.receivedPrice) : 0,
      balance: req.body.balance ? parseFloat(req.body.balance) : 0,
      aadharCard: req.body.aadharCard,
      panCard: req.body.panCard,
      dlNumber: req.body.dlNumber,
      idProofType: req.body.idProofType,
      buyerPhoto: buyerPhoto
    };

    vehicle.buyer = buyerData;
    vehicle.status = 'out';
    vehicle.outDate = req.body.outDate ? new Date(req.body.outDate) : new Date();
    vehicle.updatedBy = req.user.userId;

    await vehicle.save();

    res.json({
      message: 'Vehicle marked as out successfully',
      vehicle: vehicle
    });
  } catch (error) {
    console.error('Vehicle out error:', error);
    res.status(500).json({ message: 'Error marking vehicle as out' });
  }
});

// Delete vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Delete associated files
    if (vehicle.photos && vehicle.photos.length > 0) {
      vehicle.photos.forEach(photo => {
        try {
          fs.unlinkSync(photo.path);
        } catch (error) {
          console.error('Error deleting photo:', error);
        }
      });
    }

    if (vehicle.buyer && vehicle.buyer.buyerPhoto) {
      try {
        fs.unlinkSync(vehicle.buyer.buyerPhoto.path);
      } catch (error) {
        console.error('Error deleting buyer photo:', error);
      }
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Error deleting vehicle' });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const vehiclesIn = await Vehicle.countDocuments({ status: 'in' });
    const vehiclesOut = await Vehicle.countDocuments({ status: 'out' });

    // Monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Vehicle.aggregate([
      {
        $match: {
          vehicleInDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$vehicleInDate' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    // Format monthly data for chart
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const vehiclesInMonth = monthlyStats.find(
        stat => stat._id.month === month && stat._id.status === 'in'
      )?.count || 0;
      
      const vehiclesOutMonth = monthlyStats.find(
        stat => stat._id.month === month && stat._id.status === 'out'
      )?.count || 0;

      monthlyData.push({
        month: month,
        vehiclesIn: vehiclesInMonth,
        vehiclesOut: vehiclesOutMonth
      });
    }

    res.json({
      summary: {
        totalVehicles,
        vehiclesIn,
        vehiclesOut
      },
      monthlyData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Delete photo from vehicle
router.delete('/:id/photos/:photoId', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const photoIndex = vehicle.photos.findIndex(
      photo => photo._id.toString() === req.params.photoId
    );

    if (photoIndex === -1) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const photo = vehicle.photos[photoIndex];
    
    // Delete file from filesystem
    try {
      fs.unlinkSync(photo.path);
    } catch (error) {
      console.error('Error deleting photo file:', error);
    }

    // Remove photo from array
    vehicle.photos.splice(photoIndex, 1);
    vehicle.updatedBy = req.user.userId;
    await vehicle.save();

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: 'Error deleting photo' });
  }
});

module.exports = router;
