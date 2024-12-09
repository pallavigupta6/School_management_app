import React, { useState, useEffect } from "react";
import Table from "../custom/Table";
import axios from "axios";
import { baseurl } from "../../baseurl/baseurl.js";

const ClassManagement = () => {
  const columns = [
    "Class Name",
    "Year",
    "Teacher",
    "Student Count",
    "Student Fees",
    "Max Students",
    "Actions",
  ];

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPopupOpen, setPopupOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [teachers, setTeachers] = useState([]);

  const [newClass, setNewClass] = useState({
    name: "",
    year: new Date().getFullYear(),
    teacher: "",
    students: [],
    studentFees: 0,
  });

  const [formErrors, setFormErrors] = useState({}); // To store validation errors

  // Fetch Classes from Backend
  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseurl}/api/classes`);
      const formattedData = response.data.classes.map((classItem) => ({
        id: classItem._id,
        "Class Name": classItem.name,
        Year: classItem.year,
        Teacher: classItem.teacher
          ? { id: classItem.teacher._id, name: classItem.teacher.name }
          : { id: null, name: "N/A" },
        "Student Count": classItem.students.length,
        "Student Fees": classItem.studentFees || 0,
        "Max Students": classItem.maxStudents || 0,
      }));
      setData(formattedData || []);
    } catch (err) {
      setError("Failed to fetch classes");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Teachers from Backend
  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/teachers`);
      setTeachers(response.data.teachers || []);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // Clear errors on input change
  };

  // Validate the Form
  const validateForm = () => {
    const errors = {};

    if (!newClass.name || newClass.name.trim() === "") {
      errors.name = "Class Name is required.";
    }
    if (!newClass.year || isNaN(newClass.year) || newClass.year < 1) {
      errors.year = "Year must be a valid positive number.";
    }
    if (!newClass.teacher || newClass.teacher.trim() === "") {
      errors.teacher = "Please select a teacher.";
    }
    if (isNaN(newClass.studentFees) || newClass.studentFees < 0) {
      errors.studentFees = "Fees must be a non-negative number.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Form is valid if no errors
  };

  // Handle Add or Update Class Submission
  const handleSaveClass = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Prevent submission if form is invalid

    try {
      const classData = {
        ...newClass,
        teacher: newClass.teacher || undefined,
        studentFees: parseFloat(newClass.studentFees) || 0,
      };
      if (editMode) {
        await axios.put(`${baseurl}/api/classes/${selectedClassId}`, classData);
      } else {
        await axios.post(`${baseurl}/api/classes`, classData);
      }
      setPopupOpen(false);
      fetchClasses();
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  // Handle Delete Class
  const handleDeleteClass = async (classId) => {
    try {
      await axios.delete(`${baseurl}/api/classes/${classId}`);
      fetchClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  // Handle Edit Class
  const handleEditClass = (classId) => {
    const classToEdit = data.find((item) => item.id === classId);
    setNewClass({
      name: classToEdit["Class Name"],
      year: classToEdit.Year,
      teacher: classToEdit.Teacher.id || "",
      students: classToEdit?.students?.length,
      studentFees: classToEdit["Student Fees"] || 0,
    });
    setSelectedClassId(classId);
    setEditMode(true);
    setPopupOpen(true);
  };

  // Toggle Popup
  const togglePopup = () => {
    if (isPopupOpen) {
      setNewClass({
        name: "",
        year: new Date().getFullYear(),
        teacher: "",
        students: [],
        studentFees: 0,
      });
      setEditMode(false);
      setSelectedClassId(null);
    }
    setPopupOpen(!isPopupOpen);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Class Management
      </h1>

      <div className="flex justify-between items-center mb-6">
        <button
          className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
          onClick={togglePopup}
        >
          Add Class
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={data.map((classItem) => ({
            ...classItem,
            Teacher: classItem.Teacher.name,
            Actions: (
              <div className="flex gap-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  onClick={() => handleEditClass(classItem.id)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  onClick={() => handleDeleteClass(classItem.id)}
                >
                  Delete
                </button>
              </div>
            ),
          }))}
        />
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {editMode ? "Edit Class" : "Add New Class"}
            </h2>

            <form onSubmit={handleSaveClass}>
              <div className="mb-4">
                <label className="block text-gray-700">Class Name</label>
                <input
                  type="text"
                  name="name"
                  value={newClass.name}
                  onChange={handleInputChange}
                  className={`border rounded-lg p-2 w-full ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Class Name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm">{formErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Year</label>
                <input
                  type="number"
                  name="year"
                  value={newClass.year}
                  onChange={handleInputChange}
                  className={`border rounded-lg p-2 w-full ${
                    formErrors.year ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
                {formErrors.year && (
                  <p className="text-red-500 text-sm">{formErrors.year}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Teacher</label>
                <select
                  name="teacher"
                  value={newClass.teacher}
                  onChange={handleInputChange}
                  className={`border rounded-lg p-2 w-full ${
                    formErrors.teacher ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                {formErrors.teacher && (
                  <p className="text-red-500 text-sm">{formErrors.teacher}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Student Fees</label>
                <input
                  type="number"
                  name="studentFees"
                  value={newClass.studentFees}
                  onChange={handleInputChange}
                  className={`border rounded-lg p-2 w-full ${
                    formErrors.studentFees
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Fees"
                />
                {formErrors.studentFees && (
                  <p className="text-red-500 text-sm">
                    {formErrors.studentFees}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                  onClick={togglePopup}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  {editMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
