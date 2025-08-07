import React, { useState, useRef } from "react";
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

export function User() {
  const fileInputRef = useRef(null);

  const [users, setUsers] = useState([
    {
      fullName: "John Doe",
      email: "john.doe@email.com",
      campaign: "Summer Promo",
      position: "Marketing Lead",
      type: "Experienced",
    },
    {
      fullName: "Jane Smith",
      email: "jane.smith@email.com",
      campaign: "Winter Campaign",
      position: "Sales Manager",
      type: "Junior",
    },
  ]);

  const [newUsers, setNewUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current.click(); // Trigger the file input
  };

  const handleFileChange = () => {
    // Simulated users from file
    const importedUsers = [
      {
        fullName: "Alice Johnson",
        email: "alice.johnson@email.com",
        campaign: "Spring Drive",
        position: "Content Strategist",
        type: "Junior",
      },
      {
        fullName: "Bob Williams",
        email: "bob.williams@email.com",
        campaign: "Fall Launch",
        position: "Product Manager",
        type: "Experienced",
      },
    ];

    setNewUsers(importedUsers);
    setOpenDialog(true); // Show preview before importing
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
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Import button */}
      <div className="flex justify-end">
        <Button size="sm" color="blue" onClick={handleImportClick}>
          Import
        </Button>
      </div>

      {/* Table */}
      <Card shadow={false} className="border border-blue-gray-100">
        <CardBody className="overflow-x-auto px-4 py-4">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-blue-gray-50">
                {["NO", "Full Name", "Campaign", "Position", "Type", ""].map(
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
                <tr
                  key={index}
                  className="hover:bg-blue-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700 font-medium">
                      {index + 1}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm font-semibold text-blue-gray-800">
                      {user.fullName}
                    </Typography>
                    <Typography className="text-xs text-blue-gray-500">
                      {user.email}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700">
                      {user.campaign}
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
                {user.campaign} – {user.position} – {user.type}
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
