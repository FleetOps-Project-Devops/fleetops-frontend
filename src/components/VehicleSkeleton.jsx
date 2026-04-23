import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="glass-panel" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ height: '200px', width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}></div>
      <div style={{ padding: '1.2rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <div className="skeleton" style={{ height: '24px', width: '80%' }}></div>
        <div className="skeleton" style={{ height: '16px', width: '100%' }}></div>
        <div className="skeleton" style={{ height: '16px', width: '60%' }}></div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ height: '28px', width: '30%' }}></div>
          <div className="skeleton" style={{ height: '36px', width: '40%', borderRadius: '8px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
