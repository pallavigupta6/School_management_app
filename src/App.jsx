// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/layout/Navbar";
// import Sidebar from "./components/layout/Sidebar";
// // import Dashboard from "./pages/Dashboard";
// // import ClassManagement from "./pages/ClassManagement";
// // import TeacherManagement from "./pages/TeacherManagement";
// // import StudentManagement from "./pages/StudentManagement";
// // import ClassAnalytics from "./pages/ClassAnalytics";

// const App = () => (
//   <Router>
//     <div className="w-screen">
//       {/* <Sidebar /> */}
//       {/* <div className="flex-1"> */}
//       <div className="row">
//         <div className="col-12">
//           <Navbar />
//         </div>
//       </div>

//       <div className="p-6">
//         {/* <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/classes" element={<ClassManagement />} />
//             <Route path="/teachers" element={<TeacherManagement />} />
//             <Route path="/students" element={<StudentManagement />} />
//             <Route path="/classes/:id" element={<ClassAnalytics />} />
//           </Routes> */}
//         {/* </div> */}
//       </div>
//     </div>
//   </Router>
// );

// export default App;

// // const person = { name: 'Charlie', greet() {
// //    console.log(`Hi, my name is ${this.name}`); } };
// //    const greetPerson = person.greet.bind(person);
// //    setTimeout(greetPerson, 1000); // Output: Hi, my name is Charlie (after 1 second)

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import ClassManagement from "./components/pages/ClassManagement";
import Dashboard from "./components/pages/Dashboard";
import TeacherManagement from "./components/pages/TeacherManagement";
import StudentManagement from "./components/pages/StudentManagement";
// import ClassAnalytics from "./components/pages/ClassAnalytics";

const App = () => {
  return (
    <Router>
      <Navbar />
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/classes" element={<ClassManagement />} />
          <Route path="/Teachers" element={<TeacherManagement />} />
          <Route path="/students" element={<StudentManagement />} />
          {/* <Route path="/Analytics" element={<ClassAnalytics />} /> */}
          {/* <Route path="/students" element={<StudentManagement />} /> */}

          {/* <Route path="*" element={<NotFound />} />{" "} */}
          {/* Catch-all for undefined routes */}
        </Routes>
      </main>
    </Router>
  );
};

export default App;
