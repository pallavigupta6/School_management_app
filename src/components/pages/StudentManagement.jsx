

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

  
  // Fetch Students from Backend
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseurl}/api/students`);
      const formattedData = response.data.students.map((student) => ({
        id: student._id,
        Name: student.name,
        Gender: student.gender,
        // "Date of Birth": new Date(student.dateOfBirth).toLocaleDateString(),
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

  // Fetch Class Options
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

  // Handle Form Input Changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: name === "phone" || name === "feesPaid" ? Number(value) : value,
    }));
  };

  // Handle Fees History Changes
  const handleFeesHistoryChange = (index, field, value) => {
    const updatedFeesHistory = [...studentForm.feesHistory];
    updatedFeesHistory[index][field] =
      field === "amount" ? Number(value) : value;
    setStudentForm((prev) => ({ ...prev, feesHistory: updatedFeesHistory }));
  };

  // Add Fee Record
  const addFeeRecord = () => {
    setStudentForm((prev) => ({
      ...prev,
      feesHistory: [...prev.feesHistory, { amount: 0, date: "", semester: "" }],
    }));
  };

  // Handle Add or Update Student Submission
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const payload = {
      ...studentForm,
      dateOfBirth: studentForm?.dateOfBirth
        ? new Date(studentForm.dateOfBirth).toISOString()
        : undefined,
      feesHistory: studentForm?.feesHistory || [],
    };
    console.log("Prepared payload:", payload);

    try {
      if (editMode) {
        console.log("Editing student with ID:", selectedStudentId);
        await axios.put(
          `${baseurl}/api/students/${selectedStudentId}`,
          payload
        );
      } else {
        console.log("Adding new student:", payload);
        await axios.post(`${baseurl}/api/students`, payload);
      }
      setPopupOpen(false);
      fetchStudents();
    } catch (error) {
      console.error(
        "Error saving student:",
        error.response || error.message || error
      );
    }
  };

  // Handle Delete Student
  const handleDeleteStudent = async (studentId) => {
    try {
      await axios.delete(`${baseurl}/api/students/${studentId}`);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  // Handle Edit Student
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

  // Toggle Popup
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
      setEditMode(false);
      setSelectedStudentId(null);
    }
    setPopupOpen(!isPopupOpen);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Student Management</h1>

      <div className="flex justify-between mb-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={togglePopup}
        >
          Add Student
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Table
          columns={columns}
          data={data.map((student) => ({
            ...student,
            Actions: (
              <div className="flex gap-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleEditStudent(student.id)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
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
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit Student" : "Add New Student"}
            </h2>

            <form onSubmit={handleSaveStudent}>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={studentForm.name}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 w-full"
                  placeholder="Student Name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={studentForm.gender}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 w-full"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={studentForm.dateOfBirth}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={studentForm.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 w-full"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={studentForm.phone}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 w-full"
                  placeholder="Phone Number"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Class</label>
                <select
                  name="class"
                  value={studentForm.class}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 w-full"
                  required
                >
                  <option value="">Select Class</option>
                  {classOptions.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Fees Paid</label>
                <input
                  type="number"
                  name="feesPaid"
                  value={studentForm.feesPaid}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 w-full"
                  placeholder="Fees Paid"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Fees History</label>
                {studentForm.feesHistory.map((fee, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={fee.amount}
                      onChange={(e) =>
                        handleFeesHistoryChange(index, "amount", e.target.value)
                      }
                      className="border border-gray-300 p-2 w-full mb-1"
                      required
                    />
                    <input
                      type="date"
                      value={fee.date}
                      onChange={(e) =>
                        handleFeesHistoryChange(index, "date", e.target.value)
                      }
                      className="border border-gray-300 p-2 w-full mb-1"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Semester"
                      value={fee.semester}
                      onChange={(e) =>
                        handleFeesHistoryChange(
                          index,
                          "semester",
                          e.target.value
                        )
                      }
                      className="border border-gray-300 p-2 w-full"
                      required
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                  onClick={addFeeRecord}
                >
                  Add Fee Record
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={togglePopup}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
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

export default StudentManagement;
