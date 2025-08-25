import { connectSupabase } from "../db/supabase.js";
import { sendAccountDeletionEmail } from "../utils/emails/sendAccountDeletionEmail.js";

const supabase = connectSupabase();

// My Downloads (files only)
export const getUserDownloads = async (req, res) => {
  try {
    // 🔒 Security & Performance Fix: Use user ID directly from the authenticated request
    const userId = req.user.id;

    // No need to fetch the user again, req.user is already provided by the middleware
    const { data: downloads, error } = await supabase
      .from("downloads")
      .select(`*, files:files(name, file_ext)`)
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ downloads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch downloads" });
  }
};

// Payments only
export const getUserPayments = async (req, res) => {
  try {
    // 🔒 Security & Performance Fix: Use user ID directly from the authenticated request
    const userId = req.user.id;

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    res.json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

// Settings: delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // ✅ STEP 1: Fetch the user's name from the database
    // This assumes your users table is named 'users' and the name column is 'name'
    const { data: user, error: fetchError } = await supabase
      .from("full_name")
      .select("*")
      .eq("id", userId)
      .single();
    console.log(user);

    if (fetchError || !user) {
      console.error("Failed to fetch user data for deletion:", fetchError);
      return res
        .status(400)
        .json({ message: "User not found or data missing." });
    }

    const userName = user.full_name;

    // ✅ STEP 2: Call the Supabase RPC to delete the account
    const { error: deletionError } = await supabase.rpc(
      "delete_user_and_log_cascade",
      {
        user_who_deleted_id: userId,
        user_to_delete_id: userId,
      }
    );

    if (deletionError) {
      console.error("Account deletion failed:", deletionError);
      return res.status(400).json({ message: "Account deletion failed." });
    }

    // ✅ STEP 3: After successful deletion, send the confirmation email
    try {
      await sendAccountDeletionEmail(userEmail, userName);
    } catch (emailError) {
      // Log the email error but don't prevent the success response
      // since the primary action (account deletion) was successful.
      console.error("Failed to send account deletion email:", emailError);
    }

    // 🔒 Security Fix: Log the user out by clearing cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    // ✅ STEP 4: Send the final success response to the client
    res.json({
      message: "Account and all associated data deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

// Settings: update account
export const updateUser = async (req, res) => {
  try {
    // 🔒 Security & Performance Fix: Use user ID directly from the authenticated request
    const userId = req.user.id;
    const { full_name, phone, address, city, state, zip_code, country } =
      req.body;

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        full_name,
        phone,
        address,
        city,
        state,
        zip_code,
        country,
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ message: "Failed to update user" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// get all files for users for downlaoding
export const getAllFilesForUser = async (req, res) => {
  try {
    // 🐛 Bug Fix: `files` table might not have `is_active` column.
    // If it exists, this is okay. Otherwise, remove it.
    const { data: files, error } = await supabase
      .from("files")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      // 🧑‍💻 Code Improvement: Return the error message directly for better debugging
      return res.status(500).json({ message: error.message });
    }

    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch files" });
  }
};
