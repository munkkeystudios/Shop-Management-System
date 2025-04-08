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

const CreateProducts = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />

    <Card>
      <Card.Header>
        Card Header
      </Card.Header>
      
      <Card.Body>
        This is where all the input forms go
      </Card.Body>
      
    </Card>
    {/* dicard button and submit button are outside of card */}
    </div>
  );
}

export default CreateProducts;