// Create a reference to Firebase
var channelsRef = new Firebase('https://burning-fire-8160.firebaseio.com/');
var messagesRef = undefined;

// Current channel
var currentChannel = undefined;

// Register DOM elements
var messageField = $('#messageInput');
var nameField = $('#nameInput');
var messageCol = $('#message-column');
var addChannelBtn = $('#add-channel-btn');

var messageList = $('#example-messages');
var channelList = $('#channels');

function addMessageCallback() {
  // Add a callback that is triggered for each chat message.
  messagesRef.on('child_added', function(snapshot) {
    // Get data
    var data = snapshot.val();
    if (data.text === undefined) return;

    var username = data.name || "Anonymous";
    var message = data.text;

    // Create elements and sanitize text
    var messageElement = $("<li>");
    var nameElement = $("<strong class='example-chat-username'></strong>");
    nameElement.text(username);
    messageElement.text(message).prepend(nameElement);

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
    var username = nameField.val();
    var message = messageField.val();

    // Save data to Firebase and empty field
    if (message !== '') {
      messagesRef.push({ name: username, text: message });
      messageField.val('');
    }
  }
});

// Add a callback that is triggered for each channel.
channelsRef.on('child_added', function(snapshot) {
  // Get data
  var data = snapshot.val();
  var channelName = data.channelName;

  if (currentChannel === undefined) {
    currentChannel = channelName;
    messagesRef = snapshot.ref();
    addMessageCallback();
  }

  // Create element and sanitize text
  var channelElement = $("<li class='channel-li'>");
  channelElement.text(channelName);

  // Add message
  channelList.append(channelElement);
});

addChannelBtn.click(function() {
  swal({
    title: 'Enter a channel name:',
    input: 'text',
    showCancelButton: true,
    inputValidator: function(value) {
      return new Promise(function(resolve, reject) {
        if (value) {
          resolve();
        } else {
          reject('The channel name cannot be blank.');
        }
      });
    }
  }).then(function(result) {
    if (result) {
      swal({
        type: 'success',
        html: 'You have successfully created the channel!',
        timer: 1000
      });
      messagesRef = channelsRef.push({ channelName: result });
      messageList.empty();
      addMessageCallback();
    }
  });
});

channelList.delegate('li', 'click', function() {
  currentChannel = $(this).text();
  messageList.empty();
  channelsRef.orderByChild('channelName').equalTo(currentChannel).on("child_added", function(snapshot) {
    messagesRef = snapshot.ref();
    messagesRef.off("child_added");
    addMessageCallback();
  });
});
