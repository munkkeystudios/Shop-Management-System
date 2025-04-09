import React, { useState } from 'react';
import Sidebar from '../components/sidebar';  // Ensure the sidebar import path is correct
import './categories.css';
import { Eye, Trash2, Edit } from 'lucide-react'; // Icons (optional, or use <svg>)

const CategoryPage = () => {
    const categories = [
        { code: 'CA9', name: 'Jeans' },
        { code: 'CA8', name: 'Shirts' },
        { code: 'CA7', name: 'Shorts' },
        { code: 'CA6', name: 'Jacket' },
        { code: 'CA5', name: 'Jacket' },
        { code: 'CA4', name: 'Shirts' },
        { code: 'CA3', name: 'Jacket' },
        { code: 'CA2', name: 'Jacket' },
        { code: 'CA1', name: 'Jacket' },
    ];

    return (
        <div className="category-page">
            <div className="breadcrumb">
                <span>Products</span> &gt; <span className="active">Category</span>
            </div>

            <div className="category-header">
                <h2>Category</h2>
                <input type="text" placeholder="🔍 Search this table" className="search-box" />
            </div>

            <div className="category-table">
                <table>
                    <thead>
                        <tr>
                            <th>Category Code</th>
                            <th>Category Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat, idx) => (
                            <tr key={idx}>
                                <td>{cat.code}</td>
                                <td>{cat.name}</td>
                                <td className="action-icons">
                                    <Eye size={16} />
                                    <Trash2 size={16} />
                                    <Edit size={16} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button>Previous</button>
                <button>Next</button>
                <span>Page 1 of 10</span>
            </div>

            <div className="create-category">
                <button className="create-btn">Create New Category</button>
            </div>
        </div>
    );
};

export default CategoryPage;
