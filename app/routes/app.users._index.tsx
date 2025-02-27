import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  type ActionFunction,
  type LoaderFunction,
} from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { getAllUsers, updateUser } from "~/data/auth.server";
import { DataTable } from "~/components/tables/users/DataTable";
import { columns } from "~/components/tables/users/columns";
import type { EditUserFormSchema } from "~/models/User";
import { editUserFormSchema, UserRole } from "~/models/User";
import { useEffect } from "react";
import { toast } from "sonner";
import isAllowed from "~/utils/restrictTo.server";

export default function UsersPage() {
  const { data: users } = useLoaderData();
  const fetcher = useFetcher();

  console.log(data);

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.status !== 200) {
      toast.error("Error", { description: fetcher.data.data });
      return;
    }

    toast.success("Success", { description: fetcher.data.data });
  }, [fetcher.data]);

  async function handleUserUpdate(userId: string, data: EditUserFormSchema) {
    console.log(userId, data);
    fetcher.submit(
      { id: userId, user: data },
      { method: "PATCH", encType: "application/json" }
    );
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <main className="container py-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Users Management
          </h2>
        </div>
        <div className="py-4">
          <DataTable
            columns={columns({ onUserUpdate: handleUserUpdate })}
            data={users || []}
          />
        </div>
      </main>
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await isAllowed(request, UserRole.ADMIN);

  if (!user) {
    const error = encodeURIComponent(
      "You must be an administrator to access this route"
    );
    return redirect(`/app?index&error=${error}`);
  }

  try {
    const users = await getAllUsers();
    return { status: 200, data: users };
  } catch (err) {
    console.error(err);
    return data(
      { status: 500, data: "internal server error" },
      { status: 500 }
    );
  }
};

export const action: ActionFunction = async ({ request }) => {
  switch (request.method) {
    case "PATCH":
      try {
        const data = await request.json();

        if (!data.id) {
          return data({
            status: 400,
            data: "a user id is required to patch a user",
          });
        }

        const parsedEditUserData = editUserFormSchema.safeParse(data.user);

        console.log(data);

        if (!parsedEditUserData.success) {
          return data(
            { status: 400, data: "invalid user data" },
            { status: 400 }
          );
        }

        await updateUser(data.id, parsedEditUserData.data);

        return { status: 200, data: "user successfully updated" };
      } catch (err) {
        console.error(err);
        return data(
          { status: 500, data: "internal server error" },
          { status: 500 }
        );
      }

    default:
      return data({ status: 405, data: "method not allowed" }, { status: 405 });
  }
};
