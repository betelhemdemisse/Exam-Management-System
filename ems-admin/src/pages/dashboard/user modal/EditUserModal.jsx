import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Select,
    Option
} from "@material-tailwind/react";
import UserService from "../../../service/user.service";

const EditUserModal = ({ open, onClose, userId, onUserUpdated }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        company: "",
        position: "",
        year_of_experience: 0,
        gender: "",
        region: "",
        user_type: "junior",
        exam_source: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && userId) {
            console.log("Edit modal opened with userId:", userId);

            const fetchUser = async () => {
                try {
                    setLoading(true);
                    const user = await UserService.getUserById(userId);
                    console.log("Fetched user data:", user);

                    if (!user) {
                        console.warn("No user found for ID:", userId);
                        return;
                    }

                    setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        password: "",
                        role: user.role || "student",
                        company: user.company || "",
                        position: user.position || "",
                        year_of_experience: user.year_of_experience || 0,
                        gender: user.gender || "",
                        region: user.region || "",
                        user_type: user.user_type || "junior",
                        exam_source: user.exam_source || "",
                    });
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUser();
        } else {
            console.log("Modal closed or no userId provided");
        }
    }, [open, userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "year_of_experience" ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await UserService.updateUser(userId, formData);
            onUserUpdated(userId, formData);
            onClose();
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    return (
        <Dialog open={open} handler={onClose} size="md">
            <DialogHeader>Edit User</DialogHeader>
            <DialogBody divider>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <Input
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Input
                            label="Company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                        />
                        <Input
                            label="Position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                        />
                        <Input
                            label="Years of Experience"
                            name="year_of_experience"
                            type="number"
                            value={formData.year_of_experience}
                            onChange={handleChange}
                        />

                        <Select
                            label="Role"
                            value={formData.role}
                            onChange={(val) => handleSelectChange("role", val)}
                        >
                            <Option value="student">Student</Option>
                            <Option value="admin">Admin</Option>
                        </Select>

                        <Select
                            label="Gender"
                            value={formData.gender}
                            onChange={(val) => handleSelectChange("gender", val)}
                        >
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                        </Select>

                        <Input
                            label="Region"
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                        />

                        <Select
                            label="User Type"
                            value={formData.user_type}
                            onChange={(val) => handleSelectChange("user_type", val)}
                        >
                            <Option value="junior">Junior</Option>
                            <Option value="experienced">Experienced</Option>
                        </Select>
                         <Select
                            label="Exam Source"
                            value={formData.exam_source}
                            onChange={(val) => handleSelectChange("exam_source", val)}
                        >
                            <Option value="mesob">መሶብ</Option>
                            <Option value="land">መሬት</Option>
                        </Select>
                    </div>
                )}
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={onClose}>
                    Cancel
                </Button>
                <Button color="green" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default EditUserModal;
