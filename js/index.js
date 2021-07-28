document.addEventListener('DOMContentLoaded', app);

function app() {
  let isUserSearch = true;
  const userSearchURL = 'https://api.github.com/search/users?q=||TERM||'
  const repoSearchURL = '';
  const searchForm = document.getElementById('github-form');
  const searchBar = document.getElementById('search');
  const userList = document.getElementById('user-list');
  const repoList = document.getElementById('repo-list');

  searchForm.addEventListener('submit', handleSearchSubmit);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const searchTerm = searchBar.value;
    const searchURL = isUserSearch ? userSearchURL.replace('||TERM||', searchTerm) : '';
    fetch(searchURL, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    }).then(res => res.json())
      .then(data => data.items.map(item => new User(item)))
      .then(users => {
        userList.innerHTML = '';
        repoList.innerHTML = '';
        users.forEach(user => user.render(userList, handleUserRepoClick))
      });
    searchForm.reset();
  }

  function handleUserRepoClick(e) {
    const repoURL = e.target.dataset['repoUrl'];
    fetch(repoURL, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    }).then(res => res.json())
      .then(data => data.map(datum => new Repo(datum)))
      .then(repos => {
        repoList.innerHTML = '';
        repos.forEach(repo => repo.render(repoList));
      })
  }
}

class User {
  constructor({ login, avatar_url, html_url, repos_url }) {
    this.login = login;
    this.avatar_url = avatar_url;
    this.html_url = html_url;
    this.repos_url = repos_url;
  }

  render(parent, clickHandler) {
    const userElement = document.createElement('li');
    userElement.innerHTML = `
      <img class="avatar" src="${this.avatar_url}" alt="${this.login}'s avatar">
      <a href="${this.html_url}">${this.login}</a>
      <button data-repo-url=${this.repos_url}>See Repos</button>`
    userElement.classList.add('user-result');
    userElement.querySelector(`[data-repo-url="${this.repos_url}"`).addEventListener('click', clickHandler);
    parent.appendChild(userElement);
    return userElement;
  }
}

class Repo {
  constructor({ name, description, html_url }) {
    this.name = name;
    this.description = description;
    this.html_url = html_url;
  }

  render(parent) {
    const repoElement = document.createElement('li');
    repoElement.innerHTML = `
      <h3>${this.name}</h3>
      <a href="${this.html_url}">See ${this.name} on GitHub</a>`
    repoElement.classList.add('repo-result');
    parent.appendChild(repoElement);
    return repoElement;
  }
}