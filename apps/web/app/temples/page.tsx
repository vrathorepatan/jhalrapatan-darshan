import type { Metadata } from "next";
import templesData from "../../../../data/temples.json";
import TempleDirectory from "@/components/TempleDirectory";

export const metadata: Metadata = {
  title: "झालरापाटन के मंदिर – झालरापाटन दर्शन",
  description:
    "झालरापाटन के सभी प्रमुख मंदिरों की जानकारी – द्वारकाधीश मंदिर, सूर्य मंदिर, शीतलेश्वर महादेव, शांतिनाथ जैन मंदिर, चंद्रभागा घाट।",
};

export default function TemplesPage() {
  return (
    <div className="container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: "0.25rem" }}>झालरापाटन के मंदिर व तीर्थ</h1>
        <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
          घंटियों का नगर (City of Temple Bells) – प्राचीन मंदिरों और ऐतिहासिक धरोहरों की सूची
        </p>
      </header>

      <TempleDirectory temples={templesData} />
    </div>
  );
}
