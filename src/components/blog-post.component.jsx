import React from "react";
import { getDay } from "../common/date";
import { Link } from "react-router-dom";

const BlogPostCard = ({ content, author }) => {
  // const [isGrid, setIsGrid] = React.useState(false);

  let {
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity: { total_likes },
    blog_id: id,
  } = content;
  let { fullname, profile_img, username } = author;
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

      {/* Third row: Tags and Likes */}
      <div className="flex items-center gap-4">
        <span className="btn-light py-1 px-4">{tags[0]}</span>
        <span className="flex items-center gap-2 text-dark-grey">
          <i className="flex-center fi fi-rr-heart text-xl icon"></i>
          {total_likes}
        </span>

        {/* Bookmarked Icon */}
        <span className="flex items-center gap-2 text-dark-grey">
          <i className={`flex-center fi fi-rs-bookmark text-xl icon`}></i>
        </span>
      </div>
    </Link>
  );
};

export default BlogPostCard;
