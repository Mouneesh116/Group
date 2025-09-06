import React, { useState, useEffect } from 'react';
import './Products.css';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');
  const [priceSort, setPriceSort] = useState(''); // '', 'lowToHigh', 'highToLow'

  // Subcategory options based on selected category
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  // Add Product Form State
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductSubCategory, setNewProductSubCategory] = useState('');
  const [newProductCompany, setNewProductCompany] = useState('');
  const [newProductColor, setNewProductColor] = useState('');
  const [newProductPrevPrice, setNewProductPrevPrice] = useState('');
  const [newProductNewPrice, setNewProductNewPrice] = useState('');
  const [newProductImageUrl, setNewProductImageUrl] = useState('');

  // Edit Product Form State
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProductTitle, setEditedProductTitle] = useState('');
  const [editedProductCategory, setEditedProductCategory] = useState('');
  const [editedProductSubCategory, setEditedProductSubCategory] = useState('');
  const [editedProductCompany, setEditedProductCompany] = useState('');
  const [editedProductColor, setEditedProductColor] = useState('');
  const [editedProductPrevPrice, setEditedProductPrevPrice] = useState('');
  const [editedProductNewPrice, setEditedProductNewPrice] = useState('');
  const [editedProductImageUrl, setEditedProductImageUrl] = useState('');

  // Category and Subcategory Options
  const categoryOptions = ['fashion', 'electronics', 'shoes','Sports','Home Decor'];
  const subcategoryMapping = {
    "fashion": ['Mens', 'Womens', 'Kids'],
    "electronics": ['Mobiles', 'Laptops', 'Fridges', 'TVs'],
    "shoes": ['Mens', 'Womens', 'Heels', 'Sneakers'],
    "Sports": ['cricket', 'football', 'basketball','badminton','tennis','volleyball','boxing','swimming','running','gym', 'fitness'],
    "Home Decor": ['furniture', 'lighting', 'wall art', 'rugs', 'bedding', 'kitchen decor', 'bathroom decor', 'outdoor decor'],
  };
  useEffect(() => {
    // Update subcategory options when category filter changes for the filter section
    setSubcategoryOptions(categoryFilter ? subcategoryMapping[categoryFilter] : []);
  }, [categoryFilter]);

  // Fetch products from backend
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8080/api/products/getAllProducts`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log(response);
        if (response.status === 200) {
          setProducts(response.data.products || []);
        } else {
          console.log('Unable to fetch products');
          setError('Unable to fetch products.');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'An error occurred while fetching products.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Filtered and Sorted Products Logic
  const filteredAndSortedProducts = () => {
    let filtered = [...products];

    if (categoryFilter) {
      filtered = filtered.filter((product) => product?.category === categoryFilter);
    }
    if (subCategoryFilter) {
      filtered = filtered.filter((product) => product?.subCategory === subCategoryFilter);
    }

    if (priceSort === 'lowToHigh') {
      filtered.sort((a, b) => a.newPrice - b.newPrice);
    } else if (priceSort === 'highToLow') {
      filtered.sort((a, b) => b.newPrice - a.newPrice);
    }
    return filtered;
  };

  // Get products for the current page
  const currentProducts = () => {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    return filteredAndSortedProducts().slice(start, end);
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredAndSortedProducts().length / productsPerPage);

  // Add a new product
  const handleAddProduct = async (event) => {
    event.preventDefault();
    try {
      if (
        newProductTitle &&
        newProductPrevPrice &&
        newProductNewPrice &&
        newProductImageUrl &&
        newProductCategory &&
        newProductColor &&
        newProductCompany &&
        newProductSubCategory
      ) {
        const newProduct = {
          title: newProductTitle,
          category: newProductCategory,
          subCategory: newProductSubCategory,
          company: newProductCompany,
          prevPrice: parseFloat(newProductPrevPrice),
          newPrice: parseFloat(newProductNewPrice),
          img: newProductImageUrl,
          color: newProductColor,
        };

        const response = await axios.post(`http://localhost:8080/api/products/add`, newProduct, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.status === 200 || response.status === 201) {
          console.log('Product added successfully');
          setProducts([...products, response.data.product]); // Add the new product to the state
          // Clear form fields
          setNewProductTitle('');
          setNewProductCategory('');
          setNewProductSubCategory('');
          setNewProductCompany('');
          setNewProductColor('');
          setNewProductPrevPrice('');
          setNewProductNewPrice('');
          setNewProductImageUrl('');
        } else {
          console.log('Unable to add the product');
        }
      } else {
        alert('Please fill in all required fields for the new product.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/products/delete/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        console.log('Product deleted successfully');
        setProducts(products.filter((product) => product._id !== id)); // Remove the product from the state
      } else {
        console.log('Failed to delete the product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Set up product for editing
  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setEditedProductTitle(product.title);
    setEditedProductCategory(product.category);
    // Set subcategory options for the edit form based on the product's category
    setSubcategoryOptions(product.category ? subcategoryMapping[product.category] : []);
    setEditedProductSubCategory(product.subCategory);
    setEditedProductCompany(product.company);
    setEditedProductColor(product.color);
    setEditedProductPrevPrice(String(product.prevPrice));
    setEditedProductNewPrice(String(product.newPrice));
    setEditedProductImageUrl(product.img);
  };

  // Save edited product
  const handleSaveEdit = async (idToSave) => {
    const updatedProduct = {
      title: editedProductTitle,
      category: editedProductCategory,
      subCategory: editedProductSubCategory,
      company: editedProductCompany,
      color: editedProductColor,
      prevPrice: parseFloat(editedProductPrevPrice),
      newPrice: parseFloat(editedProductNewPrice),
      img: editedProductImageUrl,
    };

    try {
      const response = await axios.put(
        `http://localhost:8080/api/product/update/${idToSave}`,
        updatedProduct,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200) {
        console.log('Product updated successfully');
        const updatedProducts = products.map((product) =>
          product._id === idToSave ? { ...product, ...updatedProduct } : product
        );
        setProducts(updatedProducts);
        setEditingProductId(null); // Exit editing mode
      } else {
        console.error('Failed to update the product');
      }
    } catch (error) {
      console.error('Error saving the updated information:', error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProductId(null); // Exit editing mode
  };

  // Render loading and error states
  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="adminproducts-card adminproducts-product-management">
      <h3>Manage Products</h3>

      {/* Add Product Form */}
      <div className="adminproducts-add-product-form">
        <h4>Add New Product</h4>
        <label htmlFor="newProductTitle">Title:</label>
        <input
          type="text"
          id="newProductTitle"
          value={newProductTitle}
          placeholder="Product Title"
          onChange={(e) => setNewProductTitle(e.target.value)}
        />
        <label htmlFor="newProductCategory">Category:</label>
        <select
          id="newProductCategory"
          value={newProductCategory}
          onChange={(e) => {
            setNewProductCategory(e.target.value);
            setNewProductSubCategory(''); // Reset subcategory when category changes
            // Update subcategory options for the add form
            setSubcategoryOptions(e.target.value ? subcategoryMapping[e.target.value] : []);
          }}
        >
          <option value="">Select Category</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <label htmlFor="newProductSubCategory">Sub Category:</label>
        <select
          id="newProductSubCategory"
          value={newProductSubCategory}
          onChange={(e) => setNewProductSubCategory(e.target.value)}
          disabled={!newProductCategory} // Disable if no category is selected
        >
          <option value="">Select Subcategory</option>
          {subcategoryOptions.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select>
        <label htmlFor="newProductCompany">Company:</label>
        <input
          type="text"
          id="newProductCompany"
          value={newProductCompany}
          placeholder="e.g., Apple, Nike"
          onChange={(e) => setNewProductCompany(e.target.value)}
        />
        <label htmlFor="newProductColor">Color:</label>
        <input
          type="text"
          id="newProductColor"
          value={newProductColor}
          placeholder="e.g., Black, Red"
          onChange={(e) => setNewProductColor(e.target.value)}
        />
        <label htmlFor="newProductPrevPrice">Previous Price:</label>
        <input
          type="number"
          id="newProductPrevPrice"
          value={newProductPrevPrice}
          placeholder="e.g., 1500"
          onChange={(e) => setNewProductPrevPrice(e.target.value)}
        />
        <label htmlFor="newProductNewPrice">New Price:</label>
        <input
          type="number"
          id="newProductNewPrice"
          value={newProductNewPrice}
          placeholder="e.g., 1200"
          onChange={(e) => setNewProductNewPrice(e.target.value)}
        />
        <label htmlFor="newProductImageUrl">Image URL:</label>
        <input
          type="text"
          id="newProductImageUrl"
          value={newProductImageUrl}
          placeholder="http://example.com/image.jpg"
          onChange={(e) => setNewProductImageUrl(e.target.value)}
        />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>

      {/* Filter Section */}
      <div className="adminproducts-filter-section">
        <h4>Filter & Sort</h4>
        <label htmlFor="categoryFilter">Category:</label>
        <select
          id="categoryFilter"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setSubCategoryFilter(''); // Reset subcategory when category changes
          }}
        >
          <option value="">All Categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* <label htmlFor="subCategoryFilter">Sub Category:</label>
        <select
          id="subCategoryFilter"
          value={subCategoryFilter}
          onChange={(e) => setSubCategoryFilter(e.target.value)}
          disabled={!categoryFilter} // Disable if no category is selected
        >
          <option value="">All Subcategories</option>
          {subcategoryOptions.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select> */}

        <label htmlFor="priceSort">Price:</label>
        <select id="priceSort" value={priceSort} onChange={(e) => setPriceSort(e.target.value)}>
          <option value="">Relevance</option>
          <option value="lowToHigh">Low to High</option>
          <option value="highToLow">High to Low</option>
        </select>
      </div>

      {/* Current Products Table */}
      <div>
        <h4>Current Products</h4>
        {currentProducts().length > 0 ? (
          <table className="adminproducts-product-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>Company</th>
                <th>Color</th>
                <th>Prev Price</th>
                <th>New Price</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts().map((product) => (
                <tr key={product._id}>
                  <td>
                    {editingProductId === product._id ? (
                      <input
                        type="text"
                        value={editedProductTitle}
                        onChange={(e) => setEditedProductTitle(e.target.value)}
                      />
                    ) : (
                      product.title
                    )}
                  </td>
                  <td>
                    {editingProductId === product._id ? (
                      <select
                        value={editedProductCategory}
                        onChange={(e) => {
                          setEditedProductCategory(e.target.value);
                          setEditedProductSubCategory(''); // Reset subcategory
                          // Dynamically set options for the edited product's subcategory dropdown
                          setSubcategoryOptions(e.target.value ? subcategoryMapping[e.target.value] : []);
                        }}
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      product.category
                    )}
                  </td>
                  <td>
                    {editingProductId === product._id ? (
                      <select
                        value={editedProductSubCategory}
                        onChange={(e) => setEditedProductSubCategory(e.target.value)}
                        disabled={!editedProductCategory} // Disable if no category is selected
                      >
                        <option value="">Select Subcategory</option>
                        {/* Render options for the current edited category */}
                        {subcategoryOptions.map((subcat) => (
                          <option key={subcat} value={subcat}>
                            {subcat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      product.subCategory
                    )}
                  </td>
                  <td>
                    {editingProductId === product._id ? (
                      <input
                        type="text"
                        value={editedProductCompany}
                        onChange={(e) => setEditedProductCompany(e.target.value)}
                      />
                    ) : (
                      product.company
                    )}
                  </td>
                  <td>
                    {editingProductId === product._id ? (
                      <input
                        type="text"
                        value={editedProductColor}
                        onChange={(e) => setEditedProductColor(e.target.value)}
                      />
                    ) : (
                      product.color
                    )}
                  </td>
                  <td>
                    {editingProductId === product._id ? (
                      <input
                        type="number"
                        value={editedProductPrevPrice}
                        onChange={(e) => setEditedProductPrevPrice(e.target.value)}
                      />
                    ) : (
                      `$${product.prevPrice ? product.prevPrice.toFixed(2) : '0.00'}`
                    )}
                  </td>
                  <td>
                    {editingProductId === product._id ? (
                      <input
                        type="number"
                        value={editedProductNewPrice}
                        onChange={(e) => setEditedProductNewPrice(e.target.value)}
                      />
                    ) : (
                      `$${product.newPrice ? product.newPrice.toFixed(2) : '0.00'}`
                    )}
                  </td>
                  <td>
                    {editingProductId === product._id ? (
                      <input
                        type="text"
                        value={editedProductImageUrl}
                        onChange={(e) => setEditedProductImageUrl(e.target.value)}
                      />
                    ) : (
                      <img
                        src={product.img}
                        alt={product.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    )}
                  </td>
                  <td>
                    <div className="adminproducts-product-actions">
                      {editingProductId === product._id ? (
                        <>
                          <button onClick={() => handleSaveEdit(product._id)}>Save</button>
                          <button className="adminproducts-cancel-button" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="adminproducts-edit-button"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                          <button style={{color:"black"}} onClick={() => handleDeleteProduct(product._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products found with the current filters.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="adminproducts-pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
