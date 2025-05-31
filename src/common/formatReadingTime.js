export const formatReadingTime = (minutes) => {
  if (!minutes || minutes < 1) {
    return "< 1 min read";
  } else if (minutes === 1) {
    return "1 min read";
  } else {
    return `${minutes} mins read`;
  }
};
