const Doctor = require("../models/Doctor");
const Department = require("../models/Department");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

async function createDoctor(req, res) {
  try {
    const { user, name, specialization, department, email, phone, experience } =
      req.body;

    if (!name || !specialization || !department || !email || !phone) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        message: "Doctor name must contain at least 3 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const phonePattern = /^\+?[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number",
      });
    }

    if (experience < 0) {
      return res.status(400).json({
        message: "Experience cannot be negative",
      });
    }

    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({ message: "Department does not exist" });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor email already exists" });
    }

    const doctor = await Doctor.create({
      user,
      name,
      specialization,
      department,
      email,
      phone,
      experience,
    });

    return res.status(201).json(doctor);
  } catch (error) {
    console.error("createDoctor error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getDoctors(req, res) {
  try {
    const doctors = await Doctor.find().populate("department");
    return res.status(200).json(doctors);
  } catch (error) {
    console.error("getDoctors error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getDoctorById(req, res) {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).populate("department");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    console.error("getDoctorById error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateDoctor(req, res) {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const name = req.body.name ?? doctor.name;
    const specialization = req.body.specialization ?? doctor.specialization;
    const department = req.body.department ?? doctor.department;
    const email = req.body.email ?? doctor.email;
    const phone = req.body.phone ?? doctor.phone;
    const experience = req.body.experience ?? doctor.experience;
    const isAvailable = req.body.isAvailable ?? doctor.isAvailable;

    if (!name || !specialization || !department || !email || !phone) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        message: "Doctor name must contain at least 3 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const phonePattern = /^\+?[0-9]{10}$/;

    if (!phonePattern.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number",
      });
    }

    if (experience < 0) {
      return res.status(400).json({
        message: "Experience cannot be negative",
      });
    }
    const existingDoctor = await Doctor.findOne({
      email,
      _id: { $ne: id },
    });

    if (existingDoctor) {
      return res.status(400).json({
        message: "Doctor email already exists",
      });
    }
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        specialization,
        department,
        email,
        phone,
        experience,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("department");

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error("updateDoctor error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteDoctor(req, res) {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await Appointment.deleteMany({
      doctor: doctor._id,
    });

    await User.findByIdAndDelete(doctor._id);

    await doctor.deleteOne();

    return res.status(200).json({
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("deleteDoctor error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getDoctorAppointments(req, res) {
  try {
    const { id } = req.params;
    const appointments = await Appointment.find({ doctor: id })
      .populate("patient", "-password")
      .populate("department")
      .sort("queueNumber");

    return res.status(200).json(appointments);
  } catch (error) {
    console.error("getDoctorAppointments error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getDoctorQueue(req, res) {
  try {
    const { id } = req.params;
    const queue = await Appointment.find({ doctor: id, status: "scheduled" })
      .populate("patient", "-password")
      .sort("queueNumber");

    return res.status(200).json(queue);
  } catch (error) {
    console.error("getDoctorQueue error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getDoctorStats(req, res) {
  try {
    const { id } = req.params;
    const scheduledCount = await Appointment.countDocuments({
      doctor: id,
      status: "scheduled",
    });
    const completedCount = await Appointment.countDocuments({
      doctor: id,
      status: "completed",
    });
    const cancelledCount = await Appointment.countDocuments({
      doctor: id,
      status: "cancelled",
    });

    return res.status(200).json({
      scheduled: scheduledCount,
      completed: completedCount,
      cancelled: cancelledCount,
    });
  } catch (error) {
    console.error("getDoctorStats error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments,
  getDoctorQueue,
  getDoctorStats,
};
