import { format } from "date-fns";

const AchievementBadge = ({ achievement, unlockedAt }) => {
  return (
    <div className="relative group">
      <div className="bg-gradient-to-br from-purple via-magenta to-blue p-[3px] rounded-full w-24 h-24 flex items-center justify-center">
        <div className="flex items-center justify-center w-full h-full rounded-full bg-light-grey text-4xl">
          {achievement.icon}
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        <p className="font-medium">{achievement.name}</p>
        <p className="text-sm text-grey">{achievement.description}</p>
        <p className="text-xs text-grey mt-1">
          Unlocked {format(new Date(unlockedAt), "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
};

export default AchievementBadge;
