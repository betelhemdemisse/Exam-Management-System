// src/components/CreateUserModal.jsx
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
import UserService from "../../../service/user.service";

export default function CreateUserModal({ open, onClose, onUserCreated }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        company: "",
        position: "",
        year_of_experience: 0,
        gender: "",
        region: "",
        user_type: "",
        exam_source:""

    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "year_of_experience" ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const newUser = await UserService.createUser(formData);
            onUserCreated(newUser);
            onClose();
            setFormData({
                name: "",
                email: "",
                role: "student",
                company: "",
                position: "",
                year_of_experience: "",
                gender: "",
                region: "",
                user_type: "individual",
                exam_source:""
            });
        } catch (error) {
            console.error("Failed to create user:", error);
        }
    };

    return (
        <Dialog open={open} handler={onClose} size="sm">
            <DialogHeader>Create New User</DialogHeader>
            <DialogBody divider>
                <div className="flex flex-col gap-4">
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                    <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />

                    <Select label="Role" value={formData.role} onChange={(val) => setFormData((prev) => ({ ...prev, role: val }))}>
                        <Option value="student">Student</Option>
                        <Option value="admin">Admin</Option>
                    </Select>

                    <Input label="Company" name="company" value={formData.company} onChange={handleChange} />
                    <Input label="Position" name="position" value={formData.position} onChange={handleChange} />
                    <Input label="Years of Experience" type="number" name="year_of_experience" value={formData.year_of_experience} onChange={handleChange} />

                    <Select label="Gender" value={formData.gender} onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}>
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                    </Select>

                    <Input label="Region" name="region" value={formData.region} onChange={handleChange} />

                    <Select label="User Type" value={formData.user_type} onChange={(val) => setFormData((prev) => ({ ...prev, user_type: val }))}>
                        <Option value="junior">Junior</Option>
                        <Option value="experienced">Experienced</Option>
                    </Select>
                       <Select label="Exam Source" value={formData.exam_source} onChange={(val) => setFormData((prev) => ({ ...prev, exam_source: val }))}>
                        <Option value="mesob">መሶብ</Option>
                        <Option value="land">መሬት</Option>
                    </Select>
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                </div>
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={onClose} className="mr-2">
                    Cancel
                </Button>
                <Button color="green" onClick={handleSubmit}>
                    Create
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
