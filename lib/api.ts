export const searchPhones = async (query: string) => {
  const res = await fetch('/api/mobileapi/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  return res.json();
};

export const getPhoneDetails = async (id: string) => {
  const res = await fetch(`/api/mobileapi/phone/${id}`);
  return res.json();
};

export const getBrandPhones = async (brand: string) => {
  const res = await fetch(`/api/mobileapi/brand/${brand}`);
  return res.json();
};

export const api = {
  searchPhones,
  getPhoneDetails,
  getBrandPhones,
};

export default api;
