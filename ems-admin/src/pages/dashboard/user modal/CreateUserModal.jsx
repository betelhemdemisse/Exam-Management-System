import React, { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";
import toast from 'react-hot-toast';
import UserService from "../../../service/user.service";

export default function CreateUserModal({ open, onClose, onUserCreated }) {
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
        user_type: "",
        exam_source: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

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
        // Validate required fields
        if (!formData.name || !formData.email || !formData.role) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Check if password is required (only for non-student roles)
        if (formData.role !== "student" && !formData.password) {
            toast.error("Password is required for this role");
            return;
        }

        setIsSubmitting(true);
        try {
            const newUser = await UserService.createUser(formData);
            onUserCreated(newUser);
            toast.success("User created successfully!");
            onClose();
            // Reset form
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "student",
                company: "",
                position: "",
                year_of_experience: 0,
                gender: "",
                region: "",
                user_type: "",
                exam_source: ""
            });
        } catch (error) {
            console.error("Failed to create user:", error);
            toast.error(error.response?.data?.message || "Failed to create user. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStudent = formData.role === "student";

    return (
        <Dialog open={open} handler={onClose} size="sm">
            <DialogHeader>Create New User</DialogHeader>
            <DialogBody divider className="max-h-[70vh] overflow-y-auto">
                <div className="flex flex-col gap-4">
                    <Input 
                        label="Full Name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required
                    />
                    <Input 
                        label="Email" 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required
                    />

                    <Select 
                        label="Role" 
                        value={formData.role} 
                        onChange={(val) => handleSelectChange("role", val)}
                        required
                    >
                        <Option value="student">Student</Option>
                        <Option value="admin">Admin</Option>
                    </Select>

                    {/* Password field - hidden for students */}
                    {!isStudent && (
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={!isStudent}
                        />
                    )}

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
                        type="number" 
                        name="year_of_experience" 
                        value={formData.year_of_experience} 
                        onChange={handleChange} 
                    />

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
                        <Option value="data_encoder">Data Encoder</Option>
                        <Option value="supervisor">Supervisor</Option>
                    </Select>

                    <Select 
                        label="Exam Source" 
                        value={formData.exam_source} 
                        onChange={(val) => handleSelectChange("exam_source", val)}
                    >
                        <Option value="">None</Option>
                        <Option value="EAII">EAII</Option>
                    </Select>
                </div>
            </DialogBody>
            <DialogFooter>
                <Button 
                    variant="text" 
                    color="red" 
                    onClick={onClose} 
                    className="mr-2"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button 
                    color="green" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}