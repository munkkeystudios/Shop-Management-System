import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { HiMiniQrCode } from "react-icons/hi2";
import { productsAPI } from '../../services/api';

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
        <>
            <style>
                {`
                .search-bar-wrapper {
                  width: 100%;
                  position: relative;
                }
                
                .pos-search-container {
                  position: relative;
                  width: 100%;
                  background-color: #f8f9fa;
                  border: 1px solid #dee2e6;
                  border-radius: 4px;
                  height: 38px;
                  display: flex;
                  align-items: center;
                }
                
                .pos-search-qr-icon {
                  position: absolute;
                  left: 12px;
                  top: 50%;
                  transform: translateY(-50%);
                  color: #6c757d;
                  font-size: 18px;
                }
                
                .pos-search-icon {
                  position: absolute;
                  left: 40px;
                  top: 50%;
                  transform: translateY(-50%);
                  color: #6c757d;
                  font-size: 18px;
                  cursor: pointer;
                }
                
                .pos-search-input {
                  width: 100%;
                  padding: 8px 16px 8px 70px;
                  border: none;
                  background: none;
                  outline: none;
                  font-size: 14px;
                  color: #212529;
                  height: 100%;
                }
                
                .pos-search-input:focus {
                  border-color: #00a838;
                  box-shadow: 0 0 0 2px rgba(0, 168, 56, 0.25);
                }
                
                .pos-search-input::placeholder {
                  color: #6c757d;
                }
                
                .pos-error-message {
                  background-color: #fee2e2;
                  border-left: 4px solid #ef4444;
                  color: #ef4444;
                  padding: 12px 16px;
                  margin-top: 8px;
                  border-radius: 4px;
                  font-size: 14px;
                  font-weight: 500;
                }
                
                .pos-search-results {
                  position: absolute;
                  top: 100%;
                  left: 0;
                  width: 100%;
                  background-color: white;
                  border-radius: 4px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  margin-top: 4px;
                  max-height: 400px;
                  overflow-y: auto;
                  z-index: 100;
                }
                
                .pos-product-item {
                  padding: 12px;
                  border-bottom: 1px solid #dee2e6;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  transition: background-color 0.2s;
                }
                
                .pos-product-item:last-child {
                  border-bottom: none;
                }
                
                .pos-product-item:hover {
                  background-color: #f8f9fa;
                }
                
                .pos-product-info {
                  flex: 1;
                }
                
                .pos-product-info strong {
                  display: block;
                  font-size: 14px;
                  margin-bottom: 4px;
                  color: #212529;
                }
                
                .pos-product-description {
                  font-size: 12px;
                  color: #6c757d;
                  margin-bottom: 4px;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
                }
                
                .pos-product-price {
                  font-size: 13px;
                  color: #212529;
                  font-weight: 500;
                }
                
                .pos-product-image {
                  width: 50px;
                  height: 50px;
                  object-fit: cover;
                  border-radius: 4px;
                  margin-left: 12px;
                }
                
                @media (max-width: 768px) {
                  .pos-search-container {
                    margin-bottom: 10px;
                  }
                }
                `}
            </style>

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
        </>
    );
};

export default SearchBar;
