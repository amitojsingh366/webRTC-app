const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peer = new Peer();
const peers = {};
let myStream;

peer.on('open', (id) => {
    socket.emit('join-room', id);
});

peer.on('call', (call) => {
    if (myStream) {
        call.answer(myStream);
        const video = document.createElement('video')
        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream)
        })
    }
});

socket.on('user-connected', (userID) => {
    let announceDiv = document.getElementById('announcements');
    let room_enter = document.createElement('div');
    room_enter.innerText = `${userID} has joined!`
    announceDiv.appendChild(room_enter);
    if (myStream) {
        connectToNewUser(userId, myStream);
    }
});

socket.on('user-disconnected', (userID) => {
    let announceDiv = document.getElementById('announcements');
    let room_leave = document.createElement('div');
    room_enter.innerText = `${userID} has left`
    announceDiv.appendChild(room_leave);
    if (peers[userID]) {
        peers[userID].close();
    }
});

const myVid = document.createElement('video')
myVid.muted = true
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myStream = stream;
    addVideoStream(myVid, myStream);
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}