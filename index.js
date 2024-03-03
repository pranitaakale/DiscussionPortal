STORE_QUESTIONS = [];
// RIGHT_PANE_VARIABLES
var q_inp_btn = document.getElementById("inp-q-btn");
var res_btn = document.querySelector(".res-btn");
var res_box = document.querySelector(".response-box");
var upV_btn = document.querySelector(".upV_btn");
var downV_btn = document.querySelector(".DownV_btn");
var voteCount = document.getElementById("voteCount");
var resolve_btn = document.querySelector(".resolve-btn");
var fav_btn = document.getElementsByClassName("add-fav");
// LEFT_PANE_VARIABLES
var list_container = document.getElementById("list-quest");
var fav_quest = document.getElementById("list-quest-fav");
var resolved_quest = document.getElementById("list-quest-res");
var new_q_btn = document.getElementById("new-q-btn");
var search = document.getElementById("search-inp");
var SET_TAB = 0;  

// FUNCTIONS
q_inp_btn.addEventListener("click", getInputQuestion);
res_btn.addEventListener("click", submitResponse);
new_q_btn.onclick = getNewForm;
search.addEventListener("change", function(event){ filteredQuestionPane(event.target.value) })
var getResponse = setTimeout(sortedQuestions(), 2000);

function openPanel(panelName){
    fav_quest.style.display = 'none';
    resolved_quest.style.display = 'none';
    list_container.style.display = 'none';
    if(panelName === 'all'){
      list_container.style.display = 'block';
      SET_TAB = 0;
    }
    else if(panelName === 'favs'){
      fav_quest.style.display = 'block';
      SET_TAB = 1;
    }
    else{
      resolved_quest.style.display = 'block';
      SET_TAB = 2;
    }
    updateQuestionPane();
}

function getNewForm(){
  document.getElementById("quest-form").style.display = "block";
  var show_div = document.getElementById("q-box");
  show_div.style.display = "none";
}

function getInputQuestion(){
  var inp_q_title = document.getElementById("inp-q-subj").value;
  var inp_q = document.getElementById("inp-q").value;
  saveInputQuestion(inp_q_title, inp_q);
  inp_q.value = '';
  inp_q_title.value = '';
}

function saveInputQuestion(quest_title, quest){
  quest_id = STORE_QUESTIONS.length;

  var question_details = {
    id: quest_id,
    title: quest_title,
    description: quest,
    responses: [],
    response_count : 0,
    upVotes : 0,
    downVotes : 0,
    isResolved : false,
    isFavorite: false,
    createdAt : Date.now(),
    report : false
  }
  localStorage.setItem(quest_id,JSON.stringify(question_details));
  STORE_QUESTIONS.push(question_details);
  document.getElementById("inp-q-subj").value = '';
  document.getElementById("inp-q").value = '';
  sendDataToServer();
}

function sendDataToServer(){
  console.log(STORE_QUESTIONS)
  var body = {
    data : JSON.stringify(STORE_QUESTIONS)
  }
  
  var request = new XMLHttpRequest();
  request.open("POST", "https://storage.codequotient.com/data/save");
  request.setRequestHeader("Content-type", "application/json");
  request.send(JSON.stringify(body));
  request.addEventListener("load", function(){
    console.log(request.responseText);
  })
  sortedQuestions();
}

function updateQuestionPane(){
  if(SET_TAB === 0)
    list_container.innerHTML = "";
  if(SET_TAB === 1)
    fav_quest.innerHTML = "";
  if(SET_TAB === 2)
    resolved_quest.innerHTML = ""; 
  // sortedQuestions();
  // console.log(STORE_QUESTIONS)
  for(var i=0; i<STORE_QUESTIONS.length; ++i){
    var details_per_question = STORE_QUESTIONS[i];
    displayQuestions(details_per_question);
  }
}

function displayQuestions(quest_details){
  if(SET_TAB === 0){
    var elements = addElementToDiv(quest_details);
    list_container.appendChild(elements.qt_div);
    list_container.appendChild(elements.dt);
    list_container.appendChild(elements.tm);
    list_container.appendChild(elements.line);
  }
  if(SET_TAB === 1){
    if(quest_details.isFavorite){
      var elements = addElementToDiv(quest_details);
      fav_quest.appendChild(elements.qt_div);
      fav_quest.appendChild(elements.dt);
      fav_quest.appendChild(elements.tm);
      fav_quest.appendChild(elements.line);
      }
  }
  if(SET_TAB === 2){
    if(quest_details.isResolved){
      var elements = addElementToDiv(quest_details);
      resolved_quest.appendChild(elements.qt_div);
      resolved_quest.appendChild(elements.dt);
      resolved_quest.appendChild(elements.tm);
      resolved_quest.appendChild(elements.line);
      }
  }
  
}

function addElementToDiv(quest_details){
  var quest_div = createQuestionDiv(quest_details);
      var reaction_div = createReactionDiv(quest_details);
      var date = addDate(quest_details);
      var time = addTime(quest_details);
      var hr = document.createElement("hr");
      quest_div.appendChild(reaction_div);
      var elements = {
        qt_div : quest_div,
        dt : date,
        tm : time,
        line : hr
      }
      return elements;
}

function filteredQuestionPane(query){
  list_container.innerHTML = "";
  var unMatched = 0;
  var ls_len = STORE_QUESTIONS.length; 
  for(var i=0; i<ls_len; i++){
    question = STORE_QUESTIONS[i];
    if(question.title.includes(query)){ 
      displayQuestions(question);
    }
    else
      unMatched+=1; 
  } 
  if(unMatched === ls_len)
    list_container.innerHTML = "No Match Found";
}

function createQuestionDiv(quest_details){
  var quest_div = document.createElement("div");
  quest_div.setAttribute("id", quest_details.id);
  quest_div.setAttribute("class", "list-item");

  var quest_title = document.createElement("h4");
  quest_title.setAttribute("class", "");
  quest_title.innerHTML = quest_details.title;

  var quest_descr = document.createElement("p");
  quest_descr.setAttribute("class", "");
  var descr_text;
  if(quest_details.description.length > 100)
      descr_text = quest_details.description.slice(0, 100) +"  <strong>...more</strong>";
  else
      descr_text = quest_details.description;
  quest_descr.innerHTML = descr_text;

  quest_div.appendChild(quest_title);
  quest_div.appendChild(quest_descr);
  quest_div.onclick = viewQuestionDetails;

  return quest_div;
}

function createReactionDiv(quest_details){

  var reaction_div =  document.createElement("div");
  reaction_div.setAttribute("class", "reaction");

  var reaction_upvote = document.createElement("p");
  reaction_upvote.setAttribute("id", "upV_id"+quest_details.id);
  reaction_upvote.setAttribute("class", "");
  reaction_upvote.innerHTML = "upvotes : " + quest_details.upVotes;

  var reaction_downvote = document.createElement("p");
  reaction_downvote.setAttribute("id", "downV_id"+quest_details.id);
  reaction_downvote.setAttribute("class", "");
  reaction_downvote.innerHTML = "downvotes : " + quest_details.downVotes;

  var reaction_response_count = reactionResponseCount(quest_details);

  var reaction_fav = reactionFav(quest_details);

  reaction_div.appendChild(reaction_upvote);
  reaction_div.appendChild(reaction_downvote);
  reaction_div.appendChild(reaction_response_count);
  reaction_div.appendChild(reaction_fav);

  return reaction_div;

}

function reactionResponseCount(quest_details){
  var reaction_response_count = document.createElement("p");
  var res_id = "resCount" + quest_details.id;
  reaction_response_count.setAttribute("id", res_id);
  reaction_response_count.setAttribute("class", "");
  reaction_response_count.innerHTML = "responses : " + quest_details.response_count;

  return reaction_response_count;
}

function reactionFav(quest_details){
  var reaction_fav = document.createElement("button");
  reaction_fav.setAttribute("class", "btns tab-btn fav-btn");
  reaction_fav.setAttribute("id", quest_details.id);
  reaction_fav.onclick = addFavQuestion;
  if(quest_details.isFavorite)
    reaction_fav.innerHTML = "Remove Fav";
  else
    reaction_fav.innerHTML = "Add Fav";

  return reaction_fav;
}

function addDate(quest_details){
  var date = document.createElement("p");
  date.setAttribute("class", "date-time");
  date.innerHTML = "created at : ";
  date.innerHTML += new Date(quest_details.createdAt).toLocaleString();

  return date;
}

function addTime(quest_details){
  var createAtNode = document.createElement("p");
  createAtNode.setAttribute("class", "date-time");
  createAtNode.innerHTML = "created: "+updateAndConvertTime(createAtNode)(quest_details.createdAt);
  return createAtNode;
}

function updateAndConvertTime(element)
{
  return function(time)
  {
    setInterval(function()
    {
      element.innerHTML = convertDateToCreatedAtTime(time)+" ago";
    })

    return convertDateToCreatedAtTime(time);
  }
}

function convertDateToCreatedAtTime(date)
{
    var currentTime = Date.now();
    var timeLapsed = currentTime - new Date(date).getTime();

    var secondsDiff = parseInt(timeLapsed / 1000 );
    var minutesDiff = parseInt(secondsDiff / 60 );
    var hourDiff = parseInt(minutesDiff / 60 );

    return parseInt(hourDiff/24)+" days "+ hourDiff%24 +" hours "+ minutesDiff%60 +" minutes " + secondsDiff%60 +" Seconds"
 
}

function viewQuestionDetails(){
  document.getElementById("quest-form").style.display = "none";

  var show_div = document.getElementById("q-box");
  show_div.style.display = "block";
  
  var q_id = searchQuestionInLS(this.id);
  
  var quest_details = STORE_QUESTIONS[q_id];

  var title = document.getElementById("title-q");
  title.innerHTML = quest_details.title;

  var descr = document.getElementById("descr-q");
  descr.innerHTML = quest_details.description;

  upV_btn.setAttribute("id", quest_details.id);
  upV_btn.onclick = updateUpVotes;
  
  downV_btn.setAttribute("id", quest_details.id);
  downV_btn.onclick = updateDownVotes;
  voteCount.innerHTML = quest_details.upVotes - quest_details.downVotes;
  resolve_btn.setAttribute("id", quest_details.id);
  resolve_btn.onclick = questionResolved;
  if(quest_details.isResolved)
    resolve_btn.style.display = "none";
  else
    resolve_btn.style.display = "block";
  fav_btn[0].setAttribute("id", quest_details.id);
  fav_btn[0].onclick = addFavQuestion;
  if(quest_details.isFavorite === true)
    fav_btn[0].innerHTML = "Remove Fav";
  else
    fav_btn[0].innerHTML = "Add Fav";

  res_btn.setAttribute("id", quest_details.id)
  res_box.setAttribute("id", "rb-"+quest_details.id)
  appendResponses(quest_details.id);
}

function appendResponses(id){  
  res_box.innerHTML = "";
  q_id = searchQuestionInLS(id);
  var data = STORE_QUESTIONS[q_id]
  var res_len = data.response_count;
  // console.log(data);
  for(var i=0; i<res_len; i++){
    createResponseItem(STORE_QUESTIONS[q_id].responses[i],data.id);
  }
}

function createResponseItem(response_details,q_id){
  var res_hold = document.getElementById("rb-"+q_id);

  var response_holder = document.createElement("div");

  var response_content = document.createElement("p");
  response_content.innerHTML = response_details.res_descr;

  var name = document.createElement("h5");
  name.innerHTML = "-by " + response_details.name;

  var hr = document.createElement("hr");

  response_holder.appendChild(response_content);
  response_holder.appendChild(name);
  response_holder.appendChild(hr);

  res_hold.appendChild(response_holder);
}

function submitResponse(){
  var name = document.getElementById("res-inp").value;
  var res_text = document.getElementById("res-text").value;

  var getResponses = {
    name : name,
    res_descr : res_text,
    createdAt : Date.now(),
    upVotes : 0,
    downVotes : 0,
    isHelpful : false
  }
  document.getElementById("res-inp").value = '';
  document.getElementById("res-text").value = '';

  var getId = searchQuestionInLS(this.id);

  var res_arr = STORE_QUESTIONS[getId];
  res_arr.responses.push(getResponses);
  res_arr.response_count = res_arr.responses.length;

  localStorage[getId] = JSON.stringify(res_arr);
  STORE_QUESTIONS[getId] = res_arr;
  sendDataToServer();
  console.log(STORE_QUESTIONS[getId])

  var res_id = "resCount" + getId;
  document.getElementById(res_id).innerHTML = "responses : " + res_arr.response_count;

  appendResponses(getId);
}

function updateUpVotes(){
  var q_id = searchQuestionInLS(this.id);
  var quest_upV = STORE_QUESTIONS[q_id];
  quest_upV.upVotes++;
  localStorage[q_id] = JSON.stringify(quest_upV);
  STORE_QUESTIONS[q_id] = quest_upV;
  sendDataToServer();
  
  document.getElementById("upV_id"+quest_upV.id).innerHTML = "upvotes : " + quest_upV.upVotes;
  voteCount.innerHTML = quest_upV.upVotes - quest_upV.downVotes;
}
function updateDownVotes(){
  var q_id = searchQuestionInLS(this.id);
  var quest_downV = STORE_QUESTIONS[q_id];
  quest_downV.downVotes++;
  localStorage[q_id] = JSON.stringify(quest_downV);
  STORE_QUESTIONS[q_id] = quest_downV;
  sendDataToServer();

  document.getElementById("downV_id"+quest_downV.id).innerHTML = "downvotes : " + quest_downV.downVotes;
  voteCount.innerHTML = quest_downV.upVotes - quest_downV.downVotes;
}

function questionResolved(){
  var q_id = searchQuestionInLS(this.id);
  var resolve = STORE_QUESTIONS[q_id];
  resolve.isResolved = true;
  localStorage[q_id] = JSON.stringify(resolve);
  STORE_QUESTIONS[q_id] = resolve;
  sendDataToServer();
}

  
function addFavQuestion(){
  var q_id = searchQuestionInLS(this.id);
  var favorite = STORE_QUESTIONS[q_id] ;
  if(favorite.isFavorite === false){
    fav_btn.innerHTML = "Remove Fav";
    fav_btn[0].innerHTML = "Remove Fav";
    favorite.isFavorite = true;
  }
  else{
    fav_btn.innerHTML = "Add Fav";
    fav_btn[0].innerHTML = "Add Fav";
    favorite.isFavorite = false;
  }
  localStorage[q_id] = JSON.stringify(favorite);
  STORE_QUESTIONS[q_id] = favorite;
  sendDataToServer();
}

function sortedQuestions(){
  getDataFromServer(function(getQuestions)
  {
    // console.log(STORE_QUESTIONS);
    var i = STORE_QUESTIONS.length;
    do{
      STORE_QUESTIONS.push(getQuestions[i]);     
      i++;
    }while(getQuestions[i] != undefined);
    // for(var i=STORE_QUESTIONS.length; i<localStorage.length; i++){
    //   STORE_QUESTIONS.push(JSON.parse(getQuestions[i]));
    // }
    STORE_QUESTIONS = STORE_QUESTIONS.filter(function(value, index, arr){ 
        return value != undefined;
    });
    STORE_QUESTIONS = STORE_QUESTIONS.sort( compare );
    
    updateQuestionPane();
  });
}

function getDataFromServer(onResponse){
  var request = new XMLHttpRequest();
  request.addEventListener("load", function(){
    var data = JSON.parse(request.responseText);
    onResponse(JSON.parse(data.data));
  });
  
  request.open("GET", "https://storage.codequotient.com/data/get");
  request.send();
}

function compare( a, b ) {
  if ( a.upVotes < b.upVotes ){
    return 1;
  }
  if ( a.upVotes > b.upVotes ){
    return -1;
  }
  return 0;
}

function searchQuestionInLS(q_id){
  for(var i =0; i<STORE_QUESTIONS.length; i++){
    if(STORE_QUESTIONS[i].id === parseInt(q_id))
      return i;
  }
}