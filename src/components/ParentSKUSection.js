import React from 'react';
import Timeline from './Timeline';
import './ParentSKUSection.css';

function ParentSKUSection({ sku, vintages }) {
    return (
        <div className="sku-section">
            <h3>{sku}</h3>
            <div className="timeline-container">
                <Timeline vintages={vintages} />
            </div>
        </div>
    );
}

export default ParentSKUSection;