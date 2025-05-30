import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import InPageNavigaion from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import {
  ManagePublishedBlogCard,
  ManageDraftBlogPost,
} from "../components/manage-blogcard.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";

const ManageBookmarks = () => {
  const [blogs, setBlogs] = useState(null);
  const [query, setQuery] = useState("");

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getBookmarks = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-bookmarks",
        { page, query, deletedDocCount },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        // console.log(data.blogs)
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.bookmarkedBlogs,
          page,
          user: access_token,
          countRoute: "/user-bookmarks-count",
          data_to_send: { query },
        });
        // console.log(formateData)
        setBlogs(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleChange = (e) => {
    if (e.target.value.length) {
      setQuery("");
      setBlogs(null);
    }
  };

  const handleSearch = (e) => {
    let searchQuery = e.target.value;
    setQuery(searchQuery);

    if (e.keyCode == 13 && searchQuery.length) {
      setBlogs(null);
    }
  };

  useEffect(() => {
    if (access_token) {
      if (blogs == null) {
        getBookmarks({ page: 1 });
      }
    }
  }, [access_token, blogs, query]);

  return (
    <>
      <h1 className="max-md:hidden text-2xl mb-8">Manage Bookmarks</h1>
      <Toaster />
      {/* <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="Search bookmarked blogs"
          onChange={handleChange}
          onKeyDown={handleSearch}
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
      </div> */}

      {blogs == null ? (
        <Loader />
      ) : blogs.results.length ? (
        <>
          {blogs.results.map((blog, i) => {
            return (
              <AnimationWrapper
                key={i}
                transition={{ duration: 1, delay: i * 0.1 }}
              >
                <BlogPostCard
                  content={blog}
                  author={blog.author.personal_info}
                />
              </AnimationWrapper>
            );
          })}
          <LoadMoreDataBtn
            state={blogs}
            fetchDataFun={getBookmarks}
            additionalParam={{
              deletedDocCount: blogs.deletedDocCount,
            }}
          />
        </>
      ) : (
        <NoDataMessage message="No Bookmarks Available" />
      )}
    </>
  );
};

export default ManageBookmarks;
