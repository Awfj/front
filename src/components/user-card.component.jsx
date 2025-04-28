import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

const UserCard = ({ user, removeFollower, handleUnfollow }) => {
  const { personal_info } = user;
  const {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  return (
    <div className="flex items-center justify-between gap-5 mb-5 pb-5 border-b border-grey">
      <Link
        to={`/user/${personal_info.username}`}
        className="flex items-center gap-5"
      >
        <img
          src={personal_info.profile_img}
          className="w-14 h-14 rounded-full"
          alt={personal_info.fullname}
        />
        <div>
          <h1 className="font-medium text-xl line-clamp-1">
            {personal_info.fullname}
          </h1>
          <p className="text-dark-grey">@{personal_info.username}</p>
        </div>
      </Link>

      {personal_info.username !== username && (
        <button
          onClick={() =>
            removeFollower ? removeFollower(user._id) : handleUnfollow(user._id)
          }
          className="btn-light rounded-md bg-red-500 text-white px-4 py-2"
        >
          {removeFollower ? "Remove" : "Unfollow"}
        </button>
      )}
    </div>
  );
};

export default UserCard;