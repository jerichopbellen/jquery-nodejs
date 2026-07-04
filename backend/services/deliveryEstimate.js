function getEstimatedDelivery(shippedDate = new Date()) {
  const delivery = new Date(shippedDate);
  delivery.setDate(delivery.getDate() + 2);
  return delivery.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

module.exports = getEstimatedDelivery;