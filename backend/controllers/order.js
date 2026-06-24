const connection = require('../config/database');
const sendEmail = require('../utils/sendEmail');

exports.createOrder = (req, res) => {
  const { cart } = req.body;
  const userId = req.user?.id;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const dateOrdered = new Date();
  const dateShipped = new Date();

  connection.beginTransaction((trxErr) => {
    if (trxErr) return res.status(500).json({ success: false, message: trxErr.message });

    const customerSql = `
      SELECT c.customer_id, u.email
      FROM customer c
      INNER JOIN users u ON u.id = c.user_id
      WHERE u.id = ?
      LIMIT 1
    `;

    connection.execute(customerSql, [userId], (err, rows) => {
      if (err || !rows.length) {
        return connection.rollback(() => res.status(400).json({ success: false, message: 'Complete profile first before checkout' }));
      }

      const { customer_id, email } = rows[0];
      const orderInfoSql = 'INSERT INTO orderinfo (customer_id, date_placed, date_shipped, shipping) VALUES (?, ?, ?, ?)';

      connection.execute(orderInfoSql, [customer_id, dateOrdered, dateShipped, 100], (oiErr, oiRes) => {
        if (oiErr) return connection.rollback(() => res.status(500).json({ success: false, message: oiErr.message }));

        const orderinfoId = oiRes.insertId;
        const lineSql = 'INSERT INTO orderline (orderinfo_id, item_id, quantity) VALUES (?, ?, ?)';

        let done = 0;
        let failed = false;

        cart.forEach((x) => {
          connection.execute(lineSql, [orderinfoId, x.item_id, x.quantity], (lineErr) => {
            if (failed) return;
            if (lineErr) {
              failed = true;
              return connection.rollback(() => res.status(500).json({ success: false, message: lineErr.message }));
            }

            done += 1;
            if (done === cart.length) {
              connection.commit(async (cErr) => {
                if (cErr) return connection.rollback(() => res.status(500).json({ success: false, message: cErr.message }));

                try {
                  await sendEmail({ email, subject: 'Order Success', message: 'Your order is being processed.' });
                } catch (_) {}

                return res.status(201).json({ success: true, message: 'Transaction complete', order_id: orderinfoId });
              });
            }
          });
        });
      });
    });
  });
};