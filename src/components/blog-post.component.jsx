import React, { useContext, useEffect, useState } from "react";
import { getDay } from "../common/date";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import ConfirmDialog from "./confirm-dialog.component";
import { formatReadingTime } from "../common/formatReadingTime";

const ReportReasons = {
  "Harmful Content": [
    "hate_speech",
    "harassment",
    "violence",
    "self_harm",
    "nsfw_content",
  ],
  "Content Issues": [
    "spam",
    "copyright",
    "plagiarism",
    "misinformation",
    "fake_news",
  ],
  "Technical Issues": [
    "broken_links",
    "formatting",
    "missing_images",
    "loading_issues",
  ],
  Other: ["inappropriate", "other"],
};

const BlogPostCard = ({ content, author }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(content.activity.total_likes);
  const { userAuth } = useContext(UserContext);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");

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
    reading_time,
  } = content;
  let { fullname, profile_img, username } = author;

  const handleReport = () => {
    if (!userAuth.access_token) {
      return toast.error("Please login to report this blog");
    }
    if (!reportReason) {
      return toast.error("Please select a reason");
    }

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/report-blog`,
        {
          blog_id: _id,
          reason: reportReason,
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
        setReportReason("");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.error || "Error reporting blog");
        if (err.response?.status === 400) {
          setShowReportDialog(false);
          setReportReason("");
        }
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

  const getBorderStyle = (role) => {
    if (role === "admin") {
      return "border-red";
    } else if (role === "moderator") {
      return "border-green";
    }
    return "border-magenta";
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col border-b border-grey pb-5 mb-4">
        {/* First row: Avatar, Author, Date */}
        <div className="flex gap-2 items-center mb-4">
          <Link
            to={`/user/${username}`}
            className="flex items-center gap-2 hover:text-purple"
          >
            <img
              src={profile_img}
              alt={fullname}
              className={`w-6 h-6 rounded-full border ${getBorderStyle(
                author.role
              )}`}
            />
            <p className="line-clamp-1 transition-custom">
              {fullname} @{username}
            </p>
          </Link>
          <span>•</span>
          <p className="min-w-fit">{getDay(publishedAt)}</p>
          <span>•</span>
          {/* Add reading time here */}
          <p className="min-w-fit text-dark-grey">
            {formatReadingTime(reading_time)}
          </p>
        </div>

        {/* Second row: Banner, Title, Description */}
        <Link to={`/blog/${id}`} className="block">
          <div className="flex gap-6 mb-4 hover:text-purple">
            <div className="h-32 w-32 bg-grey flex-shrink-0">
              <img
                src={banner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="blog-title text-xl font-bold mb-2 transition-custom">
                {title}
              </h1>
              <p className="text-dark-grey line-clamp-2">{des}</p>
            </div>
          </div>
        </Link>

        {/* Third row: Category, Likes, Comments and Bookmarks */}
        <div className="flex items-center gap-4">
          <Link
            to={`/search/${category.toLowerCase()}`}
            className="btn-light py-1 px-4"
          >
            {category}
          </Link>

          <button
            onClick={handleLike}
            className="flex items-center gap-2"
          >
            <i
              className={`transition-custom hover:text-purple fi fi-${
                isLiked ? "sr" : "rr"
              }-heart flex text-xl icon ${isLiked ? "text-purple" : ""}`}
            ></i>
            {likesCount}
          </button>

          <span className="flex items-center gap-2 text-dark-grey">
            <i className="flex-center flex fi fi-rr-comment-dots text-xl icon"></i>
            {total_comments}
          </span>

          {userAuth.access_token && (
            <button
              onClick={handleBookmark}
              className="flex items-center gap-2 "
            >
              <i
                className={`transition-custom hover:text-purple fi fi-${
                  isBookmarked ? "sr" : "rr"
                }-bookmark flex text-xl icon ${
                  isBookmarked ? "text-purple" : ""
                }`}
              ></i>
            </button>
          )}

          {userAuth.access_token && userAuth.username !== username && (
            <button
              onClick={(e) => {
                setShowReportDialog(true);
              }}
              className="transition-custom flex items-center gap-2 text-dark-grey hover:text-red ml-auto"
            >
              <i className="transition-custom fi fi-rr-flag text-xl flex"></i>
              Report
            </button>
          )}
        </div>
      </div>

      {/* Report Dialog */}
      <ConfirmDialog
        isOpen={showReportDialog}
        onClose={() => {
          setShowReportDialog(false);
          setReportReason("");
        }}
        onConfirm={handleReport}
        title="Report Post"
        message="Please provide a reason for reporting this post:"
        confirmText="Submit Report"
        cancelText="Cancel"
        customContent={
          <select
            className="w-full p-3 pr-8 rounded-md bg-light-grey border border-grey 
              appearance-none bg-no-repeat bg-[right_0.75rem_center] 
              bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==')]"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          >
            <option value="">Select a reason</option>
            {Object.entries(ReportReasons).map(([category, reasons]) => (
              <optgroup key={category} label={category}>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        }
      />
    </>
  );
};

export default BlogPostCard;
