import React, { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

export const fetchComment = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  try {
    const { data } = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments",
      { blog_id, skip }
    );

    // Проверяем, что data содержит комментарии
    if (data && Array.isArray(data.comments)) {
      data.comments.forEach((comment) => {
        comment.childrenLevel = 0;
      });

      setParentCommentCountFun((prev) => prev + data.comments.length);

      return {
        results: comment_array
          ? [...comment_array, ...data.comments]
          : data.comments,
        totalDocs: data.totalDocs,
        hasMore: data.hasMore,
      };
    }

    return {
      results: comment_array || [],
      totalDocs: 0,
      hasMore: false,
    };
  } catch (err) {
    console.error(err);
    return {
      results: comment_array || [],
      totalDocs: 0,
      hasMore: false,
    };
  }
};

const CommentContainer = () => {
  let {
    blog: {
      _id,
      title,
      comments: { results: commentsArr },
      activity: { total_parent_comments },
    },
    setBlog,
    blog,
    totalParentComentsLoaded,
    setTotalCommentsLoaded,
    loadMoreComments,
  } = useContext(BlogContext);

  useEffect(() => {
    if (window.location.hash === "#comments") {
      const commentsSection = document.getElementById("comments");
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div id="comments" className={"w-full mt-6"}>
      <div className="relative flex flex-col">
        <CommentField action="comment" />

        {commentsArr && commentsArr.length ? (
          commentsArr.map((comment, i) => {
            return (
              <AnimationWrapper key={i}>
                <CommentCard
                  index={i}
                  leftVal={comment.childrenLevel * 4}
                  commentData={comment}
                />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message={"No Comments"} />
        )}

        {blog?.comments?.hasMore && (
          <button
            onClick={() => loadMoreComments({ skip: commentsArr.length })}
            className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
          >
            Load More Comments
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentContainer;
