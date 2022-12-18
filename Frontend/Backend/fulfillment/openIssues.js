const Axios = require("axios");

const getOpenIssues = async (repository) => {
  const results =
    (await Axios.get(
      "http://localhost:5000/open-issues?repoName=" + repository
    )) || [];
  console.log("hallo", results.data);
  return {
    text: `There are ${results.data.length || 0} open issues in ${repository}`,
    results: results.data,
  };
};

module.exports = getOpenIssues;
