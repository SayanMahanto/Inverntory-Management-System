import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
  });
  const [error, setError] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    minQty: "",
    maxQty: "",
    sort: "createdAt",
    order: "desc",
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchItems = async () => {
    const queryParams = new URLSearchParams(filters).toString();
    try {
      const res = await fetch(
        `http://localhost:5000/api/items?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setItems(data.items);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          price: Number(formData.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create item");
      }

      setFormData({ name: "", category: "", quantity: "", price: "" });
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditing = (item) => {
    setEditingItemId(item._id);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
    });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          quantity: Number(editForm.quantity),
          price: Number(editForm.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setEditingItemId(null);
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user?.name} 👑</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      <h3>Search / Filter / Sort</h3>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="search"
          placeholder="Search name..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={filters.category}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minQty"
          placeholder="Min Qty"
          value={filters.minQty}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxQty"
          placeholder="Max Qty"
          value={filters.maxQty}
          onChange={handleFilterChange}
        />
        <select name="sort" value={filters.sort} onChange={handleFilterChange}>
          <option value="createdAt">Newest</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="quantity">Quantity</option>
        </select>
        <select
          name="order"
          value={filters.order}
          onChange={handleFilterChange}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        <button onClick={() => fetchItems()}>Apply</button>
      </div>

      <h3>All Items</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item._id}>
                  {editingItemId === item._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="quantity"
                          value={editForm.quantity}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                        />
                      </td>
                      <td>{item.createdBy?.name}</td>
                      <td>
                        <button onClick={() => handleUpdate(item._id)}>
                          💾 Save
                        </button>
                        <button onClick={() => setEditingItemId(null)}>
                          ❌ Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>{item.createdBy?.name}</td>
                      <td>
                        <button onClick={() => startEditing(item)}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(item._id)}>
                          🗑 Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No items found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <h3>Add New Item</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Item name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
