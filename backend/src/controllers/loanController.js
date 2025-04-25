const Loan = require('../models/loan');
const mongoose = require('mongoose');

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
    loan.remainingBalance = 0; // Set remaining balance to 0
    loan.paymentStatus = 'paid'; // Update payment status
    loan.amountPaid = loan.loanAmount; // Set amountPaid to the total loan amount

    // Save the updated loan
    await loan.save();

    res.status(200).json({ success: true, message: 'Loan paid off successfully', data: loan });
  } catch (error) {
    console.error('Error paying off loan:', error);
    res.status(500).json({ success: false, message: 'Error paying off loan', error: error.message });
  }
};