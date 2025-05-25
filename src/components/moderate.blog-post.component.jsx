import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import axios from "axios";
import { ConfirmDialogModetation } from "./confirm-dialog.component";
import { toast } from "react-hot-toast";

export const ModeratedBlogPost = ({ blog, author }) => {
  let {
    userAuth: { access_token },
    userAuth,
  } = useContext(UserContext);

  // Extract only the necessary fields from blog
  const { banner, blog_id, title, publishedAt, _id } = blog;
  const [showActionDialog, setShowActionDialog] = useState({
    show: false,
    action: null,
  });

  const handleAction = (action) => {
    setShowActionDialog({
      show: true,
      action,
    });
  };

  const confirmAction = (comment = "") => {
    const { action } = showActionDialog;

    const requestData = {
      blog_id: _id,
      action,
      comment,
    };

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/moderate-blog`,
        { ...requestData, moderator: userAuth._id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        toast.success(`Blog ${action}ed successfully`);
        if (typeof blog.setStateFunc === "function") {
          blog.setStateFunc((prev) => ({
            ...prev,
            results: prev.results.filter((b) => b._id !== _id),
            totalDocs: prev.totalDocs - 1,
          }));
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error processing blog");
      })
      .finally(() => {
        setShowActionDialog({ show: false, action: null });
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
            <Link
              to={`/blog/${blog_id}`}
              className="blog-title mb-4 hover:underline"
            >
              {title}
            </Link>
            <p className="line-clamp-1">Submitted on {getDay(publishedAt)}</p>
          </div>

          <div className="flex gap-6 mt-3">
            <button
              onClick={() => handleAction("approv")}
              className="btn-dark bg-green-500"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction("reject")}
              className="btn-dark bg-red"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialogModetation
        isOpen={showActionDialog.show}
        onClose={() => setShowActionDialog({ show: false, action: null })}
        onConfirm={confirmAction}
        title={`${
          showActionDialog.action === "approve" ? "Approve" : "Reject"
        } Post`}
        message="Add an optional comment for the author:"
        confirmText={
          showActionDialog.action === "approve" ? "Approve" : "Reject"
        }
        cancelText="Cancel"
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
