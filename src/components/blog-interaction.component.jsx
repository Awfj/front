import React, { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  let blogContexData = useContext(BlogContext);
  let {
    blog,
    blog: {
      _id,
      blog_id,
      title,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setLikedByUser,
    isBookmarkedByUser,
    setBookmarkedByUser,
  } = blogContexData;

  let bookmarkedIcon = isBookmarkedByUser
    ? "fi fi-ss-bookmark text-purple"
    : "fi fi-rs-bookmark"; // bs

  let {
    userAuth: { username, access_token },
  } = useContext(UserContext);

  useEffect(() => {
    if (access_token) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/user-interactions",
          { _id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data: { isLiked, isBookmarked } }) => {
          setLikedByUser(Boolean(isLiked));
          setBookmarkedByUser(Boolean(isBookmarked));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const handleLike = () => {
    if (access_token) {
      setLikedByUser((preVal) => !preVal);

      !isLikedByUser ? total_likes++ : total_likes--;
      setBlog({ ...blog, activity: { ...activity, total_likes } });
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
          {
            _id,
            isLikedByUser,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toast.error("Please login to like this blog");
    }
  };

  const handleCommentClick = (e) => {
    e.preventDefault(); // Предотвращаем действие по умолчанию

    // Навигация к блогу с якорем комментариев
    window.location.href = `/blog/${blog_id}#comments`;
  };

  const handleBookmark = () => {
    if (access_token) {
      setBookmarkedByUser((preVal) => !preVal);
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/bookmark-blog",
          { _id },
          { headers: { Authorization: `Bearer ${access_token}` } }
        )
        .then(({ data }) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      toast.error("Please login to bookmark this blog");
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-4 items-center">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 transition-custom hover:text-purple"
          >
            <i
              className={`transition-custom flex fi fi-${
                isLikedByUser ? "sr" : "rr"
              }-heart flex text-xl ${isLikedByUser ? "text-purple" : ""}`}
            ></i>
            {total_likes}
          </button>

          <button
            onClick={handleCommentClick}
            className="flex items-center gap-2 text-black hover:text-purple transition-custom"
          >
            <i className="flex-center flex fi fi-rr-comment-dots text-xl transition-custom"></i>
            {total_comments}
          </button>

          {access_token && (
            <button
              onClick={handleBookmark}
              className="flex items-center gap-2"
            >
              <i
                className={`transition-custom hover:text-purple flex flex-center ${bookmarkedIcon} text-xl`}
              ></i>
            </button>
          )}
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className="underline hover:text-purple"
            >
              Edit
            </Link>
          ) : (
            ""
          )}
          {/* <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
          >
            <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
          </Link> */}
        </div>
      </div>
    </>
  );
};

export default BlogInteraction;
