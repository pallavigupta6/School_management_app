import React, { useState, useEffect } from "react";
import Table from "../custom/Table";
import axios from "axios";
import { baseurl } from "../../baseurl/baseurl.js";

const StudentManagement = () => {
  const columns = [
    "Name",
    "Gender",
    "Date of Birth",
    "Email",
    "Phone",
    "Class",
    "Fees Paid",
    "Fees History",
    "Actions",
  ];

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const [studentForm, setStudentForm] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    class: "",
    feesPaid: 0,
    feesHistory: [{ amount: 0, date: "", semester: "" }],
  });

  const validateForm = () => {
    const errors = {};
    if (!studentForm.name.trim()) errors.name = "Name is required.";
    if (!studentForm.gender) errors.gender = "Gender is required.";
    if (!studentForm.dateOfBirth)
      errors.dateOfBirth = "Date of Birth is required.";
    if (!studentForm.email.trim() || !/^\S+@\S+\.\S+$/.test(studentForm.email))
      errors.email = "Valid email is required.";
    if (!studentForm.phone.trim() || !/^\d{10}$/.test(studentForm.phone))
      errors.phone = "Valid phone number is required.";
    if (!studentForm.class) errors.class = "Class selection is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseurl}/api/students`);
      const formattedData = response.data.students.map((student) => ({
        id: student._id,
        Name: student.name,
        Gender: student.gender,
        "Date of Birth": student.dateOfBirth,
        Email: student.email,
        Phone: student.phone,
        Class: student.class?.name || "N/A",
        "Fees Paid": student.feesPaid,
        "Fees History": student.feesHistory
          .map(
            (fee) =>
              `Amount: ${fee.amount}, Date: ${new Date(
                fee.date
              ).toLocaleDateString()}, Semester: ${fee.semester}`
          )
          .join(" | "),
      }));
      setData(formattedData || []);
    } catch (err) {
      setError("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassOptions = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/classes`);
      setClassOptions(response.data.classes || []);
    } catch (err) {
      console.error("Failed to fetch class options:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClassOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: name === "phone" || name === "feesPaid" ? Number(value) : value,
    }));
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...studentForm,
      dateOfBirth: studentForm.dateOfBirth
        ? new Date(studentForm.dateOfBirth).toISOString()
        : undefined,
      feesHistory: studentForm.feesHistory || [],
    };
    try {
      if (editMode) {
        await axios.put(
          `${baseurl}/api/students/${selectedStudentId}`,
          payload
        );
      } else {
        await axios.post(`${baseurl}/api/students`, payload);
      }
      setPopupOpen(false);
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const handleEditStudent = (studentId) => {
    const studentToEdit = data.find((item) => item.id === studentId);
    setStudentForm({
      ...studentForm,
      name: studentToEdit.Name,
      gender: studentToEdit.Gender,
      dateOfBirth: studentToEdit["Date of Birth"]
        ? new Date(studentToEdit["Date of Birth"]).toISOString().slice(0, -1)
        : "",
      email: studentToEdit.Email,
      phone: studentToEdit.Phone,
      class:
        classOptions.find((cls) => cls.name === studentToEdit.Class)?._id || "",
      feesPaid: studentToEdit["Fees Paid"],
      feesHistory: studentToEdit.feesHistory || [],
    });
    setSelectedStudentId(studentId);
    setEditMode(true);
    setPopupOpen(true);
  };

  const togglePopup = () => {
    if (isPopupOpen) {
      setStudentForm({
        name: "",
        gender: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        class: "",
        feesPaid: 0,
        feesHistory: [{ amount: 0, date: "", semester: "" }],
      });
      setFormErrors({});
      setEditMode(false);
      setSelectedStudentId(null);
    }
    setPopupOpen(!isPopupOpen);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Student Management
      </h1>
      <div className="flex justify-between mb-6">
        <button
          className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition"
          onClick={togglePopup}
        >
          Add Student
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={data.map((student) => ({
            ...student,
            Actions: (
              <div className="flex gap-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                  onClick={() => handleEditStudent(student.id)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                  onClick={() => handleDeleteStudent(student.id)}
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
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {editMode ? "Edit Student" : "Add New Student"}
            </h2>
            <form onSubmit={handleSaveStudent}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={studentForm.name}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg"
                  placeholder="Student Name"
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm">{formErrors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={studentForm.gender}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.gender && (
                  <p className="text-red-500 text-sm">{formErrors.gender}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={studentForm.dateOfBirth}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg"
                  required
                />
                {formErrors.dateOfBirth && (
                  <p className="text-red-500 text-sm">
                    {formErrors.dateOfBirth}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={studentForm.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg"
                  placeholder="Email Address"
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={studentForm.phone}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg"
                  placeholder="Phone Number"
                  required
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm">{formErrors.phone}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Class
                </label>
                <select
                  name="class"
                  value={studentForm.class}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg"
                  required
                >
                  <option value="">Select Class</option>
                  {classOptions.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                {formErrors.class && (
                  <p className="text-red-500 text-sm">{formErrors.class}</p>
                )}
              </div>
              <div className="mb-6 flex justify-end">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg mr-4"
                  onClick={togglePopup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  {editMode ? "Save Changes" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
