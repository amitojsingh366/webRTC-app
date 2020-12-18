const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peer = new Peer();
const myVid = document.createElement('video')
myVid.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVid, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

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

peer.on('open', id => {
    socket.emit('join-room', roomID, id)
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}