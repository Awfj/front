import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import lightBanner from "../imgs/blog banner light.png";
import darkBanner from "../imgs/blog banner dark.png";

import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import { uploadImage } from "../common/cloudinary";
import axios from "axios";
import { ThemeContext, UserContext } from "../App";

const BlogEditor = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const navigate = useNavigate();
  let { blog_id } = useParams();
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let { theme } = useContext(ThemeContext);
  let {
    blog,
    blog: { title, banner, content, category, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  useEffect(() => {
    // Добавляем проверку на существование textEditor
    if (!textEditor.isReady && !blog_id) {
      let editor = new EditorJS({
        holderId: "textEditor",
        data: Array.isArray(content) ? content[0] : content,
        tools: tools,
        placeholder: "Let's write an awesome story",
      });

      editor.isReady
        .then(() => {
          setTextEditor(editor);
        })
        .catch((err) => {
          console.log("Editor.js initialization error:", err);
        });
    }
  }, []);

  const handleChangeBanner = (e) => {
    if (e.target.files[0]) {
      let loadingToast = toast.loading("Uploading...");
      uploadImage(e.target.files[0])
        .then((url) => {
          if (!url.includes("error")) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded successfully");
            setBlog({ ...blog, banner: url });

            const bannerImg = document.querySelector("#banner-img");
            if (bannerImg) {
              bannerImg.src = url;
            }
          } else {
            toast.dismiss(loadingToast);
            throw new Error("Error uploading image");
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          toast.error(err.message || "Error uploading image");
        });
    }
  };

  const handleTitleKeyDown = (e) => {
    // for enter key
    if (e.keyCode === 13) e.preventDefault();
  };
  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };
  const handleError = (e) => {
    let img = e.target;
    img.src = theme == "light" ? lightBanner : darkBanner;
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload the post banner to publish it");
    }
    if (!title.length) {
      return toast.error("Write the post title to publish it");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something in your blog to publish it");
          }
        })
        .catch((err) => {
          toast.error(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (isSaving || isRedirecting) {
      return;
    }

    if (!title.length) {
      return toast.error("Write the post title before saving the draft");
    }

    setIsSaving(true);
    let loadingToast = toast.loading("Saving the draft...");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          banner,
          des,
          content,
          category,
          tags,
          draft: true,
        };

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
            toast.dismiss(loadingToast);
            toast.success("Saved successfully");
            setIsRedirecting(true);
            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
            }, 5000);
          })
          .catch(({ response }) => {
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
          })
          .finally(() => {
            setIsSaving(false);
          });
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to={"/"} className="flex-none w-10">
          <img src={logo} alt="Logo" />
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">New Post</p>

        <div className="flex gap-4 ml-auto">
          <button
            className={`btn-dark py-2 ${
              isSaving || isRedirecting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePublishEvent}
            disabled={isSaving || isRedirecting}
          >
            Continue
          </button>

          <button
            className={`btn-light py-2 ${
              isSaving || isRedirecting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSaveDraft}
            disabled={isSaving || isRedirecting}
          >
            {isSaving
              ? "Saving..."
              : isRedirecting
              ? "Redirecting..."
              : "Save Draft"}
          </button>
        </div>
      </nav>

      <Toaster />

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  id="banner-img" // Add ID for easy reference
                  src={banner || (theme === "light" ? lightBanner : darkBanner)}
                  alt="Blog Banner"
                  className="z-20 w-full h-full object-cover"
                  onError={handleError}
                />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleChangeBanner}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Post Title"
              className="text-4xl font-medium w-full h-25 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
            <hr className="w-full opacity-10 my-5" />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
