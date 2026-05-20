const repoInput = document.getElementById("repo-input");
const searchbtn = document.getElementById("search-btn");
const openCard = document.getElementById("open-Cards");
const reviewCard = document.getElementById("review-Cards");
const closedCard = document.getElementById("closed-Cards");
const errorMessage = document.getElementById("errorMessage");

searchbtn.addEventListener("click", () => {
  const userInput = repoInput.ariaValueMax.trim();

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

    
    const url = (`https://github.com/${owner}/${repo}/issues`);

    // get data
    const response = await fetch(url);
    
    // 404 ERROR
    if(response.status === 404){
      throw new Error("Repo not found");
    }

    // 403 ERROR
    if(response.status === 403){
      throw new Error("Too many requests. Try later.");
    }

    // OTHER ERRORS
    if(!response.ok){
      throw new Error("Something went wrong");
    }

    //get json response
    const issues = await response.json();

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

    if(error.message === "Failed to fetch"){
    errorMessage.textContent ="Check your internet connection";}
    
    else {
    errorMessage.textContent = error.message;}
  }

}

function createCard(issue){

  // create div
  const card = document.createElement("div");

  // add class
  card.classList.add("card");

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

  return card;

}

// SHOW LOADING
function showLoading(){
  openCards.innerHTML = `
    <p class="loading"> Loading... </p>`;
}

// REMOVE LOADING
function removeLoading(){
  openCards.innerHTML = "";
}


