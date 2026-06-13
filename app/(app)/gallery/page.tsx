import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import GalleryClient from "./gallery-client";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await searchParams;
  const projectId = resolvedParams.projectId;

  // Se não vier a obra na URL, chuta de volta pro dashboard
  if (!projectId) {
    redirect("/dashboard");
  }

  // Busca todas as fotos daquela obra, ordenadas da mais nova pra mais velha
  const photos = await prisma.photo.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: {
        select: { name: true },
      },
    },
  });

  return <GalleryClient initialPhotos={photos} projectId={projectId} />;
}
