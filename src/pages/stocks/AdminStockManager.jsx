import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../utils/Axios';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Save } from 'lucide-react';

const LOW_STOCK_LIMIT = 5;

const AdminStockManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [stockMap, setStockMap] = useState({});

  /* ================= FETCH LOW STOCK PRODUCTS ================= */
  const fetchLowStockProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.post('/admin/low-stock-products', {});
      const list = res.data.lowStockProducts || [];

      setProducts(list);

      // build local stock state
      const map = {};
      list.forEach(p =>
        p.variants.forEach(v => {
          map[`${p.productId}-${v.size}`] = v.stockQty;
        })
      );
      setStockMap(map);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch low stock products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStockProducts();
  }, [fetchLowStockProducts]);

  /* ================= UPDATE STOCK ================= */
  const updateStock = async (productId, size, qty) => {
    if (qty < 0) return toast.error('Stock cannot be negative');

    const key = `${productId}-${size}`;
    setSavingKey(key);

    try {
      await axios.post('/admin/low-stock-products', {
        updates: [{ productId, variantSize: size, newStockQty: qty }]
      });

      toast.success('Stock updated');
      fetchLowStockProducts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update stock');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md border">
      <h4 className="text-xl sm:text-2xl font-semibold mb-6">
        🚨 Low Stock Alerts
      </h4>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading low stock products...
        </div>
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto border rounded-xl">
            <table className="min-w-full bg-white">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-6">
                      All stocks are healthy 🎉
                    </td>
                  </tr>
                )}

                {products.map(product =>
                  product.variants.map(variant => {
                    const key = `${product.productId}-${variant.size}`;
                    const qty = stockMap[key];
                    const isCritical = qty === 0;

                    return (
                      <tr key={key} className={isCritical ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 font-medium">
                          {product.name}
                        </td>
                        <td className="px-6 py-4">{variant.size}</td>
                        <td className="px-6 py-4">₹{variant.price}</td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) =>
                                setStockMap(prev => ({
                                  ...prev,
                                  [key]: Number(e.target.value)
                                }))
                              }
                              onBlur={() =>
                                updateStock(
                                  product.productId,
                                  variant.size,
                                  qty
                                )
                              }
                              className={`w-20 p-2 border rounded-md ${
                                isCritical
                                  ? 'border-red-400'
                                  : 'border-orange-400'
                              }`}
                            />
                            {qty <= LOW_STOCK_LIMIT && (
                              <AlertTriangle
                                size={18}
                                className="text-red-500"
                              />
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            disabled={savingKey === key}
                            onClick={() =>
                              updateStock(
                                product.productId,
                                variant.size,
                                qty + 5
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                          >
                            <Save size={16} />
                            Restock +5
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE VIEW ================= */}
          <div className="md:hidden space-y-4">
            {products.map(product =>
              product.variants.map(variant => {
                const key = `${product.productId}-${variant.size}`;
                const qty = stockMap[key];

                return (
                  <div key={key} className="border rounded-lg p-4 bg-red-50">
                    <h5 className="font-semibold">{product.name}</h5>
                    <p className="text-sm">Size: {variant.size}</p>
                    <p className="text-sm">Price: ₹{variant.price}</p>

                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) =>
                        setStockMap(prev => ({
                          ...prev,
                          [key]: Number(e.target.value)
                        }))
                      }
                      onBlur={() =>
                        updateStock(product.productId, variant.size, qty)
                      }
                      className="mt-2 w-full p-2 border rounded"
                    />

                    <button
                      onClick={() =>
                        updateStock(
                          product.productId,
                          variant.size,
                          qty + 5
                        )
                      }
                      className="mt-3 w-full bg-orange-500 text-white py-2 rounded"
                    >
                      Restock +5
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminStockManager;
