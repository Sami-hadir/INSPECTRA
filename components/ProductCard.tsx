
import React from 'react';
import type { Product } from '../types';
import { WarningIcon } from './icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const cardClasses = product.hasWarning
    ? 'bg-red-900/50 border-red-500'
    : 'bg-gray-800 border-gray-700';
  
  const headerClasses = product.hasWarning
    ? 'text-red-300'
    : 'text-cyan-400';

  return (
    <div className={`border rounded-lg p-4 shadow-lg transition-transform hover:scale-105 ${cardClasses}`}>
      <h3 className={`text-xl font-bold mb-2 ${headerClasses}`}>{product.name}</h3>
      <p className="text-gray-300 mb-4">{product.description}</p>
      {product.hasWarning && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-md p-3">
          <div className="flex items-start">
            <WarningIcon className="h-6 w-6 mr-3 flex-shrink-0 text-red-400" />
            <div>
              <h4 className="font-semibold">אזהרה זוהתה</h4>
              <p className="text-sm">{product.warningDetails}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
