import { db } from "../config/db.js";

// Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Update users details
export const UpdateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, avatar } = req.body;
  try {
    await db.query(
      "UPDATE users SET username = ?, email = ?, avatar = ? WHERE id = ?",
      [username, email, avatar, id]
    );
    res.status(200).json({ message: "User updates successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};
