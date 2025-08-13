import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Tooltip,
  Button,
  Select,
  Option,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Papa from "papaparse";
import UserService from "../../service/user.service";
import CreateUserModal from "./user modal/CreateUserModal";
import EditUserModal from "./user modal/EditUserModal";
import { Snackbar, Alert } from "@mui/material";

export function User() {
  const fileInputRef = useRef(null);
 const [filters, setFilters] = useState({
        taken: "",
        not_taken: "",
    });
     const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
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
  const [allUser, setAllUser] = useState([]);
  const [userFile, setUserFile] = useState(null);
  const [search, setSearch] = useState("");

  const handleUserUpdated = (id, updatedData) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedData } : u))
    );
  };

 const fetchUsers = async () => {
      try {
        const data = await UserService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
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
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setUserFile(file)
        setNewUsers(results.data); 
        setOpenDialog(true);
      },
      error: (error) => {
        console.error("Failed to parse CSV:", error);
      },
    });
  };
  const handleConfirmImport = async () => {
  try {
    const response = await UserService.importUsers(userFile);
    if (response.status === 201) {
     fetchUsers();
      setSnackbar({
        open: true,
        message: response.data.message || "Users imported successfully!",
        severity: "success",
      });
    } else {
     fetchUsers();
      setSnackbar({
        open: true,
        message: response.data?.message || "Failed to import users. Please check the file format.",
        severity: "error",
      });
    }
  } catch (error) {
    console.error("Failed to import users:", error);
    setSnackbar({
      open: true,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to import users. Please check the file format.",
      severity: "error",
    });
  } finally {
    setUserFile(null);
    setNewUsers([]);
    setOpenDialog(false);
    setPage(0);
  }
};

 const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const handleCancelImport = () => {
    setNewUsers([]);
    setAllUser()
    setOpenDialog(false);
    setPage(0);
  };

  const handleExportClick = async (appliedFilters) => {
    try {
      const blob = await UserService.exportUsers(appliedFilters);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleDeleteUser = async (id) => {
    try {
      await UserService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id && u.userID !== id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };
const handleFilterChange = (key, value) => {
  setFilters((prev) => ({
    ...prev,
    [key]: value,
  }));
};

const filteredUsers = users.filter((user) => {
  // Exam status filter
  if (filters.examStatus === "taken" && !user.hasTakenExam) return false;
  if (filters.examStatus === "not_taken" && user.hasTakenExam) return false;

  // Search filter (name, email, company)
  if (search) {
    const term = search.toLowerCase();
    return (
      (user.name?.toLowerCase().includes(term) ||
      user.fullName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.company?.toLowerCase().includes(term))
    );
  }

  return true;
});



  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImportUser}
      />
<div className="flex items-center justify-between px-4 space-x-2">
  <div className="w-56">
    <Input label="Search User"  value={search}onChange={(e) => setSearch(e.target.value)}/>
  </div>

  <div className="flex items-center space-x-2">
    <Select
      label="Exam Status"
      value={filters.examStatus}
      onChange={(value) => handleFilterChange("examStatus", value)}
      sx={{ width: 150 }} 
    >
      <Option value="">All Users</Option>
      <Option value="taken">Attended</Option>
      <Option value="not_taken">Absent</Option>
    </Select>

    <Button size="sm" color="blue" onClick={handleImportClick}>
      Import
    </Button>

    <Button size="sm" color="green" onClick={() => handleExportClick(filters)}>
      Export
    </Button>

    <Button className="w-40"size="sm" color="purple" sx={{ width: 120 }} onClick={() => setOpenCreateModal(true)}>
      Add User
    </Button>
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
                  "Position",
                  "Type",
                  "Region",
                  "Actions",
                ].map((header) => (
                  <th key={header} className="p-4">
                    <Typography
                      variant="small"
                      className="font-semibold uppercase text-blue-gray-600"
                    >
                      {header}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
           {filteredUsers
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((user, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-gray-50 transition-colors"
                >
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
                      {user.position}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700">
                      {user.user_type || user.type}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700">
                      {user.region}
                    </Typography>
                  </td>
                  <td className="p-4 relative">
                    {/* Ellipsis Icon */}
                    <EllipsisVerticalIcon
                      className="h-5 w-5 text-blue-gray-400 cursor-pointer"
                      onClick={() =>
                        setMenuOpenId(menuOpenId === user.id || menuOpenId === user.userID ? null : (user.id || user.userID))
                      }
                    />

                    {/* Dropdown Menu */}
                    {menuOpenId === (user.id || user.userID) && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id || user.userID);
                            setOpenEditModal(true);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setUserToDelete(user.id || user.userID);
                            setDeleteConfirmOpen(true);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>

                      </div>
                    )}
                  </td>
                </tr>
              ))}
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
    onClick={() =>
      setPage((prev) =>
        prev < Math.ceil(filteredUsers.length / rowsPerPage) - 1
          ? prev + 1
          : prev
      )
    }
  >
    Next
  </Button>
</div>

        </CardBody>
      </Card>
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

      <Dialog open={deleteConfirmOpen} handler={() => setDeleteConfirmOpen(false)}>
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setDeleteConfirmOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={async () => {
              await handleDeleteUser(userToDelete);
              setDeleteConfirmOpen(false);
              setUserToDelete(null);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>


      {/* Preview Dialog */}
      <Dialog open={openDialog} handler={handleCancelImport} size="lg">
        <DialogHeader>Preview Imported Users</DialogHeader>
        <DialogBody className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {[
                  "No",
                  "Full Name",
                  "Email",
                  "Gender",
                  "Company",
                  "Position",
                  "Type",
                  "Region",
                ].map((header) => (
                  <th
                    key={header}
                    className="p-2 border-b text-sm font-semibold text-gray-700"
                  >
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
                    <td className="p-2 border-b">
                      {page * rowsPerPage + idx + 1}
                    </td>
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

          {/* Pagination Controls */}
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
              onClick={() =>
                setPage((prev) =>
                  prev < Math.ceil(newUsers.length / rowsPerPage) - 1
                    ? prev + 1
                    : prev
                )
              }
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
       <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                variant="filled"
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
    </div>
  );
}

export default User;
