import { usePublicStats } from "@/hooks/usePublicStats";

const StatsSection = () => {
  const { data } = usePublicStats();

  const stats = [
    { value: data ? `${data.patients.toLocaleString()}+` : "500+", label: "Families Served", detail: "Across all regions" },
    { value: data ? `${data.caregivers}+` : "0+", label: "Verified Caregivers", detail: "Licensed professionals" },
    { value: data ? `${data.sessions.toLocaleString()}+` : "1,000+", label: "Care Sessions", detail: "Completed successfully" },
    { value: data ? `${data.averageRating}/5` : "4.9/5", label: "Average Rating", detail: "Patient satisfaction" },
  ];

  return (
    <section className="bg-primary border-b border-primary/80">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/20">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-5 flex flex-col gap-0.5">
              <span className="text-2xl font-bold text-white font-display">{stat.value}</span>
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">{stat.label}</span>
              <span className="text-xs text-white/60">{stat.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
