import React from 'react';
import ParentSKUSection from './ParentSKUSection';
import './BrandCard.css';


function BrandCard({ brand, skus }) {
    return (
        <div className="brand-card">
            <h2>{brand}</h2>
            {Object.entries(skus).map(([sku, vintages]) => (
                <ParentSKUSection key={sku} sku={sku} vintages={vintages} />
            ))}
        </div>
    );
}

export default BrandCard;
