import React, { useState, useEffect } from "react";
import Table from "../custom/Table";
import axios from "axios";
import { baseurl } from "../../baseurl/baseurl.js";

const TeacherManagement = () => {
  const columns = [
    "Teacher Name",
    "Gender",
    "Date of Birth",
    "Email",
    "Phone",
    "Salary",
    "Subjects",
    "Actions",
  ];

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPopupOpen, setPopupOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const [teacherForm, setTeacherForm] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    phone: 0,
    salary: 0,
    subjects: "",
  });

  // Fetch Teachers from Backend
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseurl}/api/teachers`);
      const formattedData = response.data.teachers.map((teacher) => ({
        id: teacher._id,
        "Teacher Name": teacher.name,
        Gender: teacher.gender,
        "Date of Birth": teacher.dateOfBirth,
        Email: teacher.email,
        Phone: teacher.phone,
        Salary: teacher.salary,
        Subjects: teacher.subjects.join(", "),
      }));
      setData(formattedData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch teachers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeacherForm((prev) => ({
      ...prev,
      [name]: name === "phone" || name === "salary" ? Number(value) : value,
    }));
  };

  // Handle Add or Update Teacher Submission
  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    const payload = {
      ...teacherForm,
      dateOfBirth: teacherForm.dateOfBirth
        ? new Date(teacherForm.dateOfBirth).toISOString()
        : undefined,
      subjects: teacherForm.subjects.split(", "),
    };
    try {
      if (editMode) {
        await axios.put(
          `${baseurl}/api/teachers/${selectedTeacherId}`,
          payload
        );
      } else {
        await axios.post(`${baseurl}/api/teachers`, payload);
      }
      setPopupOpen(false);
      fetchTeachers();
    } catch (error) {
      console.error("Error saving teacher:", error);
    }
  };

  // Handle Delete Teacher
  const handleDeleteTeacher = async (teacherId) => {
    try {
      await axios.delete(`${baseurl}/api/teachers/${teacherId}`);
      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  // Handle Edit Teacher
  const handleEditTeacher = (teacherId) => {
    const teacherToEdit = data.find((item) => item.id === teacherId);
    setTeacherForm({
      ...teacherForm,
      name: teacherToEdit["Teacher Name"],
      gender: teacherToEdit.Gender,
      dateOfBirth: teacherToEdit["Date of Birth"]
        ? new Date(teacherToEdit["Date of Birth"]).toISOString().slice(0, -1)
        : "",
      email: teacherToEdit.Email,
      phone: teacherToEdit.Phone,
      salary: teacherToEdit.Salary,
      subjects: teacherToEdit.Subjects,
    });
    setSelectedTeacherId(teacherId);
    setEditMode(true);
    setPopupOpen(true);
  };

  // Toggle Popup
  const togglePopup = () => {
    if (isPopupOpen) {
      setTeacherForm({
        name: "",
        gender: "",
        dateOfBirth: "",
        email: "",
        phone: 0,
        salary: 0,
        subjects: "",
      });
      setEditMode(false);
      setSelectedTeacherId(null);
    }
    setPopupOpen(!isPopupOpen);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Management</h1>

      <div className="flex justify-between mb-6">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
          onClick={togglePopup}
        >
          Add Teacher
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-lg text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={data.map((teacher) => ({
            ...teacher,
            Actions: (
              <div className="flex gap-3">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                  onClick={() => handleEditTeacher(teacher.id)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                  onClick={() => handleDeleteTeacher(teacher.id)}
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
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {editMode ? "Edit Teacher" : "Add New Teacher"}
            </h2>

            <form onSubmit={handleSaveTeacher}>
              {/* Name */}
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={teacherForm.name}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Teacher Name"
                  required
                />
              </div>

              {/* Gender */}
              <div className="mb-4">
                <label className="block text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={teacherForm.gender}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="mb-4">
                <label className="block text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={teacherForm.dateOfBirth}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YYYY-MM-DD"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={teacherForm.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email Address"
                  required
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-gray-700">Phone</label>
                <input
                  type="number"
                  name="phone"
                  value={teacherForm.phone}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone Number"
                  required
                />
              </div>

              {/* Salary */}
              <div className="mb-4">
                <label className="block text-gray-700">Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={teacherForm.salary}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Salary"
                />
              </div>

              {/* Subjects */}
              <div className="mb-4">
                <label className="block text-gray-700">Subjects</label>
                <input
                  type="text"
                  name="subjects"
                  value={teacherForm.subjects}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Subjects (comma-separated)"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition duration-300"
                  onClick={togglePopup}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
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

export default TeacherManagement;
