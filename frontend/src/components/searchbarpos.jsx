import React, { useState } from "react";


// TODO: Need to implement  backend portion here, 
// i created some frontend code, with this as dummy data. 
// it probably won't run when the backend is implemented


// i made it with assumption that i will get a single json object after searching using product id (id is unique)
const SearchBar = ({ onProductSearch }) => {
    const [input, setInput] = useState("");
    
    // this is the entire database 
    // Hardcoded products data
    const products = [
        {
            id: 1,
            name: "Sweat shirt",
            price: 249.99,
            discount: 0,
            quantity: 1,
            subtotal: 249.99,
        },
        {
            id: 2,
            name: "Red Hoodie",
            price: 329.5,
            discount: 20,
            quantity: 2,
            subtotal: 659.0,
        },
        {
            id: 3,
            name: "Skinny jeans",
            price: 129.99,
            discount: 10,
            quantity: 3,
            subtotal: 389.97,
        },
    ];

    // this is scouring the database to find matching product id
    //  yes i know for loops are bad. it doesnt matter anyway.
    const getProductById = (id) => {
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === Number(id)) {
                return products[i];
            }
        }
        return null; // returns null if no match is found
    };

    const handleClick = () => {
        // Find the product
        const product = getProductById(input);
        
        // Call the onProductSearch prop with the found product
        if (onProductSearch) {
            onProductSearch(product);
        }
    };

    return (
        <div className="input-wrapper">
            <input
                placeholder="Scan/Search Product by Code"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            {/* add a search icon button here, install react-icons eventually search button goes left of input field like the Bing search engine*/}
            <button onClick={handleClick}>Search</button>
        </div>
    );
};

export default SearchBar;