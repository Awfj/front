import React from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const BlogPostCardMini = ({ blog, author, isLastItem }) => {
  const { banner, blog_id, title, des, publishedAt } = blog;
  const { fullname, username, profile_img } = author;

  return (
    <div
      className={`flex flex-col gap-4 pb-6 ${
        !isLastItem ? "border-b border-grey" : ""
      }`}
    >
      {/* Author info */}
      <div className="flex items-center gap-2">
        <Link
          to={`/user/${username}`}
          className="flex items-center gap-2 hover:text-purple"
        >
          <img
            src={profile_img}
            alt={fullname}
            className="w-6 h-6 rounded-full border border-magenta"
          />
          <p className="line-clamp-1 transition-custom">{fullname}</p>
        </Link>
        <span className="text-dark-grey">•</span>
        <span className="text-dark-grey text-sm">{getDay(publishedAt)}</span>
      </div>

      {/* Blog content */}
      <Link to={`/blog/${blog_id}`} className="flex gap-4 group">
        {/* Text content */}
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-2 group-hover:text-purple transition-custom">
            {title}
          </h3>
          <p className="text-dark-grey line-clamp-2 text-sm">{des}</p>
        </div>

        {/* Image */}
        <img
          src={banner}
          alt={title}
          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
        />
      </Link>
    </div>
  );
};

export default BlogPostCardMini;
