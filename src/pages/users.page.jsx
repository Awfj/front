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

const Users = () => {
  const [users, setUsers] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getUsers = ({ page = 1 }) => {
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
          state: users,
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
    let searchQuery = e.target.value;
    setQuery(searchQuery);

    if (e.keyCode === 13) {
      setUsers(null);
      getUsers({ page: 1 });
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
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="Search users"
          onChange={handleSearch}
          onKeyDown={handleSearch}
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
              <UserCard user={user} />
            </AnimationWrapper>
          ))}
          <LoadMoreDataBtn state={users} fetchDataFun={getUsers} />
        </>
      ) : (
        <NoDataMessage message="No users found" />
      )}
    </>
  );
};

export default Users;
