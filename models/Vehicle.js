const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const vehicleSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    default: () => `JM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    unique: true
  },
  // Vehicle In Details
  vehicleInDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  vehicleHP: {
    type: String,
    trim: true
  },
  chassisNo: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  engineNo: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  vehicleName: {
    type: String,
    required: true,
    trim: true
  },
  modelYear: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  ownerType: {
    type: String,
    enum: ['1st', '2nd', '3rd'],
    required: true
  },
  mobileNo: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/
  },
  insuranceDate: {
    type: Date
  },
  challan: {
    type: String,
    trim: true
  },
  // Document checkboxes
  documents: {
    RC: { type: Boolean, default: false },
    PUC: { type: Boolean, default: false },
    NOC: { type: Boolean, default: false }
  },
  // Vehicle photos (up to 6)
  photos: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Vehicle Out Details
  status: {
    type: String,
    enum: ['in', 'out'],
    default: 'in'
  },
  outDate: Date,
  
  // Buyer Information
  buyer: {
    buyerName: String,
    address: String,
    mobileNo: {
      type: String,
      match: /^[6-9]\d{9}$/
    },
    price: Number,
    rtoCharges: Number,
    commission: Number,
    token: Number,
    receivedPrice: Number,
    balance: Number,
    aadharCard: String,
    panCard: String,
    dlNumber: String,
    idProofType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'DL']
    },
    buyerPhoto: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: Date
    }
  },
  
  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ chassisNo: 1 });
vehicleSchema.index({ engineNo: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleInDate: 1 });
vehicleSchema.index({ uniqueId: 1 });

// Virtual for calculated balance
vehicleSchema.virtual('calculatedBalance').get(function() {
  if (this.buyer && this.buyer.price && this.buyer.receivedPrice) {
    return this.buyer.price - this.buyer.receivedPrice;
  }
  return 0;
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
