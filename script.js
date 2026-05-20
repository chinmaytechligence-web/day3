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

    
    const repoURL =`https://api.github.com/repos/${owner}/${repo}`;
    const issuesURL =`https://api.github.com/repos/${owner}/${repo}/issues`;

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

    //clearing previous cards 
    openCard.innerHTML = "";
    closedCard.innerHTML = "";

    //loop through issue data 
    issues.forEach(issue => {
      
      //skip pull req
      if (issue.pull_request) {
        return
      }

      //creating card 

      const card = createCard(issue);

      if (issue.state === "open") {
        openCard.append(card);
      }

      else {
        closedCard.append(card);
      }

    });
    }
    
  } catch (error) {
    removeLoading();
    showRepoInfo(repoData);

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
    
    // append into cards container
    column.querySelector(".cards").appendChild(draggingCard);
  
  });
});


// SHOW LOADING
function showLoading(){
  openCards.innerHTML = `
    <p class="loading"> Loading... </p>`;
}

// REMOVE LOADING
function removeLoading(){
  openCards.innerHTML = "";
}


