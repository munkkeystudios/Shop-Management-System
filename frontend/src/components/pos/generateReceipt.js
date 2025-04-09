// the reciept genertaion function

// receiptGenerator.js
/**
 * Generates a receipt text and triggers download as a .txt file
 * @param {Object} transactionData - Data for the receipt
 */
export const generateReceipt = (transactionData) => {
    // Destructure transaction data with defaults
    const {
      receiptNumber = '12336',
      tokenType = 'Credit',
      customerName = 'Walk in Customer',
      warehouse = 'WH Multan',
      items = [],
      subtotal = 0,
      discount = 0,
      gst = 0,
      total = 0,
      paymentMethod = 'Cash Payment',
      received = 0,
      returned = 0,
      date = new Date()
    } = transactionData;
  
    // Format date
    const formattedDate = date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  
    // Create the receipt header
    let receiptText = `
                        POS
    ${formattedDate}
    
    ------- Receipt# -------
           ${receiptNumber}
    -------------------------
    
    Token Type                ${tokenType}
    Customer Name             ${customerName}
    Warehouse                 ${warehouse}
    
    Item                Price  Qty  Amount
    ----------------------------------------
  `;
  
    // Add items
    items.forEach(item => {
      // Pad strings to create alignment
      const itemName = item.name.padEnd(20, ' ').substring(0, 20);
      const price = item.price.toString().padStart(5, ' ');
      const qty = item.quantity.toString().padStart(3, ' ');
      const amount = item.amount.toString().padStart(7, ' ');
      
      receiptText += `  ${itemName} ${price}  ${qty}  ${amount}\n`;
    });
  
    // Add summary
    receiptText += `
    ----------------------------------------
    Subtotal                         ${subtotal.toString().padStart(7, ' ')}
    Discount                         ${discount.toString().padStart(7, ' ')}
    GST                              ${gst.toString().padStart(7, ' ')}
    
    Total                            ${total.toString().padStart(7, ' ')}
    
    ${paymentMethod}
    
    Received                         ${received.toString().padStart(7, ' ')}
    Total Payable                    ${total.toString().padStart(7, ' ')}
    Returned                         ${returned.toString().padStart(7, ' ')}
    
    Thanks for fueling our passion. Drop by again, if
    your wallet isn't still hurting. You're always
    welcome here!
    
                        POS
  `;
  
    // Create a Blob with the text content
    const blob = new Blob([receiptText], { type: 'text/plain' });
    
    // Create a temporary download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${receiptNumber}_${date.getTime()}.txt`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Example usage:
  /*
  generateReceipt({
    receiptNumber: '12336',
    tokenType: 'Credit',
    customerName: 'Walk in Customer',
    warehouse: 'WH Multan',
    items: [
      { name: 'Baggy Pants Zara Men', price: 1200, quantity: 1, amount: 1200 },
      { name: 'Zara Men', price: 1200, quantity: 1, amount: 1200 },
      { name: 'Zara Baby Suit', price: 1200, quantity: 1, amount: 1200 },
      { name: 'Jacket', price: 400, quantity: 1, amount: 400 }
    ],
    subtotal: 4000,
    discount: 0,
    gst: 2000,
    total: 6000,
    paymentMethod: 'Cash Payment',
    received: 10000,
    returned: 4000
  });
  */