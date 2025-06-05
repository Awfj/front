import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { uploadImage } from "../common/cloudinary";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  let bioLimit = 150;
  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updateProfileImg, setUpdatedProfileImg] = useState(null);

  let profileImageEle = useRef();
  let editProfileForm = useRef();

  let {
    personal_info: {
      profile_img,
      fullname,
      username: profile_username,
      email,
      bio,
    },
    social_links,
  } = profile;

  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          // Устанавливаем начальное значение оставшихся символов
          setCharactersLeft(bioLimit - (data.personal_info.bio?.length || 0));
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  }, [access_token]);

  const handleCharacterChange = (e) => {
    const currentLength = e.target.value.length;
    setCharactersLeft(bioLimit - currentLength);
  };

  const handleImagePrev = (e) => {
    let img = e.target.files[0];
    profileImageEle.current.src = URL.createObjectURL(img);

    setUpdatedProfileImg(img);
  };

  const handleUploadImg = (e) => {
    e.preventDefault();

    if (updateProfileImg) {
      let loadingToast = toast.loading("Uploading...");
      e.target.setAttribute("disabled", true);
      uploadImage(updateProfileImg)
        .then((url) => {
          if (url) {
            axios
              .post(
                import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
                { url },
                {
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                  },
                }
              )
              .then(({ data }) => {
                let newUserAuth = {
                  ...userAuth,
                  profile_img: data.profile_img,
                };

                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);

                setUpdatedProfileImg(null);
                toast.dismiss(loadingToast);
                toast.success("Uploaded Successfully :)");
                e.target.removeAttribute("disabled");
              });
          }
        })
        .catch(({ response }) => {
          e.target.removeAttribute("disabled");
          toast.dismiss(loadingToast);
          toast.error(response.data.error);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(editProfileForm.current);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let {
      username,
      bio,
      fullname,
      youtube,
      facebook,
      github,
      instagram,
      website,
    } = formData;

    // Validate fullname
    if (!fullname && !fullname.trim()) {
      return toast.error("Full name is required");
    }

    if (fullname.length < 3) {
      return toast.error("Full name should be at least 3 characters long");
    }

    if (fullname.length > 50) {
      return toast.error("Full name should not exceed 50 characters");
    }

    if (!/^[A-Za-zА-Яа-яЁё\s]+$/.test(fullname)) {
      return toast.error("Full name should contain only letters and spaces");
    }

    // Validate username
    if (!username && !username.trim()) {
      return toast.error("Username is required");
    }

    if (username.length < 3) {
      return toast.error("Username should be at least 3 characters long");
    }

    if (username.length > 30) {
      return toast.error("Username should not exceed 30 characters");
    }

    // Username can contain only letters, numbers, dots and underscores
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      return toast.error(
        "Username can contain only letters, numbers, dots and underscores"
      );
    }

    // Validate bio
    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit} characters`);
    }

    // Validate social links
    const socialLinks = { youtube, facebook, github, instagram, website };
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    for (let [platform, url] of Object.entries(socialLinks)) {
      if (url && url.trim()) {
        // Skip empty URLs
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return toast.error(
            `${platform} URL must start with http:// or https://`
          );
        }

        if (!urlRegex.test(url)) {
          return toast.error(`Invalid ${platform} URL format`);
        }

        // Validate platform-specific domains
        if (platform !== "website") {
          try {
            const hostname = new URL(url).hostname;
            if (!hostname.includes(`${platform}.com`)) {
              return toast.error(`Invalid ${platform} URL domain`);
            }
          } catch (err) {
            return toast.error(`Invalid ${platform} URL`);
          }
        }
      }
    }

    let loadingToast = toast.loading("Updating...");
    e.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          fullname,
          username,
          bio,
          social_links: {
            youtube,
            facebook,
            github,
            instagram,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        if (userAuth.username != data.username) {
          let newUserAuth = {
            ...userAuth,
            username: data.username,
            fullname: data.fullname,
          };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile updated successfully!");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <Toaster />
          <h1 className="max-md:hidden text-2xl font-medium">Edit Profile</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImg"
                id="profileImgLabel"
                className="relative block w-48 h-48 bg-grey rounded-full border border-magenta overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img
                  ref={profileImageEle}
                  src={profile_img}
                  alt="Profile Img"
                />
              </label>
              <input
                type="file"
                id="uploadImg"
                accept=".jpeg, .png, .jpg"
                hidden
                onChange={handleImagePrev}
              />
              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                onClick={handleUploadImg}
              >
                Upload
              </button>
            </div>

            <div className="w-full">
              <div className="flex xl:flex-row flex-col gap-6">
                {/* Personal info */}
                <div className="flex flex-col gap-6 w-[100%]">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="fullname" className="text-dark-grey">
                      Full Name
                    </label>
                    <InputBox
                      name="fullname"
                      type="text"
                      value={fullname}
                      placeholder="Full Name"
                      icon="fi-rr-user"
                      bottomMargin={false}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-dark-grey">
                      Username
                    </label>
                    <InputBox
                      type="text"
                      name="username"
                      value={profile_username}
                      placeholder="Username"
                      icon="fi-rr-at"
                      bottomMargin={false}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-dark-grey">
                      Email
                    </label>
                    <InputBox
                      name="email"
                      type="email"
                      value={email}
                      placeholder="Email"
                      icon="fi-rr-envelope"
                      disable={true}
                      bottomMargin={false}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1 w-[100%]">
                  <label htmlFor="bio" className="text-dark-grey">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    maxLength={bioLimit}
                    defaultValue={bio}
                    className="input-box min-h-[150px] h-[100%] resize-none leading-7 pl-5"
                    placeholder="Write something about yourself..."
                    onChange={handleCharacterChange}
                  ></textarea>
                  <p className="text-dark-grey">
                    {charactersLeft} characters left
                  </p>
                </div>
              </div>

              {/* Social links section */}
              <div className="mt-8">
                <label className="text-dark-grey mb-4 block">
                  Social Links
                </label>
                <div className="md:grid md:grid-cols-2 gap-x-6 gap-y-2">
                  {Object.keys(social_links)
                    .filter((key) => key !== "twitter" && key !== "facebook")
                    .map((key, i) => {
                      let link = social_links[key];
                      return (
                        <InputBox
                          key={i}
                          name={key}
                          type="text"
                          value={link}
                          placeholder={`${
                            key.charAt(0).toUpperCase() + key.slice(1)
                          } URL`}
                          icon={
                            "fi " +
                            (key !== "website"
                              ? "fi-brands-" + key
                              : "fi-rr-globe")
                          }
                        />
                      );
                    })}
                </div>
              </div>

              <div className="flex mt-6 justify-end">
                <button
                  className="btn-dark w-auto px-10 mr-0"
                  type="submit"
                  onClick={handleSubmit}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
