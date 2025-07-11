// importing inventory model
import Inventory from "./../models/Inventory.js";

// CREATE ITEM
export const createItem = async (req, res) => {
  const { name, category, quantity, price } = req.body;

  const user = req.user;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only" });
  }

  try {
    const item = new Inventory({
      name,
      category,
      quantity,
      price,
      createdBy: user.id,
    });

    await item.save();

    return res.status(200).json({ message: "Item created successfully", item });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET ITEMS
export const getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find().populate("createdBy", "name email");
    res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE ITEMS
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only" });
  }

  try {
    const updatedItem = await Inventory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res
      .status(200)
      .json({ message: "Item updated successfully.", item: updatedItem });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE ITEM
export const deleteItem = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only" });
  }

  try {
    const deletedItem = await Inventory.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({ message: "Item deleted successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
