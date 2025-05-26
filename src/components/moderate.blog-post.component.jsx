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
  let { fullname, profile_img, username } = author;
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
      <div className="flex gap-2 items-center mb-4">
        <Link
          to={`/user/${username}`}
          className="flex items-center gap-2 hover:text-purple"
        >
          <img
            src={profile_img}
            alt={fullname}
            className="w-6 h-6 rounded-full border border-magenta"
          />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
        </Link>
      </div>

      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6">
        <img
          src={banner}
          alt="banner img"
          className="max-md:hidden lg:hidden xl:block w-28 h-28 bg-grey object-cover"
        />

        <div className="flex flex-col justify-between pb-2 w-full min-w-[300px]">
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
              className="btn-dark bg-green text-rly-white"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction("reject")}
              className="btn-dark bg-red text-rly-white"
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

// ----------------------------------------------------------------------------------------

export const ReportedBlogPost = ({ blog, author }) => {
  const {
    userAuth: { access_token },
    userAuth,
  } = useContext(UserContext);

  const { banner, blog_id, title, publishedAt, _id, reports = [] } = blog;
  let { fullname, profile_img, username } = author;
  const [showActionDialog, setShowActionDialog] = useState({
    show: false,
    action: null,
  });
  const [showReportsDialog, setShowReportsDialog] = useState(false);

  // Группировка жалоб по типу
  const reportTypeCounts = reports.reduce((acc, report) => {
    acc[report.reason] = (acc[report.reason] || 0) + 1;
    return acc;
  }, {});

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
        requestData,
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

  const handleDismissReports = () => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/dismiss-reports`,
        { blog_id: _id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        toast.success("Reports dismissed");
        // Обновляем список постов через setStateFunc от родителя
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
        toast.error("Error dismissing reports");
      });
  };

  return (
    <>
      <div className="flex gap-2 items-center mb-4 relative">
        <Link
          to={`/user/${username}`}
          className="flex items-center gap-2 hover:text-purple"
        >
          <img
            src={profile_img}
            alt={fullname}
            className="w-6 h-6 rounded-full border border-magenta"
          />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
        </Link>

        <button
          onClick={handleDismissReports}
          className="absolute top-0 right-0 p-2 text-dark-grey hover:text-red transition-colors"
          title="Dismiss all reports"
        >
          <i className="fi fi-br-cross text-xl"></i>
        </button>
      </div>

      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6">
        <img
          src={banner}
          alt="banner img"
          className="max-md:hidden lg:hidden xl:block w-28 h-28 bg-grey object-cover"
        />

        <div className="flex flex-col justify-between pb-2 w-full min-w-[300px]">
          <div>
            <Link
              to={`/blog/${blog_id}`}
              className="blog-title mb-4 hover:underline"
            >
              {title}
            </Link>
            <p className="line-clamp-1">Submitted on {getDay(publishedAt)}</p>
            <div className="mt-3">
              <span className="font-medium">
                Total reports: {reports.length}
              </span>
              <button
                className="ml-4 underline text-purple"
                onClick={() => setShowReportsDialog(true)}
              >
                View details
              </button>
            </div>
          </div>

          <div className="flex gap-6 mt-5">
            <button
              onClick={() => handleAction("reject")}
              className="btn-dark text-rly-white bg-red"
            >
              Remove post
            </button>
          </div>
        </div>
      </div>

      {/* Диалог подробностей по жалобам */}
      {showReportsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px]">
            <h2 className="text-2xl font-medium mb-4">Report Details</h2>
            <ul className="mb-6">
              {Object.entries(reportTypeCounts).map(([reason, count]) => (
                <li key={reason} className="mb-2">
                  <span className="font-medium">{reason}</span>: {count}
                </li>
              ))}
            </ul>
            <button
              className="btn-light rounded-md transition-colors"
              onClick={() => setShowReportsDialog(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ConfirmDialogModetation
        isOpen={showActionDialog.show}
        onClose={() => setShowActionDialog({ show: false, action: null })}
        onConfirm={confirmAction}
        title={`Reject Post`}
        message="Add an optional comment for the author:"
        confirmText="Reject"
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
