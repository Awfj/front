import React, { useContext, useEffect, useState } from "react";
import { getDay } from "../common/date";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import axios from "axios";

const BlogPostCard = ({ content, author }) => {
  // const [isGrid, setIsGrid] = React.useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { userAuth } = useContext(UserContext);

  let {
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity: { total_likes, total_comments },
    blog_id: id,
  } = content;
  let { fullname, profile_img, username } = author;

  useEffect(() => {
    if (userAuth.access_token) {
      // Use single endpoint to check both liked and bookmarked status

      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/user-interactions",
          { _id: content._id },
          {
            headers: {
              Authorization: `Bearer ${userAuth.access_token}`,
            },
          }
        )
        .then(({ data: { isLiked, isBookmarked } }) => {
          setIsLiked(Boolean(isLiked));
          setIsBookmarked(Boolean(isBookmarked));
        })
        .catch((err) => console.log(err));
    }
  }, [userAuth.access_token, id]);

  return (
    <Link
      to={`/blog/${id}`}
      className="flex flex-col border-b border-grey pb-5 mb-4"
    >
      {/* First row: Avatar, Author, Date */}
      <div className="flex gap-2 items-center mb-4">
        <img
          src={profile_img}
          alt={fullname}
          className="w-6 h-6 rounded-full"
        />
        <p className="line-clamp-1">
          {fullname} @{username}
        </p>
        <p className="min-w-fit">{getDay(publishedAt)}</p>
      </div>

      {/* Second row: Banner, Title, Description */}
      <div className="flex gap-6 mb-4">
        <div className="h-32 w-32 bg-grey flex-shrink-0">
          <img
            src={banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="blog-title text-xl font-bold mb-2">{title}</h1>
          <p className="text-dark-grey line-clamp-2">{des}</p>
        </div>
      </div>

      {/* Third row: Tags, Likes, and Comments */}
      <div className="flex items-center gap-4">
        <span className="btn-light py-1 px-4">{tags[0]}</span>
        <span className="flex items-center gap-2 text-dark-grey">
          <i
            className={`fi fi-${isLiked ? "sr" : "rr"}-heart text-xl icon ${
              isLiked ? "text-red" : ""
            }`}
          ></i>
          {total_likes}
        </span>
        <span className="flex items-center gap-2 text-dark-grey">
          <i className="flex-center fi fi-rr-comment-dots text-xl icon"></i>
          {total_comments}
        </span>

        {/* Bookmarked Icon */}
        <span className="flex items-center gap-2 text-dark-grey">
          <i
            className={`fi fi-${
              isBookmarked ? "sr" : "rr"
            }-bookmark text-xl icon ${isBookmarked ? "text-purple" : ""}`}
          ></i>
        </span>
      </div>
    </Link>
  );
};

export default BlogPostCard;
