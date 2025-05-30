import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import InPageNavigaion from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import {
  ManagePublishedBlogCard,
  ManageDraftBlogPost,
  ManagePendingBlogCard,
  ManageRejectedBlogCard,
} from "../components/manage-blogcard.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";

const ManageBlog = () => {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [pendingBlogs, setPendingBlogs] = useState(null);
  const [rejectedBlogs, setRejectedBlogs] = useState(null);
  const [query, setQuery] = useState("");

  let activeTab = useSearchParams()[0].get("tab");

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getBlog = ({
    page,
    draft,
    pending = false,
    rejected = false,
    deletedDocCount = 0,
  }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs",
        { page, draft, pending, rejected, query, deletedDocCount },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: rejected
            ? rejectedBlogs
            : pending
            ? pendingBlogs
            : draft
            ? drafts
            : blogs,
          data: data.blogs,
          page,
          user: access_token,
          countRoute: "/user-written-blogs-count",
          data_to_send: { draft, pending, rejected, query },
        });

        if (rejected) {
          setRejectedBlogs(formatedData);
        } else if (pending) {
          setPendingBlogs(formatedData);
        } else if (draft) {
          setDrafts(formatedData);
        } else {
          setBlogs(formatedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleChange = (e) => {
    if (e.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    }
  };

  const handleSearch = (e) => {
    let searchQuery = e.target.value;
    setQuery(searchQuery);

    if (e.keyCode == 13 && searchQuery.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };

  useEffect(() => {
    if (access_token) {
      if (blogs == null) {
        getBlog({ page: 1, draft: false });
      }
      if (drafts == null) {
        getBlog({ page: 1, draft: true });
      }
      if (pendingBlogs == null) {
        getBlog({ page: 1, pending: true });
      }
      if (rejectedBlogs == null) {
        getBlog({ page: 1, rejected: true });
      }
    }
  }, [access_token, blogs, drafts, pendingBlogs, rejectedBlogs, query]);

  return (
    <>
      <h1 className="max-md:hidden text-2xl mb-4">Manage Blog</h1>
      <Toaster />

      <InPageNavigaion
        routes={["Published Posts", "Drafts", "Pending Review", "Needs Revision"]}
        defaultActiveIndex={
          activeTab === "draft"
            ? 1
            : activeTab === "pending"
            ? 2
            : activeTab === "rejected"
            ? 3
            : 0
        }
      >
        {/* Published Posts */}
        {blogs == null ? (
          <Loader />
        ) : blogs.results.length ? (
          <>
            {blogs.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                <ManagePublishedBlogCard
                  blog={{ ...blog, index: i, setStateFunc: setBlogs }}
                />
              </AnimationWrapper>
            ))}
            <LoadMoreDataBtn
              state={blogs}
              fetchDataFun={getBlog}
              additionalParam={{
                draft: false,
                deletedDocCount: blogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No published posts available" />
        )}

        {/* Draft Posts */}
        {drafts == null ? (
          <Loader />
        ) : drafts.results.length ? (
          <>
            {drafts.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                <ManageDraftBlogPost
                  blog={{ ...blog, index: i, setStateFunc: setDrafts }}
                />
              </AnimationWrapper>
            ))}
            <LoadMoreDataBtn
              state={drafts}
              fetchDataFun={getBlog}
              additionalParam={{
                draft: true,
                deletedDocCount: drafts.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No draft posts available" />
        )}

        {/* Pending Posts */}
        {pendingBlogs == null ? (
          <Loader />
        ) : pendingBlogs.results.length ? (
          <>
            {pendingBlogs.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                <ManagePendingBlogCard
                  blog={{ ...blog, index: i, setStateFunc: setPendingBlogs }}
                  isPending={true}
                />
              </AnimationWrapper>
            ))}
            <LoadMoreDataBtn
              state={pendingBlogs}
              fetchDataFun={getBlog}
              additionalParam={{
                pending: true,
                deletedDocCount: pendingBlogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No posts pending review" />
        )}

        {/* Rejected Posts */}
        {rejectedBlogs == null ? (
          <Loader />
        ) : rejectedBlogs.results.length ? (
          <>
            {rejectedBlogs.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                <ManageRejectedBlogCard
                  blog={{
                    ...blog,
                    index: i,
                    setStateFunc: setRejectedBlogs,
                    setPendingBlogs,
                  }}
                  isRejected={true}
                />
              </AnimationWrapper>
            ))}
            <LoadMoreDataBtn
              state={rejectedBlogs}
              fetchDataFun={getBlog}
              additionalParam={{
                rejected: true,
                deletedDocCount: rejectedBlogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No rejected posts" />
        )}
      </InPageNavigaion>
    </>
  );
};

export default ManageBlog;
