import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/actions/user";
import { NewNavbar } from "@/components/homepage/NewNavbar";
import { NewFooter } from "@/components/homepage/NewFooter";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, bookings] = await Promise.all([
    currentUser(),
    getUserBookings(userId),
  ]);

  return (
    <>
      <NewNavbar />
      <ProfileContent
        userId={userId}
        firstName={user?.firstName ?? ""}
        lastName={user?.lastName ?? ""}
        email={user?.emailAddresses[0]?.emailAddress ?? ""}
        bookings={bookings}
      />
      <NewFooter />
    </>
  );
}
