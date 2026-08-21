const reportsRepository = require('./reports.repository');

async function getSales(filters = {}) {
  return reportsRepository.getSalesReport(filters);
}

async function getInventoryStatus() {
  return reportsRepository.getInventoryReport();
}

async function getTopSelling(limit = 10) {
  return reportsRepository.getTopProducts(limit);
}

module.exports = {
  getSales,
  getInventoryStatus,
  getTopSelling,
};
