const storeInSession = (key, value) => {
  return localStorage.setItem(key, value);
};

const lookInSession = (key) => {
  return localStorage.getItem(key);
};

const removeFromSession = (key) => {
  return localStorage.removeItem(key);
};

const logOutUser = () => {
  localStorage.clear();
};

export { storeInSession, lookInSession, logOutUser, removeFromSession };
