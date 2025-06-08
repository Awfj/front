import React, { useContext, useEffect, useState, useRef } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link, useLocation } from "react-router-dom";
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

  const location = useLocation();
  const [showShareMenu, setShowShareMenu] = useState(false);

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

  const shareMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard");
      setShowShareMenu(false);
    });
  };

  // Функции для шеринга
  const shareLinks = {
    facebook: () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}`,
    linkedin: () =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        window.location.href
      )}`,
    vk: () =>
      `https://vk.com/share.php?url=${encodeURIComponent(
        window.location.href
      )}&title=${encodeURIComponent(title)}`,
    telegram: () =>
      `https://t.me/share/url?url=${encodeURIComponent(
        window.location.href
      )}&text=${encodeURIComponent(title)}`,
    email: () =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        `Check out this article: ${title}\n\n${window.location.href}`
      )}`,
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
              className="underline transition-custom text-xl hover:text-purple"
            >
              Edit
            </Link>
          ) : null}

          {/* Добавляем кнопку шеринга */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="text-dark-grey hover:text-purple transition-custom"
              title="Share"
            >
              <i className="transition-custom flex fi fi-rr-share text-xl"></i>
            </button>

            {/* Выпадающее меню шеринга */}
            {showShareMenu && (
              <div
                ref={shareMenuRef}
                className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border border-grey z-50"
              >
                <button
                  onClick={copyLink}
                  className="w-full text-left px-4 py-2 hover:bg-grey/20 flex items-center gap-2"
                >
                  <i className="flex fi fi-rr-copy text-xl"></i>
                  Copy Link
                </button>

                <a
                  href={shareLinks.vk()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 hover:bg-grey/20 flex items-center gap-2"
                >
                  <i className="flex fi fi-brands-vk text-xl text-[#0077FF]"></i>
                  VK
                </a>

                <a
                  href={shareLinks.telegram()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 hover:bg-grey/20 flex items-center gap-2"
                >
                  <i className="flex fi fi-brands-telegram text-xl text-[#0088cc]"></i>
                  Telegram
                </a>

                <a
                  href={shareLinks.facebook()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 hover:bg-grey/20 flex items-center gap-2"
                >
                  <i className="flex fi fi-brands-facebook text-xl text-[#4267B2]"></i>
                  Facebook
                </a>

                <a
                  href={shareLinks.linkedin()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 hover:bg-grey/20 flex items-center gap-2"
                >
                  <i className="flex fi fi-brands-linkedin text-xl text-[#0077b5]"></i>
                  LinkedIn
                </a>

                <a
                  href={shareLinks.email()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 hover:bg-grey/20 flex items-center gap-2"
                >
                  <i className="flex fi fi-rr-envelope text-xl"></i>
                  Email
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogInteraction;
