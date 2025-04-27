/**
 * Utility functions for handling paths and breadcrumbs
 */

/**
 * Maps route paths to human-readable names
 */
const pathNames = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/all_products': 'All Products',
  '/create_products': 'Create Product',
  '/categories': 'Categories',
  '/brands': 'Brands',
  '/supplier': 'Suppliers',
  '/sales-report': 'Reports',
  '/pos': 'Point of Sale',
  '/sales-parent': 'Sales',
  '/sales': 'All Sales',
  '/create-sale': 'Create Sale',
  '/import-sales': 'Import Sales',
  '/purchases': 'Purchases',
  '/all_purchases': 'All Purchases',
  '/create_purchases': 'Create Purchase',
  '/import_purchases': 'Import Purchase',
  '/employee': 'Employee Management',
  '/employee-management': 'Manage Employees',
  '/all_users': 'Users',
  '/create-user': 'Create User',
  '/loans-parent': 'Loans',
  '/loans': 'All Loans',
  '/create-loans': 'Create Loan',
  '/settings': 'Settings',
  '/settings/user': 'User Settings',
  '/settings/display': 'Display Settings',
  '/settings/general': 'General Settings',
};

/**
 * Maps route paths to their parent paths for breadcrumb generation
 */
const pathHierarchy = {
  '/all_products': '/products',
  '/create_products': '/products',
  '/categories': '/products',
  '/brands': '/products',
  '/supplier': '/purchases',
  /* '/sales-report': '/reports', */
  '/sales': '/sales-parent',
  '/create-sale': '/sales-parent',
  '/import-sales': '/sales-parent',
  '/all_purchases': '/purchases',
  '/create_purchases': '/purchases',
  '/import_purchases': '/purchases',
  '/employee-management': '/employee',
  '/create-user': '/employee',
  '/loans': '/loans-parent',
  '/create-loans': '/loans-parent',
  '/settings/user': '/settings',
  '/settings/display': '/settings',
  '/settings/general': '/settings',
};

/**
 * Generates breadcrumb data for a given path
 * @param {string} currentPath - The current path
 * @returns {Array} - Array of breadcrumb objects with path and label
 */
const getBreadcrumbs = (currentPath) => {
  const breadcrumbs = [];
  let path = currentPath;

  // Special case for reports pages - show only the page name without hierarchy
  if (path === '/reports' || path === '/sales-report') {
    return [{
      path,
      label: pathNames[path],
      isVirtual: false
    }];
  }

  // Add current path
  breadcrumbs.unshift({
    path,
    label: pathNames[path] || path.split('/').pop(),
    isVirtual: !Object.keys(pathHierarchy).includes(path) && path !== '/dashboard' && path !== '/'
  });

  // Add parent paths
  while (pathHierarchy[path]) {
    path = pathHierarchy[path];
    // Check if this is a virtual path (doesn't exist as a real route)
    const isVirtual = path === '/products' || path === '/purchases' || path === '/employee' || path === '/sales-parent' || path === '/loans-parent'; // Virtual paths

    // Map virtual paths to their corresponding real routes
    let realPath = path;
    if (path === '/products') {
      realPath = '/all_products';
    } else if (path === '/purchases') {
      realPath = '/all_purchases';
    } else if (path === '/employee') {
      realPath = '/employee-management';
    } else if (path === '/sales-parent') {
      realPath = '/sales';
    } else if (path === '/loans-parent') {
      realPath = '/loans';
    }

    breadcrumbs.unshift({
      path: isVirtual ? realPath : path,
      label: pathNames[path] || path.split('/').pop(),
      isVirtual
    });
  }

  return breadcrumbs;
};

export { getBreadcrumbs, pathNames };
