import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { HiMiniQrCode } from "react-icons/hi2";
import { productsAPI } from '../../services/api';
import '../styles/searchbarpos.css';

const SearchBar = ({ onProductSearch }) => {
    const [input, setInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);

    const searchProductsByQuery = async (query) => {
        try {
            const response = await productsAPI.search(query);
            const products = response.data.data;

            if (products.length === 0) {
                setError('No products found!');
                setSearchResults([]);
                return;
            }

            setError(null);
            setSearchResults(products);
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
            image: product.images && product.images.length > 0 
                ? product.images[0] 
                : '/images/default-product-image.jpg'
        };

        onProductSearch(formattedProduct);
        setSearchResults([]);
        setInput("");
    };

    return (
        <div className="search-bar-wrapper">
            <div className="pos-search-container">
                <HiMiniQrCode className="pos-search-qr-icon" />
                <IoIosSearch className="pos-search-icon" onClick={handleClick} />
                <input
                    type="text"
                    placeholder="Scan/Search Product by Name, Barcode, or Description"
                    className="pos-search-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                            handleClick();
                        }
                    }}
                />
            </div>

            {error && <div className="pos-error-message">{error}</div>}

            {searchResults.length > 0 && (
                <div className="pos-search-results">
                    {searchResults.map((product) => (
                        <div
                            key={product._id}
                            className="pos-product-item"
                            onClick={() => handleProductSelect(product)}
                        >
                            <div className="pos-product-info">
                                <strong>{product.name}</strong>
                                <p className="pos-product-description">{product.description}</p>
                                <p className="pos-product-price">Price: ${product.price.toFixed(2)}</p>
                            </div>
                            <img
                                src={product.images && product.images.length > 0 
                                    ? product.images[0] 
                                    : '/images/default-product-image.jpg'}
                                alt={product.name}
                                className="pos-product-image"
                                onError={(e) => {
                                    e.target.src = '/images/default-product-image.jpg';
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
