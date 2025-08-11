import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthService from "../../service/auth.service"; 
import { useStateContext } from "../../contextProvider";
export function SignIn() {
  const navigate = useNavigate();
  const { setToken,setUser,token } = useStateContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    console.log("Login called with email:", email, "and password:", password);
    e.preventDefault();
    setError("");

    try {
     
      const response = await AuthService.login(email,password,setToken);
      if (response.status === 200) {
        navigate("/dashboard/home");
      }
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <Typography variant="h1" className="font-bold mb-4">Login</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Enter your email and password to Login.
          </Typography>
        </div>

        <form className="mt-8 mb-2" onSubmit={handleSubmit}>
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="medium" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />

            <Typography variant="medium" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <Button type="submit" className="mt-6" fullWidth>
            Sign In
          </Button>        
        </form>
      </div>
    </section>
  );
}

export default SignIn;
