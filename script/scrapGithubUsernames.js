import core from "@actions/core";

import fetch from "node-fetch";

import sleep from "./sleep.js";

export default async function scrapGithubUsernames(
  BACKEND_URL,
  BACKEND_ACCESS_TOKEN,
  TOKEN
) {
  try {
    // Get unfetched users from the backend
    const response = await fetch(
      `${BACKEND_URL}/archive/github/users/?format=json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch data from backend");
    }

    let users = await response.json();

    if (users.length === 0) {
      return;
    }

    for (const user of users) {
      await console.log(user.login);

      // Check if user exists !!!
      await console.log(`Checking if ${user.login} exists...`);
      const userResponse = await fetch(
        `https://api.github.com/users/${user.login}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (userResponse.status !== 200) {
        await console.log(`User ${user.login} does not exist.`);

        // Mark user as fetch_error
        const patchResponse = await fetch(
          `${BACKEND_URL}/archive/github/users/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              login: user.login,
              id: user.id,
            }),
          }
        );

        if (
          patchResponse.status !== 202 &&
          patchResponse.status !== 201 &&
          patchResponse.status !== 200
        ) {
          await console.log(patchResponse.status);
          throw new Error("Failed to patch data to backend");
        }

        await console.log("Posted to backend");

        core.setFailed(`User ${user.login} does not exist.`);

        return;
      }

      // Get user followers
      await console.log("Get user followers...");
      let followers = [];
      let followers_page = 1;
      while (true) {
        await console.log("Followers page: ", followers_page);

        let followers_response = await fetch(
          `https://api.github.com/users/${user.login}/followers?page=${followers_page}&per_page=100`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );
        if (followers_response.status !== 200) {
          throw new Error("Failed to fetch data from backend");
        }
        let followers_data = await followers_response.json();

        if (followers_data.length === 0) {
          break;
        }

        followers = await followers.concat(followers_data);
        followers_page += 1;

        await console.log("Followers: ", followers.length);

        if (followers_data.length < 100) {
          break;
        }

        if (followers_page > 10) {
          break;
        }

        // To prevent Github api secondary rate limit
        await sleep(5000);
      }

      await console.log("Total Followers: ", followers.length);

      for (const follower of followers) {
        await console.log(follower.login);

        // Post user to the backend
        const response = await fetch(`${BACKEND_URL}/archive/github/users/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            login: follower.login,
            id: follower.id,
          }),
        });

        if (response.status !== 201 && response.status !== 200) {
          await console.log(response.status);
          throw new Error("Failed to post data to backend");
        }

        await console.log("Posted to backend");

        await sleep(2000);
      }

      // Get user following
      await console.log("Get user following...");
      let following = [];
      let following_page = 1;
      while (true) {
        await console.log("Following page: ", following_page);

        let following_response = await fetch(
          `https://api.github.com/users/${user.login}/following?page=${following_page}&per_page=100`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
            },
          }
        );
        if (following_response.status !== 200) {
          throw new Error("Failed to fetch data from backend");
        }
        let following_data = await following_response.json();

        if (following_data.length === 0) {
          break;
        }

        following = await following.concat(following_data);
        following_page += 1;

        await console.log("Following: ", following.length);

        if (following_data.length < 100) {
          break;
        }

        if (following_page > 10) {
          break;
        }

        // To prevent Github api secondary rate limit
        await sleep(5000);
      }

      await console.log("Total Following: ", following.length);

      for (const follow of following) {
        await console.log(follow.login);

        // Post user to the backend
        const response = await fetch(`${BACKEND_URL}/archive/github/users/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            login: follow.login,
            id: follow.id,
          }),
        });

        if (response.status !== 201 && response.status !== 200) {
          await console.log(response.status);
          throw new Error("Failed to post data to backend");
        }

        await console.log("Posted to backend");

        await sleep(2000);
      }

      // Mark user as fetched in the backend
      const response = await fetch(`${BACKEND_URL}/archive/github/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${BACKEND_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          login: user.login,
          id: user.id,
          fetched: true,
        }),
      });

      if (response.status !== 201 && response.status !== 200) {
        await console.log(response.status);
        throw new Error("Failed to post data to backend");
      }

      await console.log("Marked as fetched");
    }

    // End of action
  } catch (err) {
    core.setFailed(err.message);
  }
}
