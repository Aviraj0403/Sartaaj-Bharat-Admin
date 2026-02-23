// src/services/ProductApi.js
import Axios from '../utils/Axios';

/* ---------- CREATE ---------- */
export const createProduct = async (formData) => {
  const res = await Axios.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

/* ---------- UPDATE ---------- */
export const updateProduct = async (id, formData) => {
  const res = await Axios.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

/* ---------- DELETE ---------- */
export const deleteProduct = async (id) => {
  const res = await Axios.delete(`/products/${id}`);
  return res.data;
};

/* ---------- SINGLE ---------- */
export const getProduct = async (id) => {
  const res = await Axios.get(`/products/${id}`);
  return res.data;               // { success, data }
};

/* ---------- ADMIN LIST ---------- */
export const getAdminProduct = async (params = {}) => {
  const res = await Axios.get('/products', { params });
  return res.data;               // { success, data, meta }
};

/* ---------- USER LIST (public) ---------- */
export const getAllProduct = async (params = {}) => {
  const res = await Axios.get('/products/getAllProduct', { params });
  return res.data;
};