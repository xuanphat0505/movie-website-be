import User from "../Models/UserModel.js";

export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.find({ status: "active" });
    res.status(200).json({ data: activeUsers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMaleUsers = async (req, res) => {
  try {
    const maleUsers = await User.find({ gender: "male" });
    res.status(200).json({ data: maleUsers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFemaleUsers = async (req, res) => {
  try {
    const femaleUsers = await User.find({ gender: "female" });
    res.status(200).json({ data: femaleUsers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ data: totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
