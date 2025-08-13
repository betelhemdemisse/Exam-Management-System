import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Typography,
    Tooltip,
    Switch,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
} from "@material-tailwind/react";
import { Snackbar, Alert } from "@mui/material";
import ExamConfigurationService from "../../../service/examconfiguration.service";
import ExamService from "../../../service/exam.service";

export default function BeginExam() {
    const [configs, setConfigs] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // Confirmation modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingConfig, setPendingConfig] = useState(null);

    const fetchConfigs = async () => {
        try {
            const data = await ExamConfigurationService.getAllExamConfigurations();
            const updatedData = data.map(cfg => ({
                ...cfg,
                allow_start: cfg.allow_start ?? false,
            }));
            setConfigs(updatedData);
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

    const openConfirmation = (configID, currentValue) => {
        const examType = configs.find(cfg => cfg.configID === configID)?.exam_type || "Unknown Exam";
        setPendingConfig({ configID, currentValue, examType });
        setConfirmOpen(true);
    };

    const confirmToggle = async () => {
        if (!pendingConfig) return;
        const { configID, currentValue, examType } = pendingConfig;
        try {
            const newValue = !currentValue;
            await ExamService.updateAllowStart(configID, newValue);

            setConfigs(prev =>
                prev.map(cfg =>
                    cfg.configID === configID ? { ...cfg, allow_start: newValue } : cfg
                )
            );

            setSnackbar({
                open: true,
                message: `Allow Start updated to ${newValue ? "True" : "False"} for "${examType}"`,
                severity: "success",
            });
        } catch (error) {
            console.error("Error updating allow_start:", error);
            setSnackbar({
                open: true,
                message: "Failed to update Allow Start.",
                severity: "error",
            });
        } finally {
            setConfirmOpen(false);
            setPendingConfig(null);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <div className="mt-12 mb-8 flex flex-col gap-6">
                <Card shadow={false} className="border border-blue-gray-100">
                    <CardBody className="overflow-x-auto px-4 py-4">
                        <table className="w-full min-w-[700px] text-left">
                            <thead>
                                <tr className="bg-blue-gray-50">
                                    {["NO", "Exam Type", "Allow Start"].map(header => (
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
                                        <td className="p-4">{cfg.exam_type}</td>
                                        <td className="p-4">
                                            <Tooltip content={cfg.allow_start ? "Currently ON" : "Currently OFF"}>
                                                <Switch
                                                    checked={cfg.allow_start}
                                                    onChange={() => openConfirmation(cfg.configID, cfg.allow_start)}
                                                    color="green"
                                                />
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <Dialog open={confirmOpen} handler={setConfirmOpen}>
                <DialogHeader>Confirm Action</DialogHeader>
                <DialogBody>
                    {pendingConfig && (
                        <span>
                            Are you sure you want to turn{" "}
                            <strong>{!pendingConfig.currentValue ? "ON" : "OFF"}</strong> Allow Start for{" "}
                            <strong>{pendingConfig.examType}</strong>?
                        </span>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="blue-gray" onClick={() => setConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button color="green" onClick={confirmToggle}>
                        Confirm
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
