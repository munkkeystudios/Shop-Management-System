import React from 'react';
import Sidebar from '../components/sidebar';
import CustomCard from '../components/ui/CustomCard'; // Import the CustomCard component

const Inventory = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="container" style={{ padding: '20px', flex: 1 }}>
        <h1>Inventory PAGE</h1>
        <p>This is a simple HTML page.</p>

        {/* Add a single CustomCard example */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <CustomCard>
            <CustomCard.Header>Product 1</CustomCard.Header>
            <CustomCard.Body>
              <p>This is a description of Product 1.</p>
              <p>Price: $10.00</p>
            </CustomCard.Body>
            <CustomCard.Footer>Stock: 20</CustomCard.Footer>
          </CustomCard>
        </div>
      </div>
    </div>
  );
};

export default Inventory;