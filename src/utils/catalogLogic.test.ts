import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPKR,
  calculateDiscountPercent,
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  filterAndSortProducts,
  validateInquiryForm,
} from './catalogLogic';
import { INITIAL_PRODUCTS, PRODUCT_CATEGORIES } from '../data/productsData';

test('formatPKR formats Pakistani Rupees with commas accurately', () => {
  assert.equal(formatPKR(8500), 'PKR 8,500');
  assert.equal(formatPKR(15000), 'PKR 15,000');
  assert.equal(formatPKR(4500), 'PKR 4,500');
  assert.equal(formatPKR(-10), 'PKR 0');
});

test('calculateDiscountPercent computes accurate percentage savings', () => {
  assert.equal(calculateDiscountPercent(8500, 10000), 15);
  assert.equal(calculateDiscountPercent(15000, 15000), 0);
  assert.equal(calculateDiscountPercent(15000, undefined), 0);
});

test('buildWhatsAppOrderMessage generates exact required Pakistani greeting and PKR price', () => {
  const msg = buildWhatsAppOrderMessage('Modern Ceiling Fanus', 8500);
  assert.equal(
    msg,
    'Assalam o Alaikum, I am interested in Modern Ceiling Fanus. Price: PKR 8,500. Please provide availability and details.',
  );
  const url = buildWhatsAppUrl('+92 300 8459210', msg);
  assert.ok(url.startsWith('https://wa.me/923008459210?text='));
  assert.ok(url.includes('Modern%20Ceiling%20Fanus'));
});

test('filterAndSortProducts filters by category shorthand, price range, and search query', () => {
  // Shorthand filter 'Crystal' should match 'Crystal Lights'
  const crystalOnly = filterAndSortProducts(
    INITIAL_PRODUCTS,
    {
      searchQuery: '',
      category: 'Crystal',
      minPrice: 0,
      maxPrice: 100000,
      sortBy: 'featured',
      specialTab: 'all',
    },
    PRODUCT_CATEGORIES,
  );
  assert.ok(crystalOnly.length >= 2);
  assert.ok(crystalOnly.every((p) => p.category === 'Crystal Lights'));

  // Price filter under PKR 9,000
  const budgetFriendly = filterAndSortProducts(
    INITIAL_PRODUCTS,
    {
      searchQuery: '',
      category: 'All',
      minPrice: 0,
      maxPrice: 9000,
      sortBy: 'price-asc',
      specialTab: 'all',
    },
    PRODUCT_CATEGORIES,
  );
  assert.ok(budgetFriendly.length >= 4);
  assert.ok(budgetFriendly.every((p) => p.price <= 9000));
  for (let i = 1; i < budgetFriendly.length; i++) {
    assert.ok(budgetFriendly[i].price >= budgetFriendly[i - 1].price);
  }
});

test('validateInquiryForm enforces required customer contact fields', () => {
  assert.equal(
    validateInquiryForm({ name: '', phone: '03001234567', subject: 'Ceiling Fanus', message: 'Need price' }).valid,
    false,
  );
  assert.equal(
    validateInquiryForm({
      name: 'Tariq Mahmood',
      phone: '0300 8459210',
      subject: 'Luxury Crystal Fanus',
      message: 'Please confirm delivery time to Islamabad.',
    }).valid,
    true,
  );
});
