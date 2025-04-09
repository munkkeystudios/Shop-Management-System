import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { HiMiniQrCode } from "react-icons/hi2";
import axios from 'axios';

const SearchBar = ({ onProductSearch }) => {
    const [input, setInput] = useState("");

    const fetchById = async (id) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await axios.get(`/api/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const product = response.data.data;

            const formattedProduct = {
                id: product._id,
                name: product.name,
                price: product.price,
                discount: 0,
                quantity: 1,
                subtotal: product.price * 1,
                image: product.images.length > 0 ? product.images[0] : 'place-holder'
            };

            return formattedProduct;

        } catch (error) {
            console.error('Error fetching product:', error.response?.data?.message || error.message);
            return null;
        }
    };

    const handleClick = async () => {
        if (!input) return;

        const product = await fetchById(input);

        if (!product) {
            alert('Product not found!');
            return;
        }

        onProductSearch(product);
    };

    return (

        <div className="input-wrapper flex items-center justify-center" >
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
                placeholder="Scan/Search Product by Code. type entire productid from db"
                type="text"
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
