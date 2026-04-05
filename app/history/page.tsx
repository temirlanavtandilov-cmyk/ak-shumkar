'use client'

import { useRouter } from "next/navigation";
import HistoryTab from "@/components/HistoryTab";

export default function HistoryPage() {
  const router = useRouter();

  const handleRestore = (listing: any) => {
    localStorage.setItem("tigersRestoreV2", JSON.stringify(listing));
    router.push("/listings");
  };

  return (
    <main className="app-main">
      <HistoryTab onRestore={handleRestore} />
    </main>
  );
}
