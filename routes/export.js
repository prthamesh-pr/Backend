const express = require('express');
const PDFDocument = require('pdfkit');
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Export vehicles data as PDF
router.get('/vehicles/pdf', auth, async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    
    // Build filter
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (fromDate || toDate) {
      filter.vehicleInDate = {};
      if (fromDate) {
        filter.vehicleInDate.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.vehicleInDate.$lte = new Date(toDate);
      }
    }

    const vehicles = await Vehicle.find(filter)
      .populate('createdBy', 'name')
      .sort({ vehicleInDate: -1 });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vehicles-export-${Date.now()}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Jivhala Motors - Vehicles Report', { align: 'center' });
    doc.fontSize(12).text('Designed and Developed by 5techG', { align: 'center' });
    doc.moveDown();

    // Report info
    doc.fontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
    doc.text(`Total Vehicles: ${vehicles.length}`);
    if (status) doc.text(`Status Filter: ${status}`);
    if (fromDate) doc.text(`From Date: ${new Date(fromDate).toLocaleDateString()}`);
    if (toDate) doc.text(`To Date: ${new Date(toDate).toLocaleDateString()}`);
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    const tableLeft = 50;
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('S.No', tableLeft, tableTop);
    doc.text('Vehicle No', tableLeft + 40, tableTop);
    doc.text('Owner Name', tableLeft + 120, tableTop);
    doc.text('In Date', tableLeft + 200, tableTop);
    doc.text('Out Date', tableLeft + 260, tableTop);
    doc.text('Status', tableLeft + 320, tableTop);
    doc.text('Price', tableLeft + 370, tableTop);

    // Draw header line
    doc.moveTo(tableLeft, tableTop + 15)
       .lineTo(tableLeft + 450, tableTop + 15)
       .stroke();

    // Table data
    doc.font('Helvetica');
    let currentY = tableTop + 25;

    vehicles.forEach((vehicle, index) => {
      if (currentY > 700) { // Start new page if needed
        doc.addPage();
        currentY = 50;
      }

      doc.text((index + 1).toString(), tableLeft, currentY);
      doc.text(vehicle.vehicleNumber, tableLeft + 40, currentY);
      doc.text(vehicle.ownerName.substring(0, 15), tableLeft + 120, currentY);
      doc.text(vehicle.vehicleInDate.toLocaleDateString(), tableLeft + 200, currentY);
      doc.text(vehicle.outDate ? vehicle.outDate.toLocaleDateString() : '-', tableLeft + 260, currentY);
      doc.text(vehicle.status.toUpperCase(), tableLeft + 320, currentY);
      doc.text(vehicle.buyer?.price ? `₹${vehicle.buyer.price}` : '-', tableLeft + 370, currentY);

      currentY += 20;
    });

    // Footer
    doc.fontSize(8).text('This is a computer generated document.', 50, doc.page.height - 50);

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'Error generating PDF export' });
  }
});

// Export vehicles data as CSV
router.get('/vehicles/csv', auth, async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    
    // Build filter
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (fromDate || toDate) {
      filter.vehicleInDate = {};
      if (fromDate) {
        filter.vehicleInDate.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.vehicleInDate.$lte = new Date(toDate);
      }
    }

    const vehicles = await Vehicle.find(filter)
      .populate('createdBy', 'name')
      .sort({ vehicleInDate: -1 });

    // Create CSV content
    const csvHeaders = [
      'Unique ID',
      'Vehicle Number',
      'Vehicle Name',
      'Owner Name',
      'Owner Type',
      'Mobile No',
      'In Date',
      'Out Date',
      'Status',
      'Buyer Name',
      'Buyer Mobile',
      'Price',
      'RTO Charges',
      'Commission',
      'Received Price',
      'Balance'
    ];

    let csvContent = csvHeaders.join(',') + '\n';

    vehicles.forEach(vehicle => {
      const row = [
        vehicle.uniqueId,
        vehicle.vehicleNumber,
        vehicle.vehicleName,
        vehicle.ownerName,
        vehicle.ownerType,
        vehicle.mobileNo,
        vehicle.vehicleInDate.toLocaleDateString(),
        vehicle.outDate ? vehicle.outDate.toLocaleDateString() : '',
        vehicle.status,
        vehicle.buyer?.buyerName || '',
        vehicle.buyer?.mobileNo || '',
        vehicle.buyer?.price || '',
        vehicle.buyer?.rtoCharges || '',
        vehicle.buyer?.commission || '',
        vehicle.buyer?.receivedPrice || '',
        vehicle.buyer?.balance || ''
      ].map(field => `"${field}"`); // Wrap in quotes for CSV safety

      csvContent += row.join(',') + '\n';
    });

    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="vehicles-export-${Date.now()}.csv"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Error generating CSV export' });
  }
});

// Generate vehicle PDF (for individual vehicle)
router.get('/vehicle/:id/pdf', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${vehicle.vehicleNumber}-details.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(24).text('Jivhala Motors', { align: 'center' });
    doc.fontSize(12).text('Your Trusted Vehicle Partner', { align: 'center' });
    doc.text('Contact: +91-XXXXXXXXXX | Email: info@jivhalamotors.com', { align: 'center' });
    doc.moveDown(2);

    // Vehicle In Details Box
    doc.rect(50, doc.y, 500, 200).stroke();
    doc.fontSize(16).font('Helvetica-Bold').text('Vehicle In Details', 60, doc.y + 10);
    doc.fontSize(11).font('Helvetica');
    
    let yPos = doc.y + 35;
    const leftCol = 60;
    const rightCol = 300;

    doc.text(`Unique ID: ${vehicle.uniqueId}`, leftCol, yPos);
    doc.text(`In Date: ${vehicle.vehicleInDate.toLocaleDateString()}`, rightCol, yPos);
    yPos += 20;

    doc.text(`Vehicle Number: ${vehicle.vehicleNumber}`, leftCol, yPos);
    doc.text(`Vehicle HP: ${vehicle.vehicleHP || 'N/A'}`, rightCol, yPos);
    yPos += 20;

    doc.text(`Vehicle Name: ${vehicle.vehicleName}`, leftCol, yPos);
    doc.text(`Model Year: ${vehicle.modelYear}`, rightCol, yPos);
    yPos += 20;

    doc.text(`Chassis No: ${vehicle.chassisNo}`, leftCol, yPos);
    doc.text(`Engine No: ${vehicle.engineNo}`, rightCol, yPos);
    yPos += 20;

    doc.text(`Owner Name: ${vehicle.ownerName}`, leftCol, yPos);
    doc.text(`Owner Type: ${vehicle.ownerType}`, rightCol, yPos);
    yPos += 20;

    doc.text(`Mobile No: ${vehicle.mobileNo}`, leftCol, yPos);
    doc.text(`Insurance Date: ${vehicle.insuranceDate ? vehicle.insuranceDate.toLocaleDateString() : 'N/A'}`, rightCol, yPos);
    yPos += 20;

    doc.text(`Documents: RC-${vehicle.documents.RC ? 'Yes' : 'No'}, PUC-${vehicle.documents.PUC ? 'Yes' : 'No'}, NOC-${vehicle.documents.NOC ? 'Yes' : 'No'}`, leftCol, yPos);

    doc.moveDown(3);

    // Buyer Details Box (if vehicle is out)
    if (vehicle.status === 'out' && vehicle.buyer) {
      doc.rect(50, doc.y, 500, 180).stroke();
      doc.fontSize(16).font('Helvetica-Bold').text('Buyer Details', 60, doc.y + 10);
      doc.fontSize(11).font('Helvetica');
      
      yPos = doc.y + 35;

      doc.text(`Buyer Name: ${vehicle.buyer.buyerName}`, leftCol, yPos);
      doc.text(`Out Date: ${vehicle.outDate ? vehicle.outDate.toLocaleDateString() : 'N/A'}`, rightCol, yPos);
      yPos += 20;

      doc.text(`Address: ${vehicle.buyer.address}`, leftCol, yPos);
      yPos += 20;

      doc.text(`Mobile No: ${vehicle.buyer.mobileNo}`, leftCol, yPos);
      doc.text(`ID Proof: ${vehicle.buyer.idProofType}`, rightCol, yPos);
      yPos += 20;

      doc.text(`Price: ₹${vehicle.buyer.price || 0}`, leftCol, yPos);
      doc.text(`RTO Charges: ₹${vehicle.buyer.rtoCharges || 0}`, rightCol, yPos);
      yPos += 20;

      doc.text(`Commission: ₹${vehicle.buyer.commission || 0}`, leftCol, yPos);
      doc.text(`Token: ₹${vehicle.buyer.token || 0}`, rightCol, yPos);
      yPos += 20;

      doc.text(`Received: ₹${vehicle.buyer.receivedPrice || 0}`, leftCol, yPos);
      doc.text(`Balance: ₹${vehicle.buyer.balance || 0}`, rightCol, yPos);

      doc.moveDown(3);
    }

    // Signature section
    doc.moveDown(2);
    doc.text('Buyer Signature: ____________________', 60, doc.y);
    doc.text('Owner Signature: ____________________', 350, doc.y);

    // Footer
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text('Thank you for trusting Jivhala Motors!', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Designed and Developed by 5techG', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Vehicle PDF error:', error);
    res.status(500).json({ message: 'Error generating vehicle PDF' });
  }
});

module.exports = router;
