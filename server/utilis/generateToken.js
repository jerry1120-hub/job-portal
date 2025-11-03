import jwt from "jsonwebtoken";

const generateToken = (id) => {
  try {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return null;
  }
};

export default generateToken;
