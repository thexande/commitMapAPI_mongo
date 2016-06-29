var gitHubApi = require('github');
var github = new gitHubApi({
  debug: true,
  protocol: "https",
  host: "api.github.com",
  timeout: 5000,
  headers: {
    "user-agent": "commitMap"
  },
  followRedirects: false,
})

module.exports = {
  getUserWebHooks : (userId) => {
    console.log(userId);
  },
  createUserWebHook: (user, repo) => {
    console.log("createUserWebHook");
    // authenticate with github
    github.authenticate({
      type: "oauth",
      token: user.bearer_token
    })
    // attempt to create webhook.
    console.log(user.login);
    console.log(repo.name);

    github.repos.createHook({
      name: "web",
      active: true,
      user: user.login,
      repo: repo.name,
      config: {
        url: 'https://cd62bf1d.ngrok.io/webHookReceive',
        content_type: 'json'
      }
    }, (res) => {
      console.log(res);
      return res
    })
  }

}
