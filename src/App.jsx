import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import { AdminRoute, ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import MyBooks from "./pages/MyBooks";
import DigitalResources from "./pages/DigitalResources";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBooks from "./pages/admin/ManageBooks";
import BorrowRequests from "./pages/admin/BorrowRequests";
import IssuedBooks from "./pages/admin/IssuedBooks";
import ReturnedBooks from "./pages/admin/ReturnedBooks";
import Students from "./pages/admin/Students";
import Resources from "./pages/admin/Resources";

export default function App(){return <Routes>
  <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
  <Route element={<ProtectedRoute/>}><Route element={<Layout/>}>
    <Route path="/" element={<Home/>}/><Route path="/books" element={<Books/>}/><Route path="/books/:id" element={<BookDetails/>}/><Route path="/digital-resources" element={<DigitalResources/>}/><Route path="/my-books" element={<MyBooks/>}/><Route path="/profile" element={<Profile/>}/>
  </Route></Route>
  <Route element={<AdminRoute/>}><Route path="/admin" element={<AdminLayout/>}><Route index element={<AdminDashboard/>}/><Route path="books" element={<ManageBooks/>}/><Route path="borrow-requests" element={<BorrowRequests/>}/><Route path="issued-books" element={<IssuedBooks/>}/><Route path="returned-books" element={<ReturnedBooks/>}/><Route path="students" element={<Students/>}/><Route path="digital-resources" element={<Resources/>}/></Route></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes>}
