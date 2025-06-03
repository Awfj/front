import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import DropdownMenu from "./dropdown-menu.component";
import { AnimatePresence, motion } from "framer-motion"; // Add this import

const UserCard = ({ user, hasDropdownMenu = false, options }) => {
  const { personal_info, role, ban, online_status } = user;
  const {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const getBanStatus = (ban) => {
    if (!ban?.isBanned) return null;
    const now = new Date();
    const banEnd = new Date(ban.bannedUntil);
    if (now > banEnd) return null;

    const days = Math.ceil((banEnd - now) / (1000 * 60 * 60 * 24));
    return `Banned for ${days} more days`;
  };

  const getStatusColor = () => {
    if (!online_status) return "bg-grey";
    return online_status.is_online ? "bg-green" : "bg-grey";
  };

  const getBorderStyle = (role) => {
    if (role === "admin") {
      return "border-red";
    } else if (role === "moderator") {
      return "border-green";
    }
    return "border-magenta";
  };

  return (
    <motion.div
      layout
      className="flex items-center justify-between gap-5 mb-5 pb-5 border-b border-grey"
    >
      <div className="flex items-center gap-5">
        <Link
          to={`/user/${personal_info.username}`}
          className="flex items-center gap-5"
        >
          <div className="relative">
            <img
              src={personal_info.profile_img}
              className={`w-14 h-14 rounded-full border-4 ${getBorderStyle(
                role
              )}`}
              alt={personal_info.fullname}
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor()} 
              border-2 border-white dark:border-[#242424]`}
              title={
                online_status?.is_online
                  ? "Online"
                  : `Last seen: ${new Date(
                      online_status?.last_active
                    ).toLocaleString()}`
              }
            />
          </div>
          <motion.div layout="position">
            <h1 className="font-medium text-xl line-clamp-1">
              {personal_info.fullname}
            </h1>
            <p className="text-dark-grey">@{personal_info.username}</p>
            <div className="h-6">
              {" "}
              {/* Fixed height container for ban status */}
              <AnimatePresence initial={false} mode="wait">
                {ban?.isBanned && (
                  <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                    }}
                    className="text-red text-sm"
                  >
                    {getBanStatus(ban)}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </Link>
      </div>

      {hasDropdownMenu ? (
        <DropdownMenu items={options} />
      ) : (
        personal_info.username !== username && (
          <button
            onClick={() => options.btnHandler(user._id)}
            className="btn-light rounded-md bg-red-500 text-black px-4 py-2"
          >
            {options.btnMessage}
          </button>
        )
      )}
    </motion.div>
  );
};

export default UserCard;
