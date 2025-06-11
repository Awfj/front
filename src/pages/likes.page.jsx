import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { Toaster } from "react-hot-toast";
import InPageNavigaion from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import LoadMoreDataBtn from "../components/load-more.component";
import CommentCard from "../components/comment-card.component";

const LikesPage = () => {
  const [likedBlogs, setLikedBlogs] = useState(null);
  const [likedComments, setLikedComments] = useState(null);
  const [loading, setLoading] = useState(true);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getLikedBlogs = ({ page = 1, deletedDocCount = 0 }) => {
    setLoading(true);
    let skipDocs = (page - 1) * 5 - deletedDocCount;

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-liked-blogs",
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setLikedBlogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getLikedComments = ({ page = 1, deletedDocCount = 0 }) => {
    setLoading(true);
    let skipDocs = (page - 1) * 5 - deletedDocCount;

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-liked-comments",
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setLikedComments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (access_token) {
      getLikedBlogs({ page: 1 });
      getLikedComments({ page: 1 });
    }
  }, [access_token]);

  return (
    <>
      <h1 className="max-md:hidden text-2xl font-medium mb-8">Manage Likes</h1>
      <Toaster />

      {loading ? (
        <Loader />
      ) : likedBlogs?.results?.length ? (
        <>
          {likedBlogs.results.map((blog, i) => (
            <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
              <BlogPostCard content={blog} author={blog.author.personal_info} />
            </AnimationWrapper>
          ))}
          <LoadMoreDataBtn
            state={likedBlogs}
            fetchDataFun={getLikedBlogs}
            additionalParam={{
              deletedDocCount: likedBlogs.deletedDocCount,
            }}
          />
        </>
      ) : (
        <NoDataMessage message="No liked posts yet" />
      )}

      {/* <InPageNavigaion routes={["Posts", "Comments"]} defaultActiveIndex={0}>
        {loading ? (
          <Loader />
        ) : likedBlogs?.results?.length ? (
          <>
            {likedBlogs.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                <BlogPostCard
                  content={blog}
                  author={blog.author.personal_info}
                />
              </AnimationWrapper>
            ))}
            <LoadMoreDataBtn
              state={likedBlogs}
              fetchDataFun={getLikedBlogs}
              additionalParam={{
                deletedDocCount: likedBlogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No liked posts yet" />
        )}

        {loading ? (
          <Loader />
        ) : likedComments?.results?.length ? (
          <>
            {likedComments.results.map((comment, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                <CommentCard
                  comment={comment}
                  blogId={comment.blog_id}
                  index={i}
                />
              </AnimationWrapper>
            ))}
            <LoadMoreDataBtn
              state={likedComments}
              fetchDataFun={getLikedComments}
              additionalParam={{
                deletedDocCount: likedComments.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No liked comments yet" />
        )}
      </InPageNavigaion> */}
    </>
  );
};

export default LikesPage;
