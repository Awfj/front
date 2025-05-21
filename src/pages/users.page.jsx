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

const Users = () => {
  const [users, setUsers] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
  });

  const [roleDialog, setRoleDialog] = useState({
    isOpen: false,
    userId: null,
    currentRole: null,
  });

  let {
    userAuth: { access_token },
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
        create_new_arr: true // Указываем создание нового массива
      });
    }
  };

  // HANDLE ROLE CHANGE
  const handleRoleChange = (userId, currentRole) => {
    setRoleDialog({
      isOpen: true,
      userId,
      currentRole,
    });
  };

  const confirmRoleChange = (newRole) => {
    const userId = roleDialog.userId;

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/change-user-role`,
        {
          userId,
          newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setUsers((prev) => ({
          ...prev,
          results: prev.results.map((user) =>
            user._id === userId ? { ...user, role: data.newRole } : user
          ),
        }));
        toast.success("User role updated successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.error || "Error updating role");
      })
      .finally(() => {
        setRoleDialog({ isOpen: false, userId: null, currentRole: null });
      });
  };

  // HANDLE DELETE
  const handleDelete = (userId) => {
    setConfirmDialog({
      isOpen: true,
      userId,
    });
  };

  const confirmDelete = () => {
    const userId = confirmDialog.userId;

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
        setUsers((prev) => ({
          ...prev,
          results: prev.results.filter((user) => user._id !== userId),
          totalDocs: prev.totalDocs - 1,
        }));
        toast.success("User deleted successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.error || "Error deleting user");
      })
      .finally(() => {
        setConfirmDialog({ isOpen: false, userId: null });
      });
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
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="Search users"
          onChange={handleSearch}
          onKeyDown={handleSearch}
          value={query}
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
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
          setRoleDialog({ isOpen: false, userId: null, currentRole: null })
        }
        title="Change User Role"
        message="Select new role for this user:"
        customContent={
          <div className="flex flex-col gap-2 mb-4">
            {["author", "moderator"].map((role) => (
              <button
                key={role}
                onClick={() => confirmRoleChange(role)}
                className={`btn-light rounded-md capitalize py-2 ${
                  roleDialog.currentRole === role ? "bg-purple/10" : ""
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        }
        confirmText="Cancel"
      />

      {/* Existing delete dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, userId: null })}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default Users;
