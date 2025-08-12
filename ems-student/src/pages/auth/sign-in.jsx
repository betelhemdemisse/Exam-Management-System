import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link ,useNavigate} from "react-router-dom";
import { useStateContext } from "../../contextProvider";
import { useState  } from "react";

import AuthService from "../../service/auth.service";
export function SignIn() {
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [useLoginCode, setUseLoginCode] = useState(false);
  const { setToken, setUser, token } = useStateContext();
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    let response;
    if (useLoginCode) {
      response = await AuthService.loginWithCode(loginCode, setToken);
    } else {
      response = await AuthService.login(email, password, setToken);
    }
   console.log("login response", response);

   if (response.status === 201) {
       navigate("/exam");
      }
   
  } catch (error) {
    console.error("Login failed:", error);
  }
};
  return (
 <section className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <Typography variant="h1" className="font-bold mb-4">
            {useLoginCode ? "Login with Code" : "Login"}
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            {useLoginCode
              ? "Enter your login code to access your account."
              : "Enter your email and password to login."}
          </Typography>
        </div>

        <form className="mt-8 mb-2" onSubmit={handleLogin}>
          <div className="mb-1 flex flex-col gap-6">
            {useLoginCode ? (
              <>
                <Typography variant="medium" color="blue-gray" className="-mb-3 font-medium">
                  Login Code
                </Typography>
                <Input
                  size="lg"
                  placeholder="Enter your login code"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </>
            ) : (
              <>
                <Typography variant="medium" color="blue-gray" className="-mb-3 font-medium">
                  Your Email
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
              </>
            )}
          </div>

          <Button className="mt-6" fullWidth type="submit">
            {useLoginCode ? "Sign In with Code" : "Sign In"}
          </Button>

          <div className="flex items-center justify-between gap-2 mt-6">
            <Typography
              variant="medium"
              className="font-medium text-gray-900 cursor-pointer"
              onClick={() => setUseLoginCode(!useLoginCode)}
            >
              {useLoginCode
                ? "Back to Email & Password Login"
                : "Login with Code"}
            </Typography>
          </div>

       
        </form>
      </div>
    </section>
  );
}

export default SignIn;
