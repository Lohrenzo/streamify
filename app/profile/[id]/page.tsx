import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import VideoPlayerClient from "@/app/components/VideoPlayerClient";

/**
 * @interface ProfilePageProps
 * @description Props for the ProfilePage component.
 * @property {object} params - An object containing the route parameters.
 * @property {string} params.id - The unique identifier of the video to be displayed.
 */
interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const { id } = params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    notFound();
  }

  return (
    <main>
      ProfilePage
      <p>Username: {user.username}</p>
      <p>First Name: {user.first_name}</p>
      <p>Last Name: {user.last_name}</p>
      <p>Email: {user.email}</p>
    </main>
  );
}
