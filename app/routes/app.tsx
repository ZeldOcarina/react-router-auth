import Navbar from "~/layout/Navbar";

import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/layout/AppSidebar";

import {
  data,
  Outlet,
  redirect,
  useLoaderData,
  useMatches,
  type LoaderFunction,
} from "react-router";
import { getUserFromSession } from "~/data/auth.server";
import { useUser } from "~/context/UserContext";

export default function LayoutAppPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <Navbar />
        <main className="flex-grow w-full h-full flex justify-center">
          <div className="px-6 3xl:px-0 container w-full space-y-4">
            <Outlet />
          </div>
        </main>
        <div className="flex justify-between pb-6 px-6 items-center">
          <SidebarTrigger variant="outline" className="p-4" />
        </div>
      </div>
    </SidebarProvider>
  );
}

export const loader: LoaderFunction = async (args) => {
  const userId = await getUserFromSession(args.request);

  if (!userId) return redirect("/sign-in");

  return data(
    {},
    {
      headers: {
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' https://f.vimeocdn.com https://www.gstatic.com; connect-src 'self'; img-src 'self'; style-src 'self';",
      },
    }
  );
};
