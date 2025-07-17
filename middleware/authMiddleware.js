import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token. Unauthorized." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
