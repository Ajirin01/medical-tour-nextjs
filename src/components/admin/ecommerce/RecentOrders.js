import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";

const tableData = [
  {
    id: 1,
    name: "Blood Test Package",
    variants: "2 Variants",
    category: "Lab Service",
    price: "$150.00",
    status: "Completed",
    image: "/images/lab-test.jpg",
  },
  {
    id: 2,
    name: "Consultation with Dr. Smith",
    variants: "1 Variant",
    category: "Medical Consultation",
    price: "$200.00",
    status: "Pending",
    image: "/images/consult.jpg",
  },
  {
    id: 3,
    name: "MRI Scan",
    variants: "1 Variant",
    category: "Lab Service",
    price: "$800.00",
    status: "Completed",
    image: "/images/meds.jpg",
  },
  {
    id: 4,
    name: "Surgery Consultation with Dr. Lee",
    variants: "1 Variant",
    category: "Medical Consultation",
    price: "$300.00",
    status: "Canceled",
    image: "/images/consult.jpg",
  },
  {
    id: 5,
    name: "ECG Test",
    variants: "1 Variant",
    category: "Lab Service",
    price: "$120.00",
    status: "Completed",
    image: "/images/lab-test.jpg",
  },
];

export default function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Medical & Lab Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Service Name
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Category
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image width={50} height={50} src={service.image} className="h-[50px] w-[50px]" alt={service.name} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {service.name}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {service.variants}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {service.category}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {service.price}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      service.status === "Completed"
                        ? "success"
                        : service.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {service.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
