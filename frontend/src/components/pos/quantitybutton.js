import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoChevronDown,IoChevronUp  } from "react-icons/io5";

export default function QuantityButton() {
  const [count, setCount] = useState(1);

  const increment = () => {
    setCount(prev => prev + 1);
  };

  const decrement = () => {
    setCount(prev => Math.max(1, prev - 1));
  };

  // Format the count to always have 2 digits
  const formattedCount = count.toString().padStart(2, '0');

  return (
    <div className="d-flex justify-content-center align-items-center p-4">
      <Card style={{ width: '180px', border: '1px solid #dee2e6', borderRadius: '0.5rem' }}>
        <Card.Body className="p-0">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1 ps-4 py-2">
              <span style={{ fontSize: '1.25rem', color: '#212529', fontWeight: '400' }}>
                {formattedCount}
              </span>
            </div>
            <div className="d-flex flex-column">
              <Button 
                variant="link" 
                className="p-1 m-0 border-0"
                onClick={increment}
                style={{ color: '#6c757d' }}
              >
                {/* Replace with your up arrow icon */}
                <IoChevronUp />
                {/* <span className="up-arrow">▲</span> */}
              </Button>
              <Button 
                variant="link" 
                className="p-1 m-0 border-0"
                onClick={decrement}
                style={{ color: '#6c757d' }}
              >
                {/* Replace with your down arrow icon */}
                <IoChevronDown />
                {/* <span className="down-arrow">▼</span> */}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}