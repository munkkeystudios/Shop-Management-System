const Loan = require('../models/loan');

// Create a new loan
exports.createLoan = async (req, res) => {
  try {
    const { customer, loanAmount, paymentMethod, notes } = req.body;

    // Calculate remaining balance (initially equal to loanAmount)
    const remainingBalance = loanAmount;

    // Find the last loan in the database and get its loanNumber
    const lastLoan = await Loan.findOne().sort({ loanNumber: -1 }); // Sort by loanNumber in descending order
    const loanNumber = lastLoan ? lastLoan.loanNumber + 1 : 1; // Increment last loanNumber or set to 1 if none exist

    const loan = new Loan({
      loanNumber,
      customer, // Customer details (name, email, phone, address)
      items: [], // Initialize with an empty array
      loanAmount,
      remainingBalance,
      paymentMethod,
      notes,
      createdBy: req.user._id // Assuming `req.user` contains the logged-in user's ID
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

    // Add new items to the loan
    items.forEach((item) => {
      loan.items.push(item);
      loan.loanAmount += item.subtotal; // Update loan amount
      loan.remainingBalance += item.subtotal; // Update remaining balance
    });

    await loan.save();
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    console.error('Error adding loan items:', error);
    res.status(500).json({ success: false, message: 'Error adding loan items', error: error.message });
  }
};