import {
  Card,
  CardBody,
  Typography,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

export function User() {
  const users = [
    {
      fullName: "John Doe",
      email: "john.doe@email.com",
      campaign: "Summer Promo",
      position: "Marketing Lead",
    },
    {
      fullName: "Jane Smith",
      email: "jane.smith@email.com",
      campaign: "Winter Campaign",
      position: "Sales Manager",
    },
  ];

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      {/* Import button outside the card */}
      <div className="flex justify-end">
        <Button size="sm" color="blue">
          Import
        </Button>
      </div>

      <Card shadow={false} className="border border-blue-gray-100">
        <CardBody className="overflow-x-auto px-4 py-4">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="bg-blue-gray-50">
                {["NO", "Full Name", "Campaign", "Position", ""].map((header) => (
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
              {users.map((user, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700 font-medium">
                      {index + 1}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm font-semibold text-blue-gray-800">
                      {user.fullName}
                    </Typography>
                    <Typography className="text-xs text-blue-gray-500">
                      {user.email}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700">
                      {user.campaign}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm text-blue-gray-700">
                      {user.position}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Tooltip content="Options">
                      <EllipsisVerticalIcon className="h-5 w-5 text-blue-gray-400 cursor-pointer" />
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default User;
