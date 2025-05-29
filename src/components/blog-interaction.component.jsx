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

  let icon = isBookmarkedByUser ? "fi fi-ss-bookmark" : "fi fi-rs-bookmark"; // bs

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
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <button
              onClick={handleLike}
              className={
                "flex-center rounded-full flex items-center justify-center "
              }
            >
              <i
                className={
                  "flex-center icon fi " +
                  (isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")
                }
              ></i>
            </button>
            <p className="text-xl text-dark-grey">{total_likes}</p>
          </div>

          <div className="flex gap-2 items-center">
            <button className="flex-center rounded-full flex items-center justify-center ">
              <i className="flex-center icon fi fi-rr-comment-dots"></i>
            </button>
            <p className="text-xl text-dark-grey">{total_comments}</p>
          </div>

          <button
            onClick={handleBookmark}
            className="flex items-center gap-2 text-dark-grey"
          >
            <i className={`flex-center ${icon} text-xl icon`}></i>
          </button>
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

      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
