const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

async function getCurrentPatient(req, res) {
  try {
    const { doctorId } = req.params;
    const doctorExists = await Doctor.findById(doctorId);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const appointment = await Appointment.findOne({
      doctor: doctorId,
      status: "scheduled",
      appointmentDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
      .populate("patient", "-password")
      .sort("queueNumber");

    if (!appointment) {
      return res.status(404).json({ message: "No current patient in queue" });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error("getCurrentPatient error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getRemainingQueue(req, res) {
  try {
    const { doctorId } = req.params;

    const doctorExists = await Doctor.findById(doctorId);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const queue = await Appointment.find({
      doctor: doctorId,
      status: "scheduled",
      appointmentDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
      .populate("patient", "-password")
      .sort("queueNumber");

    return res.status(200).json(queue);
  } catch (error) {
    console.error("getRemainingQueue error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function completeCurrentPatient(req, res) {
  try {
    const { doctorId } = req.params;

    const doctorExists = await Doctor.findById(doctorId);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const current = await Appointment.findOne({
      doctor: doctorId,
      status: "scheduled",
      appointmentDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).sort("queueNumber");

    if (!current) {
      return res
        .status(404)
        .json({ message: "No current patient to complete" });
    }

    current.status = "completed";
    await current.save();

    const remaining = await Appointment.find({
      doctor: doctorId,
      status: "scheduled",
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
    }).sort("queueNumber");
    for (let index = 0; index < remaining.length; index += 1) {
      const appointment = remaining[index];
      appointment.queueNumber = index + 1;
      appointment.estimatedWaitTime = index * 15;
      await appointment.save();
    }

    const updatedQueue = await Appointment.find({
      doctor: doctorId,
      status: "scheduled",
      appointmentDate: { $gte: startOfDay, $lt: endOfDay },
    })
      .populate("patient", "-password")
      .sort("queueNumber");

    req.app.get("io").emit("queueUpdated", updatedQueue);
    req.app.get("io").emit("appointmentUpdated");

    const completedAppointment = await Appointment.findById(
      current._id,
    ).populate("patient", "-password");

    return res.status(200).json(completedAppointment);
  } catch (error) {
    console.error("completeCurrentPatient error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function skipCurrentPatient(req, res) {
  try {
    const { doctorId } = req.params;

    const doctorExists = await Doctor.findById(doctorId);

    if (!doctorExists) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const queue = await Appointment.find({
      doctor: doctorId,
      status: "scheduled",
      appointmentDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).sort("queueNumber");

    if (queue.length === 0) {
      return res.status(404).json({
        message: "No current patient to skip",
      });
    }

    if (queue.length === 1) {
      return res.status(400).json({
        message: "Cannot skip when only one patient is in queue",
      });
    }

    const currentPatient = queue.shift();

    queue.push(currentPatient);

    for (let index = 0; index < queue.length; index += 1) {
      queue[index].queueNumber = index + 1;
      queue[index].estimatedWaitTime = index * 15;

      await queue[index].save();
    }

    const updatedQueue = await Appointment.find({
      doctor: doctorId,
      status: "scheduled",
      appointmentDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
      .populate("patient", "-password")
      .sort("queueNumber");

    req.app.get("io").emit("queueUpdated", updatedQueue);
    req.app.get("io").emit("appointmentUpdated");

    return res.status(200).json(updatedQueue);
  } catch (error) {
    console.error("skipCurrentPatient error:", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function getPatientQueue(req, res) {
  try {
    const { patientId } = req.params;

    const patientExists = await User.findById(patientId);

    if (!patientExists) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const appointment = await Appointment.findOne({
      patient: patientId,
      status: "scheduled",
    })
      .populate("doctor")
      .populate("patient", "-password")
      .sort("appointmentDate");

    if (!appointment) {
      return res.status(404).json({
        message: "No active appointment found",
      });
    }

    const startOfDay = new Date(appointment.appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const queue = await Appointment.find({
      doctor: appointment.doctor._id,
      status: "scheduled",
      appointmentDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
      .populate("patient", "-password")
      .sort("queueNumber");

    const now = new Date();

    const currentPatient =
      queue.length > 0 && new Date(queue[0].appointmentDate) <= now
        ? queue[0]
        : null;

    const patientsAhead = queue.filter(
      (item) => item.queueNumber < appointment.queueNumber,
    ).length;

    return res.status(200).json({
      appointment,
      currentPatient,
      patientsAhead,
      queue,
    });
  } catch (error) {
    console.error("getPatientQueue error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  getCurrentPatient,
  getRemainingQueue,
  completeCurrentPatient,
  skipCurrentPatient,
  getPatientQueue,
};
