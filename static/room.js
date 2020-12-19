const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peer = new Peer();
const peers = {};
const videos = {}
let myStream;

const myVid = document.createElement('video')
myVid.muted = true
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myStream = stream;
    addVideoStream(myVid, myStream);
});

peer.on('open', (id) => {
    socket.emit('join-room', id);
});

peer.on('call', (call) => {
    pickCall(call);
});

socket.on('user-connected', (userID) => {
    let announceDiv = document.getElementById('announcements');
    let room_enter = document.createElement('div');
    room_enter.innerText = `${userID} has joined!`
    announceDiv.appendChild(room_enter);
    callUser(userID);
});

socket.on('user-disconnected', (userID) => {
    let announceDiv = document.getElementById('announcements');
    let room_leave = document.createElement('div');
    room_enter.innerText = `${userID} has left`
    announceDiv.appendChild(room_leave);
    if (peers[userID]) {
        peers[userID].close();
    }
    if (videos[userID]) {
        videos[userID].remove();
    }
});

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    })
    peers[userId] = call;
    videos[userId] = video;
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

function pickCall(call) {
    console.log(call);
    if (myStream) {
        call.answer(myStream);
        const video = document.createElement('video')
        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
        videos[call.peer] = video;
        peers[userId] = call;
    } else {
        pickCall(call);
    }
}

function callUser(userID) {
    if (myStream) {
        connectToNewUser(userID, myStream);
    } else {
        callUser(userID);
    }
}