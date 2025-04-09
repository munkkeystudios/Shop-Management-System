import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { HiMiniQrCode } from "react-icons/hi2";

// TODO: Need to implement  backend portion here, 
// i created some frontend code, with this as dummy data. 
// it probably won't work when the backend is implemented


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
            image: "place-holder"
        },
        {
            id: 2,
            name: "Red Hoodie",
            price: 329.5,
            discount: 20,
            quantity: 1,
            subtotal: 659.0,
            image: "place-holder"
        },
        {
            id: 3,
            name: "Skinny jeans",
            price: 129.99,
            discount: 10,
            quantity: 1,
            subtotal: 389.97,
            image: "place-holder"
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

        // clear out the input form
        setInput('');
    };

    return (
        
        <div className="input-wrapper flex items-center justify-center" >
            <HiMiniQrCode size={24}/>

            <IoIosSearch 
                onClick={handleClick}
                size={24}
            />
            <input
                style={{
                    width: '90%',
                    height: '24px',      
                    fontSize: '1rem',    
                    padding: '1rem',    
                    borderRadius: '2px',
                }}
            placeholder="Scan/Search Product by Code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                    handleClick();
                }
            }
            }
            />

        </div>
    );
};

export default SearchBar;