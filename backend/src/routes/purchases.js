// const express = require('express');
// const router = express.Router();
// const db = require('../db'); // replace with your actual DB connection

// // POST: Create Purchase
// router.post('/', async (req, res) => {
//   const { supplierId, notes, items } = req.body;

//   try {
//     const result = await db.query(
//       `INSERT INTO purchases (supplier_id, notes, created_at) VALUES (?, ?, NOW())`,
//       [supplierId, notes]
//     );
//     const purchaseId = result.insertId;

//     for (let item of items) {
//       await db.query(
//         `INSERT INTO purchase_items (purchase_id, product_id, quantity, cost_price) VALUES (?, ?, ?, ?)`,
//         [purchaseId, item.productId, item.quantity, item.costPrice]
//       );

//       await db.query(
//         `UPDATE products SET quantity = quantity + ? WHERE id = ?`,
//         [item.quantity, item.productId]
//       );
//     }

//     res.status(200).json({ message: 'Purchase saved' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// });

// module.exports = router;
