// Create a reference to Firebase
var channelsRef = new Firebase('https://burning-fire-8160.firebaseio.com/channels/');
var usersRef = new Firebase('https://burning-fire-8160.firebaseio.com/users/');
var messagesRef = undefined;

// Current channel
var currentChannel = undefined;

// Register DOM elements
var messageField = $('#messageInput');
var messageHeader = $('#messages-header');
var messageCol = $('#message-column');
var addChannelBtn = $('#add-channel-btn');
//var upvoteBtn = $('#upvote-btn');

var messageList = $('#example-messages');
var channelList = $('#channels');

var linkedInButton = $('#linkedin-login-btn');
var facebookButton = $('#facebook-login-btn');
var logOutButton = $('#userLogOut');

// Taking from LinkedIn
var inputUsername = inputUsername;

function addMessageCallback() {
  // Add a callback that is triggered for each chat message.
  messagesRef.on('child_added', function(snapshot) {
    // Get data
    var data = snapshot.val();
    if (data.text === undefined) return;

    var username = data.name || "Anonymous";
    var message = data.text;
    var timestamp = data.timestamp;
//    var upvotes = data.upvotes;
    var date = new Date(timestamp).toLocaleTimeString();

    // Create elements and sanitize text
    var messageElement = $("<li></li>");
    var nameElement = $("<strong class='example-chat-username'></strong>");
    var dateElement = $("<em class='message-date'></em>");
//    var numElement = $("<p id='upvote-num'></p>");
//    var upvoteElement = $("<i id='upvote-btn' class='fa fa-angle-up'></i>");
    nameElement.text(username);
    dateElement.text(date);
//    numElement.text(upvotes);
    messageElement.text(message).prepend("<br>").prepend(dateElement).prepend(nameElement);
//    messageElement.append(numElement).append(upvoteElement);

    // Add message
    messageList.append(messageElement);

    // Scroll to bottom of message list
    messageCol.scrollTop(messageCol[0].scrollHeight);
  });
}

// Listen for keypress event
messageField.keypress(function(e) {
  if (e.keyCode == 13) {
    // Field values
    var username = inputUsername;
    var message = messageField.val();

    // Save data to Firebase and empty field
    if (message !== '') {
      messagesRef.push({ name: username, text: message, timestamp: Firebase.ServerValue.TIMESTAMP }); //, upvotes: 0
      messageField.val('');
    }
  }
});

// Add a callback that is triggered for each channel.
channelsRef.on('child_added', function(snapshot) {
  // Get data
  var data = snapshot.val();
  var channelName = data.channelName;
  var selected = false;

  if (currentChannel === undefined) {
    currentChannel = "~ " + channelName;
    messageHeader.text(currentChannel);
    messagesRef = snapshot.ref();
    addMessageCallback();
    selected = true;
  }

  // Create element and sanitize text
  var channelElement = $("<li class='channel-li'>");
  channelElement.text("~ " + channelName);
  if (selected) channelElement.addClass('selected');

  // Add message
  channelList.append(channelElement);
});

// Event listener for handling adding channels
addChannelBtn.click(function() {
  swal({
    html: '<h3>Enter a stream name:</h3>',
    input: 'text',
    showCancelButton: true,
    inputValidator: function(value) {
      return new Promise(function(resolve, reject) {
        if (value) {
          if (value.length < 20) {
            resolve();
          } else {
            reject('The name can\'t be longer than 20 characters.');
          }
        } else {
          reject('The stream name cannot be blank.');
        }
      });
    }
  }).then(function(result) {
    if (result) {
      swal({
        type: 'success',
        html: 'You have successfully created the stream!',
        timer: 1000
      });
      // Add a new channel and switch to it
      messagesRef = channelsRef.push({ channelName: result });
      currentChannel = "~ " + result;
      messageHeader.text(currentChannel);
      messageList.empty();
      addMessageCallback();
    }
  });
});

// Add event listeners to each channel button
channelList.delegate('li', 'click', function() {

  // Change color of selected channel
  $('.channel-li').each(function() {
    $(this).removeClass('selected');
  });
  $(this).addClass('selected');

  // Set current channel, empty message list
  currentChannel = $(this).text();
  messageHeader.text(currentChannel);
  messageList.empty();

  // Load up the messages corresponding to the channel that was clicked
  channelsRef.orderByChild('channelName').equalTo(currentChannel.substring(2)).on("child_added", function(snapshot) {
    messagesRef = snapshot.ref();
    messagesRef.off("child_added");
    addMessageCallback();
  });
});

logOutButton.click(function() {
  FB.logout(function(response) {});
  //IN.User.logout();
  logOutButton.css('visibility', 'hidden');
  facebookButton.css('display', 'inline');
  //linkedInButton.css('display', 'inline');
  inputUsername = "";
  swal({
    type: 'success',
    html: 'You have successfully logged out!',
    timer: 1000
  });
});
