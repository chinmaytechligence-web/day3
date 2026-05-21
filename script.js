const repoInput = document.getElementById("repo-input");
const searchbtn = document.getElementById("search-btn");
const openCards = document.getElementById("open-Cards");
const reviewCards = document.getElementById("review-Cards");
const closedCards = document.getElementById("closed-Cards");
const errorMessage = document.getElementById("errorMessage");
const repoInfo = document.getElementById("repoInfo");
const openColumn =document.getElementById("openColumn");
const reviewColumn =document.getElementById("reviewColumn");
const closedColumn = document.getElementById("closedColumn");

const keywordFilter=document.getElementById("keywordFilter");
const labelFilter=document.getElementById("labelFilter");
const assigneeFilter=document.getElementById("assigneeFilter");

let allIssues = [];

searchbtn.addEventListener("click", () => {
  const userInput = repoInput.value.trim();

  if (userInput === "") {
    alert("Please enter valid url or user/reponame");
    return
  };

  //handle issue
  fetchIssues(userInput);
})

async function fetchIssues(userInput) {
  try {
    showLoading();
    errorMessage.textContent = "";
    let owner;
    let repo;

    // if direct url is given 
    if (userInput.includes("github.com")) {
      const parts = userInput.split('/');

      owner = parts[3];
      repo = parts[4];
    }

    // if searched by owner and repo name
    else {
      [owner, repo] = userInput.split("/");
    }
    const repoURL =`https://api.github.com/repos/${owner}/${repo}`;
    const issuesURL =`https://api.github.com/repos/${owner}/${repo}/issues?state=all`;;

    // get data
    const [repoResponse, issuesResponse] =await Promise.all([fetch(repoURL),fetch(issuesURL)]);
    
    // 404 ERROR
    if(repoResponse.status === 404){
      throw new Error("Repo not found");
    }

    // 403 ERROR
    if(repoResponse.status === 403){
      throw new Error("Too many requests. Try later.");
    }

    // OTHER ERRORS
    if(!repoResponse.ok||!issuesResponse.ok){
      throw new Error("Something went wrong");
    }

    //get json response
    const repoData = await repoResponse.json();
    const issues = await issuesResponse.json();

    allIssues = issues.filter(issue =>!issue.pull_request);

    removeLoading();
    showRepoInfo(repoData);

    //clearing previous cards 
    openCards.innerHTML = "";
    closedCards.innerHTML = "";
  
    renderIssues(issues);

    populateFilters(issues);

  } catch (error) {
    removeLoading();
    if(error.message === "Failed to fetch"){
    errorMessage.textContent ="Check your internet connection";}
    else {
    errorMessage.textContent = error.message;}
  }

}

function showRepoInfo(repo){
  repoInfo.innerHTML = `
    <h2>${repo.full_name}</h2>
    <p>${repo.description || "No description"}</p>
    <br>
    <p>Stars: ${repo.stargazers_count}</p>
    <p>🍴 Forks: ${repo.forks_count}</p>`;
}
function renderIssues(issues){
  // clear board
  openCards.innerHTML = "";
  reviewCards.innerHTML = "";
  closedCards.innerHTML = "";

  issues.forEach(issue => {
    // skip PRs
    if(issue.pull_request){
      return;
    }
    const card = createCard(issue);

    if(issue.state === "open"){
      openCards.append(card);
    }
    else{
      closedCards.append(card);
    }
  });
}
function populateFilters(issues){
      const labelsSet = new Set();
      const assigneeSet = new Set();
      issues.forEach(issue => {
        issue.labels.forEach(label => {
          labelsSet.add(label.name);
        });

        if(issue.assignee){
          assigneeSet.add(issue.assignee.login);
        }
      });
      // reset options
      labelFilter.innerHTML =`<option value="">All Labels</option>`;
      assigneeFilter.innerHTML =`<option value="">All Assignees</option>`;

      // labels
      labelsSet.forEach(label => {labelFilter.innerHTML += `<option value="${label}">${label}</option>`;});

      // assignees
      assigneeSet.forEach(assignee => {
        assigneeFilter.innerHTML += `<option value="${assignee}">${assignee}</option>`;});
}
    

function createCard(issue){

  // create div
  const card = document.createElement("div");

  // add class
  card.classList.add("card");

  card.setAttribute("draggable", true);

  // labels html
  let labelsHTML = "";

  issue.labels.forEach(label => {
    labelsHTML += `
      <span class="label">${label.name}</span>`;
  });

  // card html
  card.innerHTML = `
    <h3>${issue.title}</h3>
    <div class="labels">${labelsHTML}</div>
    <p>Comments: ${issue.comments}</p>`;

  card.addEventListener("dragstart", () => {
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

  return card;

}
const columns = [
  openColumn,
  reviewColumn,
  closedColumn
];



// LOOP THROUGH COLUMNS
columns.forEach(column => {
  // ALLOW DROP
  column.addEventListener("dragover", (e) => {e.preventDefault();});

  // HANDLE DROP
  column.addEventListener("drop", () => {
  // currently dragged card
  const draggingCard = document.querySelector(".dragging");
    
  // safety check
  if(!draggingCard){
    return;
  }
  // append into cards container
  column.querySelector(".cards")
    .appendChild(draggingCard);
});
});

keywordFilter.addEventListener(
  "input",
  applyFilters
);

labelFilter.addEventListener(
  "change",
  applyFilters
);

assigneeFilter.addEventListener(
  "change",
  applyFilters
);

// SHOW LOADING
function showLoading(){
  openCards.innerHTML = `
    <p class="loading"> Loading... </p>`;
}

// REMOVE LOADING
function removeLoading(){
  openCards.innerHTML = "";
  reviewCards.innerHTML = "";
  closedCards.innerHTML = "";
}

function applyFilters(){

  const keyword=keywordFilter.value.toLowerCase();
  const selectedLabel =labelFilter.value;
  const selectedAssignee=assigneeFilter.value;

  const filteredIssues =
    allIssues.filter(issue => {
      // keyword match
      const matchesKeyword =
        issue.title.toLowerCase()
          .includes(keyword);
      // label match
      const matchesLabel =
        !selectedLabel ||
        issue.labels.some(label =>
          label.name === selectedLabel
        );
      // assignee match
      const matchesAssignee =
        !selectedAssignee ||
        (
          issue.assignee &&
          issue.assignee.login === selectedAssignee
        );
      return (
        matchesKeyword &&
        matchesLabel &&
        matchesAssignee
      );
    });
  renderIssues(filteredIssues);

}


