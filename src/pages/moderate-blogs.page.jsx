import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import toast from "react-hot-toast";
import {
  ModeratedBlogPost,
  ReportedBlogPost,
} from "../components/moderate.blog-post.component";
import ConfirmDialog from "../components/confirm-dialog.component";
import InPageNavigaion from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";

const ModerateBlogsPage = () => {
  const [pendingBlogs, setPendingBlogs] = useState(null);
  const [reportedBlogs, setReportedBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState({
    show: false,
    blog: null,
    action: null,
  });

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  // Загрузка постов на модерацию
  const fetchPendingBlogs = ({ page = 1 }) => {
    setLoading(true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/pending-blogs",
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData(
          {
            state: pendingBlogs,
            data: data.blogs,
            page,
            countRoute: "/pending-blogs-count",
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        setPendingBlogs(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching blogs");
        setLoading(false);
      });
  };

  // Загрузка жалоб пользователей
  const fetchReportedBlogs = ({ page = 1 }) => {
    setLoading(true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/reported-blogs",
        { page },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData(
          {
            state: reportedBlogs,
            data: data.blogs,
            page,
            countRoute: "/reported-blogs-count",
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        setReportedBlogs(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching reported blogs");
        setLoading(false);
      });
  };

  const confirmModeration = (comment = "") => {
    const { blog, action } = showDialog;

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/moderate-blog",
        {
          blog_id: blog._id,
          action,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        toast.success(`Blog ${action === "approve" ? "approved" : "rejected"}`);
        setPendingBlogs((prev) => ({
          ...prev,
          results: prev.results.filter((b) => b._id !== blog._id),
        }));
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error processing blog");
      })
      .finally(() => {
        setShowDialog({ show: false, blog: null, action: null });
      });
  };

  useEffect(() => {
    fetchPendingBlogs({ page: 1 });
    fetchReportedBlogs({ page: 1 });
  }, [access_token]);

  return (
    <>
      <h1 className="max-md:hidden text-2xl font-medium mb-4">Moderation</h1>
      <Toaster />

      <InPageNavigaion
        routes={["Pending Review", "Reports"]}
        defaultActiveIndex={0}
      >
        {/* Вкладка 1: Ожидающие модерации */}
        {loading ? (
          <Loader />
        ) : pendingBlogs?.results?.length ? (
          <>
            {pendingBlogs.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                <ModeratedBlogPost
                  blog={{ ...blog, setStateFunc: setPendingBlogs }}
                  author={blog.author.personal_info || blog.author}
                />
              </AnimationWrapper>
            ))}
          </>
        ) : (
          <NoDataMessage message="No posts pending review" />
        )}

        {/* Reported Posts tab */}
        {loading ? (
          <Loader />
        ) : reportedBlogs?.results?.length ? (
          <>
            {reportedBlogs.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                <ReportedBlogPost
                  blog={{
                    ...blog,
                    setStateFunc: setReportedBlogs, // Передаем функцию обновления состояния
                  }}
                  author={blog.author.personal_info || blog.author}
                />
              </AnimationWrapper>
            ))}
          </>
        ) : (
          <NoDataMessage message="No reported posts" />
        )}
      </InPageNavigaion>

      <ConfirmDialog
        isOpen={showDialog.show}
        onClose={() => setShowDialog({ show: false, blog: null, action: null })}
        onConfirm={(comment) => confirmModeration(comment)}
        title={`${showDialog.action === "approve" ? "Approve" : "Reject"} Post`}
        message="Add an optional comment for the author:"
        confirmText={showDialog.action === "approve" ? "Approve" : "Reject"}
        customContent={
          <textarea
            className="w-full p-4 mb-4 border border-grey rounded-md"
            placeholder="Comment (optional)"
          />
        }
      />
    </>
  );
};

export default ModerateBlogsPage;
