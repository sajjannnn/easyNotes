export default function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card-hover">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gray-800 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value : 0}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
