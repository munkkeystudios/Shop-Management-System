import React, { useState } from 'react';
import Sidebar from '../components/sidebar';  // Ensure the sidebar import path is correct
import { Eye, Trash2, Edit } from 'lucide-react'; // Icons

const CategoryPage = () => {
    const [newCategory, setNewCategory] = useState({ code: '', name: '' });
    const [searchTerm, setSearchTerm] = useState(''); // State to handle search input
    const [categories, setCategories] = useState([  // Manage the categories in state
        { code: 'CA9', name: 'Jeans' },
        { code: 'CA8', name: 'Shirts' },
        { code: 'CA7', name: 'Shorts' },
        { code: 'CA6', name: 'Jacket' },
        { code: 'CA5', name: 'Jacket' },
        { code: 'CA4', name: 'Shirts' },
        { code: 'CA3', name: 'Jacket' },
        { code: 'CA2', name: 'Jacket' },
        { code: 'CA1', name: 'Jacket' },
    ]);

    // Filter categories based on the search term
    const filteredCategories = categories.filter((category) =>
        category.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle creating a new category
    const handleCreateCategory = () => {
        if (!newCategory.code || !newCategory.name) {
            alert('Please enter both category code and name.');
            return;
        }

        setCategories((prevCategories) => [
            ...prevCategories, 
            { code: newCategory.code, name: newCategory.name }
        ]);

        // Clear the input fields after creating the category
        setNewCategory({ code: '', name: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCategory((prevCategory) => ({
            ...prevCategory,
            [name]: value,
        }));
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="category-layout">
            {/* Sidebar Component */}
            <Sidebar />

            <div className="category-page">
                <div className="breadcrumb">
                    <span>Products</span> &gt; <span className="active">Category</span>
                </div>

                <div className="category-header">
                    <h2>Category</h2>
                    <input
                        type="text"
                        placeholder="🔍 Search by Category Code"
                        className="search-box"
                        value={searchTerm}
                        onChange={handleSearchChange} // Update search term on input change
                    />
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
                            {filteredCategories.map((cat, idx) => (
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
                    <input
                        type="text"
                        name="code"
                        value={newCategory.code}
                        onChange={handleChange}
                        placeholder="Enter category code"
                        className="category-input"
                    />
                    <input
                        type="text"
                        name="name"
                        value={newCategory.name}
                        onChange={handleChange}
                        placeholder="Enter category name"
                        className="category-input"
                    />
                    <button className="create-btn" onClick={handleCreateCategory}>
                        Create New Category
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
