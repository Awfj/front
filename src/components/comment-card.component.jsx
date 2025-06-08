import React, { useContext, useState, useEffect } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
import ConfirmDialog from "./confirm-dialog.component";

const CommentCard = ({ index, leftVal, commentData }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(commentData.likes || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  let {
    commented_by: {
      personal_info: {
        profile_img,
        fullname,
        username,
        username: commented_by_username,
      },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;

  let {
    blog,
    setBlog,
    blog: {
      comments,
      activity,
      activity: { total_parent_comments },
      comments: { results: commentsArr },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setTotalCommentsLoaded,
    updateCommentLikeStatus,
  } = useContext(BlogContext);
  let {
    userAuth: { access_token, username: currentUsername, _id: userId },
    userAuth,
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);
  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("Log In first to leave a reply");
    }
    setReplying((prev) => !prev);
  };

  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);

        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex !== undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child !== _id);

        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }

      commentsArr.splice(index, 1);
    }

    if (commentData.childrenLevel === 0 && isDelete) {
      setTotalCommentsLoaded((preVal) => preVal - 1);
    }
    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
      },
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        removeCommentsCards(index + 1, true);
        setShowDeleteConfirm(false);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to delete comment");
      });
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCards(index + 1);
  };

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentsArr[currentIndex].children.length) {
      hideReplies();

      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
          _id: commentsArr[currentIndex]._id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentsArr[currentIndex].isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel =
              commentsArr[currentIndex].childrenLevel + 1;

            commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }

          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const LoadMoreReplies = () => {
    let parentIndex = getParentIndex();
    let button = (
      <button
        onClick={() =>
          loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })
        }
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
      >
        Load More Replies
      </button>
    );

    if (commentsArr[index + 1]) {
      if (
        commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel
      ) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentsArr[parentIndex].children.length) {
          return button;
        }
      }
    }
  };

  useEffect(() => {
    setIsLiked(commentData.liked_by?.includes(userId));
    setLikesCount(commentData.likes || 0);
  }, [commentData, userId]);

  const handleLike = async () => {
    if (!access_token) {
      return toast.error("Please login to like comments");
    }
    if (likeLoading) return;

    setLikeLoading(true);

    try {
      const newIsLiked = !isLiked;
      const newLikesCount = likesCount + (newIsLiked ? 1 : -1);
      const newLikedBy = newIsLiked
        ? [...(commentData.liked_by || []), userId]
        : (commentData.liked_by || []).filter((id) => id !== userId);

      // Оптимистичное обновление UI
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/like-comment",
        { comment_id: commentData._id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Обновляем состояние в родительском компоненте
      updateCommentLikeStatus(commentData._id, {
        likes: newLikesCount,
        liked_by: newLikedBy,
      });
    } catch (err) {
      // Откатываем изменения при ошибке
      setIsLiked(!isLiked);
      setLikesCount(likesCount);
      toast.error("Error updating like");
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="mb-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8 ">
          <img
            src={profile_img}
            alt="Profile image"
            className="h-6 w-6 rounded-full border border-magenta"
          />
          <p className="line-clamp-1">
            {fullname} @{commented_by_username}
          </p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>

        <p className="text-xl message-content">{comment}</p>

        <div className="flex gap-5 items-center mt-5">
          {/* Кнопка лайка */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 hover:text-purple"
            disabled={likeLoading}
          >
            <i
              className={`transition-custom flex fi fi-${
                isLiked ? "sr" : "rr"
              }-heart text-xl ${isLiked ? "text-purple" : ""}`}
            ></i>
            <span className="text-xl transition-custom">{likesCount}</span>
          </button>

          {commentData.isReplyLoaded ? (
            <button
              onClick={hideReplies}
              className="text-dark-grey hover:text-purple transition-custom rounded-md flex items-center gap-2 text-xl"
            >
              <i className="transition-custom flex fi fi-rs-comment-dots text-xl"></i>
              Hide Reply
            </button>
          ) : (
            <button
              onClick={loadReplies}
              className="text-dark-grey hover:text-purple transition-custom rounded-md flex items-center gap-2 text-xl"
            >
              <i className="transition-custom flex fi fi-rs-comment-dots text-xl"></i>
              {children.length}
            </button>
          )}
          <button
            onClick={handleReplyClick}
            className="underline transition-custom hover:text-purple text-xl"
          >
            Reply
          </button>

          {currentUsername === commented_by_username && (
            <button
              onClick={handleDelete}
              className="p-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center transition-custom"
            >
              <i className="transition-custom flex fi fi-rr-trash pointer-events-auto"></i>
            </button>
          )}
        </div>

        {isReplying ? (
          <div className="mt-8">
            <CommentField
              action={"reply"}
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <LoadMoreReplies />

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CommentCard;
