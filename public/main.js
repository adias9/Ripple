// Create a reference to Firebase
var channelsRef = new Firebase('https://burning-fire-8160.firebaseio.com/channels/');
var messagesRef = undefined;

// Current channel
var currentChannel = undefined;

// Register DOM elements
var messageField = $('#messageInput');
var nameField = $('#nameInput');
var messageHeader = $('#messages-header');
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
    currentChannel = "# " + channelName;
    messageHeader.text(currentChannel);
    messagesRef = snapshot.ref();
    addMessageCallback();
  }

  // Create element and sanitize text
  var channelElement = $("<li class='channel-li'>");
  channelElement.text("# " + channelName);

  // Add message
  channelList.append(channelElement);
});

// Event listener for handling adding channels
addChannelBtn.click(function() {
  swal({
    title: 'Enter a stream name:',
    input: 'text',
    showCancelButton: true,
    inputValidator: function(value) {
      return new Promise(function(resolve, reject) {
        if (value) {
          resolve();
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
      currentChannel = "# " + result;
      messageHeader.text(currentChannel);
      messageList.empty();
      addMessageCallback();
    }
  });
});

// Add event listeners to each channel button
channelList.delegate('li', 'click', function() {
  currentChannel = $(this).text(); // chop off the # in the beginning
  messageHeader.text(currentChannel);
  messageList.empty();
  // Load up the messages corresponding to the channel that was clicked
  channelsRef.orderByChild('channelName').equalTo(currentChannel.substring(2)).on("child_added", function(snapshot) {
    messagesRef = snapshot.ref();
    messagesRef.off("child_added");
    addMessageCallback();
  });
});
