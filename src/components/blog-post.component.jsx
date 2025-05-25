import React, { useContext, useEffect, useState } from "react";
import { getDay } from "../common/date";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import ConfirmDialog from "./confirm-dialog.component";

const BlogPostCard = ({ content, author }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(content.activity.total_likes);
  const { userAuth } = useContext(UserContext);

  const [showReportDialog, setShowReportDialog] = useState(false);

  let {
    publishedAt,
    tags,
    category,
    title,
    des,
    banner,
    activity: { total_comments },
    blog_id: id,
    _id,
  } = content;
  let { fullname, profile_img, username } = author;

  const handleReport = (reason) => {
    if (!userAuth.access_token) {
      return toast.error("Please login to report this blog");
    }

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/report-blog`,
        {
          blog_id: _id,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      )
      .then(() => {
        toast.success("Blog reported successfully");
        setShowReportDialog(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error reporting blog");
      });
  };

  useEffect(() => {
    if (userAuth.access_token) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/user-interactions",
          { _id },
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
  }, [userAuth.access_token, _id]);

  const handleLike = (e) => {
    e.preventDefault(); // Prevent navigation

    if (!userAuth.access_token) {
      return toast.error("Please login to like this blog");
    }

    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
        { _id, isLikedByUser: isLiked },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      )
      .catch(() => {
        // Revert on error
        setIsLiked((prev) => !prev);
        setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
        toast.error("Error updating like status");
      });
  };

  const handleBookmark = (e) => {
    e.preventDefault(); // Prevent navigation

    if (!userAuth.access_token) {
      return toast.error("Please login to bookmark this blog");
    }

    setIsBookmarked((prev) => !prev);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/bookmark-blog",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${userAuth.access_token}`,
          },
        }
      )
      .catch(() => {
        setIsBookmarked((prev) => !prev);
        toast.error("Error updating bookmark status");
      });
  };

  return (
    <>
      <Toaster />
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

        {/* Third row: Category, Likes, Comments and Bookmarks */}
        <div className="flex items-center gap-4">
          <span className="btn-light py-1 px-4">{category}</span>

          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-dark-grey"
          >
            <i
              className={`fi fi-${isLiked ? "sr" : "rr"}-heart text-xl icon ${
                isLiked ? "text-red" : ""
              }`}
            ></i>
            {likesCount}
          </button>

          <span className="flex items-center gap-2 text-dark-grey">
            <i className="flex-center fi fi-rr-comment-dots text-xl icon"></i>
            {total_comments}
          </span>

          {userAuth.access_token && (
            <>
              <button
                onClick={handleBookmark}
                className="flex items-center gap-2 text-dark-grey"
              >
                <i
                  className={`fi fi-${
                    isBookmarked ? "sr" : "rr"
                  }-bookmark text-xl icon ${isBookmarked ? "text-purple" : ""}`}
                ></i>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowReportDialog(true);
                }}
                className="flex items-center gap-2 text-dark-grey hover:text-red ml-auto"
              >
                <i className="fi fi-rr-flag text-xl"></i>
                Report
              </button>
            </>
          )}
        </div>
      </Link>

      {/* Report Dialog */}
      <ConfirmDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onConfirm={(reason) => handleReport(reason)}
        title="Report Blog"
        message="Please provide a reason for reporting this blog:"
        confirmText="Submit Report"
        cancelText="Cancel"
        customContent={
          <select
            className="w-full p-4 mb-4 border border-grey rounded-md"
            onChange={(e) => handleReport(e.target.value)}
          >
            <option value="">Select a reason</option>
            <option value="spam">Spam</option>
            <option value="hate_speech">Hate Speech</option>
            <option value="inappropriate">Inappropriate Content</option>
            <option value="harassment">Harassment</option>
            <option value="violence">Violence</option>
            <option value="copyright">Copyright Violation</option>
            <option value="other">Other</option>
          </select>
        }
      />
    </>
  );
};

export default BlogPostCard;
