const Loan = require('../models/loan');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const User = require('../models/user'); // Import the User model

// Create a new loan
exports.createLoan = async (req, res) => {
  try {
    const { customer, loanAmount, paymentMethod, notes } = req.body;

    // Calculate remaining balance (initially equal to 0)
    const remainingBalance = 0;

    // Find the last loan in the database and get its loanNumber
    const lastLoan = await Loan.findOne().sort({ loanNumber: -1 }); 
    const loanNumber = lastLoan ? lastLoan.loanNumber + 1 : 1; // Increment last loanNumber or set to 1 if none exist

    const loan = new Loan({
      loanNumber,
      customer, // Customer details (name, email, phone, address)
      items: [], // Initialize with an empty array
      loanAmount,
      remainingBalance,
      paymentMethod,
      notes,
      createdBy: req.user._id 
    });

    await loan.save();
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ success: false, message: 'Error creating loan', error: error.message });
  }
};

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: loans });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ success: false, message: 'Error fetching loans', error: error.message });
  }
};

// Get a single loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('items.product', 'name price');
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ success: false, message: 'Error fetching loan', error: error.message });
  }
};

// Get a loan by loan number
exports.getLoanByLoanNumber = async (req, res) => {
  try {
    const { loanNumber } = req.params;

    // Find the loan by loanNumber
    const loan = await Loan.findOne({ loanNumber }).populate('items.product', 'name price');
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    console.error('Error fetching loan by loan number:', error);
    res.status(500).json({ success: false, message: 'Error fetching loan by loan number', error: error.message });
  }
};

// Update loan repayment
exports.updateLoanRepayment = async (req, res) => {
  try {
    const { amountPaid } = req.body;

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    loan.amountPaid += amountPaid;
    loan.remainingBalance = loan.loanAmount - loan.amountPaid;

    // Update payment status
    if (loan.remainingBalance <= 0) {
      loan.paymentStatus = 'paid';
      loan.remainingBalance = 0; // Ensure no negative balance
    } else {
      loan.paymentStatus = 'partial';
    }

    await loan.save();
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    console.error('Error updating loan repayment:', error);
    res.status(500).json({ success: false, message: 'Error updating loan repayment', error: error.message });
  }
};

// Validate Loan Number
exports.validateLoan = async (req, res) => {
  try {
    const { loanNumber } = req.body;
    const loan = await Loan.findOne({ loanNumber });

    if (!loan) {
      return res.status(404).json({ valid: false, message: 'Loan not found' });
    }

    return res.status(200).json({ valid: true, loan });
  } catch (error) {
    console.error('Error validating loan:', error);
    return res.status(500).json({ valid: false, message: 'Server error' });
  }
};

// Add loan items
exports.addLoanItems = async (req, res) => {
  try {
    const { loanId } = req.params; // Loan ID from the request parameters
    const { items } = req.body; // Items to add (array of LoanItemSchema objects)

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    // Check if the remaining balance is 0
    if (loan.remainingBalance === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add items to this loan. The remaining balance is already 0.',
      });
    }

    // Subtract the subtotal of each item from the remaining balance
    items.forEach((item) => {
      loan.items.push(item);
      loan.remainingBalance -= item.subtotal; // Subtract from remaining balance
    });

    // Ensure the remaining balance does not go below 0
    if (loan.remainingBalance < 0) {
      loan.remainingBalance = 0;
    }

    // Update payment status
    if (loan.remainingBalance === 0) {
      loan.paymentStatus = 'paid';
    } else {
      loan.paymentStatus = 'partial';
    }

    await loan.save();
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    console.error('Error adding loan items:', error);
    res.status(500).json({ success: false, message: 'Error adding loan items', error: error.message });
  }
};

// Pay off a loan
exports.payLoan = async (req, res) => {
  try {
    const { id } = req.params; // Loan ID from the request parameters

    // Find the loan by ID
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    // Check if the loan is already paid
    if (loan.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Loan is already fully paid' });
    }

    // Mark the loan as paid
    loan.remainingBalance = 0; 
    loan.paymentStatus = 'paid'; 
    loan.amountPaid = loan.loanAmount; 

    await loan.save();

    res.status(200).json({ success: true, message: 'Loan paid off successfully', data: loan });
  } catch (error) {
    console.error('Error paying off loan:', error);
    res.status(500).json({ success: false, message: 'Error paying off loan', error: error.message });
  }
};

// Export loans to CSV or PDF
exports.exportLoans = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, paymentStatus } = req.query;

    // Build query based on filters
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    // Payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Fetch loans without populate first to avoid User schema issues
    let loans = await Loan.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Try to populate createdBy, but handle errors gracefully
    try {
      // Only attempt to populate if the User model is available
      if (mongoose.modelNames().includes('User')) {
        loans = await Loan.find(query)
          .populate('createdBy', 'username name')
          .sort({ createdAt: -1 })
          .lean();
      }
    } catch (populateError) {
      console.warn('Unable to populate createdBy field:', populateError.message);
      // Continue with unpopulated loans
    }

    if (format.toLowerCase() === 'csv') {
      // CSV Export Logic
      if (loans.length === 0) {
        return res.status(200).send('No loans data to export.');
      }

      // Flatten the data for CSV export
      const flattenedData = loans.map(loan => ({
        loanId: loan._id?.toString() || '',
        loanNumber: loan.loanNumber || 0,
        date: loan.createdAt ? loan.createdAt.toISOString().split('T')[0] : '',
        time: loan.createdAt ? loan.createdAt.toISOString().split('T')[1].substring(0, 8) : '',
        customerName: loan.customer?.name || 'Unknown Customer',
        customerPhone: loan.customer?.phone || 'N/A',
        loanAmount: loan.loanAmount || 0,
        amountPaid: loan.amountPaid || 0,
        remainingBalance: loan.remainingBalance || 0,
        paymentMethod: loan.paymentMethod || '',
        paymentStatus: loan.paymentStatus || '',
        createdBy: loan.createdBy ? loan.createdBy.name || loan.createdBy.username : 'N/A',
        notes: loan.notes || ''
      }));

      const fields = [
        'loanId', 'loanNumber', 'date', 'time', 'customerName', 'customerPhone',
        'loanAmount', 'amountPaid', 'remainingBalance', 'paymentMethod', 'paymentStatus',
        'createdBy', 'notes'
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flattenedData);

      res.header('Content-Type', 'text/csv');
      res.attachment('loans.csv');
      return res.status(200).send(csv);

    } else if (format.toLowerCase() === 'pdf') {
      // PDF Export Logic - Simplified to avoid potential errors
      try {
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=loans.pdf');
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add title
        doc.fontSize(20).text('Loans Report', { align: 'center' });
        doc.moveDown();
        
        // Add date
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);
        
        if (loans.length === 0) {
          doc.fontSize(12).text('No loans data available.', { align: 'center' });
          doc.end();
          return;
        }
        
        // Add table headers
        const tableTop = 150;
        doc.fontSize(10);
        
        // Draw table header
        doc.text('Loan #', 50, tableTop);
        doc.text('Customer', 120, tableTop);
        doc.text('Amount', 250, tableTop);
        doc.text('Remaining', 320, tableTop);
        doc.text('Status', 390, tableTop);
        doc.text('Date', 460, tableTop);
        
        // Add a line
        doc.moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();
        
        // Draw rows
        let y = tableTop + 25;
        
        loans.forEach((loan, i) => {
          // Add a new page if needed
          if (y > 700) {
            doc.addPage();
            y = 50;
            
            // Redraw header on new page
            doc.text('Loan #', 50, y);
            doc.text('Customer', 120, y);
            doc.text('Amount', 250, y);
            doc.text('Remaining', 320, y);
            doc.text('Status', 390, y);
            doc.text('Date', 460, y);
            
            doc.moveTo(50, y + 15)
               .lineTo(550, y + 15)
               .stroke();
               
            y += 25;
          }
          
          // Format date
          const date = loan.createdAt 
            ? new Date(loan.createdAt).toLocaleDateString() 
            : 'N/A';
          
          // Add row
          doc.text(loan.loanNumber?.toString() || '', 50, y);
          doc.text(loan.customer?.name || 'Unknown', 120, y, { width: 120, ellipsis: true });
          doc.text(`$${(loan.loanAmount || 0).toFixed(2)}`, 250, y);
          doc.text(`$${(loan.remainingBalance || 0).toFixed(2)}`, 320, y);
          doc.text(loan.paymentStatus || 'Unknown', 390, y);
          doc.text(date, 460, y);
          
          y += 20;
        });
        
        // Add summary
        y += 20;
        const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
        const totalRemaining = loans.reduce((sum, loan) => sum + (loan.remainingBalance || 0), 0);
        
        doc.fontSize(12);
        doc.text(`Total Loans: ${loans.length}`, 300, y);
        y += 20;
        doc.text(`Total Amount: $${totalLoanAmount.toFixed(2)}`, 300, y);
        y += 20;
        doc.text(`Total Remaining: $${totalRemaining.toFixed(2)}`, 300, y);
        
        // Finalize the PDF and end the stream
        doc.end();
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        return res.status(500).json({
          success: false,
          message: 'Error generating PDF',
          error: pdfError.message
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid export format. Use 'csv' or 'pdf'."
      });
    }
  } catch (error) {
    console.error('Error exporting loans:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting loans',
      error: error.message
    });
  }
};