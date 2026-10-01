import type { Metadata } from "next";
import { UserList } from "@/modules/users/components/user-list";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage() {
  return <UserList />;
}
