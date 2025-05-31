import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  category: "", // Add category field
  author: { personal_info: {} },
};

export const EditorContext = createContext({
  blog: blogStructure, // Add default value
  setBlog: () => {},
  editorState: "editor",
  setEditorState: () => {},
  textEditor: { isReady: false },
  setTextEditor: () => {},
});

const Editor = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  // console.log(access_token)

  useEffect(() => {
    if (!blog_id) {
      // If no blog_id, initialize with empty structure but set loading false
      setBlog(blogStructure);
      return setLoading(false);
    }

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
        blog_id,
        draft: true,
        mode: "edit",
      })
      .then(({ data: { blog } }) => {
        setBlog(blog || blogStructure); // Use blogStructure as fallback
        setLoading(false);
      })
      .catch((err) => {
        setBlog(blogStructure); // Use blogStructure on error
        setLoading(false);
        console.error(err);
      });
  }, [blog_id]); // Add blog_id as dependency

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {access_token === null || undefined ? (
        <Navigate to="/signin" />
      ) : loading ? (
        // <Loader />
        <></>
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
