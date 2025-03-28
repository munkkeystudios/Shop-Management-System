import React from "react";
import { useState } from "react";

// passing as prop from pos.js, to store the data in pos.js

const SearchBar = () => {
    const [input, setinput] = useState("")

    // backend not implemented so cant call an API,
    // hence use of dummy data, 
    const fetchData = (value) => {
        // fetch.('url').response.then()......json() basically you get a json object of size 1
        
        // hardcoded values. in this case im searching through this data and picking 1.
        const [products] = [
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

        // Function to get product by ID, 

        const getProductById = (id) => {
            
            for (let i = 0; i < products.length; i++) {
                
                if (products[i].id === id) {
                    return products[i]; 
                }
            }
            return null; // returns null if no match is found
        };

        // Fetch product with ID 
        const product = getProductById(Number(value));

        return (
            <div>
                <h2> JSON OBJECT</h2>
                <pre>{JSON.stringify(product, null, 2)}</pre>
            </div>
        );
    };

    const handleClick = (input) => {
        fetchData(input);
    }

    return (
            <div className = "input Wrapper" >
                
                <input 
                placeholder="Scan/Search Product by Code"
                value={input}
                
                onChange={(e) => setinput(e.target.value)}
                /> {/* sets e input variable to the target value ie stores the input */}
                    
                {/* plug search icon here */}
                <button onClick={handleClick(input)}>Search</button>
            </div >
    );

};

export default SearchBar;