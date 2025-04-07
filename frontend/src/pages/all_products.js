import React from 'react';
import Sidebar from '../components/sidebar';
import { Card } from 'react-bootstrap';

// To whoever is reading this. i have added starter code that you need to use. (scrum master moment)
// we need to show the Tas, that were was a certain level of agreeement on how to implement the frontend. + we need this for future pages
// besides the card you dont need to use any more bootstrap. https://react-bootstrap.github.io/docs/components/cards
// You can use as much html as u want within the card.


// if you are facing an issue, feel free to text me. i will probably be extremely confused/unhelpful 
// but its free and whats there to loose besides my respect for you. 
// delete this after reading.



const AllProducts = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      
      <Card>
        <Card.Header>
          Card Header
        </Card.Header>  {/* search bar is in the header too,  */}
        
        <Card.Body>
          This is where the table goes
        </Card.Body>
        
        {/* You will need to use bootstrap for pagination but that's it. */}
        <Card.Footer>
          Pagination
        </Card.Footer>
    </Card>
      
      
    </div>
  );
}

export default AllProducts;