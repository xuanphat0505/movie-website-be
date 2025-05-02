export const healthCheck = async (req, res) => {
  try {
    return res.status(200).json({ status: 'ok', message: "Server is running" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 'error', message: "Server is not running" });
  }
};
