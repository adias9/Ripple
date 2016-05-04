var inputUsername = "";

function liAuth() {
  IN.User.authorize(function() {
    onLinkedInLoad();
  });
}

// Setup an event listener to make an API call once auth is complete
function onLinkedInLoad() {
  IN.Event.on(IN, "auth", getProfileData);
}

// Use the API call wrapper to request the member's basic profile data
function getProfileData() {
  IN.API.Profile("me").fields("firstName", "lastName", "id").result(onSuccess).error(onError);
}

// Decide whether it s a new user and save them
// function userExistsCallback(member, exists) {
//   if (exists) {
//     usersRef.push({ id: member.id, firstName: member.firstName, lastName: member.lastName });
//   } 
// }

// Handle the successful return from the API call
function onSuccess(data) {
//  var exists = false;

  member = data.values[0];
  inputUsername = member.firstName + " " + member.lastName;
  linkedInButton.css('display', 'none');
  logOutButton.css('visibility', 'visible');
  

  // usersRef.once("value", function(snapshot) {
  //   snapshot.forEach(function(childSnapshot) {
  //     console.log("hello");
  //     console.log(childSnapshot.val().id);
  //     exists = (childSnapshot.val().id === member.id);
  //     if (exists) {
  //       return true;
  //     }
  //   });
  // });
  
  // userExistsCallback(member, exists);   
}

// Handle an error response from the API call
function onError(error) {
  console.log(error);
}
