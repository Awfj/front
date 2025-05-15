import React, { useState, useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";

import { CATEGORIES } from "../pages/home.page";

const PublishForm = () => {
  const charLength = 200;
  const tagLimit = 10;
  const navigate = useNavigate();
  const { blog_id } = useParams();
  const maxTagLength = 20; // Maximum length for a single tag
  const [tagInput, setTagInput] = useState(""); // Add state for tag input
  let {
    blog: { banner, title, tags, des, content },
    setEditorState,
    setBlog,
    blog,
  } = useContext(EditorContext);
  // let {userAuth: {access_token}} = useContext(UserContext)

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const handleClose = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add max ${tagLimit} tags`);
      }
      e.target.value = "";
    }
  };

  const handleTagInput = (e) => {
    const value = e.target.value;
    if (value.length <= maxTagLength) {
      setTagInput(value);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag.length) {
      if (tags.length < tagLimit) {
        if (!tags.includes(tag)) {
          setBlog({ ...blog, tags: [...tags, tag] });
          setTagInput(""); // Clear input after adding
        } else {
          toast.error("This tag already exists");
        }
      } else {
        toast.error(`You can add max ${tagLimit} tags`);
      }
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handlePublish = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write the post title before publishing");
    }
    if (!des.length || des.length > charLength)
      return toast.error(
        `Write a description about your post within ${charLength} characters to publish`
      );
    if (!tags.length || tags.length > 10) {
      return toast.error(
        `Write some tags about your post within ${tagLimit} limit to publish`
      );
    }
    if (!blog.category) {
      return toast.error("Please select a category for your post");
    }

    let loadingToast = toast.loading("Publishing...");

    let blogObj = {
      title,
      banner,
      des,
      content,
      tags,
      category: blog.category,
      draft: false,
    };
    e.target.classList.add("disable");
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
        { ...blogObj, id: blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success("Published successfully");
        setTimeout(() => {
          navigate("/dashboard/blogs");
        }, 5000);
      })
      .catch(({ response }) => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        return toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <Toaster />
        <button
          className="absolute right-[5vw] z-10 top-[5%] lg:top-[10%] interactivity icon text-black"
          onClick={handleClose}
        >
          <i className="fi fi-br-cross interactivity icon text-black"></i>
        </button>
        <div className="max-w-[500px] center ">
          <p className="text-dark-grey mb-1">Preview</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} alt="Banner" />
          </div>
          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>
          <p className="font-gelasio line-clamp-3 text-xl leading-7 mt-4">
            {des}
          </p>
        </div>

        <div className="border-grey lg:border-1 lg:pl-4 flex flex-col">
          {/* TITLE */}
          <p className="text-dark-grey mb-2 mt-9">Post Title</p>
          <input
            type="text"
            placeholder="Post Title"
            defaultValue={title}
            className="input-box pl-4"
            onChange={handleBlogTitleChange}
          />

          {/* SHORT DESCRIPTION */}
          <p className="text-dark-grey mb-2 mt-9">
            Short description about your post
          </p>
          <textarea
            maxLength={charLength}
            defaultValue={des}
            className="h-40 resize-none leading-7 input-box pl-4"
            onChange={(e) => setBlog({ ...blog, des: e.target.value })}
            onKeyDown={(e) => {
              if (e.keyCode === 13) e.preventDefault();
            }}
          ></textarea>
          <p className="mt-1 text-dark-grey text-right">
            {charLength - des.length} characters left
          </p>

          {/* CATEGORY */}
          <p className="text-dark-grey mb-2 mt-6">Category</p>
          <select
            className="w-full p-3 pr-8 rounded-md bg-light-grey border border-grey 
              appearance-none bg-no-repeat bg-[right_0.75rem_center] 
              bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==')]"
            value={blog.category}
            onChange={(e) => setBlog({ ...blog, category: e.target.value })}
          >
            <option value="">Select a category</option>
            {Object.entries(CATEGORIES).map(([mainCategory, subCategories]) => (
              <optgroup key={mainCategory} label={mainCategory}>
                {subCategories.map((subCategory, i) => (
                  <option key={i} value={subCategory.toLowerCase()}>
                    {subCategory}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* TAGS */}
          <p className="text-dark-grey mb-2 mt-9">Tags</p>

          <div className="relative input-box pl-2 py-2 pb-4">
            <div className="mb-3">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={handleTagInput}
                  onKeyDown={handleTagKeyDown}
                  className="input-box bg-white pl-4 focus:bg-white flex-1"
                  maxLength={maxTagLength}
                />

                <button
                  className="flex flex-center interactivity icon text-black"
                  onClick={addTag}
                  type="button"
                >
                  <i className={"flex-center p-1 fi fi-br-plus text-3xl interactivity icon text-black"}></i>
                </button>
              </div>
              <span className="ml-1">
                {maxTagLength - tagInput.length} characters left
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags &&
                tags.map((tag, i) => <Tag key={i} tagIndex={i} tag={tag} />)}
            </div>
          </div>
          <div className="flex justify-end mt-1 text-dark-grey text-sm">
            <span>{tagLimit - tags.length} tags left</span>
          </div>

          <button
            onClick={handlePublish}
            className="btn-dark px-8 mt-9 self-end"
          >
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
