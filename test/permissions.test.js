import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission, canAdminTable, requirePermission } from '../server/middleware/auth.js';
import { sanitizePermissions, PERMISSIONS, TABLE_PERMISSION } from '../server/config/permissions.js';
import { getReadScope, getWriteScope, preparePayload } from '../server/services/dbService.js';

const admin = { sub: 'admin_1', role: 'admin' };
const customer = { sub: 'cust_1', role: 'customer' };
const staffWith = (...permissions) => ({ sub: 'staff_1', role: 'staff', permissions });

const statusOf = async (action) => {
  try {
    await action();
    return 'allowed';
  } catch (error) {
    return error.status;
  }
};

describe('staff permissions', () => {
  it('gives the super admin every permission', () => {
    for (const permission of PERMISSIONS) {
      assert.equal(hasPermission(admin, permission), true, permission);
    }
  });

  it('gives staff only the permissions they were granted', () => {
    const inventoryStaff = staffWith('inventory');

    assert.equal(hasPermission(inventoryStaff, 'inventory'), true);
    assert.equal(hasPermission(inventoryStaff, 'sell_pricing'), false);
    assert.equal(hasPermission(inventoryStaff, 'orders'), false);
  });

  it('ignores a permissions list on a non-staff account', () => {
    const sneakyCustomer = { sub: 'cust_2', role: 'customer', permissions: ['orders', 'inventory'] };

    assert.equal(hasPermission(sneakyCustomer, 'orders'), false);
  });

  it('rejects a staff member without the permission with 403, and a guest with 401', async () => {
    assert.equal(await statusOf(() => requirePermission(staffWith('inventory'), 'sell_pricing')), 403);
    assert.equal(await statusOf(() => requirePermission(null, 'sell_pricing')), 401);
    assert.equal(await statusOf(() => requirePermission(staffWith('sell_pricing'), 'sell_pricing')), 'allowed');
  });

  it('never lets staff manage user accounts, whatever permissions they hold', async () => {
    const everything = staffWith(...PERMISSIONS);

    assert.equal(canAdminTable(everything, 'profiles'), false);
    assert.equal(canAdminTable(admin, 'profiles'), true);
    const scope = await getWriteScope('profiles', everything, []);
    assert.notDeepEqual(scope, {}, 'staff must be limited to their own profile');
  });

  it('drops unknown permission keys and duplicates', () => {
    assert.deepEqual(sanitizePermissions(['inventory', 'root', 'inventory', 'orders']), ['orders', 'inventory']);
    assert.deepEqual(sanitizePermissions('inventory'), []);
    assert.deepEqual(sanitizePermissions(undefined), []);
  });

  it('maps every table permission to a known permission key', () => {
    for (const [table, permission] of Object.entries(TABLE_PERMISSION)) {
      assert.ok(PERMISSIONS.includes(permission), `${table} -> ${permission}`);
    }
  });
});

describe('table access by permission', () => {
  it('lets inventory staff see and edit all products but not orders', async () => {
    const inventoryStaff = staffWith('inventory');

    assert.deepEqual(await getReadScope('products', inventoryStaff, [], '*'), {});
    assert.deepEqual(await getWriteScope('products', inventoryStaff, []), {});
    assert.deepEqual(await getWriteScope('spare_parts', inventoryStaff, []), {});

    const orderScope = await getReadScope('orders', inventoryStaff, [], '*');
    assert.notDeepEqual(orderScope, {}, 'orders must stay limited to their own');
  });

  it('lets order staff manage all orders but not products or prices', async () => {
    const orderStaff = staffWith('orders');

    assert.deepEqual(await getReadScope('orders', orderStaff, [], '*'), {});
    assert.deepEqual(await getWriteScope('orders', orderStaff, []), {});
    assert.equal(await statusOf(() => getWriteScope('products', orderStaff, [])), 403);
    assert.equal(await statusOf(() => getWriteScope('sell_price_configs', orderStaff, [])), 403);
  });

  it('lets sell-pricing staff edit sell prices but not repair prices', async () => {
    const pricingStaff = staffWith('sell_pricing');

    assert.deepEqual(await getWriteScope('sell_price_configs', pricingStaff, []), {});
    assert.deepEqual(await getWriteScope('master_phones', pricingStaff, []), {});
    assert.equal(await statusOf(() => getWriteScope('repair_price_configs', pricingStaff, [])), 403);
    assert.equal(await statusOf(() => preparePayload('repair_price_configs', 'insert', { brand: 'Apple' }, pricingStaff)), 403);
  });

  it('blocks staff with no permissions from every admin table', async () => {
    const noAccess = staffWith();

    for (const table of ['products', 'sell_price_configs', 'repair_price_configs', 'delivery_agents', 'banners', 'reviews', 'vendor_ledgers']) {
      assert.equal(await statusOf(() => getWriteScope(table, noAccess, [])), 403, table);
    }
  });

  it('keeps customers limited to their own orders', async () => {
    assert.notDeepEqual(await getReadScope('orders', customer, [], '*'), {});
    assert.equal(await statusOf(() => getWriteScope('banners', customer, [])), 403);
  });
});

describe('profile updates by the super admin', () => {
  it('keeps only valid permissions when a user is made staff', () => {
    const payload = preparePayload('profiles', 'update', { role: 'staff', permissions: ['inventory', 'hack'] }, admin);

    assert.deepEqual(payload.permissions, ['inventory']);
  });

  it('clears permissions when a user is moved off the staff role', () => {
    const payload = preparePayload('profiles', 'update', { role: 'customer', permissions: ['inventory'] }, admin);

    assert.deepEqual(payload.permissions, []);
  });

  it('does not let staff or customers change roles or permissions', () => {
    for (const actor of [staffWith(...PERMISSIONS), customer]) {
      const payload = preparePayload('profiles', 'update', { role: 'admin', permissions: ['orders'] }, actor);

      assert.equal(payload.role, undefined);
      assert.equal(payload.permissions, undefined);
    }
  });
});
