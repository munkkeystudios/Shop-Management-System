import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { HiMiniQrCode } from "react-icons/hi2";
import { productsAPI } from '../../services/api'; // Import productsAPI

const SearchBar = ({ onProductSearch }) => {
    const [input, setInput] = useState("");
    const [searchResults, setSearchResults] = useState([]); // Store search results
    const [error, setError] = useState(null); // Store error messages

    const searchProductsByQuery = async (query) => {
        try {
            const response = await productsAPI.search(query); // Use productsAPI.search
            const products = response.data.data; // Extract product data from response

            if (products.length === 0) {
                setError('No products found!');
                setSearchResults([]);
                return;
            }

            setError(null); // Clear any previous errors
            setSearchResults(products); // Store the search results
        } catch (error) {
            console.error('Error searching products:', error.response?.data?.message || error.message);
            setError('Error searching products. Please try again.');
            setSearchResults([]);
        }
    };

    const handleClick = async () => {
        if (!input) return;

        await searchProductsByQuery(input);
    };

    const handleProductSelect = (product) => {
        const discountRate = product.discountRate || 0;
        const originalPrice = product.price;
        const effectivePrice = originalPrice * (1 - discountRate / 100);

        const formattedProduct = {
            id: product._id,
            name: product.name,
            price: product.price,
            discount: discountRate,
            quantity: 1,
            subtotal: effectivePrice * 1,
            image: product.images.length > 0 ? product.images[0] : 'place-holder'
        };

        onProductSearch(formattedProduct); // Pass the selected product to the parent
        setSearchResults([]); // Clear the search results after selection
        setInput(""); // Clear the input field
    };

    return (
        <div className="search-bar-container">
            <div className="input-wrapper flex items-center justify-center">
                <HiMiniQrCode size={24} />

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
                    placeholder="Scan/Search Product by Name, Barcode, or Description"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                            handleClick();
                        }
                    }}
                />
            </div>

            {error && <div className="error-message">{error}</div>}

            {searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((product) => (
                        <div
                            key={product._id}
                            className="product-item"
                            onClick={() => handleProductSelect(product)}
                            style={{
                                border: '1px solid #ccc',
                                padding: '10px',
                                margin: '5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <strong>{product.name}</strong>
                                <p>{product.description}</p>
                                <p>Price: ${product.price.toFixed(2)}</p>
                            </div>
                            <img
                                src={product.images.length > 0 ? product.images[0] : 'place-holder'}
                                alt={product.name}
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
