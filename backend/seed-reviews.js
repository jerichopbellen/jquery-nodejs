require('dotenv').config();
const { sequelize, Order, OrderItem, Review } = require('./models');

const sampleComments = [
  'Great product, exactly as described!',
  'Really happy with this purchase, would buy again.',
  'Good quality for the price.',
  'Works perfectly, no complaints.',
  'Satisfied customer, fast delivery too.',
  'Exceeded my expectations!',
  'Solid build quality, worth every peso.',
  null // some reviews with no comment, just a rating
];

function randomRating() {
  return Math.floor(Math.random() * 3) + 3; // random rating 3-5
}

function randomComment() {
  return sampleComments[Math.floor(Math.random() * sampleComments.length)];
}

async function seedReviews() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Get distinct (user_id, item_id) pairs from delivered orders
    const deliveredOrders = await Order.findAll({
      where: { status: 'delivered' },
      include: [{ model: OrderItem, as: 'items', attributes: ['item_id'] }]
    });

    const pairs = new Map(); // key: `${user_id}-${item_id}` -> { user_id, item_id }

    deliveredOrders.forEach((order) => {
      order.items.forEach((line) => {
        const key = `${order.user_id}-${line.item_id}`;
        if (!pairs.has(key)) {
          pairs.set(key, { user_id: order.user_id, item_id: line.item_id });
        }
      });
    });

    if (pairs.size === 0) {
      console.log('No delivered order items found — nothing to seed. Make sure you have at least one order with status "delivered".');
      process.exit(0);
    }

    let created = 0;
    let skipped = 0;

    for (const { user_id, item_id } of pairs.values()) {
      const existing = await Review.findOne({ where: { user_id, item_id } });
      if (existing) {
        skipped++;
        continue;
      }

      await Review.create({
        user_id,
        item_id,
        rating: randomRating(),
        comment: randomComment()
      });
      created++;
    }

    console.log(`Done. Created ${created} fake reviews, skipped ${skipped} (already existed).`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seedReviews();