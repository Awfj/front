import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import toast from "react-hot-toast";
import BlogCard from "../components/blog-post.component";
import { ModeratedBlogPost } from "../components/moderate.blog-post.component";
import ConfirmDialog from "../components/confirm-dialog.component";

const ModerateBlogsPage = () => {
  const [blogs, setBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState({
    show: false,
    blog: null,
    action: null,
  });
  console.log(blogs);
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

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
            state: blogs,
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
        setBlogs(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching blogs");
        setLoading(false);
      });
  };

  const handleModeration = (blog, action) => {
    setShowDialog({ show: true, blog, action });
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
        setBlogs((prev) => ({
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
  }, [access_token]);

  return (
    <>
      <h1 className="max-md:hidden text-2xl font-medium mb-8">Pending Posts</h1>
      <Toaster />

      {loading ? (
        <Loader />
      ) : blogs?.results?.length ? (
        <>
          {blogs.results.map((blog, i) => (
            <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                {/* Fix: Pass content and author separately */}
                <ModeratedBlogPost blog={blog} author={blog.author} />
            </AnimationWrapper>
          ))}
        </>
      ) : (
        <NoDataMessage message="No posts pending review" />
      )}

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
