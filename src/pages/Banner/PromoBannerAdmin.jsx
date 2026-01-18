import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAdminPromoBanners,
  getPromoBanner,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  toggleBannerStatus
} from "../../services/promoBannerApi";

const BannerForm = ({ bannerId, onClose }) => {
  const isEdit = Boolean(bannerId);
  const [form, setForm] = useState({
    title: "",
    description: "",
    bannerImage: null,
    imagePreview: "",
    isActive: true,
    displayOrder: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    setLoading(true);
    getPromoBanner(bannerId)
      .then((promoBanner) => {
        if (promoBanner) {
          setForm({
            title: promoBanner.title || "",
            description: promoBanner.description || "",
            bannerImage: null,
            imagePreview: promoBanner.bannerImage || "",
            isActive: promoBanner.isActive,
            displayOrder: promoBanner.displayOrder || 0
          });
        }
      })
      .catch((err) => toast.error("Failed to load banner"))
      .finally(() => setLoading(false));
  }, [bannerId, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setForm((prev) => ({
        ...prev,
        bannerImage: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isEdit && !form.bannerImage) {
      toast.error("Banner image is required");
      setLoading(false);
      return;
    }

    try {
      const formData = {
        title: form.title,
        description: form.description,
        isActive: form.isActive,
        displayOrder: Number(form.displayOrder)
      };

      if (form.bannerImage) {
        formData.bannerImage = form.bannerImage;
      }

      if (isEdit) {
        await updatePromoBanner(bannerId, formData);
        toast.success("Banner updated successfully");
      } else {
        await createPromoBanner(formData);
        toast.success("Banner created successfully");
      }
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        {isEdit ? "✏️ Edit Banner" : "➕ Create Banner"}
      </h3>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Title</label>
        <input
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Banner title (optional)"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          placeholder="Banner description (optional)"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">
          Banner Image {!isEdit && <span className="text-red-500">*</span>}
        </label>
        
        {form.imagePreview && (
          <div className="mb-3 relative">
            <img
              src={form.imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, bannerImage: null, imagePreview: "" }))}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB. Recommended: 1920x600px</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Display Order</label>
          <input
            name="displayOrder"
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
        </div>

        <div className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <span className="font-medium text-gray-700">Active Banner</span>
          </label>
        </div>
      </div>

      <div className="flex space-x-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Banner"}
        </button>
        <button
          onClick={onClose}
          disabled={loading}
          className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-medium transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const PromoBannerAdmin = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      console.log('Fetching banners...'); // Debug log
      const promoBanners = await getAdminPromoBanners();
      console.log('Received banners:', promoBanners); // Debug log
      
      // Ensure we always have an array
      if (Array.isArray(promoBanners)) {
        setBanners(promoBanners);
        console.log('Set banners state:', promoBanners.length, 'items');
      } else {
        console.warn('API did not return an array:', promoBanners);
        setBanners([]);
      }
    } catch (error) {
      console.error('Error in fetchBanners:', error);
      toast.error("Failed to load banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching banners...');
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deletePromoBanner(id);
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleBannerStatus(id);
      toast.success("Banner status updated");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAddClick = () => {
    setEditBannerId(null);
    setShowForm(true);
  };

  const handleEditClick = (id) => {
    setEditBannerId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditBannerId(null);
    // Refresh banners after form close
    console.log('Form closed, refreshing banners...');
    fetchBanners();
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-medium text-gray-500">
        ⏳ Loading banners...
      </div>
    );
  }

  // Ensure banners is always an array
  const safeBanners = Array.isArray(banners) ? banners : [];
  
  console.log('Current banners state:', safeBanners); // Debug log

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎨 Promo Banners
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchBanners}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow-md hover:scale-105 transform transition-all duration-200 font-medium"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleAddClick}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200 font-medium"
          >
            ➕ Create Banner
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid gap-6">
        {safeBanners.map((banner) => (
          <div
            key={banner._id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <div className="grid grid-cols-3 gap-6 p-6">
              {/* Banner Image */}
              <div className="col-span-1">
                <img
                  src={banner.bannerImage}
                  alt={banner.title || "Banner"}
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>

              {/* Banner Details */}
              <div className="col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {banner.title || "Untitled Banner"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Created by {banner.createdBy?.userName || "Unknown"} • {new Date(banner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        banner.isActive
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {banner.isActive ? "● Active" : "○ Inactive"}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {banner.description || "No description provided"}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <span className="font-semibold mr-1">Display Order:</span>
                      {banner.displayOrder}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => handleToggleStatus(banner._id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      banner.isActive
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                    }`}
                  >
                    {banner.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleEditClick(banner._id)}
                    className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-all duration-200"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all duration-200"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-5">
        {safeBanners.map((banner) => (
          <div
            key={banner._id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <img
              src={banner.bannerImage}
              alt={banner.title || "Banner"}
              className="w-full h-48 object-cover"
            />
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900 text-lg">
                  {banner.title || "Untitled Banner"}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    banner.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {banner.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {banner.description || "No description provided"}
              </p>

              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <p>Order: {banner.displayOrder}</p>
                <p>By {banner.createdBy?.userName || "Unknown"}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleStatus(banner._id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                    banner.isActive
                      ? "bg-gray-100 text-gray-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {banner.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleEditClick(banner._id)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {safeBanners.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Banners Yet</h3>
          <p className="text-gray-500 mb-6">Create your first promotional banner to get started</p>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200 font-medium"
          >
            ➕ Create Your First Banner
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleFormClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl z-10"
            >
              ✕
            </button>
            <BannerForm bannerId={editBannerId} onClose={handleFormClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoBannerAdmin;