import * as AdminService from "../../services/AdminService.js";

// Cập nhật thông tin tài khoản admin thông qua
export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedAdmin = await AdminService.updateAdminProfile(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin admin thành công",
      data: updatedAdmin,
    });
  } catch (error) {
    return res.status(error.message.includes("Không tìm thấy") ? 404 : error.message.includes("không phải là admin") ? 403 : 400).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi cập nhật thông tin admin",
    });
  }
};

// Thêm người dùng mới vào hệ thống thông qua
export const addNewUser = async (req, res) => {
  try {
    const io = req.app.get("io");
    const user = await AdminService.addNewUser(req.body, io);

    return res.status(200).json({
      success: true,
      message: `Thêm ${req.body.role === "admin" ? "quản trị viên" : "người dùng"} thành công`,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Lọc danh sách người dùng có phân trang thông qua
export const filterUsers = async (req, res) => {
  try {
    const { status, role, gender, page = 1, limit = 10 } = req.query;
    const result = await AdminService.filterUsers(
      { status, role, gender },
      { page, limit }
    );

    return res.status(200).json({
      success: true,
      message: "Lọc user thành công",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Tìm kiếm danh sách người dùng bằng từ khóa thông qua
export const searchUsers = async (req, res) => {
  try {
    const { status, role, gender, keyword, page = 1, limit = 10 } = req.query;
    const result = await AdminService.searchUsers(
      { status, role, gender, keyword },
      { page, limit }
    );

    return res.status(200).json({
      success: true,
      message: "Tìm kiếm user thành công",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa người dùng thông qua
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const io = req.app.get("io");
    const deletedUser = await AdminService.deleteUser(userId, io);

    return res.status(200).json({
      success: true,
      message: "Xóa user thành công",
      data: deletedUser,
    });
  } catch (error) {
    return res.status(error.message.includes("không tồn tại") ? 404 : 400).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật thông tin chi tiết người dùng thông qua
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const io = req.app.get("io");
    const updatedUser = await AdminService.updateUser(userId, req.body, io);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin user thành công",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(error.message.includes("Không tìm thấy") ? 404 : 400).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi cập nhật thông tin user",
    });
  }
};

// Phản hồi đường dẫn tệp tải lên
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Không tìm thấy file" });
  }
  return res.status(200).json({ success: true, url: req.file.path });
};
