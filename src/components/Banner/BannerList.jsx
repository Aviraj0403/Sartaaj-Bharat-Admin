import React from 'react';
import BannerCard from './BannerCard';

const BannerList = ({ 
  banners, 
  loading, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onRefresh, 
  onCreateNew 
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-medium text-gray-500">
        ⏳ Loading banners...
      </div>
    );
  }

  // Ensure banners is always an array
  const safeBanners = Array.isArray(banners) ? banners : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🎨 Promo Banners
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow-md hover:scale-105 transform transition-all duration-200 font-medium"
          >
            🔄 Refresh
          </button>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200 font-medium"
          >
            ➕ Create Banner
          </button>
        </div>
      </div>

      {/* Empty State */}
      {safeBanners.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Banners Yet</h3>
          <p className="text-gray-500 mb-6">Create your first promotional banner to get started</p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200 font-medium"
          >
            ➕ Create Your First Banner
          </button>
        </div>
      )}

      {/* Desktop View */}
      {safeBanners.length > 0 && (
        <div className="hidden lg:grid gap-6">
          {safeBanners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              isMobile={false}
            />
          ))}
        </div>
      )}

      {/* Mobile View */}
      {safeBanners.length > 0 && (
        <div className="lg:hidden space-y-5">
          {safeBanners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              isMobile={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerList;