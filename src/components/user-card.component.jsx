import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import DropdownMenu from "./dropdown-menu.component";

const UserCard = ({ user, hasDropdownMenu = false, options }) => {
  const { personal_info, role } = user;
  const {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const getBorderStyle = (role) => {
    if (role === "admin") {
      return "border-red";
    } else if (role === "moderator") {
      return "border-green-500";
    }
    return "border-magenta";
  };

  return (
    <div className="flex items-center justify-between gap-5 mb-5 pb-5 border-b border-grey">
      <Link
        to={`/user/${personal_info.username}`}
        className="flex items-center gap-5"
      >
        <img
          src={personal_info.profile_img}
          className={`w-14 h-14 rounded-full border-4 ${getBorderStyle(role)}`}
          alt={personal_info.fullname}
        />
        <div>
          <h1 className="font-medium text-xl line-clamp-1">
            {personal_info.fullname}
          </h1>
          <p className="text-dark-grey">@{personal_info.username}</p>
        </div>
      </Link>

      {hasDropdownMenu
        ? personal_info.username !== username && (
            <DropdownMenu items={options} />
          )
        : personal_info.username !== username && (
            <button
              onClick={() => options.btnHandler(user._id)}
              className="btn-light rounded-md bg-red-500 text-black px-4 py-2"
            >
              {options.btnMessage}
            </button>
          )}
    </div>
  );
};

export default UserCard;
