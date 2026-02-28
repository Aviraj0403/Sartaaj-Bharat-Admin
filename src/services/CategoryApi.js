// src/services/CategoryApi.js
import Axios from '../utils/Axios';

export const createCategory = async (formData) => {
  const res = await Axios.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getAllCategories = async ({ page, limit, search, sortField, sortOrder, type }) => {
  const params = { page, limit, search, sortField, sortOrder };
  if (type) params.type = type;

  const res = await Axios.get('/categories', { params });
  return res.data;
};

export const getCategory = async (id) => {
  const res = await Axios.get(`/categories/${id}`);
  return res.data.data;
};

export const updateCategory = async (id, formData) => {
  const res = await Axios.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await Axios.delete(`/categories/${id}`);
  return res.data;
};

export const getMainCategories = async () => {
  const res = await Axios.get('/categories', { params: { type: 'Main' } });
  return res.data.data;   // array of { _id, name, ... }
};

export const getSubCategories = async (parentCategoryId) => {
  const res = await Axios.get('/categories', { params: { parentId: parentCategoryId } });
  return res.data.data; // returns array of subcategories
};