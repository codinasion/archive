import core from "@actions/core";

import fetch from "node-fetch";

export default async function clickGithubUsernamePost(
  BACKEND_URL,
  BACKEND_ACCESS_TOKEN,
  OWNER,
  REPO,
  TOKEN,
  USERID,
  USERNAME,
  IMAGE_BRANCH
) {
  try {
    // Fetch latest images commit sha
    const imagesCommitSha = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/commits/${IMAGE_BRANCH}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());

    await console.log(
      `${USERNAME} => https://github.com/${OWNER}/${REPO}/blob/${imagesCommitSha.sha}/${USERNAME}.png`
    );
    await console.log(
      `${USERNAME} => https://raw.githubusercontent.com/${OWNER}/${REPO}/${imagesCommitSha.sha}/${USERNAME}.png`
    );

    // POST to backend
    const postArchiveResponse = await fetch(
      `${BACKEND_URL}/archive/github/users/archive/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          github_user: {
            id: USERID,
            login: USERNAME,
          },
          url: `https://github.com/${USERNAME}`,
          image_url: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${imagesCommitSha.sha}/${USERNAME}.png`,
        }),
      }
    );

    if (postArchiveResponse.status !== 201) {
      throw new Error("Error while posting to backend");
    }

    // End of action
  } catch (err) {
    core.setFailed(err.message);
  }
}
