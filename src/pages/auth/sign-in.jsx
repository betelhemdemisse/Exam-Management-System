import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";


export function SignIn() {
  return (
  <section className="flex items-center justify-center min-h-screen p-4">
  <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
    <div className="text-center">
      <Typography variant="h1" className="font-bold mb-4">Login</Typography>
      <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
        Enter your email and password to Login.
      </Typography>
    </div>
    
    <form className="mt-8 mb-2">
      <div className="mb-1 flex flex-col gap-6">
        <Typography variant="medium" color="blue-gray" className="-mb-3 font-medium">
          Your email
        </Typography>
        <Input
          size="lg"
          placeholder="name@mail.com"
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
          className="!border-t-blue-gray-200 focus:!border-t-gray-900"
          labelProps={{
            className: "before:content-none after:content-none",
          }}
        />
      </div>
     
      <Button className="mt-6" fullWidth>
        Sign In
      </Button>

      <div className="flex items-center justify-between gap-2 mt-6">
        <Typography variant="small" className="font-medium text-gray-900">
          <a href="#">
            Forgot Password
          </a>
        </Typography>
      </div>
       <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Not registered?
            <Link to="/sign-up" className="text-gray-900 ml-1">Create account</Link>
          </Typography>
    </form>
  </div>
</section>
  );
}

export default SignIn;
