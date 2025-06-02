import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import UserCard from "../components/user-card.component";
import LoadMoreDataBtn from "../components/load-more.component";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/confirm-dialog.component";
import { useNavigate } from "react-router-dom";
import { storeInSession, logOutUser } from "../common/session";

const BAN_DURATIONS = [
  { label: "1 Day", value: "1" },
  { label: "3 Days", value: "3" },
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
];

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [banDuration, setBanDuration] = useState("1");
  const [banReason, setBanReason] = useState("");
  const [showBanError, setShowBanError] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
  });

  const [roleDialog, setRoleDialog] = useState({
    isOpen: false,
    userId: null,
    currentRole: null,
    selectedRole: null, // Add new state for selected role
  });

  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const getUsers = ({ page = 1, create_new_arr = false }) => {
    setLoading(true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/get-users",
        { page, query },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: create_new_arr ? null : users, // Сбрасываем state если create_new_arr true
          data: data.users,
          page,
          user: access_token,
          countRoute: "/users-count",
          data_to_send: { query },
        });
        setUsers(formateData);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    // Обновляем значение поиска без отправки запроса
    if (e.type === "change") {
      setQuery(e.target.value);
    }

    // Выполняем поиск только при нажатии Enter
    if (e.type === "keydown" && e.key === "Enter") {
      setUsers(null); // Сбрасываем текущие результаты
      getUsers({
        page: 1,
        create_new_arr: true, // Указываем создание нового массива
      });
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  // HANDLE ROLE CHANGE
  const handleRoleChange = (userId, currentRole) => {
    setRoleDialog({
      isOpen: true,
      userId,
      currentRole,
      selectedRole: currentRole, // Устанавливаем текущую роль как выбранную
    });
  };

  const selectRole = (role) => {
    setRoleDialog((prev) => ({
      ...prev,
      selectedRole: role,
    }));
  };

  const confirmRoleChange = () => {
    if (!roleDialog.selectedRole) return;

    // Close role dialog
    setRoleDialog({
      isOpen: false,
      userId: null,
      currentRole: null,
      selectedRole: null,
    });

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      userId: roleDialog.userId,
      action: "changeRole",
      newRole: roleDialog.selectedRole,
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === "delete") {
      confirmDelete();
    } else if (confirmDialog.action === "changeRole") {
      handleRoleChangeConfirm();
    }
  };

  const handleRoleChangeConfirm = () => {
    const { userId, selectedRole } = roleDialog;
    const isCurrentUser = userId === userAuth._id;

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/change-user-role`,
        {
          userId,
          newRole: selectedRole,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        // Обновляем список пользователей
        setUsers((prev) => ({
          ...prev,
          results: prev.results.map((user) =>
            user._id === userId ? { ...user, role: data.newRole } : user
          ),
        }));

        // Если администратор изменил свою роль
        if (isCurrentUser) {
          const updatedUserAuth = {
            ...userAuth,
            role: data.newRole,
          };
          setUserAuth(updatedUserAuth);
          storeInSession("user", JSON.stringify(updatedUserAuth));
          navigate("/");
        } else {
          toast.success("User role updated successfully");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.error || "Error updating role");
      })
      .finally(() => {
        setRoleDialog({
          isOpen: false,
          userId: null,
          currentRole: null,
          selectedRole: null,
        });
      });
  };

  // HANDLE DELETE
  const handleDelete = (userId) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      action: "delete", // Добавляем action при открытии диалога удаления
    });
  };

  const confirmDelete = () => {
    const { userId } = confirmDialog;
    const isCurrentUser = userId === userAuth._id;

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-user`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        if (isCurrentUser) {
          // Если админ удалил себя
          logOutUser();
          setUserAuth({ access_token: null });
          navigate("/");
        } else {
          // Обновляем список пользователей
          setUsers((prev) => {
            if (!prev || !prev.results) return prev;

            return {
              ...prev,
              results: prev.results.filter((user) => user._id !== userId),
              totalDocs: prev.totalDocs - 1,
            };
          });
        }
        toast.success("User deleted successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.error || "Error deleting user");
      })
      .finally(() => {
        setConfirmDialog({ isOpen: false, userId: null, action: null });
      });
  };

  const [banDialog, setBanDialog] = useState({
    isOpen: false,
    userId: null,
  });

  const handleBanUser = (userId) => {
    setBanDialog({
      isOpen: true,
      userId,
    });
  };

  const confirmBan = async (duration, reason) => {
    if (!reason.trim()) {
      setShowBanError(true);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/ban-user`,
        {
          userId: banDialog.userId,
          duration,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Update users list
      setUsers((prev) => ({
        ...prev,
        results: prev.results.map((user) =>
          user._id === banDialog.userId
            ? {
                ...user,
                ban: {
                  isBanned: true,
                  bannedUntil: new Date(
                    Date.now() + duration * 24 * 60 * 60 * 1000
                  ),
                  reason,
                },
              }
            : user
        ),
      }));

      toast.success("User banned successfully");
      setBanDialog({ isOpen: false, userId: null });
      setBanReason("");
      setShowBanError(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error banning user");
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/unban-user`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Update users list
      setUsers((prev) => ({
        ...prev,
        results: prev.results.map((user) =>
          user._id === userId
            ? {
                ...user,
                ban: {
                  isBanned: false,
                  bannedUntil: null,
                  reason: "",
                },
              }
            : user
        ),
      }));

      toast.success("User unbanned successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error unbanning user");
    }
  };

  useEffect(() => {
    if (access_token) {
      getUsers({ page: 1 });
    }
  }, [access_token]);

  return (
    <>
      <h1 className="max-md:hidden text-2xl font-medium">All Users</h1>
      <Toaster />

      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="text"
          placeholder="Search users"
          onChange={handleSearch}
          onKeyDown={handleSearch}
          value={query}
          className="w-full bg-grey p-4 pl-6 pr-6 rounded-full placeholder:text-dark-grey"
        />

        {query ? (
          <button
            onClick={clearSearch}
            className="absolute right-[21px] top-1/2 -translate-y-1/2 text-dark-grey hover:text-black"
          >
            <i className="fi fi-br-cross text-sm"></i>
          </button>
        ) : (
          <i className="fi fi-rr-search flex-center absolute right-[21px] md:pointer-events-none top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : users?.results?.length ? (
        <>
          {users.results.map((user, i) => (
            <AnimationWrapper
              key={i}
              transition={{ duration: 1, delay: i * 0.1 }}
            >
              <UserCard
                user={user}
                hasDropdownMenu={true}
                options={[
                  {
                    label: "Change Role",
                    onClick: () => handleRoleChange(user._id, user.role),
                    icon: "fi fi-rr-user-gear",
                  },
                  {
                    label: user.ban?.isBanned ? "Unban User" : "Ban User",
                    onClick: () =>
                      user.ban?.isBanned
                        ? handleUnbanUser(user._id)
                        : handleBanUser(user._id),
                    icon: "fi fi-rr-ban",
                    danger: !user.ban?.isBanned,
                  },
                  {
                    label: "Delete",
                    onClick: () => handleDelete(user._id),
                    icon: "fi fi-rr-trash",
                    danger: true,
                  },
                ]}
              />
            </AnimationWrapper>
          ))}
          <LoadMoreDataBtn state={users} fetchDataFun={getUsers} />
        </>
      ) : (
        <NoDataMessage message="No users found" />
      )}

      {/* Role change dialog */}
      <ConfirmDialog
        isOpen={roleDialog.isOpen}
        onClose={() =>
          setRoleDialog({
            isOpen: false,
            userId: null,
            currentRole: null,
            selectedRole: null,
          })
        }
        title="Change User Role"
        message="Select new role for this user:"
        customContent={
          <div className="flex flex-col gap-2 mb-3">
            {["author", "moderator", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => selectRole(role)}
                className={`btn-light rounded-md capitalize py-2 ${
                  roleDialog.selectedRole === role ? "bg-purple/30" : ""
                } ${
                  role === "admin"
                    ? "border-red text-red hover:bg-red/10"
                    : role === "moderator"
                    ? "border-green text-green hover:bg-green/10"
                    : ""
                } ${role === roleDialog.currentRole ? "border-2" : ""}`}
              >
                {role === "admin" ? "administrator" : role}
              </button>
            ))}
          </div>
        }
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={handleRoleChangeConfirm}
        disabled={
          !roleDialog.selectedRole ||
          roleDialog.selectedRole === roleDialog.currentRole
        }
      />

      {/* Existing delete dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, userId: null, action: null })
        }
        onConfirm={handleConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={banDialog.isOpen}
        onClose={() => {
          setBanDialog({ isOpen: false, userId: null });
          setBanDuration("1");
          setBanReason("");
          setShowBanError(false);
        }}
        onConfirm={() => confirmBan(parseInt(banDuration), banReason)}
        title="Ban User"
        message="Select ban duration and reason:"
        customContent={
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {BAN_DURATIONS.map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setBanDuration(duration.value)}
                  className={`py-2 px-4 whitespace-nowrap rounded-full transition-colors font-medium ${
                    banDuration === duration.value
                      ? "btn-dark border-purple text-purple shadow font-bold"
                      : "btn-light bg-light-grey"
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
            <textarea
              value={banReason}
              onChange={(e) => {
                setBanReason(e.target.value);
                if (showBanError) setShowBanError(false);
              }}
              placeholder="Reason for the ban (required)"
              className={`w-full p-2 border rounded bg-white dark:bg-dark text-black 
              ${showBanError ? "border-red" : "border-grey"}`}
              rows={3}
            />
            {showBanError && (
              <p className="text-red text-sm">
                Please provide a reason for the ban
              </p>
            )}
          </div>
        }
        confirmText="Confirm"
        cancelText="Cancel"
        disabled={!banReason.trim()}
      />
    </>
  );
};

export default Users;
