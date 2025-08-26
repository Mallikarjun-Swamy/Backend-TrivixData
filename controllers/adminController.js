import bcrypt from "bcrypt";
import { connectSupabase } from "../db/supabase.js";
const supabase = connectSupabase();

// User-related functions
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required." });
    if (password.length < 6)
      return res.status(400).json({ message: "Password is too short." });

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1) // Use limit(1) for a clean existence check
      .single(); // Ensure we get only one result

    if (existingUser)
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          full_name: fullName,
          email,
          password: hashedPassword,
          is_verified: true, // auto-verified
          role,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase create user error:", error.message);
      return res.status(500).json({ message: "Failed to create user." });
    }

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: "Failed to create user." });
  }
};

export const fetchAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, is_verified, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch all users error:", error.message);
      return res.status(500).json({ message: "Failed to fetch users." });
    }

    res.json({ success: true, users });
  } catch (err) {
    console.error("fetchAllUsers error:", err);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// Delete a user by id
export const deleteUser = async (req, res) => {
  try {
    const deleteId = req.params.id;
    const adminID = req.user.id;

    const { error } = await supabase.rpc("delete_user_and_log_cascade", {
      user_who_deleted_id: adminID,
      user_to_delete_id: deleteId,
    });

    if (error) {
      console.error("User deletion failed:", error);
      return res.status(400).json({ message: "User deletion failed." });
    }

    res.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Failed to delete user." });
  }
};

// Update user info by id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, is_verified } = req.body;

    const updateData = {};

    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (is_verified !== undefined) updateData.is_verified = is_verified;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update user error:", error.message);
      return res.status(500).json({ message: "Failed to update user." });
    }

    if (!data) {
      return res
        .status(404)
        .json({ message: "User not found or no update applied." });
    }

    res.json({ success: true, user: data });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "Failed to update user." });
  }
};

// All file downloads related functions
export const fetchAllDownloads = async (req, res) => {
  try {
    const { data: downloads, error } = await supabase
      .from("downloads")
      .select(`*, files(name), users(full_name)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch downloads error:", error.message);
      return res.status(500).json({ message: "Failed to fetch downloads." });
    }

    res.json({ success: true, downloads });
  } catch (err) {
    console.error("fetchAllDownloads error:", err);
    res.status(500).json({ message: "Failed to fetch downloads." });
  }
};

// All payments related functions
export const fetchAllPayments = async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select(`*, files(name), users(full_name)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch payments error:", error.message);
      return res.status(500).json({ message: "Failed to fetch payments." });
    }

    res.json({ success: true, payments });
  } catch (err) {
    console.error("fetchAllPayments error:", err);
    res.status(500).json({ message: "Failed to fetch payments." });
  }
};

//for Custom user
export const createDownload = async (req, res) => {
  try {
    const {
      user_id,
      file_id,
      paypal_order_id,
      amount,
      payer_email,
      payment_status,
      download_status,
    } = req.body;

    // 1. Improved Input Validation
    if (
      !user_id ||
      !file_id ||
      !paypal_order_id ||
      !amount ||
      !payer_email ||
      !payment_status ||
      download_status
    ) {
      return res
        .status(400)
        .json({ message: "All required fields are missing." });
    }

    // 2. Insert into 'payments' table
    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          user_id,
          file_id,
          paypal_order_id,
          amount,
          payer_email,
          status: payment_status,
        },
      ])
      .select()
      .single();

    if (paymentError) {
      // 3. Specific and Correct Error Logging
      console.error("Supabase payment creation error:", paymentError.message);
      return res
        .status(500)
        .json({ message: "Failed to create payment record." });
    }

    const paymentId = newPayment.id;

    // 4. Insert into 'downloads' table
    const { data: newDownload, error: downloadError } = await supabase
      .from("downloads")
      .insert([
        {
          user_id,
          file_id,
          payment_id: paymentId,
          downloaded: download_status,
        },
      ])
      .select()
      .single();

    if (downloadError) {
      // 5. Correct Error Variable and Message
      console.error("Supabase download creation error:", downloadError.message);
      return res
        .status(500)
        .json({ message: "Failed to create download record." });
    }

    // 6. Successful response
    res.json({ success: true, download: newDownload });
  } catch (err) {
    // 7. General Error Catch
    console.error("Internal server error in createDownload:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
