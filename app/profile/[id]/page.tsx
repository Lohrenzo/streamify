import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import Image from "next/image";
import VideoCard from "@/app/components/VideoCard";
import { hideEmail } from "@/utils/tools";

/**
 * @interface ProfilePageProps
 * @description Props for the ProfilePage component.
 */
interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const { id } = params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      videos: {
        orderBy: { uploadDate: "desc" },
        select: {
          id: true,
          title: true,
          manifestUrl: true,
          thumbnailUrl: true,
          uploadDate: true,
          userId: true,
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <main className="min-h-screen text-gray-100 bg-black flex flex-col items-center px-6 py-12">
      {/* User Profile Header */}
      <section className="w-full max-w-5xl app-card p-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image
              src={
                user.image ||
                `https://avatar.iran.liara.run/username?username=${user.first_name}+${user.last_name}`
              }
              alt={user.username!}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-l from-blue-400 to-blue-800 bg-clip-text text-transparent">
              {user.username}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-gray-500 text-sm">{hideEmail(user.email)}</p>

            <div className="flex gap-6 mt-4 text-gray-400 text-sm">
              <div>
                <span className="font-semibold text-white">
                  {user.videos.length}
                </span>{" "}
                {user.videos.length === 1 ? "Video" : "Videos"}
              </div>
              {/* <div>
                <span className="font-semibold text-white">1.2k</span> Followers
              </div>
              <div>
                <span className="font-semibold text-white">589</span> Following
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section className="w-full max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6">Uploaded Videos</h2>

        {user.videos.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No videos uploaded yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.videos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                thumbnailUrl={video.thumbnailUrl}
                uploadDate={video.uploadDate}
              />
              // <div
              //   key={video.id}
              //   className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-300/40 transition duration-300"
              // >
              //   <div className="aspect-video w-full overflow-hidden">
              //     <Image
              //       src={video.thumbnailUrl || "/default-thumbnail.jpg"}
              //       alt={video.title}
              //       width={600}
              //       height={400}
              //       className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
              //     />
              //   </div>
              //   <div className="p-4">
              //     <h3 className="text-lg font-semibold truncate">
              //       {video.title}
              //     </h3>
              //     <p className="text-xs text-gray-400 mt-1">
              //       Uploaded {new Date(video.uploadDate).toLocaleDateString()}
              //     </p>
              //   </div>
              // </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
