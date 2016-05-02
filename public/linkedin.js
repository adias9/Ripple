var inputUsername = undefined;

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

// Handle the successful return from the API call
function onSuccess(data) {
  member = data.values[0];
  inputUsername = member.firstName + " " + member.lastName;
  linkedInButton.css('display', 'none');
  logOutButton.css('visibility', 'visible');
  usersRef.orderByChild('id').equalTo(member.id).on("child_added", function(snapshot) {
    currentRep = snapshot.val().rep;
  });
  var randRep = Math.floor(Math.random() * 100);
  usersRef.push({ id: member.id, firstName: member.firstName, lastName: member.lastName, rep: randRep });
  currentRep = randRep;
}

// Handle an error response from the API call
function onError(error) {
  console.log(error);
}
