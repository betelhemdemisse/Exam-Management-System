import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Select,
  Option,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Papa from "papaparse";
import toast, { Toaster } from 'react-hot-toast';
import UserService from "../../service/user.service";
import CreateUserModal from "./user modal/CreateUserModal";
import EditUserModal from "./user modal/EditUserModal";
import * as XLSX from "xlsx";

export function User() {
  const fileInputRef = useRef(null);

  const [filters, setFilters] = useState({
    taken: "",
    not_taken: "",
    examStatus: "",
    examSource: "",
  });

  const [users, setUsers] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [userFile, setUserFile] = useState(null);
  const [allowRetakeConfirmOpen, setAllowRetakeConfirmOpen] = useState(false);
  const [userToToggleRetake, setUserToToggleRetake] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUserUpdated = (id, updatedData) => {
    setUsers((prev) =>
      prev.map((u) => (u.userID === id || u.id === id ? { ...u, ...updatedData } : u))
    );
  };

  const fetchUsers = async () => {
    try {
      const data = await UserService.getUsers();
      const mappedData = data.map(u => ({
        ...u,
        allowRetake: u.allowRetake ?? u.allow_retake ?? false
      }));
      setUsers(mappedData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImportUser = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setUserFile(file);
          setNewUsers(results.data);
          setOpenDialog(true);
          toast.success(`Parsed ${results.data.length} users from CSV`);
        },
        error: (error) => {
          console.error("Failed to parse CSV:", error);
          toast.error("Failed to parse CSV file");
        },
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setUserFile(file);
        setNewUsers(jsonData);
        setOpenDialog(true);
        toast.success(`Parsed ${jsonData.length} users from Excel`);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Unsupported file type. Please upload CSV or Excel file.");
    }
  };

  const handleConfirmImport = async () => {
    try {
      const response = await UserService.importUsers(userFile);
      await fetchUsers();
      toast.success(response.data.message || "Users imported successfully!");
      setUserFile(null);
      setNewUsers([]);
      setOpenDialog(false);
      setPage(0);
    } catch (error) {
      console.error("Failed to import users:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to import users. Please check the file format."
      );
    }
  };

  const handleCancelImport = () => {
    setNewUsers([]);
    setOpenDialog(false);
    setPage(0);
    toast("Import cancelled");
  };

  const handleExportClick = () => {
    try {
      if (filteredUsers.length === 0) {
        toast.error("No users found for the selected filters.");
        return;
      }

      const safeValue = (val) => (val !== null && val !== undefined && val !== "" ? val : "N/A");

      const exportData = filteredUsers.map((user) => ({
        name: safeValue(user.name),
        email: safeValue(user.email),
        login_code: safeValue(user.login_code),
        company: safeValue(user.company),
        position: safeValue(user.position),
        year_of_experience: safeValue(user.year_of_experience),
        exam_source: safeValue(user.exam_source),
        gender: safeValue(user.gender),
        region: safeValue(user.region),
        hasTakenExam: user.hasTakenExam !== undefined ? (user.hasTakenExam ? "Yes" : "No") : "N/A",
        created_at: user.created_at ? new Date(user.created_at).toLocaleString() : "N/A",
      }));

      const csv = Papa.unparse(exportData);
      const bomCsv = "\uFEFF" + csv;
      const url = window.URL.createObjectURL(new Blob([bomCsv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Users exported successfully!");
    } catch (error) {
      console.error("Failed to export users:", error);
      toast.error("Failed to export users");
    }
  };

  const handleDownloadSampleTemplate = () => {
    try {
      const sampleData = [
        {
          name: "John Doe",
          email: "john.doe@example.com",
          company: "Example Company",
          position: "Software Engineer",
          year_of_experience: 5,
          gender: "male",
          region: "Addis Ababa",
          user_type: "data_encoder",
          exam_source: "EAII"
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          company: "Example Company",
          position: "Data Analyst",
          year_of_experience: 3,
          gender: "female",
          region: "Addis Ababa",
          user_type: "supervisor",
          exam_source: "EAII"
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, "user_import_template.xlsx", { bookType: "xlsx", type: "array" });
      toast.success("Template downloaded successfully!");
    } catch (error) {
      console.error("Failed to download sample template:", error);
      toast.error("Failed to download template");
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  // Delete user handlers with toast
  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
    setMenuOpenId(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await UserService.deleteUser(userToDelete);
      setUsers((prev) => prev.filter((u) => u.userID !== userToDelete && u.id !== userToDelete));
      toast.success("User deleted successfully!");
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleToggleAllowRetake = async (user) => {
    try {
      const newValue = !user.allowRetake;
      await UserService.allowRetake(user.userID || user.id, newValue);
      
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          (u.userID || u.id) === (user.userID || user.id)
            ? { ...u, allowRetake: newValue }
            : u
        )
      );
      
      toast.success(`Retake ${newValue ? 'allowed' : 'disallowed'} successfully!`);
      setMenuOpenId(null);
    } catch (error) {
      console.error("Failed to toggle allowRetake:", error);
      toast.error("Failed to update retake permission");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // REMOVED: isSeedData function - no longer needed

  const filteredUsers = users.filter((user) => {
    if (filters.examStatus === "taken" && !user.hasTakenExam) return false;
    if (filters.examStatus === "not_taken" && user.hasTakenExam) return false;
    if (filters.examSource) {
      if (filters.examSource === "N/A") {
        if (user.exam_source) return false;
      } else if (user.exam_source !== filters.examSource) {
        return false;
      }
    }
    if (search) {
      const term = search.toLowerCase();
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.company?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      {/* Toaster */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#22c55e',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />

      <input
        type="file"
        accept=".csv, .xls, .xlsx"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImportUser}
      />

      {/* Delete Confirmation Modal with Warning */}
      <Dialog open={deleteConfirmOpen} handler={handleCancelDelete} size="sm">
        <DialogHeader className="flex items-center gap-2 text-red-600">
          <ExclamationTriangleIcon className="h-6 w-6" />
          Delete User
        </DialogHeader>
        <DialogBody className="py-4">
          <Typography className="text-gray-700">
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
          <Typography className="text-sm text-gray-500 mt-2">
            This will permanently remove the user and all associated data.
          </Typography>
          {userToDelete && (
            <Typography className="text-xs text-gray-400 mt-2">
              User ID: {userToDelete}
            </Typography>
          )}
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button 
            variant="text" 
            color="blue-gray" 
            onClick={handleCancelDelete}
            className="font-medium"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            color="red" 
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Allow Retake Confirmation */}
      <Dialog open={allowRetakeConfirmOpen} handler={() => setAllowRetakeConfirmOpen(false)}>
        <DialogHeader>
          {userToToggleRetake?.allowRetake ? "Disallow Retake" : "Allow Retake"}
        </DialogHeader>
        <DialogBody>
          {userToToggleRetake?.allowRetake
            ? "Are you sure you want to disallow retake for this user?"
            : "Are you sure you want to allow retake for this user?"}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setAllowRetakeConfirmOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={async () => {
              if (userToToggleRetake) {
                await handleToggleAllowRetake(userToToggleRetake);
              }
              setAllowRetakeConfirmOpen(false);
              setUserToToggleRetake(null);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Filters and Actions */}
      <div className="px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-64">
              <Input label="Search User" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="w-40 mr-8">
              <Select
                label="Exam Status"
                value={filters.examStatus}
                onChange={(value) => handleFilterChange("examStatus", value)}
              >
                <Option value="">All Users</Option>
                <Option value="taken">Attended</Option>
                <Option value="not_taken">Absent</Option>
              </Select>
            </div>
            <div className="w-40">
              <Select
                label="Exam Source"
                value={filters.examSource}
                onChange={(value) => handleFilterChange("examSource", value)}
              >
                <Option value="">All</Option>
                <Option value="EAII">EAII</Option>
                <Option value="N/A">N/A</Option>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleDownloadSampleTemplate}>
              Download Template
            </Button>
            <Button size="sm" className="bg-[#1A1D5F] hover:bg-[#2A2D6F] text-white" onClick={handleImportClick}>
              Import
            </Button>
            <Button size="sm" className="bg-[#1A1D5F] hover:bg-[#2A2D6F] text-white" onClick={handleExportClick}>
              Export
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" size="sm" onClick={() => setOpenCreateModal(true)}>
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card shadow={false} className="border border-blue-gray-100">
        <CardBody className="overflow-x-auto px-4 py-4">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-blue-gray-50">
                {[
                  "NO",
                  "Full Name",
                  "Email",
                  "Gender",
                  "Company",
                  "Retake",
                  "Type",
                  "Exam Source",
                  "Log in Code",
                  "Region",
                  "Created At",
                  "Actions",
                ].map((header) => (
                  <th key={header} className="p-4">
                    <Typography variant="small" className="font-semibold uppercase text-blue-gray-600">
                      {header}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, index) => {
                  const isSeed = (user.userID || user.id)?.startsWith('00000000-0000-0000-0000-');
                  return (
                    <tr key={user.userID || user.id || index} className="hover:bg-blue-gray-50 transition-colors">
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700 font-medium">
                          {page * rowsPerPage + index + 1}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm font-semibold text-blue-gray-800">
                          {user.name || user.fullName}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.email}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.gender}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.company}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.allowRetake ? "Yes" : "No"}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.user_type || user.type}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.exam_source || "N/A"}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.login_code}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.region}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-blue-gray-700">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                        </Typography>
                      </td>
                      <td className="p-4 relative">
                        <EllipsisVerticalIcon
                          className="h-5 w-5 text-blue-gray-400 cursor-pointer"
                          onClick={() =>
                            setMenuOpenId(menuOpenId === (user.userID || user.id) ? null : (user.userID || user.id))
                          }
                        />
                        {menuOpenId === (user.userID || user.id) && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <button
                              onClick={() => {
                                setSelectedUserId(user.userID || user.id);
                                setOpenEditModal(true);
                                setMenuOpenId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setUserToToggleRetake(user);
                                setAllowRetakeConfirmOpen(true);
                                setMenuOpenId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
                            >
                              {user.allowRetake ? "Disallow Retake" : "Allow Retake"}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user.userID || user.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4 px-4">
            <Button
              variant="outlined"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {Math.ceil(filteredUsers.length / rowsPerPage)}
            </span>
            <Button
              variant="outlined"
              size="sm"
              disabled={page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <CreateUserModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onUserCreated={handleUserCreated}
      />
      <EditUserModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
      />

      {/* Import Preview Dialog */}
      <Dialog open={openDialog} handler={handleCancelImport} size="lg">
        <DialogHeader>Preview Imported Users</DialogHeader>
        <DialogBody className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {["No", "Full Name", "Email", "Gender", "Company", "Position", "Type", "Region"].map((header) => (
                  <th key={header} className="p-2 border-b text-sm font-semibold text-gray-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {newUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{page * rowsPerPage + idx + 1}</td>
                    <td className="p-2 border-b">{user.name || user.fullName}</td>
                    <td className="p-2 border-b">{user.email}</td>
                    <td className="p-2 border-b">{user.gender}</td>
                    <td className="p-2 border-b">{user.company}</td>
                    <td className="p-2 border-b">{user.position}</td>
                    <td className="p-2 border-b">{user.user_type || user.type}</td>
                    <td className="p-2 border-b">{user.region}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outlined"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {Math.ceil(newUsers.length / rowsPerPage)}
            </span>
            <Button
              variant="outlined"
              size="sm"
              disabled={page >= Math.ceil(newUsers.length / rowsPerPage) - 1}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleCancelImport}>
            Cancel
          </Button>
          <Button color="green" onClick={handleConfirmImport}>
            Confirm Import
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default User;