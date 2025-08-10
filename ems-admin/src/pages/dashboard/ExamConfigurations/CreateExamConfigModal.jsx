// src/components/CreateExamConfigModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Checkbox
} from "@material-tailwind/react";
import { Snackbar, Alert } from "@mui/material";
import examconfigurationService from "@/service/examconfiguration.service";

export default function CreateExamConfigModal({ open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    total_questions: "",
    pass_mark: "",
    duration_minutes: "",
    allow_retake: false,
    show_timer_warning: false
  });
  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCreate = async () => {
    try {
      setLoading(true);

      const payload = {
        ...formData,
        total_questions: parseInt(formData.total_questions, 10),
        pass_mark: parseInt(formData.pass_mark, 10),
        duration_minutes: parseInt(formData.duration_minutes, 10),
      };

      await examconfigurationService.createExamConfiguration(payload);

      setSnackbar({
        open: true,
        message: "Exam configuration created successfully.",
        severity: "success"
      });

      onSave();
      onClose();
      setFormData({
        total_questions: "",
        pass_mark: "",
        duration_minutes: "",
        allow_retake: false,
        show_timer_warning: false,
      });
    } catch (error) {
      console.error("Failed to create configuration:", error);
      setSnackbar({
        open: true,
        message: "Failed to create exam configuration.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} handler={onClose} size="sm">
        <DialogHeader>Create Exam Configuration</DialogHeader>
        <DialogBody divider>
          <div className="flex flex-col gap-4">
            <Input
              label="Total Questions"
              name="total_questions"
              value={formData.total_questions}
              onChange={handleChange}
            />
            <Input
              label="Pass Mark"
              name="pass_mark"
              value={formData.pass_mark}
              onChange={handleChange}
            />
            <Input
              label="Duration (minutes)"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
            />
            <Checkbox
              label="Allow Retake"
              name="allow_retake"
              checked={formData.allow_retake}
              onChange={handleChange}
            />
            <Checkbox
              label="Show Timer Warning"
              name="show_timer_warning"
              checked={formData.show_timer_warning}
              onChange={handleChange}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>

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
