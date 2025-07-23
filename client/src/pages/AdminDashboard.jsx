import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchItems = async () => {
    const queryParams = new URLSearchParams({
      ...filters,
      page,
      limit: 5,
    }).toString();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/items?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token, page]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setPage(1);
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items`, {
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

      if (!res.ok) throw new Error(data.message || "Failed to create item");

      setFormData({ name: "", category: "", quantity: "", price: "" });
      toast.success("Item added successfully");
      fetchItems();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
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
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/items/${id}`,
        {
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
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      toast.success("Item updated");
      setEditingItemId(null);
      fetchItems();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/items/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      toast.success("Item deleted");
      fetchItems();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Category,Quantity,Price,CreatedBy"]
        .concat(
          items.map(
            (item) =>
              `${item.name},${item.category},${item.quantity},${item.price},${item.createdBy?.name}`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Name", "Category", "Qty", "Price", "Created By"]],
      body: items.map((item) => [
        item.name,
        item.category,
        item.quantity,
        item.price,
        item.createdBy?.name || "N/A",
      ]),
      startY: 20,
    });

    doc.text("Inventory Items", 14, 15);
    doc.save("inventory_items.pdf");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      {" "}
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg mb-6 text-center max-w-2xl mx-auto md:max-w-3xl lg:max-w-4xl">
        {" "}
        <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-lg text-gray-300">Welcome, {user?.name} 👑</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      <hr className="border-gray-700 my-6 max-w-2xl mx-auto md:max-w-3xl lg:max-w-4xl" />{" "}
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg mb-6 max-w-2xl mx-auto md:max-w-3xl lg:max-w-4xl">
        {" "}
        <h3 className="text-2xl font-semibold mb-4 text-white">
          Search / Filter / Sort
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <input
            type="text"
            name="search"
            placeholder="Search name..."
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={filters.category}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="minQty"
            placeholder="Min Qty"
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={filters.minQty}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxQty"
            placeholder="Max Qty"
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={filters.maxQty}
            onChange={handleFilterChange}
          />
          <select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
          >
            <option value="createdAt">Newest</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="quantity">Quantity</option>
          </select>
          <select
            name="order"
            value={filters.order}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 justify-center">
          {" "}
          <button
            onClick={() => fetchItems()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded focus:outline-none focus:shadow-outline flex-grow text-sm md:flex-grow-0"
          >
            Apply Filters
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded focus:outline-none focus:shadow-outline flex-grow text-sm md:flex-grow-0"
          >
            ⬇️ Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded focus:outline-none focus:shadow-outline flex-grow text-sm md:flex-grow-0"
          >
            📄 Export PDF
          </button>
        </div>
      </div>
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg mb-6 max-w-2xl mx-auto md:max-w-3xl lg:max-w-4xl overflow-x-auto">
        <h3 className="text-2xl font-semibold mb-4 text-white">All Items</h3>
        {loading ? (
          <table className="w-full text-left table-auto border-collapse min-w-[600px]">
            {" "}
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 border-b border-gray-600">Name</th>
                <th className="p-3 border-b border-gray-600">Category</th>
                <th className="p-3 border-b border-gray-600">Qty</th>
                <th className="p-3 border-b border-gray-600">Price</th>
                <th className="p-3 border-b border-gray-600">Created By</th>
                <th className="p-3 border-b border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="p-3">
                    <Skeleton width={100} />
                  </td>
                  <td className="p-3">
                    <Skeleton width={100} />
                  </td>
                  <td className="p-3">
                    <Skeleton width={60} />
                  </td>
                  <td className="p-3">
                    <Skeleton width={80} />
                  </td>
                  <td className="p-3">
                    <Skeleton width={100} />
                  </td>
                  <td className="p-3">
                    <Skeleton width={120} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left table-auto border-collapse min-w-[600px]">
            {" "}
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 border-b border-gray-600">Name</th>
                <th className="p-3 border-b border-gray-600">Category</th>
                <th className="p-3 border-b border-gray-600">Qty</th>
                <th className="p-3 border-b border-gray-600">Price</th>
                <th className="p-3 border-b border-gray-600">Created By</th>
                <th className="p-3 border-b border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    {editingItemId === item._id ? (
                      <>
                        <td className="p-3">
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white text-sm"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            name="category"
                            value={editForm.category}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white text-sm"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            name="quantity"
                            value={editForm.quantity}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white text-sm"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white text-sm"
                          />
                        </td>
                        <td className="p-3">{item.createdBy?.name}</td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleUpdate(item._id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm focus:outline-none focus:shadow-outline"
                            >
                              💾 Save
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm focus:outline-none focus:shadow-outline"
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.category}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3">₹{item.price}</td>
                        <td className="p-3">{item.createdBy?.name}</td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => startEditing(item)}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm focus:outline-none focus:shadow-outline"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm focus:outline-none focus:shadow-outline"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-400">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {" "}
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
          >
            ⬅️ Prev
          </button>
          <span className="text-lg text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
          >
            Next ➡️
          </button>
        </div>
      </div>
      <div className="bg-gray-800 p-5 rounded-lg shadow-lg mb-6 max-w-2xl mx-auto md:max-w-3xl lg:max-w-4xl">
        {" "}
        <h3 className="text-2xl font-semibold mb-4 text-white">Add New Item</h3>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row md:flex-wrap gap-3 sm:gap-4 items-center"
        >
          <input
            type="text"
            name="name"
            placeholder="Item name"
            className="w-full md:w-auto md:flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            className="w-full md:w-auto md:flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            className="w-full md:w-auto md:flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            className="w-full md:w-auto md:flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white text-sm"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full md:w-auto px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded focus:outline-none focus:shadow-outline text-sm"
          >
            Add Item
          </button>
        </form>
      </div>
      <div className="mt-8 text-center max-w-md mx-auto">
        <button
          onClick={handleGoBack}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded focus:outline-none focus:shadow-outline"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
