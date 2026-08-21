const settingsRepository = require('./settings.repository');

async function getAll() {
  return settingsRepository.findAll();
}

async function get(key) {
  return settingsRepository.findByKey(key);
}

async function update(key, value, type) {
  if (!key) {
    throw new Error('La clave es requerida');
  }
  return settingsRepository.upsert(key, value, type || 'string');
}

module.exports = {
  getAll,
  get,
  update,
};
