const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

async function getPatients(req, res) {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    return res.status(200).json(patients);
  } catch (error) {
    console.error("getPatients error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getPatientById(req, res) {
  try {
    const { id } = req.params;
    const patient = await User.findOne({ _id: id, role: "patient" }).select(
      "-password",
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json(patient);
  } catch (error) {
    console.error("getPatientById error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function createPatient(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        message: "Name must contain at least 3 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const existing = await User.findOne({ email: email.trim() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const phonePattern = /^\+?[0-9\s-]{7,20}$/;
    if (phone && !phonePattern.test(phone)) {
      return res.status(400).json({ message: "Phone number is invalid" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: "patient",
      phone,
    });

    const payload = patient.toObject();
    delete payload.password;

    return res.status(201).json(payload);
  } catch (error) {
    console.error("createPatient error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, phone } = req.body;

    const patient = await User.findOne({ _id: id, role: "patient" });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        message: "Name must contain at least 3 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const existing = await User.findOne({
      email: email.trim(),
      _id: { $ne: id },
    });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const phonePattern = /^\+?[0-9\s-]{7,20}$/;
    if (phone && !phonePattern.test(phone)) {
      return res.status(400).json({ message: "Phone number is invalid" });
    }

    patient.name = name.trim();
    patient.email = email.trim();
    patient.phone = phone;

    if (password && password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      patient.password = await bcrypt.hash(password, salt);
    }

    await patient.save();

    const payload = patient.toObject();
    delete payload.password;

    return res.status(200).json(payload);
  } catch (error) {
    console.error("updatePatient error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deletePatient(req, res) {
  try {
    const { id } = req.params;

    const patient = await User.findOne({
      _id: id,
      role: "patient",
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    await Appointment.deleteMany({
      patient: patient._id,
    });

    await patient.deleteOne();

    return res.status(200).json({
      message: "Patient deleted",
    });
  } catch (error) {
    console.error("deletePatient error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function changePassword(req, res) {
  try {
    const { id } = req.params;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const patient = await User.findById(id);

    if (!patient) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      patient.password,
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);

    patient.password = await bcrypt.hash(newPassword, salt);

    await patient.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("changePassword error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  changePassword,
};
