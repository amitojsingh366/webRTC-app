const socket = io('/');
let vidGrid = document.getElementById('video-grid');
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

let myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVidStream(myVideo, stream);

    peer.on('call', (call) => {
        call.answer(stream);
        const vid = document.createElement('video');
        call.on('stream', returnStream => {
            addVidStream(vid, returnStream);
        });
        call.on('close', () => {
            vid.remove();
        })
    })

    socket.on('user-connected', user_ID => {
        connectToUser(user_ID, stream);
    });
});

peer.on('open', (id) => {
    socket.emit('join-room', roomID, id);
});



socket.on('user-connected', (userID) => {
    let announceDiv = document.getElementById('announcements');
    let room_enter = document.createElement('div');
    room_enter.innerText = `${userID} has joined the room!`
    announceDiv.appendChild(room_enter);
});

socket.on('user-disconnected', (userID) => {
    let announceDiv = document.getElementById('announcements');
    let room_leave = document.createElement('div');
    room_enter.innerText = `${userID} has left the room`
    announceDiv.appendChild(room_leave);
    if (peers[userID]) {
        peers[userID].close();
    }
})

function connectToUser(userID, stream) {
    const vid = document.createElement('video');
    const call = peer.call(userID, stream);
    call.on('stream', returnStream => {
        addVidStream(vid, returnStream);
    });
    call.on('close', () => {
        vid.remove();
    });
    peers[userID] = call;
}

function addVidStream(vid, stream) {
    vid.srcObject = stream;
    vid.addEventListener('loadedmetadata', () => {
        vid.play();
    })
    vidGrid.appendChild(vid);
}