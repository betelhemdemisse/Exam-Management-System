import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Tooltip,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import UserService from '../../service/user.service';

export function User() {
  const fileInputRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await UserService.getUsers();
        console.log("Fetched users:", data);
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImportUser = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const importedUsers = await UserService.importUsers(file);
      setNewUsers(importedUsers);
      setOpenDialog(true);
    } catch (error) {
      console.error("Failed to import users:", error);
    }
  };

  const handleConfirmImport = () => {
    setUsers((prev) => [...prev, ...newUsers]);
    setNewUsers([]);
    setOpenDialog(false);
  };

  const handleCancelImport = () => {
    setNewUsers([]);
    setOpenDialog(false);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImportUser}
      />

      <div className="flex justify-end">
        <Button size="sm" color="blue" onClick={handleImportClick}>
          Import
        </Button>
      </div>

      <Card shadow={false} className="border border-blue-gray-100">
        <CardBody className="overflow-x-auto px-4 py-4">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-blue-gray-50">
                {["NO", "Full Name", "Email", "Gender", "Company", "Position", "Type", "Region", "Actions"].map(
                  (header) => (
                    <th key={header} className="p-4">
                      <Typography
                        variant="small"
                        className="font-semibold uppercase text-blue-gray-600"
                      >
                        {header}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="hover:bg-blue-gray-50 transition-colors">
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700 font-medium">
                      {index + 1}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm font-semibold text-blue-gray-800">
                      {user.name}
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
                      {user.type}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700">
                      {user.region}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Tooltip content="Options">
                      <EllipsisVerticalIcon className="h-5 w-5 text-blue-gray-400 cursor-pointer" />
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={openDialog} handler={handleCancelImport}>
        <DialogHeader>Preview Imported Users</DialogHeader>
        <DialogBody>
          <ul className="list-disc pl-4 space-y-2">
            {newUsers.map((user, idx) => (
              <li key={idx}>
                <strong>{user.fullName}</strong> – {user.email} –{" "}
                {user.Gender} – {user.campaign} – {user.position} – {user.type} – {user.Region}
              </li>
            ))}
          </ul>
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
