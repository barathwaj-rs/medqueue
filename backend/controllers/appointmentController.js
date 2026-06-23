const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

async function bookAppointment(req, res) {
  try {
    const { patient, doctor, appointmentDate } = req.body;

    if (!patient || !doctor || !appointmentDate) {
      return res
        .status(400)
        .json({ message: "Patient, doctor and appointmentDate are required" });
    }

    const patientExists = await User.findById(patient);
    if (!patientExists) {
      return res.status(400).json({ message: "Patient does not exist" });
    }

    const doctorExists = await Doctor.findById(doctor).populate("department");
    if (!doctorExists) {
      return res.status(400).json({ message: "Doctor does not exist" });
    }

    const department = doctorExists.department;
    if (!department) {
      return res
        .status(400)
        .json({ message: "Doctor has no department assigned" });
    }

    const appointmentDateValue = new Date(appointmentDate);
    appointmentDateValue.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDateValue < today) {
      return res.status(400).json({
        message: "Cannot book appointments in the past",
      });
    }

    const nextDay = new Date(
      appointmentDateValue.getTime() + 24 * 60 * 60 * 1000,
    );

    const patientAppointment = await Appointment.findOne({
      patient,
      status: "scheduled",
      appointmentDate: {
        $gte: appointmentDateValue,
        $lt: nextDay,
      },
    });

    if (patientAppointment) {
      return res.status(400).json({
        message: "Patient already has an appointment scheduled for this date",
      });
    }

    const existingAppointment = await Appointment.findOne({
      patient,
      doctor,
      status: "scheduled",
      appointmentDate: {
        $gte: appointmentDateValue,
        $lt: nextDay,
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message:
          "Appointment already exists for this patient and doctor on this date",
      });
    }
    const appointmentCount = await Appointment.countDocuments({
      doctor,
      status: "scheduled",
      appointmentDate: {
        $gte: appointmentDateValue,
        $lt: nextDay,
      },
    });

    if (appointmentCount >= 30) {
      return res.status(400).json({
        message: "Maximum appointments reached for this doctor",
      });
    }

    const lastAppointment = await Appointment.findOne({
      doctor,
      status: "scheduled",
      appointmentDate: {
        $gte: appointmentDateValue,
        $lt: nextDay,
      },
    }).sort("-appointmentDate");

    if (
      lastAppointment &&
      new Date(appointmentDate) <= new Date(lastAppointment.appointmentDate)
    ) {
      return res.status(400).json({
        message:
          "Appointment time must be after the latest appointment for this doctor on that day",
      });
    }

    const nextQueueNumber =
      (await Appointment.countDocuments({
        doctor,
        status: "scheduled",
        appointmentDate: {
          $gte: appointmentDateValue,
          $lt: nextDay,
        },
      })) + 1;

    const estimatedWaitTime = (nextQueueNumber - 1) * 15;

    const appointment = await Appointment.create({
      patient,
      doctor,
      department: department._id,
      appointmentDate: new Date(appointmentDate),
      queueNumber: nextQueueNumber,
      estimatedWaitTime,
    });

    req.app.get("io").emit("appointmentCreated");
    req.app.get("io").emit("queueUpdated");
    return res.status(201).json(appointment);
  } catch (error) {
    console.error("bookAppointment error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getAppointments(req, res) {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "-password")
      .populate("doctor")
      .populate("department");

    return res.status(200).json(appointments);
  } catch (error) {
    console.error("getAppointments error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("patient", "-password")
      .populate("doctor")
      .populate("department");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error("getAppointmentById error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Appointment already cancelled",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "Completed appointments cannot be cancelled",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointmentDateValue = new Date(appointment.appointmentDate);
    appointmentDateValue.setHours(0, 0, 0, 0);

    const nextDay = new Date(
      appointmentDateValue.getTime() + 24 * 60 * 60 * 1000,
    );

    if (appointmentDateValue.getTime() !== today.getTime()) {
      req.app.get("io").emit("appointmentUpdated");
      req.app.get("io").emit("queueUpdated");

      return res.status(200).json(appointment);
    }

    const remainingAppointments = await Appointment.find({
      doctor: appointment.doctor,
      status: "scheduled",
      appointmentDate: {
        $gte: appointmentDateValue,
        $lt: nextDay,
      },
    }).sort("queueNumber");

    for (let index = 0; index < remainingAppointments.length; index += 1) {
      remainingAppointments[index].queueNumber = index + 1;
      remainingAppointments[index].estimatedWaitTime = index * 15;

      await remainingAppointments[index].save();
    }

    req.app.get("io").emit("appointmentUpdated");
    req.app.get("io").emit("queueUpdated");

    return res.status(200).json(appointment);
  } catch (error) {
    console.error("cancelAppointment error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function completeAppointment(req, res) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled appointments cannot be completed",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "Appointment already completed",
      });
    }

    if (notes && notes.length > 500) {
      return res.status(400).json({
        message: "Notes cannot exceed 500 characters",
      });
    }

    appointment.status = "completed";

    appointment.notes = notes || appointment.notes;
    await appointment.save();
    req.app.get("io").emit("appointmentUpdated");
    req.app.get("io").emit("queueUpdated");
    return res.status(200).json(appointment);
  } catch (error) {
    console.error("completeAppointment error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  completeAppointment,
};
