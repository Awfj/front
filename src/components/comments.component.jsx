import React, { useContext } from "react";
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
  let res;

  await axios
    .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", {
      blog_id,
      skip,
    })
    .then(({ data }) => {
      data.map((comment) => {
        comment.childrenLevel = 0;
      });
      setParentCommentCountFun((preVal) => preVal + data.length);

      if (comment_array === null) {
        res = { results: data };
      } else {
        res = { results: [...comment_array, ...data] };
      }
    });

  return res;
};

const CommentContainer = () => {
  let {
    blog: {
      _id,
      title,
      comments: { results: commentArr },
      activity: { total_parent_comments },
    },
    totalParentComentsLoaded,
    setTotalCommentsLoaded,
    setBlog,
    blog,
  } = useContext(BlogContext);

  const loadMoreComment = async () => {
    let newCommentArr = await fetchComment({
      skip: totalParentComentsLoaded,
      blog_id: _id,
      setParentCommentCountFun: setTotalCommentsLoaded,
      comment_array: commentArr,
    });

    setBlog({ ...blog, comments: newCommentArr });
  };
  // console.log(commentsWrapper)
  return (
    <div
      className={
        "w-full "}
    >
      <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <hr className="border-grey my-8 w-[120%] -ml-10" />
        <CommentField action="comment" />

        {commentArr && commentArr.length ? (
          commentArr.map((comment, i) => {
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

        {total_parent_comments > totalParentComentsLoaded ? (
          <button
            onClick={loadMoreComment}
            className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
          >
            Load More
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default CommentContainer;
