// Department controller
// Handles department CRUD operations.

const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

async function createDepartment(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
  return res.status(400).json({
    message: 'Name and description are required',
  });
}

if (name.trim().length < 3) {
  return res.status(400).json({
    message: 'Department name must contain at least 3 characters',
  });
}

if (description.trim().length < 5) {
  return res.status(400).json({
    message: 'Description is too short',
  });
}

    const existing = await Department.findOne({
  name: name.trim(),
});
    if (existing) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    const department = await Department.create({
  name: name.trim(),
  description: description.trim(),
});
    return res.status(201).json(department);
  } catch (error) {
    console.error('createDepartment error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getDepartments(req, res) {
  try {
    const departments = await Department.find();
    return res.status(200).json(departments);
  } catch (error) {
    console.error('getDepartments error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getDepartmentById(req, res) {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.status(200).json(department);
  } catch (error) {
    console.error('getDepartmentById error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: 'Name and description are required',
      });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({
        message: 'Department name must contain at least 3 characters',
      });
    }

    if (description.trim().length < 5) {
      return res.status(400).json({
        message: 'Description is too short',
      });
    }

    const existing = await Department.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });

    if (existing) {
      return res.status(400).json({
        message: 'Department name already exists',
      });
    }

    const department = await Department.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!department) {
      return res.status(404).json({
        message: 'Department not found',
      });
    }

    return res.status(200).json(department);

  } catch (error) {
    console.error('updateDepartment error:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const doctorCount = await Doctor.countDocuments({
  department: id,
});

if (doctorCount > 0) {
  return res.status(400).json({
    message:
      'Cannot delete department because doctors are assigned to it',
  });
}

    await department.deleteOne();
    return res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('deleteDepartment error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
