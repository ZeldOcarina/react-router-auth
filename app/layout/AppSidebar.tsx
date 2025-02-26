import { Link } from "react-router";
import { Home, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { UserRole, type FrontendUserSchema } from "~/models/User";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/app?index",
    icon: Home,
    role: UserRole.USER,
  },
  {
    title: "Users",
    url: "/app/users?index",
    icon: Users,
    role: UserRole.ADMIN,
  },
];

interface AppSidebarI {
  user: FrontendUserSchema;
}

export function AppSidebar({ user }: AppSidebarI) {
  console.log(user.role);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const component = (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.url.startsWith("http") ? (
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      ) : (
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );

                if (item.role === user.role || user.role === UserRole.ADMIN) {
                  return component;
                }
                return null;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
