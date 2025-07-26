// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ message: "No token. Unauthorized." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_Secret);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token." });
//   }
// };

// export default authMiddleware;

// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authheader:", authHeader);

  // Expecting header: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token. Unauthorized." });
  }

  const token = authHeader.split(" ")[1]; // Extract the token

  try {
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    console.log("Token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
