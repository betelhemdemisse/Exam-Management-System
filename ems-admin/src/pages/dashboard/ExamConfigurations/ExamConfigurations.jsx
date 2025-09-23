import React, { useEffect, useState } from "react";
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
import { Snackbar, Alert } from "@mui/material";
import { TrashIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import ExamConfigurationService from "../../../service/examconfiguration.service";
import EditExamConfigModal from "./EditExamConfigModal";
import CreateExamConfigModal from "./CreateExamConfigModal";

export default function ExamConfigurations() {
  const [configs, setConfigs] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState(null);

  // For delete confirmation modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchConfigs = async () => {
    try {
      const data = await ExamConfigurationService.getAllExamConfigurations();
      setConfigs(data);
    } catch (error) {
      console.error("Failed to fetch configurations:", error);
      setSnackbar({
        open: true,
        message: "Failed to load configurations.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await ExamConfigurationService.deleteExamConfiguration(deleteId);
      setConfigs((prev) => prev.filter((cfg) => cfg.configID !== deleteId));
      setSnackbar({
        open: true,
        message: "Configuration deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to delete configuration:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete configuration.",
        severity: "error",
      });
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (id) => {
    setSelectedConfigId(id);
    setIsEditOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <div className="mt-12 mb-8 flex flex-col gap-6">
        <div className="flex justify-end">
          <Button
            color="green"
            className="flex items-center gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-5 w-5" /> Add Configuration
          </Button>
        </div>

        <Card shadow={false} className="border border-blue-gray-100">
          <CardBody className="overflow-x-auto px-4 py-4">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="bg-blue-gray-50">
                  {[
                    "NO",
                    "Total Questions",
                    "Pass Mark",
                    "Duration (mins)",
                    "Exam Type",
                    "Exam Source",
                    "Allow Retake",
                    "Show Timer Warning",
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
                {configs.map((cfg, index) => (
                  <tr key={cfg.configID} className="hover:bg-blue-gray-50 transition-colors">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{cfg.total_questions}</td>
                    <td className="p-4">{cfg.pass_mark}</td>
                    <td className="p-4">{cfg.duration_minutes}</td>
                    <td className="p-4">{cfg.exam_type}</td>
                    <td className="p-4">{cfg.exam_source}</td>
                    <td className="p-4">{cfg.allow_retake ? "Yes" : "No"}</td>
                    <td className="p-4">{cfg.show_timer_warning ? "Yes" : "No"}</td>
                    <td className="p-4 flex gap-2">
                      <Tooltip content="Edit">
                        <PencilSquareIcon
                          className="h-5 w-5 text-blue-500 cursor-pointer"
                          onClick={() => handleEdit(cfg.configID)}
                        />
                      </Tooltip>
                      <Tooltip content="Delete">
                        <TrashIcon
                          className="h-5 w-5 text-red-500 cursor-pointer"
                          onClick={() => handleDeleteClick(cfg.configID)}
                        />
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Edit Modal */}
        <EditExamConfigModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          configId={selectedConfigId}
          onSave={fetchConfigs}
        />

        {/* Create Modal */}
        <CreateExamConfigModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={fetchConfigs}
        />

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteOpen} handler={setIsDeleteOpen}>
          <DialogHeader>Confirm Deletion</DialogHeader>
          <DialogBody>
            Are you sure you want to delete this configuration? This action cannot be undone.
          </DialogBody>
          <DialogFooter>
            <Button variant="text" color="blue-gray" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      </div>

      {/* Snackbar */}
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
    </>
  );
}
