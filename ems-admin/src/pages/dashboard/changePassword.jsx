import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthService from "../../service/auth.service";
import { useStateContext } from "../../contextProvider";

export function ChangePassword() {
  const navigate = useNavigate();
  const { token } = useStateContext();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      const response = await AuthService.changePassword(
        currentPassword,
        newPassword,
        token
      );
      if (response.status === 201) {
        setSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => navigate("/dashboard/home"), 2000);
      }
    } catch (err) {
      setError("Failed to change password. Please try again.");
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Change your password below.
          </Typography>
        </div>

        <form className="mt-8 mb-2" onSubmit={handleSubmit}>
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="medium" color="blue-gray" className="-mb-3 font-medium">
              Current Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />

            <Typography variant="medium" color="blue-gray" className="-mb-3 font-medium">
              New Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />

            <Typography variant="medium" color="blue-gray" className="-mb-3 font-medium">
              Confirm New Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>

          {error && (
            <Typography color="red" className="mt-2 text-sm">
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="green" className="mt-2 text-sm">
              {success}
            </Typography>
          )}

          <Button type="submit" className="mt-6" fullWidth>
            Change Password
          </Button>
        </form>
      </div>
    </section>
  );
}

export default ChangePassword;
