// Loaded by main.html
// Author: Multiple
//


//Gets params to be used by for the data base search.
// Sam A.
const urlParams = new URLSearchParams(window.location.search);
const searchCategory = urlParams.get("category");
const searchDate = urlParams.get("date");
const searchTime = urlParams.get("time");
console.log("param list: ", searchCategory , searchDate, searchTime);


var currentUser;
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        currentUser = db.collection("users").doc(user.uid);
        console.log(currentUser);
    } else {
        // No user is signed in.
        console.log("No user signed in");
        window.location.href = "login.html";
    }
});


// Primary page populator function.
// Decides what to get from database based on search parameters.
// Sam A.
function populateCardsDynamically() {
    if (searchCategory && searchDate) {
        let dateParam = makeDate();
        db.collection("events").where("category", "==", searchCategory).where("timeEnd", ">=", dateParam).get().then(allEvents => {
            fillPage(allEvents);
        });
    } else if (searchCategory) {
        db.collection("events").where("category", "==", searchCategory).get().then(allEvents => {
            fillPage(allEvents);
        });
    } else if (searchDate) {
        let dateParam = makeDate();
        db.collection("events").where("timeEnd", ">=", dateParam).get().then(allEvents => {
            fillPage(allEvents);
        });
    } else {
        db.collection("events").get().then(allEvents => {
            fillPage(allEvents);
        });
    }
}


// Secondary polulator function. Used by Primary populator.
// Creates display cards, inserts the data in them, and puts them on page.
// Sam A, Liana D, Taylor?, Michaela?
function fillPage (allEvents) {
    let eventCardTemplate = document.getElementById("eventCardTemplate");
    let eventCardGroup = document.getElementById("eventCardGroup");
    allEvents.forEach(doc => {
        // sets variables from firestore database
        var docID = doc.id;
        var eventTitle = doc.data().title; 
        var eventImgID = doc.data().imgID; 
        var timeStart = doc.data().timeStart.toDate(); 
        var timeEnd = doc.data().timeEnd.toDate(); 
        // creates a date formatter
        const longEnUSFormatter = new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric'});
        const timeFormatter = new Intl.DateTimeFormat('en-US', {hour: 'numeric', minute: 'numeric'});
           // formats date objects
        var eventDate  = longEnUSFormatter.format(timeStart);
        var eventTimeStart  = timeFormatter.format(timeStart);
        var eventTimeEnd  = timeFormatter.format(timeEnd);

        let testEventCard = eventCardTemplate.content.cloneNode(true);
        testEventCard.querySelector('.card-title').innerHTML = eventTitle;
        testEventCard.querySelector('.card-date').innerHTML = "<b>Date: </b>" + eventDate;
        testEventCard.querySelector('.card-time-start').innerHTML = "<b>Time: </b>" + eventTimeStart + " - " +eventTimeEnd;
        testEventCard.querySelector('a').href = "event.html?eventid=" + docID;
        // "i" is bookmark related.
        testEventCard.querySelector('i').id = 'save-' + docID;
        testEventCard.querySelector('i').onclick = () => saveBookmark(docID);
        testEventCard.querySelector('img').src = `./images/${eventImgID}.jpg`;
        eventCardGroup.appendChild(testEventCard);
    });
}


// Makes a date from search results to be sent to firestore.
// Sam A.
function makeDate() {
    let temp;
    if (searchTime) {
        console.log("search time Exists.")
        temp = new Date(searchDate + "T" + searchTime);
        console.log(typeof(temp), temp);
    } else {
        console.log("Only searchDate Exists.")
        temp = new Date(searchDate);
        console.log(typeof(temp), temp);
    }
    return temp;
}


// Runs when the search button is pressed.
// Creates parameters based on user selection, attaches to url and refreshes page.
// Sam A.
function findEvents() {
    let formCategory = document.getElementById("formCategoryBox").value;
    let formDate = document.getElementById("formDateBox").value;
    let formTime = document.getElementById("formTimeBox").value;
    let count = 0;

    console.log(formCategory, formDate, formTime)

    let finalURL = "main.html?";
    if (formCategory) {
        if (formCategory != "Any") {
            finalURL += "category=" + formCategory;
            count = 1;
        }
    }
    if (formDate) {
        if (count == 1) {
            finalURL += "&";
        }
        finalURL += "date=" + formDate;
        count = 1;
    }
    if (formTime) {
        if (count == 1) {
            finalURL += "&";
        }
        finalURL += "time=" + formTime;
        count = 1;
    }
    console.log(finalURL)
    window.location.href = finalURL;
}


// Setting a document id. 
function setDocData(id){
    localStorage.setItem ('docID', id);
}


// Saving event.
function saveBookmark(docID) {
    currentUser.set({
            bookmarks: firebase.firestore.FieldValue.arrayUnion(docID)
        }, {
            merge: true
        })
        .then(function () {
            console.log("bookmark has been saved for: " + currentUser);
            var iconID = 'save-' + docID;
            //console.log(iconID);
            document.getElementById(iconID).innerText = 'bookmark';
        });
}


// Gets events and populates into page.
populateCardsDynamically();

