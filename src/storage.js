export const STORAGE_KEYS = {
  haircuts: 'barberia:haircuts',
  selectedBarber: 'barberia:selectedBarber',
  productSales: 'barberia:products',
  initialBalance: 'barberia:initialBalance',
  cashFund: 'barberia:cashFund',
  expenses: 'barberia:expenses',
  nextOpeningBalance: 'barberia:nextOpeningBalance',
  productsCatalog: 'barberia:productsCatalog',
  adminSection: 'barberia:adminSection',
};

export function load(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch (_) {
    return defaultValue;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    return;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {
    return;
  }
}
