import React from 'react';

const BannerCard = ({ 
  banner, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isMobile = false
}) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      onDelete(banner._id);
    }
  };

  const handleToggleStatus = () => {
    onToggleStatus(banner._id);
  };

  const handleEdit = () => {
    onEdit(banner._id);
  };

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
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
                onClick={handleToggleStatus}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  banner.isActive
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                }`}
              >
                {banner.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-all duration-200"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all duration-200"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
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
            onClick={handleToggleStatus}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
              banner.isActive
                ? "bg-gray-100 text-gray-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {banner.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={handleEdit}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerCard;