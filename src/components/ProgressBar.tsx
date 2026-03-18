export default function ProgressBar({ current, total }: { current: number, total: number }) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 mb-6 mt-2 relative overflow-hidden">
      <div 
        className="bg-duo-green h-4 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}
