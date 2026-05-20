const repoInput = document.getElementById("repo-input");
const searchbtn = document.getElementById("search-btn");
const openCard = document.getElementById("open-Cards");
const reviewCard = document.getElementById("review-Cards");
const closedCard = document.getElementById("closed-Cards");


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
    console.log(error);
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


