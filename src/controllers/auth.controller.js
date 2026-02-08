import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message:
          "All fields must be filled. FirstName, lastName,email and password! ",
      });
    }

    const existingUser = await User.findOne({email});

    if (existingUser) {
      return res.status(409).json({
        message: "This user already exists!",
      });
    }

    await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(201).json({
      message: "User successfully registered!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Server unexpected error: ${error}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields must be filled.Email and password! ",
      });
    }

    const user = await User.findOne({email});

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }
      
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid password!" });
      }

      
      const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: "7d" });
      res.status(200).json({
          message: "User successfully logged in",
          token
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Server unexpected error: ${error}`,
    });
  }
};

export { register, login };
