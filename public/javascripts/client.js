$(window).resize(function () {
    let height = ($(window).height() - 255);
    if ($('.video-screen-share').length > 0) {
        $('.video-screen-share').css('height', `${height}px`)
    }
});
const socket = io(domain);

socket.on("connect", () => {
    socket.emit('login', userId, meetingId, userName);
    setTimeout(function(){
        socket.emit("timeout");
    },(1000 * 60 * 5))
});
socket.on("dis", () => {
    hangup()
});
socket.on("newUser", (user) => {
    roomUsers[user] = {
        pc: "",
        name: "",
        stream: null,
        shareStream: null
    };
    makeCall(user, true);

    if (screenShareStream != null) {
        setTimeout(async function () {
            if (screenShareStream) {
                roomUsers[user].pc.removeStream(screenShareStream);
            }
            for (const track of screenShareStream.getVideoTracks()) {
                roomUsers[user].pc.addTrack(track, screenShareStream);
            }
            const offer = await roomUsers[user].pc.createOffer();
            await roomUsers[user].pc.setLocalDescription(offer);
            socket.emit('offer', user, offer);
        }, 2000);
    }
})

socket.on("existingUser", (users) => {
    for (user in users) {
        if (user !== userId) {
            roomUsers[user] = {
                pc: "",
                name: "",
                stream: null,
                shareStream: null
            };
        }
    }
    playVideoFromCamera(userId)
});

async function playVideoFromCamera(user) {
    try {
        const constraints = { 'video': true, 'audio': true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStream = stream;
        const videoElement = document.querySelector(`video#local${user}`);
        videoElement.srcObject = stream;
        for (to in roomUsers) {
            makeCall(to);
        }
    } catch (error) {
        console.error('Error opening video camera.', error);
    }
}

async function makeCall(user, isNew = false) {
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
    roomUsers[user].pc = new RTCPeerConnection(configuration);
    roomUsers[user].pc.addEventListener('icecandidate', event => {
        if (event.candidate) {
            socket.emit('ice', user, event.candidate);
        }
    });
    roomUsers[user].pc.addEventListener('track', async (event) => {
        if (event.track.kind == "video") {
            const [remoteStream] = event.streams;
            if (roomUsers[user].stream == null) {
                roomUsers[user].stream = remoteStream;
                updateVideo(user);
            } else {
                roomUsers[user].shareStream = remoteStream;
                updateVideo(user);
            }
        }
    });
    roomUsers[user].pc.addEventListener('removetrack', async (event) => {

    })
    roomUsers[user].pc.addEventListener('removestream', async (event) => {

    })
    roomUsers[user].pc.addEventListener('connectionstatechange', event => {
        if (roomUsers[user].pc.connectionState === 'connected') {

        }
    });
    localStream.getTracks().forEach(track => {
        roomUsers[user].pc.addTrack(track, localStream);
    });

    if (!isNew) {
        const offer = await roomUsers[user].pc.createOffer();
        await roomUsers[user].pc.setLocalDescription(offer);
        socket.emit('offer', user, offer);
    }
}

socket.on('offer', async function (from, data, displayName) {
    try {
        if (screenShareStream != null) {
            screenShareStream.getTracks().forEach(track => {
                roomUsers[from].pc.addTrack(track, screenShareStream);
            })
        }
        roomUsers[from].name = displayName;
        roomUsers[from].pc.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await roomUsers[from].pc.createAnswer();
        await roomUsers[from].pc.setLocalDescription(answer);
        socket.emit('answer', from, answer);
    } catch (error) {
        console.log("Error while receive offer ", error)
    }
})

socket.on('answer', async function (from, data, displayName) {
    try {
        roomUsers[from].name = displayName;
        await roomUsers[from].pc.setRemoteDescription(new RTCSessionDescription(data));
    } catch (error) {
        console.log("Error while receive answer ", error)
    }
});

socket.on('ice', async function (from, data) {
    try {
        await roomUsers[from].pc.addIceCandidate(data);
    } catch (e) {
        console.error('Error adding received ice candidate', e);
    }
})

socket.on('bye', function (from) {
    if (roomUsers[from]) {
        delete roomUsers[from];
        $(`#remote${from}`).parent().remove();
    }
});

socket.on("screenStop", function (by) {
    roomUsers[by].shareStream = null;
    $('#screenShareContent').html("");
    $('.videoSection').removeClass('col-lg-2').addClass('col-lg-4');
})
//start stream

function updateVideo(user) {
    if ($(`#remote${user}`).length == 0) {
        let html = `<div class="col-lg-4 videoSection"><div>Name: ${roomUsers[user].name}</div><video id="remote${user}" width="100%" class="remote-video-layout" autoplay="true" playsinline allowfullscreen showonhover></video></div>`
        $('#videoContent').append(html);
    }
    if (roomUsers[user].stream != null) {
        const videoTag = document.getElementById("remote" + user);
        videoTag.srcObject = roomUsers[user].stream;
    }
    if (roomUsers[user].shareStream != null) {
        if ($(`#share${user}`).length == 0) {
            let height = ($(window).height() - 255)
            $('.videoSection').removeClass('col-lg-4').addClass('col-lg-2')
            let html = `<div class="col-lg-12"><div>Name: Screen Share by ${roomUsers[user].name}</div><video id="share${user}" width="100%" style="height:${height}px;" class="video-screen-share" autoplay="true" playsinline allowfullscreen showonhover></video></div>`
            $('#screenShareContent').append(html);
            const shareTag = document.getElementById("share" + user);
            shareTag.srcObject = roomUsers[user].shareStream;
        }
    }
}


$("#mute-button").on("click", function () {
    if ($(this).data('mute') == "mute") {
        localStream.getAudioTracks()[0].enabled = false
        $("#mute-button").data('mute', 'unmute')
        $("#mute-button").html('<i class="fa-solid fa-microphone-slash"></i>')
    } else {
        localStream.getAudioTracks()[0].enabled = true
        $("#mute-button").text("Mute")
        $("#mute-button").data('mute', 'mute')
        $("#mute-button").html('<i class="fa-solid fa-microphone"></i>')
    }
});


$("#stop-video-button").on("click", function () {
    if ($(this).data('mute') == "mute") {
        localStream.getVideoTracks()[0].enabled = false
        $("#stop-video-button").data('mute', 'unmute')
        $("#stop-video-button").html('<i class="fa-solid fa-video-slash"></i>')
    } else {
        localStream.getVideoTracks()[0].enabled = true
        $("#stop-video-button").text("Mute")
        $("#stop-video-button").data('mute', 'mute')
        $("#stop-video-button").html('<i class="fa-solid fa-video"></i>')
    }
});

async function captureScreen() {
    let mediaStream = null;

    try {
        if ($("#screen-share-button").data('share') == "start") {
            $("#screen-share-button").data('share', "stop");
            /**
             * We are setting audio: false here because we don't want desktop audio,
             * we want audio from user's microphone
             * */
            mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                    displaySurface: "monitor",
                    logicalSurface: false
                },
                audio: false
            });
            mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
                socket.emit('screenStop', userId);
                screenShareStream = null;
                $("#screen-share-button").data('share', "start");
                $("#screen-share-button").html('<i class="fa-solid fa-display"></i>');
            });
            onMediaSuccessShare(mediaStream);
        } else {
            screenShareStream.getTracks()[0].stop()
            socket.emit('screenStop', userId);
            screenShareStream = null;
            $("#screen-share-button").data('share', "start");
            $("#screen-share-button").html('<i class="fa-solid fa-display"></i>');
        }
    } catch (ex) {
        console.log(ex);
    }
}


async function onMediaSuccessShare(stream) {
    let screenStream = screenShareStream;
    screenShareStream = stream;

    for (let user in roomUsers) {
        if (screenStream) {
            roomUsers[user].pc.removeStream(screenStream);
        }
        for (const track of screenShareStream.getVideoTracks()) {
            roomUsers[user].pc.addTrack(track, screenShareStream);
        }
        const offer = await roomUsers[user].pc.createOffer();
        await roomUsers[user].pc.setLocalDescription(offer);
        socket.emit('offer', user, offer);
    }
    $("#screen-share-button").html('<i class="fa-solid fa-circle-stop"></i>');
}

function hangup() {
    localStream.getTracks().forEach(track => track.stop());
    window.location.href = "/"
}

function copyLink() {
    // Get the text field
    var copyText = document.getElementById("linkData");

    // Select the text field
    copyText.select();

    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);
    $(".copy-link").css("background", "#86f3d0");
    $(".copy-link").html('<i class="fa-solid fa-check"></i>');
    setTimeout(function () {
        $(".copy-link").css("background", "#13af7d");
        $(".copy-link").html('<i class="fa-solid fa-copy"></i>');
    }, 400)
}