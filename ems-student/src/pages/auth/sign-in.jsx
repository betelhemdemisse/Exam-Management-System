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
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function SignIn() {
  const navigate = useNavigate();
  const { setToken } = useStateContext();
  const [email, setEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [error, setError] = useState("");
  const [showLoginCode, setShowLoginCode] = useState(false);

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
            በአዲስ አበባ ከተማ አስተዳደር የፐብሊክ ሰርቪስና ሰው ሃብት ልማት ቢሮ
            Addis Ababa City Administration Public Service and Human Resource Development Bureau
          </Typography>
          <Typography variant="h2" className="font-bold mb-8">
            Login to account<span className="text-blue-300">.</span>
          </Typography>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              size="md"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!bg-white !text-black rounded-md !text-sm"
              containerProps={{ className: "max-w-xs" }}
              labelProps={{ className: "before:content-none after:content-none" }}
            />
            <div className="relative max-w-xs">
              <Input
                type={showLoginCode ? "text" : "password"}
                size="md"
                placeholder="Login Code"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                className="!bg-white !text-black rounded-md !text-sm"
                labelProps={{ className: "before:content-none after:content-none" }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowLoginCode(!showLoginCode)}
              >
                {showLoginCode ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {error && (
              <Typography color="red" className="text-sm">
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md max-w-xs"
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