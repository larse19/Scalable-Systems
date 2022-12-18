const Axios = require("axios");

const getTopIssuesClosed = async (repository) => {
  const results =
    (await Axios.get(
      "http://localhost:5000/top-closed-issues?repoName=" + repository
    )) || [];
  console.log("hallo", results.data);
  return {
    text: `User ${results.data[0]} has closed ${results.data[1]} issues in ${repository}`,
    results: results.data,
  };
};

module.exports = getTopIssuesClosed;
