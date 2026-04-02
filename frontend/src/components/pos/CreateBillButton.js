import React from 'react';
import { Button } from 'react-bootstrap';

const CreateBillButton = ({ onClick, text = 'Create New Bill' }) => {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      style={{
        backgroundColor: '#6d28d9',
        borderColor: '#6d28d9',
        fontSize: '14px',
        borderRadius: '999px',
        padding: '8px 20px',
      }}
    >
      {text}
    </Button>
  );
};

export default CreateBillButton;
