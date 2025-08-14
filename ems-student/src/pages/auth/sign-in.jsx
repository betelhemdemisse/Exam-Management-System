import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthService from "../../service/auth.service";
import { useStateContext } from "../../contextProvider";
import bgImage from "../../assets/img/login-bg.png";
import logo from "../../assets/img/logo.png";

export function SignIn() {
  const navigate = useNavigate();
  const { setToken } = useStateContext();
  const [email, setEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await AuthService.loginWithCode(loginCode, email, setToken);
      if (response.status === 200 || response.status === 201) {
        navigate("/exam");
      }

    } catch (err) {
      setError("Invalid email or login code.");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Blue overlay */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-80"></div>

      {/* Content */}
      <div
        className="relative z-10 flex w-full max-w-6xl rounded-lg overflow-hidden shadow-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Color overlay */}
        <div className="absolute inset-0 bg-[#1167B4] bg-opacity-80"></div>

        {/* Left side */}
        <div className="relative w-1/2 p-12 flex flex-col justify-center text-white">
          <img src={logo} alt="Logo" className="mb-6 w-24" />
          <Typography variant="h5" className="mb-4 font-normal leading-relaxed">
            Addis Ababa administration Public Service and human Resource Development Bureau
          </Typography>
          <Typography variant="h2" className="font-bold mb-8">
            Login to account<span className="text-blue-300">.</span>
          </Typography>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              size="lg"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!bg-white !text-black rounded-md"
              labelProps={{ className: "before:content-none after:content-none" }}
            />
            <Input
              type="text"
              size="lg"
              placeholder="Login Code"
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value)}
              className="!bg-white !text-black rounded-md"
              labelProps={{ className: "before:content-none after:content-none" }}
            />
            {error && (
              <Typography color="red" className="text-sm">
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md"
            >
              Login
            </Button>
          </form>
        </div>


        {/* Right side */}
        <div className="relative w-1/2"></div>
      </div>

    </div>
  );
}

export default SignIn;
