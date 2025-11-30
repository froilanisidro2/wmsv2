// API functions for config tables


const apiKey = process.env.NEXT_PUBLIC_X_API_KEY || '';

/**
 * Fetches config/master data from a given endpoint using the API key.
 * @param url - The endpoint URL from .env.local
 */
export async function fetchConfigData(url: string) {
  if (!url) throw new Error('API URL is not defined');
  const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
  if (!res.ok) throw new Error(`Failed to fetch: ${url} (${res.status})`);
  return res.json();
}

// Specific functions for each config/master table
export async function getVendors() {
  return fetchConfigData(process.env.NEXT_PUBLIC_URL_VENDORS!);
}
export async function getCustomers() {
  return fetchConfigData("http://47.128.154.44:8030/customers");
}
export async function getItems() {
  return fetchConfigData("http://47.128.154.44:8030/items");
}
export async function getWarehouses() {
  return fetchConfigData("http://47.128.154.44:8030/warehouses");
}
export async function getLocations() {
  return fetchConfigData("http://47.128.154.44:8030/locations");
}
export async function getCompanies() {
  return fetchConfigData(process.env.NEXT_PUBLIC_URL_COMPANIES!);
}
