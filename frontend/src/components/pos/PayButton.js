import { useState } from 'react';
import { generateReceipt } from './generateReceipt';
import { salesAPI } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { getCurrencySymbol } from '../../utils/currencyUtils';
import '../styles/PayButton.css';

const PayButton = ({ cartItems, totalPayable, totalQuantity, billNumber, updateBillNumber, onPaymentComplete, isDarkMode }) => {
  const { addNotification } = useNotifications();
  const { settings } = useSettings();
  const currencySymbol = settings?.currencyCode ? getCurrencySymbol(settings.currencyCode) : '₦';
  
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loanNumber, setLoanNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const GST = 0.10;
  const endPayment = Number((totalPayable + GST * totalPayable).toFixed(2));

  // Calculate change based on cash received
  const cashChange = cashReceived ? Number(cashReceived) - endPayment : 0;

  const handleClose = () => {
    setShow(false);
    setErrorMessage('');
    setValidationErrors({});
    setCashReceived('');
    setCardNumber('');
    setLoanNumber('');
  };

  const handleShow = () => setShow(true);

  // Validate form based on payment method
  const validateForm = () => {
    const errors = {};

    if (paymentMethod === 'cash') {
      if (!cashReceived || isNaN(cashReceived) || Number(cashReceived) <= 0) {
        errors.cashReceived = 'Please enter a valid amount received';
      } else if (Number(cashReceived) < endPayment) {
        errors.cashReceived = 'Cash received must be equal to or greater than the total amount';
      }
    } else if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
        errors.cardNumber = 'Please enter a valid card number (13-19 digits)';
      }
    } else if (paymentMethod === 'loan') {
      if (!loanNumber || loanNumber.trim() === '') {
        errors.loanNumber = 'Please enter a valid loan number';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update the handleTransaction function to correctly prepare receipt data
  const handleTransaction = async () => {
    try {
      // Validate form before proceeding
      if (!validateForm()) {
        return;
      }

      // Determine payment status based on payment method
      let paymentStatus = 'paid';
      if (paymentMethod === 'loan') {
        paymentStatus = 'due';
      }

      // Prepare the sale data
      const saleData = {
        billNumber: billNumber,
        customerName: 'Walk in Customer',
        customerPhone: 'N/A',
        items: cartItems.map((item) => {
          const discountRate = item.discount || 0;
          const effectivePrice = item.price * (1 - discountRate / 100);

          return {
            product: item.id,
            quantity: item.quantity,
            price: item.price,
            effectivePrice: Number(effectivePrice.toFixed(2)),
            subtotal: item.subtotal,
          };
        }),
        subtotal: totalPayable,
        discount: 0,
        tax: Number((GST * totalPayable).toFixed(2)),
        total: endPayment,
        paymentMethod,
        amountPaid: paymentMethod === 'cash' ? Number(cashReceived) : (paymentMethod === 'card' ? endPayment : 0),
        change: paymentMethod === 'cash' ? Math.max(0, Number(cashReceived) - endPayment) : 0,
        paymentStatus,
        notes: `Payment made via ${paymentMethod}. ${paymentMethod === 'loan' ? `Loan #${loanNumber}` : ''}`,
        loanNumber: paymentMethod === 'loan' ? loanNumber : null,
      };

      const response = await salesAPI.create(saleData);
      console.log('Sale created successfully:', response.data);

      if (response.data && response.data.data && response.data.data._id) {
        // Get the ID of the newly created sale
        const newSaleId = response.data.data._id;
        const saleAmount = endPayment;
        const productCount = cartItems.length;

        // Add notification to the system
        addNotification(
          'sale',
          `New POS sale created for ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(saleAmount)} with ${productCount} ${productCount === 1 ? 'product' : 'products'}`,
          newSaleId
        );

        // Update the billNumber for the next transaction
        updateBillNumber(billNumber + 1);

        // Prepare receipt data with correct values for the generateReceipt function
        const receiptData = {
          billNumber: billNumber,
          customerName: 'Walk in Customer',
          warehouse: 'Main Warehouse',
          items: cartItems.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            amount: item.subtotal,
          })),
          subtotal: totalPayable,
          discount: 0,
          tax: Number((GST * totalPayable).toFixed(2)),
          total: endPayment,
          paymentMethod: paymentMethod === 'cash' ? 'Cash Payment' :
                        (paymentMethod === 'card' ? 'Card/Debit Payment' : 'Loan Payment'),
          received: paymentMethod === 'cash' ? Number(cashReceived) :
                  (paymentMethod === 'card' ? endPayment : 0),
          returned: paymentMethod === 'cash' ? Math.max(0, Number(cashReceived) - endPayment) : 0,
          paymentStatus: paymentStatus,
          date: new Date(),
        };

        generateReceipt(receiptData);

        if (onPaymentComplete) {
          onPaymentComplete(newSaleId);
        }

        handleClose();
      } else {
        console.error('Sale created but no ID returned:', response.data);
        setErrorMessage('Transaction completed but sale tracking failed. Please check sales history.');
      }
    } catch (error) {
      console.error('Error during transaction:', error);

      // More helpful error messages based on error type
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage('Invalid transaction data. Please check all fields and try again.');
        } else if (error.response.status === 404) {
          setErrorMessage('Resource not found. Please check if loan/customer exists in the system.');
        } else if (error.response.status === 500) {
          setErrorMessage('Server error occurred. Please try again or contact support.');
        } else {
          setErrorMessage(`Error: ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        setErrorMessage('Network error. Please check your connection and try again.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShow}
        style={{
          fontSize: '0.95rem',
          padding: '6px 18px',
          borderRadius: '4px',
          boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)',
          height: '56px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Payment
      </button>

      {show && (
        <div 
          className="slate-modal-overlay"
          onClick={handleClose}
        >
          <div 
            className="slate-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: '#f0f4f7',
                padding: '20px 18px',
                borderBottom: '1px solid rgba(169, 180, 185, 0.20)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: '#565e74',
                      color: '#f7f7ff',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      borderRadius: '2px',
                      marginBottom: '12px',
                    }}
                  >
                    Transaction: Checkout
                  </span>
                  <h1 style={{ margin: '0 0 2px', fontSize: '26px', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.04em', color: '#2a3439' }}>
                    Complete Payment
                  </h1>
                  <p style={{ margin: 0, color: '#717c82', fontWeight: 500, fontSize: '14px', letterSpacing: '0.03em' }}>
                    Order ID: <span style={{ color: '#2a3439', fontWeight: 700 }}>{billNumber}</span>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="slate-modal-close"
                    aria-label="Close payment modal"
                    onClick={handleClose}
                    style={{
                      background: '#ffffff',
                      border: 'none',
                      width: '36px',
                      height: '36px',
                      borderRadius: '4px',
                      color: '#565e74',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="slate-modal-body">
              {errorMessage && (
                <div className="slate-modal-alert">
                  {errorMessage}
                </div>
              )}

              <div className="payment-layout">
                {/* Left column - Payment methods */}
                <div className="payment-layout-left">
                  <div className="payment-section">
                    <h5 className="payment-section-title">Payment Method</h5>
                    <div className="payment-method-options">
                      <label className={`meth-opt ${paymentMethod === 'cash' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Cash Payment</span>
                      </label>
                      <label className={`meth-opt ${paymentMethod === 'card' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Card/Debit</span>
                      </label>
                      <label className={`meth-opt ${paymentMethod === 'loan' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="loan"
                          checked={paymentMethod === 'loan'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Loan Payment</span>
                      </label>
                    </div>

                    {/* Dynamic Input Sections */}
                    <div className="payment-dynamic-area">
                      {paymentMethod === 'cash' && (
                        <div className="payment-input-group">
                          <label className="slate-field-label">Cash Received</label>
                          <input
                            type="number"
                            className={`slate-modal-input ${validationErrors.cashReceived ? 'invalid' : ''}`}
                            placeholder="0.00"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                          />
                          {validationErrors.cashReceived && <span className="slate-error-text">{validationErrors.cashReceived}</span>}
                          
                          <label className="slate-field-label mt-3">Remaining Change</label>
                          <div className="slate-readonly-value">
                            {currencySymbol}
                            {(cashReceived && !isNaN(cashReceived) && Number(cashReceived) > 0
                              ? Math.max(0, (Number(cashReceived) - endPayment)).toFixed(2)
                              : '0.00')}
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div className="payment-input-group">
                          <label className="slate-field-label">Card Number</label>
                          <input
                            type="text"
                            className={`slate-modal-input ${validationErrors.cardNumber ? 'invalid' : ''}`}
                            placeholder="xxxx-xxxx-xxxx-xxxx"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                          />
                          {validationErrors.cardNumber && <span className="slate-error-text">{validationErrors.cardNumber}</span>}
                          
                          <div className="slate-grid-row">
                            <div>
                              <label className="slate-field-label">Expiry</label>
                              <input type="text" className="slate-modal-input" placeholder="MM/YY" />
                            </div>
                            <div>
                              <label className="slate-field-label">CVV</label>
                              <input type="text" className="slate-modal-input" placeholder="***" />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'loan' && (
                        <div className="payment-input-group">
                          <label className="slate-field-label">Loan Number / ID</label>
                          <input
                            type="text"
                            className={`slate-modal-input ${validationErrors.loanNumber ? 'invalid' : ''}`}
                            placeholder="LN-XXXXXX"
                            value={loanNumber}
                            onChange={(e) => setLoanNumber(e.target.value)}
                          />
                          {validationErrors.loanNumber && <span className="slate-error-text">{validationErrors.loanNumber}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right column - Summary */}
                <div className="payment-layout-right">
                  <div className="payment-summary-card">
                    <h5 className="payment-section-title">Order Overview</h5>
                    <div className="summary-list">
                      <div className="summary-row">
                        <span>Items Count</span>
                        <span>{totalQuantity}</span>
                      </div>
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{currencySymbol}{totalPayable.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Tax (10%)</span>
                        <span>{currencySymbol}{(GST * totalPayable).toFixed(2)}</span>
                      </div>
                      <div className="summary-divider" />
                      <div className="summary-row total">
                        <span>Total Due</span>
                        <span>{currencySymbol}{endPayment.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 22px', background: '#f0f4f7', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="slate-modal-cancel"
                onClick={handleClose}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#566166',
                  padding: '14px 24px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease, background-color 0.2s ease',
                  outline: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#9f403d'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#566166'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="slate-modal-complete"
                onClick={handleTransaction}
                disabled={
                  (paymentMethod === 'cash' && (!cashReceived || Number(cashReceived) < endPayment)) ||
                  (paymentMethod === 'card' && (!cardNumber || cardNumber.length < 13)) ||
                  (paymentMethod === 'loan' && !loanNumber)
                }
                style={{
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 30px',
                  background: '#565e74',
                  color: '#f7f7ff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.02em',
                  cursor: (paymentMethod === 'cash' && (!cashReceived || Number(cashReceived) < endPayment)) ||
                          (paymentMethod === 'card' && (!cardNumber || cardNumber.length < 13)) ||
                          (paymentMethod === 'loan' && !loanNumber) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 20px -10px rgba(86, 94, 116, 0.45)',
                  opacity: (paymentMethod === 'cash' && (!cashReceived || Number(cashReceived) < endPayment)) ||
                           (paymentMethod === 'card' && (!cardNumber || cardNumber.length < 13)) ||
                           (paymentMethod === 'loan' && !loanNumber) ? 0.5 : 1,
                  textAlign: 'center'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                COMPLETE PAYMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PayButton;