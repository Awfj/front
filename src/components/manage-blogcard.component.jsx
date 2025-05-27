import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import axios from "axios";
import ConfirmDialog from "./confirm-dialog.component";
import { toast } from "react-hot-toast";

const BlogStats = ({ stats }) => {
  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-4 max-lg:border-grey max-lg:border-b ">
      {Object.keys(stats).map((key, i) => {
        return !key.includes("parent") ? (
          <div
            key={i}
            className={
              "flex flex-col items-center w-full h-full justify-center p-4 px-6 " +
              (i !== 0 ? "border-grey border-l" : "")
            }
          >
            <h1 className="text-xl lg:text-2xl mb-2">
              {stats[key].toLocaleString()}
            </h1>
            <p className="max-lg:text-dark-grey capitalize">
              {key.split("_")[1]}
            </p>
          </div>
        ) : (
          ""
        );
      })}
    </div>
  );
};

// PUBLISHED -----------------------------------------------------------------------------
export const ManagePublishedBlogCard = ({ blog }) => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let { banner, blog_id, title, publishedAt, activity } = blog;
  let [showStat, setShowStat] = useState(false);
  let [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteBlog(blog, access_token);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        <img
          src={banner}
          alt="banner img"
          className="max-md:hidden lg:hidden xl:block w-28 h-28 bg-grey object-cover"
        />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link
              to={`/blog/${blog_id}`}
              className="blog-title mb-4 hover:underline"
            >
              {title}
            </Link>

            <p className="line-clamp-1">Published on {getDay(publishedAt)}</p>
          </div>

          <div className="flex gap-6 mt-3">
            <Link to={`/editor/${blog_id}`} className="py-2 underline ">
              Edit
            </Link>

            <button
              className="lg:hidden pr-4 py-2 underline"
              onClick={() => setShowStat((preVal) => !preVal)}
            >
              Stats
            </button>

            <button
              className="pr-4 py-2 underline text-red"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </div>
        </div>

        <div className="max-lg:hidden">
          <BlogStats stats={activity} />
        </div>
      </div>
      {showStat && (
        <div className="max-lg:hidden">
          <BlogStats stats={activity} />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

// DRAFT -------------------------------------------------------------------------------
export const ManageDraftBlogPost = ({ blog }) => {
  let { title, blog_id, banner, des, index } = blog;
  index++;

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteBlog(blog, access_token);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        {/* <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
          {index < 10 ? "0" + index : index}
        </h1> */}
        <img
          src={banner}
          alt="banner img"
          className="max-md:hidden lg:hidden xl:block w-28 h-28 bg-grey object-cover"
        />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <h1 className="blog-title mb-3">{title}</h1>
            <p className="line-clamp-2 font-gelasio">
              {des.length ? des : "No Description"}
            </p>
          </div>

          <div className="flex gap-6 mt-3">
            <Link className="pr-4 py-2 underline" to={`/editor/${blog_id}`}>
              Edit
            </Link>

            <button
              className="pr-4 py-2 underline text-red"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Draft"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

// PENDING ----------------------------------------------------------------------------------
export const ManagePendingBlogCard = ({ blog }) => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let { banner, blog_id, title, publishedAt, activity } = blog;
  let [showStat, setShowStat] = useState(false);
  let [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteBlog(blog, access_token);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        <img
          src={banner}
          alt="banner img"
          className="max-md:hidden lg:hidden xl:block w-28 h-28 bg-grey object-cover"
        />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link
              to={`/blog/${blog_id}`}
              className="blog-title mb-4 hover:underline"
            >
              {title}
            </Link>

            <p className="line-clamp-1">Published on {getDay(publishedAt)}</p>
          </div>

          <div className="flex gap-6 mt-3">
            <Link to={`/editor/${blog_id}`} className="py-2 underline ">
              Edit
            </Link>

            <button
              className="pr-4 py-2 underline text-red"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

// REJECTED -------------------------------------------------------------------------------
export const ManageRejectedBlogCard = ({ blog }) => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let { banner, blog_id, title, publishedAt, activity, moderation } = blog;
  let [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteBlog(blog, access_token);
    setShowDeleteDialog(false);
  };

  const handleResubmit = () => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/resubmit-blog`,
        { blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        toast.success("Blog resubmitted for review");
        // Удаляем из rejected
        blog.setStateFunc((prev) => ({
          ...prev,
          results: prev.results.filter((b) => b.blog_id !== blog_id),
          totalDocs: prev.totalDocs - 1,
        }));
        // Обновляем pending
        if (typeof blog.setPendingBlogs === "function") {
          blog.setPendingBlogs(null); // сбрасываем, чтобы useEffect подгрузил заново
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error resubmitting blog");
      });
  };

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        <img
          src={banner}
          alt="banner img"
          className="max-md:hidden lg:hidden xl:block w-28 h-28 bg-grey object-cover"
        />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline">
              {title}
            </Link>

            <p className="line-clamp-1">Rejected on {getDay(publishedAt)}</p>

            {/* Показываем комментарий модератора, если он есть */}
            {moderation?.comment && (
              <div className="mt-4 bg-red/10 p-4 rounded-md">
                <p className="text-red font-medium mb-1">Moderator's Comment:</p>
                <p className="text-dark-grey">{moderation.comment}</p>
              </div>
            )}
          </div>

          <div className="flex gap-6 mt-3">
            <Link to={`/editor/${blog_id}`} className="py-2 underline">
              Edit
            </Link>

            <button className="py-2 underline text-purple" onClick={handleResubmit}>
              Submit for Review
            </button>

            <button className="pr-4 py-2 underline text-red" onClick={handleDeleteClick}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

//-----------------------------------------------------------------------------------------
const deleteBlog = (blog, access_token) => {
  let { blog_id, setStateFunc } = blog;

  axios
    .post(
      import.meta.env.VITE_SERVER_DOMAIN + "/delete-blog",
      { blog_id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    .then(({ data }) => {
      setStateFunc((preVal) => {
        let { deleteDocCount, totalDocs, results } = preVal;

        results = results.filter((blog) => blog.blog_id !== blog_id);

        if (!deleteDocCount) {
          deleteDocCount = 0;
        }
        if (!results.length && totalDocs - 1 > 0) {
          return null;
        }

        return {
          ...preVal,
          totalDocs: totalDocs - 1,
          deleteDocCount: deleteDocCount + 1,
          results,
        };
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
